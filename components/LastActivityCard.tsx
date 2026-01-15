'use client';

import { FaUserShield, FaUserTie, FaUserCog } from "react-icons/fa";

// ✅ FIX 1: Longgarkan tipe data (tambah '?' pada field yang mungkin null/undefined dari API)
// ✅ FIX 2: Tambahkan field 'catatan' yang sebelumnya error
export interface Log {
  id: number;
  user?: string; 
  role?: 'dlh' | 'pusdatin' | 'admin' | string; // Izinkan string biasa untuk safety
  action?: string;
  target?: string;
  catatan?: string; // Tambahan agar tidak error saat passing object
  time: string;
  status?: string;
  jenis_dlh?: 'provinsi' | 'kabkota' | string;
  province_name?: string;
  regency_name?: string;
}

interface LastActivityCardProps {
  logs: Log[];
  showDlhSpecificColumns?: boolean;
  theme?: 'slate' | 'blue' | 'green' | 'red';
}

export default function LastActivityCard({ 
  logs, 
  showDlhSpecificColumns = false, 
  theme = 'slate' 
}: LastActivityCardProps) {
  
  // Logic pewarnaan dinamis
  const getThemeColors = () => {
    switch (theme) {
      case 'blue': return { header: 'bg-blue-100', text: 'text-blue-800' };
      case 'green': return { header: 'bg-green-100', text: 'text-green-800' };
      case 'red': return { header: 'bg-red-100', text: 'text-red-800' };
      default: return { header: 'bg-slate-100', text: 'text-slate-800' };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          {/* ✅ FIX 3: Header warna dinamis mengikuti props theme */}
          <thead className={colors.header}>
            <tr>
              <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Waktu</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
              <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">Role</th>
              
              {showDlhSpecificColumns && (
                <>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Jenis DLH</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Provinsi</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kab/Kota</th>
                </>
              )}
              
              <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Aksi & Target</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  {/* Waktu */}
                  <td className="py-4 px-6 text-xs text-gray-500 font-medium align-top">
                    {new Date(log.time).toLocaleString('id-ID', { 
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>

                  {/* User */}
                  <td className="py-4 px-6 text-sm text-gray-900 font-semibold align-top">
                    {log.user || <span className="text-gray-400 italic">Deleted User</span>}
                  </td>

                  {/* Role */}
                  <td className="py-4 px-6 text-sm align-top">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(log.role)}
                      <span className={`font-medium text-xs uppercase ${getRoleColor(log.role)}`}>
                        {log.role || '-'}
                      </span>
                    </div>
                  </td>

                  {/* Kolom Spesifik DLH */}
                  {showDlhSpecificColumns && (
                    <>
                      <td className="py-4 px-6 text-sm text-gray-600 align-top">
                        {log.jenis_dlh === 'provinsi' ? 'Provinsi' : 
                         log.jenis_dlh === 'kabkota' ? 'Kab/Kota' : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-top">
                        {log.province_name || '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-top">
                        {log.regency_name || '-'}
                      </td>
                    </>
                  )}

                  {/* Aksi & Target */}
                  <td className="py-4 px-6 text-sm align-top">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">
                        {log.action}
                      </span>
                      
                      {/* Target */}
                      {log.target && log.target !== '-' && (
                        <span className="text-xs text-blue-600 mt-0.5 bg-blue-50 px-2 py-0.5 rounded w-fit">
                          {log.target}
                        </span>
                      )}

                      {/* Catatan (Jika ada) */}
                      {log.catatan && (
                        <p className="text-xs text-gray-500 mt-1 italic border-l-2 border-gray-300 pl-2">
                          &quot;{log.catatan}&quot;
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showDlhSpecificColumns ? 7 : 4} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                     <span>Belum ada aktivitas tercatat.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper Functions di luar component agar tidak re-create setiap render
function getRoleColor(role?: string) {
  switch(role) {
    case 'dlh': return 'text-blue-600';
    case 'pusdatin': return 'text-green-600';
    case 'admin': return 'text-red-600';
    default: return 'text-gray-500';
  }
}

function getRoleIcon(role?: string) {
  switch (role) {
    case 'dlh': return <FaUserTie className="text-blue-600 text-lg" />;
    case 'pusdatin': return <FaUserCog className="text-green-600 text-lg" />;
    case 'admin': return <FaUserShield className="text-red-600 text-lg" />;
    default: return <FaUserTie className="text-gray-300 text-lg" />;
  }
}