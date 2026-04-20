import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSettings, updateSettings } from '../api/settings';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import MessageCard from '../components/MessageCard';
import { useSettings } from '../context/SettingsContext';
import { TableSkeleton } from '../components/Skeleton';

export default function Settings() {
  const { refreshSettings } = useSettings();
  const [form, setForm] = useState({ clubName: '', logoUrl: '', midtransServerKey: '', midtransClientKey: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await getSettings();
      const s = data.data;
      setForm({ clubName: s.clubName || '', logoUrl: s.logoUrl || '', midtransServerKey: s.midtransServerKey || '', midtransClientKey: s.midtransClientKey || '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      await updateSettings({ ...form, logoUrl: form.logoUrl || null, midtransServerKey: form.midtransServerKey || null, midtransClientKey: form.midtransClientKey || null });
      await refreshSettings();
      setSuccess('Pengaturan berhasil disimpan!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan.'); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="max-w-2xl space-y-8 py-6">
      <TableSkeleton rows={3} cols={1} />
      <TableSkeleton rows={3} cols={1} />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div><h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">Pengaturan</h1><p className="text-gray-500 dark:text-gray-400 text-sm mt-1 px-1">Konfigurasi club dan payment gateway</p></div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Informasi Club</h2>
          <div><label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Nama Club</label><input type="text" value={form.clubName} onChange={e => setForm({...form, clubName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" /></div>
          <div><label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Logo URL</label><input type="text" value={form.logoUrl} onChange={e => setForm({...form, logoUrl: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" placeholder="https://..." /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Payment Gateway (Midtrans)</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">Konfigurasi kunci Midtrans untuk pembayaran otomatis.</p>
          <div><label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Server Key</label><input type="password" value={form.midtransServerKey} onChange={e => setForm({...form, midtransServerKey: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-mono" placeholder="SB-Mid-server-xxx" /></div>
          <div><label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Client Key</label><input type="text" value={form.midtransClientKey} onChange={e => setForm({...form, midtransClientKey: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 font-mono" placeholder="SB-Mid-client-xxx" /></div>
        </div>

        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-lg transition-all shadow-sm disabled:opacity-50">
          <Save className="w-4 h-4" />{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>

      {/* Success Popup Card */}
      {success && (
        <MessageCard 
          message={success} 
          onClose={() => setSuccess('')} 
          submessage="Konfigurasi sistem telah diperbarui secara aman."
        />
      )}
    </div>
  );
}
