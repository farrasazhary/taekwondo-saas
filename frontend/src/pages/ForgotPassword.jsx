import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await forgotPassword({ email });
      setMessage(data.message || 'Instruksi telah dikirim ke email Anda.');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim email. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120] px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white dark:bg-[#1c2434] rounded-3xl shadow-xl border border-gray-100 dark:border-[#2a3447] p-8 md:p-10">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Login
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lupa Kata Sandi?</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Jangan khawatir! Masukkan alamat email Anda dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
          </p>

          {message ? (
            <div className="text-center py-4 space-y-4 animate-scale-in">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Silakan periksa folder kotak masuk atau spam email Anda.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'KIRIM TAUTAN RESET'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
