'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaFileExcel, FaCloudUploadAlt } from 'react-icons/fa';
import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import Pagination from '@/components/Pagination'; // Pastikan path ini sesuai

// --- INTERFACES ---
interface SLHDData {
  id: number;
  name: string;
  buku1: boolean;
  buku2: boolean;
  tabel: boolean;
  nilaiBukuI: number;
  nilaiTabel: number;
  nilaiTotal: string;
}

// --- DATA DUMMY ---
const generateSLHDData = (): SLHDData[] => {
  return Array.from({ length: 45 }, (_, i) => {
    const nilaiBukuI = 70 + Math.floor(Math.random() * 25);
    const nilaiTabel = 70 + Math.floor(Math.random() * 25);
    const nilaiTotal = ((nilaiBukuI + nilaiTabel) / 2).toFixed(1);
    
    return {
      id: i + 1,
      name: `Kabupaten/Kota ${i + 1}`,
      buku1: Math.random() > 0.2,
      buku2: Math.random() > 0.3,
      tabel: Math.random() > 0.1,
      nilaiBukuI,
      nilaiTabel,
      nilaiTotal
    };
  });
};

const slhdData = generateSLHDData();

// --- KOMPONEN UTAMA ---
export default function TabPenilaianSLHD() {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageNilai, setCurrentPageNilai] = useState(1);
  const itemsPerPage = 10;

  // Pagination Logic untuk Tabel Administrasi
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return slhdData.slice(startIndex, endIndex);
  }, [currentPage]);

  // Pagination Logic untuk Tabel Nilai
  const paginatedDataNilai = useMemo(() => {
    const startIndex = (currentPageNilai - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return slhdData.slice(startIndex, endIndex);
  }, [currentPageNilai]);

  const totalPages = Math.ceil(slhdData.length / itemsPerPage);

  return (
    <div className="space-y-8">
      {/* BAGIAN 1: TABEL KELAYAKAN ADMINISTRASI */}
      <div>
        <div className="pb-4 mb-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Kelayakan Administrasi Dokumen</h2>
        </div>

        {/* Filter */}
        <div className="flex gap-4 mb-6 items-end">
          <div className="w-64">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Provinsi</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Pilih Provinsi</option>
              <option>Jawa Tengah</option>
              <option>DI Yogyakarta</option>
            </select>
          </div>
          <button className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
            Filter
          </button>
        </div>

        {/* Tabel Administrasi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Aksi</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Buku I</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Buku II</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Tabel Utama</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium bg-green-50 text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-sm bg-green-50">
                      {/* PERBAIKAN: Menggunakan Link untuk navigasi */}
                      <Link 
                        href="/pusdatin-dashboard/detail-pus" 
                        className="text-green-600 hover:underline text-xs font-medium"
                      >
                        Lihat Dokumen
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center bg-green-50 text-green-600 text-xl">
                      {item.buku1 ? <MdCheckBox /> : <MdCheckBoxOutlineBlank className="text-gray-300" />}
                    </td>
                    <td className="py-4 px-6 text-center bg-green-50 text-green-600 text-xl">
                      {item.buku2 ? <MdCheckBox /> : <MdCheckBoxOutlineBlank className="text-gray-300" />}
                    </td>
                    <td className="py-4 px-6 text-center bg-green-50 text-green-600 text-xl">
                      {item.tabel ? <MdCheckBox /> : <MdCheckBoxOutlineBlank className="text-gray-300" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Administrasi */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, slhdData.length)} dari {slhdData.length} data
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* BAGIAN 2: TOMBOL DOWNLOAD & UPLOAD */}
      <div>
        <div className="pb-4 mb-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Penilaian SLHD</h2>
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
            <button className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700">
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
            <button className="w-full bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-200">
              <FaCloudUploadAlt /> Upload File Excel Hasil Penilaian SLHD
            </button>
          </div>
        </div>

        {/* BAGIAN 3: TABEL HASIL PENILAIAN */}
        <div className="pb-4 mb-6 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Hasil Penilaian</h3>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-700 uppercase">Nama DLH</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai Buku I</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai Tabel Utama</th>
                  <th className="py-3 px-6 text-center text-xs font-bold text-gray-700 uppercase">Nilai Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedDataNilai.map((item) => (
                  <tr key={`nilai-${item.id}`} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium bg-green-50 text-gray-800">{item.name}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600 text-sm">{item.nilaiBukuI}</td>
                    <td className="py-4 px-6 text-center bg-green-50 text-gray-600 text-sm">{item.nilaiTabel}</td>
                    <td className="py-4 px-6 text-center font-bold bg-green-50 text-green-600 text-sm">{item.nilaiTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Hasil Penilaian */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Menampilkan {((currentPageNilai - 1) * itemsPerPage) + 1} - {Math.min(currentPageNilai * itemsPerPage, slhdData.length)} dari {slhdData.length} data
          </div>
          <Pagination
            currentPage={currentPageNilai}
            totalPages={totalPages}
            onPageChange={setCurrentPageNilai}
          />
        </div>
      </div>
    </div>
  );
}