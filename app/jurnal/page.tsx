'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import { JournalTransaction } from '@/types/index';
// import Link from 'next/link'; // Using standard <a> or simple router push if preferred, but Link is better. 
// Using <a> labels/href as used in other parts of the project or Link if accessible.

export default function JournalListPage() {
    const [journals, setJournals] = useState<JournalTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchJournals = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);

            const res = await fetch(`/api/journal?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch journals');

            const data = await res.json();
            setJournals(data);
        } catch (err) {
            console.error(err);
            setError('Gagal memuat data jurnal.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournals();
    }, []);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchJournals();
    };

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#0f0f12] p-4 md:p-8">
            <Navbar scrolled={scrolled} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            <div className="max-w-7xl mt-20 mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <FileText className="text-blue-500" />
                            Jurnal Umum
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Daftar seluruh transaksi jurnal umum perusahaan
                        </p>
                    </div>

                    <div className='flex flex-row gap-2'>
                        <a
                            href="/tutup-buku"
                            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/20 transition-all flex items-center group"
                        >
                            Tutup Buku
                        </a>
                        <a
                            href="/jurnal/create"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 group"
                        >
                            Buat Jurnal Baru
                            <ArrowRight size={16} className="opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </a>
                    </div>

                </div>

                {/* Filter Section */}
                <div className="bg-[#1a1a1f] p-4 rounded-xl border border-[#2a2a2f] mb-6">
                    <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Dari Tanggal</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-[#0f0f12] border border-[#2a2a2f] rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Sampai Tanggal</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-[#0f0f12] border border-[#2a2a2f] rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="bg-[#2a2a2f] hover:bg-[#3a3a3f] text-white px-6 py-2 rounded-lg border border-[#3a3a3f] transition-colors flex items-center gap-2"
                        >
                            <Filter size={16} /> Filter
                        </button>
                    </form>
                </div>

                {/* Content Section */}
                <div className="bg-[#1a1a1f] rounded-xl shadow-2xl border border-[#2a2a2f] overflow-hidden min-h-[400px]">

                    {loading && (
                        <div className="flex flex-col items-center justify-center p-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-500">Memuat data jurnal...</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-8 text-center">
                            <p className="text-red-400">{error}</p>
                            <button onClick={() => fetchJournals()} className="mt-4 text-blue-400 underline">Coba lagi</button>
                        </div>
                    )}

                    {!loading && !error && journals.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <FileText size={48} className="text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-300">Belum ada transaksi</h3>
                            <p className="text-gray-500 mt-2 max-w-sm">
                                Belum ada data jurnal yang ditemukan untuk periode ini. Silakan buat jurnal baru.
                            </p>
                        </div>
                    )}

                    {!loading && !error && journals.length > 0 && (
                        <div className="divide-y divide-[#2a2a2f]">
                            {journals.map((journal) => (
                                <div key={journal.id} className="p-6 hover:bg-[#2a2a2f]/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-bold text-lg text-white">{formatDate(journal.date)}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    #{journal.id?.substring(0, 6)}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm"><b>Deskripsi Transaksi </b>: {journal.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xl font-bold text-white tracking-tight">
                                                {formatMoney(journal.total_debit)}
                                            </span>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider">Total Nilai</span>
                                        </div>
                                    </div>

                                    {/* Detail Entries Preview */}
                                    <div className="bg-[#0f0f12] rounded-lg border border-[#2a2a2f]/50 p-3 text-sm">
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="text-left text-gray-500 font-normal pb-2 w-[50%]">Akun</th>
                                                    <th className="text-right text-gray-500 font-normal pb-2 w-[25%]">Debit</th>
                                                    <th className="text-right text-gray-500 font-normal pb-2 w-[25%]">Kredit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {journal.entries.map((entry, idx) => (
                                                    <tr key={idx} className="border-t border-[#2a2a2f]/50">
                                                        <td className="py-1.5 text-gray-300 pl-2 border-l-2 border-transparent hover:border-blue-500 transition-colors">
                                                            {entry.account.name}
                                                        </td>
                                                        <td className="py-1.5 text-right text-gray-400 font-mono">
                                                            {entry.debit > 0 ? formatMoney(entry.debit) : '-'}
                                                        </td>
                                                        <td className="py-1.5 text-right text-gray-400 font-mono">
                                                            {entry.credit > 0 ? formatMoney(entry.credit) : '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
