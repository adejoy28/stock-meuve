// InstallPrompt.tsx — Shows "Add to Home Screen" banner on Android Chrome
// Automatically hidden once the app is installed or dismissed
'use client'

import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only show if not already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    // Check if user already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showBanner) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
      {/* App icon */}
      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-bold">CHB</span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">Install Charly HB</p>
        <p className="text-xs text-gray-400">Add to home screen for quick access</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleDismiss}
          className="text-xs text-gray-400 px-2 py-1 active:opacity-70"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="text-xs font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-lg active:opacity-70"
        >
          Install
        </button>
      </div>
    </div>
  )
}
