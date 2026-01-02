// Types untuk halaman Hasil Penilaian
export interface TableItem {
    no?: number;
    komponen?: string;
    kategori?: string;
    kriteria?: string;
    bobot?: number;
    nilai?: number;
    skor?: number;
    status?: string;
    keterangan?: string;
}

export interface PageData {
    title: string;
    subtitle: string;
    table: TableItem[];
}

export interface TimelineItem {
    tahap: string;
    nama: string;
    status: 'active' | 'pending' | 'completed';
    keterangan: string;
}

export interface TimelineResponse {
    year: string;
    tahap_aktif: string;
    pengumuman_terbuka: boolean;
    keterangan: string;
    timeline: TimelineItem[];
}

// Data default untuk setiap tahap penilaian
export const defaultDataSLHD: PageData = {
    title: "Hasil Penilaian SLHD",
    subtitle: "Penilaian dokumen SLHD per BAB",
    table: [
        { no: 1, komponen: 'BAB I - Pendahuluan', bobot: 10, nilai: 0, skor: 0 },
        { no: 2, komponen: 'BAB II - Analisis Isu LH Daerah', bobot: 50, nilai: 0, skor: 0 },
        { no: 3, komponen: 'BAB III - Isu Prioritas Daerah', bobot: 20, nilai: 0, skor: 0 },
        { no: 4, komponen: 'BAB IV - Inovasi Daerah', bobot: 15, nilai: 0, skor: 0 },
        { no: 5, komponen: 'BAB V - Penutup', bobot: 5, nilai: 0, skor: 0 },
    ],
};

export const defaultDataPenghargaan: PageData = {
    title: "Hasil Penilaian Penghargaan",
    subtitle: "Penentuan Bobot Antar Penghargaan",
    table: [
        { no: 1, kategori: 'Adipura', bobot: 35, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 2, kategori: 'Proper', bobot: 21, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 3, kategori: 'Proklim', bobot: 19, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 4, kategori: 'Adiwiyata', bobot: 15, nilai: 0, skor: 0, keterangan: 'Lulus' },
        { no: 5, kategori: 'Kalpataru', bobot: 10, nilai: 0, skor: 0, keterangan: 'Lulus' },
    ],
};

export const defaultDataValidasi1: PageData = {
    title: "Hasil Validasi 1",
    subtitle: "Validasi 1 - Rerata IKLH & Penghargaan",
    table: [
        { no: 1, kategori: 'Nilai Penghargaan', bobot: 60, nilai: 0, skor: 0, status: '-' },
        { no: 2, kategori: 'Nilai IKLH', bobot: 40, nilai: 0, skor: 0, status: '-' },
    ],
};

export const defaultDataValidasi2: PageData = {
    title: "Hasil Validasi 2",
    subtitle: "Validasi 2 - Administratif & Kepatuhan",
    table: [
        { no: 1, kriteria: 'Kriteria WTP (Wajar Tanpa Pengecualian)', status: '-', keterangan: '-' },
        { no: 2, kriteria: 'Kriteria Kasus Hukum Lingkungan', status: '-', keterangan: '-' },
    ],
};

export const defaultDataWawancara: PageData = {
    title: "Hasil Penilaian Wawancara",
    subtitle: "Wawancara & Perhitungan Nilai Tahap Akhir (NT Final)",
    table: [],
};

// Tabs configuration
export const TABS = [
    { id: 'penilaian_slhd', name: 'Penilaian SLHD' },
    { id: 'penilaian_penghargaan', name: 'Penilaian Penghargaan' },
    { id: 'validasi_1', name: 'Validasi 1' },
    { id: 'validasi_2', name: 'Validasi 2' },
    { id: 'wawancara', name: 'Wawancara & Nilai Akhir' },
] as const;

export type TabId = typeof TABS[number]['id'];

// Helper untuk mendapatkan heading tabel berdasarkan tab
export const getTableConfig = (activeTab: TabId) => {
    switch (activeTab) {
        case 'penilaian_slhd':
        case 'wawancara':
        case 'penilaian_penghargaan':
            return { 
                headers: ['NO', 'KOMPONEN', 'BOBOT (%)', 'NILAI (0-100)', 'SKOR AKHIR'], 
                totalLabel: 'Total Nilai:', 
                colSpan: 4 
            };
        case 'validasi_1':
            return { 
                headers: ['NO', 'KATEGORI', 'BOBOT (%)', 'NILAI (0-100)', 'SKOR AKHIR', 'KETERANGAN'], 
                totalLabel: 'Total Nilai:', 
                colSpan: 4 
            };
        case 'validasi_2':
            return { 
                headers: ['NO', 'KRITERIA VALIDASI', 'STATUS', 'KETERANGAN'], 
                totalLabel: null, 
                colSpan: 0 
            };
        default:
            return { 
                headers: ['NO', 'KOMPONEN', 'BOBOT (%)', 'NILAI (0-100)', 'SKOR AKHIR'], 
                totalLabel: 'Total Nilai:', 
                colSpan: 4 
            };
    }
};
