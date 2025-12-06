'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FileText,
  PieChart,
  Shield,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import Navbar from '@/components/layout/navbar'; // Navbar layout global
import Footer from '@/components/layout/footer'; // Footer layout global

// Tipe data untuk slide hero
interface Slide {
  title: string; // Judul slide hero
  description: string; // Deskripsi singkat slide hero
  image: string; // URL gambar background slide
}

// Tipe data untuk item kartu informasi (akun/laporan)
interface InfoItem {
  icon: React.ReactNode; // Icon lucide (ReactNode)
  title: string; // Judul kartu informasi
  href: string;
  desc: string; // Deskripsi singkat kartu
}

// Halaman utama landing page Erajaya Accounting
const ErajayaLandingPage: React.FC = () => {
  // Inject CSS animasi & efek hover ke dalam <head> secara global
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(0, 188, 212, 0.3); }
        50% { box-shadow: 0 0 40px rgba(0, 188, 212, 0.6); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      .card-hover {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .card-hover:hover {
        background: linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(30, 136, 229, 0.1) 100%);
        border-color: #00bcd4;
        box-shadow:
          0 20px 60px rgba(0, 188, 212, 0.4),
          0 0 40px rgba(0, 188, 212, 0.2);
        transform: translateY(-8px) scale(1.02);
      }

      .card-hover:hover .icon-wrapper {
        animation: float 2s ease-in-out infinite;
      }

      .card-hover:hover .card-title {
        color: #00bcd4;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .animate-fade-in {
        animation: fadeIn 1s ease-out;
      }
    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
    return () => document.head.removeChild(style);
  }, []);

  // State UI global untuk halaman
  const [scrolled, setScrolled] = useState<boolean>(false); // Menandai apakah halaman sudah discroll (ubah style navbar)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false); // Menandai apakah menu mobile sedang terbuka
  const [currentSlide, setCurrentSlide] = useState<number>(0); // Menyimpan index slide hero yang aktif

  // Data slide hero
  const slides: Slide[] = [
    {
      title: 'Sistem Akuntansi Terintegrasi Erajaya',
      description:
        'Platform akuntansi modern yang mengintegrasikan seluruh aspek keuangan perusahaan Anda dalam satu sistem terpadu dan efisien.',
      image:
        '/banner-2.png',
    },
    {
      title: 'Laporan Keuangan Lebih Transparan',
      description:
        'Dapatkan insight real-time dengan visualisasi data yang jelas dan akurat untuk pengambilan keputusan bisnis yang lebih baik.',
      image:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
    },
    {
      title: 'Kelola Aset & Liabilitas dengan Mudah',
      description:
        'Sistem manajemen aset dan liabilitas yang komprehensif dengan monitoring otomatis dan pelaporan yang terstruktur.',
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    },
  ];

  // Data kartu untuk bagian "Akun-akun"
  const akunItems: InfoItem[] = [
    {
      icon: <Wallet className="w-6 h-6" />,
      title: 'Elemen Aset',
      href: '/akun/asset',
      desc: 'Kelola seluruh aset perusahaan secara terintegrasi',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Elemen Beban',
      href: '/akun/expense',
      desc: 'Monitoring dan analisis beban operasional',
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: 'Elemen Liabilitas',
      href: '/akun/liability',
      desc: 'Pencatatan kewajiban finansial perusahaan',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Elemen Penghasilan',
      href: '/akun/revenue',
      desc: 'Tracking pendapatan dari berbagai sumber',
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: 'Elemen Ekuitas',
      href: '/akun/equity',
      desc: 'Manajemen modal dan ekuitas pemilik',
    },
  ];

  // Data kartu untuk bagian "Laporan Keuangan"
  const laporanItems: InfoItem[] = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Laporan Laba Rugi',
      href: 'income-statement',
      desc: 'Analisis performa keuangan periode berjalan',
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: 'Laporan Arus Kas',
      href: 'cash-flow',
      desc: 'Monitoring cash flow masuk dan keluar',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Laporan Perubahan Ekuitas',
      href: 'equity-changes',
      desc: 'Tracking perubahan modal perusahaan',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Laporan Posisi Keuangan',
      href: 'balance-sheet',
      desc: 'Overview kondisi finansial perusahaan',
    },
  ];

  // Efek: set state scrolled berdasarkan posisi scroll window
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Efek: auto-rotate hero slider setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Handler untuk pindah ke slide berikutnya
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Handler untuk pindah ke slide sebelumnya
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="bg-[#0f0f12] text-white font-sans">
      {/* Navbar utama di bagian atas halaman */}
      <Navbar
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero section dengan slider fullscreen */}
      <section className="relative h-screen mt-16 overflow-hidden">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlide;

          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isActive ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Overlay gelap di atas gambar */}
              {idx != 0 && (<div className="absolute inset-0 bg-black/40 z-10" />)}

              {/* Gambar background slide */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />

              {/* Konten teks di tengah hero */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center max-w-4xl px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
                    {slide.title}
                  </h1>

                  <p className="text-lg md:text-xl mb-8 text-gray-300">
                    {slide.description}
                  </p>

                  {/* Tombol call-to-action di hero */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href='/about-us'
                      className="
                        px-8 py-3
                        border-2 border-[#00bcd4]
                        text-[#00bcd4]
                        hover:bg-[#00bcd4] hover:text-white
                        transition-all duration-300
                        rounded-lg shadow-lg hover:shadow-[#00bcd4]/50
                      "
                    >
                      Tentang Perusahaan
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Tombol navigasi slider ke kiri */}
        <button
          onClick={prevSlide}
          className="
            absolute left-4 top-1/2 -translate-y-1/2 z-30
            bg-white/10 hover:bg-white/20
            p-3 rounded-full
            backdrop-blur-sm transition-all
          "
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Tombol navigasi slider ke kanan */}
        <button
          onClick={nextSlide}
          className="
            absolute right-4 top-1/2 -translate-y-1/2 z-30
            bg-white/10 hover:bg-white/20
            p-3 rounded-full
            backdrop-blur-sm transition-all
          "
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indikator bullet posisi slide */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {slides.map((_, idx) => {
            const isActive = idx === currentSlide;

            return (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`
                  h-3 rounded-full transition-all
                  ${isActive ? 'bg-[#00bcd4] w-8' : 'bg-white/50 w-3'}
                `}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </section>

      {/* Section informasi akun-akun dan laporan keuangan */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Judul utama section informasi akuntansi */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Informasi Akuntansi Erajaya
            </h2>
            <p className="text-gray-400 text-lg">
              Akses cepat ke akun-akun utama dan laporan keuangan perusahaan
              Anda.
            </p>
          </div>

          {/* Grid 2 kolom: Akun-akun dan Laporan keuangan */}
          <div className="grid gap-12">
            {/* Kolom: Akun-akun */}
            <div>
              <h3
                className="text-2xl font-bold mb-6"
                style={{ color: '#00bcd4' }}
              >
                Akun-akun
              </h3>

              <div className="flex flex-wrap gap-6 justify-center">
                {akunItems.map((item, idx) => (
                  <a
                    key={idx}
                    className="card-hover md:w-auto w-full p-6 rounded-xl border cursor-pointer"
                    href={item.href}
                    style={{
                      backgroundColor: '#1a1a1f',
                      borderColor: '#2a2a2f',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="icon-wrapper"
                        style={{ color: '#00bcd4' }}
                      >
                        {item.icon}
                      </div>

                      <div className="flex-1">
                        <h4 className="card-title font-semibold text-lg mb-2">
                          {item.title}
                        </h4>
                        <p
                          className="text-sm"
                          style={{ color: '#9ca3af' }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Kolom: Laporan Keuangan */}
            <div>
              <h3
                className="text-2xl font-bold mb-6"
                style={{ color: '#00bcd4' }}
              >
                Laporan Keuangan
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                {laporanItems.map((item, idx) => (
                  <a
                    key={idx}
                    href={`/laporan/?report=${item.href}`}
                    className="card-hover md:h-50 p-6 rounded-xl border cursor-pointer flex justify-center"
                    style={{
                      backgroundColor: '#1a1a1f',
                      borderColor: '#2a2a2f',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="icon-wrapper"
                        style={{ color: '#00bcd4' }}
                      >
                        {item.icon}
                      </div>

                      <div className="flex-1">
                        <h4 className="card-title font-semibold text-lg mb-2">
                          {item.title}
                        </h4>
                        <p
                          className="text-sm"
                          style={{ color: '#9ca3af' }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer global di bagian bawah halaman */}
      <Footer />
    </div>
  );
};

export default ErajayaLandingPage;
