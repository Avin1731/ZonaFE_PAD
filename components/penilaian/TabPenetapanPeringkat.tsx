'use client';

import { useState, useMemo } from 'react';
import { FaTrophy } from 'react-icons/fa';
import Pagination from '@/components/Pagination';

const peringkatData = Array.from({ length: 45 }, (_, i) => ({
  rank: i + 1,
  name: `Kabupaten/Kota ${i + 1}`,
  jenis: i % 3 === 0 ? 'Kabupaten Besar' : i % 3 === 1 ? 'Kabupaten Sedang' : 'Kabupaten Kecil',
  nilai: (95 - i * 0.5).toFixed(1),
  kenaikan: `+${(5 - i * 0.1).toFixed(1)}`,
  status: 'Tidak Lolos'
}));

export default function TabPenetapanPeringkat() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJenis, setSelectedJenis] = useState('');
  const [selectedPeringkat, setSelectedPeringkat] = useState('');
  const itemsPerPage = 10;

  const filteredData = useMemo(() => {
    let filtered = peringkatData;

    // Filter berdasarkan jenis DLH
    if (selectedJenis) {
      filtered = filtered.filter(item => item.jenis === selectedJenis);
    }

    // Filter dan beri status berdasarkan jenis peringkat
    if (selectedPeringkat) {
      if (selectedPeringkat === 'Top 5') {
        filtered = filtered.slice(0, 5).map(item => ({
          ...item,
          status: 'Top 5'
        }));
      } else if (selectedPeringkat === 'Top 10') {
        filtered = filtered.slice(0, 10).map(item => ({
          ...item,
          status: 'Top 10'
        }));
      }
    } else {
      // Jika tidak ada filter peringkat, beri status berdasarkan rank global
      filtered = filtered.map(item => ({
        ...item,
        status: item.rank <= 5 ? 'Top 5' : item.rank <= 10 ? 'Top 10' : 'Tidak Lolos'
      }));
    }

    return filtered;
  }, [selectedJenis, selectedPeringkat]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleResetFilter = () => {
    setSelectedJenis('');
    setSelectedPeringkat('');
    setCurrentPage(1);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-500';
    return '';
  };

  const getNameColor = (rank: number) => {
    if (rank === 1) return 'text-green-600 font-bold';
    if (rank === 2) return 'text-blue-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-800';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Top 5':
        return 'bg-yellow-100 text-yellow-700';
      case 'Top 10':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Tabel Peringkat</h3>
      </div>

      <div className="flex gap-4">
        <div className="w-1/3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Pembagian Daerah</label>
          <select 
            className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedJenis}
            onChange={(e) => {
              setSelectedJenis(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Semua Jenis DLH</option>
            <option value="Kabupaten Besar">Kabupaten Besar</option>
            <option value="Kabupaten Sedang">Kabupaten Sedang</option>
            <option value="Kabupaten Kecil">Kabupaten Kecil</option>
          </select>
        </div>
        
        <div className="w-1/3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Jenis Peringkat</label>
          <select 
            className="w-full border bg-white border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedPeringkat}
            onChange={(e) => {
              setSelectedPeringkat(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Semua Peringkat</option>
            <option value="Top 5">Top 5</option>
            <option value="Top 10">Top 10</option>
          </select>
        </div>
        
        <div className="flex items-end gap-2">
          <button 
            className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            onClick={() => setCurrentPage(1)}
          >
            Terapkan Filter
          </button>
          <button 
            className="bg-gray-500 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors"
            onClick={handleResetFilter}
          >
            Reset
          </button>
        </div>
      </div>

      {(selectedJenis || selectedPeringkat) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            Filter aktif: 
            {selectedJenis && ` Jenis DLH: ${selectedJenis}`}
            {selectedJenis && selectedPeringkat && ' | '}
            {selectedPeringkat && ` Peringkat: ${selectedPeringkat}`}
            {selectedPeringkat === 'Top 5' && ' (menampilkan 5 terbaik)'}
            {selectedPeringkat === 'Top 10' && ' (menampilkan 10 terbaik)'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="py-3 px-6 bg-green-200 text-left text-xs font-bold text-gray-500 uppercase">Rank</th>
                <th className="py-3 px-6 bg-green-200 text-left text-xs font-bold text-gray-500 uppercase">Nama Daerah</th>
                <th className="py-3 px-6 bg-green-200 text-left text-xs font-bold text-gray-500 uppercase">Jenis DLH</th>
                <th className="py-3 px-6 bg-green-200 text-center text-xs font-bold text-gray-500 uppercase">Nilai NT</th>
                <th className="py-3 px-6 bg-green-200 text-center text-xs font-bold text-gray-500 uppercase">Kenaikan NT</th>
                <th className="py-3 px-6 bg-green-200 text-center text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.rank} className="hover:bg-gray-50">
                    <td className="py-4 px-6 bg-green-50 text-sm font-bold text-gray-800 flex items-center gap-2">
                      {item.rank <= 3 && <FaTrophy className={getRankColor(item.rank)} />}
                      {item.rank}
                    </td>
                    <td className={`py-4 px-6 bg-green-50 text-sm font-medium ${getNameColor(item.rank)}`}>
                      {item.name}
                    </td>
                    <td className="py-4 px-6 bg-green-50 text-sm text-gray-600">{item.jenis}</td>
                    <td className="py-4 px-6 bg-green-50 text-center text-sm font-semibold text-gray-700">{item.nilai}</td>
                    <td className="py-4 px-6 bg-green-50 text-center text-sm font-medium text-green-600">{item.kenaikan}</td>
                    <td className="py-4 px-6 bg-green-50 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 bg-green-50">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg font-medium">Tidak ada data ditemukan</p>
                      <p className="text-sm mt-1">Coba ubah filter pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-700">
          {selectedPeringkat === 'Top 5' ? (
            <>Menampilkan 5 data terbaik {selectedJenis && `untuk ${selectedJenis}`}</>
          ) : selectedPeringkat === 'Top 10' ? (
            <>Menampilkan 10 data terbaik {selectedJenis && `untuk ${selectedJenis}`}</>
          ) : (
            <>Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} data</>
          )}
        </div>
        
        {!selectedPeringkat && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}