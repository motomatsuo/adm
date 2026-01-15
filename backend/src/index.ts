import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import rfvRoutes from './routes/rfv.js'
import geolocRoutes from './routes/geoloc.js'
import vendedoresRoutes from './routes/vendedores.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/rfv', rfvRoutes)
app.use('/api/geoloc', geolocRoutes)
app.use('/api/vendedores', vendedoresRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`)
})
