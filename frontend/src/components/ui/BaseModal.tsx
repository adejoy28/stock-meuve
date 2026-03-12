// BaseModal.tsx — Reusable modal wrapper
// Generates a fresh idempotency key each time a modal opens.
// Clears it when modal closes.

import React, { useEffect } from 'react'
import { generateIdempotencyKey } from '@/lib/idempotency'
import { setIdempotencyKey, clearIdempotencyKey } from '@/lib/api'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function BaseModal({ isOpen, onClose, title, children }: BaseModalProps) {
  // Generate a fresh idempotency key every time the modal opens
  useEffect(() => {
    if (isOpen) {
      const key = generateIdempotencyKey()
      setIdempotencyKey(key)
    } else {
      clearIdempotencyKey()
    }

    return () => {
      clearIdempotencyKey()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Bottom sheet on mobile, centered dialog on desktop */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl md:max-w-md md:mx-auto md:rounded-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2">
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4 md:hidden" />

        {/* Modal header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 p-1 rounded-lg active:opacity-70"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="px-4 pb-6 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
