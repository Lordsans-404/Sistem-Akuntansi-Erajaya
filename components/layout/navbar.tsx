'use client';

import React from 'react';
import { Menu, X } from 'lucide-react';
interface MenuItem {
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { label: 'Laporan Laba Rugi', href: 'balance-sheet' },
  { label: 'Laporan Arus Kas', href: 'income-statement' },
  { label: 'Laporan Perubahan Ekuitas', href: 'cash-flow' },
  { label: 'Laporan Posisi Keuangan', href: 'equity-changes' },
];
// Props untuk komponen Navbar
interface NavbarProps {
  scrolled: boolean; // Menandai apakah halaman sudah discroll (ubah style navbar)
  mobileMenuOpen: boolean; // Menandai apakah menu mobile sedang terbuka
  setMobileMenuOpen: (open: boolean) => void; // Setter untuk toggle menu mobile
}


const Navbar: React.FC<NavbarProps> = ({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[rgba(20,20,25,0.85)] backdrop-blur-md'
          : 'bg-[#111]'
      }`}
    >
      {/* Wrapper navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo brand Erajaya Accounting */}
          <a href="/" className="text-xl font-bold">
            <span className="text-white">Erajaya</span>
            <span className="text-[#00bcd4]"> Accounting</span>
          </a>

          {/* Menu desktop */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href={`/laporan/?report=${item.href}`}
                className="hover:text-[#00bcd4] transition-colors duration-200 text-sm"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Tombol toggle menu mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Menu mobile (muncul saat mobileMenuOpen = true) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a1a1f] border-t border-gray-800">
          <div className="px-4 py-4 space-y-3">
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href={`/laporan/?report=${item.href}`}
                className="block hover:text-[#00bcd4] transition-colors duration-200"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
