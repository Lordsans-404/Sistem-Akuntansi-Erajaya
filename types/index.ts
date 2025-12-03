
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