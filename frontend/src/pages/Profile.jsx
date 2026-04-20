import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBelts } from '../api/belts';
import { updateUser } from '../api/users';
import { requestMembershipUpgrade } from '../api/membership';
import { Save, AlertCircle, CheckCircle, User, Mail, Phone as PhoneIcon, Award, MapPin, Calendar, Camera, ChevronRight, Info, Edit3, ArrowLeft } from 'lucide-react';
import MessageCard from '../components/MessageCard';

export default function Profile() {
  const { user, checkAuth } = useAuth();
  const [belts, setBelts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birthPlace: '',
    birthDate: ''
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const [upgrading, setUpgrading] = useState(false);
  const [upgradeType, setUpgradeType] = useState('reguler');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthPlace: user.birthPlace || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''
      });
      if (user.profileImage) {
        setPreview(`http://localhost:5000/uploads/profiles/${user.profileImage}`);
      }
    }
    getBelts().then(r => setBelts(r.data.data));
  }, [user]);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone || '');
      formData.append('gender', form.gender || '');
      formData.append('birthPlace', form.birthPlace || '');
      formData.append('birthDate', form.birthDate || '');
      if (file) formData.append('profileImage', file);

      await updateUser(user.id, formData);
      await checkAuth();
      setSuccess('Profil berhasil diperbaharui!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan.'); } finally { setSaving(false); }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthPlace: user.birthPlace || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''
      });
      setPreview(user.profileImage ? `http://localhost:5000/uploads/profiles/${user.profileImage}` : null);
      setFile(null);
    }
    setIsEditing(false);
  };

  const handleUpgrade = async () => {
    setError(''); setUpgrading(true);
    try {
      const { data } = await requestMembershipUpgrade(upgradeType);
      window.location.href = `/pay/${data.data.id}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat invoice pendaftaran.');
      setUpgrading(false);
    }
  };

  const currentBelt = belts.find(b => b.id === user?.currentBeltId);

  const roleLabels = {
    candidate: 'Calon Anggota (Kandidat)',
    member_reguler: 'Member Reguler',
    member_private: 'Member Private',
    club_admin: 'Administrator',
    superadmin: 'Super Admin'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-100 dark:border-[#2a3447]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            {isEditing ? 'Ubah Profil' : 'Profil Saya'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-1 uppercase tracking-widest font-bold flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-primary-500" /> {isEditing ? 'Perbarui informasi identitas beladiri Anda' : 'Kelola informasi akun dan status keanggotaan'}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-95 group"
          >
            <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Edit Profil
          </button>
        )}
        {isEditing && (
          <button
            onClick={handleCancel}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-[#1c2434] border border-gray-200 dark:border-[#2a3447] text-gray-600 dark:text-gray-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-[#0b1120] active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-8 text-center flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-primary-600"></div>

            {/* Avatar Upload */}
            <div className="relative group/avatar mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-[#2a3447] shadow-xl bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center transition-transform group-hover/avatar:scale-105 duration-500">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-200" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -right-2 -bottom-2 w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border-4 border-white">
                <Camera className="w-5 h-5" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</h2>
            <p className="text-[11px] font-bold text-primary-600 uppercase tracking-widest mt-2 mb-6 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/10 rounded-full inline-block">
              {roleLabels[user?.role] || 'Member'}
            </p>

            {/* Belt Summary Card */}
            <div className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all hover:shadow-md ${currentBelt ? 'bg-white dark:bg-[#1c2434] border-gray-100 dark:border-transparent' : 'bg-gray-50 dark:bg-[#0b1120] border-gray-200 dark:border-[#2a3447] border-dashed'}`}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                style={{ backgroundColor: currentBelt?.color || '#F3F4F6', border: currentBelt?.color?.toUpperCase() === '#FFFFFF' ? '1px solid #E5E7EB' : 'none' }}>
                <Award className={`w-6 h-6 ${currentBelt?.color?.toUpperCase() === '#FFFFFF' ? 'text-gray-400' : 'text-white'}`} />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Status Sabuk</p>
                <p className="font-bold text-gray-900 dark:text-white text-[13px] leading-none">{currentBelt?.name || 'Belum Ditentukan'}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats or Info could go here */}
        </div>

        {/* Right Column: Information Display / Form */}
        <div className="lg:col-span-2 space-y-6">
          {!isEditing ? (
            <div className="space-y-6">
              {/* Personal Info Card */}
              <div className="card p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 shadow-lg shadow-gray-200 dark:shadow-none">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Informasi Personal</h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Detail identitas Anda</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nama Lengkap</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{user?.name || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Gender</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{user?.gender || 'Belum diatur'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Alamat Email</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{user?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nomor Telepon</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{user?.phone || 'Belum diatur'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Tempat Lahir</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">{user?.birthPlace || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Tanggal Lahir</p>
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                      {user?.birthDate ? new Date(user.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security/Account Card */}
              <div className="card p-8 bg-gray-50/50 dark:bg-[#0b1120]/30 border-dashed border-2 border-gray-100 dark:border-[#2a3447]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600">
                       <Info className="w-5 h-5" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900 dark:text-white">Butuh bantuan?</p>
                       <p className="text-xs text-gray-400">Hubungi admin klub jika Anda ingin mengubah alamat email atau data permanen lainnya.</p>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Perbarui Informasi Personal</h3>
                </div>

                {error && <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm animate-shake"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm font-semibold focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                        Gender <span className="text-[10px] text-gray-300 italic font-medium tracking-normal">(Opsional)</span>
                      </label>
                      <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm font-semibold focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all cursor-pointer">
                        <option value="">Pilih Gender</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Alamat Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type="email" value={form.email} readOnly
                          className="w-full pl-11 pr-4 py-3 bg-gray-100 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl text-gray-400 dark:text-gray-500 text-sm font-medium cursor-not-allowed" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Nomor Telepon</label>
                      <div className="relative group">
                        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                        <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm font-semibold focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" placeholder="08xxxxxxxxxx" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Tempat Lahir
                      </label>
                      <input type="text" value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm font-semibold focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all" placeholder="Kota / Kabupaten" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> Tanggal Lahir
                      </label>
                      <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm font-semibold focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer" />
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-50 dark:border-[#2a3447] flex justify-end gap-4">
                    <button type="button" onClick={handleCancel}
                      className="px-8 py-3.5 border border-gray-200 dark:border-[#2a3447] text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-[#0b1120] active:scale-95">
                      Batal
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-2 px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? 'Memproses...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Membership Upgrade Section for Candidates */}
          {user?.role === 'candidate' && (
            <div className="card p-10 bg-white dark:bg-[#0c1324] text-gray-900 dark:text-white overflow-hidden relative group border-2 border-primary-100 dark:border-transparent">
              <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Award className="w-40 h-40" />
              </div>

              <div className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">GABUNG JADI MEMBER RESMI</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 leading-relaxed max-w-lg">
                    Dapatkan akses penuh ke fitur latihan, ujian sabuk, dan riwayat prestasi Anda. Pilih paket keanggotaan sekarang.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <button type="button" onClick={() => setUpgradeType('reguler')}
                    className={`group/card p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden ${upgradeType === 'reguler' ? 'border-primary-500 bg-primary-50 dark:bg-primary-600/10 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08]'}`}>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover/card:scale-110 ${upgradeType === 'reguler' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500'}`}>
                          <User className="w-5 h-5" />
                        </div>
                        {upgradeType === 'reguler' && <div className="w-2.5 h-2.5 rounded-full bg-primary-600 animate-pulse"></div>}
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${upgradeType === 'reguler' ? 'text-primary-600' : 'text-gray-400'}`}>Regular Pack</p>
                        <p className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Rp 200.000</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium">Akses standar latihan klub</p>
                      </div>
                    </div>
                  </button>

                  <button type="button" onClick={() => setUpgradeType('private')}
                    className={`group/card p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden ${upgradeType === 'private' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-100 dark:hover:bg-white/[0.08]'}`}>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover/card:scale-110 ${upgradeType === 'private' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500'}`}>
                          <Award className="w-5 h-5" />
                        </div>
                        {upgradeType === 'private' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>}
                      </div>
                      <div>
                        <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${upgradeType === 'private' ? 'text-amber-600' : 'text-gray-400'}`}>Private Pack</p>
                        <p className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Rp 500.000</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium">Latihan intensif & jadwal fleksibel</p>
                      </div>
                    </div>
                  </button>
                </div>

                <button onClick={handleUpgrade} disabled={upgrading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-primary-600/40 active:scale-[0.98] disabled:opacity-50">
                  {upgrading ? 'MEMPROSES...' : <>MENJADI MEMBER <ChevronRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Popup Card */}
      {success && (
        <MessageCard
          message={success}
          submessage="Informasi profil Anda telah berhasil diperbaharui dalam sistem kami."
          onClose={() => setSuccess('')}
        />
      )}
    </div>
  );
}
