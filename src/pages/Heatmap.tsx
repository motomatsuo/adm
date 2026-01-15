import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { apiClient } from '@/lib/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './Heatmap.css'

// Fix para ícones do Leaflet no React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Importar leaflet.heat
import 'leaflet.heat'

interface GeolocData {
  id: number
  id_cliente: string
  lat: number
  lon: number
}

interface RFVData {
  codigo: string
  nome_empresa: string
  vendedor: string | null
  fat_total: number
  ticket_medio: number
  recencia: number
  frequencia: number
  valor: number
  status: string | null
  classificacao: string | null
  descricao: string | null
}

// Componente para garantir que o mapa seja renderizado corretamente
function MapInitializer() {
  const map = useMap()
  
  useEffect(() => {
    // Forçar redraw do mapa quando estiver pronto
    const timer1 = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    
    const timer2 = setTimeout(() => {
      map.invalidateSize()
    }, 500)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [map])
  
  return null
}

// Componente para detectar clique no mapa e buscar clientes
function MapMouseTracker({ 
  geolocData, 
  onClientsFound 
}: { 
  geolocData: GeolocData[]
  onClientsFound: (clients: RFVData[] | null, position: { x: number; y: number } | null) => void 
}) {
  const MAX_CLIENTS_TO_SHOW = 5
  const RADIUS_KM = 0.5 // Raio de 500 metros para buscar clientes próximos

  // Função para calcular distância entre dois pontos (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      
      // Encontrar clientes próximos
      const nearbyClients = geolocData.filter(item => {
        const distance = calculateDistance(lat, lng, item.lat, item.lon)
        return distance <= RADIUS_KM
      })

      if (nearbyClients.length === 0) {
        onClientsFound(null, null)
        return
      }

      // Buscar dados RFV dos clientes encontrados
      const codigos = nearbyClients.map(c => c.id_cliente).filter(Boolean)
      
      if (codigos.length === 0) {
        onClientsFound(null, null)
        return
      }

      try {
        const result = await apiClient.getRFVByCodigos(codigos)
        
        if (result.error || !result.data) {
          onClientsFound(null, null)
          return
        }

        const rfvData = result.data

        // Se houver muitos clientes, mostrar apenas quantidade
        if (rfvData.length > MAX_CLIENTS_TO_SHOW) {
          onClientsFound([{
            codigo: '',
            nome_empresa: `${rfvData.length} clientes nesta área`,
            vendedor: null,
            fat_total: rfvData.reduce((sum, c) => sum + (c.fat_total || 0), 0),
            ticket_medio: 0,
            recencia: 0,
            frequencia: 0,
            valor: 0,
            status: null,
            classificacao: null,
            descricao: null,
          }], { x: e.originalEvent.clientX, y: e.originalEvent.clientY })
        } else {
          // Mostrar detalhes dos clientes
          onClientsFound(rfvData, { x: e.originalEvent.clientX, y: e.originalEvent.clientY })
        }
      } catch (error) {
        console.error('Erro ao buscar dados RFV:', error)
        onClientsFound(null, null)
      }
    }
  })

  return null
}

// Componente para adicionar o heatmap ao mapa
function HeatmapLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap()
  const heatLayerRef = useRef<any>(null)

  useEffect(() => {
    if (points.length === 0 || !map) {
      return
    }

    const createHeatmap = () => {
      // Remover layer anterior se existir
      if (heatLayerRef.current) {
        try {
          map.removeLayer(heatLayerRef.current)
        } catch (e) {
          // Ignorar erros
        }
        heatLayerRef.current = null
      }

      // Verificar se leaflet.heat está disponível
      if (typeof (L as any).heatLayer === 'undefined') {
        console.error('leaflet.heat não está disponível')
        return
      }

      try {
        const heatLayer = (L as any).heatLayer(points, {
          radius: 50,
          blur: 25,
          maxZoom: 18,
          max: 1.0,
          minOpacity: 0.3,
          gradient: {
            0.0: '#00ff00',
            0.2: '#44ff00',
            0.4: '#88ff00',
            0.6: '#ffff00',
            0.8: '#ff8800',
            1.0: '#ff0000'
          }
        })

        heatLayer.addTo(map)
        heatLayerRef.current = heatLayer
      } catch (error) {
        console.error('Erro ao criar heatmap:', error)
      }
    }

    // Aguardar mapa estar totalmente renderizado
    const timer = setTimeout(() => {
      const container = map.getContainer()
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        createHeatmap()
      } else {
        setTimeout(createHeatmap, 500)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      if (heatLayerRef.current) {
        try {
          map.removeLayer(heatLayerRef.current)
        } catch (error) {
          // Ignorar erros
        }
        heatLayerRef.current = null
      }
    }
  }, [map, points])

  return null
}

export default function Heatmap() {
  const [data, setData] = useState<GeolocData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rfvMode, setRfvMode] = useState(false)
  const [tooltipData, setTooltipData] = useState<{
    clients: RFVData[]
    position: { x: number; y: number }
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await apiClient.getGeoloc(rfvMode)

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
  }, [rfvMode])

  const handleClientsFound = (clients: RFVData[] | null, position: { x: number; y: number } | null) => {
    if (clients && position) {
      setTooltipData({ clients, position })
    } else {
      setTooltipData(null)
    }
  }

  // Calcular centro do mapa baseado nos dados
  const getMapCenter = (): [number, number] => {
    if (data.length === 0) {
      return [-14.235, -51.9253] // Centro do Brasil
    }
    
    const avgLat = data.reduce((sum, item) => sum + item.lat, 0) / data.length
    const avgLon = data.reduce((sum, item) => sum + item.lon, 0) / data.length
    
    return [avgLat, avgLon]
  }

  // Converter dados para formato do heatmap
  const heatmapData: [number, number, number][] = data.map(item => [
    item.lat,
    item.lon,
    2.0
  ])

  if (loading) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-header-controls">
          <h1 className="page-title">Heatmap de Clientes</h1>
          <div className="toggle-container">
            <button
              className={`toggle-button ${!rfvMode ? 'active' : ''}`}
              onClick={() => setRfvMode(false)}
            >
              Geral
            </button>
            <button
              className={`toggle-button ${rfvMode ? 'active' : ''}`}
              onClick={() => setRfvMode(true)}
            >
              RFV
            </button>
          </div>
        </div>
        <div className="map-loading">Carregando dados do mapa...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-header-controls">
          <h1 className="page-title">Heatmap de Clientes</h1>
          <div className="toggle-container">
            <button
              className={`toggle-button ${!rfvMode ? 'active' : ''}`}
              onClick={() => setRfvMode(false)}
            >
              Geral
            </button>
            <button
              className={`toggle-button ${rfvMode ? 'active' : ''}`}
              onClick={() => setRfvMode(true)}
            >
              RFV
            </button>
          </div>
        </div>
        <div className="map-error">Erro: {error}</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="heatmap-container">
        <div className="heatmap-header-controls">
          <h1 className="page-title">Heatmap de Clientes</h1>
          <div className="toggle-container">
            <button
              className={`toggle-button ${!rfvMode ? 'active' : ''}`}
              onClick={() => setRfvMode(false)}
            >
              Geral
            </button>
            <button
              className={`toggle-button ${rfvMode ? 'active' : ''}`}
              onClick={() => setRfvMode(true)}
            >
              RFV
            </button>
          </div>
        </div>
        <div className="map-empty">Nenhum dado de geolocalização disponível</div>
      </div>
    )
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-header-controls">
        <h1 className="page-title">Heatmap de Clientes</h1>
        <div className="toggle-container">
          <button
            className={`toggle-button ${!rfvMode ? 'active' : ''}`}
            onClick={() => setRfvMode(false)}
          >
            Geral
          </button>
          <button
            className={`toggle-button ${rfvMode ? 'active' : ''}`}
            onClick={() => setRfvMode(true)}
          >
            RFV
          </button>
        </div>
      </div>
      <div className="map-info">
        <p>Total de pontos: {data.length.toLocaleString('pt-BR')}</p>
        <p className="mode-indicator">Modo: {rfvMode ? 'RFV' : 'Geral'}</p>
      </div>
      <div className="map-wrapper">
        <MapContainer
          center={getMapCenter()}
          zoom={5}
          style={{ height: '100%', width: '100%', minHeight: '600px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapInitializer />
          {heatmapData.length > 0 && <HeatmapLayer points={heatmapData} />}
          {rfvMode && <MapMouseTracker geolocData={data} onClientsFound={handleClientsFound} />}
        </MapContainer>
      </div>
      {tooltipData && (
        <>
          <div 
            className="tooltip-backdrop"
            onClick={() => setTooltipData(null)}
          />
          <div 
            className="heatmap-tooltip"
            style={{
              left: `${tooltipData.position.x + 10}px`,
              top: `${tooltipData.position.y + 10}px`
            }}
          >
            <button 
              className="tooltip-close"
              onClick={() => setTooltipData(null)}
              aria-label="Fechar tooltip"
            >
              ×
            </button>
            {tooltipData.clients.length === 1 && tooltipData.clients[0].codigo === '' ? (
              <div className="tooltip-content">
                <p className="tooltip-title">{tooltipData.clients[0].nome_empresa}</p>
                <p className="tooltip-subtitle">
                  Faturamento total: R$ {tooltipData.clients[0].fat_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            ) : (
              <div className="tooltip-content">
                <p className="tooltip-title">{tooltipData.clients.length} {tooltipData.clients.length === 1 ? 'Cliente' : 'Clientes'}</p>
                {tooltipData.clients.map((client, index) => (
                  <div key={index} className="tooltip-client">
                    <p className="client-name">{client.nome_empresa}</p>
                    {client.vendedor && <p className="client-vendedor">Vendedor: {client.vendedor}</p>}
                    <p className="client-info">
                      RFV: R{client.recencia} F{client.frequencia} V{client.valor}
                      {client.descricao && ` - ${client.descricao}`}
                    </p>
                    <p className="client-info">
                      Faturamento: R$ {client.fat_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {client.status && <p className="client-status">Status: {client.status}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
