import { pool } from './db';

// ─── Schema ─────────────────────────────────────────────────────────────────
// desas:     id, d_kd_kel, d_nm_kel, geom (4326)
// bloks:     id, d_blok, geom (4326)
// nops:      id, d_nop, d_luas(varchar), geom (4326)
// bangunans: id, d_nop, geom (4326)
//
// IMPORTANT: ST_TileEnvelope returns 3857, data is stored in 4326.
// Solution:
//   - WHERE: use ST_Transform(ST_TileEnvelope(...), 4326) to compare with stored geom
//   - ST_AsMVTGeom: ST_Transform(geom, 3857) to convert to web mercator

// ─── Attribute columns (no geom) ────────────────────────────────────────────

const LAYER_COLUMNS: Record<string, string> = {
  desas:     'id, d_kd_kel, d_nm_kel',
  bloks:     'id, d_blok',
  nops:      'id, d_nop, d_luas',
  bangunans: 'id, d_nop',
};

const LAYER_COLUMNS_ALIASED: Record<string, string> = {
  bloks:     'b.id, b.d_blok',
  nops:      'n.id, n.d_nop, n.d_luas',
  bangunans: 'bu.id, bu.d_nop',
};

// ─── FROM clauses ────────────────────────────────────────────────────────────
// Use ST_Transform(ST_TileEnvelope(...), 4326) so we can compare with geom(4326)

const BASE_FROM: Record<string, string> = {
  desas:     `desas WHERE geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)`,
  bloks:     `bloks WHERE geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)`,
  nops:      `nops  WHERE geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)`,
  bangunans: `bangunans WHERE geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)`,
};

const DESA_FROM: Record<string, string> = {
  bloks: `bloks b
    WHERE b.geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)
      AND left(b.d_blok, 10) = $4`,
  nops: `nops n
    WHERE n.geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)
      AND left(n.d_nop, 10) = $4`,
  bangunans: `bangunans bu
    WHERE bu.geom && ST_Transform(ST_TileEnvelope($1,$2,$3), 4326)
      AND left(bu.d_nop, 10) = $4`,
};

const DESA_FILTERED_LAYERS = ['nops', 'bloks', 'bangunans'];

// ─── Main ────────────────────────────────────────────────────────────────────

export async function getMvtTile(
  layer: string,
  z: number,
  x: number,
  y: number,
  desaCode?: string
): Promise<Buffer> {
  // kecamatans has no geom column
  if (layer === 'kecamatans') return Buffer.alloc(0);

  const useDesaFilter = DESA_FILTERED_LAYERS.includes(layer) && !!desaCode;

  const cols        = useDesaFilter
    ? (LAYER_COLUMNS_ALIASED[layer] ?? LAYER_COLUMNS[layer])
    : LAYER_COLUMNS[layer];
  const geomAlias   = useDesaFilter ? getGeomAlias(layer) : null;
  const geomExpr    = geomAlias ? `${geomAlias}.geom` : 'geom';
  const fromClause  = useDesaFilter ? DESA_FROM[layer] : BASE_FROM[layer];

  if (!cols || !fromClause) throw new Error(`Unknown layer: ${layer}`);

  // ST_AsMVTGeom requires geom in 3857 (Web Mercator)
  const mvtGeomExpr = `ST_AsMVTGeom(ST_Transform(${geomExpr}, 3857), ST_TileEnvelope($1,$2,$3), 4096, 256, true)`;

  let mvtQuery: string;
  let params: (number | string)[];

  if (useDesaFilter) {
    // $1=z, $2=x, $3=y, $4=desaCode, $5=layerName
    mvtQuery = `
      SELECT ST_AsMVT(q, $5, 4096, 'geom') AS mvt
      FROM (
        SELECT ${cols}, ${mvtGeomExpr} AS geom
        FROM ${fromClause}
      ) q
    `;
    params = [z, x, y, desaCode!, layer];
  } else {
    // $1=z, $2=x, $3=y, $4=layerName
    mvtQuery = `
      SELECT ST_AsMVT(q, $4, 4096, 'geom') AS mvt
      FROM (
        SELECT ${cols}, ${mvtGeomExpr} AS geom
        FROM ${fromClause}
      ) q
    `;
    params = [z, x, y, layer];
  }

  const client = await pool.connect();
  try {
    const result = await client.query(mvtQuery, params);
    const mvt = result.rows[0]?.mvt;
    if (!mvt) return Buffer.alloc(0);

    // Return raw MVT bytes — do NOT gzip here.
    // The browser auto-decompresses Content-Encoding:gzip which would
    // conflict and corrupt the protobuf data.
    return Buffer.from(mvt);
  } finally {
    client.release();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGeomAlias(layer: string): string {
  switch (layer) {
    case 'bloks':     return 'b';
    case 'nops':      return 'n';
    case 'bangunans': return 'bu';
    default:          return layer;
  }
}
