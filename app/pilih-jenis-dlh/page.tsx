// src/app/pilih-jenis-dlh/page.tsx
import SintaFullLogo from '@/components/SintaFullLogo';
import RoleSelectionCard from '@/components/RoleSelectionCard';

export default function PilihJenisDlhPage() {
  // Definisikan data untuk card
  const buttons = [
    // UBAH HREF INI
    { name: 'DLH Provinsi', href: '/login?role=3&jenis=1' }, // role=3, jenis=1
    { name: 'DLH Kab/Kota', href: '/login?role=3&jenis=2' }, // role=3, jenis=2
  ];

  return (
    // ... (sisa kode layout <main> dan <SintaFullLogo> Anda) ...
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4 space-y-8" style={{/* ... style grid ... */}}>
      <div className="flex justify-center">
        <SintaFullLogo />
      </div>

      {/* Panggil komponen Card Reusable */}
      <RoleSelectionCard
        title="Pilih Jenis DLH Anda"
        subtitle="Silahkan pilih jenis peran Anda terlebih dahulu"
        buttons={buttons.map(btn => ({ text: btn.name, href: btn.href }))}
      />
    </main>
  );
}