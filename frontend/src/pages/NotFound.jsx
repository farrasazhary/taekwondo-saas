import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1120] flex items-center justify-center px-6 transition-colors duration-300">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="relative mb-8">
          <h1 className="text-[150px] font-black text-gray-100 dark:text-navy-900/40 leading-none select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-[0.3em]">Halaman Tidak Ditemukan</p>
          </div>
        </div>
        
        <p className="text-gray-500 dark:text-navy-400 mb-10 leading-relaxed">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          Mari kembali ke jalur yang benar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-gray-200 dark:border-navy-800 text-gray-600 dark:text-navy-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-navy-800 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <Link 
            to="/"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
