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
    // 1. Ambil Layout
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

    // 3. Proses Aggregasi Data
    const sections: ReportSection[] = layoutSections.map((sec: any) => {
      const groupAccounts = allAccounts.filter((acc: any) =>
        sec.accountGroups?.includes(acc.group)
      );

      const rows: ReportRow[] = groupAccounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        amount: (acc.balances && acc.balances[periodCode]) || 0,
        isTotal: acc.is_total,
      }));

      // pisahkan dulu
      const normalRows = rows.filter((row) => !row.isTotal);
      const totalRows = rows.filter((row) => row.isTotal);

      // gabung: yang biasa dulu, total di akhir
      const orderedRows = [...normalRows, ...totalRows];

      return {
        id: sec.id,
        label: sec.label,
        side: sec.side,
        order: sec.order,
        rows: orderedRows,
      };
    });

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
