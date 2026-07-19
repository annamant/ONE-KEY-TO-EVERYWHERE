import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { FormField } from '@/components/forms/FormField'
import { useToast } from '@/contexts/ToastContext'
import { api, ApiError } from '@/services/apiClient'

export function ChangePasswordCard() {
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password')
      return
    }

    setSaving(true)
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast('Password updated', 'success')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="text-heading-md text-text-primary font-semibold mb-4">Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Current password" htmlFor="currentPassword" required>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </FormField>
        <FormField label="New password" htmlFor="newPassword" required hint="At least 8 characters">
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Confirm new password" htmlFor="confirmPassword" required>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        {error && <p className="text-caption text-danger">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" loading={saving} disabled={!currentPassword || !newPassword || !confirmPassword}>
            Update password
          </Button>
        </div>
      </form>
    </Card>
  )
}
