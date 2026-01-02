"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// Data dummy
const dummyDocs = [
  { name: 'DLH Provinsi A', type: 'Provinsi', date: '10 Nov 2025' },
  { name: 'DLH Kota B', type: 'Kab/Kota', date: '09 Nov 2025' },
  { name: 'DLH Kab C', type: 'Kab/Kota', date: '08 Nov 2025' },
];

export default function RejectedDocsTable() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Dokumen Ditolak</h3>
        <Link href="/pusdatin-dashboard/dokumen-ditolak" className="text-sm text-blue-600 hover:underline flex items-center">
          Lihat semua <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="overflow-y-auto max-h-[150px]"> {/* Dibuat lebih pendek */}
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="py-2 text-sm font-semibold text-gray-500">Nama DLH</th>
              <th className="py-2 text-sm font-semibold text-gray-500">Jenis</th>
              <th className="py-2 text-sm font-semibold text-gray-500">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dummyDocs.map((doc, index) => (
              <tr key={index}>
                <td className="py-3 text-sm font-medium text-gray-800">{doc.name}</td>
                <td className="py-3 text-sm text-gray-500">{doc.type}</td>
                <td className="py-3 text-sm text-gray-500">{doc.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}