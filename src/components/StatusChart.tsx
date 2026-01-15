import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { apiClient } from '@/lib/api'
import { useFilters } from '@/contexts/FilterContext'
import './StatusChart.css'

interface StatusData {
  status: string
  quantidade: number
}

export default function StatusChart() {
  const [data, setData] = useState<StatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { filters, setStatusFilter } = useFilters()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await apiClient.getRFVStatus(filters.classificacao, filters.valor)
        
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
  }, [filters.classificacao, filters.valor])

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

  return (
    <div className="chart-container">
      <h3 className="chart-title">Distribuição por Status</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          onClick={(e: any) => {
            if (e && e.activePayload && e.activePayload[0]) {
              const entry = e.activePayload[0].payload as StatusData
              if (filters.status === entry.status) {
                setStatusFilter(null)
              } else {
                setStatusFilter(entry.status)
              }
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="status"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11 }}
            interval={0}
          />
          <YAxis 
            label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Quantidade']}
            labelStyle={{ color: '#333' }}
          />
          <Bar 
            dataKey="quantidade" 
            fill="#667eea"
            radius={[4, 4, 0, 0]}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={filters.status === entry.status ? '#764ba2' : '#667eea'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
