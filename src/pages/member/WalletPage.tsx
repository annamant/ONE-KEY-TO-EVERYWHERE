import { ArrowDownIcon, ArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { KeyIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/contexts/AuthContext'
import { useMockApi } from '@/hooks/useMockApi'
import { mockLedger } from '@/services'
import { formatDate, formatKeys } from '@/utils/format'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import type { LedgerEntryType } from '@/types'
import type { BadgeColor } from '@/components/ui/Badge'

const entryConfig: Record<LedgerEntryType, { label: string; color: BadgeColor; sign: '+' | '−' }> = {
  membership_credit:  { label: 'Membership', color: 'green', sign: '+' },
  package_credit:     { label: 'Key Package', color: 'green', sign: '+' },
  booking_debit:      { label: 'Booking', color: 'amber', sign: '−' },
  cancellation_refund:{ label: 'Refund', color: 'green', sign: '+' },
  modification_refund:{ label: 'Mod Refund', color: 'green', sign: '+' },
  modification_debit: { label: 'Mod Charge', color: 'amber', sign: '−' },
  admin_correction:   { label: 'Admin Credit', color: 'blue', sign: '+' },
  promo_credit:       { label: 'Promo', color: 'purple', sign: '+' },
  bonus_credit:       { label: 'Bonus', color: 'purple', sign: '+' },
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

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Key Wallet</h1>
          <p className="text-body-sm text-text-muted mt-0.5">Your balance and transaction history</p>
        </div>
        <Button
          variant="outline"
          leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          onClick={() => mockLedger.exportCsv(currentUser!.id)}
        >
          Export CSV
        </Button>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {walletLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-card" />)
        ) : wallet ? (
          <>
            <Card className="bg-gradient-to-br from-okte-navy-900 to-okte-navy-700 text-white">
              <div className="flex items-start justify-between mb-4">
                <p className="text-body-sm text-okte-navy-200">Current Balance</p>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <KeyIcon className="w-5 h-5 text-accent" />
                </div>
              </div>
              <p className="text-display-lg font-bold text-white">{wallet.balance}</p>
              <p className="text-body-sm text-okte-navy-300 mt-1">keys available</p>
            </Card>
            <Card>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-success-light flex items-center justify-center">
                  <ArrowUpIcon className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-caption text-text-muted">Total Credited</p>
                  <p className="text-heading-lg font-semibold text-text-primary">{wallet.totalCredited}</p>
                </div>
              </div>
              <p className="text-caption text-text-muted">all-time keys received</p>
            </Card>
            <Card>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-warning-light flex items-center justify-center">
                  <ArrowDownIcon className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-caption text-text-muted">Total Spent</p>
                  <p className="text-heading-lg font-semibold text-text-primary">{wallet.totalDebited}</p>
                </div>
              </div>
              <p className="text-caption text-text-muted">all-time keys used</p>
            </Card>
          </>
        ) : null}
      </div>

      {/* Ledger */}
      <h2 className="text-heading-md text-text-primary font-semibold mb-4">Transaction History</h2>

      {entriesLoading ? (
        <PageSpinner />
      ) : !entries || entries.length === 0 ? (
        <div className="text-center py-12 text-text-muted">No transactions yet.</div>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="bg-okte-slate-50 border-b border-border">
                  <th className="text-left px-5 py-3 font-medium text-text-muted">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-text-muted">Description</th>
                  <th className="text-left px-5 py-3 font-medium text-text-muted">Type</th>
                  <th className="text-right px-5 py-3 font-medium text-text-muted">Amount</th>
                  <th className="text-right px-5 py-3 font-medium text-text-muted">Balance</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const config = entryConfig[entry.type]
                  const isCredit = entry.amount > 0
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
                      <td className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${isCredit ? 'text-success' : 'text-warning'}`}>
                        {isCredit ? '+' : '−'}{Math.abs(entry.amount)}
                      </td>
                      <td className="px-5 py-3 text-right text-text-muted whitespace-nowrap">
                        {formatKeys(entry.balanceAfter)}
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
