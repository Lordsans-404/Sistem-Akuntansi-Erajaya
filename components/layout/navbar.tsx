'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
}

const laporanItems: MenuItem[] = [
  { label: 'Laporan Posisi Keuangan', href: 'balance-sheet' },
  { label: 'Laporan Laba Rugi', href: 'income-statement' },
  { label: 'Laporan Arus Kas', href: 'cash-flow' },
  { label: 'Laporan Perubahan Ekuitas', href: 'equity-changes' },
];

const akunItems: MenuItem[] = [
  { label: 'Kas', href: 'kas' },
  { label: 'Bank', href: 'bank' },
  { label: 'Piutang', href: 'piutang' },
  { label: 'Persediaan', href: 'persediaan' },
  { label: 'Aset Tetap', href: 'aset-tetap' },
];

interface NavbarProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  scrolled,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const [laporanDropdownOpen, setLaporanDropdownOpen] = useState(false);
  const [asetDropdownOpen, setAkunDropdownOpen] = useState(false);
  const [mobileLaporanOpen, setMobileLaporanOpen] = useState(false);
  const [mobileAsetOpen, setMobileAsetOpen] = useState(false);

  const laporanRef = useRef<HTMLDivElement>(null);
  const asetRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (laporanRef.current && !laporanRef.current.contains(event.target as Node)) {
        setLaporanDropdownOpen(false);
      }
      if (asetRef.current && !asetRef.current.contains(event.target as Node)) {
        setAkunDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 
        ${scrolled
          ? 'bg-[rgba(15,15,18,0.6)] backdrop-blur-xl'
          : 'bg-[rgba(10,10,12,0.3)] backdrop-blur-lg'
        }
      `}
    >
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/">
            <img
              src="/logo-nav.png"
              alt="Erajaya Logo"
              className="h-15 w-auto object-contain select-none"
            />
          </a>

          {/* Menu desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Jurnal Umum */}
            <a
              href="/journal"
              className="
                hover:text-[#00bcd4]
                text-gray-300
                transition-all duration-200
                hover:drop-shadow-[0_0_6px_#00bcd4]
              "
            >
              Jurnal Umum
            </a>

            {/* Dropdown Akun Aset */}
            <div className="relative" ref={asetRef}>
              <button
                onClick={() => setAkunDropdownOpen(!asetDropdownOpen)}
                className="
                  flex items-center space-x-1
                  hover:text-[#00bcd4]
                  text-gray-300
                  transition-all duration-200
                  hover:drop-shadow-[0_0_6px_#00bcd4]
                "
              >
                <span>Akun-Akun</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${asetDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {asetDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1f] border border-gray-800 rounded-lg shadow-lg overflow-hidden">
                  {akunItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={`/akun-aset/${item.href}`}
                      className="
                        block px-4 py-3 text-gray-300
                        hover:bg-[#252530] hover:text-[#00bcd4]
                        transition-all duration-200
                        border-b border-gray-800 last:border-b-0
                      "
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {/* Dropdown Laporan */}
            <div className="relative" ref={laporanRef}>
              <button
                onClick={() => setLaporanDropdownOpen(!laporanDropdownOpen)}
                className="
                  flex items-center space-x-1
                  hover:text-[#00bcd4]
                  text-gray-300
                  transition-all duration-200
                  hover:drop-shadow-[0_0_6px_#00bcd4]
                "
              >
                <span>Laporan</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${laporanDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {laporanDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1f] border border-gray-800 rounded-lg shadow-lg overflow-hidden">
                  {laporanItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={`/laporan/?report=${item.href}`}
                      className="
                        block px-4 py-3 text-gray-300
                        hover:bg-[#252530] hover:text-[#00bcd4]
                        transition-all duration-200
                        border-b border-gray-800 last:border-b-0
                      "
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tombol toggle menu mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a1a1f] border-t border-gray-800">
          <div className="px-4 py-4 space-y-3">
            {/* Jurnal Umum - Mobile */}
            <a
              href="/jurnal-umum"
              className="block text-gray-300 hover:text-[#00bcd4] transition-colors duration-200"
            >
              Jurnal Umum
            </a>

            {/* Dropdown Akun Aset - Mobile */}
            <div>
              <button
                onClick={() => setMobileAsetOpen(!mobileAsetOpen)}
                className="flex items-center justify-between w-full text-gray-300 hover:text-[#00bcd4] transition-colors duration-200"
              >
                <span>Akun Aset</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${mobileAsetOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {mobileAsetOpen && (
                <div className="mt-2 ml-4 space-y-2">
                  {akunItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={`/akun-aset/${item.href}`}
                      className="block text-gray-400 hover:text-[#00bcd4] transition-colors duration-200 text-sm"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {/* Dropdown Laporan - Mobile */}
            <div>
              <button
                onClick={() => setMobileLaporanOpen(!mobileLaporanOpen)}
                className="flex items-center justify-between w-full text-gray-300 hover:text-[#00bcd4] transition-colors duration-200"
              >
                <span>Laporan</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${mobileLaporanOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {mobileLaporanOpen && (
                <div className="mt-2 ml-4 space-y-2">
                  {laporanItems.map((item, idx) => (
                    <a
                      key={idx}
                      href={`/laporan/?report=${item.href}`}
                      className="block text-gray-400 hover:text-[#00bcd4] transition-colors duration-200 text-sm"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;