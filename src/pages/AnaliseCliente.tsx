import { FilterProvider, useFilters } from '@/contexts/FilterContext'
import ClassificacaoChart from '@/components/ClassificacaoChart'
import ValorChart from '@/components/ValorChart'
import RecenciaFrequenciaChart from '@/components/RecenciaFrequenciaChart'
import StatusChart from '@/components/StatusChart'
import './AnaliseCliente.css'

function AnaliseClienteContent() {
  const { filters, clearFilters } = useFilters()

  const getFilterLabel = () => {
    if (filters.classificacao) return `Classificação: ${filters.classificacao}`
    if (filters.valor !== null) return `Valor: ${filters.valor}`
    if (filters.status) return `Status: ${filters.status}`
    return null
  }

  const filterLabel = getFilterLabel()

  return (
    <div className="analise-cliente-container">
      <h1 className="page-title">Análise de Cliente</h1>
      {filterLabel && (
        <div className="filter-indicator">
          <span>Filtro ativo: {filterLabel}</span>
          <button onClick={clearFilters}>Limpar filtro</button>
        </div>
      )}
      <div className="charts-grid">
        <ClassificacaoChart />
        <ValorChart />
      </div>
      <div className="charts-grid">
        <RecenciaFrequenciaChart />
        <StatusChart />
      </div>
    </div>
  )
}

export default function AnaliseCliente() {
  return (
    <FilterProvider>
      <AnaliseClienteContent />
    </FilterProvider>
  )
}
