import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSession, verifyToken, canUserExport, AuthUser, UserRole } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const sessionUser = await getSession();
  if (sessionUser) return sessionUser;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (payload) {
      const { rows } = await pool.query(
        'SELECT id, username, name, role, kode_wilayah FROM users WHERE id = $1 LIMIT 1',
        [payload.userId]
      );
      const u = rows[0];
      if (u) {
        return {
          id: u.id,
          username: u.username,
          name: u.name,
          role: u.role as UserRole,
          kodeWilayah: u.kode_wilayah,
        };
      }
    }
  }
  return null;
}

interface FilterParams {
  cleanKec: string | null;
  cleanDesa: string | null;
  cleanBlok: string | null;
}

function buildWhereClause(table: string, filters: FilterParams, paramOffset: number = 1) {
  const { cleanKec, cleanDesa, cleanBlok } = filters;
  const conditions: string[] = [];
  const params: any[] = [];
  let cur = paramOffset;

  const codeCol = table === 'desas' ? 'd_kd_kel' : table === 'bloks' ? 'd_blok' : 'd_nop';

  if (table === 'desas') {
    if (cleanDesa) {
      conditions.push(`REPLACE(${codeCol}, '.', '') = $${cur}`);
      params.push(cleanDesa);
      cur++;
    } else if (cleanKec) {
      conditions.push(`REPLACE(${codeCol}, '.', '') LIKE $${cur}`);
      params.push(`${cleanKec}%`);
      cur++;
    }
  } else {
    // nops, bloks, bangunans
    if (cleanDesa && cleanBlok) {
      conditions.push(`REPLACE(${codeCol}, '.', '') LIKE $${cur}`);
      params.push(`${cleanDesa}%`);
      cur++;
      conditions.push(`SUBSTRING(REPLACE(${codeCol}, '.', ''), 11, 3) = $${cur}`);
      params.push(cleanBlok);
      cur++;
    } else if (cleanDesa) {
      conditions.push(`REPLACE(${codeCol}, '.', '') LIKE $${cur}`);
      params.push(`${cleanDesa}%`);
      cur++;
    } else if (cleanKec) {
      conditions.push(`REPLACE(${codeCol}, '.', '') LIKE $${cur}`);
      params.push(`${cleanKec}%`);
      cur++;
    }
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, params };
}

async function fetchLayerGeoJSON(lyr: string, filters: FilterParams, collectionName: string) {
  const { whereSql, params } = buildWhereClause(lyr, filters, 2);
  let selectCols = '';
  if (lyr === 'desas') {
    selectCols = 'id, d_kd_kel, d_nm_kel, geom';
  } else if (lyr === 'bloks') {
    selectCols = 'id, d_blok, geom';
  } else if (lyr === 'nops') {
    selectCols = 'id, d_nop, d_luas, geom';
  } else if (lyr === 'bangunans') {
    selectCols = 'id, d_nop, geom';
  }

  const q = `
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'name', $1::text,
      'features', COALESCE(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
    ) as geojson
    FROM (
      SELECT ${selectCols} FROM ${lyr}
      ${whereSql}
    ) as t
  `;
  const res = await pool.query(q, [collectionName, ...params]);
  return res.rows[0]?.geojson || { type: 'FeatureCollection', features: [] };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Autentikasi diperlukan' },
        { status: 401 }
      );
    }

    if (!canUserExport(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak. Fitur ekspor hanya untuk Admin, Bapenda, dan BPN.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const layer = searchParams.get('layer') || 'nops'; // 'desas' | 'nops' | 'bloks' | 'bangunans' | 'all'
    const format = (searchParams.get('format') || 'geojson').toLowerCase(); // 'geojson' | 'shp'
    const action = searchParams.get('action') || 'download'; // 'count' | 'download'
    const kecamatan = searchParams.get('kecamatan');
    const desa = searchParams.get('desa');
    const blok = searchParams.get('blok');

    const cleanKec = kecamatan ? kecamatan.replace(/[^0-9]/g, '') : null;
    const cleanDesa = desa ? desa.replace(/[^0-9]/g, '') : null;
    const cleanBlok = blok ? blok.trim() : null;

    const filters: FilterParams = { cleanKec, cleanDesa, cleanBlok };

    const validLayers = ['desas', 'nops', 'bloks', 'bangunans', 'all'];
    if (!validLayers.includes(layer)) {
      return NextResponse.json(
        { success: false, message: `Layer "${layer}" tidak valid.` },
        { status: 400 }
      );
    }

    // --- Action: COUNT (Live count preview for modal) ---
    if (action === 'count') {
      const counts: Record<string, number> = {};
      const targetLayers = layer === 'all' ? ['desas', 'bloks', 'nops', 'bangunans'] : [layer];

      let total = 0;
      for (const lyr of targetLayers) {
        const { whereSql, params } = buildWhereClause(lyr, filters);
        const q = `SELECT COUNT(*)::int as count FROM ${lyr} ${whereSql}`;
        const res = await pool.query(q, params);
        const cnt = res.rows[0]?.count || 0;
        counts[lyr] = cnt;
        total += cnt;
      }

      return NextResponse.json({
        success: true,
        layer,
        count: total,
        breakdown: counts,
      });
    }

    // --- Action: DOWNLOAD ---
    const timestamp = new Date().toISOString().slice(0, 10);
    const filterSuffix = cleanBlok
      ? `_blok-${cleanBlok}`
      : cleanDesa
      ? `_desa-${cleanDesa}`
      : cleanKec
      ? `_kec-${cleanKec}`
      : '_semua-wilayah';

    // 1. Format: GEOJSON
    if (format === 'geojson') {
      if (layer === 'all') {
        const allFeatures: any[] = [];
        const layersToFetch = ['desas', 'bloks', 'nops', 'bangunans'];

        for (const lyr of layersToFetch) {
          const { whereSql, params } = buildWhereClause(lyr, filters);
          let selectCols = '';
          if (lyr === 'desas') {
            selectCols = `'layer', 'desas', 'id', id, 'd_kd_kel', d_kd_kel, 'd_nm_kel', d_nm_kel`;
          } else if (lyr === 'bloks') {
            selectCols = `'layer', 'bloks', 'id', id, 'd_blok', d_blok`;
          } else if (lyr === 'nops') {
            selectCols = `'layer', 'nops', 'id', id, 'd_nop', d_nop, 'd_luas', d_luas`;
          } else if (lyr === 'bangunans') {
            selectCols = `'layer', 'bangunans', 'id', id, 'd_nop', d_nop`;
          }

          const q = `
            SELECT json_agg(
              json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(geom)::json,
                'properties', json_build_object(${selectCols})
              )
            ) as features
            FROM ${lyr}
            ${whereSql}
          `;
          const res = await pool.query(q, params);
          if (res.rows[0]?.features) {
            allFeatures.push(...res.rows[0].features);
          }
        }

        const geojson = {
          type: 'FeatureCollection',
          name: `smartmap_export_all${filterSuffix}`,
          features: allFeatures,
        };

        return new NextResponse(JSON.stringify(geojson, null, 2), {
          headers: {
            'Content-Type': 'application/geo+json; charset=utf-8',
            'Content-Disposition': `attachment; filename="smartmap_all${filterSuffix}_${timestamp}.geojson"`,
          },
        });
      } else {
        const geojson = await fetchLayerGeoJSON(layer, filters, `smartmap_${layer}${filterSuffix}`);

        return new NextResponse(JSON.stringify(geojson, null, 2), {
          headers: {
            'Content-Type': 'application/geo+json; charset=utf-8',
            'Content-Disposition': `attachment; filename="smartmap_${layer}${filterSuffix}_${timestamp}.geojson"`,
          },
        });
      }
    }

    // 2. Format: SHAPEFILE (.zip)
    if (format === 'shp') {
      const tmpDir = fs.mkdtempSync(path.join('/tmp', 'smartmap-shp-'));
      try {
        const layersToProcess = layer === 'all' ? ['desas', 'bloks', 'nops', 'bangunans'] : [layer];
        let totalExported = 0;

        for (const lyr of layersToProcess) {
          const geojson = await fetchLayerGeoJSON(lyr, filters, `smartmap_${lyr}${filterSuffix}`);
          if (geojson.features && geojson.features.length > 0) {
            const geojsonFile = path.join(tmpDir, `${lyr}.geojson`);
            const shpFile = path.join(tmpDir, `${lyr}.shp`);
            fs.writeFileSync(geojsonFile, JSON.stringify(geojson));

            // Convert GeoJSON to ESRI Shapefile using ogr2ogr
            execSync(
              `ogr2ogr -f "ESRI Shapefile" -nlt PROMOTE_TO_MULTI -lco ENCODING=UTF-8 "${shpFile}" "${geojsonFile}"`
            );
            totalExported += geojson.features.length;
          }
        }

        if (totalExported === 0) {
          return NextResponse.json(
            { success: false, message: 'Tidak ada data untuk diekspor pada filter yang dipilih.' },
            { status: 400 }
          );
        }

        const zipFile = path.join(tmpDir, 'export.zip');
        // Zip all shapefile related components (.shp, .shx, .dbf, .prj, .cpg)
        execSync(
          `zip -j "${zipFile}" "${tmpDir}"/*.shp "${tmpDir}"/*.shx "${tmpDir}"/*.dbf "${tmpDir}"/*.prj "${tmpDir}"/*.cpg`
        );

        const zipBuffer = fs.readFileSync(zipFile);
        const filename = `smartmap_${layer}${filterSuffix}_${timestamp}_shp.zip`;

        return new NextResponse(zipBuffer, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      } finally {
        try {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch (e) {
          console.warn('Failed to clean up tmpDir:', e);
        }
      }
    }

    return NextResponse.json(
      { success: false, message: `Format "${format}" tidak didukung. Gunakan geojson atau shp.` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Export layer error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengekspor layer',
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
