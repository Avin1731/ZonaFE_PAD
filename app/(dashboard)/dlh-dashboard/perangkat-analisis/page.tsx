"use client";

import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions,
  TooltipItem
} from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- INTERFACES ---
interface KpiData {
  iklh: number;
  penghargaan: number;
  dokumenLengkap: number;
  dokumenTotal: number;
  status: string;
  statusColor: string;
}

// Tipe chart diperbarui
type ChartType = 'iklh' | 'penghargaan' | 'slhd';

// --- DATA DUMMY UNTUK GRAFIK ---

const iklhData: ChartData<'line'> = {
  labels: ['2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      label: 'IKLH',
      data: [78, 81, 88, 85, 89],
      fill: true,
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: 'rgba(34, 197, 94, 1)',
      tension: 0.4,
      borderWidth: 3,
    },
  ],
};

const penghargaanData: ChartData<'line'> = {
  labels: ['2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      label: 'Penghargaan',
      data: [72, 75, 74, 80, 85],
      fill: true,
      backgroundColor: 'rgba(132, 204, 22, 0.1)', // Warna lime
      borderColor: 'rgba(132, 204, 22, 1)',
      tension: 0.4,
      borderWidth: 3,
    },
  ],
};

const slhdData: ChartData<'line'> = {
  labels: ['2020', '2021', '2022', '2023', '2024'],
  datasets: [
    {
      label: 'SLHD',
      data: [80, 82, 81, 79, 84],
      fill: true,
      backgroundColor: 'rgba(16, 185, 129, 0.1)', // Warna emerald
      borderColor: 'rgba(16, 185, 129, 1)',
      tension: 0.4,
      borderWidth: 3,
    },
  ],
};

// --- DATA DUMMY KPI ---
const kpiDataByYear: Record<string, KpiData> = {
  '2024': {
    iklh: 85,
    penghargaan: 80,
    dokumenLengkap: 15,
    dokumenTotal: 20,
    status: 'Valid',
    statusColor: 'text-green-600'
  },
  '2023': {
    iklh: 82,
    penghargaan: 78,
    dokumenLengkap: 18,
    dokumenTotal: 20,
    status: 'Valid',
    statusColor: 'text-green-600'
  },
  '2022': {
    iklh: 80,
    penghargaan: 81,
    dokumenLengkap: 16,
    dokumenTotal: 20,
    status: 'Valid',
    statusColor: 'text-green-600'
  }
};

// Opsi konfigurasi chart
const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      displayColors: false,
      callbacks: {
          title: () => '',
          label: (context: TooltipItem<'line'>) => `Nilai: ${context.formattedValue}`,
      }
    },
  },
  scales: {
    y: {
      display: true,
      border: { display: false },
      grid: { color: '#e5e7eb' },
      ticks: { display: false },
    },
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: '#6b7280' },
    },
  },
  elements: {
    point: {
      radius: 0,
      hoverRadius: 5,
    },
  },
};

// --- KOMPONEN UTAMA ---

// export default function PerangkatAnalisisPage() {
//   const [selectedYear, setSelectedYear] = useState<string>('2024');
//   const [activeChart, setActiveChart] = useState<ChartType>('iklh'); 

//   const activeKpiData = kpiDataByYear[selectedYear] || kpiDataByYear['2024'];

//   // Helper styling tombol
//   const getButtonClasses = (chartName: ChartType) => {
//     if (chartName === activeChart) {
//       return 'bg-green-600 text-white';
//     } else {
//       return 'bg-green-100 text-green-700 hover:bg-green-200';
//     }
//   };

//   // Helper data chart aktif
//   const getActiveChartData = (): ChartData<'line'> => {
//     switch (activeChart) {
//       case 'iklh': return iklhData;
//       case 'penghargaan': return penghargaanData;
//       case 'slhd': return slhdData; // Updated to return SLHD data
//       default: return iklhData;
//     }
//   };

//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header Halaman */}
//       <div className="mb-6">
//         <h1 className="text-4xl font-bold text-gray-800">Perangkat Analisis</h1>
//         <p className="text-lg text-gray-500 mt-1">
//           Pantau Ringkasan Kinerja dan Progres Penilaian Nirwasita Tantra
//         </p>
//       </div>

//       {/* Filter Tahun */}
//       <div className="flex items-center gap-4 mb-8">
//         <div>
//           <label htmlFor="tahun" className="block text-sm font-medium text-gray-700 mb-1">
//             Tahun
//           </label>
//           <select
//             id="tahun"
//             className="p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(e.target.value)}
//           >
//             <option value="2024">2024</option>
//             <option value="2023">2023</option>
//             <option value="2022">2022</option>
//           </select>
//         </div>
//         <button className="self-end px-5 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition duration-150">
//           Filter
//         </button>
//       </div>

//       {/* Kartu KPI */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {/* Card 1: Rata-rata IKLH */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <p className="text-sm font-medium text-gray-500">Rata-rata IKLH Tahun Ini</p>
//           <p className="text-4xl font-bold text-gray-800 mt-2">{activeKpiData.iklh}</p>
//         </div>

//         {/* Card 2: Total Skor Penghargaan */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <p className="text-sm font-medium text-gray-500">Total Skor Penghargaan</p>
//           <p className="text-4xl font-bold text-gray-800 mt-2">{activeKpiData.penghargaan}</p>
//         </div>

//         {/* Card 3: Jumlah Dokumen */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <p className="text-sm font-medium text-gray-500">Jumlah Dokumen Lengkap</p>
//           <p className="text-4xl font-bold text-gray-800 mt-2">
//             {activeKpiData.dokumenLengkap}
//             <span className="text-3xl text-gray-400">/{activeKpiData.dokumenTotal}</span>
//           </p>
//         </div>

//         {/* Card 4: Status Validasi */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <p className="text-sm font-medium text-gray-500">Status Validasi</p>
//           <p className={`text-4xl font-bold ${activeKpiData.statusColor} mt-2`}>
//             {activeKpiData.status}
//           </p>
//         </div>
//       </div>

//       {/* Sesi Chart */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 p-6">
//         {/* Header Chart */}
//         <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800">Tren Kinerja</h2>
//             <p className="text-sm text-gray-500">2020-2024</p>
//           </div>
//           <div className="flex space-x-2 mt-4 md:mt-0">
//             <button 
//               className={`px-3 py-1 rounded-full text-xs font-semibold ${getButtonClasses('iklh')}`}
//               onClick={() => setActiveChart('iklh')}
//             >
//               IKLH
//             </button>
//             <button 
//               className={`px-3 py-1 rounded-full text-xs font-semibold ${getButtonClasses('penghargaan')}`}
//               onClick={() => setActiveChart('penghargaan')}
//             >
//               Penghargaan
//             </button>
//             <button 
//               className={`px-3 py-1 rounded-full text-xs font-semibold ${getButtonClasses('slhd')}`}
//               onClick={() => setActiveChart('slhd')}
//             >
//               SLHD
//             </button>
//           </div>
//         </div>

//         {/* Kontainer Canvas Chart */}
//         <div className="h-80">
//           <Line data={getActiveChartData()} options={chartOptions} />
//         </div>
//       </div>
//     </div>
//   );
// }