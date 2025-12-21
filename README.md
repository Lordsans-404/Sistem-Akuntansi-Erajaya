# Sistem Akuntansi Erajaya

Selamat datang di Sistem Akuntansi Erajaya. Dokumen ini berisi panduan lengkap aliran penggunaan aplikasi mulai dari halaman utama hingga penggunaan seluruh fitur akuntansi.

## Alur Penggunaan Aplikasi (User Flow)

Ikuti langkah-langkah berikut untuk mencoba seluruh fitur aplikasi secara berurutan.

### 1. Halaman Utama (Dashboard)
**URL**: `/`
- Saat pertama kali membuka aplikasi, Anda akan disambut dengan halaman Dashboard.
- Halaman ini menyajikan ringkasan status keuangan perusahaan.
- **Aksi**: Perhatikan navigasi utama di bagian atas (Header) untuk berpindah ke modul lain.

### 2. Manajemen Akun (Chart of Accounts)
**URL**: `/akun`
- Sebelum melakukan transaksi, pastikan daftar akun sudah tersedia.
- **Fitur**: Melihat daftar akun (Aset, Kewajiban, Ekuitas, Pendapatan, Beban).
- **Aksi**: Cek apakah akun-akun penting seperti "Kas", "Pendapatan Jasa", dan "Beban Gaji" sudah ada.

### 3. Jurnal Umum (General Journal)
**URL**: `/jurnal`
Halaman ini adalah tempat pencatatan transaksi harian.

#### a. Melihat Daftar Transaksi
- Anda akan melihat daftar transaksi yang telah dikelompokkan berdasarkan bukti transaksi.
- **Fitur Baru**: Kolom **ID** pada tabel detail transaksi.
  - ID dibuat otomatis berdasarkan kategori akun + nomor urut (Contoh: `A-001` untuk Aset, `B-005` untuk Beban).
  - ID ini bersifat dinamis sesuai tampilan layar untuk memudahkan identifikasi baris.

#### b. Membuat Jurnal Baru
- Klik tombol **"Buat Jurnal Baru"** di pojok kanan atas atau akses `/jurnal/create`.
- **Form Input**:
  - **Tanggal**: Pilih tanggal transaksi.
  - **Keterangan**: Masukkan deskripsi transaksi (Contoh: "Pembayaran Listrik Bulan Juni").
  - **Baris Jurnal**:
    - Pilih **Akun** (misal: Beban Listrik).
    - Masukkan nominal di **Debit**.
    - Tambah baris baru, pilih **Akun Lawan** (misal: Kas).
    - Masukkan nominal di **Kredit**.
  - **Auto Balance**: Jika nilai debit dan kredit belum imbang, gunakan fitur ini (jika tersedia) atau sesuaikan manual hingga indikator menjadi hijau.
  - Klik **Simpan** (Akan diminta PIN konfirmasi jika diaktifkan).

### 4. Buku Besar (General Ledger)
**URL**: `/buku-besar`
Setelah jurnal dibuat, data akan otomatis terposting ke Buku Besar.

#### a. Tampilan Semua Akun (Gabungan)
- Secara default, halaman ini menampilkan seluruh riwayat transaksi seperti Jurnal Umum.
- **Cek Fitur ID**: Perhatikan kolom ID yang berurutan sesuai kategori akun (`A-001`, `B-001`, dll).

#### b. Filter Per Akun (Mutasi Spesifik)
- Pada dropdown **"Pilih Akun"**, pilih salah satu akun (misal: "Kas").
- Tampilan akan berubah menjadi tabel mutasi khusus akun tersebut.
- **Informasi**:
  - Saldo Awal (jika ada).
  - Mutasi Debit/Kredit setiap transaksi.
  - **Saldo Akhir (Running Balance)**: Saldo akan terupdate otomatis baris demi baris.
  - Kolom **ID** akan mereset urutannya menjadi `1` kembali khusus untuk tampilan akun ini, memudahkan penelusuran per akun.

### 5. Laporan Keuangan
**URL**: `/laporan`
Fitur ini menyajikan hasil akhir dari proses akuntansi.

- Pilih jenis laporan yang ingin dilihat:
  - **Neraca (Balance Sheet)**: Posisi keuangan (Aset = Kewajiban + Modal).
  - **Laba Rugi (Income Statement)**: Performa operasional (Pendapatan - Beban).
- Cek apakah transaksi yang baru Anda input di Jurnal Umum tadi sudah merefleksikan perubahan angka di laporan ini.

### 6. Tentang Kami (About Us)
**URL**: `/about-us`
- Halaman informasi mengenai perusahaan dan tim pengembang.
- Terdapat visualisasi grafik kinerja keuangan (Profit/Loss trend) jika data tersedia.

---

## Catatan Teknis (Fitur ID Custom)
Kami telah menambahkan fitur **Custom ID** pada tabel Jurnal dan Buku Besar dengan logika berikut:
- **Format**: `[KodeKategori]-[NomorUrut]`
- **Kode Kategori**:
  - **A**: Asset (Aset)
  - **B**: Expense (Beban)
  - **L**: Liability (Kewajiban)
  - **P**: Revenue (Pendapatan)
  - **E**: Equity (Ekuitas)
- **Nomor Urut**: Dibuat secara otomatis di sisi *Frontend* (Client-side) berdasarkan urutan baris yang tampil di layar. Ini memastikan penomoran selalu rapi dan berurutan dari atas ke bawah, memudahkan pembacaan laporan di layar.
