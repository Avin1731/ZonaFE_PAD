'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import { AxiosError } from 'axios';
import UniversalModal from '@/components/UniversalModal';
import { HiArrowLeft, HiSave, HiUser, HiLockClosed, HiPhone, HiEye, HiEyeOff } from 'react-icons/hi';

export default function AddPusdatinPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toggle Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Unified Form State
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  });

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'success' as 'success' | 'warning' | 'danger',
    onConfirm: () => {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Client Side
    if (form.password !== form.passwordConfirm) {
      setModal({
        isOpen: true,
        title: 'Validasi Gagal',
        message: 'Konfirmasi password tidak cocok. Silakan periksa kembali.',
        variant: 'warning',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
      });
      return;
    }

    if (form.password.length < 8) {
        setModal({
          isOpen: true,
          title: 'Password Lemah',
          message: 'Password harus minimal 8 karakter.',
          variant: 'warning',
          onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
        });
        return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('/api/admin/users/pusdatin', {
        name: form.name,
        email: form.email,
        password: form.password,
        nomor_telepon: form.phone,
        role: 'pusdatin',
        status: 'aktif',
      });

      setModal({
        isOpen: true,
        title: 'Berhasil',
        message: 'Akun Pusdatin berhasil dibuat!',
        variant: 'success',
        onConfirm: () => router.push('/admin-dashboard/settings'),
      });

    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setModal({
        isOpen: true,
        title: 'Gagal Membuat Akun',
        message: err.response?.data?.message || 'Terjadi kesalahan sistem. Coba lagi nanti.',
        variant: 'danger',
        onConfirm: () => setModal(prev => ({ ...prev, isOpen: false })),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/admin-dashboard/settings" 
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
          >
            <HiArrowLeft className="mr-1.5 text-lg" />
            Kembali ke Daftar Akun
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tambah Akun Pusdatin</h1>
          <p className="text-gray-500 mt-2">Buat akun baru untuk anggota tim Pusat Data dan Informasi.</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Section 1: Informasi Dasar */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <HiUser className="text-green-600" /> Informasi Dasar
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon / HP</label>
                <div className="relative">
                  <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="0812xxxx"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Kantor</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="nama@instansi.go.id"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Keamanan */}
          <div className="p-8 bg-gray-50/30">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <HiLockClosed className="text-green-600" /> Keamanan Akun
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Input Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    minLength={8}
                    className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Minimal 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 focus:outline-none"
                  >
                    {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                  </button>
                </div>
              </div>

              {/* Input Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ulangi Password</label>
                <div className="relative">
                  <input
                    required
                    type={showConfirmPassword ? "text" : "password"}
                    name="passwordConfirm"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 pr-10 rounded-lg border focus:ring-2 focus:border-transparent outline-none transition-all ${
                      form.passwordConfirm && form.password !== form.passwordConfirm 
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-green-500'
                    }`}
                    placeholder="Ketik ulang password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                  </button>
                </div>
                {form.passwordConfirm && form.password !== form.passwordConfirm && (
                  <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-100 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <HiSave className="text-lg" />
                  <span>Simpan Akun</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <UniversalModal
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        showCancelButton={false}
        confirmLabel="OK"
        onConfirm={modal.onConfirm}
      />
    </div>
  );
}