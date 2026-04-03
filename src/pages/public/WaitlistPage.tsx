import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/forms/FormField'
import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { KeyIcon } from '@heroicons/react/24/outline'

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
    <div className="min-h-screen flex flex-col" style={{ background: '#FDFAF5' }}>
      <PublicNav />

      <main className="flex-1 flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#FAE6DA' }}>
                <KeyIcon className="w-8 h-8" style={{ color: '#8B3A2A' }} />
              </div>
              <h1 className="font-display text-heading-xl font-bold mb-3" style={{ color: '#2C1810' }}>
                Sei nella lista.
              </h1>
              <p className="text-body-sm mb-2" style={{ color: '#8A7560' }}>
                Grazie, <strong style={{ color: '#2C1810' }}>{firstName}</strong>. Ti contatteremo su{' '}
                <strong style={{ color: '#2C1810' }}>{email}</strong> non appena avremo posti disponibili.
              </p>
              <p className="text-caption" style={{ color: '#8A7560' }}>
                Nel frattempo, scopri{' '}
                <a href="/how-it-works" style={{ color: '#8B3A2A', textDecoration: 'underline' }}>come funziona il Club</a>.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-caption font-semibold uppercase tracking-widest mb-3" style={{ color: '#C4882F' }}>
                  Puglia · Lancio Fondatori
                </p>
                <h1 className="font-display text-display-lg font-bold mb-3" style={{ color: '#2C1810' }}>
                  Entra per primo.
                </h1>
                <p className="text-body-sm" style={{ color: '#8A7560' }}>
                  Le membership del Club sono limitate e selettive. Lascia i tuoi dati — ti contatteremo noi quando sarà il tuo momento.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField label="Nome" required>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Mario"
                    autoFocus
                  />
                </FormField>
                <FormField label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mario@esempio.it"
                  />
                </FormField>
                <FormField label="Mi interessa come…">
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[
                      { value: 'member', label: 'Socio', sub: 'Voglio accedere alle case' },
                      { value: 'owner', label: 'Proprietario', sub: 'Ho una casa in Puglia' },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setRole(opt.value)}
                        className="p-3 rounded-card text-left transition-all"
                        style={{
                          border: `2px solid ${role === opt.value ? '#8B3A2A' : '#E8DCCF'}`,
                          background: role === opt.value ? '#FAE6DA' : '#FDFAF5',
                        }}
                      >
                        <p className="text-body-sm font-semibold" style={{ color: '#2C1810' }}>{opt.label}</p>
                        <p className="text-caption" style={{ color: '#8A7560' }}>{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </FormField>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  style={{ background: '#8B3A2A', color: '#FDFAF5', border: 'none', fontWeight: 700, marginTop: '0.5rem' }}
                >
                  Metti il mio nome
                </Button>
              </form>

              <p className="text-caption text-center mt-4" style={{ color: '#8A7560' }}>
                Nessuna email commerciale. Nessuna condivisione con terzi. Solo noi, quando è il momento giusto.
              </p>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
