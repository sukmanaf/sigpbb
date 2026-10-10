
// Color palette for jenis tanah categories
// Using distinct PRIMARY colors that are easily distinguishable
export const jenisTanahColors: Record<string, string> = {
    'TANAH + BANGUNAN': '#FF0000',       // RED (merah)
    'KAVLING SIAP BANGUN': '#0000FF',    // BLUE (biru)
    'TANAH KOSONG': '#FFFF00',           // YELLOW (kuning)
    'FASILITAS UMUM': '#FF00FF',         // MAGENTA (pink)
    'PERSAWAHAN / PERTANIAN': '#008000', // GREEN (hijau tua)
    'PERUMAHAN': '#FFA500',              // ORANGE (oranye)
    'PERKANTORAN': '#00FFFF',            // CYAN (biru muda)
    'INDUSTRI': '#800080',               // PURPLE (ungu)
    'PERDAGANGAN': '#FFD700',            // GOLD (emas)
    'default': '#FFFFFF',                // WHITE (putih)
};

// Color palette for jenis bangunan categories
// Using distinct PRIMARY colors that are easily distinguishable
export const jenisBangunanColors: Record<string, string> = {
    'PERUMAHAN': '#FF0000',             // RED (merah murni)
    'PERKANTORAN': '#0000FF',           // BLUE (biru murni)
    'PERKANTORAN SWASTA': '#000080',    // NAVY (biru tua)
    'PABRIK': '#800000',                // MAROON (merah tua)
    'TOKO/APOTEK/PASAR/RUKO': '#FFFF00', // YELLOW (kuning murni)
    'TOKO/APOTIK/PASAR/RUKO': '#FFFF00', // YELLOW (kuning murni)
    'RUMAH SAKIT/KLINIK': '#FF00FF',    // MAGENTA (pink terang)
    'OLAH RAGA/REKREASI': '#800080',    // PURPLE (ungu)
    'HOTEL/RESTORAN/WISMA': '#FFA500',  // ORANGE (oranye)
    'BENGKEL/GUDANG/PERTANIAN': '#008000', // GREEN (hijau tua)
    'GEDUNG PEMERINTAH': '#00FFFF',     // CYAN (biru muda)
    'LAIN-LAIN': '#FFD700',             // GOLD (emas)
    'BANGUNAN TIDAK KENA PAJAK': '#FF69B4', // HOT PINK 
    'BANGUNAN PARKIR': '#4B0082',       // INDIGO (ungu tua)
    'APARTEMEN/KONDOMINIUM': '#00FF00', // LIME (hijau terang)
    'POMPA BENSIN': '#DC143C',          // CRIMSON (merah gelap)
    'TANGKI MINYAK': '#8B4513',         // SADDLE BROWN (coklat)
    'GEDUNG SEKOLAH': '#1E90FF',        // DODGER BLUE
    'GEDUNG PERGURUAN TINGGI': '#9400D3', // DARK VIOLET
    'default': '#FFFFFF',               // WHITE (putih)
};

// 100 unique, maximally distinct colors for dynamic coloring
// Each color has different hue - no similar colors included
// Shuffled so adjacent colors have maximum visual contrast
export const UNIQUE_COLOR_PALETTE: string[] = [
    // Row 1: Red, Cyan, Brown, Lime, Magenta, Navy
    '#FF0000', '#00CED1', '#8B4513', '#32CD32', '#FF00FF', '#000080',
    // Row 2: Gold, Purple, Teal, Orange, Pink, Olive
    '#FFD700', '#800080', '#008080', '#FF8C00', '#FF1493', '#808000',
    // Row 3: Aqua, Maroon, Chartreuse, Indigo, Coral, DarkCyan
    '#00FFFF', '#800000', '#7FFF00', '#4B0082', '#FF7F50', '#008B8B',
    // Row 4: Yellow, DarkViolet, SeaGreen, Crimson, DeepSkyBlue, Sienna
    '#FFFF00', '#9400D3', '#2E8B57', '#DC143C', '#00BFFF', '#A0522D',
    // Row 5: Blue, Tomato, MediumSpringGreen, DarkOrange, SlateBlue, Peru
    '#0000FF', '#FF6347', '#00FA9A', '#FF4500', '#6A5ACD', '#CD853F',
    // Row 6: Lime, MediumVioletRed, DarkSlateGray, Goldenrod, RoyalBlue, SaddleBrown
    '#00FF00', '#C71585', '#2F4F4F', '#DAA520', '#4169E1', '#8B4513',
    // Row 7: Magenta, DarkGreen, LightCoral, DodgerBlue, Khaki, DarkMagenta
    '#FF00FF', '#006400', '#F08080', '#1E90FF', '#F0E68C', '#8B008B',
    // Row 8: SpringGreen, Firebrick, CadetBlue, OrangeRed, MediumOrchid, DarkOliveGreen
    '#00FF7F', '#B22222', '#5F9EA0', '#FF4500', '#BA55D3', '#556B2F',
    // Row 9: Cyan, Brown, LawnGreen, BlueViolet, Salmon, DarkSeaGreen
    '#00FFFF', '#A52A2A', '#7CFC00', '#8A2BE2', '#FA8072', '#8FBC8F',
    // Row 10: HotPink, DarkSlateBlue, LightGreen, Indian Red, SteelBlue, Tan
    '#FF69B4', '#483D8B', '#90EE90', '#CD5C5C', '#4682B4', '#D2B48C',
    // Row 11: Aquamarine, DarkRed, MediumSeaGreen, DarkOrange, MediumPurple, RosyBrown
    '#7FFFD4', '#8B0000', '#3CB371', '#FF8C00', '#9370DB', '#BC8F8F',
    // Row 12: Turquoise, Chocolate, YellowGreen, Orchid, LightSeaGreen, DarkGoldenrod
    '#40E0D0', '#D2691E', '#9ACD32', '#DA70D6', '#20B2AA', '#B8860B',
    // Row 13: PaleVioletRed, MediumTurquoise, OliveDrab, Plum, LightSteelBlue, BurlyWood
    '#DB7093', '#48D1CC', '#6B8E23', '#DDA0DD', '#B0C4DE', '#DEB887',
    // Row 14: GreenYellow, MediumSlateBlue, DarkKhaki, Thistle, CornflowerBlue, NavajoWhite
    '#ADFF2F', '#7B68EE', '#BDB76B', '#D8BFD8', '#6495ED', '#FFDEAD',
    // Row 15: PaleTurquoise, Violet, MediumAquamarine, LightPink, PowderBlue, Wheat
    '#AFEEEE', '#EE82EE', '#66CDAA', '#FFB6C1', '#B0E0E6', '#F5DEB3',
    // Row 16: Remaining distinct colors
    '#E6E6FA', '#7B68EE', '#00CED1', '#FFE4B5', '#87CEEB', '#DDA0DD',
    '#98FB98', '#F0E68C', '#87CEFA', '#FAFAD2',
];

// Cache to track assigned colors per tematik type to avoid duplicates
const categoryColorCache: Map<string, Map<string, string>> = new Map();
// Track used colors per tematik to ensure uniqueness
const usedColorsCache: Map<string, Set<string>> = new Map();

// Get or assign a unique color for a category within a tematik type
function getOrAssignUniqueColor(category: string, tematikType: string): string {
    // Initialize caches for this tematik type if needed
    if (!categoryColorCache.has(tematikType)) {
        categoryColorCache.set(tematikType, new Map());
        usedColorsCache.set(tematikType, new Set());
    }

    const tematikCache = categoryColorCache.get(tematikType)!;
    const usedColors = usedColorsCache.get(tematikType)!;

    // Return cached color if already assigned
    if (tematikCache.has(category)) {
        return tematikCache.get(category)!;
    }

    // Find next available color from palette
    let assignedColor: string | null = null;

    // First, try to find an unused color from the palette
    for (const color of UNIQUE_COLOR_PALETTE) {
        if (!usedColors.has(color)) {
            assignedColor = color;
            break;
        }
    }

    // If all palette colors are used, generate additional HSL colors
    if (!assignedColor) {
        // Generate more colors using golden ratio for even distribution
        const goldenAngle = 137.508;
        let colorIndex = usedColors.size;
        let attempts = 0;
        const maxAttempts = 1000;

        while (!assignedColor && attempts < maxAttempts) {
            const hue = (colorIndex * goldenAngle) % 360;
            // Vary saturation and lightness for more variety
            const satVariation = (colorIndex % 3);
            const saturation = 70 + satVariation * 10; // 70%, 80%, 90%
            const lightVariation = Math.floor(colorIndex / 3) % 4;
            const lightness = 45 + lightVariation * 10; // 45%, 55%, 65%, 75%

            const newColor = `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;

            if (!usedColors.has(newColor)) {
                assignedColor = newColor;
            }
            colorIndex++;
            attempts++;
        }

        // Fallback if somehow still no color (should never happen)
        if (!assignedColor) {
            assignedColor = `hsl(${Math.random() * 360}, 85%, 60%)`;
        }
    }

    // Cache the assignment
    tematikCache.set(category, assignedColor);
    usedColors.add(assignedColor);

    return assignedColor;
}

// Legacy function for backward compatibility - now uses unique color system
export function stringToColor(str: string, tematikType: string = 'default'): string {
    return getOrAssignUniqueColor(str, tematikType);
}

// Clear color cache for a specific tematik type (call when switching layers)
export function clearTematikColorCache(tematikType?: string) {
    if (tematikType) {
        categoryColorCache.delete(tematikType);
        usedColorsCache.delete(tematikType);
    } else {
        categoryColorCache.clear();
        usedColorsCache.clear();
    }
}

// Color palette for nilai individu categories
export const nilaiIndividuColors: Record<string, string> = {
    'SUDAH_DINILAI_INDIVIDU': '#00FF7F',  // spring green
    'BELUM_DINILAI_INDIVIDU': '#FF6347',  // tomato
    'default': '#ADFF2F',                 // green yellow
};

// Color palette for NIK categories
export const nikColors: Record<string, string> = {
    'SUDAH_NIK': '#00FF7F',   // spring green
    'BELUM_NIK': '#FF6347',   // tomato
    'default': '#ADFF2F',     // green yellow
};

// Color palette for ketetapan per buku categories
export const ketetapanPerBukuColors: Record<string, string> = {
    'KETETAPAN_NOL': '#FF6347',  // tomato (merah - tidak ada ketetapan)
    '1': '#00BFFF',              // deep sky blue (Buku 1)
    '2': '#FFD700',              // gold (Buku 2)
    '3': '#FF69B4',              // hot pink (Buku 3)
    '4': '#00CED1',              // dark turquoise (Buku 4)
    '5': '#BA55D3',              // medium orchid (Buku 5)
    'default': '#ADFF2F',        // green yellow
};

// Color palette for status pembayaran categories
export const statusPembayaranColors: Record<string, string> = {
    'SUDAH_BAYAR': '#00FF7F',   // spring green (hijau - sudah bayar)
    'BELUM_BAYAR': '#FF6347',   // tomato (merah - belum bayar)
    'default': '#ADFF2F',       // green yellow
};

export function getCategoryColor(category: string, tematik?: string): string {
    // For jenis_tanah, use predefined colors
    if (tematik === 'jenis_tanah') {
        return jenisTanahColors[category] || jenisTanahColors['default'];
    }
    // For jenis_bangunan, use predefined colors
    if (tematik === 'jenis_bangunan') {
        return jenisBangunanColors[category] || jenisBangunanColors['default'];
    }
    // For nilai_individu, use predefined colors
    if (tematik === 'nilai_individu') {
        return nilaiIndividuColors[category] || nilaiIndividuColors['default'];
    }
    // For NIK, use predefined colors
    if (tematik === 'nik') {
        return nikColors[category] || nikColors['default'];
    }
    // For ketetapan per buku, use predefined colors
    if (tematik === 'ketetapan_per_buku') {
        return ketetapanPerBukuColors[category] || ketetapanPerBukuColors['default'];
    }
    // For status pembayaran, use predefined colors
    if (tematik === 'status_pembayaran') {
        return statusPembayaranColors[category] || statusPembayaranColors['default'];
    }
    // For kelas_tanah, kelas_bangunan, zona_nilai_tanah and other codes, generate color from string
    // Pass tematik type to ensure unique colors per layer type
    return stringToColor(category, tematik || 'default');
}