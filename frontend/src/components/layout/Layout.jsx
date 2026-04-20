import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getInvoices } from '../../api/invoices';
import NotificationDropdown from './NotificationDropdown';
import { useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const { data } = await getInvoices({ limit: 50 });
        const allInvoices = data.data;

        let filtered = [];
        const isAdmin = user.role === 'club_admin' || user.role === 'superadmin';

        if (isAdmin) {
          // Admin sees all pending verifications
          filtered = allInvoices
            .filter(inv => inv.status === 'pending_verification')
            .map(inv => ({
              ...inv,
              desc: `Anggota ${inv.user?.name} baru saja mengunggah bukti pembayaran.`,
              isAdminNote: true
            }));
        } else {
          // Member sees their own: unpaid, pending, and recently paid
          filtered = allInvoices.filter(inv => {
            if (inv.status === 'unpaid' || inv.status === 'pending_verification') return true;
            if (inv.status === 'paid') {
              const paidAt = new Date(inv.paidAt || inv.updatedAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return paidAt > weekAgo;
            }
            return false;
          });
        }
        setNotifications(filtered);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();

    // Setup Real-time SSE
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const eventSource = new EventSource(`${apiBase}/api/notifications/stream`, { withCredentials: true });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {
        console.log('Real-time notification received:', data);
        fetchNotifications();
      }
    };

    eventSource.onerror = (err) => {
      console.warn('SSE Connection failed, falling back to interval:', err);
      eventSource.close();
    };

    // Keep interval as a safety fallback but much slower
    const interval = setInterval(fetchNotifications, 120000); 

    return () => {
      eventSource.close();
      clearInterval(interval);
    };
  }, [user, location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasAlerts = notifications.some(n => n.status !== 'paid');

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-[#0b1120] transition-colors duration-300">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-[#0b1120] border-b border-gray-200 dark:border-transparent flex items-center justify-between px-4 md:px-8 shrink-0 transition-colors duration-300">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1c2434] text-gray-500 dark:text-navy-300">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-navy-800 text-gray-400 dark:text-navy-300 transition-all hover:text-primary-500 group" title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
               {darkMode ? <Sun className="w-5 h-5 transition-transform group-hover:rotate-45 text-amber-500" /> : <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2 rounded-xl transition-all group ${isNotifOpen ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-50 dark:hover:bg-navy-800 text-gray-400 dark:text-navy-300'}`}
              >
                <Bell className={`w-5 h-5 transition-transform group-hover:scale-110 ${hasAlerts && !isNotifOpen ? 'animate-bell-swing' : ''}`} />
                {notifications.length > 0 && (
                  <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 border-white dark:border-navy-900 shadow-sm ${hasAlerts ? 'bg-red-500' : 'bg-primary-500'}`}>
                    {hasAlerts && <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <NotificationDropdown 
                  notifications={notifications} 
                  onClose={() => setIsNotifOpen(false)} 
                />
              )}
            </div>
            
            <div className="h-8 w-px bg-gray-100 dark:bg-navy-800 mx-2 sm:mx-4" />

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-[10px] font-black text-gray-400 dark:text-navy-400 uppercase tracking-widest mt-0.5">
                  {user?.role === 'club_admin' || user?.role === 'superadmin' ? 'Administrator' : 
                   user?.role === 'member_reguler' ? 'Member Reguler' : 
                   user?.role === 'member_private' ? 'Member Private' : 'Calon Member'}
                </p>
              </div>
              <div className="relative group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-navy-800 dark:to-navy-700 p-0.5 shadow-sm transition-transform hover:scale-105 overflow-hidden">
                  {user?.profileImage ? (
                    <img 
                      src={`http://localhost:5000/uploads/profiles/${user.profileImage}`} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-[10px]"
                    />
                  ) : (
                    <div className="w-full h-full bg-white dark:bg-navy-900 rounded-[10px] flex items-center justify-center text-gray-700 dark:text-navy-300 text-sm font-black italic">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-navy-900 rounded-full shadow-sm" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 dark:bg-navy-950 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
