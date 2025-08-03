import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    // maintainTime: new Date('2024-01-15T09:30:00Z'),
    statusNote: '正常销售中，库存充足',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    barcode: '194253106029',
    shippingCode: 'SC001',
    description: '6.1英寸超视网膜XDR显示屏，钛金属设计，A17 Pro芯片',
    highlights: '强劲A17 Pro芯片，专业级摄像头系统，USB-C接口',
    status: 'saleable',
    hasQualityCert: true,
    marketPrice: 8999.00,
    salePrice: 8599.00,
    purchasePrice: 7800.00,
    minPurchasePrice: 7500.00,
    shippingFee: 15.00,
    warehouseCode: 'WH001',
    supplierCode: 'SUP001',
    warehouseName: '深圳仓库',
    oldShippingCode1: 'OSC001',
    oldShippingCode2: 'OSC002'
  },
  {
    // maintainTime: new Date('2024-01-20T14:15:00Z'),
    statusNote: '热销产品，需补货',
    name: '华为Mate 60 Pro',
    brand: '华为',
    barcode: '6901443701459',
    shippingCode: 'SC002',
    description: '6.82英寸OLED曲面屏，麒麟9000S芯片，5G网络',
    highlights: '5000万像素主摄，5000mAh大电池，66W快充',
    status: 'saleable',
    hasQualityCert: true,
    marketPrice: 6999.00,
    salePrice: 6599.00,
    purchasePrice: 5800.00,
    minPurchasePrice: 5500.00,
    shippingFee: 12.00,
    warehouseCode: 'WH002',
    supplierCode: 'SUP002',
    warehouseName: '北京仓库',
    oldShippingCode1: 'OSC003',
    oldShippingCode2: 'OSC004'
  },
  {
    // maintainTime: new Date('2024-01-18T11:45:00Z'),
    statusNote: '待质检认证完成',
    name: '小米14 Ultra',
    brand: '小米',
    barcode: '6934177793813',
    shippingCode: 'SC003',
    description: '6.73英寸2K屏幕，骁龙8 Gen3处理器，徕卡影像',
    highlights: '徕卡四摄影像系统，90W有线充电，IP68防水',
    status: 'non-saleable',
    hasQualityCert: false,
    marketPrice: 5999.00,
    salePrice: 5699.00,
    purchasePrice: 4900.00,
    minPurchasePrice: 4600.00,
    shippingFee: 10.00,
    warehouseCode: 'WH003',
    supplierCode: 'SUP003',
    warehouseName: '上海仓库',
    oldShippingCode1: 'OSC005',
    oldShippingCode2: 'OSC006'
  },
  {
    // maintainTime: new Date('2024-01-25T16:20:00Z'),
    statusNote: '库存积压，准备下架处理',
    name: 'OPPO Find X7 Ultra',
    brand: 'OPPO',
    barcode: '6944284681347',
    shippingCode: 'SC004',
    description: '6.82英寸2K曲面屏，骁龙8 Gen3芯片，哈苏影像',
    highlights: '哈苏摄影系统，100W超级闪充，潜望式长焦',
    status: 'to-be-removed',
    hasQualityCert: true,
    marketPrice: 5999.00,
    salePrice: 5399.00,
    purchasePrice: 4600.00,
    minPurchasePrice: 4300.00,
    shippingFee: 8.00,
    warehouseCode: 'WH001',
    supplierCode: 'SUP004',
    warehouseName: '深圳仓库',
    oldShippingCode1: 'OSC007',
    oldShippingCode2: 'OSC008'
  },
  {
    // maintainTime: new Date('2024-01-22T10:30:00Z'),
    statusNote: '新品上架，销量良好',
    name: 'vivo X100 Pro',
    brand: 'vivo',
    barcode: '6939699153847',
    shippingCode: 'SC005',
    description: '6.78英寸2K屏，天玑9300处理器，蔡司光学',
    highlights: '蔡司影像系统，120W快充，V3影像芯片',
    status: 'saleable',
    hasQualityCert: true,
    marketPrice: 4999.00,
    salePrice: 4699.00,
    purchasePrice: 4000.00,
    minPurchasePrice: 3800.00,
    shippingFee: 9.00,
    warehouseCode: 'WH002',
    supplierCode: 'SUP005',
    warehouseName: '北京仓库',
    oldShippingCode1: 'OSC009',
    oldShippingCode2: 'OSC010'
  },
  {
    // maintainTime: new Date('2024-01-28T13:50:00Z'),
    statusNote: '高端旗舰，稳定销售',
    name: '三星Galaxy S24 Ultra',
    brand: '三星',
    barcode: '8806095442273',
    shippingCode: 'SC006',
    description: '6.8英寸Dynamic AMOLED 2X显示屏，骁龙8 Gen3',
    highlights: 'S Pen手写笔，2亿像素主摄，AI功能',
    status: 'saleable',
    hasQualityCert: true,
    marketPrice: 9999.00,
    salePrice: 9299.00,
    purchasePrice: 8200.00,
    minPurchasePrice: 7900.00,
    shippingFee: 18.00,
    warehouseCode: 'WH003',
    supplierCode: 'SUP006',
    warehouseName: '上海仓库',
    oldShippingCode1: 'OSC011',
    oldShippingCode2: 'OSC012'
  },
  {
    // maintainTime: new Date('2024-01-30T08:15:00Z'),
    statusNote: 'MacBook系列热销款',
    name: 'MacBook Air M3',
    brand: 'Apple',
    barcode: '195949115749',
    shippingCode: 'SC007',
    description: '13.6英寸Liquid视网膜显示屏，M3芯片，轻薄便携',
    highlights: '超长续航，静音设计，快速启动，M3芯片',
    status: 'saleable',
    hasQualityCert: true,
    marketPrice: 8999.00,
    salePrice: 8599.00,
    purchasePrice: 7500.00,
    minPurchasePrice: 7200.00,
    shippingFee: 20.00,
    warehouseCode: 'WH001',
    supplierCode: 'SUP001',
    warehouseName: '深圳仓库',
    oldShippingCode1: 'OSC013',
    oldShippingCode2: 'OSC014'
  },
  {
    // maintainTime: new Date('2024-01-26T15:40:00Z'),
    statusNote: '系统兼容性问题待解决',
    name: '戴尔XPS 13',
    brand: '戴尔',
    barcode: '884116398394',
    shippingCode: 'SC008',
    description: '13.4英寸InfinityEdge显示屏，Intel酷睿处理器',
    highlights: '超窄边框，全天候续航，商务设计',
    status: 'non-saleable',
    hasQualityCert: false,
    marketPrice: 7999.00,
    salePrice: 7499.00,
    purchasePrice: 6500.00,
    minPurchasePrice: 6200.00,
    shippingFee: 16.00,
    warehouseCode: 'WH002',
    supplierCode: 'SUP007',
    warehouseName: '北京仓库',
    oldShippingCode1: 'OSC015',
    oldShippingCode2: 'OSC016'
  }
]

async function main() {
  console.log('开始插入样本数据...')
  
  // 删除现有数据
  await prisma.updateRecord.deleteMany({})
  await prisma.product.deleteMany({})
  
  // 插入产品数据，并为每个创建不同的时间戳
  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i]
    
    // 为每个产品设置不同的创建和更新时间
    const createdAt = new Date(Date.now() - (sampleProducts.length - i) * 24 * 60 * 60 * 1000) // 每个产品间隔1天
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000) // 随机更新时间
    
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        createdAt,
        updatedAt
      }
    })
    
    // 创建对应的更新记录
    await prisma.updateRecord.create({
      data: {
        productId: createdProduct.id,
        action: 'create',
        changes: JSON.stringify(product),
        createdAt
      }
    })
    
    console.log(`插入产品: ${product.name}`)
  }
  
  console.log('样本数据插入完成！')
}

main()
  .catch((e) => {
    console.error('插入数据时发生错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })