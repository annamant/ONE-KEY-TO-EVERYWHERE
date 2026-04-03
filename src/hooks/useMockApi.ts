import { useState, useEffect, useCallback, useRef } from 'react'

export interface MockApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMockApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): MockApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, run])

  return { data, loading, error, refetch: run }
}
