import { useEffect, useState } from 'react'
import { useToast } from '@/contexts/ToastContext'
import { settingsService } from '@/services'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/forms/FormField'
import { Divider } from '@/components/ui/Divider'
import { PageSpinner } from '@/components/ui/Spinner'

const DEFAULTS = {
  platformName: 'One Key to Everywhere',
  supportEmail: 'anna@onekeytoeverywhere.com',
  defaultTier: 'premium',
  maxKeys: '500',
  minKeys: '10',
  reviewDays: '2',
  cancellationWindow: '48',
  maintenanceMode: 'false',
}

export function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [platformName, setPlatformName] = useState(DEFAULTS.platformName)
  const [supportEmail, setSupportEmail] = useState(DEFAULTS.supportEmail)
  const [defaultTier, setDefaultTier] = useState(DEFAULTS.defaultTier)
  const [maxKeys, setMaxKeys] = useState(DEFAULTS.maxKeys)
  const [minKeys, setMinKeys] = useState(DEFAULTS.minKeys)
  const [reviewDays, setReviewDays] = useState(DEFAULTS.reviewDays)
  const [cancellationWindow, setCancellationWindow] = useState(DEFAULTS.cancellationWindow)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await settingsService.get()
        if (cancelled) return
        setPlatformName(s.platformName ?? DEFAULTS.platformName)
        setSupportEmail(s.supportEmail ?? DEFAULTS.supportEmail)
        setDefaultTier(s.defaultTier ?? DEFAULTS.defaultTier)
        setMaxKeys(s.maxKeys ?? DEFAULTS.maxKeys)
        setMinKeys(s.minKeys ?? DEFAULTS.minKeys)
        setReviewDays(s.reviewDays ?? DEFAULTS.reviewDays)
        setCancellationWindow(s.cancellationWindow ?? DEFAULTS.cancellationWindow)
        setMaintenanceMode(s.maintenanceMode === 'true')
      } catch {
        // keep defaults if endpoint unavailable
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsService.update({
        platformName,
        supportEmail,
        defaultTier,
        maxKeys,
        minKeys,
        reviewDays,
        cancellationWindow,
        maintenanceMode: String(maintenanceMode),
      })
      toast('Settings saved', 'success')
    } catch {
      toast('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageSpinner />

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

        {/* Membership rules (internal units) */}
        <Card className="space-y-4">
          <h2 className="text-body-md font-semibold text-text-primary">Membership Rules</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Max units per top-up">
              <Input type="number" min="1" value={maxKeys} onChange={(e) => setMaxKeys(e.target.value)} />
            </FormField>
            <FormField label="Min units per stay">
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
