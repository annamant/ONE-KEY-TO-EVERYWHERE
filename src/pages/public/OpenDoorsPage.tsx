import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { HomeModernIcon, ShieldCheckIcon, KeyIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const WHAT_WE_LOOK_FOR = [
  {
    icon: <HomeModernIcon className="w-6 h-6" />,
    title: 'Character, not category',
    desc: 'A trullo, a masseria, a baroque palazzo, a coastal tower. We look for homes with a soul — places that tell a story.',
  },
  {
    icon: <ShieldCheckIcon className="w-6 h-6" />,
    title: 'Curated, not crowded',
    desc: 'The Club is intentionally small. Every home is reviewed individually. Being accepted means something.',
  },
  {
    icon: <KeyIcon className="w-6 h-6" />,
    title: 'Your terms',
    desc: 'You decide which dates are available. You set the minimum visit length. The Club doesn\'t override your preferences.',
  },
  {
    icon: <ArrowPathIcon className="w-6 h-6" />,
    title: 'Off-season matters',
    desc: 'The Club\'s key model is designed to encourage visits in autumn and winter, not just peak summer. Your home stays alive all year.',
  },
]

export function OpenDoorsPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    propertyType: '',
    message: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.email || !form.city) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFFFF' }}>
      <PublicNav />

      {/* Hero */}
      <section style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }} className="py-16 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>
            For property owners · Puglia
          </p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#0A0A0A' }}>
            Open your doors<br />to the Club.
          </h1>
          <p className="text-body-lg" style={{ color: '#6B6B6B' }}>
            If you own an exceptional home in Puglia and believe it belongs in a curated circle, we'd like to hear from you.
          </p>
        </div>
      </section>

      {/* What we look for */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-heading-xl font-bold" style={{ color: '#0A0A0A' }}>What we look for</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {WHAT_WE_LOOK_FOR.map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#0A0A0A', color: '#FFFFFF' }}>
                {icon}
              </div>
              <div>
                <h3 className="text-body-md font-semibold mb-1" style={{ color: '#0A0A0A' }}>{title}</h3>
                <p className="text-body-sm" style={{ color: '#6B6B6B' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry form */}
      <section style={{ background: '#F5F5F5', borderTop: '1px solid #E5E5E5' }} className="py-20">
        <div className="max-w-2xl mx-auto px-6">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#EFEFEF' }}>
                <HomeModernIcon className="w-8 h-8" style={{ color: '#0A0A0A' }} />
              </div>
              <h2 className="font-display text-heading-xl font-bold mb-3" style={{ color: '#0A0A0A' }}>
                Thank you, {form.firstName}.
              </h2>
              <p className="text-body-sm" style={{ color: '#6B6B6B' }}>
                We've received your enquiry. Someone from our team will be in touch at{' '}
                <strong style={{ color: '#0A0A0A' }}>{form.email}</strong> within a few days.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="font-display text-heading-xl font-bold mb-3" style={{ color: '#0A0A0A' }}>
                  Tell us about your home
                </h2>
                <p className="text-body-sm" style={{ color: '#6B6B6B' }}>
                  This is not an application form — it's the beginning of a conversation. Fill in what you can and we'll take it from there.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="First name" required>
                    <Input value={form.firstName} onChange={set('firstName')} placeholder="Your first name" />
                  </FormField>
                  <FormField label="Last name">
                    <Input value={form.lastName} onChange={set('lastName')} placeholder="Your last name" />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Email" required>
                    <Input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  </FormField>
                  <FormField label="Phone">
                    <Input type="tel" value={form.phone} onChange={set('phone')} placeholder="+39 …" />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Property location" required>
                    <Input value={form.city} onChange={set('city')} placeholder="e.g. Ostuni, Lecce, Alberobello" />
                  </FormField>
                  <FormField label="Property type">
                    <select
                      value={form.propertyType}
                      onChange={set('propertyType')}
                      className="w-full rounded-input px-4 py-2 text-body-sm"
                      style={{
                        border: '1.5px solid #E5E5E5',
                        background: '#FFFFFF',
                        color: form.propertyType ? '#0A0A0A' : '#6B6B6B',
                        outline: 'none',
                      }}
                    >
                      <option value="">Select…</option>
                      <option>Trullo</option>
                      <option>Masseria</option>
                      <option>Palazzo / Historic building</option>
                      <option>Villa</option>
                      <option>Coastal tower</option>
                      <option>Farmhouse / Dammuso</option>
                      <option>Other</option>
                    </select>
                  </FormField>
                </div>
                <FormField label="Tell us about your home">
                  <textarea
                    value={form.message}
                    onChange={set('message')}
                    rows={5}
                    placeholder="A few words about the property — its history, what makes it special, what kind of guests you imagine…"
                    className="w-full rounded-input px-4 py-3 text-body-sm resize-none"
                    style={{
                      border: '1.5px solid #E5E5E5',
                      background: '#FFFFFF',
                      color: '#0A0A0A',
                      outline: 'none',
                    }}
                  />
                </FormField>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  style={{ background: '#0A0A0A', color: '#FFFFFF', border: 'none', fontWeight: 700 }}
                >
                  Send enquiry
                </Button>
              </form>

              <p className="text-caption text-center mt-4" style={{ color: '#6B6B6B' }}>
                We respond to every enquiry personally. No automated replies.
              </p>
            </>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
