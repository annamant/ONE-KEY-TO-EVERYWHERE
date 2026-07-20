import multer, { type FileFilterCallback } from 'multer'
import type { Request } from 'express'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const AVATAR_ALLOWED = new Set([
  ...ALLOWED,
  'image/heic',
  'image/heif',
  'image/jpg',
  'image/pjpeg',
  'image/x-png',
])
const AVATAR_EXT = /\.(jpe?g|png|webp|gif|heic|heif)$/i
const AVATAR_MAX_BYTES = 20 * 1024 * 1024 // 20 MB — phone originals from Google Photos
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 5

function isHeicBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false
  const brand = buffer.toString('ascii', 8, 12)
  return ['heic', 'heix', 'hevc', 'heif', 'mif1'].includes(brand)
}

/** Verify magic bytes match a supported image type. */
export function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false
  if (isHeicBuffer(buffer)) return true
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true
  // PNG
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  ) return true
  // GIF
  if (
    buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46
  ) return true
  // WebP: RIFF....WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return true
  return false
}

function avatarFileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  const mime = file.mimetype.toLowerCase()
  if (AVATAR_ALLOWED.has(mime) || mime.startsWith('image/')) {
    cb(null, true)
    return
  }
  if ((mime === 'application/octet-stream' || mime === '') && AVATAR_EXT.test(file.originalname)) {
    cb(null, true)
    return
  }
  // Google Photos / iPhone downloads often arrive as octet-stream with no extension.
  if (mime === 'application/octet-stream' || mime === '') {
    cb(null, true)
    return
  }
  cb(Object.assign(new Error('Please use a photo file (JPG, PNG, WebP, GIF, or HEIC)'), { status: 400 }))
}

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(Object.assign(new Error('Only JPG, PNG, WebP, and GIF images are allowed'), { status: 400 }))
      return
    }
    cb(null, true)
  },
})

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: AVATAR_MAX_BYTES, files: 1 },
  fileFilter: avatarFileFilter,
})
