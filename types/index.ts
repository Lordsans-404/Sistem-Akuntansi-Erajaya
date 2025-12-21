
export interface Period {
  id: string;
  code: string;
  label: string;
  endDate: string;
}

export interface ReportRow {
  id: string;
  name: string;
  amount: number;
  isTotal: boolean;
}

export interface ReportSection {
  id: string;
  label: string;
  side?: "left" | "right";
  order: number;
  rows: ReportRow[];
}

export interface FinancialReport {
  id: string;
  name: string;
  statement: string;
  periodCode: string;
  currency: "IDR";
  unit: "thousand";
  sections: ReportSection[];
}

export interface AccountBalances {
  [period: string]: number; // flexible untuk periode baru
}

export interface AccountData {
  id: string;
  name: string;
  category: string;
  group: string;
  balances: AccountBalances;
  currency: "IDR" | string;
  unit: "thousand" | "million" | string;
  is_total: boolean;
  statement: string;
}

export interface JournalEntryItem {
  account: any;
  debit: number;
  credit: number;
}

export interface JournalTransaction {
  id?: string;
  created_at?: string | Date; // Use string for simplified JSON, or Date
  date: string;
  description: string;
  entries: JournalEntryItem[];
  period: string; // "YYYY-MM-DD" or code
  status: "draft" | "posted" | "closed";
  total_credit: number;
  total_debit: number;
}

export interface JournalAccountRef {
  id: string;
  name: string;
  category: string;
  group: string;
  statement: string;
  report_account_id?: string; // Link to AccountData (Report Account)
}