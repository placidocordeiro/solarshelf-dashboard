import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { listarProdutos } from '@/api/produtos'
import { listarTags } from '@/api/tags'

const DIAS_ALERTA_VALIDADE = 7
const LIMIAR_ESTOQUE_BAIXO = 50

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function diasAte(validade) {
  const hoje = startOfDay(new Date())
  const venc = startOfDay(new Date(validade))
  const diff = venc.getTime() - hoje.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function VisaoGeral() {
  const [produtos, setProdutos] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        const [produtosData, tagsData] = await Promise.all([
          listarProdutos(),
          listarTags(),
        ])
        setProdutos(produtosData || [])
        setTags(tagsData || [])
      } catch (err) {
        setErro(err.message)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const totalProdutos = produtos.length
  const totalPallets = produtos.reduce((sum, p) => sum + (p.totalPallets || 0), 0)
  const estoqueTotal = produtos.reduce((sum, p) => sum + (p.estoqueTotal || 0), 0)

  const tagsAtivas = tags.filter((t) => !t.dataSaida)

  const vencendoEmBreve = tagsAtivas.filter((t) => {
    if (!t.validade) return false
    return diasAte(t.validade) <= DIAS_ALERTA_VALIDADE
  })

  const estoqueBaixo = produtos.filter((p) => (p.estoqueTotal || 0) < LIMIAR_ESTOQUE_BAIXO)

  if (loading) return <p className="p-6 text-muted-foreground">Carregando...</p>
  if (erro) return <p className="p-6 text-destructive">{erro}</p>

  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total de produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalProdutos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pallets ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{totalPallets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estoque total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{estoqueTotal}</p>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-base font-semibold">
          Pallets vencendo em breve
        </h2>
        {vencendoEmBreve.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pallet próximo do vencimento.</p>
        ) : (
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Produto</th>
                  <th className="px-3 py-2 text-left font-medium">Lote</th>
                  <th className="px-3 py-2 text-left font-medium">Quantidade</th>
                  <th className="px-3 py-2 text-left font-medium">Validade</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vencendoEmBreve.map((tag) => (
                  <tr key={tag.id}>
                    <td className="px-3 py-2">{tag.produto?.nome || tag.produtoId}</td>
                    <td className="px-3 py-2">{tag.lote}</td>
                    <td className="px-3 py-2">{tag.quantidade}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={diasAte(tag.validade) < 0 ? 'destructive' : 'secondary'}
                      >
                        {formatDate(tag.validade)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-base font-semibold">Estoque baixo</h2>
        {estoqueBaixo.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto abaixo do limiar.</p>
        ) : (
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Produto</th>
                  <th className="px-3 py-2 text-left font-medium">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {estoqueBaixo.map((produto) => (
                  <tr key={produto.id}>
                    <td className="px-3 py-2">{produto.nome}</td>
                    <td className="px-3 py-2">
                      <Badge variant="destructive">{produto.estoqueTotal}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
