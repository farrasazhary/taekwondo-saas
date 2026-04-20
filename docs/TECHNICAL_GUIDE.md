# 🔧 KINETIC Taekwondo SaaS - Buku Panduan Teknis (Technical Guide)

Panduan teknis ini dirancang bagi tim IT atau Developer yang akan melakukan tahap eskalasi, pemeliharaan, maupun instalasi awal infrastruktur *backend* (server) aplikasi KINETIC Taekwondo SaaS. Dokumen ini disajikan sesederhana mungkin untuk kemudahan transisi proyek (*handover*).

---

## 1. Teknologi & Arsitektur Utama (Tech Stack)

Aplikasi dibangun menggunakan lingkungan Monolith-API dengan pemisahan direktori antara klien (Front-End) dan server (Back-End) murni.

*   **Runtime:** Node.js (v18.x direkomendasikan)
*   **Web Framework:** Express.js 4.x
*   **Database:** MySQL (Relational Database)
*   **ORM (Object-Relational Mapping):** Prisma ORM
*   **Autentikasi:** JSON Web Token (JWT) + *Cookie-based HttpOnly Secure*
*   **Real-time Engine:** Server-Sent Events (SSE) murni tanpa pihak ketiga (e.g., tanpa membebani server dengan instalasi Redis / Socket.io)

---

## 2. Struktur Database Singkat (ERD Overview)

Sistem beroperasi berdasarkan beberapa entitas kunci pada skema Prisma:
*   **User:** Menyimpan kredensial otentikasi. Memiliki *Role Enum* (`superadmin`, `club_admin`, `member_reguler`, `member_private`, `candidate`) dan *Status* (`active`, `inactive`).
*   **Belt:** Level sabuk hirarkis berdasar urutan (*LevelOrder*) tingkat keahlian murid. Sabuk tersambung *One-to-Many* ke User.
*   **Invoice:** Catatan historikal pembayaran per anggota (Kategori: Uang SPP Bulanan, Biaya Ujian, dsb.).
*   **Event:** Relasi *Many-to-Many* dengan User melalui model `EventRegistration` untuk melacak partisipasi dan daftar kehadiran.
*   **Settings:** Entitas *Single-Row* (ID absolut = 1) untuk menyimpan identitas *branding* klub yang dipakai pada UI publik.

---

## 3. Konfigurasi Sistem (.env)

Agar server berhasil terhubung, buat berkas `.env` pada sistem operasi (khusus direktori *Backend*) dengan variabel environment yang solid:

```bash
# Server Port Configuration
PORT=5000
NODE_ENV=development # Ubah ke 'production' saat live

# Security Parameters
JWT_SECRET="ganti_dengan_rahasia_sepanjang_32_karakter_acak"
CORS_ORIGIN="http://localhost:5173" # URL frontend

# Database Address
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL="mysql://root:password@localhost:3306/taekwondo_db"

# SMTP Configuration (For Forgot Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM_NAME="KINETIC Academy"
SMTP_FROM_EMAIL="no-reply@kinetic.com"
FRONTEND_URL="http://localhost:5173"
```

---

## 4. Panduan Eksekusi Skrip (Installation)

Sirkulasi proyek bisa dijalankan pada mesin server baru hanya dengan 4 blok perintah standar NPM di dalam direktori `backend/`:

1. **Instalasi Paket Murni:**
   `npm install`
2. **Sinkronisasi Model ke Mesin Database MySQL:**
   Menggunakan perintah dorong dari Prisma untuk men-generate otomatis tabel-tabel kosong di SQL.
   `npx prisma db push`
3. **Menginjeksikan Data Akar (Seeding):**
   *Seed* berguna untuk menetaskan Akun *Superadmin* Default dan data hirarki sabuk wajib pertama kali.
   `npx prisma db seed`
4. **Menghidupkan Server API:**
   `npm run start` (Untuk lingkungan produksi menggunakan *Node* murni)
   `npm run dev` (Untuk tim pengembang menggunakan *Nodemon*)

---

## 5. Mesin Real-time Terintegrasi (SSE Notification)

Peringatan untuk pengembang ekstensi masa depan:
Fitur seperti Pembaruan *Invoice* Langsung menggunakan `EventEmitter` dari kapabilitas *Core Events* milik Node.js yang ditransfer melalui saluran SSE *Header*.

Tidak ada soket TCP mematikan yang dibuka terus-menerus. Saluran pembaruan `GET /api/notifications/stream` otomatis terputus oleh rutinitas Pembersihan Sampah (*Garbage Collector*) dari Node bila *Browser Klien* memutuskan HTTP. Alur ini membuat aplikasi amat ringan di-hosting pada spesifikasi *Virtual Private Server* (VPS) rendah.

***
*Dokumentasi disusun oleh Lead Engineer KINETIC Team.*
