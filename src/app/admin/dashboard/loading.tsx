export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-700 mx-auto"></div>
        <p className="text-slate-600">Dashboard yükleniyor...</p>
        <p className="text-xs text-slate-400">Vercel&apos;de optimize edilmiş yükleme</p>
      </div>
    </div>
  );
}