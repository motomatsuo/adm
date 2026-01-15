import express from 'express'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

interface Vendedor {
  id_protheus: string
  nome: string
  telefone: string
  disponivel: boolean
  id_chatwoot: number | null
  instancia_evo_api: string | null
  foto: string | null
  email: string | null
  id_slack: string | null
  apikey_evo: string | null
  nome_formatado: string | null
}

interface VendedorMetricas {
  id_protheus: string
  nome: string
  foto: string | null
  disponivel: boolean
  faturamento_atual: number
  faturamento_anterior: number
  faturamento_variacao: number
  faturamento_medio: number
  qtd_pedidos_atual: number
  qtd_pedidos_anterior: number
  qtd_pedidos_variacao: number
  pedidos_medio: number
  qtd_clientes_carteira: number
  clientes_ativos: number
}

// Função auxiliar para calcular métricas de vendas
async function calcularMetricasVendas(
  idProtheus: string,
  dataInicioAtual: Date,
  dataFimAtual: Date,
  dataInicioAnterior: Date,
  dataFimAnterior: Date
) {
  // Buscar vendas do mês atual
  const { data: vendasAtual, error: errorAtual } = await supabase
    .from('db_relatorio_vendas')
    .select('valor, ft_nfiscal')
    .eq('vend', idProtheus)
    .gte('emissao_nf', dataInicioAtual.toISOString().split('T')[0])
    .lte('emissao_nf', dataFimAtual.toISOString().split('T')[0])

  // Buscar vendas do mês anterior
  const { data: vendasAnterior, error: errorAnterior } = await supabase
    .from('db_relatorio_vendas')
    .select('valor, ft_nfiscal')
    .eq('vend', idProtheus)
    .gte('emissao_nf', dataInicioAnterior.toISOString().split('T')[0])
    .lte('emissao_nf', dataFimAnterior.toISOString().split('T')[0])

  if (errorAtual || errorAnterior) {
    throw new Error(errorAtual?.message || errorAnterior?.message || 'Erro ao buscar vendas')
  }

  // Processar valores (remover caracteres não numéricos e converter)
  const processarValor = (valor: string | null): number => {
    if (!valor) return 0
    const numStr = valor.toString().replace(/[^\d,.-]/g, '').replace(',', '.')
    const num = parseFloat(numStr)
    return isNaN(num) ? 0 : num
  }

  // Calcular métricas do mês atual
  const valoresAtual = (vendasAtual || []).map(v => processarValor(v.valor)).filter(v => v > 0)
  const faturamentoAtual = valoresAtual.reduce((sum, v) => sum + v, 0)
  const qtdPedidosAtual = new Set((vendasAtual || []).map(v => v.ft_nfiscal)).size

  // Calcular métricas do mês anterior
  const valoresAnterior = (vendasAnterior || []).map(v => processarValor(v.valor)).filter(v => v > 0)
  const faturamentoAnterior = valoresAnterior.reduce((sum, v) => sum + v, 0)
  const qtdPedidosAnterior = new Set((vendasAnterior || []).map(v => v.ft_nfiscal)).size

  // Calcular variações percentuais
  const calcularVariacao = (atual: number, anterior: number): number => {
    if (anterior === 0) return atual > 0 ? 100 : 0
    return ((atual - anterior) / anterior) * 100
  }

  return {
    faturamento_atual: faturamentoAtual,
    faturamento_anterior: faturamentoAnterior,
    faturamento_variacao: calcularVariacao(faturamentoAtual, faturamentoAnterior),
    qtd_pedidos_atual: qtdPedidosAtual,
    qtd_pedidos_anterior: qtdPedidosAnterior,
    qtd_pedidos_variacao: calcularVariacao(qtdPedidosAtual, qtdPedidosAnterior),
  }
}

// Função auxiliar para calcular média de pedidos excluindo pico e baixa
async function calcularPedidosMedio(idProtheus: string, mesesParaAnalisar: number = 12) {
  const agora = new Date()
  const anoAtual = agora.getFullYear()
  const mesAtual = agora.getMonth()

  // Buscar quantidade de pedidos dos últimos N meses
  const pedidosPorMes: number[] = []

  for (let i = 0; i < mesesParaAnalisar; i++) {
    const dataInicio = new Date(anoAtual, mesAtual - i, 1)
    const dataFim = new Date(anoAtual, mesAtual - i + 1, 0)

    const { data: vendas, error } = await supabase
      .from('db_relatorio_vendas')
      .select('ft_nfiscal')
      .eq('vend', idProtheus)
      .gte('emissao_nf', dataInicio.toISOString().split('T')[0])
      .lte('emissao_nf', dataFim.toISOString().split('T')[0])

    if (error) {
      continue // Ignora erros e continua
    }

    // Contar pedidos únicos (notas fiscais)
    const pedidosUnicos = new Set((vendas || []).map(v => v.ft_nfiscal)).size
    pedidosPorMes.push(pedidosUnicos)
  }

  // Se não tem dados suficientes, retorna 0
  if (pedidosPorMes.length < 3) {
    return 0
  }

  // Remover o mês de pico (maior valor) e o mês de baixa (menor valor)
  const pedidosOrdenados = [...pedidosPorMes].sort((a, b) => a - b)
  const menor = pedidosOrdenados[0]
  const maior = pedidosOrdenados[pedidosOrdenados.length - 1]

  // Remover apenas uma ocorrência de cada (caso tenha valores duplicados)
  const pedidosFiltrados = [...pedidosPorMes]
  const indiceMenor = pedidosFiltrados.indexOf(menor)
  if (indiceMenor !== -1) {
    pedidosFiltrados.splice(indiceMenor, 1)
  }
  
  const indiceMaior = pedidosFiltrados.indexOf(maior)
  if (indiceMaior !== -1) {
    pedidosFiltrados.splice(indiceMaior, 1)
  }

  // Calcular média dos meses restantes
  if (pedidosFiltrados.length === 0) {
    return 0
  }

  const soma = pedidosFiltrados.reduce((sum, v) => sum + v, 0)
  return soma / pedidosFiltrados.length
}

// Função auxiliar para calcular média de faturamento excluindo pico e baixa
async function calcularFaturamentoMedio(idProtheus: string, mesesParaAnalisar: number = 12) {
  const agora = new Date()
  const anoAtual = agora.getFullYear()
  const mesAtual = agora.getMonth()

  // Buscar faturamento dos últimos N meses
  const faturamentosPorMes: number[] = []

  for (let i = 0; i < mesesParaAnalisar; i++) {
    const dataInicio = new Date(anoAtual, mesAtual - i, 1)
    const dataFim = new Date(anoAtual, mesAtual - i + 1, 0)

    const { data: vendas, error } = await supabase
      .from('db_relatorio_vendas')
      .select('valor')
      .eq('vend', idProtheus)
      .gte('emissao_nf', dataInicio.toISOString().split('T')[0])
      .lte('emissao_nf', dataFim.toISOString().split('T')[0])

    if (error) {
      continue // Ignora erros e continua
    }

    // Processar valores
    const processarValor = (valor: string | null): number => {
      if (!valor) return 0
      const numStr = valor.toString().replace(/[^\d,.-]/g, '').replace(',', '.')
      const num = parseFloat(numStr)
      return isNaN(num) ? 0 : num
    }

    const valores = (vendas || []).map(v => processarValor(v.valor)).filter(v => v > 0)
    const faturamento = valores.reduce((sum, v) => sum + v, 0)
    faturamentosPorMes.push(faturamento)
  }

  // Se não tem dados suficientes, retorna 0
  if (faturamentosPorMes.length < 3) {
    return 0
  }

  // Remover o mês de pico (maior valor) e o mês de baixa (menor valor)
  const faturamentosOrdenados = [...faturamentosPorMes].sort((a, b) => a - b)
  const menor = faturamentosOrdenados[0]
  const maior = faturamentosOrdenados[faturamentosOrdenados.length - 1]

  // Remover apenas uma ocorrência de cada (caso tenha valores duplicados)
  const faturamentosFiltrados = [...faturamentosPorMes]
  const indiceMenor = faturamentosFiltrados.indexOf(menor)
  if (indiceMenor !== -1) {
    faturamentosFiltrados.splice(indiceMenor, 1)
  }
  
  const indiceMaior = faturamentosFiltrados.indexOf(maior)
  if (indiceMaior !== -1) {
    faturamentosFiltrados.splice(indiceMaior, 1)
  }

  // Calcular média dos meses restantes
  if (faturamentosFiltrados.length === 0) {
    return 0
  }

  const soma = faturamentosFiltrados.reduce((sum, v) => sum + v, 0)
  return soma / faturamentosFiltrados.length
}

// Função auxiliar para calcular métricas da carteira RFV
async function calcularMetricasCarteira(nomeVendedor: string) {
  // Buscar clientes do vendedor na tabela RFV
  const { data: clientesRFV, error } = await supabase
    .from('db_rfv')
    .select('recencia, frequencia, valor, fat_total')
    .eq('vendedor', nomeVendedor)

  if (error) {
    throw new Error(error.message)
  }

  if (!clientesRFV || clientesRFV.length === 0) {
    return {
      qtd_clientes_carteira: 0,
      clientes_ativos: 0,
    }
  }

  const qtdClientes = clientesRFV.length
  const clientesAtivos = clientesRFV.filter(
    c => (c.recencia || 0) <= 2 && (c.frequencia || 0) >= 2
  ).length

  return {
    qtd_clientes_carteira: qtdClientes,
    clientes_ativos: clientesAtivos,
  }
}

// GET /api/vendedores - Lista todos os vendedores com métricas
router.get('/', async (req, res) => {
  try {
    // Buscar todos os vendedores
    const { data: vendedores, error: vendedoresError } = await supabase
      .from('db_vendedores')
      .select('*')
      .order('nome', { ascending: true })

    if (vendedoresError) {
      return res.status(500).json({ error: vendedoresError.message })
    }

    if (!vendedores || vendedores.length === 0) {
      return res.json({ data: [] })
    }

    // Calcular períodos (mês atual vs anterior)
    const agora = new Date()
    const anoAtual = agora.getFullYear()
    const mesAtual = agora.getMonth()

    // Mês atual
    const dataInicioAtual = new Date(anoAtual, mesAtual, 1)
    const dataFimAtual = new Date(anoAtual, mesAtual + 1, 0)

    // Mês anterior
    const dataInicioAnterior = new Date(anoAtual, mesAtual - 1, 1)
    const dataFimAnterior = new Date(anoAtual, mesAtual, 0)

    // Calcular métricas para cada vendedor
    const vendedoresComMetricas: VendedorMetricas[] = await Promise.all(
      vendedores.map(async (vendedor: Vendedor) => {
        try {
          const metricasVendas = await calcularMetricasVendas(
            vendedor.id_protheus,
            dataInicioAtual,
            dataFimAtual,
            dataInicioAnterior,
            dataFimAnterior
          )

          const metricasCarteira = await calcularMetricasCarteira(vendedor.nome)
          const faturamentoMedio = await calcularFaturamentoMedio(vendedor.id_protheus)
          const pedidosMedio = await calcularPedidosMedio(vendedor.id_protheus)

          // Calcular variação baseada na média histórica
          const calcularVariacao = (atual: number, media: number): number => {
            if (media === 0) return atual > 0 ? 100 : 0
            return ((atual - media) / media) * 100
          }

          return {
            id_protheus: vendedor.id_protheus,
            nome: vendedor.nome,
            foto: vendedor.foto,
            disponivel: vendedor.disponivel,
            ...metricasVendas,
            faturamento_variacao: calcularVariacao(metricasVendas.faturamento_atual, faturamentoMedio),
            faturamento_medio: faturamentoMedio,
            pedidos_medio: pedidosMedio,
            ...metricasCarteira,
          }
        } catch (error: any) {
          // Se houver erro ao calcular métricas de um vendedor, retornar valores zerados
          return {
            id_protheus: vendedor.id_protheus,
            nome: vendedor.nome,
            foto: vendedor.foto,
            disponivel: vendedor.disponivel,
            faturamento_atual: 0,
            faturamento_anterior: 0,
            faturamento_variacao: 0,
            faturamento_medio: 0,
            qtd_pedidos_atual: 0,
            qtd_pedidos_anterior: 0,
            qtd_pedidos_variacao: 0,
            pedidos_medio: 0,
            qtd_clientes_carteira: 0,
            clientes_ativos: 0,
          }
        }
      })
    )

    res.json({ data: vendedoresComMetricas })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

// GET /api/vendedores/:id/metricas - Métricas detalhadas de um vendedor
router.get('/:id/metricas', async (req, res) => {
  try {
    const { id } = req.params

    // Buscar vendedor
    const { data: vendedor, error: vendedorError } = await supabase
      .from('db_vendedores')
      .select('*')
      .eq('id_protheus', id)
      .single()

    if (vendedorError || !vendedor) {
      return res.status(404).json({ error: 'Vendedor não encontrado' })
    }

    // Calcular períodos
    const agora = new Date()
    const anoAtual = agora.getFullYear()
    const mesAtual = agora.getMonth()

    const dataInicioAtual = new Date(anoAtual, mesAtual, 1)
    const dataFimAtual = new Date(anoAtual, mesAtual + 1, 0)
    const dataInicioAnterior = new Date(anoAtual, mesAtual - 1, 1)
    const dataFimAnterior = new Date(anoAtual, mesAtual, 0)

    const metricasVendas = await calcularMetricasVendas(
      vendedor.id_protheus,
      dataInicioAtual,
      dataFimAtual,
      dataInicioAnterior,
      dataFimAnterior
    )

    const metricasCarteira = await calcularMetricasCarteira(vendedor.nome)
    const faturamentoMedio = await calcularFaturamentoMedio(vendedor.id_protheus)
    const pedidosMedio = await calcularPedidosMedio(vendedor.id_protheus)

    // Calcular variação baseada na média histórica
    const calcularVariacao = (atual: number, media: number): number => {
      if (media === 0) return atual > 0 ? 100 : 0
      return ((atual - media) / media) * 100
    }

    res.json({
      data: {
        vendedor: {
          id_protheus: vendedor.id_protheus,
          nome: vendedor.nome,
          foto: vendedor.foto,
          disponivel: vendedor.disponivel,
        },
        ...metricasVendas,
        faturamento_variacao: calcularVariacao(metricasVendas.faturamento_atual, faturamentoMedio),
        faturamento_medio: faturamentoMedio,
        pedidos_medio: pedidosMedio,
        ...metricasCarteira,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

// GET /api/vendedores/:id/carteira - Detalhes da carteira RFV do vendedor
router.get('/:id/carteira', async (req, res) => {
  try {
    const { id } = req.params
    const { status, classificacao } = req.query

    // Buscar vendedor
    const { data: vendedor, error: vendedorError } = await supabase
      .from('db_vendedores')
      .select('nome')
      .eq('id_protheus', id)
      .single()

    if (vendedorError || !vendedor) {
      return res.status(404).json({ error: 'Vendedor não encontrado' })
    }

    // Buscar clientes da carteira
    let query = supabase
      .from('db_rfv')
      .select('*')
      .eq('vendedor', vendedor.nome)
      .order('fat_total', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (classificacao) {
      query = query.eq('classificacao', classificacao)
    }

    const { data: carteira, error: carteiraError } = await query

    if (carteiraError) {
      return res.status(500).json({ error: carteiraError.message })
    }

    res.json({ data: carteira || [] })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

export default router
