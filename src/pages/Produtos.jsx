import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarProdutos, criarProduto, editarProduto } from '@/api/produtos'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

export function Produtos() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nome: '', descricao: '' })
  const [salvando, setSalvando] = useState(false)

  const atualizar = useCallback(async () => {
    try {
      const data = await listarProdutos()
      setProdutos(data || [])
    } catch (err) {
      setErro(err.message)
    }
  }, [])

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      await atualizar()
    } finally {
      setLoading(false)
    }
  }, [atualizar])

  useEffect(() => {
    carregar()
  }, [carregar])

  useAutoRefresh(atualizar, 10000)

  function abrirNovo() {
    setEditando(null)
    setForm({ nome: '', descricao: '' })
    setDialogAberto(true)
  }

  function abrirEditar(produto) {
    setEditando(produto)
    setForm({ nome: produto.nome || '', descricao: produto.descricao || '' })
    setDialogAberto(true)
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      setSalvando(true)
      if (editando) {
        await editarProduto(editando.id, form)
      } else {
        await criarProduto(form)
      }
      setDialogAberto(false)
      await carregar()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  const filtrados = produtos.filter((p) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  if (loading) return <p className="p-6 text-muted-foreground">Carregando...</p>
  if (erro && !dialogAberto) return <p className="p-6 text-destructive">{erro}</p>

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar por nome"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={abrirNovo}>
          <Plus className="size-4" />
          Novo produto
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Pallets</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((produto) => (
              <TableRow
                key={produto.id}
                className="cursor-pointer"
                onClick={() => navigate(`/produtos/${produto.id}`)}
              >
                <TableCell className="font-medium">{produto.nome}</TableCell>
                <TableCell>{produto.descricao || '—'}</TableCell>
                <TableCell>{produto.estoqueTotal || 0}</TableCell>
                <TableCell>{produto.totalPallets || 0}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      abrirEditar(produto)
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <form onSubmit={salvar}>
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar produto' : 'Novo produto'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
