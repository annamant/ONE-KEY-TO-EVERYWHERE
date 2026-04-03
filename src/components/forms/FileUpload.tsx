import { useRef, useState } from 'react'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/classNames'

interface FileUploadProps {
  value?: File[]
  onChange: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxFiles?: number
  className?: string
}

export function FileUpload({
  value = [],
  onChange,
  multiple = true,
  accept = 'image/*',
  maxFiles = 10,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])
  const [dragging, setDragging] = useState(false)

  const addFiles = (newFiles: File[]) => {
    const combined = [...value, ...newFiles].slice(0, maxFiles)
    onChange(combined)
    const newPreviews = combined.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }))
    setPreviews(newPreviews)
  }

  const removeFile = (index: number) => {
    const updated = value.filter((_, i) => i !== index)
    onChange(updated)
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const files = Array.from(e.dataTransfer.files)
          addFiles(files)
        }}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          dragging
            ? 'border-primary bg-okte-navy-50'
            : 'border-border hover:border-okte-slate-400 hover:bg-okte-slate-50'
        )}
      >
        <PhotoIcon className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-body-sm font-medium text-text-primary">
          Drop images here or <span className="text-primary">click to upload</span>
        </p>
        <p className="text-caption text-text-muted mt-1">
          Up to {maxFiles} images, JPG/PNG/WebP
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {previews.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
              <img
                src={p.url}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
