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
      err.message
    res.status(400).json({ error: message })
    return
  }
  const status = (err as { status?: number }).status ?? 500
  res.status(status).json({ error: err.message ?? 'Internal server error' })
}
