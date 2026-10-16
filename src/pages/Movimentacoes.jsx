import { useCallback, useEffect, useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { listarProdutos } from '@/api/produtos'
import { listarTags } from '@/api/tags'
import { listarMovimentacoes } from '@/api/movimentacoes'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { exportarPdf, exportarPlanilha } from '@/lib/exportacao'

function formatDate(value) {
  if (!value) return '—'
  const data = new Date(value)
  return Number.isNaN(data.getTime()) ? '—' : data.toLocaleString('pt-BR')
}

const colunas = [
  { nome: 'Data', largura: 42 },
  { nome: 'Tipo', largura: 24 },
  { nome: 'Produto', largura: 65 },
  { nome: 'TID', largura: 70 },
  { nome: 'Lote', largura: 35 },
  { nome: 'Quantidade', largura: 30 },
]

export function Movimentacoes() {
  const [produtos, setProdutos] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [filtros, setFiltros] = useState({ produtoId: '', tipo: '', de: '', ate: '' })
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  const atualizar = useCallback(async () => {
    try {
      const [movimentacoesData, produtosData] = await Promise.all([
        listarMovimentacoes(filtros),
        listarProdutos(),
      ])
      setMovimentacoes(movimentacoesData || [])
      setProdutos(produtosData || [])
    } catch (err) {
      setErro(err.message)
    }
  }, [filtros])

  const carregar = useCallback(async () => {
    try {
      setLoading(true)
      await atualizar()
    } finally {
      setLoading(false)
    }
  }, [atualizar])

  useEffect(() => { carregar() }, [carregar])

  useAutoRefresh(atualizar, 10000)

  function linhasMovimentacoes() {
    return movimentacoes.map((movimentacao) => [
      formatDate(movimentacao.data),
      movimentacao.tipo,
      movimentacao.produto?.nome,
      movimentacao.tagId,
      movimentacao.tag?.lote,
      movimentacao.quantidade,
    ])
  }

  async function exportarInventario(formato) {
    const tags = await listarTags()
    const linhas = tags.map((tag) => ({
      Produto: tag.produto?.nome || tag.produtoId,
      TID: tag.id,
      Lote: tag.lote,
      Quantidade: tag.quantidade,
      Entrada: formatDate(tag.dataEntrada),
      Validade: formatDate(tag.validade),
    }))
    if (formato === 'xlsx') exportarPlanilha('inventario-atual.xlsx', linhas, 'Inventário')
    else exportarPdf('Inventário atual', [
      { nome: 'Produto', largura: 70 }, { nome: 'TID', largura: 75 },
      { nome: 'Lote', largura: 35 }, { nome: 'Qtd.', largura: 25 },
      { nome: 'Entrada', largura: 45 }, { nome: 'Validade', largura: 45 },
    ], linhas.map((linha) => Object.values(linha)), 'inventario-atual.pdf')
  }

  function exportarMovimentacoes(formato) {
    const linhas = linhasMovimentacoes()
    if (formato === 'xlsx') {
      exportarPlanilha('historico-movimentacoes.xlsx', linhas.map((linha) => Object.fromEntries(
        colunas.map((coluna, index) => [coluna.nome, linha[index]])
      )), 'Movimentações')
    } else exportarPdf('Histórico de movimentações', colunas, linhas, 'historico-movimentacoes.pdf')
  }

  if (loading) return <p className="p-6 text-muted-foreground">Carregando...</p>
  if (erro) return <p className="p-6 text-destructive">{erro}</p>

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Movimentações</h1>
        <p className="text-sm text-muted-foreground">Rastreie entradas e saídas por pallet.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={filtros.produtoId} onChange={(e) => setFiltros({ ...filtros, produtoId: e.target.value })}>
            <option value="">Todos os produtos</option>
            {produtos.map((produto) => <option key={produto.id} value={produto.id}>{produto.nome}</option>)}
          </select>
          <select className="h-9 rounded-md border bg-background px-3 text-sm" value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
            <option value="">Entradas e saídas</option><option value="ENTRADA">Entradas</option><option value="SAIDA">Saídas</option>
          </select>
          <Input type="date" value={filtros.de} onChange={(e) => setFiltros({ ...filtros, de: e.target.value })} className="w-40" />
          <Input type="date" value={filtros.ate} onChange={(e) => setFiltros({ ...filtros, ate: e.target.value })} className="w-40" />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => exportarMovimentacoes('xlsx')}><FileSpreadsheet className="size-4" /> Exportar histórico XLSX</Button>
        <Button variant="outline" onClick={() => exportarMovimentacoes('pdf')}><FileText className="size-4" /> Exportar histórico PDF</Button>
        <Button variant="secondary" onClick={() => exportarInventario('xlsx')}><Download className="size-4" /> Inventário XLSX</Button>
        <Button variant="secondary" onClick={() => exportarInventario('pdf')}><FileText className="size-4" /> Inventário PDF</Button>
      </div>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <table className="w-full text-sm"><thead className="bg-muted/50"><tr>{colunas.map((coluna) => <th key={coluna.nome} className="px-3 py-2 text-left font-medium">{coluna.nome}</th>)}</tr></thead>
          <tbody className="divide-y">{movimentacoes.map((movimentacao) => <tr key={movimentacao.id}>
            <td className="px-3 py-2">{formatDate(movimentacao.data)}</td><td className="px-3 py-2">{movimentacao.tipo}</td><td className="px-3 py-2">{movimentacao.produto?.nome}</td><td className="px-3 py-2 font-mono text-xs">{movimentacao.tagId}</td><td className="px-3 py-2">{movimentacao.tag?.lote}</td><td className="px-3 py-2">{movimentacao.quantidade}</td>
          </tr>)}{movimentacoes.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">Nenhuma movimentação encontrada.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  )
}
