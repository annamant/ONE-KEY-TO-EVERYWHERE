import { useState } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { cn } from '@/utils/classNames'
import { Button } from '@/components/ui/Button'

export interface ColumnDef<T> {
  key: string
  header: string
  accessor: (row: T) => React.ReactNode
  sortValue?: (row: T) => string | number
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  pageSize?: number
  onRowClick?: (row: T) => void
  keyExtractor: (row: T) => string
  emptyMessage?: string
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 20,
  onRowClick,
  keyExtractor,
  emptyMessage = 'No results found',
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return 0
    const av = col.sortValue(a)
    const bv = col.sortValue(b)
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const pageData = sortedData.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-body-sm">
          <thead>
            <tr className="bg-okte-slate-50 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-text-muted whitespace-nowrap',
                    col.sortValue && 'cursor-pointer hover:text-text-primary select-none',
                    col.headerClassName
                  )}
                  onClick={col.sortValue ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortValue && sortKey === col.key && (
                      sortDir === 'asc' ? (
                        <ChevronUpIcon className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDownIcon className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-okte-slate-50'
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-4 py-3', col.className)}>
                      {col.accessor(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-body-sm text-text-muted">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
