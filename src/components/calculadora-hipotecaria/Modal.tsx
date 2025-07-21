import React from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  maxWidth = "max-w-3xl",
}) => {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div
        className={`bg-white rounded-xl shadow-lg w-full ${maxWidth} p-0 relative max-h-[80vh] flex flex-col`}
        style={{ maxHeight: "80vh" }}
      >
        <button
          className='absolute top-3 right-3 text-gray-400 hover:text-blue-600 text-2xl font-bold z-10'
          onClick={onClose}
          aria-label='Cerrar modal'
        >
          ×
        </button>
        <div className='p-8 overflow-y-auto w-full h-full'>{children}</div>
      </div>
    </div>
  )
}

export default Modal
