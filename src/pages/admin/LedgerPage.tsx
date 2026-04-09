import { useState } from 'react'
import { useMockApi } from '@/hooks/useMockApi'
import { useToast } from '@/contexts/ToastContext'
import { mockLedger, mockUsers } from '@/services'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/feedback/Modal'
import { FormField } from '@/components/forms/FormField'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

const typeColor: Record<string, BadgeColor> = {
  membership_credit: 'green',
  package_credit: 'green',
  promo_credit: 'green',
  bonus_credit: 'green',
  booking_debit: 'red',
  modification_debit: 'red',
  cancellation_refund: 'blue',
  modification_refund: 'blue',
  admin_correction: 'purple',
}

export function AdminLedgerPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [correctionOpen, setCorrectionOpen] = useState(false)
  const [corrUserId, setCorrUserId] = useState('')
  const [corrAmount, setCorrAmount] = useState('')
  const [corrDir, setCorrDir] = useState<'credit' | 'debit'>('credit')
  const [corrNote, setCorrNote] = useState('')
  const [acting, setActing] = useState(false)

  const { data: entries, loading, refetch } = useMockApi(() => mockLedger.adminList(), [])
  const { data: users } = useMockApi(() => mockUsers.list(), [])

  const filtered = (entries ?? []).filter((e) => {
    if (!search) return true
    const q = search.toLowerCase()
    const user = (users ?? []).find((u) => u.id === e.userId)
    return (
      e.id.toLowerCase().includes(q) ||
      e.type.toLowerCase().includes(q) ||
      (user?.email ?? '').toLowerCase().includes(q)
    )
  })

  const handleCorrection = async () => {
    if (!corrUserId || !corrAmount) return
    setActing(true)
    try {
      const amount = parseInt(corrAmount)
      if (corrDir === 'credit') {
        await mockLedger.credit(corrUserId, amount, corrNote || 'Admin correction', 'admin_correction')
      } else {
        await mockLedger.debit(corrUserId, amount, corrNote || 'Admin correction', undefined, 'admin_correction')
      }
      toast('Correction applied', 'success')
      refetch()
      setCorrectionOpen(false)
      setCorrUserId('')
      setCorrAmount('')
      setCorrNote('')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Correction failed', 'error')
    } finally {
      setActing(false)
    }
  }

  const totalKeys = (entries ?? []).reduce((s, e) => s + e.amount, 0)

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Ledger</h1>
          <p className="text-body-sm text-text-muted mt-0.5">{(entries ?? []).length} entries · {totalKeys} net keys</p>
        </div>
        <Button leftIcon={<PlusIcon className="w-4 h-4" />} onClick={() => setCorrectionOpen(true)}>
          Add Correction
        </Button>
      </div>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search by user email or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState heading="No ledger entries" subtext="Corrections and transactions will appear here." />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-okte-slate-50">
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">ID</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">User</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Type</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Amount</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Note</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const user = (users ?? []).find((u) => u.id === e.userId)
                  const isCredit = e.amount > 0
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 text-body-sm font-mono text-text-muted">{e.id.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-body-sm text-text-muted">{user?.email ?? e.userId.slice(0, 8)}</td>
                      <td className="px-5 py-3">
                        <Badge color={typeColor[e.type] ?? 'gray'} size="sm">
                          {e.type.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className={`px-5 py-3 text-body-sm font-bold ${isCredit ? 'text-success' : 'text-danger'}`}>
                        {e.amount > 0 ? '+' : ''}{e.amount}
                      </td>
                      <td className="px-5 py-3 text-body-sm text-text-muted max-w-xs truncate">{e.description ?? '—'}</td>
                      <td className="px-5 py-3 text-body-sm text-text-muted whitespace-nowrap">{formatDate(e.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Correction Modal */}
      <Modal
        open={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        title="Add Ledger Correction"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setCorrectionOpen(false)}>Cancel</Button>
            <Button onClick={handleCorrection} loading={acting} disabled={!corrUserId || !corrAmount}>Apply</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="User" required>
            <Select
              value={corrUserId}
              onChange={(e) => setCorrUserId(e.target.value)}
              placeholder="Select user"
              options={(users ?? [])
                .filter((u) => u.role === 'member')
                .map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.email})` }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Direction">
              <Select
                value={corrDir}
                onChange={(e) => setCorrDir(e.target.value as 'credit' | 'debit')}
                options={[{ value: 'credit', label: 'Credit (+)' }, { value: 'debit', label: 'Debit (−)' }]}
              />
            </FormField>
            <FormField label="Amount (keys)" required>
              <Input
                type="number"
                min="1"
                value={corrAmount}
                onChange={(e) => setCorrAmount(e.target.value)}
                placeholder="10"
              />
            </FormField>
          </div>
          <FormField label="Note">
            <Textarea
              value={corrNote}
              onChange={(e) => setCorrNote(e.target.value)}
              rows={2}
              placeholder="Reason for correction..."
            />
          </FormField>
          <p className="text-caption text-warning">Corrections are immutable entries — they cannot be deleted.</p>
        </div>
      </Modal>
    </div>
  )
}
