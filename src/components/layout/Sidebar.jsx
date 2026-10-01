import { NavLink } from 'react-router-dom'
import { LayoutGrid, Package, Boxes, ArrowRightLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Visão Geral', icon: LayoutGrid },
  { to: '/produtos', label: 'Produtos', icon: Package },
  { to: '/pallets', label: 'Pallets', icon: Boxes },
  { to: '/movimentacoes', label: 'Movimentações', icon: ArrowRightLeft },
]

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r bg-card px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Boxes className="size-5" />
        <span className="font-heading text-base font-semibold">SolarShelf</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
