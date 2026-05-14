import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getInstructors, createInstructor, deleteInstructor, updateInstructor } from '../api/instructor';
import { getImageUrl } from '../utils/imageHelper';
import { Plus, Trash2, X, Users, Upload, ShieldCheck, Pencil } from 'lucide-react';

const RANKS = [
  'DAN I Kukkiwon',
  'DAN II Kukkiwon',
  'DAN III Kukkiwon',
  'DAN IV Kukkiwon',
  'DAN V Kukkiwon',
  'DAN VI Kukkiwon',
  'DAN VII Kukkiwon',
  'DAN VIII Kukkiwon',
  'DAN IX Kukkiwon',
];

export default function Instructors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', rank: RANKS[0] });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await getInstructors();
      setItems(data.data);
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeWords = (str) => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', capitalizeWords(form.name));
      formData.append('rank', form.rank);
      if (file) {
        formData.append('instructorImage', file);
      }

      if (editItem) {
        await updateInstructor(editItem.id, formData);
      } else {
        await createInstructor(formData);
      }

      setShowModal(false);
      setEditItem(null);
      setForm({ name: '', rank: RANKS[0] });
      setFile(null);
      setPreview(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, rank: item.rank });
    setPreview(getImageUrl(item.image, 'instructors'));
    setFile(null);
    setShowModal(true);
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteInstructor(deleteModal.id);
      setDeleteModal(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus instruktur.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Master & Instruktur</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 px-1">Kelola data pelatih yang tampil di halaman landing</p>
        </div>
        <button
          onClick={() => { setEditItem(null); setShowModal(true); setForm({ name: '', rank: RANKS[0] }); setFile(null); setPreview(null); }}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" /> Tambah Instruktur
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-wrap justify-center gap-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="card overflow-hidden rounded-2xl animate-pulse w-[calc(50%-12px)] md:w-[calc(20%-20px)] min-w-[160px]">
              <div className="aspect-square bg-gray-200 dark:bg-navy-800" />
              <div className="p-4 space-y-2 text-center">
                <div className="h-3 bg-gray-200 dark:bg-navy-800 rounded w-2/3 mx-auto" />
                <div className="h-2 bg-gray-100 dark:bg-navy-900 rounded w-1/2 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-[#0b1120] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada data instruktur</p>
          <p className="text-xs text-gray-400 mt-1">Klik "Tambah Instruktur" untuk memulai</p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {items.map((item) => (
            <div key={item.id} className="card overflow-hidden group relative text-center w-[calc(50%-12px)] md:w-[calc(25%-18px)] min-w-[160px]">
              <div className="relative aspect-square bg-gray-100 dark:bg-[#0b1120] overflow-hidden">
                {item.image ? (
                  <img
                    src={getImageUrl(item.image, 'instructors')}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-navy-200 dark:text-navy-800">
                    <ShieldCheck className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 bg-white text-navy-900 rounded-xl hover:bg-primary-500 hover:text-white transition-all shadow-lg"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal(item)}
                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider mt-0.5">{item.rank}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3447]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                {editItem ? 'Edit Instruktur' : 'Tambah Instruktur'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2434] text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Image Upload */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`relative h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${preview ? 'border-primary-500/30' : 'border-gray-200 dark:border-[#2a3447] hover:border-primary-500/50'}`}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <Upload className="w-10 h-10 mb-2" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">Klik untuk unggah foto</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider px-1">PNG, JPG, max 5MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Lengkap / Gelar</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Sabeum Aria"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-xl text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sabuk / Tingkatan</label>
                <select
                  value={form.rank}
                  onChange={e => setForm({ ...form, rank: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-xl text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 appearance-none cursor-pointer"
                >
                  {RANKS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving || !form.name}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : (editItem ? 'Simpan Perubahan' : 'Tambah Instruktur')}
              </button>
            </form>
          </div>
        </div>
      , document.body)}

      {/* Delete Confirmation Modal */}
      {deleteModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hapus Instruktur?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Data <strong>"{deleteModal.name}"</strong> akan dihapus permanen.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button
                  onClick={() => setDeleteModal(null)}
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
    </div>
  );
}
