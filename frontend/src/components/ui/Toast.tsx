// Toast.tsx — Global toast notification system for user feedback
// Shows success, error, and info messages with auto-dismiss

'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id, duration: toast.duration || 5000 }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto dismiss
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 
            transform transition-all duration-300 ease-in-out
            ${toast.type === 'success' ? 'border-green-200 bg-green-50' : ''}
            ${toast.type === 'error' ? 'border-red-200 bg-red-50' : ''}
            ${toast.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
          `}
        >
          <div className="flex items-start">
            <div className="shrink-0">
              {toast.type === 'success' && (
                <span className="text-green-600 text-lg">✓</span>
              )}
              {toast.type === 'error' && (
                <span className="text-red-600 text-lg">✕</span>
              )}
              {toast.type === 'info' && (
                <span className="text-blue-600 text-lg">ℹ</span>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className={`
                text-sm font-medium
                ${toast.type === 'success' ? 'text-green-800' : ''}
                ${toast.type === 'error' ? 'text-red-800' : ''}
                ${toast.type === 'info' ? 'text-blue-800' : ''}
              `}>
                {toast.message}
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={() => removeToast(toast.id)}
                className={`
                  inline-flex text-gray-400 hover:text-gray-600
                  focus:outline-none focus:text-gray-600
                  transition-colors duration-200
                `}
              >
                <span className="sr-only">Dismiss</span>
                <span className="text-lg">&times;</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
