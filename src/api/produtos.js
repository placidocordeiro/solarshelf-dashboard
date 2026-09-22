import { apiFetch } from './client'

export function listarProdutos() {
  return apiFetch('/produtos')
}

export function buscarProduto(id) {
  return apiFetch(`/produtos/${id}`)
}

export function criarProduto(data) {
  return apiFetch('/produtos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function editarProduto(id, data) {
  return apiFetch(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
