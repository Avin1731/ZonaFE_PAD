'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '@/lib/axios';
import InnerNav from '@/components/InnerNav';
import ProgressCard from '@/components/ProgressCard';
import { ToastProvider, useToast, ConfirmModal, FinalizedBadge } from '@/components/ui';
import { FaFileExcel, FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaFilter, FaExclamationTriangle, FaInfoCircle, FaLock, FaSyncAlt, FaUsers } from 'react-icons/fa';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

// Types
import type { 
    Province, 
    DinasSubmission, 
    ParsedSLHD, 
    PenilaianSLHD, 
    PenilaianPenghargaan, 
    ParsedPenghargaan, 
    ParsedValidasi1, 
    ParsedValidasi2, 
    RankedData, 
    WawancaraData,
    TabProps 
} from '@/types/penilaian';
import { getBab2Avg } from '@/types/penilaian';

// --- KOMPONEN TAB PENILAIAN SLHD ---
function TabPenilaianSLHD({ provinsiList, submissions, onRefreshSubmissions }: TabProps) {
    const { showToast } = useToast();
    const [tipeFilter, setTipeFilter] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilter, setProvinsiFilter] = useState<string>('');
    const [parsedData, setParsedData] = useState<ParsedSLHD[]>([]);
    const [penilaianSLHD, setPenilaianSLHD] = useState<PenilaianSLHD | null>(null);
    const [penilaianList, setPenilaianList] = useState<PenilaianSLHD[]>([]);
    const [selectedPenilaianId, setSelectedPenilaianId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadCatatan, setUploadCatatan] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    
    // Filter independen untuk hasil penilaian
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>(10);
    
    // State untuk floating panel
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isFinalizingLocal, setIsFinalizingLocal] = useState(false);

    const year = new Date().getFullYear();

    // Fetch SLHD penilaian data only (provinces & submissions dari props)
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const penilaianRes = await axios.get(`/api/pusdatin/penilaian/slhd/${year}`);
            
            // Backend mengembalikan array semua penilaian SLHD
            const penilaianData = penilaianRes.data.data;
            if (penilaianData && penilaianData.length > 0) {
                setPenilaianList(penilaianData);
                const latestPenilaian = penilaianData[0];
                setPenilaianSLHD(latestPenilaian);
                setSelectedPenilaianId(latestPenilaian.id);
                // Fetch parsed data jika ada penilaian
                const parsedRes = await axios.get(`/api/pusdatin/penilaian/slhd/parsed/${latestPenilaian.id}`);
                setParsedData(parsedRes.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter submissions
    const filteredSubmissions = useMemo(() => {
        return submissions.filter(item => {
            const matchTipe = tipeFilter === 'all' || item.tipe === tipeFilter;
            const matchProvinsi = !provinsiFilter || item.provinsi === provinsiFilter;
            return matchTipe && matchProvinsi;
        });
    }, [submissions, tipeFilter, provinsiFilter]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            // Cari submission untuk dinas ini
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            
            // Jika submission tidak ketemu, skip filter ini (tampilkan data)
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all';
            
            // Match tipe
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            
            // Match provinsi (ambil dari submission, bukan dari item)
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            
            return matchTipe && matchProvinsi;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed]);

    // Pagination untuk submissions
    const paginatedSubmissions = useMemo(() => {
        if (itemsPerPage === 'all') return filteredSubmissions;
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSubmissions.slice(start, start + itemsPerPage);
    }, [filteredSubmissions, currentPage, itemsPerPage]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesSubmissions = itemsPerPage === 'all' ? 1 : Math.ceil(filteredSubmissions.length / itemsPerPage);
    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Handle penilaian selection change
    const handlePenilaianChange = async (penilaianId: number) => {
        const selected = penilaianList.find(p => p.id === penilaianId);
        if (!selected) return;
        
        setSelectedPenilaianId(penilaianId);
        setPenilaianSLHD(selected);
        setIsPanelOpen(false); // Tutup panel setelah memilih
        
        try {
            const parsedRes = await axios.get(`/api/pusdatin/penilaian/slhd/parsed/${penilaianId}`);
            setParsedData(parsedRes.data.data || []);
        } catch (err) {
            console.error('Error fetching parsed data:', err);
        }
    };

    // Download template
    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`/api/pusdatin/penilaian/slhd/template?year=${year}&tipe=${tipeFilter === 'all' ? 'kabupaten/kota' : tipeFilter}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Template_Penilaian_SLHD_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading template:', err);
            showToast('error', 'Gagal mengunduh template');
        }
    };

    // Upload file
    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (uploadCatatan) {
            formData.append('catatan', uploadCatatan);
        }

        try {
            setUploading(true);
            const response = await axios.post(`/api/pusdatin/penilaian/slhd/upload/${year}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            showToast('success', 'File berhasil diupload dan sedang diproses');
            setUploadCatatan(''); // Reset catatan
            fetchData(); // Refresh data
        } catch (err: any) {
            console.error('Error uploading file:', err);
            showToast('error', err.response?.data?.message || 'Gagal mengupload file');
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        if (!penilaianSLHD) return;
        
        try {
            setIsFinalizingLocal(true);
            await axios.patch(`/api/pusdatin/penilaian/slhd/finalize/${penilaianSLHD.id}`, {}, { timeout: 300000 });
            showToast('success', 'Penilaian SLHD berhasil difinalisasi');
            setShowConfirmModal(false);
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            showToast('error', err.response?.data?.message || 'Gagal memfinalisasi');
        } finally {
            setIsFinalizingLocal(false);
        }
    };

    // Helper: Keterangan Lulus/Tidak Lulus
    const getKeterangan = (totalSkor: number | null) => {
        if (totalSkor === null) return '-';
        return totalSkor >= 60 ? 'Lulus' : 'Tidak Lulus';
    };

    const getKeteranganColor = (totalSkor: number | null) => {
        if (totalSkor === null) return 'text-gray-400';
        return totalSkor >= 60 ? 'text-green-600' : 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* BAGIAN 1: FILTER & TABEL KELAYAKAN ADMINISTRASI */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">Kelayakan Administrasi Dokumen</h2>
                    {onRefreshSubmissions && (
                        <button
                            onClick={onRefreshSubmissions}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                            title="Refresh data kelayakan"
                        >
                            <FaSyncAlt className="text-sm" />
                            Refresh
                        </button>
                    )}
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe Daerah</label>
                        <select 
                            value={tipeFilter}
                            onChange={(e) => {
                                setTipeFilter(e.target.value as any);
                                setCurrentPage(1);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="provinsi">Provinsi</option>
                            <option value="kabupaten/kota">Kabupaten/Kota</option>
                        </select>
                    </div>
                    <div className="w-64">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                        <select 
                            value={provinsiFilter}
                            onChange={(e) => {
                                setProvinsiFilter(e.target.value);
                                setCurrentPage(1);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Provinsi</option>
                            {provinsiList.map(prov => (
                                <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tampilkan</label>
                        <select 
                            value={itemsPerPage === 'all' ? 'all' : itemsPerPage.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setItemsPerPage(val === 'all' ? 'all' : parseInt(val));
                                setCurrentPage(1);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                {/* Tabel Administrasi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">No</th>
                                    <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                                    {/* <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Tipe</th> */}
                                    {/* <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">Aksi</th> */}
                                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Buku I</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Buku II</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Buku III</th>
                                    <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">Tabel Utama</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500">
                                            Tidak ada data submission
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSubmissions.map((item, index) => (
                                        <tr key={item.id_dinas} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {itemsPerPage === 'all' ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-gray-800">{item.nama_dinas}</td>
                                            {/* <td className="py-3 px-4 text-sm text-gray-600 capitalize">{item.tipe}</td> */}
                                            {/* <td className="py-3 px-4 text-sm">
                                                <a 
                                                    href={`/pusdatin-dashboard/submission/${item.id_dinas}`}
                                                    className="text-green-600 hover:underline text-xs font-medium"
                                                >
                                                    Lihat Dokumen
                                                </a>
                                            </td> */}
                                            <td className="py-3 px-4 text-center text-xl">
                                                {item.buku1_status === 'approved' ? (
                                                    <MdCheckBox className="inline text-green-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank className="inline text-gray-300" />
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center text-xl">
                                                {item.buku2_status === 'approved' ? (
                                                    <MdCheckBox className="inline text-green-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank className="inline text-gray-300" />
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center text-xl">
                                                {item.buku3_status === 'approved' ? (
                                                    <MdCheckBox className="inline text-green-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank className="inline text-gray-300" />
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center text-xl">
                                                {item.tabel_status === 'finalized' ? (
                                                    <MdCheckBox className="inline text-green-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank className="inline text-gray-300" />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info & Pagination Administrasi */}
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Menampilkan {paginatedSubmissions.length} dari {filteredSubmissions.length} data
                    </div>
                    {itemsPerPage !== 'all' && totalPagesSubmissions > 1 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 text-sm">
                                {currentPage} / {totalPagesSubmissions}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPagesSubmissions, p + 1))}
                                disabled={currentPage === totalPagesSubmissions}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* BAGIAN 2: TOMBOL DOWNLOAD & UPLOAD */}
            <div>
                 <div>
                        <h2 className="text-lg font-bold text-gray-800">Penilaian SLHD</h2>
                        {penilaianSLHD && (
                            <p className="text-sm text-gray-500 mt-1">
                                Status: <span className={penilaianSLHD.is_finalized ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                                    {penilaianSLHD.is_finalized ? '🔒 Sudah Finalisasi' : '📝 Draft'}
                                </span>
                            </p>
                        )}
                    </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaFileExcel className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Unduh Template Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Silahkan unduh template excel, isi nilai, dan unggah kembali ke sistem.
                        </p>
                        <button 
                            onClick={handleDownloadTemplate}
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <FaFileExcel /> Unduh Template Excel Penilaian SLHD
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaCloudUploadAlt className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Upload File Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Pastikan file yang diunggah sudah sesuai dengan template yang disediakan.
                        </p>
                        
                        {/* Input Catatan */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Catatan Upload (Opsional)
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Revisi 2, Update nilai BAB 3, dll..."
                                value={uploadCatatan}
                                onChange={(e) => setUploadCatatan(e.target.value)}
                                disabled={uploading || penilaianSLHD?.status === 'finalized'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                            />
                        </div>

                        <label className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                            uploading || penilaianSLHD?.status === 'finalized'
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}>
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin" /> Mengupload...
                                </>
                            ) : (
                                <>
                                    <FaCloudUploadAlt /> Upload File Excel Hasil Penilaian SLHD
                                </>
                            )}
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleUploadFile}
                                disabled={uploading || penilaianSLHD?.status === 'finalized'}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
                
            </div>

            {/* BAGIAN 3: TABEL HASIL PENILAIAN */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Hasil Penilaian</h3>
                </div>

                {/* Filter Independen untuk Hasil Penilaian */}
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                    <div className="w-48">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe Daerah</label>
                        <select 
                            value={tipeFilterParsed}
                            onChange={(e) => {
                                const val = e.target.value as 'all' | 'provinsi' | 'kabupaten/kota';
                                setTipeFilterParsed(val);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="provinsi">Provinsi</option>
                            <option value="kabupaten/kota">Kabupaten/Kota</option>
                        </select>
                    </div>
                    <div className="w-64">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                        <select 
                            value={provinsiFilterParsed}
                            onChange={(e) => {
                                setProvinsiFilterParsed(e.target.value);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Provinsi</option>
                            {provinsiList.map(prov => (
                                <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tampilkan</label>
                        <select 
                            value={itemsPerPageParsed === 'all' ? 'all' : itemsPerPageParsed.toString()}
                            onChange={(e) => {
                                const val = e.target.value;
                                setItemsPerPageParsed(val === 'all' ? 'all' : parseInt(val));
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">Semua</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
                
                {/* Button untuk membuka panel pilih versi penilaian */}
                {penilaianList.length > 0 && !isPanelOpen && (
                    <div className="mb-6">
                        <button
                            onClick={() => setIsPanelOpen(true)}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-lg font-bold">Pilih Versi Penilaian</p>
                                    <p className="text-xs text-green-100">Klik untuk melihat {penilaianList.length} versi penilaian yang tersedia</p>
                                </div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                )}

                {/* Floating Card untuk Pilih Versi Penilaian */}
                {penilaianList.length > 0 && isPanelOpen && (
                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Pilih Versi Penilaian</h3>
                                    <p className="text-xs text-gray-500">Pilih versi hasil penilaian SLHD yang ingin ditampilkan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {penilaianSLHD?.is_finalized && <FinalizedBadge />}
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                                    title="Tutup panel"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {penilaianList.map((p, idx) => {
                                const uploadDate = new Date(p.uploaded_at);
                                const tanggal = uploadDate.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                                const waktu = uploadDate.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                // const uploaderName = p.uploaded_by?.name || 'Unknown User';
                                const uploaderEmail = p.uploaded_by?.email || '-';
                                const catatan = p.catatan || 'Tanpa catatan khusus';
                                const isSelected = selectedPenilaianId === p.id;
                                const isLocked = penilaianSLHD?.is_finalized && !isSelected;
                                
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => !isLocked && handlePenilaianChange(p.id)}
                                        disabled={isLocked}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                            isSelected
                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                : isLocked
                                                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                                                        Versi #{penilaianList.length - idx}
                                                    </span>
                                                    {p.is_finalized && (
                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                                            <FaLock className="text-[10px]" /> Finalized
                                                        </span>
                                                    )}
                                                    {isSelected && (
                                                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">📅 Tanggal Upload</p>
                                                        <p className="text-sm font-medium text-gray-700">{tanggal}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">🕐 Waktu</p>
                                                        <p className="text-sm font-medium text-gray-700">{waktu} WIB</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">👤 Diupload Oleh</p>
                                                        {/* <p className="text-sm font-medium text-gray-700">{uploaderName}</p> */}
                                                        <p className="text-xs text-gray-400">{uploaderEmail}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">📝 Catatan</p>
                                                        <p className="text-sm font-medium text-gray-700 italic">{catatan}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="flex-shrink-0">
                                                    <div className="bg-green-500 rounded-full p-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* BAGIAN 3: TABEL HASIL PENILAIAN */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-gray-700 uppercase">No</th>
                                    <th className="py-3 px-3 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB I</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB II</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB III</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB IV</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">BAB V</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">Total Skor</th>
                                    <th className="py-3 px-3 text-center text-xs font-bold text-gray-700 uppercase">Keterangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada hasil penilaian. Silakan upload file excel penilaian.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item, index) => {
                                        const bab2Avg = getBab2Avg(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="py-3 px-3 text-sm text-gray-600">
                                                    {itemsPerPageParsed === 'all' ? index + 1 : (currentPageParsed - 1) * (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10) + index + 1}
                                                </td>
                                                <td className="py-3 px-3 text-sm font-medium text-gray-800">{item.nama_dinas}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_1 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{bab2Avg?.toFixed(1) ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_3 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_4 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm text-gray-600">{item.Bab_5 ?? '-'}</td>
                                                <td className="py-3 px-3 text-center text-sm font-bold text-gray-800">
                                                    {item.Total_Skor?.toFixed(2) ?? '-'}
                                                </td>
                                                <td className={`py-3 px-3 text-center text-sm font-semibold ${getKeteranganColor(item.Total_Skor)}`}>
                                                    {getKeterangan(item.Total_Skor)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info & Pagination Hasil Penilaian */}
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                        Menampilkan {paginatedParsed.length} dari {filteredParsed.length} data
                    </div>
                    {itemsPerPageParsed !== 'all' && totalPagesParsed > 1 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPageParsed(p => Math.max(1, p - 1))}
                                disabled={currentPageParsed === 1}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1 text-sm">
                                {currentPageParsed} / {totalPagesParsed}
                            </span>
                            <button
                                onClick={() => setCurrentPageParsed(p => Math.min(totalPagesParsed, p + 1))}
                                disabled={currentPageParsed === totalPagesParsed}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>

            </div>

            {/* BAGIAN 4: TOMBOL FINALISASI DI BAWAH */}
            {penilaianSLHD && !penilaianSLHD.is_finalized && parsedData.length > 0 && (
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <FaLock /> Finalisasi Penilaian SLHD
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Finalisasi Penilaian SLHD"
                message="Apakah Anda yakin ingin memfinalisasi penilaian SLHD? Setelah difinalisasi, data tidak dapat diubah dan versi penilaian akan terkunci."
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                type="warning"
                onConfirm={handleFinalize}
                onCancel={() => setShowConfirmModal(false)}
                isLoading={isFinalizingLocal}
            />
        </div>
    );
}

// --- KOMPONEN TAB PENILAIAN PENGHARGAAN ---
function TabPenilaianPenghargaan({ provinsiList, submissions }: TabProps) {
    const { showToast } = useToast();
    const [parsedData, setParsedData] = useState<ParsedPenghargaan[]>([]);
    const [penilaianPenghargaan, setPenilaianPenghargaan] = useState<PenilaianPenghargaan | null>(null);
    const [penilaianList, setPenilaianList] = useState<PenilaianPenghargaan[]>([]);
    const [selectedPenilaianId, setSelectedPenilaianId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadCatatan, setUploadCatatan] = useState('');
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    
    // Filter independen untuk hasil penilaian
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>('all' as const);
    
    // State untuk floating panel
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isFinalizingLocal, setIsFinalizingLocal] = useState(false);

    const year = new Date().getFullYear();

    // Fetch Penghargaan penilaian data only (provinces & submissions dari props)
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const penilaianRes = await axios.get(`/api/pusdatin/penilaian/penghargaan/${year}`);
            
            const penilaianData = penilaianRes.data.data;
            if (penilaianData && penilaianData.length > 0) {
                setPenilaianList(penilaianData);
                const latestPenilaian = penilaianData[0];
                setPenilaianPenghargaan(latestPenilaian);
                setSelectedPenilaianId(latestPenilaian.id);
                // Fetch parsed data jika ada penilaian
                const parsedRes = await axios.get(`/api/pusdatin/penilaian/penghargaan/parsed/${latestPenilaian.id}`);
                setParsedData(parsedRes.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all';
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            return matchTipe && matchProvinsi;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Handle penilaian selection change
    const handlePenilaianChange = async (penilaianId: number) => {
        const selected = penilaianList.find(p => p.id === penilaianId);
        if (!selected) return;
        
        setSelectedPenilaianId(penilaianId);
        setPenilaianPenghargaan(selected);
        setIsPanelOpen(false); // Tutup panel setelah memilih
        
        try {
            const parsedRes = await axios.get(`/api/pusdatin/penilaian/penghargaan/parsed/${penilaianId}`);
            setParsedData(parsedRes.data.data || []);
        } catch (err) {
            console.error('Error fetching parsed data:', err);
        }
    };

    // Download template
    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`/api/pusdatin/penilaian/penghargaan/template/${year}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Template_Penilaian_Penghargaan_${year}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            console.error('Error downloading template:', err);
            const errorMsg = err.response?.data?.message || 'Gagal mengunduh template. Pastikan penilaian SLHD sudah difinalisasi.';
            showToast('error', errorMsg);
        }
    };

    // Upload file
    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        if (uploadCatatan) {
            formData.append('catatan', uploadCatatan);
        }

        try {
            setUploading(true);
            await axios.post(`/api/pusdatin/penilaian/penghargaan/upload/${year}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            showToast('success', 'File berhasil diupload dan sedang diproses');
            setUploadCatatan('');
            fetchData();
        } catch (err: any) {
            console.error('Error uploading file:', err);
            showToast('error', err.response?.data?.message || 'Gagal mengupload file');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        if (!penilaianPenghargaan) return;

        try {
            setIsFinalizingLocal(true);
            await axios.patch(`/api/pusdatin/penilaian/penghargaan/finalize/${penilaianPenghargaan.id}`, {}, { timeout: 300000 });
            showToast('success', 'Penilaian Penghargaan berhasil difinalisasi');
            setShowConfirmModal(false);
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            showToast('error', err.response?.data?.message || 'Gagal memfinalisasi');
        } finally {
            setIsFinalizingLocal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* BAGIAN 1: DOWNLOAD & UPLOAD */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Penilaian Penghargaan</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaFileExcel className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Unduh Template Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Silahkan unduh template excel, isi nilai, dan unggah kembali ke sistem.
                        </p>
                        <button 
                            onClick={handleDownloadTemplate}
                            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                        >
                            <FaFileExcel /> Unduh Template Excel Penilaian Penghargaan
                        </button>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                            <FaCloudUploadAlt className="text-xl" />
                            <h3 className="font-semibold text-gray-800">Upload File Excel</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Pastikan file yang diunggah sudah sesuai dengan template yang disediakan.
                        </p>
                        
                        {/* Input Catatan */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Catatan Upload (Opsional)
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Revisi 2, Update nilai Adipura, dll..."
                                value={uploadCatatan}
                                onChange={(e) => setUploadCatatan(e.target.value)}
                                disabled={uploading || penilaianPenghargaan?.status === 'finalized'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                            />
                        </div>

                        <label className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                            uploading || penilaianPenghargaan?.status === 'finalized'
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}>
                            {uploading ? (
                                <>
                                    <FaSpinner className="animate-spin" /> Mengupload...
                                </>
                            ) : (
                                <>
                                    <FaCloudUploadAlt /> Upload File Excel Hasil Penilaian Penghargaan
                                </>
                            )}
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleUploadFile}
                                disabled={uploading || penilaianPenghargaan?.status === 'finalized'}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Status Info */}
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Hasil Penilaian Penghargaan</h2>
                    {penilaianPenghargaan && (
                        <p className="text-sm text-gray-500 mt-1">
                            Status: <span className={penilaianPenghargaan.is_finalized ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                                {penilaianPenghargaan.is_finalized ? '🔒 Sudah Finalisasi' : '📝 Draft'}
                            </span>
                        </p>
                    )}
                </div>
                
                {/* Button untuk membuka panel pilih versi penilaian */}
                {penilaianList.length > 0 && !isPanelOpen && (
                    <div className="mb-6">
                        <button
                            onClick={() => setIsPanelOpen(true)}
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <p className="text-lg font-bold">Pilih Versi Penilaian</p>
                                    <p className="text-xs text-green-100">Klik untuk melihat {penilaianList.length} versi penilaian yang tersedia</p>
                                </div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                )}

                {/* Floating Card untuk Pilih Versi Penilaian */}
                {penilaianList.length > 0 && isPanelOpen && (
                    <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl shadow-lg p-6 mb-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Pilih Versi Penilaian</h3>
                                    <p className="text-xs text-gray-500">Pilih versi hasil penilaian penghargaan yang ingin ditampilkan</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {penilaianPenghargaan?.is_finalized && <FinalizedBadge />}
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                                    title="Tutup panel"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {penilaianList.map((p, idx) => {
                                const uploadDate = new Date(p.uploaded_at);
                                const tanggal = uploadDate.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                                const waktu = uploadDate.toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });
                                const uploaderEmail = p.uploaded_by?.email || '-';
                                const catatan = p.catatan || 'Tanpa catatan khusus';
                                const isSelected = selectedPenilaianId === p.id;
                                const isLocked = penilaianPenghargaan?.is_finalized && !isSelected;
                                
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => !isLocked && handlePenilaianChange(p.id)}
                                        disabled={isLocked}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                            isSelected
                                                ? 'border-green-500 bg-green-50 shadow-md'
                                                : isLocked
                                                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                    : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-sm font-bold ${isSelected ? 'text-green-700' : 'text-gray-700'}`}>
                                                        Versi #{penilaianList.length - idx}
                                                    </span>
                                                    {p.is_finalized && (
                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                                            <FaLock className="text-[10px]" /> Finalized
                                                        </span>
                                                    )}
                                                    {isSelected && (
                                                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">📅 Tanggal Upload</p>
                                                        <p className="text-sm font-medium text-gray-700">{tanggal}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">🕐 Waktu</p>
                                                        <p className="text-sm font-medium text-gray-700">{waktu} WIB</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">👤 Diupload Oleh</p>
                                                        <p className="text-xs text-gray-400">{uploaderEmail}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-0.5">📝 Catatan</p>
                                                        <p className="text-sm font-medium text-gray-700 italic">{catatan}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="flex-shrink-0">
                                                    <div className="bg-green-500 rounded-full p-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* BAGIAN 2: TABEL HASIL PENILAIAN */}
            <div className="space-y-4">
                {/* Filter Independen untuk Hasil Penilaian */}
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="w-56">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                        <select 
                            value={provinsiFilterParsed}
                            onChange={(e) => {
                                setProvinsiFilterParsed(e.target.value);
                                setCurrentPageParsed(1);
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua Provinsi</option>
                            {provinsiList.map(prov => (
                                <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setCurrentPageParsed(1)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Filter
                    </button>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-800">Tabel Penilaian Penghargaan</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Adipura</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Adiwiyata</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Proklim</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Proper</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Kalpataru</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada hasil penilaian. Silakan upload file excel penilaian.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Adipura_Skor !== null ? item.Adipura_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Adiwiyata_Skor !== null ? item.Adiwiyata_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Proklim_Skor !== null ? item.Proklim_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Proper_Skor !== null ? item.Proper_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Kalpataru_Skor !== null ? item.Kalpataru_Skor : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm font-bold text-gray-800">
                                                {item.Total_Skor?.toFixed(1) ?? '-'}
                                                
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tombol Finalisasi */}
                {penilaianPenghargaan?.is_finalized ? (
                    <div className="flex justify-end">
                        <FinalizedBadge />
                    </div>
                ) : penilaianPenghargaan && parsedData.length > 0 && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <FaLock /> Finalisasi Penilaian Penghargaan
                        </button>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Finalisasi Penilaian Penghargaan"
                message="Apakah Anda yakin ingin memfinalisasi penilaian Penghargaan? Setelah difinalisasi, data tidak dapat diubah."
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                type="warning"
                onConfirm={handleFinalize}
                onCancel={() => setShowConfirmModal(false)}
                isLoading={isFinalizingLocal}
            />
        </div>
    );
}

// --- KOMPONEN TAB VALIDASI 1 ---
function TabValidasi1({ provinsiList, submissions }: TabProps) {
    const { showToast } = useToast();
    const [parsedData, setParsedData] = useState<ParsedValidasi1[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFinalized, setIsFinalized] = useState(false);
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    
    // Filter independen untuk hasil validasi
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [statusFilterParsed, setStatusFilterParsed] = useState<'all' | 'lulus' | 'tidak_lulus'>('all');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>('all' as const);

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isFinalizingLocal, setIsFinalizingLocal] = useState(false);

    const year = new Date().getFullYear();

    // Fetch Validasi 1 data only (provinces & submissions dari props)
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const validasi1Res = await axios.get(`/api/pusdatin/penilaian/validasi-1/${year}`);
            
            const validasi1Data = validasi1Res.data;
            if (validasi1Data && validasi1Data.length > 0) {
                setParsedData(validasi1Data);
                // Check if finalized (all items have status finalized or check from parent)
                const anyFinalized = validasi1Data.some((item: ParsedValidasi1) => item.status === 'finalized');
                setIsFinalized(anyFinalized);
            }
        } catch (err: any) {
            console.error('Error fetching data:', err);
            if (err.response?.status === 404) {
                setParsedData([]);
            }
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all' && statusFilterParsed === 'all';
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            const matchStatus = statusFilterParsed === 'all' || item.status_result === statusFilterParsed;
            return matchTipe && matchProvinsi && matchStatus;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed, statusFilterParsed]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Stats
    const totalLulus = parsedData.filter(item => item.status_result === 'lulus').length;
    const totalTidakLulus = parsedData.filter(item => item.status_result === 'tidak_lulus').length;

    // Finalisasi
    const handleFinalize = async () => {
        try {
            setIsFinalizingLocal(true);
            await axios.patch(`/api/pusdatin/penilaian/validasi-1/${year}/finalize`, {}, { timeout: 300000 });
            showToast('success', 'Validasi 1 berhasil difinalisasi');
            setShowConfirmModal(false);
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            showToast('error', err.response?.data?.message || 'Gagal memfinalisasi');
        } finally {
            setIsFinalizingLocal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="w-56">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                    <select 
                        value={provinsiFilterParsed}
                        onChange={(e) => {
                            setProvinsiFilterParsed(e.target.value);
                            setCurrentPageParsed(1);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Semua Provinsi</option>
                        {provinsiList.map(prov => (
                            <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setCurrentPageParsed(1)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Tabel Validasi 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Tabel Validasi 1</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-green-600 text-2xl" />
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai IKLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai Penghargaan</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai Total</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada data validasi. Pastikan Penilaian Penghargaan sudah difinalisasi.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Nilai_IKLH?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Nilai_Penghargaan?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {item.Total_Skor?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.status_result === 'lulus' 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {item.status_result === 'lulus' ? 'Lolos' : 'Tidak Lolos'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tombol Finalisasi */}
            {isFinalized ? (
                <div className="flex justify-end">
                    <FinalizedBadge />
                </div>
            ) : parsedData.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <FaLock /> Finalisasi Validasi 1
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Finalisasi Validasi 1"
                message="Apakah Anda yakin ingin memfinalisasi Validasi 1? Setelah difinalisasi, data tidak dapat diubah."
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                type="warning"
                onConfirm={handleFinalize}
                onCancel={() => setShowConfirmModal(false)}
                isLoading={isFinalizingLocal}
            />
        </div>
    );
}

// --- KOMPONEN TAB VALIDASI 2 ---
function TabValidasi2({ provinsiList, submissions }: TabProps) {
    const { showToast } = useToast();
    const [parsedData, setParsedData] = useState<ParsedValidasi2[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFinalized, setIsFinalized] = useState(false);
    const [currentPageParsed, setCurrentPageParsed] = useState(1);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    
    // Filter independen untuk hasil validasi
    const [tipeFilterParsed, setTipeFilterParsed] = useState<'all' | 'provinsi' | 'kabupaten/kota'>('all');
    const [provinsiFilterParsed, setProvinsiFilterParsed] = useState<string>('');
    const [statusFilterParsed, setStatusFilterParsed] = useState<'all' | 'lolos' | 'tidak_lolos' | 'pending'>('all');
    const [itemsPerPageParsed, setItemsPerPageParsed] = useState<number | 'all'>('all' as const);

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isFinalizingLocal, setIsFinalizingLocal] = useState(false);

    const year = new Date().getFullYear();

    // Fetch Validasi 2 data only (provinces & submissions dari props)
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/pusdatin/penilaian/validasi-2/${year}`);
            setParsedData(response.data || []);
            setIsFinalized(response.data.length > 0 && response.data[0]?.status === 'finalized');
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error('Error fetching data:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter parsed data (filter independen)
    const filteredParsed = useMemo(() => {
        return parsedData.filter(item => {
            const submission = submissions.find(s => s.id_dinas === item.id_dinas);
            if (!submission) return provinsiFilterParsed === '' && tipeFilterParsed === 'all' && statusFilterParsed === 'all';
            const matchTipe = tipeFilterParsed === 'all' || submission.tipe === tipeFilterParsed;
            const matchProvinsi = !provinsiFilterParsed || submission.provinsi === provinsiFilterParsed;
            const matchStatus = statusFilterParsed === 'all' || item.status_validasi === statusFilterParsed;
            return matchTipe && matchProvinsi && matchStatus;
        });
    }, [parsedData, submissions, tipeFilterParsed, provinsiFilterParsed, statusFilterParsed]);

    // Pagination untuk parsed (independen)
    const paginatedParsed = useMemo(() => {
        if (itemsPerPageParsed === 'all') return filteredParsed;
        const perPage = typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10;
        const start = (currentPageParsed - 1) * perPage;
        return filteredParsed.slice(start, start + perPage);
    }, [filteredParsed, currentPageParsed, itemsPerPageParsed]);

    const totalPagesParsed = itemsPerPageParsed === 'all' ? 1 : Math.ceil(filteredParsed.length / (typeof itemsPerPageParsed === 'number' ? itemsPerPageParsed : 10));

    // Stats
    const totalLolos = parsedData.filter(item => item.status_validasi === 'lolos').length;
    const totalTidakLolos = parsedData.filter(item => item.status_validasi === 'tidak_lolos').length;
    const totalPending = parsedData.filter(item => item.status_validasi === 'pending').length;

    // Handle checkbox change
    const handleCheckboxChange = async (id: number, field: 'Kriteria_WTP' | 'Kriteria_Kasus_Hukum', currentValue: boolean) => {
        if (isFinalized) {
            showToast('warning', 'Data sudah difinalisasi, tidak dapat diubah');
            return;
        }

        try {
            setUpdatingId(id);
            const item = parsedData.find(p => p.id === id);
            if (!item) return;

            const updatedData = {
                Kriteria_WTP: field === 'Kriteria_WTP' ? !currentValue : item.Kriteria_WTP,
                Kriteria_Kasus_Hukum: field === 'Kriteria_Kasus_Hukum' ? !currentValue : item.Kriteria_Kasus_Hukum
            };

            await axios.patch(`/api/pusdatin/penilaian/validasi-2/${id}/checklist`, updatedData);
            fetchData();
        } catch (err: any) {
            console.error('Error updating checklist:', err);
            showToast('error', err.response?.data?.message || 'Gagal mengupdate checklist');
        } finally {
            setUpdatingId(null);
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        try {
            setIsFinalizingLocal(true);
            await axios.post(`/api/pusdatin/penilaian/validasi-2/${year}/finalize`, {}, { timeout: 300000 });
            showToast('success', 'Validasi 2 berhasil difinalisasi');
            setShowConfirmModal(false);
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            showToast('error', err.response?.data?.message || 'Gagal memfinalisasi');
        } finally {
            setIsFinalizingLocal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="w-56">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
                    <select 
                        value={provinsiFilterParsed}
                        onChange={(e) => {
                            setProvinsiFilterParsed(e.target.value);
                            setCurrentPageParsed(1);
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="">Semua Provinsi</option>
                        {provinsiList.map(prov => (
                            <option key={prov.id} value={prov.nama_region}>{prov.nama_region}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => setCurrentPageParsed(1)}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Tabel Validasi 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Tabel Validasi 2</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-green-600 text-2xl" />
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Total Skor</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Dokumen WTP</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Tidak tersangkut kasus hukum</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paginatedParsed.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            {parsedData.length === 0 
                                                ? 'Belum ada data validasi 2. Pastikan Validasi 1 sudah difinalisasi.' 
                                                : 'Tidak ada data yang sesuai dengan filter'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedParsed.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {Number(item.Total_Skor)?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.Kriteria_WTP}
                                                    onChange={() => handleCheckboxChange(item.id, 'Kriteria_WTP', item.Kriteria_WTP)}
                                                    disabled={isFinalized || updatingId === item.id}
                                                    className="w-5 h-5 text-green-600 cursor-pointer disabled:cursor-not-allowed rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={item.Kriteria_Kasus_Hukum}
                                                    onChange={() => handleCheckboxChange(item.id, 'Kriteria_Kasus_Hukum', item.Kriteria_Kasus_Hukum)}
                                                    disabled={isFinalized || updatingId === item.id}
                                                    className="w-5 h-5 text-green-600 cursor-pointer disabled:cursor-not-allowed rounded"
                                                />
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    item.status_validasi === 'lolos' 
                                                        ? 'bg-green-100 text-green-600' 
                                                        : item.status_validasi === 'tidak_lolos'
                                                        ? 'bg-red-100 text-red-600'
                                                        : 'bg-yellow-100 text-yellow-600'
                                                }`}>
                                                    {item.status_validasi === 'lolos' ? 'Lolos' : item.status_validasi === 'tidak_lolos' ? 'Tidak Lolos' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tombol Finalisasi */}
            {isFinalized ? (
                <div className="flex justify-end">
                    <FinalizedBadge />
                </div>
            ) : parsedData.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <FaLock /> Finalisasi Validasi 2
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Finalisasi Validasi 2"
                message="Apakah Anda yakin ingin memfinalisasi Validasi 2? Setelah difinalisasi, data tidak dapat diubah."
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                type="warning"
                onConfirm={handleFinalize}
                onCancel={() => setShowConfirmModal(false)}
                isLoading={isFinalizingLocal}
            />
        </div>
    );
}

// --- KOMPONEN TAB PENETAPAN PERINGKAT ---
function TabPenetapanPeringkat() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [rankedData, setRankedData] = useState<RankedData[]>([]);
    const [selectedKategori, setSelectedKategori] = useState<string>('');
    const [selectedJenisPeringkat, setSelectedJenisPeringkat] = useState<string>('top5');
    const [topN, setTopN] = useState<number>(5);
    const [isCreatingWawancara, setIsCreatingWawancara] = useState(false);

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const year = new Date().getFullYear();

    const kategoriOptions = [
        { value: '', label: 'Pilih Jenis DLH' },
        { value: 'provinsi', label: 'Provinsi' },
        { value: 'kabupaten_besar', label: 'Kabupaten Besar' },
        { value: 'kabupaten_sedang', label: 'Kabupaten Sedang' },
        { value: 'kabupaten_kecil', label: 'Kabupaten Kecil' },
        { value: 'kota_besar', label: 'Kota Besar' },
        { value: 'kota_sedang', label: 'Kota Sedang' },
        { value: 'kota_kecil', label: 'Kota Kecil' },
    ];

    const jenisPeringkatOptions = [
        { value: 'top5', label: 'Top 5' },
        { value: 'top10', label: 'Top 10' },
        { value: 'custom', label: 'Custom' },
        { value: 'all', label: 'Semua' },
    ];

    // Fetch ranked data
    const fetchRankedData = useCallback(async () => {
        if (!selectedKategori) {
            setRankedData([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`/api/pusdatin/penilaian/validasi-2/${year}/ranked`, {
                params: { kategori: selectedKategori, top: selectedJenisPeringkat === 'all' ? 999 : topN }
            });
            setRankedData(response.data.data || []);
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error('Error fetching ranked data:', err);
            }
            setRankedData([]);
        } finally {
            setLoading(false);
        }
    }, [year, selectedKategori, selectedJenisPeringkat, topN]);

    useEffect(() => {
        fetchRankedData();
    }, [fetchRankedData]);

    // Update topN based on jenis peringkat
    useEffect(() => {
        if (selectedJenisPeringkat === 'top5') setTopN(5);
        else if (selectedJenisPeringkat === 'top10') setTopN(10);
        else if (selectedJenisPeringkat === 'custom' && topN === 5) setTopN(1); // Set default for custom
        // Don't change topN for 'all' or when custom value is already set
    }, [selectedJenisPeringkat]);

    // Create wawancara (finalisasi ranking)
    const handleCreateWawancara = async () => {
        try {
            setIsCreatingWawancara(true);
            await axios.post(`/api/pusdatin/penilaian/validasi-2/${year}/create-wawancara`, {
                top: topN
            }, { timeout: 300000 });
            showToast('success', 'Penetapan peringkat berhasil difinalisasi. Data peserta wawancara telah dibuat.');
            setShowConfirmModal(false);
        } catch (err: any) {
            console.error('Error creating wawancara:', err);
            showToast('error', err.response?.data?.message || 'Gagal membuat data wawancara');
        } finally {
            setIsCreatingWawancara(false);
        }
    };

    // Get medal emoji
    const getMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 items-end">
                <div className="w-56">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Pembagian Daerah</label>
                    <select 
                        value={selectedKategori}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {kategoriOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="w-48">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis Peringkat</label>
                    <select 
                        value={selectedJenisPeringkat}
                        onChange={(e) => setSelectedJenisPeringkat(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {jenisPeringkatOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                {selectedJenisPeringkat === 'custom' && (
                    <div className="w-32">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Jumlah Top</label>
                        <input
                            type="number"
                            min="1"
                            max="999"
                            value={topN}
                            onChange={(e) => setTopN(Math.max(1, Math.min(999, parseInt(e.target.value) || 1)))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Top N"
                        />
                    </div>
                )}
                <button
                    onClick={fetchRankedData}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Tabel Peringkat */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Tabel Peringkat</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <FaSpinner className="animate-spin text-green-600 text-2xl" />
                        <span className="ml-3 text-gray-600">Memuat data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Rank</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Nama Daerah</th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">Jenis DLH</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Nilai NT</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Kenaikan NT</th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {!selectedKategori ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            Silakan pilih Jenis DLH terlebih dahulu
                                        </td>
                                    </tr>
                                ) : rankedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-gray-500">
                                            Belum ada data peringkat untuk kategori ini
                                        </td>
                                    </tr>
                                ) : (
                                    rankedData.map((item) => (
                                        <tr key={item.id_dinas} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-sm text-gray-800">
                                                <span className="inline-flex items-center gap-1">
                                                    {getMedal(item.peringkat)} {item.peringkat}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm font-medium text-green-600 hover:underline cursor-pointer">
                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                                                {item.kategori.replace(/_/g, ' ')}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-800">
                                                {Number(item.Total_Skor)?.toFixed(1) ?? '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-green-600">
                                                +{((Number(item.Total_Skor) || 0) * 0.05).toFixed(1)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {item.peringkat <= topN && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                        Top {topN}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tombol Finalisasi */}
            {rankedData.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isCreatingWawancara}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isCreatingWawancara ? (
                            <>
                                <FaSpinner className="animate-spin" /> Memproses...
                            </>
                        ) : (
                            <>
                                <FaLock /> Finalisasi Penetapan Peringkat
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Finalisasi Penetapan Peringkat"
                message={`Apakah Anda yakin ingin memfinalisasi peringkat? Top ${topN} dari setiap kategori akan masuk ke tahap wawancara.`}
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                type="warning"
                onConfirm={handleCreateWawancara}
                onCancel={() => setShowConfirmModal(false)}
                isLoading={isCreatingWawancara}
            />
        </div>
    );
}

// --- KOMPONEN TAB WAWANCARA ---
function TabWawancara() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [wawancaraData, setWawancaraData] = useState<WawancaraData[]>([]);
    const [selectedKategori, setSelectedKategori] = useState<string>('');
    const [selectedDinas, setSelectedDinas] = useState<number | null>(null);
    const [currentDinasData, setCurrentDinasData] = useState<WawancaraData | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [rekapData, setRekapData] = useState<any>(null);
    const [loadingRekap, setLoadingRekap] = useState(false);
    const [inputValue, setInputValue] = useState<string>('');

    // Modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isFinalizingLocal, setIsFinalizingLocal] = useState(false);

    const year = new Date().getFullYear();

    const kategoriOptions = [
        { value: '', label: '-- Pilih Jenis DLH --' },
        { value: 'provinsi', label: 'Provinsi' },
        { value: 'kabupaten_besar', label: 'Kabupaten Besar' },
        { value: 'kabupaten_sedang', label: 'Kabupaten Sedang' },
        { value: 'kabupaten_kecil', label: 'Kabupaten Kecil' },
        { value: 'kota_besar', label: 'Kota Besar' },
        { value: 'kota_sedang', label: 'Kota Sedang' },
        { value: 'kota_kecil', label: 'Kota Kecil' },
    ];

    // Fetch wawancara data (all for dropdown)
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/pusdatin/penilaian/wawancara/${year}`);
            setWawancaraData(response.data.data || []);
            setIsFinalized(response.data.data?.[0]?.is_finalized || false);
        } catch (err: any) {
            if (err.response?.status !== 404) {
                console.error('Error fetching data:', err);
            }
            setWawancaraData([]);
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filter dinas berdasarkan kategori
    const filteredDinasOptions = useMemo(() => {
        if (!selectedKategori) return [];
        return wawancaraData.filter(d => d.kategori === selectedKategori);
    }, [wawancaraData, selectedKategori]);

    // Update current dinas when selection changes
    useEffect(() => {
        if (selectedDinas) {
            const dinas = wawancaraData.find(d => d.id === selectedDinas);
            setCurrentDinasData(dinas || null);
            setInputValue(dinas?.nilai_wawancara?.toString() ?? '');
        } else {
            setCurrentDinasData(null);
            setInputValue('');
        }
    }, [selectedDinas, wawancaraData]);

    // Fetch rekap when dinas is selected
    const fetchRekap = useCallback(async (idDinas: number) => {
        try {
            setLoadingRekap(true);
            const response = await axios.get(`/api/pusdatin/penilaian/rekap/${year}/dinas/${idDinas}`);
            setRekapData(response.data.data);
        } catch (err: any) {
            console.error('Error fetching rekap:', err);
            setRekapData(null);
        } finally {
            setLoadingRekap(false);
        }
    }, [year]);

    // Fetch rekap when dinas changes
    useEffect(() => {
        if (currentDinasData) {
            fetchRekap(currentDinasData.id_dinas);
        } else {
            setRekapData(null);
        }
    }, [currentDinasData, fetchRekap]);

    // Calculate nilai NT Final (90% SLHD + 10% wawancara)
    const nilaiNTFinal = useMemo(() => {
        if (!rekapData || !currentDinasData) return null;
        // Use nilai_slhd as base (90%)
        const nilaiSLHD = rekapData.nilai_slhd || 0;
        const nilaiWawancara = currentDinasData.nilai_wawancara || 0;
        // Formula: 90% nilaiSLHD + 10% nilaiWawancara
        return (nilaiSLHD * 0.9) + (nilaiWawancara * 0.1);
    }, [rekapData, currentDinasData]);

    // Update nilai wawancara
    const handleUpdateNilai = async () => {
        if (!currentDinasData) return;
        if (isFinalized) {
            showToast('warning', 'Data sudah difinalisasi, tidak dapat diubah');
            return;
        }

        const nilaiNum = parseFloat(inputValue);
        if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
            showToast('error', 'Nilai harus antara 0-100');
            setInputValue(currentDinasData.nilai_wawancara?.toString() ?? '');
            return;
        }

        try {
            setUpdatingId(currentDinasData.id);
            await axios.patch(`/api/pusdatin/penilaian/wawancara/${currentDinasData.id}/nilai`, {
                nilai_wawancara: nilaiNum
            });
            showToast('success', 'Nilai wawancara berhasil disimpan');
            await fetchData();
        } catch (err: any) {
            console.error('Error updating nilai:', err);
            showToast('error', err.response?.data?.message || 'Gagal mengupdate nilai');
            setInputValue(currentDinasData.nilai_wawancara?.toString() ?? '');
        } finally {
            setUpdatingId(null);
        }
    };

    // Finalisasi
    const handleFinalize = async () => {
        try {
            setIsFinalizingLocal(true);
            await axios.patch(`/api/pusdatin/penilaian/wawancara/${year}/finalize`, {}, { timeout: 300000 });
            showToast('success', 'Hasil wawancara berhasil difinalisasi. Nilai akhir telah dihitung.');
            setShowConfirmModal(false);
            fetchData();
        } catch (err: any) {
            console.error('Error finalizing:', err);
            showToast('error', err.response?.data?.message || 'Gagal memfinalisasi');
        } finally {
            setIsFinalizingLocal(false);
        }
    };

    // Stats untuk progress
    const progressStats = useMemo(() => {
        const total = wawancaraData.length;
        const sudahDinilai = wawancaraData.filter(d => d.nilai_wawancara !== null).length;
        const belumDinilai = total - sudahDinilai;
        return { total, sudahDinilai, belumDinilai };
    }, [wawancaraData]);

    // Group by kategori untuk tampilan list
    const groupedByKategori = useMemo(() => {
        const groups: Record<string, WawancaraData[]> = {};
        wawancaraData.forEach(item => {
            if (!groups[item.kategori]) groups[item.kategori] = [];
            groups[item.kategori].push(item);
        });
        return groups;
    }, [wawancaraData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <FaSpinner className="animate-spin text-green-600 text-3xl" />
                <span className="ml-3 text-gray-600">Memuat data...</span>
            </div>
        );
    }

    // Get kategori label
    const getKategoriLabel = (value: string) => {
        const opt = kategoriOptions.find(o => o.value === value);
        return opt?.label || value.replace(/_/g, ' ');
    };

    return (
        <div className="space-y-8">
            {/* BAGIAN 1: HEADER + PROGRESS STATS */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Penilaian Wawancara & Perhitungan Nirwasita Tantra Final</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Pilih kandidat dari daftar di bawah atau gunakan dropdown untuk menilai wawancara.
                    </p>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-9 gap-4 mb-6">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="text-3xl font-bold text-blue-700">{progressStats.total}</div>
                        <div className="text-sm text-green-600">Total Kandidat</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="text-3xl font-bold text-green-700">{progressStats.sudahDinilai}</div>
                        <div className="text-sm text-green-600">Sudah Dinilai</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <div className="text-3xl font-bold text-yellow-700">{progressStats.belumDinilai}</div>
                        <div className="text-sm text-green-600">Belum Dinilai</div>
                    </div>
                </div>
            </div>

            {/* BAGIAN 2: LIST KANDIDAT PER KATEGORI */}
            <div>
                <div className="pb-4 mb-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FaUsers className="text-green-600" /> Daftar Kandidat Wawancara
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Klik pada kandidat untuk langsung menilai</p>
                </div>

                {/* Grid of Category Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Object.entries(groupedByKategori).map(([kategori, items]) => {
                        const sudahDinilaiCount = items.filter(i => i.nilai_wawancara !== null).length;
                        const progress = (sudahDinilaiCount / items.length) * 100;
                        
                        return (
                            <div key={kategori} className="bg-green-50/60 backdrop-blur-sm rounded-2xl border border-green-200/50 overflow-hidden hover:shadow-lg transition-shadow">
                                {/* Card Header */}
                                <div className="px-4 py-3">
                                    <h4 className="font-semibold text-green-600 capitalize text-sm">{getKategoriLabel(kategori)}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-green-600">{sudahDinilaiCount}/{items.length} dinilai</span>
                                        <span className="text-xs font-bold text-green-600">{progress.toFixed(0)}%</span>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-2 h-1.5 bg-white/90 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-900 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                                
                                {/* Card Body - List DLH */}
                                <div className="p-3 max-h-[280px] overflow-y-auto">
                                    <div className="space-y-1.5">
                                        {items.map(item => {
                                            const sudahDinilai = item.nilai_wawancara !== null;
                                            const isSelected = selectedDinas === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => {
                                                        setSelectedKategori(item.kategori);
                                                        setSelectedDinas(item.id);
                                                    }}
                                                    className={`
                                                        w-full px-3 py-2.5 rounded-xl text-left text-sm transition-all
                                                        ${isSelected 
                                                            ? 'bg-green-600 text-white shadow-md scale-[1.02]' 
                                                            : sudahDinilai 
                                                                ? 'bg-white/80 text-green-800 hover:bg-white border border-green-200' 
                                                                : 'bg-yellow-40/80 text-orange-800 hover:bg-orange-100/80 border border-orange-200'
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            {sudahDinilai ? (
                                                                <FaCheckCircle className={`flex-shrink-0 ${isSelected ? 'text-green-200' : 'text-green-500'}`} />
                                                            ) : (
                                                                <span className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-orange-400 bg-white" />
                                                            )}
                                                            <span className="truncate font-medium">
                                                                {item.nama_dinas.replace('DLH ', '').replace('Dinas Lingkungan Hidup ', '')}
                                                            </span>
                                                        </div>
                                                        {sudahDinilai && (
                                                            <span className={`
                                                                flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full
                                                                ${isSelected ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'}
                                                            `}>
                                                                {Number(item.nilai_wawancara).toFixed(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* BAGIAN 2B: DROPDOWN ALTERNATIF (COLLAPSED) */}
            <details className="bg-green-50/40 rounded-xl border border-green-200/50 overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer hover:bg-green-100/50 transition-colors">
                    <span className="text-sm font-medium text-green-700 flex items-center gap-2">
                        <FaFilter className="text-green-500" /> Filter Alternatif (Dropdown)
                    </span>
                </summary>
                <div className="px-4 pb-4 pt-2">
                    <div className="flex flex-wrap gap-4">
                        {/* Dropdown 1: Jenis DLH */}
                        <div className="w-64">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis DLH</label>
                            <select 
                                value={selectedKategori}
                                onChange={(e) => {
                                    setSelectedKategori(e.target.value);
                                    setSelectedDinas(null);
                                }}
                                className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                            >
                                {kategoriOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dropdown 2: Pilih Dinas (conditional) */}
                        {selectedKategori && (
                            <div className="w-80">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Pilih Kab/Kota</label>
                                <select 
                                    value={selectedDinas || ''}
                                    onChange={(e) => setSelectedDinas(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full border border-green-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                                >
                                    <option value="">-- Pilih Kab/Kota --</option>
                                    {filteredDinasOptions.map(dinas => (
                                        <option key={dinas.id} value={dinas.id}>
                                            {dinas.nama_dinas} {dinas.nilai_wawancara !== null ? `(${Number(dinas.nilai_wawancara).toFixed(0)})` : '(Belum dinilai)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </details>

            {/* BAGIAN 3: FORM INPUT WAWANCARA - ALWAYS SHOW */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Penilaian Wawancara & Perhitungan Nirwasita Tantra Final</h3>
                </div>
                
                {/* Table Komponen Wawancara */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <table className="w-full">
                        <thead className="bg-green-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 uppercase">KOMPONEN</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">BOBOT</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">SKOR(0-100)</th>
                                <th className="py-3 px-4 text-center text-xs font-bold text-gray-700 uppercase">SKOR AKHIR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-800">Komponen Wawancara</td>
                                <td className="py-3 px-4 text-center text-sm text-teal-600 font-medium">10%</td>
                                <td className="py-3 px-4 text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onBlur={handleUpdateNilai}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUpdateNilai();
                                            }
                                        }}
                                        disabled={!currentDinasData || isFinalized || updatingId === currentDinasData?.id}
                                        className="w-24 px-2 py-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="/100"
                                    />
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-teal-600 font-medium">
                                    {currentDinasData?.nilai_wawancara 
                                        ? Number(currentDinasData.nilai_wawancara).toFixed(1) 
                                        : '0.0'}
                                </td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                                <td colSpan={3} className="py-3 px-4 text-sm text-gray-800 text-right">Total Skor Akhir Wawancara:</td>
                                <td className="py-3 px-4 text-center text-sm text-teal-600 font-bold">
                                    {currentDinasData?.nilai_wawancara 
                                        ? Number(currentDinasData.nilai_wawancara).toFixed(1) 
                                        : '0.0'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BAGIAN 4: RINGKASAN NILAI AKHIR - ALWAYS SHOW */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Ringkasan Nilai Akhir</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Info Dinas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 w-32">Nama Daerah</div>
                            <div className="text-sm font-semibold text-gray-800">
                                {currentDinasData?.nama_dinas || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 w-32">Jenis DLH</div>
                            <div className="text-sm font-semibold text-gray-800 capitalize">
                                {currentDinasData?.kategori?.replace(/_/g, ' ') || '-'}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 w-32">Tahun Penilaian</div>
                            <div className="text-sm font-semibold text-gray-800">{year}</div>
                        </div>
                    </div>

                    {/* Right: Nilai NT Final */}
                    <div className="flex items-center justify-center">
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center w-64">
                            <div className="text-sm text-gray-600 mb-2">Nilai NT Final</div>
                            <div className="text-5xl font-bold text-green-600">
                                {nilaiNTFinal !== null ? nilaiNTFinal.toFixed(1) : '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BAGIAN 5: RINCIAN SKOR PER TAHAP */}
            <div>
                <div className="pb-4 mb-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Rincian Skor per Tahap</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Penilaian SLHD */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Penilaian SLHD</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.nilai_slhd ? Number(rekapData.nilai_slhd).toFixed(0) : '-')}
                        </div>
                    </div>

                    {/* Penilaian Penghargaan */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Penilaian Penghargaan</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.nilai_penghargaan ? Number(rekapData.nilai_penghargaan).toFixed(0) : '-')}
                        </div>
                    </div>

                    {/* Validasi 1 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Validasi 1</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.lolos_validasi1 ? 'Lolos' : 'Tidak Lolos')}
                        </div>
                    </div>

                    {/* Validasi 2 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Validasi 2</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {loadingRekap ? '...' : (rekapData?.lolos_validasi2 ? 'Lolos' : 'Tidak Lolos')}
                        </div>
                    </div>

                    {/* Wawancara */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-500 mb-2">Wawancara</div>
                        <div className="text-2xl font-bold text-gray-800">
                            {currentDinasData?.nilai_wawancara ? Number(currentDinasData.nilai_wawancara).toFixed(0) : '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* BAGIAN 6: TOMBOL FINALISASI */}
            {isFinalized ? (
                <div className="flex justify-end">
                    <FinalizedBadge />
                </div>
            ) : wawancaraData.length > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={progressStats.belumDinilai > 0}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        title={progressStats.belumDinilai > 0 ? `Masih ada ${progressStats.belumDinilai} kandidat yang belum dinilai` : ''}
                    >
                        <FaLock /> Finalisasi Nilai Akhir
                    </button>
                    {progressStats.belumDinilai > 0 && (
                        <span className="ml-3 text-sm text-orange-600 self-center">
                            ⚠️ {progressStats.belumDinilai} kandidat belum dinilai
                        </span>
                    )}
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Finalisasi Hasil Wawancara"
                message="Apakah Anda yakin ingin memfinalisasi hasil wawancara? Setelah difinalisasi, nilai akhir akan dihitung dan data tidak dapat diubah."
                confirmText="Ya, Finalisasi"
                cancelText="Batal"
                type="warning"
                onConfirm={handleFinalize}
                onCancel={() => setShowConfirmModal(false)}
                isLoading={isFinalizingLocal}
            />
        </div>
    );
}

// --- HALAMAN UTAMA ---
export default function PenilaianPage() {
    const [activeTab, setActiveTab] = useState('slhd');
    const [progressStats, setProgressStats] = useState<any>(null);
    const [provinsiList, setProvinsiList] = useState<Province[]>([]);
    const [submissions, setSubmissions] = useState<DinasSubmission[]>([]);
    const [sharedDataLoading, setSharedDataLoading] = useState(true);
    
    // Track tab yang sudah pernah dibuka (untuk lazy loading)
    const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['slhd']));
    
    const year = new Date().getFullYear();

    // Handle tab change dengan lazy loading
    const handleTabChange = useCallback((tab: string) => {
        setActiveTab(tab);
        setVisitedTabs(prev => new Set([...prev, tab]));
    }, []);

    // Fungsi untuk refresh submissions saja (untuk update kelayakan administrasi)
    const refreshSubmissions = useCallback(async () => {
        try {
            const submissionsRes = await axios.get(`/api/pusdatin/penilaian/submissions?year=${year}`);
            setSubmissions(submissionsRes.data?.data || []);
        } catch (err) {
            console.error('Error refreshing submissions:', err);
        }
    }, [year]);

    // Fetch shared data ONCE (provinces + submissions + progress stats)
    useEffect(() => {
        const fetchSharedData = async () => {
            try {
                setSharedDataLoading(true);
                const [provincesRes, submissionsRes, progressRes] = await Promise.all([
                    axios.get('/api/wilayah/provinces'),
                    axios.get(`/api/pusdatin/penilaian/submissions?year=${year}`),
                    axios.get(`/api/pusdatin/penilaian/progress-stats?year=${year}`)
                ]);
                setProvinsiList(provincesRes.data?.data || []);
                setSubmissions(submissionsRes.data?.data || []);
                setProgressStats(progressRes.data.data);
            } catch (err) {
                console.error('Error fetching shared data:', err);
            } finally {
                setSharedDataLoading(false);
            }
        };
        fetchSharedData();
    }, [year]);

    // Generate dynamic progress data
    const progressData = useMemo(() => {
        if (!progressStats) {
            // Default loading state
            return [
                { stage: 'Tahap 1 (SLHD)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'slhd' },
                { stage: 'Tahap 2 (Penghargaan)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'penghargaan' },
                { stage: 'Tahap 3 (Validasi 1)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'validasi1' },
                { stage: 'Tahap 4 (Validasi 2)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'validasi2' },
                { stage: 'Tahap 5 (Wawancara)', progress: 0, detail: 'Memuat...', isCompleted: false, tabValue: 'wawancara' },
            ];
        }

        const { slhd, penghargaan, validasi1, validasi2, wawancara, total_dlh } = progressStats;

        return [
            {
                stage: 'Tahap 1 (SLHD)',
                progress: total_dlh > 0 ? Math.round((slhd.finalized / total_dlh) * 100) : 0,
                detail: slhd.is_finalized 
                    ? `Difinalisasi - ${slhd.finalized}/${total_dlh} DLH`
                    : `Terbuka - ${slhd.finalized}/${total_dlh} DLH`,
                isCompleted: slhd.is_finalized,
                tabValue: 'slhd'
            },
            {
                stage: 'Tahap 2 (Penghargaan)',
                progress: penghargaan.is_finalized ? 100: 0,
                detail: slhd.is_finalized
                    ? (penghargaan.is_finalized 
                        ? `Difinalisasi - ${penghargaan.finalized} DLH Lulus`
                        : `Terbuka - ${penghargaan.finalized}/${total_dlh} DLH`)
                    : 'Menunggu SLHD',
                isCompleted: penghargaan.is_finalized,
                tabValue: 'penghargaan'
            },
            {
                stage: 'Tahap 3 (Validasi 1)',
                progress: validasi1.is_finalized ? 100 : 0,
                detail: penghargaan.is_finalized
                    ? (validasi1.is_finalized
                        ? `Difinalisasi - Lulus: ${validasi1.lolos}/${validasi1.processed} DLH`
                        : `memproses ${validasi1.processed} DLH`)
                    : 'Menunggu Penghargaan',
                isCompleted: validasi1.is_finalized,
                tabValue: 'validasi1'
            },
            {
                stage: 'Tahap 4 (Validasi 2)',
                progress: validasi2.is_finalized ? 100 : (validasi2.processed > 0 ? Math.round((validasi2.checked / validasi2.processed  ) * 100) : 0),
                detail: validasi1.is_finalized
                    ? (validasi2.is_finalized
                        ? `Difinalisasi - Lulus: ${validasi2.lolos}/${validasi2.processed} DLH`
                        : `memproses: ${validasi2.checked}/${validasi2.processed} DLH`)
                    : 'Menunggu Validasi 1',
                isCompleted: validasi2.is_finalized,
                tabValue: 'validasi2'
            },
            {
                stage: 'Tahap 5 (Wawancara)',
                progress: wawancara.is_finalized ? 100 : (wawancara.with_nilai > 0 ? Math.round((wawancara.with_nilai / validasi2.lolos) * 100) : 0),
                detail: validasi2.is_finalized
                    ? (wawancara.is_finalized
                        ? `Selesai - ${wawancara.processed} DLH Diproses`
                        : `memproses: ${wawancara.with_nilai}/${validasi2.lolos} DLH`)
                    : 'Menunggu Validasi 2',
                isCompleted: wawancara.is_finalized,
                tabValue: 'wawancara'
            },
        ];
    }, [progressStats]);

    // KONFIGURASI TAB NAVIGASI
    const tabs = [
        { label: 'Penilaian SLHD', value: 'slhd' },
        { label: 'Penilaian Penghargaan', value: 'penghargaan' },
        { label: 'Validasi 1', value: 'validasi1' },
        { label: 'Validasi 2', value: 'validasi2' },
        { label: 'Penetapan Peringkat', value: 'peringkat' },
        { label: 'Wawancara', value: 'wawancara' },
    ];

    // RENDER KONTEN DINAMIS BERDASARKAN TAB AKTIF
    // Menggunakan conditional rendering dengan cache - tab yang sudah pernah dibuka tetap di-mount (hidden)
    const renderContent = () => {
        if (sharedDataLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <FaSpinner className="animate-spin text-green-600 text-3xl" />
                    <span className="ml-3 text-gray-600">Memuat data...</span>
                </div>
            );
        }
        
        return (
            <>
                {/* SLHD - selalu render karena default tab */}
                <div className={activeTab === 'slhd' ? 'block' : 'hidden'}>
                    <TabPenilaianSLHD provinsiList={provinsiList} submissions={submissions} onRefreshSubmissions={refreshSubmissions} />
                </div>
                
                {/* Penghargaan - lazy load */}
                {visitedTabs.has('penghargaan') && (
                    <div className={activeTab === 'penghargaan' ? 'block' : 'hidden'}>
                        <TabPenilaianPenghargaan provinsiList={provinsiList} submissions={submissions} />
                    </div>
                )}
                
                {/* Validasi 1 - lazy load */}
                {visitedTabs.has('validasi1') && (
                    <div className={activeTab === 'validasi1' ? 'block' : 'hidden'}>
                        <TabValidasi1 provinsiList={provinsiList} submissions={submissions} />
                    </div>
                )}
                
                {/* Validasi 2 - lazy load */}
                {visitedTabs.has('validasi2') && (
                    <div className={activeTab === 'validasi2' ? 'block' : 'hidden'}>
                        <TabValidasi2 provinsiList={provinsiList} submissions={submissions} />
                    </div>
                )}
                
                {/* Penetapan Peringkat - lazy load */}
                {visitedTabs.has('peringkat') && (
                    <div className={activeTab === 'peringkat' ? 'block' : 'hidden'}>
                        <TabPenetapanPeringkat />
                    </div>
                )}
                
                {/* Wawancara - lazy load */}
                {visitedTabs.has('wawancara') && (
                    <div className={activeTab === 'wawancara' ? 'block' : 'hidden'}>
                        <TabWawancara />
                    </div>
                )}
            </>
        );
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case 'slhd': return 'SLHD';
            case 'penghargaan': return 'Penghargaan';
            case 'validasi1': return 'Validasi 1';
            case 'validasi2': return 'Validasi 2';
            case 'peringkat': return 'Penetapan Peringkat';
            case 'wawancara': return 'Wawancara';
            default: return 'SLHD';
        }
    };

    return (
        <ToastProvider>
            <div className="space-y-6 pb-10 animate-fade-in">
                
                {/* BREADCRUMB */}
                <div className="flex items-center text-sm text-gray-500">
                    <span className="text-green-600 cursor-pointer hover:underline">Penilaian</span>
                    <span className="mx-2">&gt;</span>
                    <span className="font-medium text-gray-700">Penilaian Kab/Kota</span>
                </div>

                {/* HEADER UTAMA */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        Penilaian Nirwasita Tantra 
                    </h1>
                    <p className="text-sm text-gray-500">
                        Atur Penilaian Nilai Nirwasita Tantra dari Dokumen-Dokumen Kab/Kota.
                    </p>
                </div>

                {/* PROGRESS CARDS - Ringkasan Progres */}
                <div>
                    <h2 className="text-base font-bold text-gray-800 mb-4">Ringkasan Progres</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {progressData.map((item, index) => (
                            <div 
                                key={index}
                                onClick={() => handleTabChange(item.tabValue)}
                                className="cursor-pointer"
                            >
                                <ProgressCard
                                    stage={item.stage}
                                    progress={item.progress}
                                    detail={item.detail}
                                    isCompleted={item.isCompleted}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETAIL PENILAIAN & NAVIGASI */}
                <div>
                    <h2 className="text-base font-bold text-gray-800 mb-4">Detail Penilaian</h2>
                    
                    <InnerNav 
                        tabs={tabs} 
                        activeTab={activeTab} 
                        onChange={handleTabChange} 
                        activeColor="green"
                        className="mb-6"
                    />

                    {renderContent()}
                </div>
            </div>
        </ToastProvider>
    );
}
