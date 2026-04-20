import { useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { LayoutGrid, User, Receipt, CalendarDays, Settings, HelpCircle, LogOut, X, UserRoundPlus, Users, Image } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Beranda' },
  { to: '/profile', icon: User, label: 'Profil Saya' },
  { to: '/billing', icon: Receipt, label: 'Tagihan' },
  { to: '/events', icon: CalendarDays, label: 'Agenda' },
  { to: '/members', icon: Users, label: 'Anggota' },
  { to: '/candidates', icon: UserRoundPlus, label: 'Kandidat', adminOnly: true },
  { to: '/gallery', icon: Image, label: 'Galeri', adminOnly: true },
  { to: '/settings', icon: Settings, label: 'Pengaturan', adminOnly: true },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const isAdmin = user?.role === 'club_admin' || user?.role === 'superadmin';
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => { 
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout(); 
    navigate('/login'); 
  };
  const filteredItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-56 bg-navy-950 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand */}
        <div className="px-5 pt-6 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-extrabold text-white tracking-wider truncate uppercase">{settings.clubName || 'KINETIC'}</h1>
              <p className="text-[10px] text-navy-400 uppercase tracking-[0.2em]">TAEKWONDO CLUB</p>
            </div>
            <button onClick={onClose} className="lg:hidden text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {filteredItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30' : 'text-navy-300 hover:text-white hover:bg-navy-800/50'}`}>
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-6 space-y-1">
          <a 
            href="mailto:support@kinetic.com" 
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-navy-400 hover:text-white hover:bg-navy-800/50 transition-all"
          >
            <HelpCircle className="w-[18px] h-[18px]" /> Bantuan
          </a>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-[18px] h-[18px]" /> Keluar
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowLogoutModal(false)}>
          <div className="w-full max-w-sm bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-[#2a3447]" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100 dark:border-red-900/50">
                <LogOut className="w-8 h-8 text-red-500 ml-1" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Konfirmasi Keluar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Apakah Anda yakin ingin keluar dari sistem? Anda perlu login kembali untuk masuk.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                   onClick={() => setShowLogoutModal(false)}
                   className="py-3 px-4 rounded-xl border border-gray-200 dark:border-[#2a3447] text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1c2434] transition-all"
                >
                  Batal
                </button>
                <button 
                   onClick={confirmLogout}
                   className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all"
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
