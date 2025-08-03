import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
})

export default prisma

export async function connectDatabase() {
  try {
    await prisma.$connect()
    console.log('数据库连接成功')
  } catch (error) {
    console.error('数据库连接失败:', error)
    process.exit(1)
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect()
  console.log('数据库连接已断开')
}

process.on('beforeExit', async () => {
  await disconnectDatabase()
})