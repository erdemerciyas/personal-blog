'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                Hata
              </h1>
              <h2 className="text-2xl font-bold text-white mt-4">
                Bir şeyler ters gitti
              </h2>
              <p className="text-slate-300 mt-4 text-lg">
                Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={reset}
                className="inline-block px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
              >
                Tekrar Dene
              </button>
              
              <div className="mt-6">
                <a
                  href="/"
                  className="text-orange-400 hover:text-orange-300 transition-colors duration-200"
                >
                  Ana Sayfaya Dön
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 