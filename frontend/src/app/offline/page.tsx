// offline/page.tsx — Shown when user has no internet connection for Charly HB
'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
        <span className="text-white text-2xl font-bold">S</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-2">You're offline</h1>
      <p className="text-sm text-gray-500 mb-8 max-w-xs">
        No internet connection detected. Please check your network and try again.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="h-12 px-8 bg-orange-500 text-white text-sm font-medium rounded-xl active:opacity-70"
      >
        Try again
      </button>
    </div>
  )
}
