'use client';

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { Wallet, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';
import { AccountData } from '@/types/index';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// --- TIPE DATA ---
type Period = {
    id: string;
    code: string;
    label: string;
    endDate: string;
};

type ConfigItem = {
    title: string;
    icon: React.ReactNode;
    color: string;
};

type SummaryItem = {
    title: string;
    icon: React.ReactNode;
    color: string;
    value: number;
};

type ChartData = {
    name: string;
    value: number;
    fill?: string;
};

const FinancialCharts = () => {
    // --- STATE ---
    const [isShortFormat, setIsShortFormat] = useState(true); // Default ringkas (Triliun)
    const [loading, setLoading] = useState(true);

    // State Period
    const [periods, setPeriods] = useState<Period[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

    // State Data
    const [summaryData, setSummaryData] = useState<SummaryItem[]>([]);
    const [revenueExpenseData, setRevenueExpenseData] = useState<ChartData[]>([]);
    const [expenseCompositionData, setExpenseCompositionData] = useState<ChartData[]>([]);

    // --- WARNA CHART ---


    // --- FETCH PERIODS ---
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const q = query(collection(db, "periods"), orderBy("endDate", "desc"));
                const snapshot = await getDocs(q);
                const periodList = snapshot.docs.map(doc => doc.data() as Period);

                if (periodList.length > 0) {
                    setPeriods(periodList);
                    // Default to the first (latest) period if none selected
                    if (!selectedPeriod) {
                        setSelectedPeriod(periodList[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching periods:", error);
            }
        };
        fetchPeriods();
    }, []);

    // --- HELPER FORMATTING ---
    const formatCurrency = (value: number) => {
        if (value === 0) return "Rp 0";

        if (isShortFormat) {
            // Logic Pembulatan (T/M/Jt)
            if (Math.abs(value) >= 1_000_000_000_000) {
                return `Rp ${(value / 1_000_000_000_000).toFixed(2).replace('.', ',')} T`;
            }
            if (Math.abs(value) >= 1_000_000_000) {
                return `Rp ${(value / 1_000_000_000).toFixed(1).replace('.', ',')} M`;
            }
            if (Math.abs(value) >= 1_000_000) {
                return `Rp ${(value / 1_000_000).toFixed(0).replace('.', ',')} Jt`;
            }
        }

        // Format Penuh (Rp 52.xxx.xxx)
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // --- MAIN LOGIC: FETCH DATA PARALEL ---
    useEffect(() => {
        if (!selectedPeriod) return;

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const colRef = collection(db, "accounts");
                const currentPeriodKey = selectedPeriod.endDate;

                // QUERY 1: Ambil Data Summary (Total Aset, Ekuitas, dll)
                // Kita ambil berdasarkan flag 'is_total' == true
                const qSummary = query(colRef, where("is_total", "==", true));

                // QUERY 2: Ambil Semua Akun Detail (Bukan Total)
                const qCharts = query(colRef, where("is_total", "==", false));

                // Jalankan kedua query secara paralel (Promise.all) agar cepat
                const [snapSummary, snapCharts] = await Promise.all([
                    getDocs(qSummary),
                    getDocs(qCharts)
                ]);

                // --- PROSES DATA 1: SUMMARY CARDS ---
                const rawSummaryDocs = snapSummary.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<AccountData, 'id'>)
                }));

                const targetSummaryIds = ["total_aset", "total_ekuitas", "total_liabilitas", "laba_periode_berjalan"];

                const formattedSummary = targetSummaryIds.map(targetId => {
                    const item = rawSummaryDocs.find(res => res.id === targetId);
                    if (!item) return null;

                    const config: Record<string, ConfigItem> = {
                        total_aset: { title: "Total Aset", icon: <Wallet size={20} />, color: "text-blue-400" },
                        total_liabilitas: { title: "Total Liabilitas", icon: <Activity size={20} />, color: "text-orange-400" },
                        total_ekuitas: { title: "Total Ekuitas", icon: <DollarSign size={20} />, color: "text-green-400" },
                        laba_periode_berjalan: { title: "Laba Bersih", icon: <TrendingUp size={20} />, color: "text-cyan-400" },
                    };

                    const { title, icon, color } = config[targetId] || { title: item.name, icon: <DollarSign />, color: "text-gray-400" };
                    // Gunakan selectedPeriod untuk akses balances
                    const val = (item.balances?.[currentPeriodKey] || 0) * 1000;

                    return { title, icon, color, value: val };
                }).filter((item): item is SummaryItem => item !== null);

                setSummaryData(formattedSummary);

                // --- PROSES DATA 2: CHARTS ---
                let totalRevenue = 0;
                let totalExpense = 0;
                const expenseAccounts: ChartData[] = [];

                // Palette warna untuk Pie Chart
                const chartPalette = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

                snapCharts.docs.forEach((doc) => {
                    const d = doc.data() as AccountData;
                    const cat = d.category?.toLowerCase() || '';
                    const val = Math.abs((d.balances?.[currentPeriodKey] || 0) * 1000);

                    // Skip jika nilai 0 atau negatif
                    if (val <= 0) return;

                    // Cek Kategori Revenue
                    if (['revenue', 'pendapatan'].some(c => cat.includes(c))) {
                        totalRevenue += val;
                    }
                    // Cek Kategori Expense
                    else if (['expense', 'beban'].some(c => cat.includes(c))) {
                        totalExpense += val;
                        // Masukkan ke Pie Chart Data
                        expenseAccounts.push({
                            name: d.name,
                            value: val,
                            // Warna belum di-set di sini, nanti di-map ulang atau di-assign saat push
                        });
                    }
                });

                // Assign warna ke expense items
                expenseAccounts.sort((a, b) => b.value - a.value); // Sort desc
                const finalExpenseData = expenseAccounts.map((item, index) => ({
                    ...item,
                    fill: chartPalette[index % chartPalette.length]
                }));

                setRevenueExpenseData([
                    { name: 'Pendapatan', value: totalRevenue, fill: '#4ade80' }, // Hijau
                    { name: 'Total Beban', value: totalExpense, fill: '#f87171' } // Merah
                ]);

                setExpenseCompositionData(finalExpenseData);

            } catch (error) {
                console.error("Error fetching financial data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [selectedPeriod]);

    return (
        <div className="w-full space-y-8">
            {/* --- HEADER & CONTROLS --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Dashboard Keuangan</h2>
                    <p className="text-gray-400 text-sm">
                        Laporan Konsolidasian Periode {selectedPeriod ? selectedPeriod.label : "Memuat..."}
                    </p>
                </div>

                {/* --- PERIOD SELECTOR --- */}
                {periods.length > 0 && (
                    <div className="bg-[#1a1a1f] px-4 py-2 rounded-lg border border-[#2a2a2f] flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <select
                            className="bg-transparent text-white text-sm outline-none cursor-pointer"
                            value={selectedPeriod?.id || ""}
                            onChange={(e) => {
                                const p = periods.find(p => p.id === e.target.value);
                                if (p) setSelectedPeriod(p);
                            }}
                        >
                            {periods.map((p) => (
                                <option key={p.id} value={p.id} className="bg-[#1a1a1f] text-white">
                                    {p.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="w-full h-64 flex items-center justify-center text-gray-500 animate-pulse">
                    Memuat data finansial...
                </div>
            ) : (
                <>
                    {/* --- SECTION 1: SUMMARY CARDS --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {summaryData.map((item, index) => (
                            <div
                                key={index}
                                className="bg-[#1a1a1f] p-6 rounded-xl border border-[#2a2a2f] hover:border-[#00bcd4] transition-all duration-300 group relative"
                            >
                                <div className={`p-3 rounded-lg bg-opacity-10 w-fit mb-4 ${item.color.replace('text-', 'bg-')}`}>
                                    <div className={item.color}>{item.icon}</div>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">{item.title}</p>
                                <h3
                                    className={`text-xl font-bold cursor-pointer select-none ${item.color.includes('cyan') ? 'text-cyan-400' : 'text-white'}`}
                                    onClick={() => setIsShortFormat(!isShortFormat)}
                                    title="Klik untuk ubah format"
                                >
                                    {formatCurrency(item.value)}
                                </h3>
                            </div>
                        ))}
                    </div>

                    {/* --- SECTION 2: CHARTS --- */}
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="bg-[#1a1a1f] p-8 rounded-xl border border-[#2a2a2f]">
                            <h3 className="text-xl font-bold text-white mb-6">Pendapatan vs Total Beban</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => isShortFormat ? `${(val / 1e12).toFixed(0)}T` : `${(val / 1e12).toFixed(1)}T`} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#1a1a1f', borderColor: '#333', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => [formatCurrency(value), "Nilai"]}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                                            {revenueExpenseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Grafik 2: Pie Chart Composition */}
                        <div className="bg-[#1a1a1f] p-8 rounded-xl border border-[#2a2a2f]">
                            <h3 className="text-xl font-bold text-white mb-6">Struktur Beban & Biaya</h3>
                            <div className="h-[300px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expenseCompositionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseCompositionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1a1a1f', borderColor: '#333', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value: number) => [formatCurrency(value), "Nilai"]}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span className="text-gray-400 text-xs ml-2">{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FinancialCharts;