
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