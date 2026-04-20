import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, getUserStats } from '../api/users';
import { getInvoices } from '../api/invoices';
import { getEvents } from '../api/events';
import { getBelts } from '../api/belts';
import { 
  AlertTriangle, CalendarDays, ChevronRight, Users, UserPlus, 
  Plus, Trophy, ArrowRight, ShieldCheck, Mail, Phone, Clock 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'club_admin' || user?.role === 'superadmin';
  const navigate = useNavigate();
  
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [belts, setBelts] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [modal, setModal] = useState(false);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ userId: '', title: '', amount: '', dueDate: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const promises = [
        getInvoices({ status: 'unpaid', limit: 5 }),
        getInvoices({ limit: 5 }),
        getEvents({ upcoming: 'true', limit: 3 }),
        getBelts(),
      ];

      if (isAdmin) {
        promises.push(getUserStats());
        promises.push(getUsers({ role: 'candidate', limit: 5 }));
        promises.push(getUsers({ limit: 100 }));
      }

      const results = await Promise.all(promises);
      
      setUnpaidInvoices(results[0].data.data);
      setRecentInvoices(results[1].data.data);
      setUpcomingEvents(results[2].data.data);
      setBelts(results[3].data.data);
      
      if (isAdmin) {
        setAdminStats(results[4].data.data);
        setRecentCandidates(results[5].data.data);
        setMembers(results[6].data.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const currentBelt = belts.find(b => b.id === user?.currentBeltId) || user?.belt;
  const beltName = currentBelt?.name || 'Belum ditentukan';
  const beltColor = currentBelt?.color || '#9ca3af';

  const sortedBelts = [...belts].sort((a, b) => a.levelOrder - b.levelOrder);
  const nextBelt = currentBelt ? sortedBelts.find(b => b.levelOrder > currentBelt.levelOrder) : sortedBelts[0];
  const progressPercent = currentBelt ? Math.round((currentBelt.levelOrder / sortedBelts.length) * 100) : 0;
  const isWhiteBelt = beltColor.toUpperCase() === '#FFFFFF' || beltColor.toLowerCase() === 'white';

  const statusBadge = { unpaid: 'badge-warning', pending_verification: 'badge-warning', paid: 'badge-success', expired: 'badge-neutral', failed: 'badge-danger' };
  const statusLabel = { unpaid: 'Belum Dibayar', pending_verification: 'Verifikasi', paid: 'Berhasil', expired: 'Kedaluwarsa', failed: 'Gagal' };
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const handleCreateInvoice = async (e) => {
    e.preventDefault(); 
    setError(''); 
    setSaving(true);
    try {
      const { createInvoice } = await import('../api/invoices');
      await createInvoice({ 
        ...form, 
        amount: Number(form.amount), 
        dueDate: new Date(form.dueDate).toISOString() 
      });
      setModal(false); 
      setForm({ userId: '', title: '', amount: '', dueDate: '' }); 
      fetchData();
    } catch (err) { 
      setError(err.response?.data?.message || 'Gagal membuat tagihan.'); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-8 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-navy-800 rounded w-1/4" />
          <div className="h-8 bg-gray-200 dark:bg-navy-800 rounded w-2/3" />
          <div className="h-4 bg-gray-100 dark:bg-navy-900 rounded w-3/4" />
          <div className="flex gap-3 mt-4">
            <div className="h-10 bg-gray-200 dark:bg-navy-800 rounded w-24" />
            <div className="h-3 bg-gray-100 dark:bg-navy-900 rounded w-32 mt-3" />
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-navy-800 rounded w-1/2" />
          <div className="h-16 bg-gray-100 dark:bg-navy-900 rounded" />
          <div className="h-16 bg-gray-100 dark:bg-navy-900 rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Payment Warning - Hidden for admins */}
      {!isAdmin && unpaidInvoices.length > 0 && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-l-4 border-l-primary-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Peringatan Pembayaran</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Anda memiliki {unpaidInvoices.length} tagihan yang belum dibayar.</p>
            </div>
          </div>
          <Link to="/billing" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-lg transition-all shadow-sm whitespace-nowrap">
            BAYAR SEKARANG
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 card p-6 md:p-8 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-primary-600 dark:text-primary-400 text-[11px] font-bold uppercase tracking-widest mb-2 px-1">Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              Selamat datang kembali,<br />{user?.name?.split(' ')[0]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-6">
              Siap untuk sesi latihan hari ini? Fokus dan disiplin adalah kunci kekuatan sejati.
            </p>

            <div className="flex items-center gap-4">
              {!isAdmin ? (
                <>
                  <div className={`px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm ${isWhiteBelt ? 'text-gray-900 border border-gray-200 dark:border-[#2a3447]' : 'text-white'}`}
                    style={{ backgroundColor: beltColor }}>
                    {beltName}
                  </div>
                  <div className="flex-1 max-w-[120px] h-1.5 bg-gray-100 dark:bg-[#0b1120] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ backgroundColor: isWhiteBelt ? '#3b82f6' : beltColor, width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    {nextBelt ? `Selanjutnya: ${nextBelt.name.split(' (')[0]}` : 'Semua Sabuk Tercapai'}
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20">
                    Administrator
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 group cursor-default">
                    <ShieldCheck className="w-4 h-4 text-primary-500" />
                    Verified Sabeum
                  </div>
                </div>
              )}
            </div>
            
            {isAdmin && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-[#2a3447]">
                <button onClick={() => setModal(true)} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0b1120] rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group">
                  <div className="w-8 h-8 bg-white dark:bg-[#1c2434] rounded-lg border border-gray-200 dark:border-[#2a3447] flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-primary-600">Tagihan</span>
                </button>
                <button onClick={() => navigate('/events')} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0b1120] rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group">
                  <div className="w-8 h-8 bg-white dark:bg-[#1c2434] rounded-lg border border-gray-200 dark:border-[#2a3447] flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-emerald-600">Event</span>
                </button>
                <button onClick={() => navigate('/candidates')} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-[#0b1120] rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all group hidden sm:flex">
                  <div className="w-8 h-8 bg-white dark:bg-[#1c2434] rounded-lg border border-gray-200 dark:border-[#2a3447] flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-amber-600">Kandidat</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white uppercase text-[11px] tracking-[0.2em]">Agenda Terdekat</h2>
            <CalendarDays className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Tidak ada agenda terdekat</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((ev) => {
                const d = new Date(ev.eventDate);
                return (
                  <div key={ev.id} className="flex items-start gap-4">
                    <div className="text-center shrink-0 w-12">
                      <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{months[d.getMonth()]}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{String(d.getDate()).padStart(2, '0')}</p>
                      <div className="w-8 h-0.5 bg-primary-500 mx-auto mt-1" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{ev.title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link to="/events" className="block text-center mt-5 text-xs font-bold text-gray-400 hover:text-primary-600 uppercase tracking-wider transition-colors">
            Lihat Kalender Lengkap
          </Link>
        </div>
      </div>

      {isAdmin && adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <div className="card p-5 border-b-4 border-b-primary-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Anggota</p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{adminStats.total}</p>
          </div>
          <div className="card p-5 border-b-4 border-b-emerald-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Reguler</p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{adminStats.regularCount}</p>
          </div>
          <div className="card p-5 border-b-4 border-b-amber-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Private</p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{adminStats.privateCount}</p>
          </div>
          <div className="card p-5 border-b-4 border-b-blue-500 text-blue-600">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Baru (30 Hari)</p>
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{adminStats.newRegistrations}</p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="card overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-[#2a3447]">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white uppercase text-[11px] tracking-[0.2em]">Pendaftar Terbaru (Kandidat)</h2>
              <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">Membutuhkan Follow Up Administrasi</p>
            </div>
            <Link to="/candidates" className="p-2 bg-gray-50 dark:bg-[#0b1120] rounded-lg text-gray-400 hover:text-primary-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          {recentCandidates.length === 0 ? (
            <div className="p-12 text-center text-gray-400">Tidak ada pendaftar baru</div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-[#2a3447]">
              {recentCandidates.map((c) => (
                <div key={c.id} className="p-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-[#0b1120]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{c.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.phone && (
                      <a href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 text-green-600 bg-green-50 dark:bg-green-500/10 rounded-lg hover:bg-green-100 transition-all">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => navigate('/candidates')} className="p-2 text-primary-600 bg-primary-50 dark:bg-primary-500/10 rounded-lg hover:bg-primary-100 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment History - Hidden for admins */}
      {!isAdmin && (
        <div className="card overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white uppercase text-[11px] tracking-[0.2em]">Riwayat Pembayaran</h2>
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-gray-100 dark:border-[#2a3447] bg-gray-50/50 dark:bg-[#0b1120]/50">
                  <th className="text-left px-6 py-3 font-semibold text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-widest">ID Transaksi</th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-widest">Deskripsi</th>
                  <th className="text-center px-6 py-3 font-semibold text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-widest">Status</th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-400 dark:text-gray-500 text-[11px] uppercase tracking-widest">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-10 text-gray-400 dark:text-gray-500">Belum ada transaksi</td></tr>
                ) : recentInvoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-gray-100 dark:border-[#2a3447] hover:bg-gray-50/50 dark:hover:bg-[#0b1120]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400 text-xs">#{inv.id?.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{inv.title}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center text-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold leading-tight ${statusBadge[inv.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${inv.status === 'paid' ? 'bg-green-500' : inv.status === 'pending_verification' ? 'bg-amber-500' : inv.status === 'unpaid' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                        {statusLabel[inv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">Rp {Number(inv.amount).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden p-4 space-y-4 bg-gray-50/30 dark:bg-[#0b1120]/30 min-h-[100px]">
            {recentInvoices.length === 0 ? (
              <div className="p-10 text-center text-gray-400">Belum ada transaksi</div>
            ) : recentInvoices.map((inv) => (
              <div key={inv.id} className="bg-white dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-2xl p-5 space-y-4 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{inv.title}</h3>
                    <p className="text-[11px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">#{inv.id?.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <span className={`inline-flex items-center justify-center text-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest leading-tight ${statusBadge[inv.status]}`}>
                    {statusLabel[inv.status]}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Jumlah</span>
                  <span className="text-lg font-black text-primary-600 dark:text-primary-400 leading-none">Rp {Number(inv.amount).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-56">
        <img src="/images/banner.png" alt="Motivation" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/60 to-transparent" />
        <div className="absolute inset-0 flex items-center px-8 md:px-12">
          <p className="text-white text-xl md:text-2xl font-extrabold italic leading-snug max-w-md">
            "DISIPLIN ADALAH JEMBATAN<br />ANTARA TARGET DAN PENCAPAIAN"
          </p>
        </div>
      </div>

      {/* Create Billing Modal */}
      {isAdmin && modal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1c2434] rounded-3xl overflow-hidden shadow-2xl animate-scale-in border border-transparent dark:border-[#2a3447]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] flex items-center justify-between bg-white dark:bg-[#1c2434]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Buat Tagihan Cepat</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#0b1120] text-gray-400 transition-colors">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5">
                {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Anggota <span className="text-red-500">*</span></label>
                  <select required value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm cursor-pointer">
                    <option value="">Pilih anggota...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Judul Tagihan <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="Contoh: Iuran Bulanan" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Nominal (Rp) <span className="text-red-500">*</span></label>
                    <input type="number" required min={1} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Jatuh Tempo <span className="text-red-500">*</span></label>
                    <input type="date" required value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 p-6 border-t border-gray-100 dark:border-[#2a3447] bg-gray-50 dark:bg-[#0b1120]/50 shrink-0">
                <button type="button" onClick={() => setModal(false)} className="px-6 py-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-[#2a3447] text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1c2434] transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all active:scale-95">
                  {saving ? 'Memproses...' : 'Buat Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>, 
        document.body
      )}
    </div>
  );
}
