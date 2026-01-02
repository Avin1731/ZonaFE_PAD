// src/app/(dashboard)/profile/page.tsx
"use client";
import { useAuth } from '@/context/AuthContext';
import ProfileCard, { Detail } from '@/components/ProfileCard'; 
import { User, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  // 1. AMBIL 'jenisDlhs' DARI CONTEXT
  const { user, loading, provinces, regencies, jenisDlhs } = useAuth();

  if (loading) {
    return <div className="text-center py-10">Memuat Profil...</div>;
  }

  if (!user) {
    return null; 
  }

  // Helper untuk mendapatkan nama wilayah
  const getProvinceName = (id: string | undefined) => provinces.find(p => p.id === id)?.name;
  const getRegencyName = (id: string | undefined) => regencies.find(r => r.id === id)?.name;
  // 2. BUAT HELPER BARU UNTUK JENIS DLH
  const getJenisDlhName = (id: number | undefined) => jenisDlhs.find(j => j.id === id)?.name;

  const roleName = user.role.name.toLowerCase();
  const title = 'Informasi Pengguna';
  let greeting = `Halo, ${user.name}`; // Greeting default
  const avatarInitial = user.name?.charAt(0).toUpperCase() || 'U';

  const statusBadge = 'Akun Aktif';

  const formatPhone = (phone: string | undefined) => {
    if (!phone) return 'N/A';
    // Format simpel untuk Indonesia (0812-3456-xxxx)
    return phone.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
  };

  let details: Detail[] = [];
  let editLink = '/profile/edit'; // Link default

  // --- Logika Profil Berdasarkan Role ---
  if (roleName === 'admin') {
    greeting = `Halo, Admin`;
    details = [
      { icon: User, label: 'Nama Lengkap', value: user.name },
      { icon: Briefcase, label: 'Peran Sistem', value: user.role.name },
      { icon: Mail, label: 'Email', value: user.email },
      { icon: Phone, label: 'Nomor Telepon', value: formatPhone(user.nomor_telepon) },
      { icon: MapPin, label: 'Wilayah Kerja', value: 'N/A (Tingkat Pusat)' },
    ];
    editLink = '/admin-dashboard/profile/edit';

  } else if (roleName === 'pusdatin') {
    greeting = `Halo, ${user.role.name}`;
    details = [
      { icon: User, label: 'Nama Lengkap', value: user.name },
      { icon: Briefcase, label: 'Peran Sistem', value: user.role.name },
      { icon: Mail, label: 'Email', value: user.email },
      { icon: Phone, label: 'Nomor Telepon', value: formatPhone(user.nomor_telepon) },
      { icon: MapPin, label: 'Wilayah Kerja', value: 'N/A (Tingkat Pusat)' },
    ];
    editLink = '/pusdatin-dashboard/profile/edit';

  } else if (roleName === 'dlh') {
    const provinceName = getProvinceName(user.province_id);
    const regencyName = getRegencyName(user.regency_id);

    // 3. PERBAIKAN: Gunakan helper 'getJenisDlhName' berdasarkan ID
    const jenisDlhName = getJenisDlhName(user.jenis_dlh_id) || 'N/A';

    greeting = `Halo, ${user.name}`;
    
    // 4. PERBAIKAN: Susun ulang urutan field agar logis
    details = [
      { icon: User, label: 'Nama DLH', value: user.name },
      { icon: Briefcase, label: 'Peran Sistem', value: user.role.name },
      { icon: Briefcase, label: 'Jenis DLH', value: jenisDlhName },
      { icon: Mail, label: 'Email', value: user.email },
      { icon: Phone, label: 'Nomor Telepon', value: formatPhone(user.nomor_telepon) },
      { icon: MapPin, label: 'Provinsi', value: provinceName || 'N/A' },
      // (Kab/Kota akan ditambahkan di bawah)
    ];

    // 5. PERBAIKAN: Cek 'jenisDlhName' (bukan relasi)
    if (jenisDlhName.toLowerCase().includes('kab-kota')) {
      details.push( // Tambahkan di akhir (setelah Provinsi)
        { icon: MapPin, label: 'Kabupaten/Kota', value: regencyName || 'N/A' }
      );
      editLink = '/dlh-dashboard/profile/edit';
    } else {
      editLink = '/dlh-dashboard/profile/edit';
    }

    // Tambahkan Pesisir di akhir
    details.push(
      { icon: MapPin, label: 'Wilayah Pesisir', value: user.pesisir }
    );
  }
  // --- Akhir Logika Konten ---

  const actions = (
    <Link 
      href={editLink}
      className="inline-block bg-[#00A86B] text-white font-bold py-2 px-4 rounded-lg hover:brightness-90 transition duration-300 shadow-sm"
    >
      Edit Profil
    </Link>
  );

  return (
    <ProfileCard
      title={title}
      details={details}
      actions={actions}
      statusBadge={statusBadge}
      greeting={greeting}
      avatarInitial={avatarInitial}
    />
  );
}