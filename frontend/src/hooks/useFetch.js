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

      // Safely parse JSON only when the server responds with JSON
      const contentType = response.headers.get('content-type') || ''
      let payload
      if (contentType.includes('application/json')) {
        payload = await response.json()
      } else {
        const text = await response.text()
        // If the response is HTML (e.g. an index page or error page), include it in the error
        payload = { message: text }
      }

      if (!response.ok) {
        throw new Error(payload.message || `Request failed with status ${response.status}`)
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
