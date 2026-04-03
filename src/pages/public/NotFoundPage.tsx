import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt p-4">
      <div className="text-center max-w-md">
        <h1 className="text-[8rem] font-bold text-okte-slate-200 leading-none">404</h1>
        <h2 className="text-heading-xl text-text-primary font-semibold -mt-4 mb-3">Page not found</h2>
        <p className="text-body-sm text-text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => window.history.back()} variant="secondary">Go Back</Button>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    </div>
  )
}
