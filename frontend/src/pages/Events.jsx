import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, createEvent, updateEvent, deleteEvent, getMyRegistrations, registerEvent, getEventParticipants } from '../api/events';
import { Plus, Trash2, Edit2, X, AlertCircle, Trophy, GraduationCap, PartyPopper, CalendarDays, Clock, Users, CheckCircle, Search } from 'lucide-react';

const typeIcon = { championship: Trophy, test: GraduationCap, gathering: PartyPopper };
const typeColor = { championship: 'bg-amber-50 text-amber-600', test: 'bg-blue-50 text-blue-600', gathering: 'bg-emerald-50 text-emerald-600' };
const typeLabel = { championship: 'Kejuaraan', test: 'Ujian Kenaikan', gathering: 'Latihan Gabungan' };

export default function Events() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'club_admin' || user?.role === 'superadmin';
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({});
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmRegister, setConfirmRegister] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'gathering', eventDate: '', description: '', price: '', image: null, location: '', mapUrl: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [myRegistrations, setMyRegistrations] = useState([]);

  // Participant Tracking State
  const [participantModal, setParticipantModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  useEffect(() => { fetchEvents(); }, [page, typeFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await getEvents({ page, limit: 12, type: typeFilter || undefined });
      setEvents(data.data); setMeta(data.meta);
      if (user?.role.startsWith('member_') || user?.role === 'candidate') {
        const regRes = await getMyRegistrations();
        setMyRegistrations(regRes.data.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('type', form.type);
      formData.append('eventDate', new Date(form.eventDate).toISOString());
      if (form.description) formData.append('description', form.description);
      
      if (form.price !== '' && form.price !== null) formData.append('price', form.price);
      else formData.append('price', '0');

      if (form.location) formData.append('location', form.location);
      if (form.mapUrl) formData.append('mapUrl', form.mapUrl);
      if (form.image) formData.append('image', form.image);

      if (editId) {
        await updateEvent(editId, formData);
      } else {
        await createEvent(formData);
      }
      
      setModal(false); 
      setEditId(null);
      setForm({ title: '', type: 'gathering', eventDate: '', description: '', price: '', image: null, location: '', mapUrl: '' }); 
      fetchEvents();
    } catch (err) { setError(err.response?.data?.message || 'Gagal menyimpan event.'); } finally { setSaving(false); }
  };

  const openEditModal = (ev) => {
    const d = new Date(ev.eventDate);
    const localDateTime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    
    setForm({
      title: ev.title,
      type: ev.type,
      eventDate: localDateTime,
      description: ev.description || '',
      price: ev.price || '',
      location: ev.location || '',
      mapUrl: ev.mapUrl || '',
      image: null
    });
    setEditId(ev.id);
    setError('');
    setModal(true);
  };

  const openParticipants = async (ev) => {
    setSelectedEvent(ev);
    setParticipantModal(true);
    setLoadingParticipants(true);
    try {
      const { data } = await getEventParticipants(ev.id);
      setParticipants(data.data);
    } catch (err) {
      alert("Gagal memuat peserta.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleDelete = (ev) => {
    setConfirmDelete(ev);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try { await deleteEvent(confirmDelete.id); setConfirmDelete(null); fetchEvents(); } catch (err) { alert(err.response?.data?.message || 'Gagal.'); }
  };

  const handleRegister = (ev) => {
    setConfirmRegister(ev);
  };

  const executeRegister = async () => {
    if (!confirmRegister) return;
    try {
      const { data } = await registerEvent(confirmRegister.id);
      if (data.data.invoice) {
        window.location.href = `/pay/${data.data.invoice.id}`;
      } else {
        alert('Pendaftaran berhasil!');
        setConfirmRegister(null);
        fetchEvents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Pendaftaran gagal.');
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.participantName?.toLowerCase().includes(participantSearch.toLowerCase()) ||
    p.levelCategory?.toLowerCase().includes(participantSearch.toLowerCase()) ||
    p.competitionCategory?.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Agenda & Event</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 px-1">Jadwal kegiatan dan acara club</p>
        </div>
        {isAdmin && <button onClick={() => { 
          setModal(true); setEditId(null); setError(''); 
          setForm({ title: '', type: 'gathering', eventDate: '', description: '', price: '', image: null, location: '', mapUrl: '' });
          }} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-lg transition-all shadow-sm"><Plus className="w-4 h-4" />Tambah Event</button>}
      </div>
      <div className="flex gap-2 flex-wrap">
        {[['', 'Semua'], ['championship', 'Kejuaraan'], ['test', 'Ujian'], ['gathering', 'Latihan']].map(([val, label]) => (
          <button key={val} onClick={() => { setTypeFilter(val); setPage(1); }}
            className={`px-4 py-2 text-xs rounded-lg font-semibold transition-all ${typeFilter === val ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-[#1c2434] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:bg-[#2a3447]'}`}>{label}</button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card overflow-hidden rounded-2xl animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-navy-800" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-navy-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-navy-900 rounded w-1/2" />
                <div className="h-3 bg-gray-100 dark:bg-navy-900 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      )
      : events.length === 0 ? <div className="text-center py-16 text-gray-400">Tidak ada event</div>
      : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
          {events.map((ev) => {
            const Icon = typeIcon[ev.type] || CalendarDays;
            const d = new Date(ev.eventDate);
            const myReg = myRegistrations.find(r => r.eventId === ev.id);
            const isFree = !ev.price || Number(ev.price) === 0;

            return (
              <div key={ev.id} className="card group overflow-hidden hover:shadow-lg transition-all animate-slide-up rounded-2xl flex flex-col">
                <a href={`/events/${ev.id}`} className="relative h-40 bg-gray-100 dark:bg-[#0b1120] overflow-hidden block">
                  {ev.image ? (
                    <img src={`http://localhost:5000/uploads/events/${ev.image}`} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300"><CalendarDays className="w-12 h-12" /></div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${typeColor[ev.type]}`}>
                      <Icon className="w-3.5 h-3.5" /> {typeLabel[ev.type]}
                    </span>
                  </div>
                </a>
                {isAdmin && (
                  <div className="absolute z-10 top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => { e.preventDefault(); openParticipants(ev); }} className="p-2 rounded-xl bg-white/90 dark:bg-[#0b1120]/80 backdrop-blur-sm shadow-sm text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-all" title="Lihat Peserta">
                      <Users className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); openEditModal(ev); }} className="p-2 rounded-xl bg-white/90 dark:bg-[#0b1120]/80 backdrop-blur-sm shadow-sm text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all" title="Edit Event">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.preventDefault(); handleDelete(ev); }} className="p-2 rounded-xl bg-white/90 dark:bg-[#0b1120]/80 backdrop-blur-sm shadow-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all" title="Hapus Event">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-center shrink-0 w-12 py-1.5 bg-gray-50 dark:bg-[#0b1120] rounded-xl border border-gray-100 dark:border-[#2a3447] text-gray-900 dark:text-white">
                      <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-0.5">{months[d.getMonth()]}</p>
                      <p className="text-xl font-black leading-none">{String(d.getDate()).padStart(2, '0')}</p>
                    </div>
                    <div>
                      <a href={`/events/${ev.id}`} className="hover:text-primary-600 transition-colors">
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 text-lg tracking-tight uppercase">{ev.title}</h3>
                      </a>
                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                      </div>
                    </div>
                  </div>
                  
                  {ev.description && <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4 flex-1">{ev.description}</p>}
                  
                  <div className="pt-4 border-t border-gray-50 dark:border-[#2a3447] flex items-center justify-between">
                    <div className="text-xs font-bold text-gray-900 dark:text-white">
                      {!isFree ? formatIDR(ev.price) : <span className="text-emerald-500">GRATIS</span>}
                    </div>
                    {((user?.role?.startsWith('member_') || user?.role === 'candidate') && ev.eventDate > new Date().toISOString()) && (
                      <div>
                        {myReg ? (
                          myReg.status === 'confirmed' || myReg.invoice?.status === 'paid' ? (
                            <span className="px-3 py-1.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg">Sudah Terdaftar</span>
                          ) : (
                            <a href={`/pay/${myReg.invoiceId}`} className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 text-[10px] font-bold rounded-lg transition-colors">Menunggu</a>
                          )
                        ) : (
                          <a href={`/events/${ev.id}`} className="px-4 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-bold rounded-lg shadow-sm transition-all text-center block focus:ring-2 focus:ring-primary-500/30">
                            Daftar
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
      
      {/* Modal Tambah/Edit Event */}
      {modal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 md:p-6">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1c2434] rounded-2xl shadow-xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden border border-transparent dark:border-[#2a3447]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] shrink-0 bg-white dark:bg-[#1c2434]">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">{editId ? 'Ubah Data Event' : 'Tambah Event Master'}</h2>
              <button onClick={() => setModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#0b1120] text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="flex flex-col overflow-hidden min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Judul Event / Kejuaraan <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="Contoh: Kejuaraan Nasional Taekwondo 2026" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Kategori <span className="text-red-500">*</span></label>
                    <select required value={form.type} onChange={e => setForm({...form, type: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm cursor-pointer">
                      <option value="championship">Kejuaraan (Championship)</option>
                      <option value="test">Ujian Kenaikan Sabuk (Test)</option>
                      <option value="gathering">Latihan Biasa / Gabungan (Gathering)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Waktu Pelaksanaan <span className="text-red-500">*</span></label>
                    <input type="datetime-local" required value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm cursor-pointer" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Lokasi / Nama Tempat</label>
                    <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="Opsional, cth: GOR Amongrogo, Yogyakarta" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Google Maps Embed URL</label>
                    <input type="text" value={form.mapUrl} onChange={e => {
                        let val = e.target.value;
                        const srcMatch = val.match(/src="([^"]+)"/);
                        if (srcMatch && srcMatch[1]) val = srcMatch[1];
                        setForm({...form, mapUrl: val});
                      }} 
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all shadow-sm placeholder:text-gray-300 ${form.mapUrl && !form.mapUrl.includes('/embed') && form.mapUrl.includes('google') ? 'border-red-300 focus:border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 dark:border-[#2a3447] focus:border-primary-500'}`} 
                      placeholder="Opsional, paste URL atau seluruh tag <iframe> GMaps" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Deskripsi Lengkap</label>
                    <textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:bg-white dark:focus:bg-[#1c2434] focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm resize-none" placeholder="Deskripsi..." />
                  </div>
                  <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100/50 dark:border-amber-900/20 flex flex-col justify-center">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Biaya Registrasi (Rp)</label>
                    <input type="number" min={0} value={form.price} onChange={e => setForm({...form, price: e.target.value})} 
                      className="w-full px-4 py-3 bg-white dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all shadow-sm" placeholder="0 untuk Gratis" />
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/20 flex flex-col justify-center">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">Cover Poster</label>
                    <input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} 
                      className="w-full px-2 py-1.5 bg-white dark:bg-[#0b1120] border border-gray-200 dark:border-[#2a3447] rounded-xl text-gray-900 dark:text-white text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 transition-colors shadow-sm" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 p-6 border-t border-gray-100 dark:border-[#2a3447] bg-gray-50/80 dark:bg-[#0b1120]/50 shrink-0">
                <button type="button" onClick={() => setModal(false)} className="px-6 py-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-[#2a3447] text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1c2434] transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 text-sm font-bold rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:bg-primary-500 disabled:opacity-50 transition-all active:scale-95">{saving ? 'Menyimpan...' : editId ? 'Simpan' : 'Publikasikan'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Participant List Modal */}
      {participantModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-6" onClick={() => setParticipantModal(false)}>
          <div className="w-full max-w-5xl bg-white dark:bg-[#1c2434] rounded-2xl shadow-xl animate-scale-in flex flex-col max-h-[90vh] overflow-hidden border border-transparent dark:border-[#2a3447]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3447] shrink-0 bg-white dark:bg-[#1c2434]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                    <Users className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Peserta Berpartisipasi</h2>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{selectedEvent?.title}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                   <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input type="text" placeholder="Cari nama / kategori..." value={participantSearch} onChange={e => setParticipantSearch(e.target.value)} className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-[#2a3447] rounded-lg text-xs text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#0b1120] focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all w-64" />
                </div>
                <button onClick={() => setParticipantModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-0 scrollbar-hide">
              {loadingParticipants ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                   <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                   <p className="text-xs font-bold uppercase tracking-widest">Memuat Peserta...</p>
                </div>
              ) : participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-4">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8" />
                   </div>
                   <p className="font-bold text-sm uppercase tracking-tight text-gray-400">Belum ada pendaftar.</p>
                </div>
              ) : (
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/50 dark:bg-[#0b1120]/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Peserta</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Gender</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Tingkat</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Lomba</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Berat</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Tgl Daftar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-[#2a3447] bg-white dark:bg-[#1c2434]">
                        {filteredParticipants.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-[#0b1120]/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs shrink-0">{p.participantName?.charAt(0)}</div>
                                <div className="ml-3">
                                  <div className="text-sm font-bold text-gray-900 dark:text-white">{p.participantName}</div>
                                  <div className="text-[10px] text-gray-400 dark:text-gray-500">{p.user?.name} | {p.age} th</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${p.gender === 'Laki-laki' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400'}`}>
                                 {p.gender}
                               </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter ${p.levelCategory === 'Prestasi' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'}`}>
                                 {p.levelCategory}
                               </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-tight">{p.competitionCategory}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900 dark:text-white">{p.weight} kg</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                               <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'confirmed' || p.invoice?.status === 'paid' ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                  {p.status === 'confirmed' || p.invoice?.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {p.status === 'confirmed' || p.invoice?.status === 'paid' ? 'Lunas' : 'Menunggu'}
                               </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-[10px] text-gray-400 dark:text-gray-500 font-medium">{new Date(p.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-[#2a3447] bg-gray-50 dark:bg-[#0b1120]/50 flex justify-between items-center shrink-0">
               <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Total {filteredParticipants.length} Peserta</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Event Modal */}
      {confirmDelete && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-[#2a3447]" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100 dark:border-red-900/50">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hapus Event?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Tindakan ini permanen. Event <strong>{confirmDelete.title}</strong> akan dihapus beserta datanya.
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

      {/* Register Event Modal */}
      {confirmRegister && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-100 dark:border-[#2a3447]" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary-100 dark:border-primary-900/50">
                <CheckCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Konfirmasi Daftar</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Anda akan mendaftar ke aktivitas <strong>{confirmRegister.title}</strong>. Lanjutkan pendaftaran?
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button 
                   onClick={() => setConfirmRegister(null)}
                   className="py-3 px-4 rounded-xl border border-gray-200 dark:border-[#2a3447] text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1c2434] transition-all"
                >
                  Batal
                </button>
                <button 
                   onClick={executeRegister}
                   className="py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-lg shadow-primary-600/20 transition-all"
                >
                  Ya, Daftar
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
