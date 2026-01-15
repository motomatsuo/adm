import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { apiClient } from '@/lib/api'
import { useFilters } from '@/contexts/FilterContext'
import './ValorChart.css'

interface ValorData {
  valor: number
  quantidade: number
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea']

export default function ValorChart() {
  const [data, setData] = useState<ValorData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { filters, setValorFilter } = useFilters()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await apiClient.getRFVValor(filters.classificacao, filters.status)
        
        if (result.error) {
          setError(result.error)
        } else if (result.data && Array.isArray(result.data)) {
          setData(result.data)
        } else {
          setError('Formato de dados inválido')
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters.classificacao, filters.status])

  if (loading) {
    return (
      <div className="chart-container">
        <div className="chart-loading">Carregando dados...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chart-container">
        <div className="chart-error">Erro: {error}</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-empty">Nenhum dado disponível</div>
      </div>
    )
  }

  // Formatar dados para o gráfico
  const chartData = data.map(item => ({
    name: `Valor ${item.valor}`,
    value: item.quantidade,
    valor: item.valor
  }))

  const total = data.reduce((sum, item) => sum + item.quantidade, 0)

  return (
    <div className="chart-container">
      <h3 className="chart-title">Distribuição por Valor</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={filters.valor === entry.valor ? '#764ba2' : COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Quantidade']}
            labelStyle={{ color: '#333' }}
          />
          <Legend 
            formatter={(value, entry: any) => `${value} (${entry.payload.value.toLocaleString('pt-BR')})`}
            onClick={(e: any) => {
              if (e && e.payload) {
                const entry = e.payload as { name: string; value: number; valor: number }
                if (filters.valor === entry.valor) {
                  setValorFilter(null)
                } else {
                  setValorFilter(entry.valor)
                }
              }
            }}
            wrapperStyle={{ cursor: 'pointer' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-summary">
        <p>Total de registros: {total.toLocaleString('pt-BR')}</p>
      </div>
    </div>
  )
}
