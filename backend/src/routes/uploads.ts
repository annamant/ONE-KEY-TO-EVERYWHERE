import { Router } from 'express'
import { getDb } from '../db/connection'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { imageUpload, avatarUpload, isValidImageBuffer } from '../middleware/upload'
import { uploadImageBuffer } from '../utils/cloudinary'

const router = Router()
const MAX_TEMP_UPLOADS_PER_DAY = 20

/**
 * POST /api/uploads/images
 * multipart field: "images" (1–5 files)
 * Returns: { urls: string[] }
 */
router.post(
  '/images',
  authenticate,
  requireRole('owner', 'admin'),
  imageUpload.array('images', 5),
  async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined
      if (!files?.length) {
        res.status(400).json({ error: 'At least one image file is required' })
        return
      }

      for (const file of files) {
        if (!isValidImageBuffer(file.buffer)) {
          res.status(400).json({ error: 'One or more files are not valid images' })
          return
        }
      }

      // Soft daily quota via notifications table isn't ideal — use settings-less counter in a simple table-less way:
      // Count recent temp uploads by checking Cloudinary folder isn't available offline; use a lightweight settings key.
      const db = getDb()
      const key = `upload_count:${req.user!.userId}:${new Date().toISOString().slice(0, 10)}`
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
      const used = Number(row?.value ?? 0)
      if (used + files.length > MAX_TEMP_UPLOADS_PER_DAY) {
        res.status(429).json({ error: `Daily upload limit of ${MAX_TEMP_UPLOADS_PER_DAY} images reached` })
        return
      }

      const folder = `okte/temp/${req.user!.userId}`
      const uploaded = await Promise.all(
        files.map((file) => uploadImageBuffer(file.buffer, folder))
      )

      const now = new Date().toISOString()
      db.prepare(`
        INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?,?,?,?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).run(key, String(used + files.length), now, req.user!.userId)

      res.status(201).json({ urls: uploaded.map((u) => u.url) })
    } catch (e) {
      next(e)
    }
  }
)

/**
 * POST /api/uploads/avatar
 * multipart field: "avatar" (single image)
 * Returns: { url: string }
 */
router.post(
  '/avatar',
  authenticate,
  avatarUpload.single('avatar'),
  async (req, res, next) => {
    try {
      const file = req.file
      if (!file) {
        res.status(400).json({ error: 'An image file is required' })
        return
      }

      // Cloudinary accepts HEIC and other phone/Google Photos formats; it validates on upload.
      const uploaded = await uploadImageBuffer(
        file.buffer,
        `okte/avatars/${req.user!.userId}`,
        'profile',
        { overwrite: true },
      )

      res.status(201).json({ url: uploaded.url })
    } catch (e) {
      next(e)
    }
  }
)

export default router
