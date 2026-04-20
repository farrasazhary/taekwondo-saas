import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getUsers, updateUser, deleteUser } from '../api/users';
import { Search, UserRoundPlus, Mail, Phone, Calendar, ArrowRight, UserCheck, Edit, Trash2, X, ShieldCheck } from 'lucide-react';
import Skeleton, { TableSkeleton, CardSkeleton } from '../components/Skeleton';

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, type: '', data: null });
  const [confirmRole, setConfirmRole] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, [search]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const { data } = await getUsers({ role: 'candidate', search });
      setCandidates(data.data);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (role) => {
    setSaving(true);
    try {
      await updateUser(modal.data.id, { role });
      setModal({ open: false, type: '', data: null });
      setConfirmRole(null);
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah kriteria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteUser(modal.data.id);
      setModal({ open: false, type: '', data: null });
      fetchCandidates();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kandidat.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">Daftar Kandidat</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 px-1">Kelola pendaftar yang sedang dalam tahap administrasi</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#0b1120]/50 border-b border-gray-100 dark:border-[#2a3447]">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Kandidat</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Kontak</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tgl Bergabung</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8">
                    <TableSkeleton rows={5} cols={4} />
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-[#0b1120] rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserRoundPlus className="w-6 h-6 text-gray-300 dark:text-[#2a3447]" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada kandidat ditemukan.</p>
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-[#0b1120]/50 transition-colors group border-b border-transparent dark:border-[#2a3447]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                          {c.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{c.name}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">ID: {c.id?.split('-')[0] || '...'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <Mail className="w-3.5 h-3.5" /> {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <Phone className="w-3.5 h-3.5" /> {c.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 uppercase font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setModal({ open: true, type: 'edit', data: c })}
                          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1c2434] text-gray-400 dark:text-gray-500 hover:text-primary-600 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setModal({ open: true, type: 'delete', data: c })}
                          className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden p-4 space-y-4 bg-gray-50/50 dark:bg-[#0b1120]/50 min-h-[100px]">
           {loading ? (
             <div className="space-y-4">
               <CardSkeleton />
               <CardSkeleton />
               <CardSkeleton />
             </div>
           ) : candidates.length === 0 ? (
             <div className="py-12 text-center text-gray-400">Tidak ada kandidat.</div>
           ) : candidates.map((c) => c && (
             <div key={c.id} className="bg-white dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-2xl p-5 space-y-4 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-sm border border-primary-100 dark:border-primary-900/50">
                    {c.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white leading-tight">{c.name}</h3>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">ID: {c.id?.split('-')[0] || '...'}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-[#0b1120] rounded-xl border border-gray-100 dark:border-[#2a3447] space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 font-medium">
                    <Mail className="w-4 h-4 text-gray-400" /> {c.email}
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 font-medium">
                      <Phone className="w-4 h-4 text-gray-400" /> {c.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 uppercase font-bold tracking-widest pt-1 px-1">
                    <Calendar className="w-4 h-4" />
                    Bergabung {new Date(c.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => setModal({ open: true, type: 'edit', data: c })} className="flex-1 py-3.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary-500/20">
                    UPGRADE
                  </button>
                  <button onClick={() => setModal({ open: true, type: 'delete', data: c })} className="px-4 py-3.5 bg-red-50 dark:bg-red-500/10 text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-primary-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-xl shadow-primary-900/20">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <UserCheck className="w-24 h-24" />
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden md:flex w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl items-center justify-center">
            <UserRoundPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">Tips Follow Up</h3>
            <p className="text-primary-100 text-sm mt-1 max-w-lg leading-relaxed">
              Kandidat biasanya membutuhkan penjelasan mengenai jenis latihan dan administrasi awal. Gunakan data kontak di atas untuk menjangkau mereka via WhatsApp atau Email.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {modal.open && modal.type === 'edit' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center bg-gradient-to-br from-primary-600 to-primary-800 text-white relative">
              <div className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer" onClick={() => setModal({ open: false, type: '', data: null })}>
                <X className="w-5 h-5" />
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
                 <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-widest">Ubah Kriteria</h2>
              <p className="text-primary-100 text-xs mt-1 font-medium italic opacity-80">Mengubah status {modal.data?.name}</p>
            </div>
            <div className="p-8 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-6">Pilih jenis keanggotaan untuk memindahkan kandidat ini ke daftar anggota resmi.</p>
              
              <button 
                 onClick={() => setConfirmRole('member_reguler')}
                 disabled={saving}
                 className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1c2434] border-2 border-transparent hover:border-primary-500/50 hover:bg-white dark:hover:bg-[#0b1120] text-left transition-all group shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">Member Reguler</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Akses latihan terjadwal standar.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-all translate-x-0 group-hover:translate-x-1" />
                </div>
              </button>

              <button 
                 onClick={() => setConfirmRole('member_private')}
                 disabled={saving}
                 className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1c2434] border-2 border-transparent hover:border-emerald-500/50 hover:bg-white dark:hover:bg-[#0b1120] text-left transition-all group shadow-sm disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white uppercase text-xs tracking-wider">Member Private</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Sesi latihan eksklusif dan intensif.</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
                </div>
              </button>

              <button 
                onClick={() => setModal({ open: false, type: '', data: null })}
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Delete Modal */}
      {modal.open && modal.type === 'delete' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hapus Kandidat?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Data <strong>{modal.data?.name}</strong> akan dihapus permanen.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                   onClick={() => setModal({ open: false, type: '', data: null })}
                   className="py-3 px-4 rounded-xl border border-gray-100 dark:border-[#2a3447] text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1c2434] transition-all"
                >
                  Batal
                </button>
                <button 
                   onClick={handleDelete}
                   disabled={saving}
                   className="py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {/* Upgrade Confirmation Modal */}
      {confirmRole && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Konfirmasi Perubahan</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Apakah anda ingin mengubah kategori kandidat menjadi <span className="text-primary-600 dark:text-primary-400 font-bold">member {confirmRole === 'member_reguler' ? 'reguler' : 'private'}</span>?
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                   onClick={() => setConfirmRole(null)}
                   className="py-3 px-4 rounded-xl border border-gray-100 dark:border-[#2a3447] text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1c2434] transition-all"
                >
                  Tidak
                </button>
                <button 
                   onClick={() => handleUpgrade(confirmRole)}
                   disabled={saving}
                   className="py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-50"
                >
                  {saving ? 'Memproses...' : 'Iya'}
                </button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
