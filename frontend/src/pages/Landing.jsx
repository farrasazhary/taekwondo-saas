import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, Award, ShieldCheck, Clock, MapPin, Phone, Mail, Globe, Video, CalendarDays, Trophy, Image } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

function GallerySection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/gallery/public')
      .then(r => r.json())
      .then(data => { if (data.success && data.data.length > 0) setItems(data.data); })
      .catch(console.error);
  }, []);

  if (items.length === 0) return null;

  // Duplicate items for seamless infinite scroll
  const scrollItems = [...items, ...items];
  const duration = items.length * 5; // 5 seconds per item

  return (
    <section id="gallery" className="py-20 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-navy-400 text-sm uppercase tracking-widest mb-2">Galeri & Prestasi</p>
            <h2 className="text-3xl font-extrabold text-white">SOROTAN TERBAIK</h2>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary-500" />
            <span className="text-xs text-navy-400 font-medium uppercase tracking-wider">{items.length} Achievement</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gallery-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .gallery-track {
          animation: gallery-scroll ${duration}s linear infinite;
        }
        .gallery-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-navy-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-navy-950 to-transparent z-10" />

        <div className="gallery-track flex gap-6 w-max">
          {scrollItems.map((item, i) => (
            <div key={`${item.id}-${i}`} className="w-[320px] md:w-[380px] shrink-0 group">
              <div className="relative h-[260px] md:h-[300px] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={`http://localhost:5000/uploads/gallery/${item.image}`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1.5">{item.title}</p>
                  {item.description && (
                    <p className="text-white text-sm font-semibold leading-snug line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const [publicEvents, setPublicEvents] = useState([]);
  const { settings } = useSettings();

  useEffect(() => {
    fetch('/api/events/public')
      .then(res => res.json())
      .then(data => { if (data.success) setPublicEvents(data.data); })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-navy-950/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-base sm:text-lg font-extrabold tracking-wider text-primary-500 max-w-[150px] sm:max-w-none leading-tight uppercase">{settings.clubName || 'KINETIC'}</span>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#home" className="text-white font-medium hover:text-primary-400 transition-colors border-b-2 border-primary-500 pb-0.5">Home</a>
            <a href="#programs" className="text-navy-300 hover:text-white transition-colors">Classes</a>
            <a href="#events" className="text-navy-300 hover:text-white transition-colors">Events</a>
            <a href="#instructors" className="text-navy-300 hover:text-white transition-colors">Coaches</a>
            <a href="#footer" className="text-navy-300 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            {/* <Link to="/login" className="text-sm text-navy-300 hover:text-white transition-colors hidden sm:block">Member Login</Link> */}
            <Link to="/login" className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">Daftar / Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero.png" alt="Taekwondo" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 bg-primary-500" />
              <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">Disiplin • Rak Latar • Prestasi</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6">
              TEMPA<br />
              <span className="text-primary-500 break-words">KEDISIPLINANMU</span>
            </h1>
            <p className="text-navy-300 text-base sm:text-lg max-w-lg mb-8 leading-relaxed">
              Lebih dari sekadar bela diri. Kami membentuk karakter, mental dan fisik melalui seni Taekwondo yang presisi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="w-full sm:w-auto px-6 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30">
                MULAI PERJALANANMU <ChevronRight className="w-4 h-4" />
              </Link>
              <a href="#programs" className="w-full sm:w-auto px-6 py-3.5 border border-white/20 text-white font-bold rounded-lg hover:bg-white/5 transition-all text-center">
                LIHAT PROGRAM
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
          <div className="animate-slide-up">
            <p className="text-4xl font-extrabold text-white">50+</p>
            <p className="text-navy-400 text-sm mt-1 uppercase tracking-wider">Anggota Aktif</p>
          </div>
          <div className="animate-slide-up">
            <p className="text-4xl font-extrabold text-white">10+</p>
            <p className="text-navy-400 text-sm mt-1 uppercase tracking-wider">Sabuk Hitam</p>
          </div>
          <div className="animate-slide-up flex items-center gap-3">
            <span className="text-primary-500 text-4xl font-extrabold">◆</span>
            <div>
              <p className="text-xl font-extrabold text-white">PRO</p>
              <p className="text-navy-400 text-sm uppercase tracking-wider">Pelatih Tersertifikasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <p className="text-navy-400 text-sm uppercase tracking-widest mb-2">Program & Jadwal</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Children Academy */}
          <div className="bg-navy-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Children Academy</h3>
              <span className="inline-flex items-center justify-center text-center px-3 py-1 bg-primary-600/20 text-primary-400 text-xs font-semibold rounded-full uppercase leading-tight">Mulai 5 Thn</span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed mb-6">Membangun fokus, disiplin dan kepercayaan diri pada anak melalui kurikulum yang menyenangkan namun terstruktur.</p>
            <div className="flex gap-6 text-xs text-navy-400">
              <div><span className="font-medium text-white">Senin & Rabu</span><br />16:00 – 17:30</div>
              <div><span className="font-medium text-white">Kamis (Privat)</span><br />08:00 – 09:00</div>
            </div>
          </div>

          {/* Teen Warriors */}
          <div className="bg-navy-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Teen Warriors</h3>
              <span className="inline-flex items-center justify-center text-center px-3 py-1 bg-primary-600/20 text-primary-400 text-xs font-semibold rounded-full uppercase leading-tight">Populer</span>
            </div>
            <p className="text-navy-300 text-sm leading-relaxed mb-6">Kelas untuk remaja mulai usia 12 tahun ke atas. Fokus pada teknik, sparring, dan pengembangan fisik dan mental.</p>
            <div className="flex gap-6 text-xs text-navy-400">
              <div><span className="font-medium text-white">Selasa & Kamis</span><br />16:00 – 18:00</div>
              <div><span className="font-medium text-white">Sabtu</span><br />09:00 – 11:00</div>
            </div>
          </div>
        </div>

        {/* Elite Adults */}
        <div className="mt-6 bg-navy-900/50 border border-white/5 rounded-2xl p-8 hover:border-white/10 transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-lg">
              <h3 className="text-xl font-bold text-white mb-2">ELITE ADULTS</h3>
              <p className="text-navy-300 text-sm leading-relaxed">Kelas dewasa intensif untuk semua level. Fokus pada teknik lanjutan, sparring aktif, dan conditioning fisik profesional.</p>
              <div className="flex items-center gap-2 mt-4 text-sm text-navy-400">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>Setiap Malam • 19:00 – 21:00 WIB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <GallerySection />

      {/* Upcoming Events */}
      <section id="events" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <p className="text-navy-400 text-sm uppercase tracking-widest mb-2">Agenda Club</p>
            <h2 className="text-3xl font-extrabold text-white">EVENT MENDATANG</h2>
          </div>
          <Link to="/login" className="hidden md:flex items-center gap-2 text-primary-500 hover:text-primary-400 text-sm font-bold uppercase tracking-wider transition-colors">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {publicEvents.length === 0 ? (
          <p className="text-navy-400">Belum ada agenda publik dalam waktu dekat.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
            {publicEvents.map((ev) => {
              const d = new Date(ev.eventDate);
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
              const formatIDR = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

              return (
                <div key={ev.id} className="bg-navy-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all animate-slide-up flex flex-col group">
                  <a href={`/events/${ev.id}`} className="relative h-48 bg-navy-800 overflow-hidden block">
                    {ev.image ? (
                      <img src={`http://localhost:5000/uploads/events/${ev.image}`} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-navy-700">
                        <CalendarDays className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center justify-center text-center px-3 py-1 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg leading-tight">
                        {ev.type === 'championship' ? 'Kejuaraan' : ev.type === 'test' ? 'Ujian' : 'Latihan'}
                      </span>
                    </div>
                  </a>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-center shrink-0 w-14 py-2 bg-navy-800 rounded-xl border border-white/5">
                        <p className="text-[10px] font-bold text-primary-500 uppercase mb-0.5">{months[d.getMonth()]}</p>
                        <p className="text-2xl font-bold text-white leading-none">{String(d.getDate()).padStart(2, '0')}</p>
                      </div>
                      <div>
                        <a href={`/events/${ev.id}`} className="hover:text-primary-400 transition-colors">
                          <h3 className="text-lg font-bold text-white leading-tight mb-2 uppercase tracking-tight">{ev.title}</h3>
                        </a>
                        <div className="flex items-center gap-2 text-xs text-navy-300">
                          <Clock className="w-4 h-4 text-primary-500" />
                          {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </div>
                    </div>

                    {ev.description && (
                      <p className="text-sm text-navy-300 leading-relaxed line-clamp-2 mb-6 flex-1 italic">
                        "{ev.description}"
                      </p>
                    )}

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-primary-400 uppercase tracking-widest">
                        {ev.price && Number(ev.price) > 0 ? formatIDR(ev.price) : 'GRATIS'}
                      </span>
                      <Link to="/login" className="text-[10px] font-bold text-white hover:text-primary-500 transition-colors flex items-center gap-1">
                        DETAIL <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-8 md:hidden text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 text-sm font-bold uppercase tracking-wider transition-colors">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Instructors */}
      <section id="instructors" className="bg-navy-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-10">
            <p className="text-navy-400 text-sm uppercase tracking-widest mb-2">Master & Instruktur</p>
            <p className="text-navy-300 text-sm max-w-lg">Dipimpin oleh para praktisi berpengalaman yang bersertifikasi untuk menceritakan nilai-nilai murni Taekwondo.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Sabeum Nim Aria', 'Sabeum Budi', 'Sabeum Maya', 'Sabeum Ridho'].map((name) => (
              <div key={name} className="text-center group">
                <div className="w-full aspect-square rounded-2xl bg-navy-800 mb-3 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-b from-navy-700 to-navy-900 flex items-center justify-center">
                    <ShieldCheck className="w-12 h-12 text-navy-600" />
                  </div>
                </div>
                <p className="font-semibold text-white text-sm">{name}</p>
                <p className="text-navy-400 text-xs">DAN IV Kukkiwon</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-navy-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-extrabold text-primary-500 tracking-wider mb-3 uppercase">{settings.clubName || 'KINETIC'}</h3>
            <p className="text-navy-400 text-sm leading-relaxed">Pusat pelatihan Taekwondo elit yang berfokus pada pengembangan teknik dan karakter.</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-navy-400 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-navy-400 hover:text-white transition-colors"><Video className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-navy-300 mb-4">Navigasi</h4>
            <div className="space-y-2 text-sm text-navy-400">
              <a href="#" className="block hover:text-white transition-colors">Beranda</a>
              <a href="#programs" className="block hover:text-white transition-colors">Kelas</a>
              <a href="#instructors" className="block hover:text-white transition-colors">Pelatih</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-navy-300 mb-4">Bantuan</h4>
            <div className="space-y-2 text-sm text-navy-400">
              <a href="#" className="block hover:text-white transition-colors">FAQ</a>
              <a href="#" className="block hover:text-white transition-colors">Kontak</a>
              <a href="#" className="block hover:text-white transition-colors">Pendaftaran</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-navy-300 mb-4">Lokasi</h4>
            <div className="space-y-2 text-sm text-navy-400">
              <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 shrink-0" />Jl. Merdeka Utama No. 88, Kota Bandung</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" />+6281 234 5678</p>
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" />info@kinetic-tkd.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-xs text-navy-500">
          © 2026 {settings.clubName || 'KINETIC'} Taekwondo Academy. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
