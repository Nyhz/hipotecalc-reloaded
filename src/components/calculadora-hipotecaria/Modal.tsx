import React, { useEffect, useId, useRef } from "react"

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title: string
  lang?: 'es' | 'en'
  maxWidth?: string
}

export default function Modal({ open, onClose, children, title, lang = 'es', maxWidth = 'max-w-3xl' }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Native modal dialogs keep the background inert and contain keyboard focus.
    dialog.showModal()
    return () => {
      document.body.style.overflow = previousOverflow
      dialog.close()
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [open])

  if (!open) return null
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-modal='true'
      onCancel={e => { e.preventDefault(); onClose() }}
      onKeyDown={e => {
        if (e.key !== 'Tab') return
        const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary, [tabindex]'))
          .filter(node => node.tabIndex >= 0 && !node.matches(':disabled') && node.getClientRects().length > 0)
        const first = items[0], last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first && last) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last && first) {
          e.preventDefault()
          first.focus()
        }
      }}
      className={`pl-card shadow-2xl w-full ${maxWidth} p-0 fixed m-auto max-h-[80vh] overflow-hidden backdrop:bg-black/40 backdrop:backdrop-blur-sm`}
      onMouseDown={e => {
        const box = e.currentTarget.getBoundingClientRect()
        if (e.target === e.currentTarget && (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom)) onClose()
      }}
    >
      <button type='button' className='absolute top-3 right-3 text-ink-soft hover:text-ink text-2xl font-bold z-10 cursor-pointer transition-colors'
        onClick={onClose} aria-label={lang === 'es' ? 'Cerrar modal' : 'Close modal'}>×</button>
      <div className='p-6 sm:p-8 overflow-y-auto w-full max-h-[80vh]'>
        <h2 id={titleId} className='font-heading text-xl mb-4 pr-6'>{title}</h2>
        {children}
      </div>
    </dialog>
  )
}
