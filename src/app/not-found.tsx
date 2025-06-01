import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl border border-white/20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Sayfa Bulunamadı
        </h2>
        <p className="text-gray-200 mb-6">
          Üzgünüz, aradığınız sayfa bulunamadı.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600/80 hover:bg-blue-700/80 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 backdrop-blur-lg"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
} 