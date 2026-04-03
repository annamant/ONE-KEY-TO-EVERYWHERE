import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { Select } from '@/components/ui/Select'

export function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [role, setRole] = useState('member')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNav />

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="text-center">
              <CheckCircleIcon className="w-16 h-16 text-success mx-auto mb-4" />
              <h1 className="font-display text-heading-xl font-bold text-text-primary mb-3">You're on the list!</h1>
              <p className="text-body-sm text-text-muted mb-2">
                Thanks, <strong>{firstName}</strong>. We'll send an invite to <strong>{email}</strong> when we open spots.
              </p>
              <p className="text-caption text-text-muted">
                In the meantime, explore our{' '}
                <a href="/how-it-works" className="text-primary underline">how it works</a> page.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-display-lg font-bold text-okte-navy-900 mb-3">Join the waitlist</h1>
                <p className="text-body-sm text-text-muted">
                  We're growing carefully. Get early access to One Key to Everywhere.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="First name" required>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Anna"
                    autoFocus
                  />
                </FormField>
                <FormField label="Email address" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anna@example.com"
                  />
                </FormField>
                <FormField label="I'm interested as a…">
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    options={[
                      { value: 'member', label: 'Member (traveller)' },
                      { value: 'owner', label: 'Owner (list my property)' },
                      { value: 'both', label: 'Both' },
                    ]}
                  />
                </FormField>

                <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                  Request early access
                </Button>
              </form>

              <p className="text-caption text-text-muted text-center mt-4">
                No spam. No credit card needed. Unsubscribe anytime.
              </p>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
