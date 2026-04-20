import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventPublic, registerEvent, getMyRegistrations } from '../api/events';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { CalendarDays, Clock, MapPin, ArrowLeft, Trophy, GraduationCap, X, UserCircle, Scale, Tag, UserCheck } from 'lucide-react';

const typeLabel = { championship: 'Kejuaraan', test: 'Ujian Kenaikan Sabuk', gathering: 'Latihan / Kumpul' };

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myReg, setMyReg] = useState(null);
  
  // Registration Modal State
  const [showRegModal, setShowRegModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regForm, setRegForm] = useState({
    participantName: '',
    gender: 'Laki-laki',
    birthPlace: '',
    birthDate: '',
    age: 0,
    weight: '',
    levelCategory: 'Pemula',
    competitionCategory: 'Kyorugi'
  });

  useEffect(() => {
    fetchData();
  }, [id, user]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user && showRegModal) {
      setRegForm(prev => ({
        ...prev,
        participantName: user.name || '',
        gender: user.gender || 'Laki-laki',
        birthPlace: user.birthPlace || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        age: user.birthDate ? calculateAge(user.birthDate) : 0
      }));
    }
  }, [user, showRegModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEventPublic(id);
      setEvent(res.data.data);
      
      if (user && (user.role.startsWith('member_') || user.role === 'candidate')) {
        const regRes = await getMyRegistrations();
        const found = regRes.data.data.find(r => r.eventId === id);
        if (found) setMyReg(found);
      }
    } catch (err) {
      alert(err.message || "Gagal memuat event atau event tidak ditemukan.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateString) => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...regForm, [name]: value };
    
    if (name === 'birthDate') {
      updatedForm.age = calculateAge(value);
    }
    
    setRegForm(updatedForm);
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...regForm,
        birthDate: new Date(regForm.birthDate).toISOString(),
        weight: parseFloat(regForm.weight) || 0,
        age: parseInt(regForm.age) || 0
      };

      const { data } = await registerEvent(event.id, payload);
      if (data.data.invoice) {
        window.location.href = `/pay/${data.data.invoice.id}`;
      } else {
        alert('Pendaftaran berhasil!');
        setShowRegModal(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Pendaftaran gagal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120]">
      <div className="w-full max-w-3xl mx-auto px-4 space-y-6 animate-pulse">
        <div className="h-[300px] bg-gray-200 dark:bg-navy-800 rounded-2xl" />
        <div className="bg-white dark:bg-[#1c2434] rounded-xl p-8 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-navy-800 rounded w-1/2" />
          <div className="h-4 bg-gray-100 dark:bg-navy-900 rounded w-full" />
          <div className="h-4 bg-gray-100 dark:bg-navy-900 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
  if (!event) return null;

  const d = new Date(event.eventDate);
  const monthsFull = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const isFree = !event.price || Number(event.price) === 0;

  return (
    <div className={`min-h-[calc(100vh-64px)] animate-fade-in ${user ? '-mx-4 md:-mx-8 -mt-4 md:-mt-8' : 'bg-[#F3F4F6] dark:bg-[#0b1120] pb-20'} relative`}>
      {/* Public Navbar fallback if no Layout */}
      {!user && (
         <div className="bg-[#0c1324] h-16 w-full flex items-center px-8 shrink-0">
           <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
           </button>
           <span className="ml-4 text-white font-bold text-sm tracking-wide uppercase">{settings.clubName || 'KINETIC'} — Detail Event</span>
         </div>
      )}

      {/* Hero Banner */}
      <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
        {event.image ? (
          <img src={`http://localhost:5000/uploads/events/${event.image}`} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
             <CalendarDays className="w-32 h-32 text-gray-800" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F3F4F6] dark:from-[#0b1120] via-transparent to-transparent"></div>
        <div className="absolute bottom-12 md:bottom-28 left-6 md:left-12">
          <span className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-4 inline-block">
            {typeLabel[event.type]}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm uppercase leading-tight tracking-tighter">
            {event.title}
          </h2>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 md:-mt-20 relative z-10 pb-20">
        {/* Event Quick Info Card */}
        <div className="bg-white dark:bg-[#1c2434] rounded-xl shadow-[0_20px_40px_rgba(7,13,31,0.08)] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 border border-gray-100 dark:border-[#2a3447]">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 flex-1 w-full lg:w-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Tanggal Event</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg leading-none">{d.getDate()} {monthsFull[d.getMonth()]} {d.getFullYear()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Waktu Event</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg leading-none">{d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:border-l md:border-gray-100 dark:md:border-[#2a3447] md:pl-8">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Biaya Pendaftaran</p>
                <p className="text-gray-900 dark:text-white font-bold text-2xl leading-none">{!isFree ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(event.price) : <span className="text-emerald-500">GRATIS</span>}</p>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-auto mt-4 lg:mt-0">
            {user && (user.role.startsWith('member_') || user.role === 'candidate') ? (
               new Date() > new Date(event.eventDate) ? (
                 <button className="w-full lg:w-auto bg-gray-100 text-gray-400 px-10 py-4 rounded-xl font-bold uppercase text-sm tracking-widest cursor-not-allowed">
                   Event Berlalu
                 </button>
               ) : myReg ? (
                   myReg.status === 'confirmed' || myReg.invoice?.status === 'paid' ? (
                     <button className="w-full lg:w-auto bg-green-50 text-green-600 px-10 py-4 rounded-xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 cursor-default border border-green-100">
                        <UserCheck className="w-5 h-5" />
                        Sudah Terdaftar
                     </button>
                   ) : (
                     <button onClick={() => window.location.href = `/pay/${myReg.invoiceId}`} className="w-full lg:w-auto bg-amber-100 text-amber-700 px-10 py-4 rounded-xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-amber-200 transition-colors shadow-sm">
                        Selesaikan Pembayaran
                     </button>
                   )
               ) : (
                 <button onClick={() => setShowRegModal(true)} className="w-full lg:w-auto bg-red-600 text-white px-10 py-4 rounded-xl font-bold uppercase text-sm tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30">
                    Daftar Sekarang
                 </button>
               )
            ) : !user ? (
               <button onClick={() => navigate('/login')} className="w-full lg:w-auto bg-gray-800 text-white px-10 py-4 rounded-xl font-bold uppercase text-sm tracking-widest hover:bg-gray-900 transition-colors shadow-lg">
                  Masuk untuk Mendaftar
               </button>
            ) : (
               <div className="flex gap-4">
                  <button className="bg-gray-100 text-gray-400 px-8 py-3 rounded-lg font-bold uppercase text-xs tracking-widest cursor-default border border-gray-200">
                    Mode Admin
                  </button>
               </div>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
          
          {/* Description Section (70%) */}
          <div className="lg:col-span-7 space-y-8">
            <section>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white uppercase mb-6 flex items-center gap-3">
                <span className="w-8 h-1 bg-red-600"></span> Deskripsi
              </h3>
              <div className="bg-white dark:bg-[#1c2434] rounded-xl p-8 md:p-10 leading-relaxed text-gray-600 dark:text-gray-300 text-base md:text-lg space-y-6 shadow-sm border border-gray-100 dark:border-[#2a3447]">
                {event.description ? (
                   <div dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br/>') }} />
                ) : (
                   <p className="italic text-gray-400">Belum ada deskripsi mendalam untuk event ini.</p>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Content (30%) */}
          <div className="lg:col-span-3 space-y-10">
            {/* Location Info */}
            <section>
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Lokasi Pelaksanaan</h4>
              <div className="bg-white dark:bg-[#1c2434] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-[#2a3447]">
                <div className="h-48 bg-gray-50 dark:bg-[#0b1120]/50 border-b border-gray-50 dark:border-[#2a3447]">
                  {event.mapUrl ? (
                    <iframe 
                      src={event.mapUrl} 
                      width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500">
                    </iframe>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300">
                      <MapPin className="w-10 h-10" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Peta tidak tersedia</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-red-500 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white mb-1 leading-tight">{event.location || 'Lokasi belum dirilis'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pastikan hadir tepat waktu di lokasi yang ditentukan.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Note / Info */}
            <section>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Bimbingan & Informasi</h4>
              <div className="bg-[#0c1324] p-6 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-20 h-20 text-white" />
                </div>
                <div className="relative z-10">
                   <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white mb-4">
                     <GraduationCap className="w-5 h-5" />
                   </div>
                   <p className="text-sm font-bold text-white mb-2">Perhatikan Persyaratan</p>
                   <p className="text-[11px] text-gray-400 leading-relaxed uppercase font-medium tracking-tight">
                     Silakan konsultasikan dengan Sabeum / Admin club mengenai kategori dan berat badan yang sesuai.
                   </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#1c2434] border border-transparent dark:border-[#2a3447] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-[#0c1324] px-6 py-6 text-white shrink-0 relative">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">Formulir Peserta</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{event.title}</p>
                  </div>
               </div>
               <button onClick={() => setShowRegModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
               <form id="regForm" onSubmit={handleFinalRegister} className="space-y-6">
                  {/* Participant Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <UserCircle className="w-3.5 h-3.5" /> Nama Lengkap Peserta
                    </label>
                    <input type="text" name="participantName" required value={regForm.participantName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl font-bold text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all border-l-4 border-l-red-600" placeholder="Sesuai Akta / KTP" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Gender */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                      <select name="gender" required value={regForm.gender} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl font-bold text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    {/* Birth Date */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <CalendarDays className="w-3.5 h-3.5" /> Tanggal Lahir
                      </label>
                      <input type="date" name="birthDate" required value={regForm.birthDate} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl font-bold text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Birth Place */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <MapPin className="w-3.5 h-3.5" /> Tempat Lahir
                      </label>
                      <input type="text" name="birthPlace" required value={regForm.birthPlace} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl font-bold text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="Kota / Kabupaten" />
                    </div>

                    {/* Age (Auto-calculated) */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Usia Saat Ini</label>
                      <div className="w-full px-4 py-3 bg-gray-100 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl font-bold text-gray-500 dark:text-gray-400 text-sm flex items-center justify-between">
                         <span>{regForm.age} Tahun</span>
                         <span className="text-[10px] text-gray-400 italic font-medium">Auto-Calculated</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Weight */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Scale className="w-3.5 h-3.5" /> Berat Badan (Kg)
                      </label>
                      <input type="number" step="0.1" name="weight" required value={regForm.weight} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl font-bold text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all" placeholder="Cth: 45.5" />
                    </div>

                    {/* Level Category */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Trophy className="w-3.5 h-3.5" /> Kategori Tingkat
                      </label>
                      <select name="levelCategory" required value={regForm.levelCategory} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl font-bold text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
                        <option value="Pemula">Pemula (Beginner)</option>
                        <option value="Prestasi">Prestasi (Elite)</option>
                      </select>
                    </div>

                    {/* Competition Category */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Tag className="w-3.5 h-3.5" /> Kategori Lomba
                      </label>
                      <select name="competitionCategory" required value={regForm.competitionCategory} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-xl font-bold text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all">
                        <option value="Kyorugi">Kyorugi (Sparring)</option>
                        <option value="Poomsae">Poomsae (Forms)</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Area */}
                  <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-900/50">
                     <p className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight mb-1 flex items-center gap-2">
                        <ArrowLeft className="w-3 h-3 rotate-180" /> Informasi Data
                     </p>
                     <p className="text-[10px] text-gray-500 dark:text-gray-400 italic leading-tight">
                        Pastikan data di atas sesuai dengan dokumen resmi untuk keperluan sertifikat dan asuransi.
                     </p>
                  </div>
               </form>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-50 dark:border-[#2a3447] bg-gray-50 dark:bg-[#0b1120]/80 shrink-0 flex gap-4">
               <button type="button" onClick={() => setShowRegModal(false)} className="flex-1 py-4 px-6 border border-gray-200 dark:border-[#2a3447] text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-white dark:hover:bg-[#1c2434] hover:text-gray-900 dark:hover:text-white transition-all">
                  Batal
               </button>
               <button type="submit" form="regForm" disabled={submitting} className="flex-[2] py-4 px-6 bg-[#0c1324] dark:bg-primary-600 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-[#1a233a] dark:hover:bg-primary-500 transition-all shadow-lg shadow-gray-400/20 dark:shadow-primary-900/20 flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Lanjut Pembayaran <ArrowLeft className="w-4 h-4 rotate-180" /></>
                  )}
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
