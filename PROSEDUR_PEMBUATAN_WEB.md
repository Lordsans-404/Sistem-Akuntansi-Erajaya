# Prosedur Pembuatan Sistem Informasi Akuntansi Berbasis Web

Berikut adalah ringkasan teknis tahapan pengembangan sistem:

### 1. Persiapan & Inisialisasi Proyek
Langkah awal dimulai dengan menyiapkan lingkungan kerja (development environment).
- **Framework**: Menggunakan **Next.js 14** (App Router) untuk performa dan SEO yang optimal.
- **Bahasa**: **TypeScript** dipilih untuk meminimalisir bug tipe data (type-safety).
- **Styling**: Menggunakan **Tailwind CSS** untuk mempercepat desain antarmuka yang responsif dan modern.

### 2. Perancangan Database (Firebase)
Sistem menggunakan **Google Firebase (Firestore)** sebagai database NoSQL yang fleksibel.
- **Koleksi Data**: Membuat skema koleksi utama:
  - `journal_accounts`: Menyimpan data akun (Kode, Nama, Kategori).
  - `journals`: Menyimpan transaksi harian beserta detail debit/kredit.
- **Konfigurasi**: Menghubungkan aplikasi dengan Firebase SDK untuk operasi CRUD (Create, Read, Update, Delete) secara real-time.

### 3. Pengembangan Logika Bisnis (Backend)
Fokus pada validasi dan pengolahan data akuntansi.
- **API Routes**: Membuat endpoint `/api/journal` untuk menangani permintaan data.
- **Validasi Jurnal**: Menerapkan logika validasi wajib "Balance" dimana Total Debit harus sama dengan Total Kredit sebelum data disimpan.
- **Algoritma Posting**: Memastikan setiap transaksi yang disimpan otomatis mempengaruhi saldo di Buku Besar.

### 4. Pengembangan Antarmuka Pengguna (Frontend)
Membangun halaman-halaman visual yang intuitif bagi pengguna.
- **Input Jurnal**: Membuat form dinamis yang memungkinkan penambahan baris transaksi tanpa batas.
- **Buku Besar Interaktif**: Mengembangkan tabel yang mendukung filter tanggal dan akun, serta perhitungan *running balance* (saldo berjalan) otomatis.
- **Fitur Custom ID**: Menambahkan logika *client-side generation* untuk membuat ID transaksi yang mudah dibaca (misal: `A-001`) sesuai kategori akun.

### 5. Integrasi & Pengujian
- Menghubungkan Frontend dengan Backend API.
- Melakukan pengujian alur (End-to-End Testing) mulai dari pencatatan transaksi, pengecekan mutasi di buku besar, hingga verifikasi keseimbangan di laporan keuangan.
