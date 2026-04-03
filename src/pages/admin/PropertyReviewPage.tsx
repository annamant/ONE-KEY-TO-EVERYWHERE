import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockProperties, mockUsers } from '@/mock'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { FormField } from '@/components/forms/FormField'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { PageSpinner } from '@/components/ui/Spinner'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

const statusConfig: Record<string, { label: string; color: BadgeColor }> = {
  draft: { label: 'Draft', color: 'gray' },
  pending_approval: { label: 'Pending Review', color: 'amber' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  suspended: { label: 'Suspended', color: 'red' },
}

export function AdminPropertyReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [acting, setActing] = useState(false)

  const { data: property, loading, refetch } = useMockApi(() => mockProperties.getById(id!), [id])
  const { data: owner } = useMockApi(
    () => property ? mockUsers.getById(property.ownerId) : Promise.resolve(null),
    [property?.ownerId]
  )

  const setStatus = async (status: 'approved' | 'rejected') => {
    setActing(true)
    try {
      await mockProperties.setStatus(id!, status)
      toast(status === 'approved' ? 'Property approved!' : 'Property rejected', status === 'approved' ? 'success' : 'error')
      refetch()
    } catch {
      toast('Action failed', 'error')
    } finally {
      setActing(false)
      setApproveOpen(false)
      setRejectOpen(false)
    }
  }

  if (loading) return <PageSpinner />
  if (!property) return (
    <div className="page-content text-center py-16">
      <p className="text-text-muted">Property not found.</p>
    </div>
  )

  const sc = statusConfig[property.status] ?? { label: property.status, color: 'gray' as BadgeColor }

  return (
    <div className="page-content max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Property Review</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={sc.color} size="sm">{sc.label}</Badge>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/properties')}>Back</Button>
      </div>

      {/* Images */}
      <div className="mb-4 rounded-xl overflow-hidden h-64">
        <img src={property.coverImage} alt={property.title} className="w-full h-full object-cover" />
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-3">Property Information</h2>
          <dl className="space-y-2">
            {[
              { label: 'Title', value: property.title },
              { label: 'Location', value: `${property.city}, ${property.country}` },
              { label: 'Region', value: property.region },
              { label: 'Tier', value: property.tier },
              { label: 'Sleeps', value: String(property.sleeps) },
              { label: 'Bedrooms', value: String(property.bedrooms) },
              { label: 'Bathrooms', value: String(property.bathrooms) },
              { label: 'Keys/night', value: String(property.keysPerNight) },
              { label: 'Min stay', value: `${property.minStay} nights` },
              { label: 'Max stay', value: `${property.maxStay} nights` },
              { label: 'Submitted', value: formatDate(property.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4 text-body-sm">
                <dt className="text-text-muted w-28 flex-shrink-0">{label}</dt>
                <dd className="font-medium text-text-primary capitalize">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Description */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-2">Description</h2>
          <p className="text-body-sm text-text-muted">{property.description}</p>
        </Card>

        {/* Amenities */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-3">Amenities</h2>
          {property.amenities.length === 0 ? (
            <p className="text-body-sm text-text-muted">None listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <span key={a} className="px-2.5 py-1 bg-okte-slate-100 text-text-muted text-caption rounded-full capitalize">
                  {a.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* House Rules */}
        {property.houseRules.length > 0 && (
          <Card>
            <h2 className="text-body-md font-semibold text-text-primary mb-3">House Rules</h2>
            <ul className="space-y-1">
              {property.houseRules.map((r, i) => (
                <li key={i} className="text-body-sm text-text-muted flex gap-2">
                  <span className="text-text-muted">•</span> {r}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Owner */}
        <Card>
          <h2 className="text-body-md font-semibold text-text-primary mb-3">Owner</h2>
          {owner ? (
            <div>
              <p className="text-body-sm font-medium text-text-primary">{owner.firstName} {owner.lastName}</p>
              <p className="text-body-sm text-text-muted">{owner.email}</p>
            </div>
          ) : (
            <p className="text-body-sm text-text-muted">{property.ownerId}</p>
          )}
        </Card>

        {/* Actions */}
        {property.status === 'pending_approval' && (
          <div className="flex gap-3">
            <Button
              leftIcon={<CheckCircleIcon className="w-4 h-4" />}
              onClick={() => setApproveOpen(true)}
              fullWidth
            >
              Approve
            </Button>
            <Button
              variant="danger"
              leftIcon={<XCircleIcon className="w-4 h-4" />}
              onClick={() => setRejectOpen(true)}
              fullWidth
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={approveOpen}
        title="Approve Property"
        message={`Approve "${property.title}"? It will immediately go live on the platform.`}
        confirmLabel="Approve"
        variant="primary"
        loading={acting}
        onConfirm={() => setStatus('approved')}
        onClose={() => setApproveOpen(false)}
      />

      <ConfirmDialog
        open={rejectOpen}
        title="Reject Property"
        message={`Reject "${property.title}"? The owner will be notified.`}
        confirmLabel="Reject"
        variant="danger"
        loading={acting}
        onConfirm={() => setStatus('rejected')}
        onClose={() => setRejectOpen(false)}
      />
    </div>
  )
}
