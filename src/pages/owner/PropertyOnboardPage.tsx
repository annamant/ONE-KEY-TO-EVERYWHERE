import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { mockProperties } from '@/mock'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/forms/FormField'
import { FileUpload } from '@/components/forms/FileUpload'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/classNames'
import type { PropertyTier } from '@/types'

const STEPS = ['Basic Info', 'Location', 'Amenities', 'Photos', 'Review & Submit']

const AMENITY_OPTIONS = [
  'pool', 'wifi', 'beach_access', 'ski_access', 'hot_tub', 'kitchen',
  'fireplace', 'garden', 'gym', 'parking', 'sauna', 'spa',
  'chef', 'breakfast', 'yoga', 'bicycle', 'kayak', 'hiking',
]

interface FormData {
  title: string
  description: string
  region: string
  country: string
  city: string
  address: string
  sleeps: string
  bedrooms: string
  bathrooms: string
  tier: PropertyTier
  keysPerNight: string
  minStay: string
  maxStay: string
  amenities: string[]
  houseRules: string
  images: File[]
}

const initialForm: FormData = {
  title: '', description: '', region: '', country: '', city: '', address: '',
  sleeps: '4', bedrooms: '2', bathrooms: '1', tier: 'premium', keysPerNight: '4',
  minStay: '2', maxStay: '14', amenities: [], houseRules: '', images: [],
}

export function PropertyOnboardPage() {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof FormData, value: string | string[] | File[]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const toggleAmenity = (a: string) =>
    set('amenities', form.amenities.includes(a)
      ? form.amenities.filter((x) => x !== a)
      : [...form.amenities, a]
    )

  const validateStep = (): boolean => {
    if (step === 0) return !!(form.title && form.description && form.region && form.sleeps)
    if (step === 1) return !!(form.city && form.country)
    return true
  }

  const handleNext = () => {
    if (!validateStep()) { toast('Please fill in required fields', 'error'); return }
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await mockProperties.create(currentUser!.id, {
        title: form.title,
        slug: form.title.toLowerCase().replace(/\s+/g, '-'),
        description: form.description,
        region: form.region,
        country: form.country,
        city: form.city,
        address: form.address,
        latitude: 0, longitude: 0,
        sleeps: parseInt(form.sleeps),
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseInt(form.bathrooms),
        tier: form.tier,
        keysPerNight: parseInt(form.keysPerNight),
        amenities: form.amenities,
        houseRules: form.houseRules.split('\n').filter(Boolean),
        coverImage: `https://picsum.photos/seed/${Date.now()}/800/600`,
        images: [`https://picsum.photos/seed/${Date.now()}/800/600`],
        minStay: parseInt(form.minStay),
        maxStay: parseInt(form.maxStay),
        blackoutDates: [],
      })
      toast('Property submitted for review!', 'success')
      navigate('/owner/properties')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create property', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-content max-w-2xl">
      <div className="mb-8">
        <h1 className="text-heading-xl text-text-primary font-semibold mb-1">List Your Property</h1>
        <p className="text-body-sm text-text-muted">Complete all steps to submit for review</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-caption font-bold transition-colors flex-shrink-0',
              i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-white' : 'bg-okte-slate-100 text-text-muted'
            )}>
              {i < step ? <CheckIcon className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-2', i < step ? 'bg-success' : 'bg-okte-slate-200')} />
            )}
          </div>
        ))}
      </div>
      <p className="text-body-sm font-medium text-text-primary mb-6">{STEPS[step]}</p>

      <Card>
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <FormField label="Property title" required>
              <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Tuscan Hilltop Villa" />
            </FormField>
            <FormField label="Description" required>
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Describe your property..." />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Region" required>
                <Select value={form.region} onChange={(e) => set('region', e.target.value)}
                  options={['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'].map((r) => ({ value: r, label: r }))}
                  placeholder="Select region"
                />
              </FormField>
              <FormField label="Tier">
                <Select value={form.tier} onChange={(e) => set('tier', e.target.value as PropertyTier)}
                  options={[
                    { value: 'standard', label: 'Standard' },
                    { value: 'premium', label: 'Premium' },
                    { value: 'luxury', label: 'Luxury' },
                  ]}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['sleeps', 'bedrooms', 'bathrooms', 'keysPerNight'] as const).map((f) => (
                <FormField key={f} label={f === 'keysPerNight' ? 'Keys/night' : f.charAt(0).toUpperCase() + f.slice(1)} required={f === 'sleeps'}>
                  <Input type="number" min="1" value={form[f]} onChange={(e) => set(f, e.target.value)} />
                </FormField>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Min stay (nights)">
                <Input type="number" min="1" value={form.minStay} onChange={(e) => set('minStay', e.target.value)} />
              </FormField>
              <FormField label="Max stay (nights)">
                <Input type="number" min="1" value={form.maxStay} onChange={(e) => set('maxStay', e.target.value)} />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="City" required>
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Florence" />
              </FormField>
              <FormField label="Country" required>
                <Input value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Italy" />
              </FormField>
            </div>
            <FormField label="Full address">
              <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Via Roma 12, Florence" />
            </FormField>
          </div>
        )}

        {/* Step 2: Amenities */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-body-sm text-text-muted">Select all amenities available at your property:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-body-sm capitalize transition-colors text-left',
                    form.amenities.includes(a)
                      ? 'bg-okte-navy-50 border-primary text-primary font-medium'
                      : 'border-border text-text-muted hover:border-okte-slate-400'
                  )}
                >
                  {form.amenities.includes(a) && <CheckIcon className="w-3.5 h-3.5 flex-shrink-0" />}
                  {a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <FormField label="House rules" hint="One rule per line">
              <Textarea
                value={form.houseRules}
                onChange={(e) => set('houseRules', e.target.value)}
                placeholder="No smoking&#10;No pets&#10;Quiet after 10pm"
                rows={4}
              />
            </FormField>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div>
            <p className="text-body-sm text-text-muted mb-4">Upload high-quality photos of your property (up to 10).</p>
            <FileUpload
              value={form.images}
              onChange={(files) => set('images', files)}
              maxFiles={10}
            />
            <p className="text-caption text-text-muted mt-3">
              Note: In demo mode, placeholder images will be used for the listing.
            </p>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-body-md font-semibold text-text-primary">Review your listing</h3>
            <div className="space-y-3 text-body-sm">
              {[
                { label: 'Title', value: form.title },
                { label: 'Region', value: form.region },
                { label: 'Location', value: `${form.city}, ${form.country}` },
                { label: 'Sleeps', value: form.sleeps },
                { label: 'Bedrooms', value: form.bedrooms },
                { label: 'Keys/night', value: form.keysPerNight },
                { label: 'Tier', value: form.tier },
                { label: 'Amenities', value: form.amenities.join(', ') || 'None selected' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <span className="text-text-muted w-28 flex-shrink-0">{label}</span>
                  <span className="text-text-primary font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-okte-gold-50 rounded-lg">
              <p className="text-body-sm text-okte-gold-800">
                <strong>Heads up:</strong> Your property will be reviewed by our admin team before going live. This typically takes 1–2 business days.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={step === 0 ? () => navigate('/owner/properties') : () => setStep((s) => s - 1)}
        >
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext}>Next: {STEPS[step + 1]}</Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting}>Submit for Review</Button>
        )}
      </div>
    </div>
  )
}
