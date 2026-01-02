"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
// --- INTERFACES ---

interface RekapProvinsiItem {
    id: number;
    kabKota: string;
    nilaiSLHD: number;
    nilaiIKLH: number;
    status: string;
}

interface RekapKabKotaItem {
    no: number;
    tipe: string;
    iklh: number;
    slhd: number;
    totalPenghargaan: number;
    totalAdipura: number;
    totalAdiwiyata: number;
    totalProper: number;
    totalProklim: number;
    totalKalpataru: number;
    totalTahap1: string;
    nilaiWawancara: number;
    totalTahap2: number;
}

interface KabKotaRekapTableProps {
    data: RekapKabKotaItem[];
    // HAPUS: kabKotaName dihapus karena tidak digunakan
}

// --- DATA DUMMY ---

const rekapDataProvinsi: RekapProvinsiItem[] = [
    { id: 1, kabKota: 'Kabupaten Sleman', nilaiSLHD: 84.5, nilaiIKLH: 78.0, status: 'Lulus' },
    { id: 2, kabKota: 'Kota Yogyakarta', nilaiSLHD: 82.1, nilaiIKLH: 80.5, status: 'Lulus' },
    { id: 3, kabKota: 'Kabupaten Bantul', nilaiSLHD: 75.0, nilaiIKLH: 70.2, status: 'Pending' },
    { id: 4, kabKota: 'Kabupaten Kulon Progo', nilaiSLHD: 68.0, nilaiIKLH: 65.1, status: 'Tidak Lulus' },
    { id: 5, kabKota: 'Kabupaten Gunungkidul', nilaiSLHD: 72.3, nilaiIKLH: 69.5, status: 'Pending' },
];

const rekapDataKabKota: RekapKabKotaItem[] = [
    { 
        no: 1, tipe: 'Inisial', iklh: 87, slhd: 78, totalPenghargaan: 82, totalAdipura: 82, 
        totalAdiwiyata: 82, totalProper: 82, totalProklim: 82, totalKalpataru: 82,
        totalTahap1: 'Passing Grade', nilaiWawancara: 80, totalTahap2: 83
    },
    { 
        no: 2, tipe: 'Koreksi', iklh: 90, slhd: 88, totalPenghargaan: 90, totalAdipura: 90, 
        totalAdiwiyata: 90, totalProper: 90, totalProklim: 90, totalKalpataru: 90,
        totalTahap1: 'Passing Grade', nilaiWawancara: 75, totalTahap2: 91
    },
    { 
        no: 3, tipe: 'Inisial', iklh: 84, slhd: 70, totalPenghargaan: 74, totalAdipura: 74, 
        totalAdiwiyata: 74, totalProper: 74, totalProklim: 74, totalKalpataru: 74,
        totalTahap1: 'Passing Grade', nilaiWawancara: 80, totalTahap2: 75
    },
];

// --- KOMPONEN ---

const StatusBadge = ({ status }: { status: string }) => {
    let colorClasses = "bg-gray-100 text-gray-600";
    if (status === 'Lulus' || status === 'Passing Grade') colorClasses = "bg-green-100 text-green-700";
    if (status === 'Pending') colorClasses = "bg-yellow-100 text-yellow-700";
    if (status === 'Tidak Lulus') colorClasses = "bg-red-100 text-red-700";
    
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClasses}`}>
            {status}
        </span>
    );
};

const KabKotaRekapTable = ({ data }: KabKotaRekapTableProps) => {
    const [selectedYear, setSelectedYear] = useState('2025');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex gap-4 mb-6 items-center">
                <label htmlFor="tahun" className="text-sm font-medium text-gray-700">Tahun</label>
                <select
                    id="tahun"
                    className="p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    <option value="2025">2025</option>
                </select>
                <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition duration-150">
                    Filter
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr style={{ backgroundColor: '#C7FFC780' }}>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TIPE NILAI</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NILAI IKLH</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NILAI SLHD</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI PENGHARGAAN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI ADIPURA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI ADIWIYATA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI PROPER</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI PROKLIM</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI KALPATARU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI TAHAP 1</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NILAI WAWANCARA</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TOTAL NILAI TAHAP 2</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={item.no}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.no}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.tipe}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.iklh}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.slhd}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalPenghargaan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalAdipura}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalAdiwiyata}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalProper}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalProklim}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.totalKalpataru}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={item.totalTahap1} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.nilaiWawancara}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{item.totalTahap2}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end items-center mt-6 text-sm text-gray-600">
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100">&lt;</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100 mx-1">1</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100 mx-1">2</button>
                <button className="px-3 py-1 border border-green-500 bg-green-50 rounded-md text-green-700 font-bold mx-1">3</button>
                <button className="px-3 py-1 border rounded-md hover:bg-gray-100">&gt;</button>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

export default function TabelRekapPage() {
    const { user } = useAuth();

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen">Memuat...</div>;
    }

    // PERBAIKAN 1: Akses user.role.name dan gunakan toLowerCase() untuk keamanan
    const roleName = user.role?.name?.toLowerCase() || ''; 
    const isKabKotaRole = roleName === 'dlh' || roleName === 'kota'; 

    return (
        <div className="max-w-7xl mx-auto">
            
            {isKabKotaRole && (
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Hasil Penilaian - Tabel Rekap</h1>
                    <p className="text-lg text-gray-500 mt-1 mb-8">
                        Rekap Nilai {user.name} 
                    </p>
                    {/* PERBAIKAN 2: Hapus prop kabKotaName yang tidak digunakan */}
                    <KabKotaRekapTable data={rekapDataKabKota} />
                </div>
            )}

            {/* PERBAIKAN 3: Bandingkan dengan roleName string */}
            {roleName === 'provinsi' && (
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Tabel Rekapitulasi</h1>
                    <p className="text-lg text-gray-500 mt-1 mb-8">
                        Rekapitulasi Nilai Kabupaten/Kota di Provinsi {user.name.replace('DLH ', '')}
                    </p>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr style={{ backgroundColor: '#C7FFC780' }}>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kab/Kota</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai SLHD</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai IKLH</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rekapDataProvinsi.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.kabKota}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.nilaiSLHD}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{item.nilaiIKLH}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <a href="#" className="text-green-600 hover:text-green-800 font-medium">Detail</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            
            {/* PERBAIKAN 4: Bandingkan dengan roleName string */}
            {roleName === 'pusdatin' && (
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">Tabel Rekapitulasi</h1>
                    <p className="text-lg text-gray-500 mt-1 mb-8">
                        Tampilan rekapitulasi untuk Pusdatin
                    </p>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                        (Tampilan rekapitulasi untuk Pusdatin akan ditampilkan di sini)
                    </div>
                </div>
            )}
        </div>
    );
}