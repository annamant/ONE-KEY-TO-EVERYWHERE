const AVATAR_EXT = /\.(jpe?g|png|webp|gif|heic|heif)$/i
export const AVATAR_MAX_BYTES = 20 * 1024 * 1024

type ImageKind = 'jpeg' | 'png' | 'webp' | 'gif' | 'heic' | 'unknown'

/** Read the first bytes of a File without loading the whole thing into memory. */
export function readFileHead(file: File, bytes = 16): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsArrayBuffer(file.slice(0, bytes))
  })
}

export function sniffImageKind(buffer: ArrayBuffer): ImageKind {
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 12) return 'unknown'

  const brand = String.fromCharCode(bytes[8] ?? 0, bytes[9] ?? 0, bytes[10] ?? 0, bytes[11] ?? 0)
  if (['heic', 'heix', 'hevc', 'heif', 'mif1'].includes(brand)) return 'heic'

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'gif'
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'webp'

  return 'unknown'
}

export async function isAllowedAvatarFile(file: File): Promise<boolean> {
  const mime = file.type.toLowerCase()
  if (mime.startsWith('image/')) return true
  if (AVATAR_EXT.test(file.name)) return true
  const head = await readFileHead(file)
  return sniffImageKind(head) !== 'unknown'
}

/**
 * Resize/re-encode when the browser can decode the image (incl. HEIC on Safari).
 * Falls back to the original file for formats the browser cannot draw (e.g. HEIC in Chrome).
 */
export async function prepareAvatarUpload(file: File): Promise<File> {
  if (!(await isAllowedAvatarFile(file))) {
    throw new Error('Please choose a photo (JPG, PNG, WebP, GIF, or HEIC)')
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error('Photo must be 20 MB or smaller')
  }

  try {
    const bitmap = await createImageBitmap(file)
    const maxDim = 1024
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
    if (blob && blob.size > 0) {
      return new File([blob], 'avatar.jpg', { type: 'image/jpeg', lastModified: file.lastModified })
    }
  } catch {
    // Browser can't decode this format — upload original bytes (Cloudinary handles HEIC).
  }

  return file
}
