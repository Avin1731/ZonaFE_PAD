'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblings?: number; // jumlah angka di kiri & kanan halaman aktif
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
}: PaginationProps) {
  
  // Tidak perlu tampilkan pagination jika cuma ada 1 halaman
  if (totalPages <= 1) return null;

  // --- Generate nomor halaman ---
  const getPageNumbers = () => {
    const pages: number[] = [];

    let start = Math.max(1, currentPage - siblings);
    let end = Math.min(totalPages, currentPage + siblings);

    // Koreksi jika posisi terlalu dekat awal
    if (currentPage <= siblings + 1) {
      end = Math.min(totalPages, siblings * 2 + 1);
    }

    // Koreksi jika terlalu dekat akhir
    if (currentPage >= totalPages - siblings) {
      start = Math.max(1, totalPages - siblings * 2);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // --- Render UI ---
  return (
    <nav className="flex items-center space-x-1" aria-label="Pagination">
      
      {/* Tombol Sebelumnya */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center px-3 py-2 rounded-md 
                   text-gray-600 hover:bg-gray-100 
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Sebelumnya</span>
        <span className="text-lg">&lt;</span>
      </button>

      {/* Nomor Halaman */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`inline-flex items-center justify-center w-10 h-10 rounded-md font-medium 
            ${
              currentPage === page
                ? 'bg-green-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* Tombol Selanjutnya */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center px-3 py-2 rounded-md 
                   text-gray-600 hover:bg-gray-100 
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Selanjutnya</span>
        <span className="text-lg">&gt;</span>
      </button>

    </nav>
  );
}
