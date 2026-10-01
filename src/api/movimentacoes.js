import { apiFetch } from './client'

export function listarMovimentacoes(filtros = {}) {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor) params.set(chave, valor)
  })
  const query = params.toString()
  return apiFetch(`/movimentacoes${query ? `?${query}` : ''}`)
}
