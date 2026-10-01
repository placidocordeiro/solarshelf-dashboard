import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

export function exportarPlanilha(nome, linhas, aba = 'Dados') {
  const livro = XLSX.utils.book_new()
  const planilha = XLSX.utils.json_to_sheet(linhas)
  XLSX.utils.book_append_sheet(livro, planilha, aba)
  XLSX.writeFile(livro, nome)
}

export function exportarPdf(titulo, colunas, linhas, nome) {
  const pdf = new jsPDF({ orientation: 'landscape' })
  const margem = 12
  const escala = Math.min(1, 273 / colunas.reduce((soma, coluna) => soma + coluna.largura, 0))
  let y = 18

  pdf.setFontSize(16)
  pdf.text(titulo, margem, y)
  y += 10
  pdf.setFontSize(8)

  function escreverLinha(valores, negrito = false) {
    let x = margem
    pdf.setFont('helvetica', negrito ? 'bold' : 'normal')
    valores.forEach((valor, index) => {
      const largura = colunas[index].largura * escala
      pdf.text(String(valor ?? '—').slice(0, 32), x, y)
      x += largura
    })
    y += 6
  }

  const cabecalho = colunas.map((coluna) => coluna.nome)
  escreverLinha(cabecalho, true)
  linhas.forEach((valores) => {
    if (y > 195) {
      pdf.addPage('landscape')
      y = 18
      escreverLinha(cabecalho, true)
    }
    escreverLinha(valores)
  })
  pdf.save(nome)
}
