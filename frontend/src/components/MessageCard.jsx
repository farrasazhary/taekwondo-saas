import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function MessageCard({ 
  message, 
  onClose, 
  submessage = "Permintaan Anda telah berhasil diproses oleh sistem.",
  type = 'success',
  buttonText = 'SELESAI'
}) {
  const iconMap = {
    success: <CheckCircle className="w-10 h-10 text-green-500" />,
    danger: <AlertCircle className="w-10 h-10 text-red-500" />,
    warning: <AlertCircle className="w-10 h-10 text-amber-500" />,
    info: <Info className="w-10 h-10 text-blue-500" />
  };

  const colorMap = {
    success: 'bg-green-50 dark:bg-green-500/10',
    danger: 'bg-red-50 dark:bg-red-500/10',
    warning: 'bg-amber-50 dark:bg-amber-500/10',
    info: 'bg-blue-50 dark:bg-blue-500/10'
  };

  const titleMap = {
    success: 'Berhasil',
    danger: 'Terjadi Kesalahan',
    warning: 'Peringatan',
    info: 'Informasi'
  };

  // Using Portal to ensure it covers everything (sidebar, header, etc)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in transition-all duration-300" onClick={onClose}>
      {/* Card Popup - Structured like Billing Modal - Fully Opaque for Dark Mode */}
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1c2434] bg-opacity-100 dark:bg-opacity-100 rounded-[2rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(0,0,0,0.6)] animate-scale-in border border-gray-100 dark:border-[#2a3447]" onClick={e => e.stopPropagation()}>
        
        {/* Header - Billing Modal Style */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] flex items-center justify-between bg-white dark:bg-[#1c2434]">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
            {titleMap[type]}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#0b1120] text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Clean & Compact for Mobile */}
        <div className="p-7 sm:p-10 flex flex-col items-center text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 ${colorMap[type]}`}>
            {iconMap[type]}
          </div>

          <div className="space-y-4 w-full">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight px-2">
              {message}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] font-bold uppercase tracking-widest sm:tracking-[0.2em] leading-relaxed px-4">
              {submessage}
            </p>
          </div>
        </div>

        {/* Footer - Professional Action Area */}
        <div className="flex flex-wrap gap-3 p-6 border-t border-gray-100 dark:border-[#2a3447] bg-gray-50/50 dark:bg-[#0b1120] shrink-0">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 min-w-[100px] py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 dark:border-[#2a3447] text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1c2434] transition-all active:scale-95"
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="flex-[2] min-w-[140px] py-3.5 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary-600 text-white shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all active:scale-95"
          >
            {buttonText}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
