import express from 'express'
import prisma from '../utils/database.js'

const router = express.Router()

// 获取所有修改记录
router.get('/', async (req, res) => {
  try {
    const { page = 1, size = 20, action, productId } = req.query
    const skip = (page - 1) * size
    const take = parseInt(size)
    
    // 构建查询条件
    const where = {}
    if (action) where.action = action
    if (productId) where.productId = parseInt(productId)
    
    const [records, total] = await Promise.all([
      prisma.updateRecord.findMany({
        where,
        include: {
          product: {
            select: { name: true, id: true }
          },
          user: {
            select: { username: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.updateRecord.count({ where })
    ])

    res.json({
      success: true,
      data: records,
      total,
      page: parseInt(page),
      size: take
    })
  } catch (error) {
    console.error('获取所有修改记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取所有修改记录失败'
    })
  }
})

export default router