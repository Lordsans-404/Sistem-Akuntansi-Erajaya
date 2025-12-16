'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/layout/navbar';
import { AccountData, JournalAccountRef } from '@/types/index';

const PERIOD_CODE = "2025-09-30"; // Default or dynamic? User prompt implied 2025-09-30

const accountTypes = [
    { value: 'asset', label: 'Aset' },
    { value: 'expense', label: 'Beban' },
    { value: 'liability', label: 'Liabilitas' },
    { value: 'revenue', label: 'Penghasilan' },
    { value: 'equity', label: 'Ekuitas' },
];

interface JournalRow {
    account_id: string;
    debit: number;
    credit: number;
}

export default function JournalPage() {
    const [accounts, setAccounts] = useState<AccountData[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);

    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState<string>('');
    const [rows, setRows] = useState<JournalRow[]>([
        { account_id: '', debit: 0, credit: 0 },
        { account_id: '', debit: 0, credit: 0 },
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState('');
    const [pendingPayload, setPendingPayload] = useState<any>(null);


    // Fetch all accounts
    useEffect(() => {
        const fetchAllAccounts = async () => {
            setLoadingAccounts(true);
            try {
                const promises = accountTypes.map(type =>
                    fetch(`/api/accounts/${type.value}`).then(res => res.ok ? res.json() : [])
                );
                const results = await Promise.all(promises);
                const flatAccounts = results.flat();
                // Sort by name or code if available
                flatAccounts.sort((a: AccountData, b: AccountData) => a.name.localeCompare(b.name));
                setAccounts(flatAccounts);
            } catch (err) {
                console.error("Failed to fetch accounts", err);
                setMessage({ type: 'error', text: "Gagal memuat data akun." });
            } finally {
                setLoadingAccounts(false);
            }
        };

        fetchAllAccounts();
    }, []);

    // Manual Auto-balance logic
    const handleAutoBalance = () => {
        let currentDebit = 0;
        let currentCredit = 0;
        let emptyRowIndex = -1;

        // Calculate totals and find candidate row
        rows.forEach((r, index) => {
            currentDebit += r.debit;
            currentCredit += r.credit;

            // Find first row that has 0 values (candidate for balancing)
            if (r.debit === 0 && r.credit === 0 && emptyRowIndex === -1) {
                emptyRowIndex = index;
            }
        });

        const imbalance = currentDebit - currentCredit;

        if (imbalance === 0) {
            setMessage({ type: 'success', text: "Jurnal sudah seimbang." });
            return;
        }

        if (emptyRowIndex === -1) {
            setMessage({ type: 'error', text: "Tidak ada baris kosong untuk menyeimbangkan. Tambahkan baris baru atau kosongkan salah satu." });
            return;
        }

        const newRows = [...rows];

        // If Imbalance > 0 (Debit > Credit), we need Credit.
        if (imbalance > 0) {
            newRows[emptyRowIndex].credit = imbalance;
            newRows[emptyRowIndex].debit = 0;
        } else {
            newRows[emptyRowIndex].debit = Math.abs(imbalance);
            newRows[emptyRowIndex].credit = 0;
        }

        setRows(newRows);
        setMessage({ type: 'success', text: "Berhasil menyeimbangkan jurnal." });
    };

    const handleRowChange = (index: number, field: keyof JournalRow, value: any) => {
        const newRows = [...rows];

        if (field === 'debit') {
            const val = Number(value);
            newRows[index].debit = val;
            newRows[index].credit = 0;
        } else if (field === 'credit') {
            const val = Number(value);
            newRows[index].credit = val;
            newRows[index].debit = 0;
        } else {
            newRows[index][field] = value;
        }

        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { account_id: '', debit: 0, credit: 0 }]);
    };

    const removeRow = (index: number) => {
        if (rows.length <= 2) return; // Minimum 2 rows
        setRows(rows.filter((_, i) => i !== index));
    };

    const totalDebit = rows.reduce((sum, row) => sum + row.debit, 0);
    const totalCredit = rows.reduce((sum, row) => sum + row.credit, 0);
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;
    const isValid = isBalanced && description && rows.every(r => r.account_id);

    // Filter account atribut
    const pickAccountForJournal = (account: any): JournalAccountRef => {
        const {
            id,
            name,
            category,
            group,
            statement,
        } = account

        return {
            id,
            name,
            category,
            group,
            statement,
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        // siapkan payload, tapi JANGAN kirim dulu
        const findAccount = (id: string) =>
            accounts.find(a => a.id === id) || { id: "unknown", name: "Unknown" };

        const payload = {
            date,
            description,
            period: date.substring(0, 7) + "-01",
            entries: rows.map(r => ({
                account: pickAccountForJournal(findAccount(r.account_id)),
                debit: r.debit,
                credit: r.credit
            }))
        };

        setPendingPayload(payload);
        setShowPinModal(true);
    };

    const submitWithPin = async () => {
        if (!pin || pin.length < 4) {
            setMessage({ type: 'error', text: 'PIN tidak valid' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...pendingPayload,
                    pass: pin
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal menyimpan jurnal');
            }

            setMessage({ type: 'success', text: 'Jurnal berhasil disimpan!' });

            // reset state sensitif
            setPin('');
            setPendingPayload(null);
            setShowPinModal(false);

            setRows([
                { account_id: '', debit: 0, credit: 0 },
                { account_id: '', debit: 0, credit: 0 }
            ]);
            setDescription('');

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSubmitting(false);
            setPin('');
        }
    };



    return (
        <div className="min-h-screen bg-[#0f0f12] p-4 md:p-8">
            <Navbar scrolled={false} mobileMenuOpen={false} setMobileMenuOpen={() => { }} />

            <div className="max-w-5xl mt-20 mx-auto">
                <div className="bg-[#1a1a1f] rounded-xl shadow-2xl border border-[#2a2a2f] overflow-hidden">

                    <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <FileText /> Input Jurnal Umum
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">
                            Catat transaksi keuangan manual
                        </p>
                    </div>

                    <div className="p-6">
                        {message && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Tanggal</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-[#0f0f12] border border-[#2a2a2f] rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Keterangan</label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Contoh: Pembayaran Gaji Karyawan"
                                        className="w-full bg-[#0f0f12] border border-[#2a2a2f] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Journal Entries */}
                            <div className="bg-[#0f0f12] rounded-lg border border-[#2a2a2f] overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#2a2a2f] text-left">
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[40%]">Akun</th>
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[25%] text-right">Debit</th>
                                            <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[25%] text-right">Kredit</th>
                                            <th className="py-3 px-4 w-[10%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2a2a2f]">
                                        {rows.map((row, index) => (
                                            <tr key={index} className="group hover:bg-[#1a1a1f] transition-colors">
                                                <td className="p-2">
                                                    <select
                                                        value={row.account_id}
                                                        onChange={(e) => handleRowChange(index, 'account_id', e.target.value)}
                                                        className="w-full bg-transparent text-white border-b border-transparent focus:border-blue-500 focus:outline-none py-1"
                                                        disabled={loadingAccounts}
                                                    >
                                                        <option value="" disabled>Pilih Akun</option>
                                                        {accounts.map(acc => (
                                                            <option key={acc.id} value={acc.id} className="text-black bg-white">
                                                                {acc.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.debit || ''}
                                                        onChange={(e) => handleRowChange(index, 'debit', e.target.value)}
                                                        placeholder="0"
                                                        className="w-full bg-transparent text-right text-white border-b border-transparent focus:border-blue-500 focus:outline-none py-1"
                                                        disabled={row.credit > 0}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.credit || ''}
                                                        onChange={(e) => handleRowChange(index, 'credit', e.target.value)}
                                                        placeholder="0"
                                                        className="w-full bg-transparent text-right text-white border-b border-transparent focus:border-blue-500 focus:outline-none py-1"
                                                        disabled={row.debit > 0}
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRow(index)}
                                                        className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                        disabled={rows.length <= 2}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-[#2a2a2f]/50 font-bold">
                                        <tr>
                                            <td className="py-3 px-4 text-right text-gray-400">Total</td>
                                            <td className={`py-3 px-4 text-right ${totalDebit !== totalCredit ? 'text-red-500' : 'text-green-500'}`}>
                                                {new Intl.NumberFormat('id-ID').format(totalDebit)}
                                            </td>
                                            <td className={`py-3 px-4 text-right ${totalDebit !== totalCredit ? 'text-red-500' : 'text-green-500'}`}>
                                                {new Intl.NumberFormat('id-ID').format(totalCredit)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    type="button"
                                    onClick={addRow}
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
                                >
                                    <Plus size={16} /> Tamah Baris
                                </button>

                                <div className="flex items-center gap-4">
                                    {totalDebit !== totalCredit && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-red-400 text-sm">Selisih: {new Intl.NumberFormat('id-ID').format(Math.abs(totalDebit - totalCredit))}</span>
                                            <button
                                                type="button"
                                                onClick={handleAutoBalance}
                                                className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30 transition-colors"
                                            >
                                                Hitung Otomatis
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={submitting || !isValid}
                                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium shadow-lg transition-all flex items-center gap-2"
                                    >
                                        {submitting ? 'Menyimpan...' : (
                                            <>
                                                <Save size={18} /> Simpan Jurnal
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
            {showPinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-[#1a1a1f] w-full max-w-sm rounded-xl border border-[#2a2a2f] p-6 shadow-2xl">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Konfirmasi PIN
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Masukkan PIN untuk menyimpan jurnal
                        </p>

                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-[#0f0f12] border border-[#2a2a2f] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowPinModal(false);
                                    setPin('');
                                }}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={submitWithPin}
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
                            >
                                {submitting ? 'Memproses...' : 'Konfirmasi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}
