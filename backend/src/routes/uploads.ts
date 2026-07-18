import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/requireRole'
import { imageUpload } from '../middleware/upload'
import { uploadImageBuffer } from '../utils/cloudinary'

const router = Router()

/**
 * POST /api/uploads/images
 * multipart field: "images" (1–10 files)
 * Returns: { urls: string[] }
 */
router.post(
  '/images',
  authenticate,
  requireRole('owner', 'admin'),
  imageUpload.array('images', 10),
  async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined
      if (!files?.length) {
        res.status(400).json({ error: 'At least one image file is required' })
        return
      }

      const folder = `okte/properties/${req.user!.userId}`
      const uploaded = await Promise.all(
        files.map((file) => uploadImageBuffer(file.buffer, folder))
      )

      res.status(201).json({ urls: uploaded.map((u) => u.url) })
    } catch (e) {
      next(e)
    }
  }
)

export default router
