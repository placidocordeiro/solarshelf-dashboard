import { apiFetch } from './client'

export function login({ email, senha }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}

export function me() {
  return apiFetch('/auth/me')
}
