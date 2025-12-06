'use client';

import React, { useState, useEffect } from 'react';
import { TrendingDown, TrendingUp, Calendar, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { AccountBalances, AccountData } from '@/types/index'
import Navbar from '@/components/layout/navbar'; // Navbar layout global
import Footer from '@/components/layout/footer'; // Footer layout global

export const accountTypes = [
  { value: 'asset', label: 'Aset', icon: '🏦' },
  { value: 'expense', label: 'Beban', icon: '📉' },
  { value: 'liability', label: 'Liabilitas', icon: '📘' },
  { value: 'revenue', label: 'Penghasilan', icon: '💰' },
  { value: 'equity', label: 'Ekuitas', icon: '📈' },
];
const ExpenseAccountsDisplay = () => {
	const { kategori } = useParams() as { kategori: string };

  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [loading, setLoading] = useState(true);
	const [error, setError] = useState(String);

  const [scrolled, setScrolled] = useState<boolean>(false); // Menandai apakah halaman sudah discroll (ubah style navbar)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false); // Menandai apakah menu mobile sedang terbuka

  useEffect(() => {
    // kalau kategori belum ada (misal masih hydration), jangan fetch dulu
    if (!kategori) return;

    const loadAccounts = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/accounts/${kategori}`);

        if (!res.ok) {
          throw new Error(`Gagal fetch: ${res.status}`);
        }

        const data = await res.json();

        // pastikan array
        setAccounts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError('Gagal memuat data akun');
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [kategori]);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);


  const convertSlug = (slug:string) => {
    return slug.split("_").map((s)=>s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
  };

  // Group accounts by their group field
  const groupedAccounts : Record<string, AccountData[]> = accounts.reduce((acc:any, account) => {
    const group = account.group || 'Lainnya';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(account);
    return acc;
  }, {});

  // Calculate totals per group
  const calculateGroupTotal = (groupAccounts:any, period:any) => {
    return groupAccounts.reduce(
      (sum:any, acc:any) => sum + (acc?.balances?.[period] || 0),
      0
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] p-4 md:p-8">
			<Navbar
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className="max-w-7xl mt-16 mx-auto">
				<div className="bg-[#1a1a1f] rounded-xl shadow-2xl p-6 mb-8 border border-[#2a2a2f]">
					<div className="flex flex-col">
						{/* Report Type Selection */}
						<div>
							<label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
								<FileText size={16} />
								Pilihan Akun
							</label>
							<div className="flex flex-row gap-3">
								{accountTypes.map((type) => (
									<a
										key={type.value}
										href={`/akun/${type.value}`}
										className={`p-3 rounded-lg text-left flex-1 transition-all duration-300 flex items-center gap-3 ${
											kategori === type.value
												? 'bg-gradient-to-r from-[#ef4444] to-[#f87171]'
												: 'bg-[#2a2a2f] text-gray-300 hover:bg-[#3a3a3f] border border-[#3a3a3f]'
										}`}
									>
										<span className="text-xl">{type.icon}</span>
										<span className="text-sm font-medium">{type.label}</span>
									</a>
								))}
							</div>
						</div>
					</div>
				</div>
        {/* Header */}
        <div className="bg-[#1a1a1f] rounded-xl shadow-2xl border border-[#2a2a2f] overflow-hidden">
          <div className="bg-gradient-to-r from-[#ef4444] to-[#f87171] text-white p-6">
            <h2 className="text-2xl font-bold mb-1">{kategori && kategori.charAt(0).toUpperCase() + kategori.slice(1)} Accounts</h2>
            <p className="text-red-100 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Periode: 30 Sep 2025 & 31 Des 2024 • Mata uang: IDR (dalam ribuan)
            </p>
            {kategori && (
              <p className="text-red-100 text-xs mt-1">
                Kategori: <span className="font-semibold">{kategori}</span>
              </p>
            )}
          </div>

          <div className="p-6 space-y-8">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-900/40 border border-red-700 text-sm text-red-200">
                {error}
              </div>
            )}

						{loading && (
							<div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
								<div className="text-center">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f87171] mx-auto mb-4"></div>
									<p className="text-[#9ca3af]">Loading data...</p>
								</div>
							</div>
						)}

            {accounts.length === 0 && !error && (
              <p className="text-[#9ca3af] text-sm">
                Tidak ada data akun untuk kategori ini.
              </p>
            )}

            {Object.entries(groupedAccounts).map(
              ([groupKey, groupAccounts], sectionIdx) => {
                const total2025 = calculateGroupTotal(
                  groupAccounts,
                  '2025-09-30'
                );
                const total2024 = calculateGroupTotal(
                  groupAccounts,
                  '2024-12-31'
                );
                return (
                  <div
                    key={groupKey}
                    className="border-b border-[#2a2a2f] last:border-b-0 pb-6 last:pb-0"
                  >
                    <h3 className="font-bold text-lg mb-4 text-[#f87171] flex items-center gap-2 bg-[#2a2a2f]/50 p-3 rounded-lg">
                      <span className="bg-[#f87171] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {sectionIdx + 1}
                      </span>
                      {convertSlug(groupKey)}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#2a2a2f]">
                            <th className="py-3 px-4 text-left text-[#9ca3af] font-semibold text-sm">
                              Nama Akun
                            </th>
                            <th className="py-3 px-4 text-right text-[#9ca3af] font-semibold text-sm whitespace-nowrap">
                              30 Sep 2025
                            </th>
                            <th className="py-3 px-4 text-right text-[#9ca3af] font-semibold text-sm whitespace-nowrap">
                              31 Des 2024
                            </th>
                          </tr>
                        </thead>
                        <tbody>
													{/* Akun biasa (non-total) */}
                          {groupAccounts.filter((account) => !account.is_total).map((account:any, idx:number) => {
                            const balance2025 =
                              account?.balances?.['2025-09-30'] || 0;
                            const balance2024 =
                              account?.balances?.['2024-12-31'] || 0;

                            return (
                              <tr
                                key={account.id || `${groupKey}-${idx}`}
                                className={`
                                  hover:bg-[#2a2a2f]/30 transition-all duration-200
                                  ${
                                    idx !== groupAccounts.length - 1
                                      ? 'border-b border-[#2a2a2f]/30'
                                      : ''
                                  }
                                `}
                              >
                                <td className="py-3 px-4 text-[#d1d5db]">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#6b7280] text-xs">
                                      •
                                    </span>
                                    {account.name}
                                  </div>
                                </td>
                                <td
                                  className={`py-3 px-4 text-right font-mono whitespace-nowrap ${
                                    balance2025 < 0
                                      ? 'text-[#ef4444]'
                                      : 'text-[#d1d5db]'
                                  }`}
                                >
                                  <div className="flex items-center justify-end gap-2">
                                    {balance2025 > 0 && (
                                      <TrendingUp
                                        size={14}
                                        className="text-[#10b981]"
                                      />
                                    )}
                                    {balance2025 < 0 && (
                                      <TrendingDown
                                        size={14}
                                        className="text-[#ef4444]"
                                      />
                                    )}
                                    {formatMoney(balance2025)}
                                  </div>
                                </td>
                                <td
                                  className={`py-3 px-4 text-right font-mono whitespace-nowrap ${
                                    balance2024 < 0
                                      ? 'text-[#ef4444]'
                                      : 'text-[#d1d5db]'
                                  }`}
                                >
                                  <div className="flex items-center justify-end gap-2">
                                    {balance2024 > 0 && (
                                      <TrendingUp
                                        size={14}
                                        className="text-[#10b981]"
                                      />
                                    )}
                                    {balance2024 < 0 && (
                                      <TrendingDown
                                        size={14}
                                        className="text-[#ef4444]"
                                      />
                                    )}
                                    {formatMoney(balance2024)}
                                  </div>
                                </td>
                              </tr>
                            );
														
                          })}

													{/* Jika ada akun total */}
													{groupAccounts.filter((account) => account.is_total).map((account:any,idx:number) => {
														const balance2025 =
                              account?.balances?.['2025-09-30'] || 0;
                            const balance2024 =
                              account?.balances?.['2024-12-31'] || 0;
														return(
															<tr key={account.id || `${groupKey}-${idx}`} className="bg-[#2a2a2f]/50 border-t-2 border-[#f87171]/30">
																<td className="py-3 px-4 font-bold text-white">
																	{account.name}
																</td>
																<td
																	className={`py-3 px-4 text-right font-mono font-bold text-lg whitespace-nowrap ${
																		balance2025 < 0
																			? 'text-[#ef4444]'
																			: 'text-[#d1d5db]'
																	}`}
																>
																	{formatMoney(balance2025)}
																</td>
																<td
																	className={`py-3 px-4 text-right font-mono font-bold text-lg whitespace-nowrap ${
																		balance2024 < 0
																			? 'text-[#ef4444]'
																			: 'text-[#d1d5db]'
																	}`}
																>
																	{formatMoney(balance2024)}
																</td>
															</tr>
														);
													})}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseAccountsDisplay;
