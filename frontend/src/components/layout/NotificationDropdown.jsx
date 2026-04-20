import { Link } from 'react-router-dom';
import { Bell, CheckCircle, AlertCircle, Clock, ChevronRight, CreditCard } from 'lucide-react';

export default function NotificationDropdown({ notifications, onClose }) {
  const statusConfig = {
    unpaid: {
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-600 dark:text-red-400',
      label: 'Belum Dibayar',
      desc: 'Segera lakukan pembayaran sebelum batas waktu.'
    },
    pending_verification: {
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      label: 'Menunggu Verifikasi',
      desc: 'Bukti transfer sedang diperiksa oleh admin.'
    },
    paid: {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      bg: 'bg-green-50 dark:bg-green-500/10',
      text: 'text-green-600 dark:text-green-400',
      label: 'Pembayaran Berhasil',
      desc: 'Terima kasih! Pembayaran Anda telah dikonfirmasi.'
    }
  };

  return (
    <div className="fixed inset-x-4 sm:inset-x-auto sm:absolute sm:right-0 top-20 sm:top-auto sm:mt-3 w-auto sm:w-96 bg-white dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-3xl shadow-2xl z-[100] overflow-hidden animate-scale-in origin-top sm:origin-top-right">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] flex items-center justify-between">
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Notifikasi</h3>
        <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-full uppercase">
          {notifications.length} Info Baru
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-[#0b1120] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-tight">Tidak ada notifikasi baru</p>
            <p className="text-[10px] text-gray-400 mt-1">Semua aktivitas pembayaran Anda telah terupdate.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-[#2a3447]">
            {notifications.map((notif) => {
              const conf = statusConfig[notif.status] || statusConfig.unpaid;
              return (
                <Link
                  key={notif.id}
                  to="/billing"
                  onClick={onClose}
                  className="block p-5 hover:bg-gray-50/80 dark:hover:bg-[#0b1120]/50 transition-colors group"
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl ${conf.bg} flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
                      {conf.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${conf.text}`}>
                          {conf.label}
                        </p>
                        <span className="text-[9px] text-gray-400 font-medium">
                          {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate mb-1">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                        {notif.isAdminNote ? notif.desc : conf.desc}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <Link
          to="/billing"
          onClick={onClose}
          className="block p-4 text-center text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] border-t border-gray-100 dark:border-[#2a3447] hover:bg-gray-50 dark:hover:bg-[#0b1120] transition-colors"
        >
          Lihat Riwayat Pembayaran
        </Link>
      )}
    </div>
  );
}
