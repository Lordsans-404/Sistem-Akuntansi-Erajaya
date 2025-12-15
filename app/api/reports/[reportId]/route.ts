import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { FinancialReport, ReportSection, ReportRow } from '@/types';

const REPORT_MAP: Record<string, string> = {
  'balance-sheet': 'statement_of_financial_position',
  'income-statement': 'statement_of_profit_or_loss',
  'cash-flow': 'statement_of_cash_flows',
  'equity-changes': 'statement_of_changes_in_equity',
};

/**
 * Handler GET untuk Membuat Laporan Keuangan
 * 
 * Tujuan:
 * Menghasilkan struktur data laporan keuangan (seperti Neraca, Laba Rugi) berdasarkan Layout yang didefinisikan dan data saldo akun.
 * 
 * Parameter URL (Dynamic Route):
 * - reportId: Identifier jenis laporan ('balance-sheet', 'income-statement', 'cash-flow', 'equity-changes').
 * 
 * Parameter Query:
 * - period: Kode periode (YYYY-MM-DD) untuk mengambil saldo akun pada titik waktu tersebut.
 * 
 * Cara Kerja (Logika):
 * 1. **Validasi Request**: Memastikan `period` ada dan `reportId` valid (dipetakan ke ID layout Firestore).
 * 2. **Ambil Layout Laporan**: Mengambil konfigurasi struktur laporan dari koleksi "reportLayouts". Konfigurasi ini menentukan bagian-bagian laporan (sections) dan akun grup mana yang masuk ke setiap bagian.
 * 3. **Ambil Data Akun**: Mengambil semua akun dari koleksi "accounts".
 * 4. **Aggregasi Data**:
 *    - Iterasi setiap `section` dari layout.
 *    - Filter akun yang `group`-nya sesuai dengan konfigurasi section tersebut.
 *    - Mengambil saldo (`amount`) dari field `balances` di setiap akun sesuai dengan `periodCode` yang diminta.
 *    - Menyusun baris-baris (`rows`) laporan.
 *    - Memisahkan dan mengurutkan baris biasa dan baris Total (jika ada flag `is_total`).
 * 5. **Sorting**: Mengurutkan section berdasarkan field `order`.
 * 6. **Response**: Mengembalikan objek `FinancialReport` lengkap.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ reportId: string }> }
) {
  const { reportId } = await context.params;

  const periodCode = request.nextUrl.searchParams.get('period');

  if (!periodCode) {
    return NextResponse.json({ error: 'Period wajib diisi' }, { status: 400 });
  }

  const layoutId = REPORT_MAP[reportId];
  if (!layoutId) {
    return NextResponse.json({ error: 'Pilih Laporan Terlebih Dahulu!' }, { status: 404 });
  }

  try {
    // 1. Ambil Layout (Konfigurasi Laporan)
    const layoutRef = doc(db, 'reportLayouts', layoutId);
    const layoutSnap = await getDoc(layoutRef);

    if (!layoutSnap.exists()) {
      return NextResponse.json(
        { error: 'Layout tidak ditemukan' },
        { status: 404 }
      );
    }

    const layout = layoutSnap.data() as any;
    const layoutSections: any[] = Array.isArray(layout.sections)
      ? layout.sections
      : [];

    // 2. Ambil Semua Akun Terkait
    const accountsRef = collection(db, 'accounts');
    const qAcc = query(accountsRef);
    const accountsSnap = await getDocs(accountsRef);

    const allAccounts = accountsSnap.docs.map(
      (docSnap) =>
      ({
        id: docSnap.id,
        ...docSnap.data(),
      } as any)
    );

    // 3. Proses Aggregasi Data (Mapping Akun ke Section Laporan)
    const sections: ReportSection[] = layoutSections.map((sec: any) => {
      // Filter akun yang masuk ke grup akun section ini
      const groupAccounts = allAccounts.filter((acc: any) =>
        sec.accountGroups?.includes(acc.group)
      );

      // Buat baris laporan dari akun yang cocok
      const rows: ReportRow[] = groupAccounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        // Ambil saldo spesifik periode, default 0 jika tidak ada
        amount: (acc.balances && acc.balances[periodCode]) || 0,
        isTotal: acc.is_total,
      }));

      // Pisahkan baris biasa dan baris total untuk pengurutan tampilan
      const normalRows = rows.filter((row) => !row.isTotal);
      const totalRows = rows.filter((row) => row.isTotal);

      // Gabung: baris biasa dulu, baru baris total di akhir
      const orderedRows = [...normalRows, ...totalRows];

      return {
        id: sec.id,
        label: sec.label,
        side: sec.side,
        order: sec.order,
        rows: orderedRows,
      };
    });

    // Urutkan section sesuai konfigurasi
    sections.sort((a, b) => a.order - b.order);

    const response: FinancialReport = {
      id: layoutId,
      name: layout.name,
      statement: layout.statement,
      periodCode,
      currency: 'IDR',
      unit: 'thousand',
      sections,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
