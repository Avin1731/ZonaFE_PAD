'use client';

import { FaUserShield, FaUserTie, FaUserCog } from "react-icons/fa";

// Ekspor interface Log agar bisa digunakan di file lain
export interface Log {
  id: number;
  user: string;
  role: 'dlh' | 'pusdatin' | 'admin';
  action: string;
  target?: string; // Tambahan: Objek yang dikenai aksi
  time: string;    // ✅ KITA GUNAKAN 'time'
  status?: 'success' | 'warning' | 'danger' | 'info' | string;
  // ✅ Izinkan undefined, jangan paksa string
  jenis_dlh?: 'provinsi' | 'kabkota'; 
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
  
  const getThemeColors = () => {
    switch (theme) {
      case 'blue': return { header: 'bg-blue-200', row: 'bg-blue-50', text: 'text-blue-800' };
      case 'green': return { header: 'bg-green-200', row: 'bg-green-50', text: 'text-green-800' };
      case 'red': return { header: 'bg-red-200', row: 'bg-red-50', text: 'text-red-800' };
      default: return { header: 'bg-slate-200', row: 'bg-slate-50', text: 'text-slate-800' };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider w-32">Waktu</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">User</th>
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider w-32">Role</th>
              {showDlhSpecificColumns && (
                <>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Jenis DLH</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Provinsi</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Kab/Kota</th>
                </>
              )}
              <th className="py-4 px-6 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  {/* Waktu */}
                  <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                    {log.time}
                  </td>

                  {/* User */}
                  <td className="py-4 px-6 text-sm text-gray-900 font-semibold">
                    {log.user}
                  </td>

                  {/* Role + Icon */}
                  <td className="py-4 px-6 text-sm">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(log.role)}
                      <span className={`font-medium text-xs uppercase ${getRoleColor(log.role)}`}>
                        {log.role}
                      </span>
                    </div>
                  </td>

                  {/* Kolom Spesifik DLH */}
                  {showDlhSpecificColumns && (
                    <>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {log.jenis_dlh === 'provinsi' ? 'Provinsi' : 
                         log.jenis_dlh === 'kabkota' ? 'Kab/Kota' : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {log.province_name || '-'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {log.regency_name || '-'}
                      </td>
                    </>
                  )}

                  {/* Aksi & Target */}
                  <td className="py-4 px-6 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium">
                        {log.action}
                      </span>
                      {log.target && log.target !== '-' && (
                        <span className="text-xs text-gray-500 mt-0.5 italic">
                          Target: {log.target}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showDlhSpecificColumns ? 7 : 4} className="py-8 text-center text-gray-500">
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getRoleColor(role: string) {
  switch(role) {
    case 'dlh': return 'text-blue-600';
    case 'pusdatin': return 'text-green-600';
    case 'admin': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'dlh': return <FaUserTie className="text-blue-600 text-base" />;
    case 'pusdatin': return <FaUserCog className="text-green-600 text-base" />;
    case 'admin': return <FaUserShield className="text-red-600 text-base" />;
    default: return null;
  }
}