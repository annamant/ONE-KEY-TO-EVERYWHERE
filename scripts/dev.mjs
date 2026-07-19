#!/usr/bin/env node
/**
 * Starts frontend + backend together, picking a free backend port when the
 * default (3201) is taken by another app.
 */
import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const DEFAULT_PORT = 3201

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => server.close(() => resolve(true)))
    server.listen(port, '127.0.0.1')
  })
}

async function isOkteBackend(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(2000),
    })
    if (!(res.headers.get('content-type') ?? '').includes('application/json')) return false
    const data = await res.json()
    return data?.error === 'email and password are required'
  } catch {
    return false
  }
}

async function findAvailablePort(start) {
  for (let port = start; port < start + 50; port++) {
    if (await isPortFree(port)) return port
  }
  throw new Error(`No available port found in range ${start}-${start + 49}`)
}

async function resolveBackendPort() {
  const preferred = Number(process.env.PORT || DEFAULT_PORT)
  if (await isOkteBackend(preferred)) {
    console.log(`✓ Reusing OKTE backend on http://localhost:${preferred}`)
    return { port: preferred, startBackend: false }
  }
  if (await isPortFree(preferred)) {
    return { port: preferred, startBackend: true }
  }
  console.warn(`⚠ Port ${preferred} is in use by another app — searching for a free port…`)
  const port = await findAvailablePort(preferred + 1)
  console.log(`→ Using port ${port} for OKTE backend`)
  return { port, startBackend: true }
}

async function waitForBackend(port, maxMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    if (await isOkteBackend(port)) return
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`Backend did not become ready on port ${port} within ${maxMs}ms`)
}

const { port, startBackend } = await resolveBackendPort()
const backendUrl = `http://localhost:${port}`

const children = []
const shutdown = () => {
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM')
  }
}

process.on('SIGINT', () => {
  shutdown()
  process.exit(0)
})
process.on('SIGTERM', () => {
  shutdown()
  process.exit(0)
})

if (startBackend) {
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(root, 'backend'),
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit',
    shell: true,
  })
  children.push(backend)
  backend.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`Backend exited with code ${code}`)
      shutdown()
      process.exit(code)
    }
  })
  await waitForBackend(port)
  console.log(`✓ OKTE backend ready at ${backendUrl}`)
} else {
  console.log(`✓ Frontend will proxy /api → ${backendUrl}`)
}

const frontend = spawn('npm', ['run', 'dev'], {
  cwd: root,
  env: { ...process.env, OKTE_BACKEND_URL: backendUrl },
  stdio: 'inherit',
  shell: true,
})
children.push(frontend)

frontend.on('exit', (code) => {
  shutdown()
  process.exit(code ?? 0)
})
