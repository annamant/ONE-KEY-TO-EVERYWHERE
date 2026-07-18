import { Spinner } from '@/components/ui/Spinner'

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}
