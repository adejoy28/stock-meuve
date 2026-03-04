// FloatingActionButton.tsx — FAB for quick actions with action sheet
// Props: actions (array), isOpen (boolean), onOpen (function), onClose (function)

'use client'

import { useState } from 'react'

interface Action {
  id: string
  label: string
  onClick: () => void
}

interface FloatingActionButtonProps {
  actions: Action[]
  disabled?: boolean
}

export default function FloatingActionButton({ actions, disabled = false }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => setIsOpen(false)

  const handleActionClick = (action: Action) => {
    action.onClick()
    handleClose()
  }

  if (disabled) return null

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 z-40 bg-orange-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-md active:opacity-70"
        aria-label="Quick actions"
      >
        <span className="text-2xl font-light">+</span>
      </button>

      {/* Action Sheet Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleClose}
          />
          
          {/* Action Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl">
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-2"></div>
            
            {/* Action List */}
            <div className="pb-6">
              {actions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className={`flex items-center gap-3 px-4 py-4 text-sm text-gray-700 active:opacity-70 w-full text-left ${
                    index < actions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <span className="text-xl">{getActionIcon(action.id)}</span>
                  <span>{action.label}</span>
                </button>
              ))}
              
              {/* Cancel Button */}
              <button
                onClick={handleClose}
                className="flex items-center justify-center px-4 py-4 text-sm text-gray-500 active:opacity-70 w-full border-t border-gray-100 mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function getActionIcon(actionId: string): string {
  const icons = {
    opening: '📊',
    receipt: '📦',
    distribution: '🚚',
    spoil: '⚠️',
    correction: '✏️'
  }
  return icons[actionId as keyof typeof icons] || '📋'
}
