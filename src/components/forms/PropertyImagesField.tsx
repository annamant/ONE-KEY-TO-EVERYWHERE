import { useRef, useState } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classNames'
import { Spinner } from '@/components/ui/Spinner'

interface PropertyImagesFieldProps {
  images: string[]
  coverImage?: string
  maxFiles?: number
  uploading?: boolean
  onUpload: (files: File[]) => void | Promise<void>
  onRemove: (url: string) => void | Promise<void>
  className?: string
}

export function PropertyImagesField({
  images,
  coverImage,
  maxFiles = 10,
  uploading = false,
  onUpload,
  onRemove,
  className,
}: PropertyImagesFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [removingUrl, setRemovingUrl] = useState<string | null>(null)

  const remaining = Math.max(0, maxFiles - images.length)

  const handleFiles = async (fileList: File[]) => {
    if (!fileList.length || remaining === 0 || uploading) return
    await onUpload(fileList.slice(0, remaining))
  }

  const handleRemove = async (url: string) => {
    setRemovingUrl(url)
    try {
      await onRemove(url)
    } finally {
      setRemovingUrl(null)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden group bg-okte-slate-100">
              <img src={url} alt="Property" className="w-full h-full object-cover" />
              {(coverImage === url || (!coverImage && images[0] === url)) && (
                <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <button
                type="button"
                disabled={removingUrl === url || uploading}
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:opacity-50"
              >
                {removingUrl === url ? (
                  <Spinner size="sm" />
                ) : (
                  <XMarkIcon className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void handleFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/')))
          }}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            uploading ? 'cursor-wait opacity-70' : 'cursor-pointer',
            dragging
              ? 'border-primary bg-okte-navy-50'
              : 'border-border hover:border-okte-slate-400 hover:bg-okte-slate-50'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner />
              <p className="text-body-sm text-text-muted">Uploading…</p>
            </div>
          ) : (
            <>
              <PhotoIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-body-sm font-medium text-text-primary">
                Drop images here or <span className="text-primary">click to upload</span>
              </p>
              <p className="text-caption text-text-muted mt-1">
                Up to {remaining} more · JPG/PNG/WebP · max 10 MB each
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={uploading || remaining === 0}
        onChange={(e) => {
          if (e.target.files) void handleFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
    </div>
  )
}
