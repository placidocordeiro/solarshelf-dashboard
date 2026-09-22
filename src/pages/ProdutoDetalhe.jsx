import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { buscarProduto } from '@/api/produtos'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}

export function ProdutoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [produto, setProduto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        const data = await buscarProduto(id)
        setProduto(data)
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [id])

  const tags = Array.isArray(produto?.tags)
    ? produto.tags
    : Array.isArray(produto?.Tags)
      ? produto.Tags
      : []

  if (loading) return <p className="p-6 text-muted-foreground">Carregando...</p>
  if (erro) return <p className="p-6 text-destructive">{erro}</p>
  if (!produto) return <p className="p-6 text-muted-foreground">Produto não encontrado.</p>

  return (
    <div className="space-y-6 p-6">
      <Button variant="ghost" onClick={() => navigate('/produtos')}>
        <ArrowLeft className="mr-1 size-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{produto.nome}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">{produto.descricao || 'Sem descrição'}</p>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">Estoque total:</span>{' '}
              <span className="font-medium">{produto.estoqueTotal || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pallets ativos:</span>{' '}
              <span className="font-medium">{produto.totalPallets || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 font-heading text-base font-semibold">Pallets ativos</h2>
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pallet ativo.</p>
        ) : (
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TID</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-mono text-xs">{tag.id}</TableCell>
                    <TableCell>{tag.lote}</TableCell>
                    <TableCell>{tag.quantidade}</TableCell>
                    <TableCell>{formatDate(tag.dataEntrada)}</TableCell>
                    <TableCell>{formatDate(tag.validade)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  )
}
