import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterState {
  classificacao: string | null
  valor: number | null
  recencia: number | null
  frequencia: number | null
  status: string | null
}

interface FilterContextType {
  filters: FilterState
  setClassificacaoFilter: (classificacao: string | null) => void
  setValorFilter: (valor: number | null) => void
  setRecenciaFilter: (recencia: number | null) => void
  setFrequenciaFilter: (frequencia: number | null) => void
  setStatusFilter: (status: string | null) => void
  clearFilters: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    classificacao: null,
    valor: null,
    recencia: null,
    frequencia: null,
    status: null,
  })

  const setClassificacaoFilter = (classificacao: string | null) => {
    setFilters(prev => ({
      ...prev,
      classificacao,
      // Limpar outros filtros quando filtrar por classificação
      valor: null,
      recencia: null,
      frequencia: null,
      status: null,
    }))
  }

  const setValorFilter = (valor: number | null) => {
    setFilters(prev => ({
      ...prev,
      valor,
      classificacao: null,
      recencia: null,
      frequencia: null,
      status: null,
    }))
  }

  const setRecenciaFilter = (recencia: number | null) => {
    setFilters(prev => ({
      ...prev,
      recencia,
      classificacao: null,
      valor: null,
      frequencia: null,
      status: null,
    }))
  }

  const setFrequenciaFilter = (frequencia: number | null) => {
    setFilters(prev => ({
      ...prev,
      frequencia,
      classificacao: null,
      valor: null,
      recencia: null,
      status: null,
    }))
  }

  const setStatusFilter = (status: string | null) => {
    setFilters(prev => ({
      ...prev,
      status,
      classificacao: null,
      valor: null,
      recencia: null,
      frequencia: null,
    }))
  }

  const clearFilters = () => {
    setFilters({
      classificacao: null,
      valor: null,
      recencia: null,
      frequencia: null,
      status: null,
    })
  }

  return (
    <FilterContext.Provider
      value={{
        filters,
        setClassificacaoFilter,
        setValorFilter,
        setRecenciaFilter,
        setFrequenciaFilter,
        setStatusFilter,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters deve ser usado dentro de FilterProvider')
  }
  return context
}
