import React, { useEffect, useRef } from "react"
import { useTranslations } from "../../hooks/useTranslations"

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
  const { t } = useTranslations()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Bloquear el scroll de la página y cerrar con Escape mientras esté abierto
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)

    // Llevar el foco al diálogo para que Tab no opere el formulario de fondo
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        tabIndex={-1}
        className={`pl-card shadow-2xl w-full ${maxWidth} p-0 relative max-h-[80vh] flex flex-col focus:outline-none`}
        style={{ maxHeight: "80vh" }}
      >
        <button
          className='absolute top-3 right-3 text-ink-soft hover:text-ink text-2xl font-bold z-10 cursor-pointer transition-colors'
          onClick={onClose}
          aria-label={t('common.closeModal') || 'Close modal'}
        >
          ×
        </button>
        <div className='p-8 overflow-y-auto w-full h-full'>{children}</div>
      </div>
    </div>
  )
}

export default Modal
