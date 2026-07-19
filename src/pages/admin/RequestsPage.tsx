import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { adminRequestsService } from '@/services/waitlist'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import {
  UsersIcon,
  HomeModernIcon,
  KeyIcon,
  InboxStackIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline'
import { formatDate } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

type Tab = 'membership' | 'packages' | 'owners' | 'waitlist'

const waitlistStatusColor: Record<string, BadgeColor> = {
  pending: 'amber',
  contacted: 'blue',
  approved: 'green',
  invited: 'green',
  rejected: 'red',
}

export function AdminRequestsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toast } = useToast()
  const [acting, setActing] = useState<string | null>(null)

  const tab = (searchParams.get('tab') as Tab) || 'membership'
  const setTab = (t: Tab) => setSearchParams({ tab: t })

  const { data, loading, refetch } = useMockApi(() => adminRequestsService.list(), [])

  const approveMember = async (id: string) => {
    setActing(id)
    try {
      await adminRequestsService.approveMember(id)
      toast('Member approved — confirmation email sent', 'success')
      refetch()
    } catch {
      toast('Approval failed', 'error')
    } finally {
      setActing(null)
    }
  }

  const updateOwner = async (id: string, status: string) => {
    setActing(id)
    try {
      await adminRequestsService.updateOwnerWaitlist(id, { status })
      toast(`Owner enquiry marked as ${status}`, 'success')
      refetch()
    } catch {
      toast('Update failed', 'error')
    } finally {
      setActing(null)
    }
  }

  const updateMemberWaitlist = async (id: string, status: string) => {
    setActing(id)
    try {
      await adminRequestsService.updateMemberWaitlist(id, { status })
      toast(`Waitlist entry marked as ${status}`, 'success')
      refetch()
    } catch {
      toast('Update failed', 'error')
    } finally {
      setActing(null)
    }
  }

  const fulfillPackage = async (id: string) => {
    setActing(id)
    try {
      await adminRequestsService.fulfillPackageRequest(id)
      toast('Payment confirmed — membership credited', 'success')
      refetch()
    } catch {
      toast('Could not credit package', 'error')
    } finally {
      setActing(null)
    }
  }

  const rejectPackage = async (id: string) => {
    setActing(id)
    try {
      await adminRequestsService.rejectPackageRequest(id)
      toast('Package request rejected', 'success')
      refetch()
    } catch {
      toast('Could not reject request', 'error')
    } finally {
      setActing(null)
    }
  }

  if (loading) return <PageSpinner />

  const counts = data?.counts ?? {
    pendingMembers: 0,
    ownerWaitlist: 0,
    memberWaitlist: 0,
    packageRequests: 0,
    total: 0,
  }

  const tabs: { id: Tab; label: string; count: number; icon: typeof UsersIcon }[] = [
    { id: 'membership', label: 'Membership applications', count: counts.pendingMembers, icon: KeyIcon },
    { id: 'packages', label: 'Package purchases', count: counts.packageRequests, icon: ShoppingBagIcon },
    { id: 'owners', label: 'Owner waitlist', count: counts.ownerWaitlist, icon: HomeModernIcon },
    { id: 'waitlist', label: 'Member interest', count: counts.memberWaitlist, icon: UsersIcon },
  ]

  return (
    <div className="page-content">
      <div className="mb-6">
        <h1 className="text-heading-xl text-text-primary font-semibold">Pending Requests</h1>
        <p className="text-body-sm text-text-muted mt-0.5">
          {counts.total} open {counts.total === 1 ? 'item' : 'items'} across applications, packages, and waitlists
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-body-sm transition-colors ${
              tab === id
                ? 'border-primary bg-okte-navy-50 text-primary font-medium'
                : 'border-border text-text-muted hover:border-okte-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-pill text-caption font-semibold ${
                tab === id ? 'bg-primary text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Membership applications */}
      {tab === 'membership' && (
        <>
          {(data?.pendingMembers ?? []).length === 0 ? (
            <EmptyState
              icon={<KeyIcon className="w-7 h-7" />}
              heading="No pending membership applications"
              subtext="New member signups will appear here for approval."
            />
          ) : (
            <Card padding="none">
              <ul>
                {(data?.pendingMembers ?? []).map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-text-primary">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-caption text-text-muted truncate">{u.email}</p>
                        <p className="text-caption text-text-muted">Applied {formatDate(u.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge color="amber" size="sm" dot>Pending review</Badge>
                      <Button
                        size="sm"
                        loading={acting === u.id}
                        onClick={() => approveMember(u.id)}
                      >
                        Approve & email
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {/* Package purchase requests */}
      {tab === 'packages' && (
        <>
          {(data?.packageRequests ?? []).length === 0 ? (
            <EmptyState
              icon={<ShoppingBagIcon className="w-7 h-7" />}
              heading="No pending package purchases"
              subtext="When members request a membership package, they appear here for payment confirmation and credit."
            />
          ) : (
            <Card padding="none">
              <ul>
                {(data?.packageRequests ?? []).map((req) => (
                  <li
                    key={req.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-body-sm font-medium text-text-primary">
                        {req.member?.firstName} {req.member?.lastName}
                      </p>
                      <p className="text-caption text-text-muted truncate">{req.member?.email}</p>
                      <p className="text-body-sm text-text-primary mt-1">
                        {req.label} · €{req.priceEur.toLocaleString('en-EU')} · {req.units} units
                      </p>
                      <p className="text-caption text-text-muted">
                        Requested {formatDate(req.createdAt)}
                        {req.member?.status === 'pending_verification' ? ' · member still pending approval' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge color="amber" size="sm" dot>Awaiting payment</Badge>
                      <Button
                        size="sm"
                        loading={acting === req.id}
                        onClick={() => fulfillPackage(req.id)}
                      >
                        Mark paid & credit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={acting === req.id}
                        onClick={() => rejectPackage(req.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${req.userId}`)}
                      >
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {/* Owner waitlist */}
      {tab === 'owners' && (
        <>
          {(data?.ownerWaitlist ?? []).length === 0 ? (
            <EmptyState
              icon={<HomeModernIcon className="w-7 h-7" />}
              heading="No owner waitlist enquiries"
              subtext="Property owner submissions from Open Your Doors appear here."
            />
          ) : (
            <div className="space-y-4">
              {(data?.ownerWaitlist ?? []).map((entry) => (
                <Card key={entry.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-body-md font-semibold text-text-primary">
                          {entry.firstName} {entry.lastName ?? ''}
                        </h3>
                        <Badge color="purple" size="sm">Property owner</Badge>
                        <Badge color={waitlistStatusColor[entry.status] ?? 'gray'} size="sm" dot>
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-body-sm text-text-muted">{entry.email}{entry.phone ? ` · ${entry.phone}` : ''}</p>
                      <p className="text-body-sm text-text-primary mt-2">
                        <strong>{entry.city}</strong>
                        {entry.propertyType ? ` · ${entry.propertyType}` : ''}
                      </p>
                      {entry.message && (
                        <p className="text-body-sm text-text-muted mt-2 italic">"{entry.message}"</p>
                      )}
                      <p className="text-caption text-text-muted mt-2">Submitted {formatDate(entry.createdAt)}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {entry.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={acting === entry.id}
                          onClick={() => updateOwner(entry.id, 'contacted')}
                        >
                          Mark contacted
                        </Button>
                      )}
                      {entry.status !== 'approved' && entry.status !== 'rejected' && (
                        <>
                          <Button
                            size="sm"
                            loading={acting === entry.id}
                            onClick={() => updateOwner(entry.id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={acting === entry.id}
                            onClick={() => updateOwner(entry.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Member interest waitlist */}
      {tab === 'waitlist' && (
        <>
          {(data?.memberWaitlist ?? []).length === 0 ? (
            <EmptyState
              icon={<InboxStackIcon className="w-7 h-7" />}
              heading="No member interest submissions"
              subtext="Early interest from the founding members waitlist appears here."
            />
          ) : (
            <Card padding="none">
              <ul>
                {(data?.memberWaitlist ?? []).map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-body-sm font-medium text-text-primary">{entry.firstName}</p>
                        <Badge color="blue" size="sm">Member interest</Badge>
                        <Badge color={waitlistStatusColor[entry.status] ?? 'gray'} size="sm" dot>
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-caption text-text-muted">{entry.email}</p>
                      <p className="text-caption text-text-muted">Submitted {formatDate(entry.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {entry.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          loading={acting === entry.id}
                          onClick={() => updateMemberWaitlist(entry.id, 'contacted')}
                        >
                          Mark contacted
                        </Button>
                      )}
                      {entry.status !== 'invited' && entry.status !== 'rejected' && (
                        <>
                          <Button
                            size="sm"
                            loading={acting === entry.id}
                            onClick={() => updateMemberWaitlist(entry.id, 'invited')}
                          >
                            Invite to apply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            loading={acting === entry.id}
                            onClick={() => updateMemberWaitlist(entry.id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
