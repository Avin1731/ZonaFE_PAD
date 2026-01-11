"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. JANGAN LAKUKAN APA-APA SELAMA MASIH LOADING
    if (isLoading) return;

    // 2. JIKA LOADING SELESAI TAPI USER NULL -> CEK SAFETY NET DULU
    if (!user) {
      // 🔥 SAFETY CHECK: Cek token di localStorage secara manual
      // Kadang AuthContext 'isLoading' sudah false, tapi state 'user' belum ter-set.
      // Kalau di localStorage ada token, berarti user SEBENARNYA login. JANGAN DIUSIR.
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      if (token) {
         console.log('⏳ State delay detected: Token exists but User state is null. Waiting for sync...');
         return; // JANGAN REDIRECT. Tunggu siklus render berikutnya.
      }

      // Kalau token beneran gak ada, baru tendang.
      console.log('❌ Unauthorized access (No User & No Token), redirecting...');
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

      if (correctDashboard && !pathname.startsWith(correctDashboard)) {
        console.log(`⚠️ User ${roleName} nyasar ke ${pathname}. Redirecting ke: ${correctDashboard}`);
        router.push(correctDashboard);
      }
    }

  }, [user, isLoading, router, pathname]);

  // --- TAMPILAN ---

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

  // Render null sebentar jika user kosong tapi token ada (kena safety check)
  if (!user) {
    return null; 
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <main className="flex-grow">
          {children}
        </main>
    </div>
  );
}