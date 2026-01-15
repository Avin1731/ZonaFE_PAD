'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Pastikan import path ini sesuai dengan struktur project Anda
import UnderConstructionModal from '@/components/UnderConstructionModal'; 

export default function DetailPengirimanPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.back(); // Kembali ke halaman sebelumnya saat modal ditutup
  };

  return (
    <div className="p-6">
      {/* Konten dummy di background (opsional) */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Detail Pengiriman Data</h1>
      
      {/* Modal Under Construction */}
      <UnderConstructionModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Sedang Dalam Pengembangan"
        message="Fitur detail pengiriman data ini belum tersedia saat ini. Mohon kembali lagi nanti."
      />
    </div>
  );
}