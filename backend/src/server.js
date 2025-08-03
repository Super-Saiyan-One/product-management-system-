import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'

import productRoutes from './routes/products.js'
import userRoutes from './routes/users.js'
import uploadRoutes from './routes/upload.js'
import recordRoutes from './routes/records.js'
import warehouseRoutes from './routes/warehouses.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(compression())

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:5173'] 
    : true,
  credentials: true
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: '请求过于频繁，请稍后再试'
})
app.use(limiter)

app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/records', recordRoutes)
app.use('/api/warehouses', warehouseRoutes)

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API接口不存在' 
  })
})

app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误' 
  })
})

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
  console.log(`环境: ${process.env.NODE_ENV}`)
})