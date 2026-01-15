import express from 'express'
import { supabase } from '../lib/supabase.js'

const router = express.Router()

interface RFVData {
  id: number
  codigo: string
  nome_empresa: string
  vendedor: string | null
  qtd_pedido: number
  fat_total: number
  ticket_medio: number
  pri_compra: string | null
  ult_compra: string | null
  int_compra: number | null
  dduc: number | null
  recencia: number
  frequencia: number
  valor: number
  media_nota: number | null
  status: string | null
  acao: string | null
  ranking: string | null
  rec_freq: number | null
  id_atendente: number | null
  documento: string | null
  cs_ativo: boolean | null
  classificacao: string | null
  descricao: string | null
  tp_comercio: string | null
}

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('db_rfv')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

router.get('/valor', async (req, res) => {
  try {
    const { classificacao, status } = req.query
    
    let query = supabase.from('db_rfv').select('valor, classificacao, status')
    
    if (classificacao && classificacao !== 'null') {
      query = query.eq('classificacao', classificacao as string)
    }
    
    if (status && status !== 'null') {
      query = query.eq('status', status as string)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const valores = data.reduce((acc: Record<number, number>, item: any) => {
      const valor = item.valor || 0
      acc[valor] = (acc[valor] || 0) + 1
      return acc
    }, {})

    const result = Object.entries(valores)
      .map(([valor, quantidade]) => ({
        valor: parseInt(valor),
        quantidade: quantidade as number,
      }))
      .sort((a, b) => a.valor - b.valor)

    res.json({ data: result })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

router.get('/recencia-frequencia', async (req, res) => {
  try {
    const { classificacao, valor, status } = req.query
    
    let query = supabase.from('db_rfv').select('recencia, frequencia, classificacao, valor, status')
    
    if (classificacao && classificacao !== 'null') {
      query = query.eq('classificacao', classificacao as string)
    }
    
    if (valor && valor !== 'null') {
      query = query.eq('valor', parseInt(valor as string))
    }
    
    if (status && status !== 'null') {
      query = query.eq('status', status as string)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    // Agrupar por combinação de recência e frequência
    const combinacoes = data.reduce((acc: Record<string, number>, item: any) => {
      const recencia = item.recencia || 0
      const frequencia = item.frequencia || 0
      const key = `${recencia}-${frequencia}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const result = Object.entries(combinacoes).map(([key, quantidade]) => {
      const [recencia, frequencia] = key.split('-').map(Number)
      return {
        recencia,
        frequencia,
        quantidade: quantidade as number,
      }
    })

    res.json({ data: result })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

router.get('/status', async (req, res) => {
  try {
    const { classificacao, valor } = req.query
    
    let query = supabase.from('db_rfv').select('status, classificacao, valor')
    
    if (classificacao && classificacao !== 'null') {
      query = query.eq('classificacao', classificacao as string)
    }
    
    if (valor && valor !== 'null') {
      query = query.eq('valor', parseInt(valor as string))
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const status = data.reduce((acc: Record<string, number>, item: any) => {
      const statusValue = item.status || 'Sem status'
      acc[statusValue] = (acc[statusValue] || 0) + 1
      return acc
    }, {})

    const result = Object.entries(status)
      .map(([status, quantidade]) => ({
        status,
        quantidade: quantidade as number,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)

    res.json({ data: result })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

// Rota específica deve vir antes da rota com parâmetro
router.get('/classificacao', async (req, res) => {
  try {
    const { valor, status } = req.query
    
    let query = supabase.from('db_rfv').select('classificacao, descricao, valor, status')
    
    if (valor && valor !== 'null') {
      query = query.eq('valor', parseInt(valor as string))
    }
    
    if (status && status !== 'null') {
      query = query.eq('status', status as string)
    }

    const { data, error } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    const classificacoes = data.reduce((acc: Record<string, { quantidade: number; descricao: string }>, item: any) => {
      const classificacao = item.classificacao || 'Sem classificação'
      const descricao = item.descricao || classificacao
      
      if (!acc[classificacao]) {
        acc[classificacao] = { quantidade: 0, descricao }
      }
      acc[classificacao].quantidade += 1
      return acc
    }, {})

    const result = Object.entries(classificacoes).map(([classificacao, info]) => ({
      classificacao,
      descricao: info.descricao,
      quantidade: info.quantidade,
    }))

    res.json({ data: result })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

// Rota para buscar RFV por códigos (id_cliente)
router.post('/by-codigos', async (req, res) => {
  try {
    const { codigos } = req.body

    if (!codigos || !Array.isArray(codigos) || codigos.length === 0) {
      return res.json({ data: [] })
    }

    // Limitar a 100 códigos por vez para evitar queries muito grandes
    const codigosLimitados = codigos.slice(0, 100)

    const { data, error } = await supabase
      .from('db_rfv')
      .select('codigo, nome_empresa, vendedor, fat_total, ticket_medio, recencia, frequencia, valor, status, classificacao, descricao')
      .in('codigo', codigosLimitados)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ data: data || [] })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data, error } = await supabase
      .from('db_rfv')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return res.status(404).json({ error: 'Registro não encontrado' })
    }

    res.json({ data })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

export default router
