import multer from 'multer'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 5

/** Verify magic bytes match a supported image type. */
export function isValidImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false
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
