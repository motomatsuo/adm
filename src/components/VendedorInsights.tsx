import './VendedorInsights.css'

interface VendedorInsightsProps {
  faturamento_variacao: number
  faturamento_medio: number
  faturamento_atual: number
  qtd_pedidos_variacao: number
  pedidos_medio: number
  qtd_pedidos_atual: number
  qtd_clientes_carteira: number
  clientes_ativos: number
}

export default function VendedorInsights({
  faturamento_variacao,
  faturamento_medio,
  faturamento_atual,
  qtd_pedidos_variacao,
  pedidos_medio,
  qtd_pedidos_atual,
  qtd_clientes_carteira,
  clientes_ativos,
}: VendedorInsightsProps) {
  const insights: Array<{
    tipo: 'oportunidade' | 'alerta' | 'recomendacao'
    mensagem: string
    prioridade: 'alta' | 'media' | 'baixa'
  }> = []

  // Oportunidades
  if (faturamento_variacao > 20) {
    insights.push({
      tipo: 'oportunidade',
      mensagem: 'Faturamento em alta! Aproveite para expandir a carteira.',
      prioridade: 'alta',
    })
  }

  const diferencaMedia = faturamento_medio > 0 
    ? ((faturamento_atual - faturamento_medio) / faturamento_medio) * 100 
    : 0

  if (diferencaMedia > 20 && qtd_pedidos_variacao > 0) {
    insights.push({
      tipo: 'oportunidade',
      mensagem: 'Faturamento acima da média histórica com crescimento de pedidos. Ótimo desempenho!',
      prioridade: 'alta',
    })
  }

  const diferencaPedidos = pedidos_medio > 0 
    ? ((qtd_pedidos_atual - pedidos_medio) / pedidos_medio) * 100 
    : 0

  if (diferencaPedidos > 20 && qtd_pedidos_variacao > 0) {
    insights.push({
      tipo: 'oportunidade',
      mensagem: 'Pedidos acima da média histórica com crescimento. Ótimo desempenho!',
      prioridade: 'media',
    })
  }

  // Alertas
  if (faturamento_variacao < -15) {
    insights.push({
      tipo: 'alerta',
      mensagem: 'Faturamento em queda. Revisar estratégia de vendas.',
      prioridade: 'alta',
    })
  }

  if (diferencaMedia < -20) {
    insights.push({
      tipo: 'alerta',
      mensagem: 'Faturamento abaixo da média histórica. Revisar estratégia de vendas.',
      prioridade: 'alta',
    })
  }

  if (qtd_pedidos_variacao < -20) {
    insights.push({
      tipo: 'alerta',
      mensagem: 'Queda significativa no número de pedidos. Reativar clientes.',
      prioridade: 'alta',
    })
  }

  if (clientes_ativos < qtd_clientes_carteira * 0.3) {
    insights.push({
      tipo: 'alerta',
      mensagem: 'Baixa taxa de clientes ativos. Priorizar reativação.',
      prioridade: 'alta',
    })
  }

  if (diferencaPedidos < -20) {
    insights.push({
      tipo: 'alerta',
      mensagem: 'Pedidos abaixo da média histórica. Revisar estratégia de vendas.',
      prioridade: 'alta',
    })
  }

  // Recomendações
  if (faturamento_atual > 0 && qtd_pedidos_variacao > 0 && diferencaMedia < 0) {
    insights.push({
      tipo: 'recomendacao',
      mensagem: 'Aumentar faturamento focando em produtos de maior valor para alcançar a média histórica.',
      prioridade: 'media',
    })
  }

  if (qtd_clientes_carteira > 0 && clientes_ativos < qtd_clientes_carteira * 0.4) {
    insights.push({
      tipo: 'recomendacao',
      mensagem: 'Criar campanha de reativação para clientes inativos.',
      prioridade: 'alta',
    })
  }

  if (pedidos_medio > 0 && qtd_pedidos_atual < pedidos_medio * 0.8) {
    insights.push({
      tipo: 'recomendacao',
      mensagem: 'Aumentar volume de pedidos para alcançar a média histórica.',
      prioridade: 'media',
    })
  }

  if (insights.length === 0) {
    return (
      <div className="vendedor-insights">
        <div className="insight-item neutro">
          <span className="insight-icon">✓</span>
          <span className="insight-mensagem">Performance estável. Mantenha o foco!</span>
        </div>
      </div>
    )
  }

  // Ordenar por prioridade (alta > media > baixa)
  const prioridadeOrder = { alta: 3, media: 2, baixa: 1 }
  insights.sort((a, b) => prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade])

  return (
    <div className="vendedor-insights">
      {insights.slice(0, 3).map((insight, index) => (
        <div key={index} className={`insight-item ${insight.tipo} ${insight.prioridade}`}>
          <span className="insight-icon">
            {insight.tipo === 'oportunidade' && '💡'}
            {insight.tipo === 'alerta' && '⚠️'}
            {insight.tipo === 'recomendacao' && '💼'}
          </span>
          <span className="insight-mensagem">{insight.mensagem}</span>
        </div>
      ))}
    </div>
  )
}
