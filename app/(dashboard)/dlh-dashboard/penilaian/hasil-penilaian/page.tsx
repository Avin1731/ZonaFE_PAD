"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import axios from '@/lib/axios';

// Import komponen yang sudah dipisahkan
import HasilPenilaianModal, { HasilPenilaian } from '@/components/penilaian/HasilPenilaianModal';
import HasilPenilaianCard from '@/components/penilaian/HasilPenilaianCard';
import PenilaianTable from '@/components/penilaian/PenilaianTable';
import FloatingNotification from '@/components/penilaian/FloatingNotification';
import {
    PageData,
    TimelineItem,
    TimelineResponse,
    TabId,
    TABS,
    getTableConfig,
    defaultDataSLHD,
    defaultDataPenghargaan,
    defaultDataValidasi1,
    defaultDataValidasi2,
    defaultDataWawancara,
} from '@/components/penilaian/hasilPenilaianData';

// State untuk semua data penilaian
interface PenilaianState {
    penilaian_slhd: PageData;
    penilaian_penghargaan: PageData;
    validasi_1: PageData;
    validasi_2: PageData;
    wawancara: PageData;
}

// Default state
const defaultPenilaianState: PenilaianState = {
    penilaian_slhd: defaultDataSLHD,
    penilaian_penghargaan: defaultDataPenghargaan,
    validasi_1: defaultDataValidasi1,
    validasi_2: defaultDataValidasi2,
    wawancara: defaultDataWawancara,
};

export default function HasilPenilaianPage() {
    const [activeTab, setActiveTab] = useState<TabId>('penilaian_slhd');
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [tahapAktif, setTahapAktif] = useState('');
    
    // Simplified state - gabungkan data penilaian dalam satu object
    const [penilaianData, setPenilaianData] = useState<PenilaianState>(defaultPenilaianState);
    const [hasilPenilaian, setHasilPenilaian] = useState<Record<string, HasilPenilaian | null>>({});
    const [pengumumanTersedia, setPengumumanTersedia] = useState<Record<string, boolean>>({});
    
    // UI state
    const [showHasilModal, setShowHasilModal] = useState(false);
    const [loadingHasil, setLoadingHasil] = useState(false);
    const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

    // Fetch timeline
    const fetchTimeline = useCallback(async () => {
        try {
            const response = await axios.get('/api/dinas/pengumuman/timeline');
            const data: TimelineResponse = response.data;
            setTimeline(data.timeline);
            setTahapAktif(data.tahap_aktif);
        } catch (err) {
            console.error('Error fetching timeline:', err);
        }
    }, []);

    // Update table data berdasarkan hasil API
    const updateTableFromHasil = useCallback((tahap: string, hasil: HasilPenilaian) => {
        setPenilaianData(prev => {
            const newState = { ...prev };
            
            switch (tahap) {
                case 'validasi_1':
                    if (hasil.nilai_penghargaan !== undefined && hasil.nilai_iklh !== undefined) {
                        const nilaiPenghargaan = parseFloat(String(hasil.nilai_penghargaan)) || 0;
                        const nilaiIklh = parseFloat(String(hasil.nilai_iklh)) || 0;
                        newState.validasi_1 = {
                            ...defaultDataValidasi1,
                            table: [
                                { no: 1, kategori: 'Nilai Penghargaan', bobot: 60, nilai: nilaiPenghargaan, skor: (nilaiPenghargaan * 60) / 100, status: hasil.status },
                                { no: 2, kategori: 'Nilai IKLH', bobot: 40, nilai: nilaiIklh, skor: (nilaiIklh * 40) / 100, status: hasil.status },
                            ]
                        };
                    }
                    break;
                    
                case 'validasi_2':
                    if (hasil.kriteria_wtp !== undefined && hasil.kriteria_kasus_hukum !== undefined) {
                        newState.validasi_2 = {
                            ...defaultDataValidasi2,
                            table: [
                                { 
                                    no: 1, 
                                    kriteria: 'Kriteria WTP (Wajar Tanpa Pengecualian)', 
                                    status: hasil.kriteria_wtp,
                                    keterangan: hasil.kriteria_wtp === 'Memenuhi' 
                                        ? 'Laporan keuangan daerah mendapat opini WTP dari BPK'
                                        : 'Laporan keuangan daerah tidak mendapat opini WTP dari BPK'
                                },
                                { 
                                    no: 2, 
                                    kriteria: 'Kriteria Kasus Hukum Lingkungan', 
                                    status: hasil.kriteria_kasus_hukum,
                                    keterangan: hasil.kriteria_kasus_hukum === 'Memenuhi'
                                        ? 'Tidak ada kasus hukum lingkungan yang sedang berjalan'
                                        : 'Terdapat kasus hukum lingkungan yang sedang berjalan'
                                },
                            ]
                        };
                    }
                    break;
                    
                case 'wawancara':
                    if (hasil.nilai_wawancara !== undefined) {
                        const nilaiWawancara = parseFloat(String(hasil.nilai_wawancara)) || 0;
                        newState.wawancara = {
                            ...defaultDataWawancara,
                            table: [{ no: 1, komponen: 'Nilai Wawancara', bobot: 100, nilai: nilaiWawancara, skor: nilaiWawancara }]
                        };
                    }
                    break;
            }
            
            return newState;
        });
    }, []);

    // Ref untuk menandai tab yang sudah pernah di-fetch
    const fetchedTabsRef = useRef<{ [key: string]: boolean }>({});

    // Fetch hasil penilaian per tahap, hanya jika belum pernah fetch
    const fetchHasilPenilaian = useCallback(async (tahap: string, showModal = false) => {
        if (fetchedTabsRef.current[tahap]) return;
        fetchedTabsRef.current[tahap] = true;
        try {
            setLoadingHasil(true);
            const year = new Date().getFullYear();
            const response = await axios.get(`/api/dinas/pengumuman/${year}/${tahap}`);
            const data = response.data;
            
            if (data.pengumuman_tersedia && data.hasil) {
                setHasilPenilaian(prev => ({ ...prev, [tahap]: data.hasil }));
                setPengumumanTersedia(prev => ({ ...prev, [tahap]: true }));
                if (showModal) setShowHasilModal(true);
                updateTableFromHasil(tahap, data.hasil);
            } else {
                setPengumumanTersedia(prev => ({ ...prev, [tahap]: false }));
                setHasilPenilaian(prev => ({ ...prev, [tahap]: null }));
            }
        } catch (err) {
            console.error('Error fetching hasil penilaian:', err);
            setPengumumanTersedia(prev => ({ ...prev, [tahap]: false }));
        } finally {
            setLoadingHasil(false);
        }
    }, [updateTableFromHasil]);

    // Fetch detail SLHD
    const fetchDetailSLHD = useCallback(async () => {
        try {
            const response = await axios.get('/api/dinas/pengumuman/detail-slhd');
            const data = response.data;
            
            if (data.available && data.detail_bab) {
                setPenilaianData(prev => ({
                    ...prev,
                    penilaian_slhd: {
                        ...defaultDataSLHD,
                        table: data.detail_bab.map((bab: any) => ({
                            no: bab.no,
                            komponen: bab.komponen,
                            bobot: bab.bobot,
                            nilai: bab.nilai,
                            skor: bab.skor
                        }))
                    }
                }));
            }
        } catch (err) {
            console.error('Error fetching detail SLHD:', err);
        }
    }, []);

    // Fetch detail Penghargaan
    const fetchDetailPenghargaan = useCallback(async () => {
        try {
            const response = await axios.get('/api/dinas/pengumuman/detail-penghargaan');
            const data = response.data;
            
            if (data.available && data.detail_kategori) {
                setPenilaianData(prev => ({
                    ...prev,
                    penilaian_penghargaan: {
                        ...defaultDataPenghargaan,
                        table: data.detail_kategori.map((kat: any) => ({
                            no: kat.no,
                            kategori: kat.kategori,
                            bobot: kat.bobot,
                            nilai: kat.persentase,
                            skor: kat.nilai_tertimbang
                        }))
                    }
                }));
            }
        } catch (err) {
            console.error('Error fetching detail Penghargaan:', err);
        }
    }, []);

    // Initial data fetch (hanya sekali)
    useEffect(() => {
        fetchTimeline();
        fetchDetailSLHD();
        fetchDetailPenghargaan();
        fetchHasilPenilaian('penilaian_slhd', false); // Tidak buka modal otomatis
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle tab change
    const handleTabChange = useCallback((tabId: TabId) => {
        setActiveTab(tabId);
        if (!hasilPenilaian[tabId] && !fetchedTabsRef.current[tabId]) {
            fetchHasilPenilaian(tabId, false);
        } else if (pengumumanTersedia[tabId]) {
            setShowHasilModal(true);
        }
    }, [fetchHasilPenilaian, hasilPenilaian, pengumumanTersedia]);

    // Computed values
    const currentData = penilaianData[activeTab];
    const currentHasil = hasilPenilaian[activeTab] || null;
    const tableConfig = getTableConfig(activeTab);
    const totalNilai = currentData.table.reduce((sum, item) => sum + (item.skor || 0), 0);
    
    const currentStatus = useMemo(() => {
        const tahapData = timeline.find(t => t.tahap === activeTab);
        if (!tahapData) return null;
        
        const statusMap = {
            'pending': 'BELUM DIMULAI',
            'active': 'SEDANG BERLANGSUNG', 
            'completed': 'SELESAI'
        };
        
        return {
            status: statusMap[tahapData.status] || tahapData.keterangan,
            rawStatus: tahapData.status
        };
    }, [timeline, activeTab]);

    // Handle dismiss notification
    const handleDismissNotification = () => {
        setDismissedNotifications(prev => new Set([...prev, activeTab]));
    };

    const showNotification = !pengumumanTersedia[activeTab] && !dismissedNotifications.has(activeTab);

    return (
        <div className="max-w-7xl mx-auto p-2">
            {/* Breadcrumb */}
            <div className="text-sm text-green-600 mb-2 font-medium">
                Penilaian <span className="text-gray-400 mx-2">&gt;</span> 
                <span className="text-gray-600">{currentData.title.replace('Hasil ','')}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{currentData.title}</h1>
                    <p className="text-lg text-gray-500 mt-1">{currentData.subtitle}</p>
                </div>
                
                <HasilPenilaianCard
                    hasil={currentHasil}
                    tahapAktif={tahapAktif}
                    activeTab={activeTab}
                    rawStatus={currentStatus?.rawStatus}
                    statusText={currentStatus?.status}
                    onClick={() => currentHasil && setShowHasilModal(true)}
                />
            </div>

            {/* Tabs */}
            <div className="mb-8">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-base transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-green-500 text-green-600'
                                        : 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 pb-0">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {currentData.title.replace('Hasil Penilaian ', '').replace('Hasil ', '')}
                    </h2>
                </div>

                <div className={`p-6 relative `}>
                    {/* Floating Notification */}
                    {showNotification && (
                        <FloatingNotification
                            show={true}
                            onClose={handleDismissNotification}
                            title={currentStatus?.status || 'Pemberitahuan'}
                            message="Hasil penilaian untuk tahap ini belum tersedia. Silakan tunggu hingga tahap selesai."
                            type={currentStatus?.rawStatus === 'active' ? 'info' : 'warning'}
                        />
                    )}
                    
                    {/* Table */}
                    <PenilaianTable
                        data={currentData.table}
                        headers={tableConfig.headers}
                        activeTab={activeTab}
                        totalLabel={tableConfig.totalLabel}
                        colSpan={tableConfig.colSpan}
                        totalNilai={totalNilai}
                        showNotification={showNotification}
                    />
                </div>
            </div>

            {/* Modal Hasil */}
            <HasilPenilaianModal
                show={showHasilModal}
                onClose={() => setShowHasilModal(false)}
                hasil={currentHasil}
                loading={loadingHasil}
                tahapAktif={tahapAktif}
                activeTab={activeTab}
            />
        </div>
    );
}
