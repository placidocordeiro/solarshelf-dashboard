import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Visão Geral',
  '/produtos': 'Produtos',
  '/pallets': 'Pallets',
}

export function Header() {
  const location = useLocation()
  const title = titles[location.pathname] || 'Detalhe do Produto'

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 px-6 py-4 backdrop-blur">
      <h1 className="font-heading text-lg font-semibold">{title}</h1>
    </header>
  )
}
