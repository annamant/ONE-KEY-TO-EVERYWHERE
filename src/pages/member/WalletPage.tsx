import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { SparklesIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockLedger } from '@/services'
import { formatDate } from '@/utils/format'
import { formatMembershipRemaining, membershipRemainingPercent } from '@/utils/membershipRemaining'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import type { LedgerEntryType } from '@/types'
import type { BadgeColor } from '@/components/ui/Badge'

const entryConfig: Record<LedgerEntryType, { label: string; color: BadgeColor }> = {
  membership_credit:  { label: 'Membership', color: 'green' },
  package_credit:     { label: 'Membership top-up', color: 'green' },
  booking_debit:      { label: 'Stay', color: 'amber' },
  cancellation_refund:{ label: 'Returned', color: 'green' },
  modification_refund:{ label: 'Adjustment', color: 'green' },
  modification_debit: { label: 'Adjustment', color: 'amber' },
  admin_correction:   { label: 'Club adjustment', color: 'blue' },
  promo_credit:       { label: 'Promo', color: 'purple' },
  bonus_credit:       { label: 'Bonus', color: 'purple' },
}

export function WalletPage() {
  const { currentUser } = useAuth()

  const { data: wallet, loading: walletLoading } = useMockApi(
    () => mockLedger.getWallet(currentUser!.id),
    [currentUser?.id]
  )
  const { data: entries, loading: entriesLoading } = useMockApi(
    () => mockLedger.listEntries(currentUser!.id, { limit: 50 }),
    [currentUser?.id]
  )

  const remainingPct = wallet
    ? membershipRemainingPercent(wallet.balance, wallet.totalCredited)
    : 0

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Membership</h1>
          <p className="text-body-sm text-text-muted mt-0.5">How much of your membership you still have</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          onClick={() => mockLedger.exportCsv(currentUser!.id)}
        >
          Export history
        </Button>
      </div>

      <div className="mb-8">
        {walletLoading ? (
          <Skeleton className="h-40 rounded-card" />
        ) : wallet ? (
          <Card className="bg-gradient-to-br from-okte-navy-900 to-okte-navy-700 text-white">
            <div className="flex items-start justify-between mb-4">
              <p className="text-body-sm text-okte-navy-200">Membership remaining</p>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-heading-xl font-bold text-white mb-4">
              {formatMembershipRemaining(wallet.balance)}
            </p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${remainingPct}%` }}
              />
            </div>
            <p className="text-caption text-okte-navy-300 mt-3">
              Use it across any Club home, whenever you like. It doesn't expire.
            </p>
          </Card>
        ) : null}
      </div>

      <h2 className="text-heading-md text-text-primary font-semibold mb-4">Activity</h2>

      {entriesLoading ? (
        <PageSpinner />
      ) : !entries || entries.length === 0 ? (
        <div className="text-center py-12 text-text-muted">No activity yet.</div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-okte-slate-50 border-b border-border">
                  <th className="text-left px-5 py-3 font-medium text-text-muted">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-text-muted">Description</th>
                  <th className="text-left px-5 py-3 font-medium text-text-muted">Type</th>
                  <th className="text-right px-5 py-3 font-medium text-text-muted">Membership</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const config = entryConfig[entry.type]
                  return (
                    <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-okte-slate-50/50">
                      <td className="px-5 py-3 text-text-muted whitespace-nowrap">
                        {formatDate(entry.createdAt, 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-3 text-text-primary max-w-xs">
                        <p className="truncate">{entry.description}</p>
                        {entry.adminNote && (
                          <p className="text-caption text-text-muted truncate">{entry.adminNote}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge color={config.color} size="sm">{config.label}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right text-text-muted whitespace-nowrap">
                        {formatMembershipRemaining(entry.balanceAfter).replace(' remaining', '')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
