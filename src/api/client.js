const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`
  const headers = { ...options.headers }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(text || `Erro ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
