# 🥋 KINETIC Taekwondo SaaS - Buku Panduan Pengguna (User Manual)

Selamat datang di aplikasi manajemen klub KINETIC Taekwondo! Panduan mandiri ini disusun khusus bagi Pemilik Klub, Administrator, maupun Anggota untuk memaksimalkan seluruh fitur aplikasi. Aplikasi KINETIC dibuat dengan fokus pada kecepatan, keamanan, dan kemudahan penggunaan yang dibungkus dalam tampilan visual nan modern.

---

## 📑 Daftar Isi
1. [Pengenalan Peran (Role)](#-1-pengenalan-peran-role)
2. [Halaman Dashboard](#-2-halaman-dashboard)
3. [Manajemen Anggota & Kandidat](#-3-manajemen-anggota--kandidat)
4. [Manajemen Keuangan (Billing)](#-4-manajemen-keuangan-billing)
5. [Agenda & Acara (Events)](#-5-agenda--acara-events)
6. [Pengaturan Klub (White-label)](#-6-pengaturan-klub-white-label)

---

## 👥 1. Pengenalan Peran (Role)

Aplikasi ini membagi hak akses (otorisasi) menjadi 4 level untuk menjaga kerahasiaan dan keamanan data.

| Peran | Tugas & Hak Akses | Fitur Terlarang |
| --- | --- | --- |
| **Superadmin / Club Admin** | Mengelola seluruh operasional klub (Keuangan, Anggota, Event, Website, Galeri). | *Tidak ad batasan* |
| **Member Reguler / Privat** | Membayar tagihan spesifik milik mereka, daftar event, cek sabuk, dll. | Membuat tagihan, mengatur anggota lain, ubah profil klub. |
| **Candidate (Kandidat)** | Pengguna yang baru saja registrasi dari *landing page*. | Hanya bisa melihat status pendaftaran menunggu verifikasi. |

> [!TIP]
> **Praktik Terbaik:** Jangan berikan akses *Club Admin* kepada terlalu banyak orang. Gunakan akun Admin secara hati-hati karena memiliki hak untuk **menghapus secara permanen** data penting tagihan.

---

## 📊 2. Halaman Dashboard

Saat Anda atau anggota pertama kali login, ini adalah pusat kendali (*control center*) Anda.

- **Progress Sabuk (Belt Progress)**: Melacak perkembangan sabuk anggota sacara *real-time* dengan persentase dan warna sabuk akurat (Putih hingga Hitam).
- **Peringatan Otomatis (Smart Alerts)**: Jika terdapat tagihan SPP bulanan yang belum dibayar, sistem akan menampilkan *banner* peringatan eksklusif kepada Anggota, lengkap dengan tombol **Bayar Sekarang**.
- **Ringkasan Tagihan**: Anggota dapat melihat 5 histori tagihan terbarunya dalam wujud *tabel ringkas*, atau *card layout* jika diakses via *Smartphone* (HP).

> [!NOTE]
> Pada layar *mobile*, tabel transaksi yang kompleks otomatis dirubah menjadi kumpulan kartu (cards) dengan tipografi yang tebal agar nyaman ditekan oleh jari.

---

## 🥋 3. Manajemen Anggota & Kandidat

Sebagai Admin, Anda bertanggung jawab memvalidasi siapa yang berhak menyandang nama klub Anda.

### A. Menerima Anggota Baru (Kandidat)
Saat calon siswa mendaftar dari halaman depan, ia akan masuk ke tab **Kandidat**. 
1. Masuk ke halaman **Members**.
2. Klik *filter* status ke **Candidate** (Kandidat).
3. Klik tombol **Terima/Ubah** pada kandidat tujuan.
4. Pilih **Role**: "Member Reguler" atau "Member Privat".
5. Tekan **Simpan**. Otomatis layar mereka akan berubah menjadi layar anggota aktif! 🎉

### B. Kenaikan Sabuk (Promotion)
Setelah ujian kenaikan sabuk, admin hanya perlu menekan ikon 📝 (Edit) pada nama siswa di tabel anggota, lalu mengubah pilihan sabuk mereka menjadi sabuk di tingkat selanjutnya! 

---

## 💳 4. Manajemen Keuangan (Billing)

Fitur penagihan dirancang tanpa *form* yang berbelit-belit. Proses pembuatan dan validasinya dilakukan via *popup* modern.

### Cara Membuat Tagihan Ujian / SPP Massal
Hanya dengan 3 klik, Anda bisa menyebar tagihan ini ke seluruh angkatan:
1. Buka menu **Billing**.
2. Sentuh tombol **+ Buat Tagihan**.
3. Centang kotak **"Buat untuk semua anggota"**! *Sihir* aplikasi ini akan langsung meng-gandakan tagihan tersebut secara merata ke seluruh siswa aktif di klub Anda.

### Konfirmasi Pembayaran
Jika siswa sudah menyerahkan tanda bukti (transfer bank/tunai), tugas admin adalah melegalkan dokumen tersebut:
> [!IMPORTANT]
> Saat anggota melakukan klik "Tandai Dibayar" pada akun mereka, status tagihan berubah menjadi kuning (Menunggu Verifikasi). **Hanya admin yang memiliki otoritas** untuk meng-klik tombol ✅ "Verifikasi Pembayaran", merubahnya seketika menjadi lunas/hijau.

### Hapus Tagihan (*Voiding*)
Apakah admin membuat kesalahan pengetikan harga? Gunakan ikon 🗑️ (Tempat Sampah). Tindakan destruktif ini diawasi dengan *Custom Modal Alert* (bukan pop-up browser standard yang kasar) yang elegan meminimalisir kesalahan klik paksa.

---

## 📅 5. Agenda & Acara (Events)

Klub yang sehat adalah klub yang aktif. Fitur Event mengakomodir Publik dan Privat.

*   **Kejuaraan & Ujian**: Jika event ini eksklusif untuk Anggota Klub saja, fitur ini mendata siapa yang turut serta mendaftar! Daftar Hadir bisa diorganisir tanpa memakai buku fisik / Excel konvensional.
*   **Landing Page Event**: Setiap *Event* akan langsung tertampil secara estetik di beranda publik (*Website*) lengkap dengan tanggal cantik, tipe acara, harga registrasi, serta detail deksripsi yang responsif di segala ukuran resolusi (PC, Tablet, atau Genggam).

---

## ⚙️ 6. Pengaturan Klub (White-label)

**Aplikasi ini adalah cerminan identitas (branding) Anda!**
Aplikasi dirancang agar logo, nama klub, hingga susunan warna dasar tidak terkunci oleh "SaaS Developer". 

Untuk melakukan rekondisi identitas merk (*branding*):
1. Buka halaman **Pengaturan** (Hanya ikon gir di *sidebar* yang dapat dipencet admin).
2. Ketik **Nama Klub** sasana baru Anda (misal: `BANDUNG TKD`).
3. Seluruh *Title Bar*, Navbar Landing Page, hingga Judul Login Screen secara simultan berubah menyesuaikan nama klub yang baru anda pasang di detik yang sama, di seluru dunia.

Demikian buku manual ini dibuat. Selamat mengelola klub masa depan Anda dengan ekosistem digital **KINETIC Taekwondo SaaS**!
