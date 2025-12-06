import { Suspense } from 'react';
import ReportsDashboard from './ReportsDashboard';

export default function LaporanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f12] text-white flex items-center justify-center">
      <p>Memuat laporan...</p>
    </div>}>
      <ReportsDashboard />
    </Suspense>
  );
}