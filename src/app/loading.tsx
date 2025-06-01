export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl border border-white/20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
        <p className="text-white mt-4">Yükleniyor...</p>
      </div>
    </div>
  );
} 