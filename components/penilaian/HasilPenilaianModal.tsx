'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, X } from 'lucide-react';

// Interface untuk hasil dari API rekap penilaian
export interface HasilPenilaian {
    tahap_diumumkan: string;
    nilai_slhd?: string | number;
    nilai_penghargaan?: string | number;
    nilai_iklh?: string | number;
    nilai_wawancara?: string | number;
    total_skor?: string | number;
    total_skor_final?: string | number;
    kriteria_wtp?: string;
    kriteria_kasus_hukum?: string;
    peringkat?: number;
    peringkat_final?: number;
    status: string;
    keterangan: string;
}

interface HasilPenilaianModalProps {
    show: boolean;
    onClose: () => void;
    hasil: HasilPenilaian | null;
    loading?: boolean;
    tahapAktif?: string;
    activeTab?: string;
}

// Helper untuk menentukan status
const getStatusConfig = (hasil: HasilPenilaian | null, tahapAktif?: string, activeTab?: string) => {
    const isDalamProses = tahapAktif === activeTab;
    const isLolos = hasil?.status === 'LOLOS' || hasil?.status === 'LOLOS FINAL' || 
                   hasil?.status === 'MASUK KATEGORI' || hasil?.status === 'SELESAI' || 
                   hasil?.status === 'SELESAI WAWANCARA';
    const isWaiting = hasil?.status === 'MENUNGGU';

    if (isDalamProses) {
        return { bg: 'bg-blue-100', text: 'text-blue-600', btn: 'bg-blue-500 hover:bg-blue-600', icon: Clock };
    }
    if (isWaiting) {
        return { bg: 'bg-yellow-100', text: 'text-yellow-600', btn: 'bg-yellow-500 hover:bg-yellow-600', icon: Clock };
    }
    if (isLolos) {
        return { bg: 'bg-green-100', text: 'text-green-600', btn: 'bg-green-600 hover:bg-green-700', icon: CheckCircle };
    }
    return { bg: 'bg-red-100', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700', icon: XCircle };
};

export default function HasilPenilaianModal({ 
    show, 
    onClose,
    hasil,
    loading = false,
    tahapAktif,
    activeTab
}: HasilPenilaianModalProps) {
    if (!show) return null;

    const isPending = !hasil || loading;
    const isDalamProses = tahapAktif === activeTab;
    const config = getStatusConfig(hasil, tahapAktif, activeTab);
    const IconComponent = config.icon;

    // Detail nilai yang akan ditampilkan
    const nilaiDetails = hasil ? [
        { label: 'Nilai SLHD', value: hasil.nilai_slhd },
        { label: 'Nilai Penghargaan', value: hasil.nilai_penghargaan },
        { label: 'Nilai IKLH', value: hasil.nilai_iklh },
        { label: 'Nilai Wawancara', value: hasil.nilai_wawancara },
    ].filter(item => item.value !== undefined) : [];

    const skorDetails = hasil ? [
        { label: 'Total Skor', value: hasil.total_skor, bold: true },
        { label: 'Total Skor Final', value: hasil.total_skor_final, bold: true },
        { label: 'Peringkat', value: hasil.peringkat ? `#${hasil.peringkat}` : undefined },
        { label: 'Peringkat Final', value: hasil.peringkat_final ? `#${hasil.peringkat_final}` : undefined, highlight: true },
    ].filter(item => item.value !== undefined) : [];

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {isPending ? (
                            <div className="flex flex-col items-center py-8">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6 animate-pulse">
                                    <Clock className="w-12 h-12 text-gray-400" />
                                </div>
                                <p className="text-gray-500">Memuat hasil...</p>
                            </div>
                        ) : (
                            <>
                                {/* Icon */}
                                <motion.div 
                                    className="flex justify-center mb-6"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${config.bg}`}>
                                        <IconComponent className={`w-12 h-12 ${config.text}`} strokeWidth={2.5} />
                                    </div>
                                </motion.div>

                                {/* Content */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                                        {hasil?.tahap_diumumkan}
                                    </h2>
                                    <p className={`text-2xl font-bold text-center mb-3 ${config.text}`}>
                                        {isDalamProses ? '⏳ SEDANG PROSES' : hasil?.status}
                                    </p>
                                    <p className="text-center text-gray-600 mb-6 leading-relaxed text-sm">
                                        {isDalamProses 
                                            ? 'Tahap penilaian ini sedang berlangsung. Hasil akhir akan tersedia setelah tahap selesai.'
                                            : hasil?.keterangan
                                        }
                                    </p>

                                    {/* Detail nilai jika ada */}
                                    {(nilaiDetails.length > 0 || skorDetails.length > 0) && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                                            {nilaiDetails.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{item.label}:</span>
                                                    <span className="font-semibold text-gray-900">{item.value}</span>
                                                </div>
                                            ))}
                                            {skorDetails.map((item, idx) => (
                                                <div key={idx} className={`flex justify-between text-sm ${idx === 0 ? 'border-t pt-2' : ''}`}>
                                                    <span className="text-gray-600">{item.label}:</span>
                                                    <span className={`${item.bold ? 'font-bold' : 'font-semibold'} ${item.highlight ? 'text-green-600' : 'text-gray-900'}`}>
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex justify-center"
                                >
                                    <button
                                        onClick={onClose}
                                        className={`px-8 py-3 text-white rounded-lg transition-colors font-semibold min-w-[120px] shadow-lg hover:shadow-xl ${config.btn}`}
                                    >
                                        Lihat Detail
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
