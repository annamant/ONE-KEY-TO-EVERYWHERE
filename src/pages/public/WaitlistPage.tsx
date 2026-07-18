import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon } from '@heroicons/react/24/outline'
import { waitlistService } from '@/services/waitlist'
import { ApiError } from '@/services/apiClient'

export function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName) return
    setLoading(true)
    setError('')
    try {
      await waitlistService.submitMember({ firstName, email })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <PublicNav />

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#EFEFEF' }}>
                <KeyIcon className="w-8 h-8" style={{ color: '#0A0A0A' }} />
              </div>
              <h1 className="font-display text-heading-xl font-bold mb-3" style={{ color: '#0A0A0A' }}>
                You're on the list.
              </h1>
              <p className="text-body-sm mb-2" style={{ color: '#6B6B6B' }}>
                Thank you, <strong style={{ color: '#0A0A0A' }}>{firstName}</strong>. We'll reach out to{' '}
                <strong style={{ color: '#0A0A0A' }}>{email}</strong> as soon as we have a place for you.
              </p>
              <p className="text-caption mb-4" style={{ color: '#6B6B6B' }}>
                Ready to apply now?{' '}
                <Link to="/auth/signup" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>
                  Create a membership account
                </Link>
              </p>
              <p className="text-caption" style={{ color: '#6B6B6B' }}>
                In the meantime, learn{' '}
                <a href="/how-it-works" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>how the Club works</a>.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#C4882F' }}>
                  Club Member · Puglia
                </p>
                <h1 className="font-display text-display-lg font-bold mb-3" style={{ color: '#0A0A0A' }}>
                  Be first in.
                </h1>
                <p className="text-body-sm" style={{ color: '#6B6B6B' }}>
                  Club memberships are limited and selective. Leave your details — we'll reach out when it's your moment.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="px-4 py-3 bg-danger-light text-danger text-body-sm rounded-lg">{error}</div>
                )}

                <FormField label="First name" required>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                  />
                </FormField>
                <FormField label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </FormField>

                <div
                  className="p-4 rounded-card text-body-sm"
                  style={{ background: '#F5F5F5', border: '1px solid #E5E5E5', color: '#6B6B6B' }}
                >
                  <strong style={{ color: '#0A0A0A' }}>Property owner?</strong>{' '}
                  This form is for Club members only. If you have a home in Puglia, use{' '}
                  <Link to="/open-doors" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>
                    Open Your Doors
                  </Link>{' '}
                  instead.
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  style={{ background: '#0A0A0A', color: '#FFFFFF', border: 'none', fontWeight: 700, marginTop: '0.5rem' }}
                >
                  Add my name
                </Button>
              </form>

              <p className="text-caption text-center mt-4" style={{ color: '#6B6B6B' }}>
                No marketing emails. No sharing with third parties. Just us, when the time is right.
              </p>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
