import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
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
                <EnvelopeIcon className="w-8 h-8" style={{ color: '#0A0A0A' }} />
              </div>
              <h1 className="font-display text-heading-xl font-bold mb-3" style={{ color: '#0A0A0A' }}>
                You're in.
              </h1>
              <p className="text-body-sm mb-2" style={{ color: '#6B6B6B' }}>
                Welcome to the community, <strong style={{ color: '#0A0A0A' }}>{firstName}</strong>. We'll send Club
                updates to <strong style={{ color: '#0A0A0A' }}>{email}</strong>.
              </p>
              <p className="text-caption" style={{ color: '#6B6B6B' }}>
                Interested in full membership?{' '}
                <Link to="/auth/signup" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>
                  Apply to join the Club
                </Link>
                {' '}or learn{' '}
                <a href="/how-it-works" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>how it works</a>.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#C4882F' }}>
                  One Key Community
                </p>
                <h1 className="font-display text-display-lg font-bold mb-3" style={{ color: '#0A0A0A' }}>
                  Join our community newsletter.
                </h1>
                <p className="text-body-sm" style={{ color: '#6B6B6B' }}>
                  Club news, Ostuni stories, and membership updates — delivered occasionally, never spammy.
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
                  This newsletter is for Club followers. If you have a home in Puglia, use{' '}
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
                  Subscribe
                </Button>
              </form>

              <p className="text-caption text-center mt-4" style={{ color: '#6B6B6B' }}>
                No sharing with third parties. Unsubscribe any time.
              </p>
              <p className="text-caption text-center mt-3" style={{ color: '#6B6B6B' }}>
                Ready to apply for membership?{' '}
                <Link to="/auth/signup" style={{ color: '#0A0A0A', textDecoration: 'underline' }}>
                  Submit your application
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
