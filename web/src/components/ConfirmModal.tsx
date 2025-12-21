import { ReactNode } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-slate-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-white/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="p-6">
          <h3
            id="modal-title"
            className="text-xl font-semibold text-white mb-4"
          >
            {title}
          </h3>
          <div className="text-blue-200 mb-6">{message}</div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
