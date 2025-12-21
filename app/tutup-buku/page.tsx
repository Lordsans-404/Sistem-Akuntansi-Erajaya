'use client';

import React, { useState } from 'react';
import { Archive, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import { closeBooks } from '@/app/actions/financial-closing';

export default function TutupBukuPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [period, setPeriod] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });

    // Automatically calculate previous period based on selection
    const getPreviousPeriod = (current: string) => {
        const [year, month] = current.split('-').map(Number);
        const date = new Date(year, month - 1 - 1, 1); // Subtract 1 months
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    };

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCloseBooks = async () => {
        if (!confirm(`Apakah Anda yakin ingin melakukan Tutup Buku untuk periode ${period}?`)) return;

        setLoading(true);
        setResult(null);

        try {
            const prevPeriod = getPreviousPeriod(period);
            const res = await closeBooks(period, prevPeriod);
            setResult(res);
        } catch (error) {
            console.error(error);
            setResult({ success: false, message: "Terjadi kesalahan sistem." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0f0f12] min-h-screen text-white font-sans">
            <Navbar
                scrolled={scrolled}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className="min-h-screen mt-16 p-4 md:p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Archive className="text-[#00bcd4]" size={36} />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Tutup Buku</h1>
                        <p className="text-gray-400">Proses kalkulasi saldo akhir periode akuntansi</p>
                    </div>
                </div>

                <div className="bg-[#1a1a1f] rounded-xl border border-[#2a2a2f] p-8 shadow-2xl">
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Pilih Periode (YYYY-MM)
                        </label>
                        <input
                            type="month"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full md:w-1/2 p-3 border-2 border-[#2a2a2f] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] bg-[#2a2a2f] text-white"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Akan menghitung saldo menggunakan saldo awal dari periode: <span className="text-[#00bcd4]">{getPreviousPeriod(period)}</span>
                        </p>
                    </div>

                    <div className="bg-[#2a2a2f]/50 p-4 rounded-lg border border-yellow-800/30 mb-8">
                        <h4 className="flex items-center gap-2 text-yellow-500 font-semibold mb-2">
                            <AlertCircle size={18} />
                            Perhatian
                        </h4>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                            <li>Pastikan semua transaksi jurnal untuk periode ini sudah selesai diinput.</li>
                            <li>Proses ini akan menghitung ulang saldo akhir setiap akun Laporan Keuangan.</li>
                            <li>Akun Laba Rugi (Pendapatan/Beban) akan direset setiap awal periode jika tidak ada mutasi (net 0).</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleCloseBooks}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 
                            ${loading
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-[#00bcd4] hover:bg-[#00acc1] text-black shadow-lg shadow-cyan-500/20'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <Archive size={20} />
                                Proses Tutup Buku
                            </>
                        )}
                    </button>

                    {/* Result Display */}
                    {result && (
                        <div className={`mt-8 p-6 rounded-xl border ${result.success ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {result.success ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
                                <h3 className={`font-bold text-lg ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.success ? 'Berhasil' : 'Gagal'}
                                </h3>
                            </div>
                            <p className="text-gray-300">{result.message}</p>

                            {result.details && (
                                <div className="mt-4 max-h-60 overflow-y-auto bg-black/30 p-4 rounded text-xs font-mono text-gray-400">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-700 text-gray-500">
                                                <th className="py-2">Akun</th>
                                                <th className="py-2 text-right">Saldo Awal</th>
                                                <th className="py-2 text-right">Mutasi</th>
                                                <th className="py-2 text-right">Saldo Akhir</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.details.map((item: any, idx: number) => (
                                                <tr key={idx} className="border-b border-gray-800/50">
                                                    <td className="py-1">{item.name}</td>
                                                    <td className="py-1 text-right">{(item.prev || 0).toLocaleString()}</td>
                                                    <td className="py-1 text-right">{(item.mutation || 0).toLocaleString()}</td>
                                                    <td className="py-1 text-right text-white">{item.final.toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
