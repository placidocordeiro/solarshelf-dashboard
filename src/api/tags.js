import { apiFetch } from './client'

export function listarTags({ produtoId, lote, incluirInativas } = {}) {
  const params = new URLSearchParams()

  if (produtoId) params.set('produtoId', produtoId)
  if (lote) params.set('lote', lote)
  if (incluirInativas) params.set('incluirInativas', 'true')

  const query = params.toString()
  return apiFetch(`/tags${query ? `?${query}` : ''}`)
}

export function buscarTag(tid) {
  return apiFetch(`/tags/${tid}`)
}

export function criarTag(data) {
  return apiFetch('/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function removerTag(tid) {
  return apiFetch(`/tags/${tid}`, {
    method: 'DELETE',
  })
}
