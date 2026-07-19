import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { MembershipPricingPicker } from '@/components/membership/MembershipPricingPicker'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useMockApi } from '@/hooks/useMockApi'
import { packageService } from '@/services/packages'
import { ApiError } from '@/services/apiClient'
import type { PackageSelection } from '@/types/membership'
import { formatDate } from '@/utils/format'

export function PackagesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [justRequested, setJustRequested] = useState<PackageSelection | null>(null)
  const autoSubmitted = useRef(false)

  const { data: requests, loading, refetch } = useMockApi(() => packageService.listMine(), [])

  const pending = (requests ?? []).find((r) => r.status === 'pending')

  const handleSelect = async (selection: PackageSelection) => {
    setSubmitting(true)
    try {
      await packageService.request({
        kind: selection.kind,
        groupBand: selection.groupBand,
        weeks: selection.weeks,
        months: selection.months,
      })
      setJustRequested(selection)
      toast('Package request sent', 'success')
      refetch()
      navigate('.', { replace: true, state: null })
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Could not submit package request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // If the member arrived from public /pricing with a selection, submit it once.
  useEffect(() => {
    const selection = (location.state as { selection?: PackageSelection } | null)?.selection
    if (!selection || autoSubmitted.current || loading || pending) return
    autoSubmitted.current = true
    void handleSelect(selection)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot handoff from /pricing
  }, [location.state, loading, pending])

  if (loading) return <PageSpinner />

  if (justRequested || pending) {
    const shown = justRequested ?? {
      label: pending!.label,
      price: pending!.priceEur,
      kind: pending!.kind,
      groupBand: pending!.groupBand,
      units: pending!.units,
    }
    return (
      <div className="page-content max-w-lg mx-auto py-10">
        <Card className="text-center p-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-okte-gold-50">
            <CheckCircleIcon className="w-7 h-7 text-okte-gold-600" />
          </div>
          <h1 className="text-heading-xl font-semibold text-text-primary mb-2">
            Request received
          </h1>
          <p className="text-body-sm text-text-muted mb-6 leading-relaxed">
            You selected <strong className="text-text-primary">{shown.label}</strong>
            {' '}(€{shown.price.toLocaleString('en-EU')}).
            We&apos;ll email payment instructions shortly. Once payment clears, your membership is credited and you can book.
          </p>
          <div className="mb-6 px-4 py-3 rounded-xl bg-okte-slate-50 text-left text-body-sm text-text-muted">
            <p className="font-medium text-text-primary mb-1">What happens next</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Pay the Club invoice for this package</li>
              <li>An admin credits your membership</li>
              <li>Book any Club home with your remaining time</li>
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() =>
                navigate(
                  currentUser?.status === 'pending_verification'
                    ? '/member/pending'
                    : '/member/search'
                )
              }
              variant="outline"
            >
              {currentUser?.status === 'pending_verification' ? 'Back to status' : 'Browse homes'}
            </Button>
            <Button
              onClick={() =>
                navigate(
                  currentUser?.status === 'pending_verification'
                    ? '/member/pending'
                    : '/member/wallet'
                )
              }
            >
              {currentUser?.status === 'pending_verification' ? 'Done for now' : 'View membership'}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const history = (requests ?? []).filter((r) => r.status !== 'pending')

  return (
    <div className="min-h-full" style={{ background: '#FFFFFF' }}>
      <section style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5' }} className="py-12 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-caption font-semibold uppercase tracking-widest mb-4" style={{ color: '#C4882F' }}>
            Membership plans
          </p>
          <h1 className="font-display text-display-lg font-bold mb-4" style={{ color: '#0A0A0A' }}>
            Choose your membership.
          </h1>
          <p className="text-body-lg" style={{ color: '#6B6B6B' }}>
            Pick a package, we&apos;ll send payment details, and your membership is credited once paid.
          </p>
        </div>
      </section>

      <MembershipPricingPicker
        primaryCtaLabel="Request this membership"
        seasonCtaLabel={(label) => `Request ${label.toLowerCase()}`}
        onSelectWeek={handleSelect}
        onSelectSeason={handleSelect}
        submitting={submitting}
      />

      {history.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-heading-md font-semibold text-text-primary mb-4">Past requests</h2>
          <Card padding="none">
            <ul>
              {history.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0">
                  <div>
                    <p className="text-body-sm font-medium text-text-primary">{r.label}</p>
                    <p className="text-caption text-text-muted">
                      €{r.priceEur.toLocaleString('en-EU')} · {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <Badge
                    color={r.status === 'fulfilled' ? 'green' : r.status === 'rejected' ? 'red' : 'gray'}
                    size="sm"
                  >
                    {r.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}
    </div>
  )
}
