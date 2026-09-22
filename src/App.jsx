import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { VisaoGeral } from '@/pages/VisaoGeral'
import { Produtos } from '@/pages/Produtos'
import { ProdutoDetalhe } from '@/pages/ProdutoDetalhe'
import { Pallets } from '@/pages/Pallets'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<VisaoGeral />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/produtos/:id" element={<ProdutoDetalhe />} />
          <Route path="/pallets" element={<Pallets />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
