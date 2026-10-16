import { useEffect } from 'react'

/**
 * Executa callback em intervalo fixo enquanto a aba estiver visível.
 * Também dispara imediatamente quando o usuário retorna à aba.
 */
export function useAutoRefresh(callback, intervalMs = 10000) {
  useEffect(() => {
    let intervalId = null

    const tick = () => {
      if (document.hidden) return
      callback()
    }

    intervalId = setInterval(tick, intervalMs)

    const handleVisibility = () => {
      if (!document.hidden) callback()
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [callback, intervalMs])
}
