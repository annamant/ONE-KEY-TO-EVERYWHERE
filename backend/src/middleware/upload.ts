import multer from 'multer'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_FILES = 10

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
