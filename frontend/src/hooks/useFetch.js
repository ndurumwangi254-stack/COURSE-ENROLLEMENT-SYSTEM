import { useCallback, useEffect, useState } from 'react'

export function useFetch(url, options = {}, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    if (!url) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch(url, options)
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.message || 'Failed to fetch data')
      }
      setData(payload)
      return payload
    } catch (err) {
      setError(err.message || 'Fetch failed')
      setData(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [url, JSON.stringify(options), ...deps])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
