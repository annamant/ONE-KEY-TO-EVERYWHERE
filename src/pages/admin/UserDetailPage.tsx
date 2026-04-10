import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockUsers, mockBookings, mockLedger } from '@/services'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, formatDateRange } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

const roleColor: Record<string, BadgeColor> = { member: 'blue', owner: 'purple', admin: 'navy' }
const statusColor: Record<string, BadgeColor> = { active: 'green', suspended: 'red', pending_verification: 'amber' }
const bookingColor: Record<string, BadgeColor> = { confirmed: 'blue', active: 'green', completed: 'gray', cancelled: 'red' }

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [unsuspendOpen, setUnsuspendOpen] = useState(false)
  const [acting, setActing] = useState(false)

  const { data: user, loading, refetch } = useMockApi(() => mockUsers.getById(id!), [id])
  const { data: allBookings } = useMockApi(() => mockBookings.adminList(), [])
  const { data: ledger } = useMockApi(
    () => user ? mockLedger.listEntries(user.id) : Promise.resolve([]),
    [user?.id]
  )

  const userBookings = (allBookings ?? []).filter((b) => b.memberId === id)

  const moderate = async (action: 'suspend' | 'restore' | 'verify') => {
    setActing(true)
    try {
      await mockUsers.moderate(id!, action)
      toast(action === 'suspend' ? 'User suspended' : 'User unsuspended', 'success')
      refetch()
    } catch {
      toast('Action failed', 'error')
    } finally {
      setActing(false)
      setSuspendOpen(false)
      setUnsuspendOpen(false)
    }
  }

  if (loading) return <PageSpinner />
  if (!user) return (
    <div className="page-content text-center py-16">
      <p className="text-text-muted">User not found.</p>
    </div>
  )

  return (
    <div className="page-content max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">User Detail</h1>
        <Button variant="outline" onClick={() => navigate('/admin/users')}>Back</Button>
      </div>

      {/* Profile */}
      <Card className="mb-4">
        <div className="flex items-start gap-4">
          <Avatar name={`${user.firstName} ${user.lastName}`} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-heading-md font-semibold text-text-primary">{user.firstName} {user.lastName}</h2>
              <Badge color={roleColor[user.role] ?? 'gray'} size="sm" className="capitalize">{user.role}</Badge>
              <Badge color={statusColor[user.status] ?? 'gray'} size="sm" dot>
                {user.status === 'pending_verification' ? 'Pending' : user.status}
              </Badge>
            </div>
            <p className="text-body-sm text-text-muted mb-1">{user.email}</p>
            {user.phone && <p className="text-body-sm text-text-muted">{user.phone}</p>}
            <p className="text-caption text-text-muted mt-2">Joined {formatDate(user.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            {user.status === 'active' ? (
              <Button variant="danger" size="sm" onClick={() => setSuspendOpen(true)}>Suspend</Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setUnsuspendOpen(true)}>Unsuspend</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Key balance */}
      {user.role === 'member' && (
        <Card className="mb-4">
          <h3 className="text-body-md font-semibold text-text-primary mb-2">Key Balance</h3>
          <p className="text-heading-md font-bold text-okte-gold-600">
            {(ledger ?? []).length > 0 ? (ledger ?? [])[(ledger ?? []).length - 1].balanceAfter : 0} keys
          </p>
          <p className="text-caption text-text-muted">{(ledger ?? []).length} ledger entries</p>
        </Card>
      )}

      {/* Recent bookings */}
      <Card padding="none" className="mb-4">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-body-md font-semibold text-text-primary">Bookings ({userBookings.length})</h3>
        </div>
        {userBookings.length === 0 ? (
          <div className="py-8 text-center text-body-sm text-text-muted">No bookings</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-okte-slate-50">
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">ID</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Dates</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Keys</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {userBookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-body-sm font-mono text-text-muted">{b.id.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-body-sm text-text-muted whitespace-nowrap">{formatDateRange(b.checkIn, b.checkOut)}</td>
                    <td className="px-5 py-3 text-body-sm font-medium text-okte-gold-600">{b.keysCharged}</td>
                    <td className="px-5 py-3"><Badge color={bookingColor[b.status] ?? 'gray'} size="sm">{b.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent ledger */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-body-md font-semibold text-text-primary">Ledger (recent)</h3>
        </div>
        {(ledger ?? []).length === 0 ? (
          <div className="py-8 text-center text-body-sm text-text-muted">No entries</div>
        ) : (
          <ul>
            {(ledger ?? []).slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-body-sm font-medium text-text-primary capitalize">{e.type.replace(/_/g, ' ')}</p>
                  <p className="text-caption text-text-muted">{formatDate(e.createdAt)}</p>
                </div>
                <p className={`text-body-sm font-bold ${e.amount > 0 ? 'text-success' : 'text-danger'}`}>
                  {e.amount > 0 ? '+' : ''}{e.amount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={suspendOpen}
        title="Suspend User"
        message={`Are you sure you want to suspend ${user.firstName} ${user.lastName}? They will not be able to log in.`}
        confirmLabel="Suspend"
        variant="danger"
        loading={acting}
        onConfirm={() => moderate('suspend')}
        onClose={() => setSuspendOpen(false)}
      />
      <ConfirmDialog
        open={unsuspendOpen}
        title="Unsuspend User"
        message={`Restore access for ${user.firstName} ${user.lastName}?`}
        confirmLabel="Unsuspend"
        variant="primary"
        loading={acting}
        onConfirm={() => moderate('restore')}
        onClose={() => setUnsuspendOpen(false)}
      />
    </div>
  )
}
