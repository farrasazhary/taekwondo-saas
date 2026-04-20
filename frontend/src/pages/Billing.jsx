import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { getInvoices, createInvoice, deleteInvoice, verifyPayment } from '../api/invoices';
import { getUsers } from '../api/users';
import { Plus, Trash2, X, AlertCircle, Filter, Download, CreditCard, CheckCircle, FileWarning, Phone, Mail, Clock } from 'lucide-react';
import Skeleton, { TableSkeleton, CardSkeleton } from '../components/Skeleton';

const statusBadge = { unpaid: 'badge-danger', pending_verification: 'badge-warning', paid: 'badge-success', expired: 'badge-neutral', failed: 'badge-danger' };
const statusLabel = { unpaid: 'Belum Dibayar', pending_verification: 'Verifikasi', paid: 'Lunas', expired: 'Kedaluwarsa', failed: 'Gagal' };

export default function Billing() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'club_admin' || user?.role === 'superadmin';
  const [invoices, setInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [meta, setMeta] = useState({});
  const [stats, setStats] = useState({ unpaid: 0, paid: 0, pending: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ userId: '', title: '', amount: '', dueDate: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [verifyModal, setVerifyModal] = useState({ open: false, invoice: null });

  useEffect(() => { fetchInvoices(); }, [page, statusFilter]);
  useEffect(() => { if (isAdmin) getUsers({ limit: 200 }).then(r => setMembers(r.data.data)); }, []);
  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [unpaidRes, paidRes, pendingRes] = await Promise.all([
        getInvoices({ status: 'unpaid', limit: 1 }),
        getInvoices({ status: 'paid', limit: 1 }),
        getInvoices({ status: 'pending_verification', limit: 1 }),
      ]);
      setStats({ 
        unpaid: unpaidRes.data.meta.total, 
        paid: paidRes.data.meta.total,
        pending: pendingRes.data.meta.total
      });
    } catch {}
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await getInvoices({ page, limit: 10, status: statusFilter || undefined });
      setInvoices(data.data); setMeta(data.meta);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await createInvoice({ ...form, amount: Number(form.amount), dueDate: new Date(form.dueDate).toISOString() });
      setModal(false); setForm({ userId: '', title: '', amount: '', dueDate: '' }); fetchInvoices(); fetchStats();
    } catch (err) { setError(err.response?.data?.message || 'Gagal.'); } finally { setSaving(false); }
  };

  const handleDelete = (inv) => {
    setConfirmDelete(inv);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteInvoice(confirmDelete.id); fetchInvoices(); fetchStats(); setConfirmDelete(null); } catch (err) { alert(err.response?.data?.message || 'Gagal.'); }
  };

  const handleVerify = async (inv, approved) => {
    setSaving(true);
    try {
      await verifyPayment(inv.id, { approved });
      setVerifyModal({ open: false, invoice: null });
      fetchInvoices(); fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memverifikasi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Tagihan & Pembayaran</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Kelola administrasi iuran dan riwayat transaksi.</p>
        </div>
        {isAdmin && <button onClick={() => { setModal(true); setError(''); }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-lg transition-all shadow-sm"><Plus className="w-4 h-4" />Buat Tagihan</button>}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <div className="card p-5 border-t-4 border-t-primary-500 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center"><FileWarning className="w-5 h-5 text-primary-600" /></div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Belum Dibayar</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.unpaid}</p>
              <p className="text-xs text-primary-600 font-medium mt-1">{stats.unpaid} Tagihan Tertunggak</p>
            </div>
            <div className="card p-5 border-t-4 border-t-green-500 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Lunas</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.paid}</p>
              <p className="text-xs text-green-600 font-medium mt-1">{stats.paid} Transaksi Berhasil</p>
            </div>
            <div className="card p-5 border-t-4 border-t-amber-500 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Perlu Diverifikasi</p>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stats.pending}</p>
              <p className="text-xs text-amber-600 font-medium mt-1">{stats.pending} Pembayaran Menunggu</p>
            </div>
          </>
        )}
      </div>

      {/* Invoice Table */}
      <div className="card overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 dark:border-[#2a3447]">
          <h2 className="font-bold text-gray-900 dark:text-white">Daftar Tagihan</h2>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: '', label: 'Semua' },
              { id: 'unpaid', label: 'Belum Bayar' },
              { id: 'pending_verification', label: 'Verifikasi' },
              { id: 'paid', label: 'Lunas' },
              { id: 'expired', label: 'Kedaluwarsa' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setStatusFilter(t.id); setPage(1); }}
                className={`flex-none px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  statusFilter === t.id 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                    : 'bg-gray-50 dark:bg-[#0b1120] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1c2434]'
                }`}
              >
                {t.label} {stats[t.id === 'pending_verification' ? 'pending' : t.id] !== undefined && stats[t.id === 'pending_verification' ? 'pending' : t.id] > 0 && <span>({stats[t.id === 'pending_verification' ? 'pending' : t.id]})</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50/80 dark:bg-[#0b1120]/80">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">ID Tagihan</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Deskripsi</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nominal</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Batas Waktu</th>
              <th className="text-center px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Aksi</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8">
                    <TableSkeleton rows={5} cols={6} />
                  </td>
                </tr>
              ) : invoices.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Tidak ada tagihan</td></tr>
              : invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-gray-100 dark:border-[#2a3447] hover:bg-gray-50/50 dark:hover:bg-[#0b1120]/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-gray-500 dark:text-gray-400 text-xs">INV-{inv.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-5 py-4"><p className="font-medium text-gray-900 dark:text-white">{inv.title}</p>{inv.user && <p className="text-xs text-gray-400 dark:text-gray-500">{inv.user.name}</p>}</td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-900 dark:text-white">Rp {Number(inv.amount).toLocaleString('id-ID')}</td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">{new Date(inv.dueDate).toLocaleDateString('id-ID')}</td>
                  <td className="px-5 py-4 text-center"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[inv.status]}`}><span className={`w-1.5 h-1.5 rounded-full ${inv.status==='paid'?'bg-green-500':inv.status==='pending_verification'?'bg-amber-500':inv.status==='unpaid'?'bg-red-500':'bg-gray-400'}`} />{statusLabel[inv.status]}</span></td>
                  <td className="px-5 py-4 text-right">
                    {inv.status === 'unpaid' && (!isAdmin || inv.user?.id === user?.id) && <a href={`/pay/${inv.id}`} className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-500 mr-2 transition-colors">BAYAR</a>}
                    {inv.status === 'pending_verification' && isAdmin && <button onClick={() => setVerifyModal({ open: true, invoice: inv })} className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 mr-2 transition-colors">VERIFIKASI</button>}
                    {isAdmin && <button onClick={() => handleDelete(inv)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden p-4 space-y-4 bg-gray-50/50 dark:bg-[#0b1120]/50">
           {loading ? (
             <div className="space-y-4">
               <CardSkeleton />
               <CardSkeleton />
               <CardSkeleton />
             </div>
           ) : invoices.length === 0 ? <div className="p-10 text-center text-gray-400">Tidak ada tagihan</div>
           : invoices.map((inv) => inv && (
             <div key={inv.id} className="bg-white dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-0.5">{inv.title}</h3>
                    <p className="text-[11px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">INV-{inv.id.slice(0,8).toUpperCase()}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${statusBadge[inv.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${inv.status==='paid'?'bg-green-500':inv.status==='pending_verification'?'bg-amber-500':inv.status==='unpaid'?'bg-red-500':'bg-gray-400'}`} />
                    {statusLabel[inv.status]}
                  </span>
               </div>
               
               {isAdmin && inv.user && (
                 <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-[#0b1120] rounded-xl border border-gray-100 dark:border-[#2a3447]">
                   <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">{inv.user.name.charAt(0)}</div>
                   <div className="text-xs">
                      <p className="font-bold text-gray-900 dark:text-white">{inv.user.name}</p>
                   </div>
                 </div>
               )}

               <div className="flex justify-between items-end pt-1">
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1 px-1">Total Tagihan</p>
                    <p className="text-xl font-black text-primary-600 dark:text-primary-400 leading-none">Rp {Number(inv.amount).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1 px-1">Jatuh Tempo</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{new Date(inv.dueDate).toLocaleDateString('id-ID')}</p>
                  </div>
               </div>

               <div className="pt-2 flex gap-2">
                  {inv.status === 'unpaid' && (!isAdmin || inv.user?.id === user?.id) && (
                    <a href={`/pay/${inv.id}`} className="flex-1 py-3 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-xl text-center shadow-lg shadow-primary-500/20">BAYAR</a>
                  )}
                  {inv.status === 'pending_verification' && isAdmin && (
                    <button onClick={() => setVerifyModal({ open: true, invoice: inv })} className="flex-1 py-3 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-xl text-center shadow-lg shadow-amber-500/20">VERIFIKASI</button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(inv)} className="px-4 py-3 rounded-xl border border-gray-100 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
               </div>
             </div>
           ))}
        </div>
        {meta.totalPages > 1 && <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Menampilkan {invoices.length} dari {meta.total} tagihan</p>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 text-xs rounded-lg font-semibold transition-colors ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{i + 1}</button>
            ))}
          </div>
        </div>}
      </div>

      {/* Support Section */}
      <div className="card p-8">
        <p className="text-primary-600 text-[11px] font-bold uppercase tracking-widest mb-2 px-1">Support Center</p>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">Butuh Bantuan dengan Pembayaran?</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-lg">Jika anda mengalami kendala teknis saat melakukan pembayaran, tim support kami siap membantu 24/7.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-emerald-500/10 rounded-xl transition-colors">
            <Phone className="w-5 h-5 text-green-600 dark:text-emerald-400" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Chat ke WhatsApp</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">+62 812-3456-7890</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl transition-colors">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Email Support</p>
              <p className="font-bold text-gray-900 dark:text-white text-sm">finance@kinetic-tkd.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {modal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#1c2434] rounded-3xl overflow-hidden shadow-2xl animate-scale-in border border-transparent dark:border-[#2a3447]" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] flex items-center justify-between bg-white dark:bg-[#1c2434]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Buat Tagihan Baru</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#0b1120] text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5">
                {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Anggota <span className="text-red-500">*</span></label>
                  <select required value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm cursor-pointer">
                    <option value="">Pilih anggota...</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Deskripsi / Judul <span className="text-red-500">*</span></label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="Contoh: Iuran Bulanan April" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Nominal (Rp) <span className="text-red-500">*</span></label>
                    <input type="number" required min={1} value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Batas Waktu <span className="text-red-500">*</span></label>
                    <input type="date" required value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 p-6 border-t border-gray-100 dark:border-[#2a3447] bg-gray-50 dark:bg-[#0b1120]/50 shrink-0">
                <button type="button" onClick={() => setModal(false)} className="px-6 py-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-[#2a3447] text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1c2434] transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-500 disabled:opacity-50 transition-all active:scale-95">
                  {saving ? 'Memproses...' : 'Buat Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>, 
        document.body
      )}

      {/* Verify Modal */}
      {verifyModal.open && verifyModal.invoice && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#1c2434] rounded-2xl shadow-2xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden border border-transparent dark:border-[#2a3447]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] flex items-center justify-between shrink-0 bg-gray-50 dark:bg-[#0b1120]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Verifikasi Pembayaran</h2>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest font-mono">INV-{verifyModal.invoice.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setVerifyModal({ open: false, invoice: null })} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#1c2434] text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Table */}
              <div className="bg-gray-50 dark:bg-[#0b1120] rounded-2xl p-5 border border-gray-100 dark:border-[#2a3447] space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Anggota</span>
                   <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{verifyModal.invoice.user?.name}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Deskripsi</span>
                   <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-none">{verifyModal.invoice.title}</span>
                 </div>
                 <div className="pt-3 mt-3 border-t border-gray-200 dark:border-[#2a3447] flex justify-between items-center">
                   <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Nominal</span>
                   <span className="text-xl font-black text-primary-600 dark:text-primary-400 leading-none">Rp {Number(verifyModal.invoice.amount).toLocaleString('id-ID')}</span>
                 </div>
              </div>
              
              {/* Proof Image */}
              <div>
                 <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-3 text-center">Bukti Transfer Anggota</span>
                 {verifyModal.invoice.paymentProof ? (
                   <div className="rounded-2xl overflow-hidden border-2 border-gray-100 dark:border-[#0b1120] shadow-sm bg-gray-50 dark:bg-[#0b1120]">
                     <img 
                       src={`http://localhost:5000/uploads/proofs/${verifyModal.invoice.paymentProof}`} 
                       alt="Bukti Transfer" 
                       className="w-full h-auto object-contain max-h-[40vh] mx-auto" 
                       onClick={() => window.open(`http://localhost:5000/uploads/proofs/${verifyModal.invoice.paymentProof}`, '_blank')}
                     />
                     <p className="text-[10px] text-gray-400 text-center py-2 bg-white/50 dark:bg-black/20 italic">Klik gambar untuk melihat ukuran penuh</p>
                   </div>
                 ) : (
                   <div className="py-12 px-6 text-center bg-gray-50 dark:bg-[#0b1120] rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#2a3447]">
                      <FileWarning className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-gray-400">Tidak ada lampiran bukti transfer.</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase">Mungkin dilakukan via tunai atau metode lain.</p>
                   </div>
                 )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-[#2a3447] bg-gray-50/80 dark:bg-[#0b1120]/80 flex flex-col sm:flex-row gap-3">
               <button 
                 onClick={() => handleVerify(verifyModal.invoice, false)} 
                 disabled={saving} 
                 className="flex-1 py-3.5 px-6 rounded-xl border border-red-500/30 text-red-600 font-bold text-xs uppercase tracking-[0.2em] hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50"
               >
                 TOLAK
               </button>
               <button 
                 onClick={() => handleVerify(verifyModal.invoice, true)} 
                 disabled={saving} 
                 className="flex-[2] py-3.5 px-6 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
               >
                 {saving ? 'MEMPROSES...' : 'TERIMA & KONFIRMASI'}
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-[#2a3447]" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100 dark:border-red-900/50">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hapus Tagihan?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Tindakan ini permanen. Data tagihan <strong>{confirmDelete.title}</strong> akan dihapus selamanya.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                   onClick={() => setConfirmDelete(null)}
                   className="py-3 px-4 rounded-xl border border-gray-200 dark:border-[#2a3447] text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1c2434] transition-all"
                >
                  Batal
                </button>
                <button 
                   onClick={executeDelete}
                   className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
