import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import VendedorCard from '@/components/VendedorCard'
import './AnaliseVendedor.css'

interface VendedorData {
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

type Ordenacao = 'nome' | 'faturamento' | 'pedidos' | 'clientes'

export default function AnaliseVendedor() {
  const [vendedores, setVendedores] = useState<VendedorData[]>([])
  const [vendedoresFiltrados, setVendedoresFiltrados] = useState<VendedorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState<'todos' | 'disponivel' | 'indisponivel'>('todos')
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('nome')

  useEffect(() => {
    carregarVendedores()
  }, [])

  useEffect(() => {
    filtrarEOrdenar()
  }, [vendedores, busca, filtroDisponibilidade, ordenacao])

  const carregarVendedores = async () => {
    try {
      setLoading(true)
      setError(null)
      const resultado = await apiClient.getVendedores()
      
      if (resultado.error) {
        setError(resultado.error)
        return
      }

      if (resultado.data) {
        setVendedores(resultado.data)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar vendedores')
    } finally {
      setLoading(false)
    }
  }

  const filtrarEOrdenar = () => {
    let filtrados = [...vendedores]

    // Filtro de busca por nome
    if (busca.trim()) {
      filtrados = filtrados.filter(v => 
        v.nome.toLowerCase().includes(busca.toLowerCase())
      )
    }

    // Filtro de disponibilidade
    if (filtroDisponibilidade !== 'todos') {
      filtrados = filtrados.filter(v => 
        filtroDisponibilidade === 'disponivel' ? v.disponivel : !v.disponivel
      )
    }

    // Ordenação
    filtrados.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome)
        case 'faturamento':
          return b.faturamento_atual - a.faturamento_atual
        case 'pedidos':
          return b.qtd_pedidos_atual - a.qtd_pedidos_atual
        case 'clientes':
          return b.qtd_clientes_carteira - a.qtd_clientes_carteira
        default:
          return 0
      }
    })

    setVendedoresFiltrados(filtrados)
  }

  if (loading) {
    return (
      <div className="analise-vendedor-container">
        <h1 className="page-title">Análise de Vendedor</h1>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando vendedores...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analise-vendedor-container">
        <h1 className="page-title">Análise de Vendedor</h1>
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={carregarVendedores} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="analise-vendedor-container">
      <h1 className="page-title">Análise de Vendedor</h1>
      
      <div className="filtros-container">
        <div className="filtro-busca">
          <input
            type="text"
            placeholder="Buscar vendedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="busca-input"
          />
        </div>

        <div className="filtro-disponibilidade">
          <label>Disponibilidade:</label>
          <select
            value={filtroDisponibilidade}
            onChange={(e) => setFiltroDisponibilidade(e.target.value as any)}
            className="filtro-select"
          >
            <option value="todos">Todos</option>
            <option value="disponivel">Disponíveis</option>
            <option value="indisponivel">Indisponíveis</option>
          </select>
        </div>

        <div className="filtro-ordenacao">
          <label>Ordenar por:</label>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
            className="filtro-select"
          >
            <option value="nome">Nome</option>
            <option value="faturamento">Faturamento</option>
            <option value="pedidos">Pedidos</option>
            <option value="clientes">Clientes</option>
          </select>
        </div>
      </div>

      {vendedoresFiltrados.length === 0 ? (
        <div className="empty-container">
          <p>Nenhum vendedor encontrado com os filtros aplicados.</p>
        </div>
      ) : (
        <>
          <div className="vendedores-stats">
            <span>
              {vendedoresFiltrados.length} vendedor{vendedoresFiltrados.length !== 1 ? 'es' : ''} encontrado{vendedoresFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="vendedores-grid">
            {vendedoresFiltrados.map((vendedor) => (
              <VendedorCard
                key={vendedor.id_protheus}
                {...vendedor}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
