'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar } from 'lucide-react';

import Navbar from '@/components/layout/navbar'; // Navbar layout global
import Footer from '@/components/layout/footer'; // Footer layout global
import { useSearchParams } from "next/navigation";

// Types
interface Period {
  id: string;
  code: string;
  label: string;
}

interface FinancialRow {
  id: string;
  name: string;
  amount: number;
  isTotal?: boolean;
}

interface FinancialSection {
  id: string;
  label: string;
  rows: FinancialRow[];
}

interface FinancialReport {
  name: string;
  periodCode: string;
  currency: string;
  unit?: string;
  sections?: FinancialSection[];
}

export default function AccountingDashboard() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [reportData, setReportData] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scrolled, setScrolled] = useState<boolean>(false); // Menandai apakah halaman sudah discroll (ubah style navbar)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false); // Menandai apakah menu mobile sedang terbuka
  
  const searchParams = useSearchParams();
  const [reportType, setReportType] = useState(() => {
    // Logika ini hanya jalan SATU KALI saat komponen pertama kali muncul
    return searchParams.get("report") || "balance_sheet";
  });
  // Load periods
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const res = await fetch('/api/periods');
        const data = await res.json();
        setPeriods(data);
        if (data.length > 0) {
          setSelectedPeriod(data[0].code);
        }
      } catch (e) {
        console.error(e);
        setError('Gagal memuat daftar periode');
      }
    };
    loadPeriods();
  }, []);

  // Load report
  useEffect(() => {
    if (!selectedPeriod) return;

    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/reports/${reportType}?period=${selectedPeriod}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data?.error || 'Gagal memuat laporan');
          setReportData(null);
          return;
        }
        setReportData(data as FinancialReport);
      } catch (e) {
        console.error(e);
        setError('Terjadi kesalahan jaringan saat memuat laporan');
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [selectedPeriod, reportType]);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  const formatCompact = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}M`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}Jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}Rb`;
    return val.toString();
  };

  const reportTypes = [
    { value: 'balance-sheet', label: 'Neraca (Posisi Keuangan)', icon: '📊' },
    { value: 'income-statement', label: 'Laba Rugi', icon: '💰' },
    { value: 'cash-flow', label: 'Arus Kas', icon: '💸' },
    { value: 'equity-changes', label: 'Perubahan Ekuitas', icon: '📈' },
  ];

  return (
    <div className="bg-[#0f0f12] text-white font-sans">
      {/* Navbar utama di bagian atas halaman */}
      <Navbar
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="min-h-screen mt-16 bg-[#0f0f12] text-white">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText className="text-[#00bcd4]" size={36} />
              Sistem Laporan Keuangan
            </h1>
            <p className="text-gray-400">Dashboard interaktif untuk analisis laporan keuangan perusahaan</p>
          </div>

          {/* Controls */}
          <div className="bg-[#1a1a1f] rounded-xl shadow-2xl p-6 mb-8 border border-[#2a2a2f]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <FileText size={16} />
                  Jenis Laporan
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {reportTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setReportType(type.value)}
                      className={`p-3 rounded-lg text-left transition-all duration-300 flex items-center gap-3 ${
                        reportType === type.value
                          ? 'bg-[#00bcd4] text-white shadow-lg shadow-[#00bcd4]/50'
                          : 'bg-[#2a2a2f] text-gray-300 hover:bg-[#3a3a3f] border border-[#3a3a3f]'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Period Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <Calendar size={16} />
                  Periode
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full p-3 border-2 border-[#2a2a2f] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent bg-[#2a2a2f] text-gray-200"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-[#1a1a1f] rounded-xl shadow-2xl p-12 text-center border border-[#2a2a2f]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00bcd4] mx-auto mb-4"></div>
              <p className="text-gray-400">Memuat data laporan...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-900/20 border-l-4 border-red-500 rounded-lg p-6 mb-8">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Report Display */}
          {!loading && !error && reportData && (
            <>
              {/* Detailed Report */}
              <div className="bg-[#1a1a1f] rounded-xl shadow-2xl border border-[#2a2a2f] overflow-hidden">
                <div className="bg-gradient-to-r from-[#00bcd4] to-[#1e88e5] text-white p-6">
                  <h2 className="text-2xl font-bold mb-1">{reportData.name}</h2>
                  <p className="text-blue-100 text-sm">
                    Periode: {reportData.periodCode} • Mata uang: {reportData.currency}
                    {reportData.unit === 'thousand' && ' (dalam ribuan)'}
                  </p>
                </div>

                <div className="p-6 space-y-8">
                  {reportData.sections?.map((section, sectionIdx) => (
                    <div key={section.id} className="border-b border-[#2a2a2f] last:border-b-0 pb-6 last:pb-0">
                      <h3 className="font-bold text-lg mb-4 text-[#00bcd4] flex items-center gap-2 bg-[#2a2a2f]/50 p-3 rounded-lg">
                        <span className="bg-[#00bcd4] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {sectionIdx + 1}
                        </span>
                        {section.label}
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <tbody>
                            {section.rows.map((row, rowIdx) => (
                              <tr
                                key={row.id}
                                className={`
                                  ${row.isTotal ? 'bg-[#2a2a2f]/50 border-t-2 border-[#00bcd4]/30' : 'hover:bg-[#2a2a2f]/30'}
                                  ${rowIdx !== section.rows.length - 1 ? 'border-b border-[#2a2a2f]/30' : ''}
                                `}
                              >
                                <td className={`py-3 px-4 ${row.isTotal ? 'font-bold text-white' : 'text-gray-300'}`}>
                                  <div className="flex items-center gap-2">
                                    {!row.isTotal && <span className="text-gray-600 text-xs">•</span>}
                                    {row.name}
                                  </div>
                                </td>
                                <td className={`py-3 px-4 text-right font-mono whitespace-nowrap ${
                                  row.isTotal ? 'font-bold text-lg' : ''
                                } ${row.amount < 0 ? 'text-red-400' : 'text-gray-200'}`}>
                                  <div className="flex items-center justify-end gap-2">
                                    {row.amount > 0 && !row.isTotal && <TrendingUp size={14} className="text-green-400" />}
                                    {row.amount < 0 && !row.isTotal && <TrendingDown size={14} className="text-red-400" />}
                                    {formatMoney(row.amount)}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!loading && !error && !reportData && (
            <div className="bg-[#1a1a1f] rounded-xl shadow-2xl p-12 text-center border border-[#2a2a2f]">
              <FileText size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Tidak ada data tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}