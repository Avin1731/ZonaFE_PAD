// Types untuk Penilaian Module

export interface Province {
    id: number;
    nama_region: string;
}

export interface DinasSubmission {
    id_dinas: number;
    nama_dinas: string;
    provinsi: string;
    tipe: 'provinsi' | 'kabupaten/kota';
    buku1_finalized: boolean;
    buku2_finalized: boolean;
    tabel_finalized: boolean;
    all_finalized: boolean;
    buku1_status?: 'draft' | 'finalized' | 'approved';
    buku2_status?: 'draft' | 'finalized' | 'approved';
    buku3_status?: 'draft' | 'finalized' | 'approved';
    tabel_status?: 'draft' | 'finalized' | 'approved';
}

export interface ParsedSLHD {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    provinsi?: string;
    Bab_1: number | null;
    // 12 Matra BAB 2
    Jumlah_Pemanfaatan_Pelayanan_Laboratorium: number | null;
    Daya_Dukung_dan_Daya_Tampung_Lingkungan_Hidup: number | null;
    Kajian_Lingkungan_Hidup_Strategis: number | null;
    Keanekaragaman_Hayati: number | null;
    Kualitas_Air: number | null;
    Laut_Pesisir_dan_Pantai: number | null;
    Kualitas_Udara: number | null;
    Pengelolaan_Sampah_dan_Limbah: number | null;
    Lahan_dan_Hutan: number | null;
    Perubahan_Iklim: number | null;
    Risiko_Bencana: number | null;
    Penetapan_Isu_Prioritas: number | null;
    Bab_3: number | null;
    Bab_4: number | null;
    Bab_5: number | null;
    Total_Skor: number | null;
    status: 'parsed_ok' | 'parsed_error' | 'finalized';
}

// Helper untuk menghitung rata-rata BAB 2
export const getBab2Avg = (item: ParsedSLHD): number | null => {
    const matraValues = [
        item.Jumlah_Pemanfaatan_Pelayanan_Laboratorium,
        item.Daya_Dukung_dan_Daya_Tampung_Lingkungan_Hidup,
        item.Kajian_Lingkungan_Hidup_Strategis,
        item.Keanekaragaman_Hayati,
        item.Kualitas_Air,
        item.Laut_Pesisir_dan_Pantai,
        item.Kualitas_Udara,
        item.Pengelolaan_Sampah_dan_Limbah,
        item.Lahan_dan_Hutan,
        item.Perubahan_Iklim,
        item.Risiko_Bencana,
        item.Penetapan_Isu_Prioritas
    ].filter(v => v !== null) as number[];
    
    if (matraValues.length === 0) return null;
    return matraValues.reduce((sum, v) => sum + v, 0) / matraValues.length;
};

export interface PenilaianSLHD {
    id: number;
    year: number;
    status: 'uploaded' | 'parsing' | 'parsed_ok' | 'parsed_failed' | 'finalized';
    file_path: string;
    uploaded_at: string;
    finalized_at: string | null;
    is_finalized: boolean;
    catatan: string | null;
    uploaded_by?: {
        id: number;
        email: string;
    };
}

export interface PenilaianPenghargaan {
    id: number;
    year: number;
    status: 'uploaded' | 'parsing' | 'parsed_ok' | 'parsed_failed' | 'finalized';
    file_path: string;
    uploaded_at: string;
    finalized_at: string | null;
    is_finalized: boolean;
    catatan: string | null;
    uploaded_by?: {
        id: number;
        email: string;
    };
}

export interface ParsedPenghargaan {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    Adipura_Skor: number | null;
    Adipura_Skor_Max: number | null;
    Adiwiyata_Skor: number | null;
    Adiwiyata_Skor_Max: number | null;
    Proklim_Skor: number | null;
    Proklim_Skor_Max: number | null;
    Proper_Skor: number | null;
    Proper_Skor_Max: number | null;
    Kalpataru_Skor: number | null;
    Kalpataru_Skor_Max: number | null;
    Total_Skor: number | null;
    status: 'parsed_ok' | 'parsed_error' | 'finalized';
}

export interface ParsedValidasi1 {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    Total_Skor: number | null;
    Nilai_IKLH: number | null;
    Nilai_Penghargaan: number | null;
    status: string;
    status_result: 'lulus' | 'tidak_lulus' | null;
}

export interface ParsedValidasi2 {
    id: number;
    id_dinas: number;
    nama_dinas: string;
    Nilai_Penghargaan: number | null;
    Nilai_IKLH: number | null;
    Total_Skor: number | null;
    Kriteria_WTP: boolean;
    Kriteria_Kasus_Hukum: boolean;
    status_validasi: 'pending' | 'lolos' | 'tidak_lolos';
    catatan: string | null;
}

export interface RankedData {
    peringkat: number;
    id_dinas: number;
    nama_dinas: string;
    kategori: string;
    provinsi: string;
    Nilai_Penghargaan: number;
    Nilai_IKLH: number;
    Total_Skor: number;
    Kriteria_WTP: boolean;
    Kriteria_Kasus_Hukum: boolean;
}

export interface WawancaraData {
    id: number;
    year: number;
    id_dinas: number;
    nama_dinas: string;
    kategori: string;
    provinsi: string;
    nilai_wawancara: number | null;
    catatan: string | null;
    status: string;
    is_finalized: boolean;
}

// Props untuk Tab Components
export interface TabProps {
    provinsiList: Province[];
    submissions: DinasSubmission[];
    onRefreshSubmissions?: () => void;
}
