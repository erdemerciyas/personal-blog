import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            404
          </h1>
          <h2 className="text-3xl font-bold text-white mt-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-slate-300 mt-4 text-lg">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
          >
            Ana Sayfaya Dön
          </Link>
          
          <div className="mt-6">
            <Link
              href="/contact"
              className="text-teal-400 hover:text-teal-300 transition-colors duration-200"
            >
              İletişime Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 