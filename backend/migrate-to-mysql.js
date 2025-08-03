import { PrismaClient } from '@prisma/client'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

// SQLite连接
const sqliteDb = new sqlite3.Database('../data/database.db')
const sqliteGet = promisify(sqliteDb.get.bind(sqliteDb))
const sqliteAll = promisify(sqliteDb.all.bind(sqliteDb))

// MySQL连接 (确保先启动MySQL)
const mysql = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://root:password@localhost:3306/product_management"
    }
  }
})

async function migrateData() {
  try {
    console.log('开始数据迁移...')
    
    // 1. 迁移产品数据
    console.log('迁移产品数据...')
    const products = await sqliteAll('SELECT * FROM products')
    for (const product of products) {
      await mysql.product.create({
        data: {
          id: product.id,
          maintainTime: new Date(product.maintainTime),
          statusNote: product.statusNote,
          status: product.status,
          hasQualityCert: Boolean(product.hasQualityCert),
          name: product.name,
          brand: product.brand,
          barcode: product.barcode,
          shippingCode: product.shippingCode,
          description: product.description,
          highlights: product.highlights,
          marketPrice: product.marketPrice,
          salePrice: product.salePrice,
          purchasePrice: product.purchasePrice,
          minPurchasePrice: product.minPurchasePrice,
          shippingFee: product.shippingFee,
          warehouseCode: product.warehouseCode,
          supplierCode: product.supplierCode,
          warehouseName: product.warehouseName,
          oldShippingCode1: product.oldShippingCode1,
          oldShippingCode2: product.oldShippingCode2,
          createdAt: new Date(product.createdAt),
          updatedAt: new Date(product.updatedAt)
        }
      })
    }
    console.log(`迁移了 ${products.length} 个产品`)
    
    // 2. 迁移更新记录
    console.log('迁移更新记录...')
    const updateRecords = await sqliteAll('SELECT * FROM update_records')
    for (const record of updateRecords) {
      await mysql.updateRecord.create({
        data: {
          id: record.id,
          productId: record.productId,
          action: record.action,
          oldValues: record.oldValues,
          newValues: record.newValues,
          changes: record.changes,
          userId: record.userId,
          createdAt: new Date(record.createdAt)
        }
      })
    }
    console.log(`迁移了 ${updateRecords.length} 个更新记录`)
    
    // 3. 迁移用户数据
    console.log('迁移用户数据...')
    const users = await sqliteAll('SELECT * FROM users')
    for (const user of users) {
      await mysql.user.create({
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          role: user.role,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        }
      })
    }
    console.log(`迁移了 ${users.length} 个用户`)
    
    // 4. 迁移品牌数据
    console.log('迁移品牌数据...')
    const brands = await sqliteAll('SELECT * FROM brands')
    for (const brand of brands) {
      await mysql.brand.create({
        data: {
          id: brand.id,
          name: brand.name,
          code: brand.code,
          createdAt: new Date(brand.createdAt)
        }
      })
    }
    console.log(`迁移了 ${brands.length} 个品牌`)
    
    // 5. 迁移仓库数据
    console.log('迁移仓库数据...')
    const warehouses = await sqliteAll('SELECT * FROM warehouses')
    for (const warehouse of warehouses) {
      await mysql.warehouse.create({
        data: {
          id: warehouse.id,
          code: warehouse.code,
          name: warehouse.name,
          address: warehouse.address,
          createdAt: new Date(warehouse.createdAt)
        }
      })
    }
    console.log(`迁移了 ${warehouses.length} 个仓库`)
    
    // 6. 迁移供应商数据
    console.log('迁移供应商数据...')
    const suppliers = await sqliteAll('SELECT * FROM suppliers')
    for (const supplier of suppliers) {
      await mysql.supplier.create({
        data: {
          id: supplier.id,
          code: supplier.code,
          name: supplier.name,
          contactInfo: supplier.contactInfo,
          createdAt: new Date(supplier.createdAt)
        }
      })
    }
    console.log(`迁移了 ${suppliers.length} 个供应商`)
    
    console.log('数据迁移完成！')
    
  } catch (error) {
    console.error('迁移失败:', error)
  } finally {
    await mysql.$disconnect()
    sqliteDb.close()
  }
}

migrateData()