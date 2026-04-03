import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties } from '@/mock'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/forms/FormField'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import type { PropertyTier } from '@/types'

const AMENITY_OPTIONS = [
  'pool', 'wifi', 'beach_access', 'ski_access', 'hot_tub', 'kitchen',
  'fireplace', 'garden', 'gym', 'parking', 'sauna', 'spa',
  'chef', 'breakfast', 'yoga', 'bicycle', 'kayak', 'hiking',
]

export function PropertyEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const { data: property, loading } = useMockApi(() => mockProperties.getById(id!), [id])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sleeps, setSleeps] = useState('4')
  const [bedrooms, setBedrooms] = useState('2')
  const [bathrooms, setBathrooms] = useState('1')
  const [tier, setTier] = useState<PropertyTier>('premium')
  const [keysPerNight, setKeysPerNight] = useState('4')
  const [amenities, setAmenities] = useState<string[]>([])
  const [houseRules, setHouseRules] = useState('')
  const [minStay, setMinStay] = useState('2')
  const [maxStay, setMaxStay] = useState('14')

  useEffect(() => {
    if (property) {
      setTitle(property.title)
      setDescription(property.description)
      setSleeps(String(property.sleeps))
      setBedrooms(String(property.bedrooms))
      setBathrooms(String(property.bathrooms))
      setTier(property.tier)
      setKeysPerNight(String(property.keysPerNight))
      setAmenities(property.amenities)
      setHouseRules(property.houseRules.join('\n'))
      setMinStay(String(property.minStay))
      setMaxStay(String(property.maxStay))
    }
  }, [property])

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a])

  const handleSave = async () => {
    setSaving(true)
    try {
      await mockProperties.update(id!, {
        title, description,
        sleeps: parseInt(sleeps), bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms), tier,
        keysPerNight: parseInt(keysPerNight), amenities,
        houseRules: houseRules.split('\n').filter(Boolean),
        minStay: parseInt(minStay), maxStay: parseInt(maxStay),
      })
      toast('Property updated!', 'success')
      navigate('/owner/properties')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSpinner />
  if (!property) return (
    <div className="page-content text-center py-16">
      <p className="text-text-muted">Property not found.</p>
    </div>
  )

  return (
    <div className="page-content max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">Edit Property</h1>
        <Button variant="outline" onClick={() => navigate('/owner/properties')}>Cancel</Button>
      </div>

      <Card className="space-y-4 mb-6">
        <h2 className="text-body-md font-semibold text-text-primary">Basic Information</h2>
        <FormField label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tier">
            <Select value={tier} onChange={(e) => setTier(e.target.value as PropertyTier)}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'premium', label: 'Premium' },
                { value: 'luxury', label: 'Luxury' },
              ]}
            />
          </FormField>
          <FormField label="Keys / night">
            <Input type="number" min="1" value={keysPerNight} onChange={(e) => setKeysPerNight(e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Sleeps">
            <Input type="number" min="1" value={sleeps} onChange={(e) => setSleeps(e.target.value)} />
          </FormField>
          <FormField label="Bedrooms">
            <Input type="number" min="1" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
          </FormField>
          <FormField label="Bathrooms">
            <Input type="number" min="1" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Min stay (nights)">
            <Input type="number" min="1" value={minStay} onChange={(e) => setMinStay(e.target.value)} />
          </FormField>
          <FormField label="Max stay (nights)">
            <Input type="number" min="1" value={maxStay} onChange={(e) => setMaxStay(e.target.value)} />
          </FormField>
        </div>
      </Card>

      <Card className="space-y-4 mb-6">
        <h2 className="text-body-md font-semibold text-text-primary">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AMENITY_OPTIONS.map((a) => (
            <label key={a} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={amenities.includes(a)}
                onChange={() => toggleAmenity(a)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-body-sm capitalize text-text-primary">{a.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 mb-6">
        <h2 className="text-body-md font-semibold text-text-primary">House Rules</h2>
        <FormField label="Rules" hint="One rule per line">
          <Textarea value={houseRules} onChange={(e) => setHouseRules(e.target.value)} rows={4} placeholder="No smoking&#10;No pets" />
        </FormField>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving}>Save Changes</Button>
      </div>
    </div>
  )
}
