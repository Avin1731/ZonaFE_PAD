'use client';

import { TableItem } from './hasilPenilaianData';

interface StatusBadgeProps {
    status?: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    let colorClasses = "bg-gray-100 text-gray-700";
    
    if (status === 'Lulus' || status === 'Selesai' || status === 'Valid' || status === 'Memenuhi') {
        colorClasses = "bg-green-100 text-green-700";
    } else if (status === 'Pending' || status === 'Menunggu') {
        colorClasses = "bg-yellow-100 text-yellow-700";
    } else if (status === 'Tidak Memenuhi' || status === 'Ditolak') {
        colorClasses = "bg-red-100 text-red-700";
    }
    
    return (
        <span className={`px-3 py-1 rounded-full text-xs ${colorClasses}`}>
            {status || '-'}
        </span>
    );
};

interface PenilaianTableProps {
    data: TableItem[];
    headers: string[];
    activeTab: string;
    totalLabel: string | null;
    colSpan: number;
    totalNilai: number;
    showNotification?: boolean;
}

export default function PenilaianTable({ 
    data, 
    headers, 
    activeTab, 
    totalLabel, 
    colSpan,
    totalNilai,
    showNotification
}: PenilaianTableProps) {
    return (
        <div className={`border border-gray-200 rounded-lg overflow-hidden ${showNotification ? 'absolute z-[-5] inset-0' : ''}`}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-100 border-b border-green-200">
                    <tr>
                        {headers.map((head, index) => (
                            <th key={index} className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                {head}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={headers.length} className="px-6 py-12 text-center text-gray-500">
                                <div className="flex flex-col items-center">
                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p>Belum ada data penilaian untuk tahap ini</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.no}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.komponen || item.kategori || item.kriteria}
                                </td>
                                {activeTab !== 'validasi_2' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.bobot}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {typeof item.nilai === 'number' ? item.nilai.toFixed(2) : item.nilai}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {typeof item.skor === 'number' ? item.skor.toFixed(2) : item.skor}
                                        </td>
                                    </>
                                )}
                                {activeTab === 'validasi_1' && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={item.status || item.keterangan} />
                                    </td>
                                )}
                                {activeTab === 'validasi_2' && (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 italic">{item.keterangan}</td>
                                    </>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
                
                {totalLabel && data.length > 0 && (
                    <tfoot className="bg-gray-50">
                        <tr>
                            <td colSpan={colSpan} className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">
                                {totalLabel}
                            </td>
                            <td className="px-6 py-4 text-left text-lg font-bold text-gray-900" colSpan={2}>
                                {totalNilai.toFixed(2)}
                            </td>
                        </tr>
                    </tfoot>
                )}
            </table>
        </div>
    );
}
