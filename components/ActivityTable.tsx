'use client';

import Link from 'next/link';

// Definisikan tipe Activity
export interface Activity {
  id: number;
  name: string;
  status: 'Menunggu Verifikasi' | 'Valid';
  date: string;
}

// Terima 'activities' sebagai props
interface ActivityTableProps {
  activities: Activity[];
}

export default function ActivityTable({ activities }: ActivityTableProps) {
  return (
    <div>
      <div className="px-6 py-3">
        <h3 className="text-xl font-bold text-gray-800 pl-0 -ml-4">Aktivitas Terkini</h3>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-green-200">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Nama DLH</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Tanggal Pengajuan</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activities.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="bg-green-50 py-4 px-4 text-sm text-gray-800">{item.name}</td>
                  <td className="bg-green-50 py-4 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Menunggu Verifikasi'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="bg-green-50 py-4 px-4 text-sm text-gray-600">{item.date}</td>
                  <td className="bg-green-50 py-4 px-4">
                    <Link 
                      href="/pusdatin-dashboard/detail-pus" 
                      className="text-green-600 hover:text-green-800 hover:underline text-sm font-medium"
                    >
                      Lihat Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}