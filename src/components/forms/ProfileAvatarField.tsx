import { useRef, useState } from 'react'
import { CameraIcon } from '@heroicons/react/24/outline'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { uploadService } from '@/services/uploads'
import { mockUsers } from '@/services'
import { ApiError } from '@/services/apiClient'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AVATAR_MAX_BYTES, prepareAvatarUpload } from '@/utils/imageFile'
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
  const { refreshCurrentUser } = useAuth()
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const displayUrl = previewUrl ?? avatarUrl
  const maxMb = Math.round(AVATAR_MAX_BYTES / (1024 * 1024))

  const handleFile = async (file: File) => {
    let localPreview: string | null = null
    setUploading(true)
    try {
      const prepared = await prepareAvatarUpload(file)
      localPreview = URL.createObjectURL(prepared)
      setPreviewUrl(localPreview)

      const { url } = await uploadService.uploadAvatar(prepared)
      const updated = await mockUsers.update(userId, { avatarUrl: url })
      onAvatarChange(updated.avatarUrl)
      await refreshCurrentUser()
      setPreviewUrl(null)
      toast('Profile photo updated', 'success')
    } catch (err) {
      setPreviewUrl(null)
      const message =
        err instanceof ApiError ? err.message :
        err instanceof Error ? err.message :
        'Failed to upload photo'
      toast(message, 'error')
    } finally {
      if (localPreview) URL.revokeObjectURL(localPreview)
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const updated = await mockUsers.update(userId, { avatarUrl: '' })
      onAvatarChange(updated.avatarUrl)
      await refreshCurrentUser()
      setPreviewUrl(null)
      toast('Profile photo removed', 'success')
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message :
        err instanceof Error ? err.message :
        'Failed to remove photo'
      toast(message, 'error')
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
        <Avatar src={displayUrl} name={name} size="xl" />
        <span className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 group-disabled:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Spinner size="sm" className="text-white border-white/30 border-t-white" />
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
          {(avatarUrl || previewUrl) && (
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
        <p className="text-caption text-text-muted">
          JPG, PNG, WebP, GIF, or HEIC (incl. Google Photos) · max {maxMb} MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
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
