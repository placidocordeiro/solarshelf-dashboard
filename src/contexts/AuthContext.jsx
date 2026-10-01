import { createContext, useEffect, useState } from 'react'
import { login as loginApi, me as meApi } from '@/api/auth'

const TOKEN_KEY = 'solarshelf:token'

export const AuthContext = createContext(null)

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false)
      return
    }
    meApi()
      .then(setUsuario)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, senha) {
    const { token, usuario } = await loginApi({ email, senha })
    localStorage.setItem(TOKEN_KEY, token)
    setUsuario(usuario)
    return usuario
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, token: getStoredToken() }}>
      {children}
    </AuthContext.Provider>
  )
}
