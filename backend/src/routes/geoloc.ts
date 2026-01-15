import express from 'express'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { rfv } = req.query
    
    let query = supabase
      .from('db_cliente_geoloc')
      .select('id, id_cliente, lat, lon')
      .not('lat', 'is', null)
      .not('lon', 'is', null)

    // Se rfv=true, filtrar apenas clientes que estão na tabela db_rfv
    // db_rfv.codigo = db_cliente_geoloc.id_cliente
    if (rfv === 'true') {
      // Buscar todos os códigos RFV e fazer filtro em memória
      // Isso evita problemas com URI muito longa e não requer foreign key
      const { data: rfvData, error: rfvError } = await supabase
        .from('db_rfv')
        .select('codigo')

      if (rfvError) {
        return res.status(500).json({ error: rfvError.message })
      }

      if (!rfvData || rfvData.length === 0) {
        return res.json({ data: [] })
      }

      const codigos = new Set(
        rfvData
          .map(item => item.codigo)
          .filter((codigo): codigo is string => Boolean(codigo) && typeof codigo === 'string')
      )

      // Buscar todos os dados de geoloc e filtrar em memória
      const { data: allGeoloc, error: geolocError } = await supabase
        .from('db_cliente_geoloc')
        .select('id, id_cliente, lat, lon')
        .not('lat', 'is', null)
        .not('lon', 'is', null)

      if (geolocError) {
        return res.status(500).json({ error: geolocError.message })
      }

      const filteredData = (allGeoloc || []).filter((item: any) =>
        codigos.has(item.id_cliente)
      )

      const validData = filteredData
        .filter((item: any) => {
          const lat = parseFloat(item.lat)
          const lon = parseFloat(item.lon)
          return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
        })
        .map((item: any) => ({
          id: item.id,
          id_cliente: item.id_cliente,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }))

      return res.json({ data: validData })
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Filtrar e converter para números, garantindo que lat/lon são válidos
    const validData = data
      .filter((item: any) => {
        const lat = parseFloat(item.lat)
        const lon = parseFloat(item.lon)
        return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
      })
      .map((item: any) => ({
        id: item.id,
        id_cliente: item.id_cliente,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }))

    res.json({ data: validData })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

export default router
