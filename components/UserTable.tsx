'use client';

import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa'; // Import FaTrash

// Tipe data khusus untuk TABEL (tidak bentrok dengan AuthContext)
export interface UserTableRow {
  id: number;
  name: string;
  email: string;
  role: string; // Role utama (Admin, Pusdatin, DLH)
  jenis_dlh?: string; // Jenis DLH (DLH Provinsi, DLH Kab-Kota)
  status: 'aktif' | 'pending';
  province?: string | null;
  regency?: string | null;
}

interface UserTableProps {
  users: UserTableRow[];
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onDelete?: (id: number) => void; // <-- 1. Tambah prop onDelete
  showLocation?: boolean;
  showDlhSpecificColumns?: boolean;
  isSubmitting?: boolean; 
}

export default function UserTable({
  users,
  onApprove,
  onReject,
  onDelete, // <-- 2. Ambil prop
  showLocation = false,
  showDlhSpecificColumns = false,
  isSubmitting = false, 
}: UserTableProps) {

  // ... (helper functions tetap sama) ...
  const getDisplayRole = (user: UserTableRow): string => {
    if (user.role === 'DLH' && user.jenis_dlh) {
      return user.jenis_dlh; 
    }
    return user.role; 
  };
  const isDlhProvinsi = (user: UserTableRow): boolean => {
    return user.role === 'DLH' && user.jenis_dlh === 'DLH Provinsi';
  };
  const shouldShowRegencyColumn = showLocation && (!showDlhSpecificColumns || users.some(u => !isDlhProvinsi(u)));
  const getRoleTheme = (role: string) => {
    switch(role.toLowerCase()) {
      case 'dlh': return { headerBg: 'bg-blue-200', rowBg: 'bg-blue-50', textColor: 'text-blue-600' };
      case 'pusdatin': return { headerBg: 'bg-green-200', rowBg: 'bg-green-50', textColor: 'text-green-600' };
      case 'admin': return { headerBg: 'bg-red-200', rowBg: 'bg-red-50', textColor: 'text-red-600' };
      default: return { headerBg: 'bg-gray-200', rowBg: 'bg-gray-50', textColor: 'text-gray-600' };
    }
  };

  // Cek apakah ada kolom aksi yang perlu ditampilkan
  const hasActions = (onApprove && onReject) || onDelete;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          
          <thead className="bg-green-100">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">NO</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Email</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Role</th>
              {showLocation && (
                <>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Provinsi</th>
                  {shouldShowRegencyColumn && (
                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Kab/Kota</th>
                  )}
                </>
              )}
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Status</th>
              
              {/* Tampilkan header Aksi jika ada action handler */}
              {hasActions && (
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Aksi</th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                
                <td className="py-4 px-6 text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="py-4 px-6 text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="py-4 px-6 text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                    user.role.toLowerCase() === 'pusdatin' 
                      ? 'bg-green-100 text-green-700'
                      : user.role.toLowerCase() === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {getDisplayRole(user)}
                  </span>
                </td>
                {showLocation && (
                  <>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {user.province ?? '-'}
                    </td>
                    {!isDlhProvinsi(user) && shouldShowRegencyColumn && (
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.regency ?? '-'}
                      </td>
                    )}
                  </>
                )}
                <td className="py-4 px-6 text-sm">
                  <span
                    className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                      user.status === 'aktif'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {user.status === 'aktif' ? 'Aktif' : 'Pending'}
                  </span>
                </td>

                {hasActions && (
                  <td className="py-4 px-6 text-sm">
                    <div className="flex gap-2 items-center">
                      
                      {/* Kasus Approve/Reject (Halaman Pending) */}
                      {(onApprove && onReject) && (
                        <>
                          <button
                            onClick={() => onApprove(user.id)}
                            disabled={isSubmitting} 
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            title="Terima User"
                          >
                            <FaCheck className="text-xs" />
                            Terima
                          </button>
                          
                          <button
                            onClick={() => onReject(user.id)}
                            disabled={isSubmitting} 
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            title="Tolak User"
                          >
                            <FaTimes className="text-xs" />
                            Tolak
                          </button>
                        </>
                      )}

                      {/* Kasus Delete Only (Halaman Settings/List) */}
                      {onDelete && (
                         <button
                            onClick={() => onDelete(user.id)}
                            disabled={isSubmitting} 
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                            title="Hapus User"
                          >
                            <FaTrash className="text-xs" />
                            Hapus
                          </button>
                      )}

                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}