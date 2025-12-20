'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Book, Calendar, ArrowRight, Printer } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import { JournalTransaction, JournalEntryItem } from '@/types/index';

// Extended type for ledger rows to include running balance
interface LedgerRow {
    id: string; // Journal ID
    date: string;
    description: string;
    ref?: string; // Reference number
    debit: number;
    credit: number;
    balance: number;
}

interface AccountOption {
    id: string;
    name: string;
    code?: string;
}

export default function GeneralLedgerPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Data States
    const [journals, setJournals] = useState<JournalTransaction[]>([]);
    const [accounts, setAccounts] = useState<AccountOption[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter States
    const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
    });

    // Load Accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const { db } = await import("@/lib/firebase");
                const { collection, getDocs, orderBy, query } = await import("firebase/firestore");

                const q = query(collection(db, "journal_accounts"), orderBy("name"));
                const snapshot = await getDocs(q);

                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as any[];

                setAccounts(data);
            } catch (err) {
                console.error("Error loading accounts", err);
            }
        };
        fetchAccounts();
    }, []);

    // Load Journals when date changes
    useEffect(() => {
        const fetchJournals = async () => {
            setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };

        fetchJournals();
    }, [startDate, endDate]);

    // Helper to get Account Name
    const getAccountName = (id: string) => {
        const acc = accounts.find(a => a.id === id);
        return acc ? (acc.code ? `${acc.code} - ${acc.name}` : acc.name) : 'Unknown Account';
    };

    // Process Ledger Data (Only for Single Account View)
    const ledgerData = useMemo(() => {
        if (selectedAccountId === 'ALL' || !selectedAccountId || !journals.length) return [];

        const rows: LedgerRow[] = [];
        let runningBalance = 0;

        const relevantEntries: {
            journal: JournalTransaction,
            entry: JournalEntryItem
        }[] = [];

        journals.forEach(journal => {
            journal.entries.forEach(entry => {
                const entryAccountId = entry.account?.id || entry.account;
                if (entryAccountId === selectedAccountId) {
                    relevantEntries.push({ journal, entry });
                }
            });
        });

        relevantEntries.sort((a, b) => new Date(a.journal.date).getTime() - new Date(b.journal.date).getTime());

        relevantEntries.forEach(({ journal, entry }) => {
            const deb = Number(entry.debit) || 0;
            const cred = Number(entry.credit) || 0;
            runningBalance += (deb - cred);

            rows.push({
                id: journal.id || '',
                date: journal.date,
                description: journal.description,
                ref: journal.id?.substring(0, 6).toUpperCase(),
                debit: deb,
                credit: cred,
                balance: runningBalance
            });
        });

        return rows;
    }, [selectedAccountId, journals]);

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(val));

    // Calculate Totals for Single Account
    const totalDebit = ledgerData.reduce((acc, row) => acc + row.debit, 0);
    const totalCredit = ledgerData.reduce((acc, row) => acc + row.credit, 0);
    const endingBalance = ledgerData.length > 0 ? ledgerData[ledgerData.length - 1].balance : 0;

    const currentAccount = accounts.find(a => a.id === selectedAccountId);

    return (
        <div className="bg-[#0f0f12] min-h-screen text-white font-sans">
            <Navbar
                scrolled={scrolled}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className="min-h-screen mt-16 p-4 md:p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <Book className="text-[#00bcd4]" size={36} />
                            {selectedAccountId === 'ALL' ? 'Jurnal Umum' : 'Buku Besar'}
                        </h1>
                        <p className="text-gray-400">
                            {selectedAccountId === 'ALL'
                                ? 'Semua transaksi jurnal yang tercatat'
                                : 'Riwayat detail transaksi per akun'}
                        </p>
                    </div>
                    <button
                        onClick={() => window.print()}
                        className="bg-[#2a2a2f] hover:bg-[#3a3a3f] text-white px-5 py-2.5 rounded-lg border border-[#3a3a3f] transition-all flex items-center gap-2"
                    >
                        <Printer size={18} />
                        Cetak Laporan
                    </button>
                </div>

                {/* Controls */}
                <div className="bg-[#1a1a1f] rounded-xl shadow-2xl p-6 mb-8 border border-[#2a2a2f]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Account Selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <Book size={16} />
                                Pilih Tampilan
                            </label>
                            <select
                                value={selectedAccountId}
                                onChange={(e) => setSelectedAccountId(e.target.value)}
                                className="w-full p-3 border-2 border-[#2a2a2f] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent bg-[#2a2a2f] text-gray-200"
                            >
                                <option value="ALL">Semua Akun (Jurnal Umum)</option>
                                <option disabled>────────────────</option>
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.code ? `${acc.code} - ` : ''}{acc.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                    <Calendar size={16} />
                                    Dari Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-3 border-2 border-[#2a2a2f] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent bg-[#2a2a2f] text-gray-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                    <ArrowRight size={16} />
                                    Sampai Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-3 border-2 border-[#2a2a2f] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4] focus:border-transparent bg-[#2a2a2f] text-gray-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards (Only for Single Account) */}
                {selectedAccountId !== 'ALL' && currentAccount && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-[#1a1a1f] to-[#25252b] p-6 rounded-xl border border-[#2a2a2f]">
                            <p className="text-gray-400 text-sm mb-1">Total Debit</p>
                            <p className="text-2xl font-bold text-blue-400">{formatMoney(totalDebit)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#1a1a1f] to-[#25252b] p-6 rounded-xl border border-[#2a2a2f]">
                            <p className="text-gray-400 text-sm mb-1">Total Kredit</p>
                            <p className="text-2xl font-bold text-orange-400">{formatMoney(totalCredit)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#1a1a1f] to-[#25252b] p-6 rounded-xl border border-[#2a2a2f]">
                            <p className="text-gray-400 text-sm mb-1">Saldo Akhir</p>
                            <p className={`text-2xl font-bold ${endingBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {endingBalance < 0 ? `(${formatMoney(endingBalance)})` : formatMoney(endingBalance)}
                                <span className="text-xs ml-2 text-gray-500">{endingBalance >= 0 ? 'Dr' : 'Cr'}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="bg-[#1a1a1f] rounded-xl shadow-2xl border border-[#2a2a2f] overflow-hidden">
                    <div className="bg-[#2a2a2f]/50 p-4 border-b border-[#2a2a2f] flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            {selectedAccountId === 'ALL'
                                ? 'Jurnal Umum'
                                : (currentAccount ? currentAccount.name : 'Pilih Akun')}
                        </h3>
                        <span className="text-xs text-gray-500">
                            {selectedAccountId === 'ALL'
                                ? `${journals.length} Transaksi`
                                : `${ledgerData.length} Mutasi`}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="bg-[#25252b] text-xs uppercase font-semibold text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Tanggal</th>
                                    <th className="px-6 py-4">No. Ref</th>
                                    <th className="px-6 py-4">Keterangan</th>
                                    {selectedAccountId === 'ALL' ? (
                                        <th className="px-6 py-4">Akun</th>
                                    ) : null}
                                    <th className="px-6 py-4 text-right">Debit</th>
                                    <th className="px-6 py-4 text-right">Kredit</th>
                                    {selectedAccountId !== 'ALL' && (
                                        <th className="px-6 py-4 text-right">Saldo</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2f]">
                                {loading ? (
                                    <tr>
                                        <td colSpan={selectedAccountId === 'ALL' ? 6 : 6} className="text-center py-12 text-gray-500">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00bcd4] mx-auto mb-3"></div>
                                            Sedang memuat data...
                                        </td>
                                    </tr>
                                ) : journals.length === 0 ? (
                                    <tr>
                                        <td colSpan={selectedAccountId === 'ALL' ? 6 : 6} className="text-center py-12 text-gray-500">
                                            Tidak ada transaksi untuk periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    // Conditional Rendering Body
                                    selectedAccountId === 'ALL' ? (
                                        // View: ALL ACCOUNTS (JURNAL UMUM)
                                        journals.map((journal) => (
                                            <React.Fragment key={journal.id}>
                                                {/* Transaction Header Row (Date/Ref included) or First Entry Row */}
                                                {journal.entries.map((entry, idx) => {
                                                    const isFirst = idx === 0;
                                                    const accName = getAccountName(entry.account?.id || entry.account);
                                                    return (
                                                        <tr key={`${journal.id}-${idx}`} className={`hover:bg-[#2a2a2f]/30 transition-colors ${isFirst ? 'border-t border-[#3a3a3f]' : ''}`}>
                                                            <td className="px-6 py-3 whitespace-nowrap align-top text-gray-400">
                                                                {isFirst ? new Date(journal.date).toLocaleDateString('id-ID') : ''}
                                                            </td>
                                                            <td className="px-6 py-3 font-mono text-xs text-blue-400 align-top">
                                                                {isFirst ? journal.id?.substring(0, 6).toUpperCase() : ''}
                                                            </td>
                                                            <td className="px-6 py-3 align-top text-gray-300">
                                                                {isFirst ? journal.description : ''}
                                                            </td>
                                                            <td className="px-6 py-3 font-medium text-white">
                                                                <div className={`${Number(entry.credit) > 0 ? 'pl-8' : ''}`}>
                                                                    {accName}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-right font-mono text-gray-300">
                                                                {Number(entry.debit) > 0 ? formatMoney(Number(entry.debit)) : '-'}
                                                            </td>
                                                            <td className="px-6 py-3 text-right font-mono text-gray-300">
                                                                {Number(entry.credit) > 0 ? formatMoney(Number(entry.credit)) : '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        // View: SPECIFIC ACCOUNT (BUKU BESAR)
                                        ledgerData.map((row) => (
                                            <tr key={row.id + row.date} className="hover:bg-[#2a2a2f]/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(row.date).toLocaleDateString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-blue-400">
                                                    {row.ref}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {row.description}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-gray-300">
                                                    {row.debit > 0 ? formatMoney(row.debit) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-gray-300">
                                                    {row.credit > 0 ? formatMoney(row.credit) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-white font-mono">
                                                    {row.balance < 0 ? `(${formatMoney(row.balance)})` : formatMoney(row.balance)}
                                                </td>
                                            </tr>
                                        ))
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
