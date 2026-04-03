import { useState } from 'react'
import {
  UserGroupIcon,
  PlusIcon,
  UserMinusIcon,
  PencilIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockHouseholds, mockUsers } from '@/mock'
import { formatRelative } from '@/utils/format'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/forms/FormField'
import { Modal } from '@/components/feedback/Modal'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { PageSpinner } from '@/components/ui/Spinner'
import type { HouseholdMemberRole } from '@/types'
import type { BadgeColor } from '@/components/ui/Badge'

const roleColor: Record<HouseholdMemberRole, BadgeColor> = {
  Manager: 'navy',
  Booker: 'blue',
  Viewer: 'gray',
}

export function HouseholdPage() {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [createName, setCreateName] = useState('')
  const [creating, setCreating] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<HouseholdMemberRole>('Booker')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [showAudit, setShowAudit] = useState(false)

  const { data: household, loading, refetch } = useMockApi(
    () => mockHouseholds.getForUser(currentUser!.id),
    [currentUser?.id]
  )
  const { data: auditLog } = useMockApi(
    () => household ? mockHouseholds.getAuditLog(household.id) : Promise.resolve([]),
    [household?.id]
  )
  const { data: allUsers } = useMockApi(() => mockUsers.list(), [])
  const userMap = Object.fromEntries((allUsers ?? []).map((u) => [u.id, u]))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) return
    setCreating(true)
    try {
      await mockHouseholds.create(currentUser!.id, createName.trim())
      toast('Household created!', 'success')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create household', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!household) return
    setInviting(true)
    try {
      const token = await mockHouseholds.invite(household.id, inviteEmail, inviteRole)
      setInviteLink(`${window.location.origin}/member/household/invite/${token}`)
      toast('Invite created!', 'success')
      setInviteEmail('')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Invite failed', 'error')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async () => {
    if (!household || !removeMemberId) return
    setRemoving(true)
    try {
      await mockHouseholds.removeMember(household.id, removeMemberId, currentUser!.id)
      toast('Member removed.', 'success')
      setRemoveMemberId(null)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to remove member', 'error')
    } finally {
      setRemoving(false)
    }
  }

  if (loading) return <PageSpinner />

  if (!household) {
    return (
      <div className="page-content max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-okte-navy-50 flex items-center justify-center mx-auto mb-4">
            <UserGroupIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-heading-xl text-text-primary font-semibold mb-2">Create Your Household</h1>
          <p className="text-body-sm text-text-muted">
            A household lets you share booking access with family and friends.
          </p>
        </div>
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField label="Household name" htmlFor="name" required>
              <Input
                id="name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. The Andersons"
              />
            </FormField>
            <Button type="submit" fullWidth loading={creating}>
              Create Household
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  const activeMembers = household.members.filter((m) => m.status === 'active')
  const isManager = household.ownerId === currentUser!.id

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">{household.name}</h1>
          <p className="text-body-sm text-text-muted">{activeMembers.length} active {activeMembers.length === 1 ? 'member' : 'members'}</p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              leftIcon={<ClipboardDocumentListIcon className="w-4 h-4" />}
              onClick={() => setShowAudit(!showAudit)}
            >
              Audit Log
            </Button>
            <Button
              leftIcon={<PlusIcon className="w-4 h-4" />}
              onClick={() => setInviteOpen(true)}
            >
              Invite Member
            </Button>
          </div>
        )}
      </div>

      {/* Members Table */}
      <Card padding="none" className="mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-border bg-okte-slate-50">
                <th className="text-left px-5 py-3 font-medium text-text-muted">Member</th>
                <th className="text-left px-5 py-3 font-medium text-text-muted">Role</th>
                <th className="text-left px-5 py-3 font-medium text-text-muted">Status</th>
                <th className="text-left px-5 py-3 font-medium text-text-muted">Joined</th>
                {isManager && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody>
              {activeMembers.map((member) => {
                const user = userMap[member.userId]
                return (
                  <tr key={member.userId} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar src={user?.avatarUrl} name={user ? `${user.firstName} ${user.lastName}` : '?'} size="sm" />
                        <div>
                          <p className="font-medium text-text-primary">
                            {user ? `${user.firstName} ${user.lastName}` : member.userId}
                          </p>
                          <p className="text-caption text-text-muted">{user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color={roleColor[member.role]} size="sm">{member.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color="green" size="sm" dot>{member.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{formatRelative(member.joinedAt)}</td>
                    {isManager && (
                      <td className="px-5 py-3 text-right">
                        {member.userId !== currentUser!.id && (
                          <button
                            onClick={() => setRemoveMemberId(member.userId)}
                            className="text-text-muted hover:text-danger transition-colors"
                          >
                            <UserMinusIcon className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pending Invites */}
      {household.invites.filter((i) => !i.usedAt).length > 0 && (
        <div className="mb-6">
          <h2 className="text-heading-md text-text-primary font-semibold mb-3">Pending Invites</h2>
          <Card padding="none">
            <ul>
              {household.invites.filter((i) => !i.usedAt).map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-body-sm font-medium">{inv.email}</p>
                    <p className="text-caption text-text-muted">Invited as {inv.role}</p>
                  </div>
                  <Badge color="amber" size="sm">Pending</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Audit Log */}
      {showAudit && auditLog && (
        <div className="mb-6">
          <h2 className="text-heading-md text-text-primary font-semibold mb-3">Activity Log</h2>
          <Card padding="none">
            <ul>
              {auditLog.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between px-5 py-3 border-b border-border last:border-0">
                  <p className="text-body-sm text-text-primary">{entry.detail}</p>
                  <span className="text-caption text-text-muted ml-4 whitespace-nowrap">{formatRelative(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => { setInviteOpen(false); setInviteLink('') }}
        title="Invite a Member"
        footer={
          !inviteLink ? (
            <>
              <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite} loading={inviting}>Send Invite</Button>
            </>
          ) : (
            <Button onClick={() => { setInviteOpen(false); setInviteLink('') }}>Done</Button>
          )
        }
      >
        {inviteLink ? (
          <div>
            <p className="text-body-sm text-text-muted mb-3">Share this link with your invitee:</p>
            <div className="bg-okte-slate-50 rounded-lg px-3 py-2 font-mono text-caption text-text-primary break-all select-all">
              {inviteLink}
            </div>
            <p className="text-caption text-text-muted mt-2">Link expires in 7 days.</p>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <FormField label="Email address" htmlFor="inviteEmail" required>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="friend@example.com"
              />
            </FormField>
            <FormField label="Role" htmlFor="inviteRole">
              <Select
                id="inviteRole"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as HouseholdMemberRole)}
                options={[
                  { value: 'Manager', label: 'Manager — full control' },
                  { value: 'Booker', label: 'Booker — can make bookings' },
                  { value: 'Viewer', label: 'Viewer — read only' },
                ]}
              />
            </FormField>
          </form>
        )}
      </Modal>

      {/* Remove Confirm */}
      <ConfirmDialog
        open={!!removeMemberId}
        onClose={() => setRemoveMemberId(null)}
        onConfirm={handleRemove}
        loading={removing}
        title="Remove Member"
        message="Are you sure you want to remove this member from the household?"
        confirmLabel="Remove"
      />
    </div>
  )
}
