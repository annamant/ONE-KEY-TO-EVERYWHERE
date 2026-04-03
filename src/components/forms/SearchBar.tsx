import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { cn } from '@/utils/classNames'
import { Input } from '@/components/ui/Input'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...', className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
        rightIcon={
          value ? (
            <button onClick={() => onChange('')} className="hover:text-text-primary">
              <XMarkIcon className="w-4 h-4" />
            </button>
          ) : undefined
        }
      />
    </div>
  )
}
