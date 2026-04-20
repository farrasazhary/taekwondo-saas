import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getGallery, createGalleryItem, deleteGalleryItem } from '../api/gallery';
import { Plus, Trash2, X, Image, Upload, Trophy } from 'lucide-react';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await getGallery();
      setItems(data.data);
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
    } finally {
      setLoading(false);
    }
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

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !file) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('galleryImage', file);
      await createGalleryItem(formData);
      setShowAdd(false);
      setForm({ title: '', description: '' });
      setFile(null);
      setPreview(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan item galeri.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteGalleryItem(deleteModal.id);
      setDeleteModal(null);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus item galeri.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Galeri Prestasi</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 px-1">Kelola foto pencapaian & highlight yang tampil di halaman landing</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setForm({ title: '', description: '' }); setFile(null); setPreview(null); }}
          className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-600/20"
        >
          <Plus className="w-4 h-4" /> Tambah Foto
        </button>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="card overflow-hidden rounded-2xl animate-pulse">
              <div className="h-52 bg-gray-200 dark:bg-navy-800" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-navy-800 rounded w-2/3" />
                <div className="h-3 bg-gray-100 dark:bg-navy-900 rounded w-full" />
                <div className="h-2 bg-gray-100 dark:bg-navy-900 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 bg-gray-50 dark:bg-[#0b1120] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada foto di galeri</p>
          <p className="text-xs text-gray-400 mt-1">Klik "Tambah Foto" untuk memulai</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="card overflow-hidden group relative">
              <div className="relative h-52 bg-gray-100 dark:bg-[#0b1120] overflow-hidden">
                <img
                  src={`http://localhost:5000/uploads/gallery/${item.image}`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => setDeleteModal(item)}
                  className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 shadow-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-primary-500" />
                  <p className="text-[11px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{item.title}</p>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{item.description}</p>
                )}
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest font-bold">
                  {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0b1120] rounded-3xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2a3447]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">Tambah Foto Galeri</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c2434] text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-5">
              {/* Image Upload Area */}
              <div
                onClick={() => fileRef.current?.click()}
                className={`relative h-48 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${preview ? 'border-primary-500/30' : 'border-gray-200 dark:border-[#2a3447] hover:border-primary-500/50'}`}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <Upload className="w-10 h-10 mb-2" />
                    <p className="text-[11px] font-bold uppercase tracking-widest">Klik untuk unggah gambar</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider px-1">PNG, JPG, max 5MB</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Judul / Jenis Achievement</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Juara 1 Kejuaraan Nasional"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-xl text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Detail Singkat</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Deskripsi singkat pencapaian..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#1c2434] border border-gray-100 dark:border-[#2a3447] rounded-xl text-sm text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving || !file || !form.title}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50"
              >
                {saving ? 'Mengunggah...' : 'Simpan ke Galeri'}
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
              <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">Hapus Foto?</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Foto <strong>"{deleteModal.title}"</strong> akan dihapus permanen dari galeri.
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
