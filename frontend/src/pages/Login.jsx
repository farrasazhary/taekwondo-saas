import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const { settings } = useSettings();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        // Format phone number to +62...
        let cleanPhone = form.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        if (cleanPhone.startsWith('62')) cleanPhone = cleanPhone.substring(2);
        const formattedPhone = `+62${cleanPhone}`;
        await register({ ...form, phone: formattedPhone });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy-950 items-end p-12">
        <img src="/images/login-bg.png" alt="Taekwondo" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-0.5 bg-primary-500" />
            <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest">Elite Performance</span>
          </div>
          <h2 className="text-5xl font-extrabold text-white leading-tight mb-4">
            LEBIH DARI<br /><span className="text-primary-500">DISIPLIN.</span>
          </h2>
          <p className="text-navy-300 max-w-md leading-relaxed">
            Bergabunglah dengan komunitas elit {settings.clubName || 'KINETIC'}. Bentuk kekuatan fisik dan ketangguhan mental melalui seni Taekwondo yang presisi.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          <h1 className="text-2xl font-extrabold text-primary-600 tracking-wider mb-8 uppercase">{settings.clubName || 'KINETIC'}</h1>

          {/* Tabs */}
          <div className="flex gap-6 mb-8 border-b border-gray-200">
            <button onClick={() => { setTab('login'); setError(''); }}
              className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors ${tab === 'login' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-600'}`}>
              Masuk
            </button>
            <button onClick={() => { setTab('register'); setError(''); }}
              className={`pb-3 text-sm font-semibold uppercase tracking-wider transition-colors ${tab === 'register' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-400 hover:text-gray-600'}`}>
              Daftar
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{tab === 'login' ? 'Selamat Datang Kembali' : 'Pendaftaran Kandidat'}</h2>
            <p className="text-gray-500 text-sm mt-1">{tab === 'login' ? 'Masukkan kredensial Anda untuk mengakses dojang digital.' : 'Buat akun Anda untuk memulai perjalanan sebagai kandidat.'}</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" placeholder="Nama lengkap" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Nomor HP / WhatsApp</label>
                  <div className="flex items-center">
                    <div className="px-3 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-500 font-bold text-sm">
                      +62
                    </div>
                    <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9]/g, '') })}
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all font-medium" placeholder="8xxxxxxxxxx" />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" placeholder="nama@email.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Kata Sandi</label>
                {tab === 'login' && (
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary-600 hover:text-primary-500 transition-colors">Lupa Password?</Link>
                )}
              </div>
              <input type="password" required minLength={tab === 'register' ? 8 : 1} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-primary-600/20">
              {loading ? 'Memproses...' : tab === 'login' ? 'MASUK' : 'DAFTAR'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/landing" className="text-sm text-gray-400 hover:text-primary-600 transition-colors">← Kembali ke beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
