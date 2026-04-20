import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoice, uploadPaymentProof } from '../api/invoices';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { CreditCard, CheckCircle, ArrowLeft, Clock, Building2, Upload, AlertCircle, Image as ImageIcon } from 'lucide-react';
import MessageCard from '../components/MessageCard';

export default function PaymentDummy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const { settings } = useSettings();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [messageCard, setMessageCard] = useState({ show: false, message: '', type: 'success' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const { data } = await getInvoice(id);
      setInvoice(data.data);
    } catch (err) {
      setMessageCard({ show: true, message: "Gagal memuat tagihan.", type: 'danger' });
      setTimeout(() => navigate("/events"), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 5 * 1024 * 1024) return setMessageCard({ show: true, message: "Ukuran file terlalu besar", type: 'warning' });
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      
      await uploadPaymentProof(id, formData);
      await fetchInvoice();
      setMessageCard({ show: true, message: "Bukti transfer berhasil diunggah!", type: 'success' });
    } catch (err) {
      setMessageCard({ show: true, message: err.response?.data?.message || "Gagal mengunggah bukti.", type: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto px-4 space-y-6 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-3xl" />
          <div className="bg-white rounded-3xl p-8 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] py-12 px-4 sm:px-6 animate-fade-in transition-colors duration-300">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        
        <div className="bg-white dark:bg-[#1c2434] rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-[#2a3447]">
          <div className="bg-navy-900 p-6 sm:p-8 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
             <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-primary-400" />
             <h1 className="text-xl sm:text-2xl font-black mb-1 uppercase tracking-widest leading-tight">Pembayaran Tagihan</h1>
             <p className="text-navy-300 text-xs sm:text-sm font-medium px-4">Selesaikan pembayaran untuk menyelesaikan pendaftaran Anda.</p>
          </div>

          <div className="p-4 sm:p-8">
            <div className="bg-gray-50 dark:bg-[#0b1120] rounded-2xl p-5 sm:p-6 mb-8 border border-gray-100 dark:border-[#2a3447]">
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2 sm:mb-1">Total Pembayaran</p>
              <h2 className="text-[1.75rem] sm:text-4xl font-black text-gray-900 dark:text-white mb-2 sm:mb-4 tracking-tight">Rp {Number(invoice.amount).toLocaleString('id-ID')}</h2>
              
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-[#2a3447]">
                <div className="flex flex-col sm:flex-row sm:justify-between py-0.5 gap-1">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">ID Tagihan</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-gray-900 dark:text-white">INV-{invoice.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between py-0.5 gap-1">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Deskripsi</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white sm:text-right break-words leading-snug">{invoice.title}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-0.5 gap-2">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Batas Waktu</span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-lg w-fit">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] sm:text-xs tracking-tight">{new Date(invoice.dueDate).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              </div>
            </div>

            {invoice.status === 'paid' ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center text-center border border-green-100 mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
                <h3 className="font-bold text-lg">Tagihan Lunas</h3>
                <p className="text-sm">Pembayaran untuk tagihan ini sudah diselesaikan.</p>
                <button onClick={() => navigate('/events')} className="mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700">Lihat Event Saya</button>
              </div>
            ) : invoice.status === 'pending_verification' ? (
              <div className="bg-amber-50 text-amber-700 p-6 rounded-2xl flex flex-col items-center text-center border border-amber-100 mb-6 animate-fade-in">
                <Clock className="w-16 h-16 text-amber-500 mb-3 animate-pulse" />
                <h3 className="font-bold text-lg uppercase tracking-wider">Menunggu Konfirmasi</h3>
                <p className="text-sm mt-2 text-amber-600">Bukti transfer Anda sudah kami terima dan sedang ditinjau oleh Admin. Proses ini memakan waktu maksimal 1x24 jam.</p>
                <button onClick={() => navigate('/events')} className="mt-6 px-6 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700">Kembali ke Dashboard</button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-500" /> Instruksi Transfer Manual
                  </h3>
                  <div className="bg-white dark:bg-[#0b1120] border-2 border-primary-100 dark:border-primary-900/30 rounded-xl p-4 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Bank BCA</p>
                      <p className="text-lg sm:text-2xl font-mono font-bold text-gray-900 dark:text-white mt-0.5 tracking-wider sm:tracking-widest text-primary-600 dark:text-primary-400">123 456 7890</p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 font-medium italic">a/n <span className="font-bold text-gray-800 dark:text-gray-100">{settings.clubName || 'KINETIC'} Taekwondo</span></p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                   <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                     <ImageIcon className="w-4 h-4 text-primary-500" /> Unggah Bukti Transfer
                   </h3>
                   <div 
                     onClick={() => fileRef.current?.click()}
                     className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${preview ? 'border-primary-500' : 'border-gray-200 dark:border-[#2a3447] hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-[#0b1120]'}`}
                   >
                     {preview ? (
                        <img src={preview} alt="Bukti Transfer" className="w-full h-full object-cover" />
                     ) : (
                        <div className="text-center p-4">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Klik untuk pilih gambar</p>
                          <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG (Max 5MB)</p>
                        </div>
                     )}
                     <input type="file" className="hidden" ref={fileRef} accept="image/*" onChange={handleFileChange} />
                   </div>
                </div>

                <button 
                  onClick={handleUpload} 
                  disabled={uploading || !file}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Upload className="w-5 h-5" />}
                  {uploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {messageCard.show && (
        <MessageCard
          message={messageCard.message}
          type={messageCard.type}
          onClose={() => setMessageCard({ ...messageCard, show: false })}
          submessage={messageCard.type === 'success' ? "Bukti pembayaran Anda sedang diverifikasi oleh admin." : "Silakan periksa kembali data Anda."}
        />
      )}
    </div>
  );
}
