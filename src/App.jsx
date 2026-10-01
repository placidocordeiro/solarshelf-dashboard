import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Login } from '@/pages/Login'
import { VisaoGeral } from '@/pages/VisaoGeral'
import { Produtos } from '@/pages/Produtos'
import { ProdutoDetalhe } from '@/pages/ProdutoDetalhe'
import { Pallets } from '@/pages/Pallets'
import { Movimentacoes } from '@/pages/Movimentacoes'

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-60 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function RequireAuth({ children }) {
  const { usuario, loading } = useAuth()
  if (loading) return <div className="p-6 text-muted-foreground">Carregando...</div>
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function GuestOnly({ children }) {
  const { usuario, loading } = useAuth()
  if (loading) return <div className="p-6 text-muted-foreground">Carregando...</div>
  if (usuario) return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/" element={<VisaoGeral />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
            <Route path="/pallets" element={<Pallets />} />
            <Route path="/movimentacoes" element={<Movimentacoes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
