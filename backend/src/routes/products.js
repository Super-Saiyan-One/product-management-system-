import express from 'express'
import prisma from '../utils/database.js'
import XLSX from 'xlsx'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      size = 20, 
      name, 
      statusNote,
      status, 
      barcode, 
      brand,
      shippingCode,
      supplierCode,
      warehouseName,
      createdStartDate,
      createdEndDate,
      startDate,
      endDate,
      updateStartDate,
      updateEndDate,
      sortBy,
      sortOrder
    } = req.query

    const where = {}
    if (name) where.name = { contains: name }
    if (statusNote) where.statusNote = { contains: statusNote }
    if (status) where.status = status
    if (barcode) where.barcode = { contains: barcode }
    if (brand) where.brand = { contains: brand }
    if (shippingCode) where.shippingCode = { contains: shippingCode }
    if (supplierCode) where.supplierCode = { contains: supplierCode }
    if (warehouseName) where.warehouseName = { contains: warehouseName }
    
    // 创建时间范围过滤
    if (createdStartDate && createdEndDate) {
      where.createdAt = {
        gte: new Date(createdStartDate),
        lte: new Date(createdEndDate)
      }
    } else if (createdStartDate) {
      where.createdAt = { gte: new Date(createdStartDate) }
    } else if (createdEndDate) {
      where.createdAt = { lte: new Date(createdEndDate) }
    }
    
    // 更新时间范围过滤
    if (updateStartDate && updateEndDate) {
      where.updatedAt = {
        gte: new Date(updateStartDate),
        lte: new Date(updateEndDate)
      }
    } else if (updateStartDate) {
      where.updatedAt = { gte: new Date(updateStartDate) }
    } else if (updateEndDate) {
      where.updatedAt = { lte: new Date(updateEndDate) }
    }

    const offset = (parseInt(page) - 1) * parseInt(size)
    const limit = parseInt(size)

    const orderBy = {}
    if (sortBy && sortOrder) {
      orderBy[sortBy] = sortOrder
    } else {
      orderBy.updatedAt = 'desc'
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy
      }),
      prisma.product.count({ where })
    ])

    res.json({
      success: true,
      data: products,
      total,
      page: parseInt(page),
      size: parseInt(size)
    })
  } catch (error) {
    console.error('获取产品列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取产品列表失败'
    })
  }
})


router.get('/export', async (req, res) => {
  try {
    console.log('Export route accessed')
    const { status } = req.query
    
    const where = status ? { status } : {}
    const products = await prisma.product.findMany({ 
      where,
      orderBy: { updatedAt: 'desc' }
    })

    console.log(`Found ${products.length} products for export`)

    const workbook = XLSX.utils.book_new()
    
    // 按销售状态分组
    const statusGroups = {
      'saleable': [],
      'non-saleable': [],
      'saleable-pending-removal': [],
      'to-be-removed': []
    }
    
    products.forEach(product => {
      if (statusGroups[product.status]) {
        statusGroups[product.status].push(product)
      }
    })

    const statusNames = {
      'saleable': '可销售',
      'non-saleable': '不可销售',
      'saleable-pending-removal': '可销售（后续需下架）',
      'to-be-removed': '需下架'
    }

    // 为每个销售状态创建一个sheet
    Object.keys(statusGroups).forEach(statusKey => {
      const statusProducts = statusGroups[statusKey]
      
      const excelData = statusProducts.map(product => ({
        '创建时间': product.createdAt ? new Date(product.createdAt).toLocaleString('zh-CN') : '',
        '产品状态/备注': product.statusNote || '',
        '销售状态': statusNames[product.status] || product.status || '',
        '质检证书': product.hasQualityCert ? '是' : '否',
        '商品名称': product.name || '',
        '品牌': product.brand || '',
        '条形码': product.barcode || '',
        '发货代码': product.shippingCode || '',
        '商品介绍': product.description || '',
        '产品亮点': product.highlights || '',
        '市场价': product.marketPrice || '',
        '销售价': product.salePrice || '',
        '采购价': product.purchasePrice || '',
        '最低采购价': product.minPurchasePrice || '',
        '运费': product.shippingFee || '',
        '仓库代码': product.warehouseCode || '',
        '供货商代码': product.supplierCode || '',
        '发货仓库': product.warehouseName || '',
        '老发货代码1': product.oldShippingCode1 || '',
        '老发货代码2': product.oldShippingCode2 || ''
      }))

      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      // 设置列宽
      const cols = [
        { wch: 20 }, // 创建时间
        { wch: 18 }, // 产品状态/备注
        { wch: 15 }, // 销售状态
        { wch: 10 }, // 质检证书
        { wch: 30 }, // 商品名称
        { wch: 15 }, // 品牌
        { wch: 15 }, // 条形码
        { wch: 12 }, // 发货代码
        { wch: 30 }, // 商品介绍
        { wch: 30 }, // 产品亮点
        { wch: 12 }, // 市场价
        { wch: 12 }, // 销售价
        { wch: 12 }, // 采购价
        { wch: 15 }, // 最低采购价
        { wch: 10 }, // 运费
        { wch: 12 }, // 仓库代码
        { wch: 15 }, // 供货商代码
        { wch: 15 }, // 发货仓库
        { wch: 12 }, // 老代码1
        { wch: 12 }  // 老代码2
      ]
      worksheet['!cols'] = cols
      
      XLSX.utils.book_append_sheet(workbook, worksheet, statusNames[statusKey])
    })

    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=products_by_status_${new Date().toISOString().split('T')[0]}.xlsx`)
    res.send(excelBuffer)
  } catch (error) {
    console.error('导出失败:', error)
    res.status(500).json({
      success: false,
      message: '导出失败'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      })
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('获取产品详情失败:', error)
    res.status(500).json({
      success: false,
      message: '获取产品详情失败'
    })
  }
})

router.post('/', async (req, res) => {
  try {
    // 检查发货代码是否已存在
    if (req.body.shippingCode) {
      const existingProduct = await prisma.product.findUnique({
        where: { shippingCode: req.body.shippingCode }
      })
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '发货代码已存在',
          duplicateProduct: {
            id: existingProduct.id,
            name: existingProduct.name,
            shippingCode: existingProduct.shippingCode,
            brand: existingProduct.brand
          }
        })
      }
    }

    const product = await prisma.product.create({
      data: req.body
    })
    
    await prisma.updateRecord.create({
      data: {
        productId: product.id,
        action: 'create',
        changes: JSON.stringify(req.body),
        userId: req.user?.id
      }
    })

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('创建产品失败:', error)
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: '条形码已存在'
      })
    }
    
    res.status(500).json({
      success: false,
      message: '创建产品失败'
    })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    const oldProduct = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!oldProduct) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      })
    }

    // 检查发货代码是否已存在（排除当前产品）
    if (req.body.shippingCode && req.body.shippingCode !== oldProduct.shippingCode) {
      const existingProduct = await prisma.product.findUnique({
        where: { shippingCode: req.body.shippingCode }
      })
      
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: '发货代码已存在',
          duplicateProduct: {
            id: existingProduct.id,
            name: existingProduct.name,
            shippingCode: existingProduct.shippingCode,
            brand: existingProduct.brand
          }
        })
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: req.body
    })

    const changes = compareObjects(oldProduct, req.body)
    if (Object.keys(changes).length > 0) {
      await prisma.updateRecord.create({
        data: {
          productId,
          action: 'update',
          oldValues: JSON.stringify(oldProduct),
          newValues: JSON.stringify(req.body),
          changes: JSON.stringify(changes),
          userId: req.user?.id
        }
      })
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('更新产品失败:', error)
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: '条形码已存在'
      })
    }
    
    res.status(500).json({
      success: false,
      message: '更新产品失败'
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    console.log('收到删除请求，产品ID:', productId)
    
    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: '无效的产品ID'
      })
    }
    
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      console.log('产品不存在，ID:', productId)
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      })
    }

    console.log('开始删除产品:', product.name)
    await prisma.product.delete({
      where: { id: productId }
    })

    // 记录删除操作
    try {
      await prisma.updateRecord.create({
        data: {
          productId,
          action: 'delete',
          oldValues: JSON.stringify(product),
          userId: req.user?.id || null
        }
      })
    } catch (recordError) {
      console.warn('记录删除操作失败:', recordError)
    }

    console.log('产品删除成功，ID:', productId)
    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除产品失败:', error)
    res.status(500).json({
      success: false,
      message: `删除产品失败: ${error.message}`
    })
  }
})

router.post('/import', async (req, res) => {
  try {
    const { products } = req.body
    
    let successCount = 0
    let failureCount = 0
    const errors = []
    const createdWarehouses = new Set()

    for (const [index, productData] of products.entries()) {
      try {
        if (!productData.name) {
          throw new Error('商品名称不能为空')
        }


        if (productData.shippingCode) {
          const existing = await prisma.product.findUnique({
            where: { shippingCode: productData.shippingCode }
          })
          if (existing) {
            throw new Error(`发货代码 ${productData.shippingCode} 已存在 (产品: ${existing.name})`)
          }
        }

        // 检查并自动创建仓库三元组
        if (productData.warehouseName && productData.warehouseCode && productData.supplierCode) {
          const warehouseKey = `${productData.warehouseName}|${productData.warehouseCode}|${productData.supplierCode}`
          
          if (!createdWarehouses.has(warehouseKey)) {
            // 检查仓库是否已存在
            const existingWarehouse = await prisma.warehouse.findFirst({
              where: {
                OR: [
                  { name: productData.warehouseName },
                  { code: productData.warehouseCode }
                ]
              }
            })

            if (!existingWarehouse) {
              // 创建新仓库
              try {
                await prisma.warehouse.create({
                  data: {
                    name: productData.warehouseName,
                    code: productData.warehouseCode,
                    supplierCode: productData.supplierCode
                  }
                })
                console.log(`自动创建仓库: ${productData.warehouseName} (${productData.warehouseCode})`)
                createdWarehouses.add(warehouseKey)
              } catch (warehouseError) {
                console.warn(`创建仓库失败: ${warehouseError.message}`)
                // 仓库创建失败不影响产品导入
              }
            } else {
              // 仓库已存在，检查是否需要更新供货商代码
              if (existingWarehouse.supplierCode !== productData.supplierCode) {
                try {
                  await prisma.warehouse.update({
                    where: { id: existingWarehouse.id },
                    data: { supplierCode: productData.supplierCode }
                  })
                  console.log(`更新仓库供货商代码: ${existingWarehouse.name}`)
                } catch (updateError) {
                  console.warn(`更新仓库供货商代码失败: ${updateError.message}`)
                }
              }
              createdWarehouses.add(warehouseKey)
            }
          }
        }

        const product = await prisma.product.create({
          data: productData
        })

        await prisma.updateRecord.create({
          data: {
            productId: product.id,
            action: 'create',
            changes: JSON.stringify(productData),
            userId: req.user?.id
          }
        })

        successCount++
      } catch (error) {
        failureCount++
        errors.push(`第${index + 1}行: ${error.message}`)
      }
    }

    // 统计创建的仓库数量
    const warehouseCount = createdWarehouses.size
    console.log(`导入完成: 产品成功${successCount}个，失败${failureCount}个，处理仓库${warehouseCount}个`)

    res.json({
      success: true,
      successCount,
      failureCount,
      errors,
      warehouseCount
    })
  } catch (error) {
    console.error('导入失败:', error)
    res.status(500).json({
      success: false,
      message: '导入过程中发生错误'
    })
  }
})

router.get('/:id/records', async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    
    const records = await prisma.updateRecord.findMany({
      where: { productId },
      include: {
        product: {
          select: { name: true }
        },
        user: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: records
    })
  } catch (error) {
    console.error('获取修改记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取修改记录失败'
    })
  }
})


function compareObjects(oldObj, newObj) {
  const changes = {}
  
  Object.keys(newObj).forEach(key => {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = {
        old: oldObj[key],
        new: newObj[key]
      }
    }
  })
  
  return changes
}

export default router