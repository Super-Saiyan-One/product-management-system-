import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleWarehouses = [
  {
    name: '深圳仓库',
    code: 'WH001',
    address: '深圳市南山区科技园',
    supplierCode: 'SUP001'
  },
  {
    name: '北京仓库', 
    code: 'WH002',
    address: '北京市朝阳区望京',
    supplierCode: 'SUP002'
  },
  {
    name: '上海仓库',
    code: 'WH003', 
    address: '上海市浦东新区张江',
    supplierCode: 'SUP003'
  },
  {
    name: '广州仓库',
    code: 'WH004',
    address: '广州市天河区珠江新城',
    supplierCode: 'SUP004'
  },
  {
    name: '杭州仓库',
    code: 'WH005',
    address: '杭州市西湖区文三路',
    supplierCode: 'SUP005'
  }
]

async function main() {
  console.log('开始插入仓库样本数据...')
  
  // 清除现有仓库数据
  await prisma.warehouse.deleteMany({})
  
  // 插入仓库数据
  for (const warehouse of sampleWarehouses) {
    const createdWarehouse = await prisma.warehouse.create({
      data: warehouse
    })
    console.log(`插入仓库: ${warehouse.name}`)
  }
  
  console.log('仓库样本数据插入完成！')
}

main()
  .catch((e) => {
    console.error('插入仓库数据时发生错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })