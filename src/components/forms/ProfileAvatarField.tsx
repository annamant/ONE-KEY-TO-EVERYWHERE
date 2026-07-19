import { useRef, useState } from 'react'
import { CameraIcon } from '@heroicons/react/24/outline'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { uploadService } from '@/services/uploads'
import { mockUsers } from '@/services'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/utils/classNames'

interface ProfileAvatarFieldProps {
  userId: string
  avatarUrl?: string
  name: string
  onAvatarChange: (avatarUrl?: string) => void
  className?: string
}

export function ProfileAvatarField({
  userId,
  avatarUrl,
  name,
  onAvatarChange,
  className,
}: ProfileAvatarFieldProps) {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast('Please choose a JPG, PNG, WebP, or GIF image', 'error')
      return
    }

    setUploading(true)
    try {
      const { url } = await uploadService.uploadAvatar(file)
      const updated = await mockUsers.update(userId, { avatarUrl: url })
      onAvatarChange(updated.avatarUrl)
      toast('Profile photo updated', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to upload photo', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const updated = await mockUsers.update(userId, { avatarUrl: '' })
      onAvatarChange(updated.avatarUrl)
      toast('Profile photo removed', 'success')
    } catch {
      toast('Failed to remove photo', 'error')
    } finally {
      setRemoving(false)
    }
  }

  const busy = uploading || removing

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="relative group shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed"
        aria-label="Change profile photo"
      >
        <Avatar src={avatarUrl} name={name} size="xl" />
        <span className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 group-disabled:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            <CameraIcon className="w-6 h-6 text-white" />
          )}
        </span>
      </button>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Change photo'}
          </Button>
          {avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => void handleRemove()}
            >
              {removing ? 'Removing…' : 'Remove'}
            </Button>
          )}
        </div>
        <p className="text-caption text-text-muted">JPG, PNG, WebP, or GIF · max 10 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
