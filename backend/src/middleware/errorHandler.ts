import { Request, Response, NextFunction } from 'express'
import { MulterError } from 'multer'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err)
  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 10 MB or smaller' :
      err.code === 'LIMIT_FILE_COUNT' ? 'Too many images (max 10)' :
      'Upload failed'
    res.status(400).json({ error: message })
    return
  }

  const status = (err as { status?: number }).status ?? 500
  const isProd = process.env.NODE_ENV === 'production'
  const message =
    status >= 500 && isProd
      ? 'Internal server error'
      : (err.message || 'Internal server error')

  res.status(status).json({ error: message })
}
