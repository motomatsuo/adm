import express from 'express'
import { supabase } from '../lib/supabase.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

interface LoginPortalUser {
  id: number
  email_vend: string
  senha_vend: string
  nome: string
  funcao: string
  status: string
  foto_perfil: string | null
  online: boolean | null
  grupo: string[] | null
  id_hubla: string | null
  id_protheus: string | null
  disponivel: string
}

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const { data, error } = await supabase
      .from('db_login_portal')
      .select('*')
      .eq('email_vend', email)
      .single()

    if (error || !data) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    const user = data as LoginPortalUser

    if (user.senha_vend !== password) {
      return res.status(401).json({ error: 'Email ou senha inválidos' })
    }

    if (user.status && user.status.toLowerCase() === 'inativo') {
      return res.status(403).json({ error: 'Usuário inativo' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email_vend,
        nome: user.nome,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      user: {
        id: user.id.toString(),
        email: user.email_vend,
        nome: user.nome,
        funcao: user.funcao,
        foto_perfil: user.foto_perfil,
      },
      session: {
        access_token: token,
      },
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
})

router.post('/signout', async (req, res) => {
  try {
    res.json({ message: 'Logout realizado com sucesso' })
  } catch (error: any) {
    res.json({ message: 'Logout realizado com sucesso' })
  }
})

router.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.json({ user: null })
    }

    const token = authHeader.replace('Bearer ', '')

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number
        email: string
        nome: string
      }

      const { data, error } = await supabase
        .from('db_login_portal')
        .select('id, email_vend, nome, funcao, foto_perfil, status')
        .eq('id', decoded.id)
        .single()

      if (error || !data) {
        return res.json({ user: null })
      }

      const user = data as LoginPortalUser

      if (user.status && user.status.toLowerCase() === 'inativo') {
        return res.json({ user: null })
      }

      res.json({
        user: {
          id: user.id.toString(),
          email: user.email_vend,
          nome: user.nome,
          funcao: user.funcao,
          foto_perfil: user.foto_perfil,
        },
      })
    } catch (jwtError) {
      return res.json({ user: null })
    }
  } catch (error: any) {
    res.json({ user: null })
  }
})

export default router
