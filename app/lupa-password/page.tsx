'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UnderConstructionModal from '@/components/UnderConstructionModal';

export default function LupaPasswordPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.back(); // Kembali ke halaman login/sebelumnya
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Konten placeholder di background */}
      <div className="text-center p-8 bg-white rounded shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Lupa Password</h1>
        <p className="text-gray-600">Halaman reset password.</p>
      </div>

      {/* Modal Under Construction */}
      <UnderConstructionModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Sedang Dalam Pengembangan"
        message="Fitur lupa password belum tersedia saat ini. Silakan hubungi admin jika Anda mengalami kendala login."
      />
    </div>
  );
}