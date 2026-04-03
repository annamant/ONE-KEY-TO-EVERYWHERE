import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'
import { useToast, type ToastType } from '@/contexts/ToastContext'
import { cn } from '@/utils/classNames'

const typeConfig: Record<
  ToastType,
  { icon: React.ElementType; bg: string; iconClass: string; borderClass: string }
> = {
  success: {
    icon: CheckCircleIcon,
    bg: 'bg-surface',
    iconClass: 'text-success',
    borderClass: 'border-l-4 border-success',
  },
  error: {
    icon: ExclamationCircleIcon,
    bg: 'bg-surface',
    iconClass: 'text-danger',
    borderClass: 'border-l-4 border-danger',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bg: 'bg-surface',
    iconClass: 'text-warning',
    borderClass: 'border-l-4 border-warning',
  },
  info: {
    icon: InformationCircleIcon,
    bg: 'bg-surface',
    iconClass: 'text-primary',
    borderClass: 'border-l-4 border-primary',
  },
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => {
        const config = typeConfig[t.type]
        const Icon = config.icon
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 rounded-lg shadow-modal animate-slide-in-right',
              config.bg,
              config.borderClass
            )}
          >
            <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass)} />
            <p className="text-body-sm text-text-primary flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
