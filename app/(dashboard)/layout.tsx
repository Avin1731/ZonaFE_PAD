"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ambil isLoading langsung dari Context
  const { user, isLoading } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. JANGAN LAKUKAN APA-APA SELAMA MASIH LOADING
    // Biarkan AuthContext menyelesaikan pengecekan localStorage dulu
    if (isLoading) return;

    // 2. JIKA LOADING SELESAI TAPI USER NULL -> TENDANG KE LOGIN
    if (!user) {
      console.log('❌ Unauthorized access (No User), redirecting...');
      router.push('/login');
      return;
    }

    // 3. CEK APAKAH USER SALAH KAMAR (Role Check)
    if (user?.role?.name) {
      const roleName = user.role.name.toLowerCase();
      
      let correctDashboard = null;
      if (roleName === 'admin') correctDashboard = '/admin-dashboard';
      else if (roleName === 'pusdatin') correctDashboard = '/pusdatin-dashboard';
      else if (roleName === 'provinsi' || roleName === 'kabupaten/kota') correctDashboard = '/dlh-dashboard';

      // Hanya redirect jika dashboard tujuan ada isinya dan URL sekarang salah
      if (correctDashboard && !pathname.startsWith(correctDashboard)) {
        console.log(`⚠️ User ${roleName} nyasar ke ${pathname}. Redirecting ke: ${correctDashboard}`);
        router.push(correctDashboard);
      }
    }

  }, [user, isLoading, router, pathname]);

  // --- TAMPILAN ---

  // 1. Tampilkan Loading Screen jika Context sedang bekerja
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium animate-pulse">Memuat Data Pengguna...</p>
        </div>
      </div>
    );
  }

  // 2. Jika Loading Selesai tapi User Kosong (Sedang proses redirect),
  // Jangan render children (agar tidak error akses property user)
  if (!user) {
    return null; 
  }

  // 3. User Valid -> Render Halaman
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>
    </div>
  );
}