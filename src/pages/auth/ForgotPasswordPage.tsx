import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-okte-navy-900 flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-bold text-heading-md">K</span>
          </div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Reset password</h1>
          <p className="text-body-sm text-text-muted mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="bg-surface rounded-card shadow-card p-6">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircleIcon className="w-12 h-12 text-success mx-auto mb-3" />
              <h3 className="text-heading-md text-text-primary mb-2">Email sent!</h3>
              <p className="text-body-sm text-text-muted mb-4">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <Link to="/auth/login" className="text-primary text-body-sm hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Email address" htmlFor="email" required>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </FormField>
              <Button type="submit" fullWidth loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-body-sm text-text-muted mt-6">
          <Link to="/auth/login" className="text-primary hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
