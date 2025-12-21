'use server';

import { db } from "@/lib/firebaseAdmin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { JournalAccountRef, AccountData } from "@/types";

interface CloseBooksResult {
    success: boolean;
    processedAccounts: number;
    message: string;
    details?: any[];
}

export async function closeBooks(periodCode: string, previousPeriodCode?: string): Promise<CloseBooksResult> {
    try {
        console.log(`Starting Close Books for input: ${periodCode}`);

        // 1. Calculate Period Dates
        const [year, month] = periodCode.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDateObj = new Date(year, month, 0);
        const endDate = endDateObj.toISOString().split('T')[0];

        const prevEndDateObj = new Date(year, month - 1, 0);
        const prevEndDate = prevEndDateObj.toISOString().split('T')[0];

        const startTs = Timestamp.fromDate(startDate);
        const endTs = Timestamp.fromDate(new Date(endDate + 'T23:59:59.999Z'));

        // 2. Manage 'periods' Collection (ID: YYYY-MM-DD)
        const periodRef = db.collection("periods").doc(endDate);
        const periodSnap = await periodRef.get();
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const periodLabel = `${monthNames[month - 1]} ${year}`;

        const periodData = {
            id: endDate,
            code: endDate,
            label: periodLabel,
            endDate: endDate,
            year: year,
            month: month,
            type: 'monthly',
            updated_at: FieldValue.serverTimestamp()
        };

        if (!periodSnap.exists) {
            await periodRef.set({ ...periodData, created_at: FieldValue.serverTimestamp() });
        } else {
            await periodRef.update(periodData);
        }

        // 3. Fetch Journals
        const journalsSnapshot = await db.collection("journals")
            .where("date", ">=", startTs)
            .where("date", "<=", endTs)
            .get();

        // 4. Mapping Detail Accounts
        const detailAccountsSnap = await db.collection("journal_accounts").get();
        const detailAccountMap = new Map<string, string>();
        detailAccountsSnap.forEach(doc => {
            const data = doc.data() as JournalAccountRef;
            if (data.report_account_id) {
                detailAccountMap.set(doc.id, data.report_account_id);
            }
        });

        // 5. Fetch Report Accounts
        const accountsSnap = await db.collection("accounts").get();
        const allAccounts: (AccountData & { docId: string, ref: any })[] = [];
        accountsSnap.forEach(doc => {
            allAccounts.push({ ...(doc.data() as AccountData), docId: doc.id, ref: doc.ref });
        });

        // 6. Aggregate Mutations
        const mutations = new Map<string, { debit: number, credit: number }>();
        journalsSnapshot.forEach(doc => {
            const journal = doc.data();
            const entries = journal.entries || [];
            entries.forEach((entry: any) => {
                const entryAccountId = typeof entry.account === 'string' ? entry.account : entry.account.id;
                const reportAccountId = detailAccountMap.get(entryAccountId);
                if (reportAccountId) {
                    if (!mutations.has(reportAccountId)) mutations.set(reportAccountId, { debit: 0, credit: 0 });
                    const current = mutations.get(reportAccountId)!;
                    current.debit += Number(entry.debit) || 0;
                    current.credit += Number(entry.credit) || 0;
                }
            });
        });

        // 7. Calculate Balances
        const accountUpdates: any[] = [];
        const updates: any[] = [];
        let updatedCount = 0;

        // --- INI DIA YANG KITA BUTUHKAN (Tempat Nyimpen Saldo Sementara) ---
        const finalBalancesMap = new Map<string, number>();
        const groupSums = new Map<string, number>();
        const categorySums = new Map<string, number>();
        let profitLossForPeriod = 0;

        // === PHASE 1: Detail Accounts ===
        for (const account of allAccounts) {
            if (account.is_total) continue;

            const mutation = mutations.get(account.docId) || { debit: 0, credit: 0 };
            const netDebit = mutation.debit;
            const netCredit = mutation.credit;

            let prevBalance = 0;
            if (account.balances) {
                if (account.balances[prevEndDate] !== undefined) {
                    prevBalance = Number(account.balances[prevEndDate]);
                } else if (previousPeriodCode && account.balances[previousPeriodCode] !== undefined) {
                    prevBalance = Number(account.balances[previousPeriodCode]);
                } else {
                    const sortedDates = Object.keys(account.balances)
                        .filter(d => d < startDate.toISOString().split('T')[0])
                        .sort().reverse();
                    if (sortedDates.length > 0) prevBalance = Number(account.balances[sortedDates[0]]);
                }
            }

            const category = account.category?.toLowerCase() || '';
            const isBalanceSheet = ['asset', 'liability', 'equity', 'harta', 'kewajiban', 'modal'].some(c => category.includes(c));
            const isDebitNormal = ['asset', 'expense', 'beban', 'harta'].some(c => category.includes(c));

            let netMutationValue = isDebitNormal ? (netDebit - netCredit) : (netCredit - netDebit);
            let newBalance = isBalanceSheet ? (prevBalance + netMutationValue) : netMutationValue;

            // --- ISI MAP DISINI ---
            finalBalancesMap.set(account.docId, newBalance);

            // Grouping Logic
            if (account.group) {
                const current = groupSums.get(account.group) || 0;
                groupSums.set(account.group, current + newBalance);
            }
            if (account.category) {
                const current = categorySums.get(account.category) || 0;
                categorySums.set(account.category, current + newBalance);
            }
            if (['revenue', 'pendapatan'].some(c => category.includes(c))) profitLossForPeriod += newBalance;
            if (['expense', 'beban'].some(c => category.includes(c))) profitLossForPeriod -= newBalance;

            accountUpdates.push({
                ref: account.ref,
                data: { [`balances.${endDate}`]: newBalance }
            });
            updatedCount++;
        }

        // === PHASE 2: Total Accounts & Arus Kas Fix ===
        for (const account of allAccounts) {
            if (!account.is_total) continue;

            let totalValue = 0;

            // --- ARUS KAS FIX ---
            // Mengambil dari finalBalancesMap yang sudah diisi di Phase 1
            if (account.id === 'kas_dan_setara_kas_akhir_periode_cf' || account.id === 'kas_dan_setara_kas_akhir_periode_cf_komponen') {
                totalValue = finalBalancesMap.get('kas_dan_setara_kas') || groupSums.get('kas_dan_setara_kas') || 0;
            }
            else if (account.id === 'kas_dan_setara_kas_awal_periode_cf') {
                // Cari saldo awal manual dari akun aslinya
                const realCashAccount = allAccounts.find(a => a.id === 'kas_dan_setara_kas');
                if (realCashAccount && realCashAccount.balances) {
                    if (realCashAccount.balances[prevEndDate] !== undefined) {
                        totalValue = Number(realCashAccount.balances[prevEndDate]);
                    } else {
                        const sortedDates = Object.keys(realCashAccount.balances)
                            .filter(d => d < startDate.toISOString().split('T')[0]).sort().reverse();
                        if (sortedDates.length > 0) totalValue = Number(realCashAccount.balances[sortedDates[0]]);
                    }
                }
            }
            else if (account.id === 'kenaikan_penurunan_neto_kas_dan_setara_kas') {
                const saldoAkhir = finalBalancesMap.get('kas_dan_setara_kas') || groupSums.get('kas_dan_setara_kas') || 0;
                let saldoAwal = 0;
                const realCashAccount = allAccounts.find(a => a.id === 'kas_dan_setara_kas');
                if (realCashAccount && realCashAccount.balances) {
                    // Reuse logic saldo awal
                    if (realCashAccount.balances[prevEndDate] !== undefined) saldoAwal = Number(realCashAccount.balances[prevEndDate]);
                    else {
                        const sortedDates = Object.keys(realCashAccount.balances).filter(d => d < startDate.toISOString().split('T')[0]).sort().reverse();
                        if (sortedDates.length > 0) saldoAwal = Number(realCashAccount.balances[sortedDates[0]]);
                    }
                }
                totalValue = saldoAkhir - saldoAwal;
            }

            // --- TOTALING STANDARD ---
            else if (account.id === 'total_aset') totalValue = categorySums.get('asset') || 0;
            else if (account.id === 'total_liabilitas') totalValue = categorySums.get('liability') || 0;
            else if (account.id === 'total_ekuitas') totalValue = (categorySums.get('equity') || 0) + profitLossForPeriod;
            else if (account.id === 'laba_periode_berjalan' || account.id === 'laba_bersih') totalValue = profitLossForPeriod;
            else if (account.group && groupSums.has(account.group)) {
                totalValue = groupSums.get(account.group) || 0;
            }

            // --- INCOME STATEMENT TOTALS ---
            else if (account.id === 'laba_bruto') {
                const revenue = groupSums.get('pendapatan') || 0;
                const cogs = groupSums.get('beban_pokok_pendapatan') || 0;
                // Asumsi: pendapatan kredit (+), beban debit (+) -> Laba = Pendapatan - Beban
                // Tapi di mapping Phase 1, profitLossForPeriod sudah handle arah.
                // Mari kita re-cek:
                // profitLossForPeriod += newBalance (Revenue) // (+ if Cr > Dr)
                // profitLossForPeriod -= newBalance (Expense) // (- if Dr > Cr)
                // groupSums isinya adalah saldo akun. 
                // Revenue (Credit Normal): saldo normal (+)
                // Expense (Debit Normal): saldo normal (+)
                // Jadi Laba = Revenue - Expense
                totalValue = revenue - cogs;
            }
            else if (account.id === 'laba_usaha') {
                const revenue = groupSums.get('pendapatan') || 0;
                const cogs = groupSums.get('beban_pokok_pendapatan') || 0;
                const operatingExpense = groupSums.get('beban_usaha') || 0;
                totalValue = (revenue - cogs) - operatingExpense;
            }
            else if (account.id === 'laba_sebelum_pajak_penghasilan') {
                // Laba Usaha + Pendapatan Lain - Beban Lain
                const revenue = groupSums.get('pendapatan') || 0;
                const cogs = groupSums.get('beban_pokok_pendapatan') || 0;
                const operatingExpense = groupSums.get('beban_usaha') || 0;
                const otherRevenue = groupSums.get('pendapatan_lain') || 0;
                const otherExpense = groupSums.get('beban_lain') || 0;
                totalValue = ((revenue - cogs) - operatingExpense) + otherRevenue - otherExpense;
            }

            // --- CASH FLOW TOTALS ---
            // Asumsi: Kita bisa menggunakan groupSums jika akun transaksi punya group yang sesuai dengan nama akun total ini.
            else if (account.id === 'kas_neto_dari_aktivitas_operasi') {
                // Jika transaksi di-tag dengan group 'kas_neto_dari_aktivitas_operasi' (langsung atau via mapping)
                // Cek exported data: akun 'penerimaan_dari_pelanggan' grupnya apa?
                // Mari berasumsi structure group = id total ini.
                totalValue = groupSums.get('kas_neto_dari_aktivitas_operasi') || 0;
                // Jika 0, mungkin namanya beda? Mari coba 'aktivitas_operasi'
                if (totalValue === 0) totalValue = groupSums.get('aktivitas_operasi') || 0;
            }
            else if (account.id === 'kas_neto_dari_aktivitas_investasi') {
                totalValue = groupSums.get('kas_neto_dari_aktivitas_investasi') || 0;
                if (totalValue === 0) totalValue = groupSums.get('aktivitas_investasi') || 0;
            }
            else if (account.id === 'kas_neto_dari_aktivitas_pendanaan') {
                totalValue = groupSums.get('kas_neto_dari_aktivitas_pendanaan') || 0;
                if (totalValue === 0) totalValue = groupSums.get('aktivitas_pendanaan') || 0;
            }

            accountUpdates.push({
                ref: account.ref,
                data: { [`balances.${endDate}`]: totalValue }
            });
            updates.push({ id: account.id, name: account.name, final: totalValue, is_total: true });
            updatedCount++;
        }

        // Commit Updates
        const journalUpdates: any[] = [];
        journalsSnapshot.forEach(doc => {
            journalUpdates.push({ ref: doc.ref, data: { status: 'closed' } });
        });

        const allOperations = [...accountUpdates, ...journalUpdates];
        const BATCH_SIZE = 450;
        for (let i = 0; i < allOperations.length; i += BATCH_SIZE) {
            const batch = db.batch();
            const chunk = allOperations.slice(i, i + BATCH_SIZE);
            chunk.forEach(op => batch.update(op.ref, op.data));
            await batch.commit();
        }

        return {
            success: true,
            processedAccounts: updatedCount,
            message: `Closed books for ${periodLabel} (ID: ${endDate}). Updated ${updatedCount} accounts.`,
            details: updates
        };

    } catch (error: any) {
        console.error("Close Books Error:", error);
        return { success: false, processedAccounts: 0, message: error.message };
    }
}   