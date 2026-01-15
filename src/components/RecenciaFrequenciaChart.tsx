import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { apiClient } from '@/lib/api'
import { useFilters } from '@/contexts/FilterContext'
import './RecenciaFrequenciaChart.css'

interface RecenciaFrequenciaData {
  recencia: number
  frequencia: number
  quantidade: number
}

export default function RecenciaFrequenciaChart() {
  const [data, setData] = useState<RecenciaFrequenciaData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { filters } = useFilters()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await apiClient.getRFVRecenciaFrequencia(filters.classificacao, filters.valor, filters.status)
        
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
  }, [filters.classificacao, filters.valor, filters.status])

  // Criar matriz de recência x frequência
  const heatmapData = useMemo(() => {
    const matrix: { [key: string]: number } = {}
    
    // Inicializar todas as combinações possíveis (recência 1-5, frequência 0-5)
    for (let r = 1; r <= 5; r++) {
      for (let f = 0; f <= 5; f++) {
        matrix[`${r}-${f}`] = 0
      }
    }
    
    // Preencher com dados reais
    data.forEach(item => {
      const key = `${item.recencia}-${item.frequencia}`
      if (matrix[key] !== undefined) {
        matrix[key] = item.quantidade
      }
    })
    
    // Converter para array formatado para o gráfico
    const result = []
    for (let r = 1; r <= 5; r++) {
      for (let f = 0; f <= 5; f++) {
        const quantidade = matrix[`${r}-${f}`] || 0
        if (quantidade > 0) {
          result.push({
            recencia: r,
            frequencia: f,
            quantidade,
            label: `R${r} F${f}`
          })
        }
      }
    }
    
    return result
  }, [data])

  // Encontrar valor máximo para normalizar cores
  const maxQuantidade = useMemo(() => {
    return Math.max(...heatmapData.map(d => d.quantidade), 1)
  }, [heatmapData])

  // Função para obter cor baseada na quantidade
  const getColor = (quantidade: number) => {
    const intensity = quantidade / maxQuantidade
    if (intensity === 0) return '#f0f0f0'
    if (intensity < 0.2) return '#e3f2fd'
    if (intensity < 0.4) return '#90caf9'
    if (intensity < 0.6) return '#42a5f5'
    if (intensity < 0.8) return '#1e88e5'
    return '#1565c0'
  }

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
      <h3 className="chart-title">Recência vs Frequência</h3>
      <div className="heatmap-wrapper">
        <div className="heatmap-grid">
          <div className="heatmap-header">
            <div className="heatmap-corner"></div>
            {[0, 1, 2, 3, 4, 5].map(f => (
              <div key={f} className="heatmap-header-cell">F{f}</div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map(r => (
            <div key={r} className="heatmap-row">
              <div className="heatmap-row-label">R{r}</div>
              {[0, 1, 2, 3, 4, 5].map(f => {
                const item = heatmapData.find(d => d.recencia === r && d.frequencia === f)
                const quantidade = item?.quantidade || 0
                return (
                  <div
                    key={`${r}-${f}`}
                    className="heatmap-cell"
                    style={{ backgroundColor: getColor(quantidade) }}
                    title={`Recência: ${r}, Frequência: ${f}, Quantidade: ${quantidade.toLocaleString('pt-BR')}`}
                  >
                    {quantidade > 0 && (
                      <span className="heatmap-value">{quantidade.toLocaleString('pt-BR')}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        <div className="heatmap-legend">
          <span>Menor</span>
          <div className="legend-gradient"></div>
          <span>Maior</span>
        </div>
      </div>
    </div>
  )
}
