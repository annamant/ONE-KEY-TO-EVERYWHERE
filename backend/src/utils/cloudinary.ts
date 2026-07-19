import { Readable } from 'node:stream'
import { v2 as cloudinary } from 'cloudinary'

let configured = false

function ensureConfigured(): void {
  if (configured) return
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET
  if (!cloud_name || !api_key || !api_secret) {
    throw Object.assign(new Error('Cloudinary is not configured'), { status: 503 })
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
  configured = true
}

export interface UploadedImage {
  url: string
  publicId: string
  width: number
  height: number
}

export function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
  filename?: string,
  options?: { overwrite?: boolean }
): Promise<UploadedImage> {
  ensureConfigured()
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: filename,
        overwrite: options?.overwrite ?? false,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width ?? 0,
          height: result.height ?? 0,
        })
      }
    )
    Readable.from(buffer).pipe(stream)
  })
}

export async function destroyImage(publicId: string): Promise<void> {
  ensureConfigured()
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
}

/** Extract Cloudinary public_id from a secure_url when possible. */
export function publicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/)
    return match?.[1] ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

/** Only allow image URLs hosted on our configured Cloudinary cloud. */
export function isAllowedImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloud) {
    // In local/dev without Cloudinary, allow https URLs only for seed/demo data.
    return process.env.NODE_ENV !== 'production' && /^https:\/\//i.test(url)
  }
  try {
    const u = new URL(url)
    return (
      u.protocol === 'https:' &&
      (u.hostname === 'res.cloudinary.com' || u.hostname.endsWith('.cloudinary.com')) &&
      u.pathname.includes(`/${cloud}/`)
    )
  } catch {
    return false
  }
}

export function assertAllowedImageUrls(urls: string[], field: string): void {
  for (const url of urls) {
    if (!isAllowedImageUrl(url)) {
      throw Object.assign(new Error(`${field} must be Cloudinary URLs from this account`), { status: 400 })
    }
  }
}
