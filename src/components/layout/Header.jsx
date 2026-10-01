import { useLocation } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const titles = {
  '/': 'Visão Geral',
  '/produtos': 'Produtos',
  '/pallets': 'Pallets',
}

export function Header() {
  const location = useLocation()
  const { usuario, logout } = useAuth()
  const title = titles[location.pathname] || 'Detalhe do Produto'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-6 py-4 backdrop-blur">
      <h1 className="font-heading text-lg font-semibold">{title}</h1>
      {usuario && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{usuario.nome}</span>
          <Button variant="ghost" size="icon" onClick={logout} title="Sair">
            <LogOut className="size-4" />
          </Button>
        </div>
      )}
    </header>
  )
}
