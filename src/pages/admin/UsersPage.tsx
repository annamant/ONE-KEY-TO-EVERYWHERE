import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMockApi } from '@/hooks/useMockApi'
import { mockUsers } from '@/services'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { PageSpinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/feedback/EmptyState'
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/utils/format'
import type { BadgeColor } from '@/components/ui/Badge'

const roleColor: Record<string, BadgeColor> = {
  member: 'blue', owner: 'purple', admin: 'navy',
}
const statusColor: Record<string, BadgeColor> = {
  active: 'green', suspended: 'red', pending_verification: 'amber',
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const { data: users, loading } = useMockApi(() => mockUsers.list(), [])

  const filtered = (users ?? []).filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-heading-xl text-text-primary font-semibold">Users</h1>
          <p className="text-body-sm text-text-muted mt-0.5">{(users ?? []).length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="max-w-xs flex-1">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-1">
          {['all', 'member', 'owner', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-body-sm rounded-lg border capitalize transition-colors ${
                roleFilter === r
                  ? 'border-primary bg-okte-navy-50 text-primary font-medium'
                  : 'border-border text-text-muted hover:border-okte-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<UsersIcon className="w-7 h-7" />} heading="No users found" subtext="Try adjusting your search." />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-okte-slate-50">
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">User</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Role</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-caption font-semibold text-text-muted uppercase">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-okte-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${u.firstName} ${u.lastName}`} size="sm" />
                        <div>
                          <p className="text-body-sm font-medium text-text-primary">{u.firstName} {u.lastName}</p>
                          <p className="text-caption text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={roleColor[u.role] ?? 'gray'} size="sm" className="capitalize">{u.role}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge color={statusColor[u.status] ?? 'gray'} size="sm" dot>
                        {u.status === 'pending_verification' ? 'Pending' : u.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-body-sm text-text-muted">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Button variant="ghost" size="sm">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
