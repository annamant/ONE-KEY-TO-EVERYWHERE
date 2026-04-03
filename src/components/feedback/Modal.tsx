import { useEffect, type ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classNames'
import { Button } from '@/components/ui/Button'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
  className?: string
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, footer, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-surface rounded-modal shadow-modal animate-slide-up',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-heading-md text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-okte-slate-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-okte-slate-100 transition-colors z-10"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-okte-slate-50 rounded-b-modal">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
