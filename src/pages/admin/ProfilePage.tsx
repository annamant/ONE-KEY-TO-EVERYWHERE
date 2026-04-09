import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { mockUsers } from '@/services'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FormField } from '@/components/forms/FormField'
import { Divider } from '@/components/ui/Divider'
import { formatDate } from '@/utils/format'

export function AdminProfilePage() {
  const { currentUser, updateCurrentUser, logout } = useAuth()
  const { toast } = useToast()

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? '')
  const [lastName, setLastName] = useState(currentUser?.lastName ?? '')
  const [phone, setPhone] = useState(currentUser?.phone ?? '')
  const [saving, setSaving] = useState(false)

  if (!currentUser) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await mockUsers.update(currentUser.id, { firstName, lastName, phone })
      updateCurrentUser(updated)
      toast('Profile updated!', 'success')
    } catch {
      toast('Failed to save profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-content max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">My Profile</h1>
        <Badge color="navy" size="md">Administrator</Badge>
      </div>

      <Card className="flex items-center gap-4 mb-6">
        <Avatar
          src={currentUser.avatarUrl}
          name={`${currentUser.firstName} ${currentUser.lastName}`}
          size="xl"
        />
        <div>
          <p className="text-heading-md font-semibold text-text-primary">
            {currentUser.firstName} {currentUser.lastName}
          </p>
          <p className="text-body-sm text-text-muted">{currentUser.email}</p>
          <p className="text-caption text-text-muted mt-1">
            Administrator since {formatDate(currentUser.createdAt)}
          </p>
        </div>
      </Card>

      <Card className="mb-6">
        <h2 className="text-heading-md text-text-primary font-semibold mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First name" htmlFor="firstName">
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </FormField>
            <FormField label="Last name" htmlFor="lastName">
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </FormField>
          </div>
          <FormField label="Email address" htmlFor="email">
            <Input id="email" type="email" value={currentUser.email} disabled />
          </FormField>
          <FormField label="Phone number" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+39 080 000 0000"
            />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-heading-md text-text-primary font-semibold mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-text-primary">Access level</p>
              <p className="text-caption text-text-muted">Full platform administration</p>
            </div>
            <Badge color="navy" dot>Admin</Badge>
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-text-primary">Sign out</p>
              <p className="text-caption text-text-muted">Sign out from this device</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>Sign Out</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
