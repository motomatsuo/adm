import './VendedorCard.css'
import VendedorInsights from './VendedorInsights'

interface VendedorCardProps {
  id_protheus: string
  nome: string
  foto: string | null
  disponivel: boolean
  faturamento_atual: number
  faturamento_variacao: number
  faturamento_medio: number
  qtd_pedidos_atual: number
  qtd_pedidos_variacao: number
  pedidos_medio: number
  qtd_clientes_carteira: number
  clientes_ativos: number
}

export default function VendedorCard({
  nome,
  foto,
  disponivel,
  faturamento_atual,
  faturamento_variacao,
  faturamento_medio,
  qtd_pedidos_atual,
  qtd_pedidos_variacao,
  pedidos_medio,
  qtd_clientes_carteira,
  clientes_ativos,
}: VendedorCardProps) {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarPercentual = (valor: number) => {
    const sinal = valor >= 0 ? '+' : ''
    return `${sinal}${valor.toFixed(1)}%`
  }

  const getVariacaoClass = (variacao: number) => {
    if (variacao > 0) return 'variacao-positiva'
    if (variacao < 0) return 'variacao-negativa'
    return 'variacao-neutra'
  }

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return '↑'
    if (variacao < 0) return '↓'
    return '→'
  }

  return (
    <div className={`vendedor-card ${!disponivel ? 'indisponivel' : ''}`}>
      <div className="vendedor-card-header">
        <div className="vendedor-foto">
          {foto ? (
            <img src={foto} alt={nome} />
          ) : (
            <div className="vendedor-foto-placeholder">
              {nome.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="vendedor-info">
          <h3 className="vendedor-nome">{nome}</h3>
          <span className={`vendedor-status ${disponivel ? 'disponivel' : 'indisponivel'}`}>
            {disponivel ? 'Disponível' : 'Indisponível'}
          </span>
        </div>
      </div>

      <div className="vendedor-metricas">
        <div className="metrica-item">
          <div className="metrica-label">Faturamento</div>
          <div className="metrica-valor">{formatarMoeda(faturamento_atual)}</div>
          <div className={`metrica-variacao ${getVariacaoClass(faturamento_variacao)}`}>
            <span className="variacao-icon">{getVariacaoIcon(faturamento_variacao)}</span>
            <span>{formatarPercentual(faturamento_variacao)}</span>
          </div>
        </div>

        <div className="metrica-item">
          <div className="metrica-label">Média</div>
          <div className="metrica-valor">{formatarMoeda(faturamento_medio)}</div>
          <div className="metrica-info">Últimos meses</div>
        </div>

        <div className="metrica-item">
          <div className="metrica-label">Pedidos</div>
          <div className="metrica-valor">{qtd_pedidos_atual}</div>
          <div className={`metrica-variacao ${getVariacaoClass(qtd_pedidos_variacao)}`}>
            <span className="variacao-icon">{getVariacaoIcon(qtd_pedidos_variacao)}</span>
            <span>{formatarPercentual(qtd_pedidos_variacao)}</span>
          </div>
        </div>

        <div className="metrica-item">
          <div className="metrica-label">Média Pedidos</div>
          <div className="metrica-valor">{Math.round(pedidos_medio)}</div>
          <div className="metrica-info">Últimos meses</div>
        </div>

        <div className="metrica-item">
          <div className="metrica-label">Clientes</div>
          <div className="metrica-valor">{qtd_clientes_carteira}</div>
          <div className="metrica-info">Carteira</div>
        </div>

        <div className="metrica-item">
          <div className="metrica-label">Ativos</div>
          <div className="metrica-valor">{clientes_ativos}</div>
          <div className="metrica-info">Clientes</div>
        </div>
      </div>

      <VendedorInsights
        faturamento_variacao={faturamento_variacao}
        faturamento_medio={faturamento_medio}
        faturamento_atual={faturamento_atual}
        qtd_pedidos_variacao={qtd_pedidos_variacao}
        pedidos_medio={pedidos_medio}
        qtd_pedidos_atual={qtd_pedidos_atual}
        qtd_clientes_carteira={qtd_clientes_carteira}
        clientes_ativos={clientes_ativos}
      />
    </div>
  )
}
