import { useCallback, useEffect, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { listarProdutos } from '@/api/produtos'
import { listarTags, removerTag } from '@/api/tags'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function statusValidade(validade) {
  const hoje = startOfDay(new Date())
  const venc = startOfDay(new Date(validade))
  const diff = venc.getTime() - hoje.getTime()
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (dias < 0) return { label: 'Vencido', className: 'bg-red-100 text-red-700 border-red-200' }
  if (dias < 7) return { label: `${dias} dias`, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' }
  return { label: 'OK', className: 'bg-green-100 text-green-700 border-green-200' }
}

export function Pallets() {
  const [tags, setTags] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [produtoId, setProdutoId] = useState('')
  const [lote, setLote] = useState('')
  const [mostrarHistorico, setMostrarHistorico] = useState(false)

  const atualizar = useCallback(async () => {
    try {
      const [tagsData, produtosData] = await Promise.all([
        listarTags({ produtoId, lote, incluirInativas: mostrarHistorico }),
        listarProdutos(),
      ])
      setTags(tagsData || [])
      setProdutos(produtosData || [])
    } catch (err) {
      setErro(err.message)
    }
  }, [produtoId, lote, mostrarHistorico])

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

  async function darSaida(tid) {
    if (!window.confirm('Confirmar saída deste pallet?')) return
    try {
      await removerTag(tid)
      await carregar()
    } catch (err) {
      setErro(err.message)
    }
  }

  const mapaProdutos = Object.fromEntries(produtos.map((p) => [p.id, p]))

  if (loading) return <p className="p-6 text-muted-foreground">Carregando...</p>
  if (erro) return <p className="p-6 text-destructive">{erro}</p>

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-48">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Produto</label>
          <Select value={produtoId} onValueChange={setProdutoId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {produtos.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-48">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Lote</label>
          <Input
            placeholder="Filtrar lote"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
          />
        </div>

        <Button
          variant={mostrarHistorico ? 'secondary' : 'outline'}
          onClick={() => setMostrarHistorico((v) => !v)}
        >
          <ArrowRightLeft className="mr-1 size-4" />
          {mostrarHistorico ? 'Ocultar histórico' : 'Mostrar histórico'}
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TID</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Validade</TableHead>
              {mostrarHistorico && <TableHead>Saída</TableHead>}
              <TableHead className="w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => {
              const ativa = !tag.dataSaida
              const status = tag.validade ? statusValidade(tag.validade) : null

              return (
                <TableRow key={tag.id} className={!ativa ? 'opacity-60' : undefined}>
                  <TableCell className="font-mono text-xs">{tag.id}</TableCell>
                  <TableCell>{mapaProdutos[tag.produtoId]?.nome || tag.produtoId}</TableCell>
                  <TableCell>{tag.lote}</TableCell>
                  <TableCell>{tag.quantidade}</TableCell>
                  <TableCell>{formatDate(tag.dataEntrada)}</TableCell>
                  <TableCell>
                    {status && (
                      <Badge variant="outline" className={status.className}>
                        {formatDate(tag.validade)} — {status.label}
                      </Badge>
                    )}
                  </TableCell>
                  {mostrarHistorico && <TableCell>{formatDate(tag.dataSaida)}</TableCell>}
                  <TableCell>
                    {ativa && (
                      <Button variant="destructive" size="xs" onClick={() => darSaida(tag.id)}>
                        Dar saída
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
            {tags.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={mostrarHistorico ? 8 : 7}
                  className="text-center text-muted-foreground"
                >
                  Nenhum pallet encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
