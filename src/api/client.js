const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOKEN_KEY = 'solarshelf:token'

export async function apiFetch(path, options = {}) {
  const url = `${API_URL}${path}`
  const headers = { ...options.headers }

  const token = localStorage.getItem(TOKEN_KEY)
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`
  }

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

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error(`API retornou conteúdo não-JSON em ${url}`)
  }

  return response.json()
}
