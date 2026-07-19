import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { isChunkLoadError } from '@/utils/lazyWithRetry'
import { Button } from '@/components/ui/Button'

export function RouteErrorPage() {
  const error = useRouteError()
  const chunkError = isChunkLoadError(error)
  const message = error instanceof Error ? error.message : 'Something went wrong'

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface rounded-card shadow-card p-8 text-center">
        <h1 className="text-heading-lg text-text-primary font-semibold mb-2">
          {chunkError ? 'Update available' : 'Unexpected error'}
        </h1>
        <p className="text-body-sm text-text-muted mb-6">
          {chunkError
            ? 'A newer version of the app was deployed. Refresh to load the latest pages.'
            : isRouteErrorResponse(error)
              ? error.statusText || message
              : message}
        </p>
        <Button onClick={() => window.location.reload()} fullWidth>
          Refresh page
        </Button>
      </div>
    </div>
  )
}
