import { useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/forms/FormField'
import { Divider } from '@/components/ui/Divider'

export function AdminSettingsPage() {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // Platform settings (demo — not persisted to db)
  const [platformName, setPlatformName] = useState('One Key to Everywhere')
  const [supportEmail, setSupportEmail] = useState('support@okte.com')
  const [defaultTier, setDefaultTier] = useState('premium')
  const [maxKeys, setMaxKeys] = useState('500')
  const [minKeys, setMinKeys] = useState('10')
  const [reviewDays, setReviewDays] = useState('2')
  const [cancellationWindow, setCancellationWindow] = useState('48')
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast('Settings saved', 'success')
  }

  return (
    <div className="page-content max-w-2xl">
      <div className="mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">Platform Settings</h1>
        <p className="text-body-sm text-text-muted mt-0.5">Configure global platform behaviour</p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <Card className="space-y-4">
          <h2 className="text-body-md font-semibold text-text-primary">General</h2>
          <FormField label="Platform name">
            <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </FormField>
          <FormField label="Support email">
            <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </FormField>
        </Card>

        {/* Key rules */}
        <Card className="space-y-4">
          <h2 className="text-body-md font-semibold text-text-primary">Key Rules</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Max keys per purchase">
              <Input type="number" min="1" value={maxKeys} onChange={(e) => setMaxKeys(e.target.value)} />
            </FormField>
            <FormField label="Min keys per booking">
              <Input type="number" min="1" value={minKeys} onChange={(e) => setMinKeys(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Default property tier">
            <Select
              value={defaultTier}
              onChange={(e) => setDefaultTier(e.target.value)}
              options={[
                { value: 'standard', label: 'Standard' },
                { value: 'premium', label: 'Premium' },
                { value: 'luxury', label: 'Luxury' },
              ]}
            />
          </FormField>
        </Card>

        {/* Operations */}
        <Card className="space-y-4">
          <h2 className="text-body-md font-semibold text-text-primary">Operations</h2>
          <FormField label="Property review SLA (business days)" hint="Target days to review new listings">
            <Input type="number" min="1" value={reviewDays} onChange={(e) => setReviewDays(e.target.value)} />
          </FormField>
          <FormField label="Cancellation window (hours)" hint="Free cancellation before check-in">
            <Input type="number" min="0" value={cancellationWindow} onChange={(e) => setCancellationWindow(e.target.value)} />
          </FormField>
        </Card>

        {/* Danger zone */}
        <Card className="space-y-4 border-danger/30">
          <h2 className="text-body-md font-semibold text-danger">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-text-primary">Maintenance mode</p>
              <p className="text-caption text-text-muted">Disables member bookings platform-wide</p>
            </div>
            <button
              onClick={() => {
                setMaintenanceMode((v) => !v)
                toast(maintenanceMode ? 'Maintenance mode disabled' : 'Maintenance mode enabled', maintenanceMode ? 'success' : 'error')
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-danger' : 'bg-okte-slate-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-text-primary">Reset mock data</p>
              <p className="text-caption text-text-muted">Clears localStorage and reloads seed data</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
            >
              Reset
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={saving}>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}
