import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers, getUserStats, createUser, updateUser, deleteUser } from '../api/users';
import { getBelts } from '../api/belts';
import { UserPlus, Search, Edit, Trash2, X, AlertCircle, Users, Star, GraduationCap, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import MemberStatCard from '../components/MemberStatCard';
import Skeleton, { TableSkeleton, CardSkeleton } from '../components/Skeleton';

const roleLabel = { club_admin: 'Admin', member_reguler: 'Reguler', member_private: 'Private', candidate: 'Candidate' };

export default function Members() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'club_admin' || currentUser?.role === 'superadmin';

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, privateCount: 0, regularCount: 0, newRegistrations: 0 });
  const [belts, setBelts] = useState([]);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [beltFilter, setBeltFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member_reguler', phone: '', currentBeltId: '', status: 'active' });
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        currentBeltId: beltFilter || undefined
      });
      setUsers(data.data);
      setMeta(data.meta);
    } catch (err) {
      console.error('Fetch users error:', err);
      setFetchError(err.response?.data?.message || 'Gagal mengambil data anggota. Kemungkinan masalah izin atau server.');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, beltFilter]);

  const fetchStatsAndBelts = async () => {
    try {
      const [statsRes, beltsRes] = await Promise.all([getUserStats(), getBelts()]);
      setStats(statsRes.data.data);
      setBelts(beltsRes.data.data);
    } catch (err) {
      console.error('Fetch stats/belts error:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.role !== 'candidate') {
      fetchStatsAndBelts();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role !== 'candidate') {
      fetchUsers();
    }
  }, [fetchUsers, currentUser]);

  const openCreate = () => {
    if (!isAdmin) return;
    setForm({ name: '', email: '', password: '', role: 'member_reguler', phone: '', currentBeltId: '', status: 'active' });
    setError('');
    setModal({ open: true, mode: 'create', data: null });
  };

  const openEdit = (u) => {
    if (!isAdmin) return;
    
    // Strip prefix for display if it exists
    let displayPhone = u.phone || '';
    if (displayPhone.startsWith('+62')) displayPhone = displayPhone.substring(3);

    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      phone: displayPhone,
      currentBeltId: u.currentBeltId || '',
      status: u.status || 'active'
    });
    setError('');
    setModal({ open: true, mode: 'edit', data: u });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Format phone number
      let cleanPhone = form.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
      if (cleanPhone.startsWith('62')) cleanPhone = cleanPhone.substring(2);
      const formattedPhone = `+62${cleanPhone}`;

      if (modal.mode === 'create') {
        await createUser({ ...form, phone: formattedPhone, currentBeltId: form.currentBeltId ? Number(form.currentBeltId) : null });
      } else {
        const payload = {
          name: form.name,
          email: form.email,
          phone: formattedPhone,
          role: form.role,
          currentBeltId: form.currentBeltId ? Number(form.currentBeltId) : null,
          status: form.status
        };
        await updateUser(modal.data.id, payload);
      }
      setModal({ open: false, mode: 'create', data: null });
      fetchUsers();
      fetchStatsAndBelts();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = (u) => {
    setConfirmDelete(u);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteUser(confirmDelete.id);
      fetchUsers();
      fetchStatsAndBelts();
      setConfirmDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-primary-600 uppercase tracking-[0.3em] px-1">Database Utama</p>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-tight">Daftar Seluruh Anggota</h1>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
              <button onClick={openCreate} className="flex items-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all shadow-xl shadow-primary-600/20 active:scale-95">
                <UserPlus className="w-4 h-4" /> Tambah Anggota Baru
              </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <MemberStatCard label="Total Anggota" value={stats.total} icon={Users} colorClass="bg-red-50 text-red-500" />
            <MemberStatCard label="Anggota Private" value={stats.privateCount} icon={Star} colorClass="bg-blue-50 text-blue-500" subtext="Program latihan eksklusif" />
            <MemberStatCard label="Anggota Reguler" value={stats.regularCount} icon={GraduationCap} colorClass="bg-navy-50 text-navy-500" subtext="Program latihan terjadwal" />
            <MemberStatCard label="Pendaftar Baru" value={stats.newRegistrations} icon={Clock} colorClass="bg-amber-50 text-amber-500" subtext="Terdaftar bulan ini" />
          </>
        )}
      </div>

      {/* Advanced Filter Section */}
      <div className="bg-white dark:bg-[#1c2434] p-6 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative group">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Cari Anggota</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-navy-500 group-focus-within:text-primary-500" />
              <input type="text" placeholder="Nama atau ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-navy-900/50 border border-gray-100 dark:border-navy-800 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-navy-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Tipe Member</label>
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-navy-900/50 border border-gray-100 dark:border-navy-800 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-navy-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer">
              <option value="">Semua Tipe</option>
              <option value="member_reguler">Reguler</option>
              <option value="member_private">Private</option>
              <option value="candidate">Candidate</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Sabuk (Rank)</label>
            <select value={beltFilter} onChange={e => { setBeltFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-navy-900/50 border border-gray-100 dark:border-navy-800 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:bg-white dark:focus:bg-navy-900 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer">
              <option value="">Semua Sabuk</option>
              {belts.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c2434] rounded-3xl border border-gray-100 dark:border-transparent shadow-sm overflow-hidden min-h-[400px] flex flex-col transition-colors duration-300">
        {/* Status Messages (Error / Permission) */}
        {(fetchError || currentUser?.role === 'candidate') && (
          <div className={`m-4 md:m-8 p-8 md:p-12 rounded-3xl border flex flex-col items-center text-center transition-all ${currentUser?.role === 'candidate' ? 'bg-gray-50 dark:bg-navy-900/10 border-gray-100 dark:border-navy-800' : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-900/50'}`}>
            <AlertCircle className={`w-12 h-12 mb-4 ${currentUser?.role === 'candidate' ? 'text-gray-300 dark:text-navy-700' : 'text-red-500'}`} />
            <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed max-w-md ${currentUser?.role === 'candidate' ? 'text-gray-500 dark:text-navy-400' : 'text-red-700 dark:text-red-400'}`}>
              {currentUser?.role === 'candidate'
                ? 'Kandidat tidak dapat melihat daftar anggota. Hanya member yang dapat melihat daftar anggota.'
                : fetchError}
            </p>
            {currentUser?.role !== 'candidate' && fetchError && (
              <button onClick={() => { setFetchError(''); fetchUsers(); }} className="mt-6 px-6 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all">
                Coba Lagi
              </button>
            )}
          </div>
        )}

        <div className={`hidden md:block overflow-x-auto flex-1 ${(fetchError || currentUser?.role === 'candidate') ? 'hidden' : ''}`}>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 dark:text-navy-400 uppercase tracking-widest border-b border-gray-50 dark:border-navy-800 bg-gray-50/30 dark:bg-navy-900/20">
                <th className="px-8 py-5">Nama Anggota</th>
                <th className="px-6 py-5 text-center">Tipe</th>
                <th className="px-6 py-5 text-center">Sabuk</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5 text-right px-8">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-navy-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10">
                    <TableSkeleton rows={8} cols={5} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-8 py-20 text-center text-gray-400 italic text-sm">Tidak ada data anggota ditemukan...</td></tr>
              ) : users.map(u => u && (
                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-navy-900/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-navy-800 flex items-center justify-center font-bold text-gray-500 dark:text-navy-400 overflow-hidden shrink-0 border-2 border-white dark:border-navy-900 shadow-sm ring-1 ring-gray-100 dark:ring-navy-800">
                        {u.profileImage ? (
                          <img src={`http://localhost:5000/uploads/profiles/${u.profileImage}`} className="w-full h-full object-cover" alt={u.name} />
                        ) : u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{u.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-navy-500 uppercase">ID: {u.id?.split('-')[0] || '...'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center text-center px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border leading-tight ${u.role === 'member_private' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50' : u.role === 'club_admin' ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-900/50' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'}`}>
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600 dark:text-navy-300">
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-2.5 rounded shadow-sm border dark:border-navy-700" style={{ backgroundColor: u.belt?.color || '#eee' }} />
                       {u.belt?.name || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${u.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                        {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && (
                        <>
                          <button onClick={() => openEdit(u)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-400 dark:text-navy-500 hover:text-gray-900 dark:hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(u)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className={`md:hidden p-4 space-y-4 bg-gray-50/10 dark:bg-navy-900/5 ${(fetchError || currentUser?.role === 'candidate') ? 'hidden' : ''}`}>
          {loading ? (
             <div className="space-y-4">
               <CardSkeleton />
               <CardSkeleton />
               <CardSkeleton />
             </div>
          ) : users.length === 0 ? (
             <div className="py-20 text-center text-gray-400 italic text-sm">Tidak ada data anggota...</div>
          ) : users.map(u => u && (
            <div key={u.id} className="bg-white dark:bg-[#1c2434] border border-gray-100 dark:border-navy-800 rounded-2xl p-5 space-y-4 shadow-sm active:scale-[0.98] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-navy-800 flex items-center justify-center font-bold text-gray-500 dark:text-navy-400 overflow-hidden shrink-0 border-2 border-white dark:border-navy-900 shadow-sm ring-1 ring-gray-100 dark:ring-navy-800">
                    {u.profileImage ? (
                      <img src={`http://localhost:5000/uploads/profiles/${u.profileImage}`} className="w-full h-full object-cover" alt={u.name} />
                    ) : u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">{u.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {u.id?.split('-')[0] || '...'}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center justify-center text-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border leading-tight ${u.status === 'active' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border-green-100' : 'bg-gray-100 dark:bg-navy-800 text-gray-400 border-gray-200'}`}>
                    {u.status === 'active' ? 'AKTIF' : 'NONAKTIF'}
                  </span>
                  <span className={`inline-flex items-center justify-center text-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border leading-tight ${u.role === 'member_private' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {roleLabel[u.role] || u.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-gray-50 dark:bg-[#0b1120] rounded-xl border border-gray-100 dark:border-navy-800">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sabuk / Rank</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-2 rounded-sm" style={{ backgroundColor: u.belt?.color || '#eee' }} />
                    <span className="text-xs font-black text-gray-700 dark:text-navy-300">{u.belt?.name || '—'}</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-[#0b1120] rounded-xl border border-gray-100 dark:border-navy-800">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Terdaftar</p>
                  <p className="text-xs font-black text-gray-700 dark:text-navy-300">
                    {new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-2">
                  <button onClick={() => openEdit(u)} className="flex-1 py-3.5 bg-gray-50 dark:bg-[#0b1120] text-gray-400 dark:text-navy-400 rounded-xl flex items-center justify-center gap-2 border border-gray-200 dark:border-navy-800 active:bg-gray-100">
                    <Edit className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Edit Profil</span>
                  </button>
                  <button onClick={() => handleDelete(u)} className="px-4 py-3.5 bg-red-50 dark:bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center border border-red-100 dark:border-red-900/50 active:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Improved Pagination Footer */}
        <div className="px-8 py-6 border-t border-gray-50 dark:border-navy-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/10 dark:bg-navy-900/10">
          <p className="text-[10px] font-black text-gray-400 dark:text-navy-500 uppercase tracking-widest">
            Menampilkan {Math.min((page - 1) * 10 + 1, meta.total)} - {Math.min(page * 10, meta.total)} dari {meta.total} data
          </p>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl border border-gray-100 dark:border-navy-800 text-gray-400 dark:text-navy-500 hover:bg-white dark:hover:bg-navy-800 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(Math.max(0, Math.floor(meta.totalPages || 0)))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${page === i + 1 ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white dark:bg-navy-900 border border-gray-100 dark:border-navy-800 text-gray-400 dark:text-navy-500 hover:border-primary-500/30 hover:text-primary-600'}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={page === meta.totalPages} onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl border border-gray-100 dark:border-navy-800 text-gray-400 dark:text-navy-500 hover:bg-white dark:hover:bg-navy-800 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal.open && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-6">
          <div className="w-full max-w-xl bg-white dark:bg-[#1c2434] rounded-2xl shadow-xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden border border-transparent dark:border-[#2a3447]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] shrink-0 bg-white dark:bg-[#1c2434]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modal.mode === 'create' ? 'Tambah Anggota' : 'Edit Anggota'}</h2>
              <button onClick={() => setModal({ ...modal, open: false })} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}

                {modal.mode === 'create' ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap <span className="text-red-500">*</span></label>
                      <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="Nama Lengkap Anggota" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Email <span className="text-red-500">*</span></label>
                        <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="email@example.com" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Nomor HP/WA <span className="text-red-500">*</span></label>
                        <div className="flex items-center">
                          <div className="px-3 py-3 bg-gray-100 dark:bg-[#0b1120] border border-r-0 border-gray-200 dark:border-[#2a3447] rounded-l-xl text-gray-500 dark:text-gray-400 font-bold text-sm">
                            +62
                          </div>
                          <input type="text" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-r-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="8..." />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Password <span className="text-red-500">*</span></label>
                      <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="••••••••" />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-2xl mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                        {form.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{form.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{form.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Role / Program</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all shadow-sm cursor-pointer">
                      <option value="member_reguler">Reguler</option>
                      <option value="member_private">Private</option>
                      <option value="candidate">Candidate</option>
                      <option value="club_admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Sabuk / Rank</label>
                    <select value={form.currentBeltId} onChange={e => setForm({ ...form, currentBeltId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all shadow-sm cursor-pointer">
                      <option value="">Tidak ada</option>
                      {belts.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                {modal.mode === 'edit' && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Status Keanggotaan</label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button type="button" onClick={() => setForm({ ...form, status: 'active' })} className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'active' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-900/50 text-green-600 dark:text-green-400 shadow-sm' : 'bg-white dark:bg-[#1c2434] border-gray-100 dark:border-[#2a3447] text-gray-400 dark:text-gray-500 hover:border-gray-200'}`}>
                        Aktif
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, status: 'inactive' })} className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'inactive' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 shadow-sm' : 'bg-white dark:bg-[#1c2434] border-gray-100 dark:border-[#2a3447] text-gray-400 dark:text-gray-500 hover:border-gray-200'}`}>
                        Nonaktif
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 p-6 border-t border-gray-100 dark:border-[#2a3447] bg-gray-50 dark:bg-[#0b1120]/50 shrink-0">
                <button type="button" onClick={() => setModal({ ...modal, open: false })} className="px-6 py-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-[#2a3447] text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1c2434] transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold rounded-xl bg-[#0c1324] dark:bg-primary-600 text-white shadow-lg shadow-gray-200 dark:shadow-primary-900/20 hover:bg-black dark:hover:bg-primary-500 disabled:opacity-50 transition-all active:scale-95">
                  {saving ? 'Menyimpan...' : modal.mode === 'create' ? 'Daftarkan Anggota' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Member Modal */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-[#1c2434] rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-[#2a3447]" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100 dark:border-red-900/50">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hapus Anggota?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Profil anggota <strong>{confirmDelete.name}</strong> akan dihapus selamanya.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                   onClick={() => setConfirmDelete(null)}
                   className="py-3 px-4 rounded-xl border border-gray-200 dark:border-[#2a3447] text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#0b1120] transition-all"
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
