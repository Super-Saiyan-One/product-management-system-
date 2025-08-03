import express from 'express'
import prisma from '../utils/database.js'

const router = express.Router()

// Get all warehouses
router.get('/', async (req, res) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    res.json({
      success: true,
      data: warehouses
    })
  } catch (error) {
    console.error('获取仓库列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取仓库列表失败',
      error: error.message
    })
  }
})

// Create warehouse
router.post('/', async (req, res) => {
  try {
    const { name, code, address, supplierCode } = req.body
    
    // Check if warehouse name or code already exists
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        OR: [
          { name },
          { code }
        ]
      }
    })
    
    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: '仓库名称或代码已存在'
      })
    }
    
    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        code,
        address,
        supplierCode
      }
    })
    
    res.json({
      success: true,
      data: warehouse
    })
  } catch (error) {
    console.error('创建仓库失败:', error)
    res.status(500).json({
      success: false,
      message: '创建仓库失败',
      error: error.message
    })
  }
})

// Update warehouse
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, address, supplierCode, isActive } = req.body
    
    // Check if warehouse name or code already exists (excluding current warehouse)
    const existingWarehouse = await prisma.warehouse.findFirst({
      where: {
        AND: [
          { id: { not: parseInt(id) } },
          {
            OR: [
              { name },
              { code }
            ]
          }
        ]
      }
    })
    
    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: '仓库名称或代码已存在'
      })
    }
    
    const warehouse = await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        address,
        supplierCode,
        isActive
      }
    })
    
    res.json({
      success: true,
      data: warehouse
    })
  } catch (error) {
    console.error('更新仓库失败:', error)
    res.status(500).json({
      success: false,
      message: '更新仓库失败',
      error: error.message
    })
  }
})

// Delete warehouse (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const warehouse = await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false
      }
    })
    
    res.json({
      success: true,
      data: warehouse
    })
  } catch (error) {
    console.error('删除仓库失败:', error)
    res.status(500).json({
      success: false,
      message: '删除仓库失败',
      error: error.message
    })
  }
})

// Get warehouse by name (for auto-fill functionality)
router.get('/by-name/:name', async (req, res) => {
  try {
    const { name } = req.params
    
    const warehouse = await prisma.warehouse.findFirst({
      where: {
        name: decodeURIComponent(name),
        isActive: true
      }
    })
    
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: '仓库不存在'
      })
    }
    
    res.json({
      success: true,
      data: warehouse
    })
  } catch (error) {
    console.error('获取仓库信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取仓库信息失败',
      error: error.message
    })
  }
})

// Get warehouse-supplier bindings with core fields only
router.get('/bindings', async (req, res) => {
  try {
    const bindings = await prisma.warehouse.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        code: true,
        supplierCode: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    res.json({
      success: true,
      data: bindings
    })
  } catch (error) {
    console.error('获取仓库-供货商绑定关系失败:', error)
    res.status(500).json({
      success: false,
      message: '获取仓库-供货商绑定关系失败',
      error: error.message
    })
  }
})

// Get all suppliers for dropdown
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    res.json({
      success: true,
      data: suppliers
    })
  } catch (error) {
    console.error('获取供货商列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取供货商列表失败',
      error: error.message
    })
  }
})

// Update warehouse-supplier binding
router.post('/update-binding/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { supplierCode } = req.body
    
    // Verify supplier exists
    if (supplierCode) {
      const supplier = await prisma.supplier.findUnique({
        where: { code: supplierCode }
      })
      
      if (!supplier) {
        return res.status(400).json({
          success: false,
          message: '供货商不存在'
        })
      }
    }
    
    const warehouse = await prisma.warehouse.update({
      where: { id: parseInt(id) },
      data: {
        supplierCode: supplierCode || null
      }
    })
    
    res.json({
      success: true,
      data: warehouse
    })
  } catch (error) {
    console.error('更新仓库-供货商绑定关系失败:', error)
    res.status(500).json({
      success: false,
      message: '更新仓库-供货商绑定关系失败',
      error: error.message
    })
  }
})

// Bulk update warehouse-supplier bindings
router.post('/update-bindings', async (req, res) => {
  try {
    const { bindings } = req.body
    
    const results = await Promise.all(
      bindings.map(async ({ warehouseId, supplierCode }) => {
        try {
          // Verify supplier exists
          if (supplierCode) {
            const supplier = await prisma.supplier.findUnique({
              where: { code: supplierCode }
            })
            
            if (!supplier) {
              return {
                success: false,
                warehouseId,
                error: '供货商不存在'
              }
            }
          }
          
          const warehouse = await prisma.warehouse.update({
            where: { id: parseInt(warehouseId) },
            data: {
              supplierCode: supplierCode || null
            }
          })
          
          return {
            success: true,
            warehouse
          }
        } catch (error) {
          return {
            success: false,
            warehouseId,
            error: error.message
          }
        }
      })
    )
    
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    res.json({
      success: true,
      data: {
        successful: successful.length,
        failed: failed.length,
        failedItems: failed
      }
    })
  } catch (error) {
    console.error('批量更新仓库-供货商绑定关系失败:', error)
    res.status(500).json({
      success: false,
      message: '批量更新仓库-供货商绑定关系失败',
      error: error.message
    })
  }
})

// Create or update supplier
router.post('/suppliers', async (req, res) => {
  try {
    const { code, name, contactInfo } = req.body
    
    // Check if supplier code already exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { code }
    })
    
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: '供货商代码已存在'
      })
    }
    
    const supplier = await prisma.supplier.create({
      data: {
        code,
        name,
        contactInfo
      }
    })
    
    res.json({
      success: true,
      data: supplier
    })
  } catch (error) {
    console.error('创建供货商失败:', error)
    res.status(500).json({
      success: false,
      message: '创建供货商失败',
      error: error.message
    })
  }
})

export default router