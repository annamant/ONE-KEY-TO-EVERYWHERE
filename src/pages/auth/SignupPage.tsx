import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'

export function SignupPage() {
  const { signup } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName) e.firstName = 'First name is required'
    if (!form.lastName) e.lastName = 'Last name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password || form.password.length < 4) e.password = 'Password must be at least 4 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setErrors({})
    try {
      await signup({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: 'member',
      })
      toast('Membership application submitted. We’ll review it shortly.', 'success')
      navigate('/member/pending', { replace: true })
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Signup failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-alt flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-okte-navy-900 flex items-center justify-center mx-auto mb-4">
            <span className="text-accent font-bold text-heading-md">K</span>
          </div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Apply for membership</h1>
          <p className="text-body-sm text-text-muted mt-1">Create your Club member account</p>
        </div>

        <div className="bg-surface rounded-card shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.form && (
              <div className="px-4 py-3 bg-danger-light text-danger text-body-sm rounded-lg">
                {errors.form}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField label="First name" htmlFor="firstName" error={errors.firstName} required>
                <Input id="firstName" value={form.firstName} onChange={set('firstName')} placeholder="Alice" error={errors.firstName} />
              </FormField>
              <FormField label="Last name" htmlFor="lastName" error={errors.lastName} required>
                <Input id="lastName" value={form.lastName} onChange={set('lastName')} placeholder="Smith" error={errors.lastName} />
              </FormField>
            </div>

            <FormField label="Email" htmlFor="email" error={errors.email} required>
              <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email} />
            </FormField>

            <FormField label="Password" htmlFor="password" error={errors.password} required>
              <Input id="password" type="password" value={form.password} onChange={set('password')} placeholder="Min 4 characters" error={errors.password} />
            </FormField>

            <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword} required>
              <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" error={errors.confirmPassword} />
            </FormField>

            <p className="text-caption text-text-muted">
              Your application will be reviewed by the Club team. You'll receive a confirmation email once approved.
            </p>

            <Button type="submit" fullWidth loading={loading}>
              Submit application
            </Button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-okte-slate-50 text-caption text-text-muted">
            <strong className="text-text-primary">Property owner?</strong>{' '}
            Members and owners follow different paths.{' '}
            <Link to="/open-doors" className="text-primary hover:underline">Join the owner waitlist</Link>
            {' '}instead.
          </div>
        </div>

        <p className="text-center text-body-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
