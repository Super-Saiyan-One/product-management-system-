import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/database.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名、邮箱和密码不能为空'
      })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或邮箱已存在'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    })

    const { password: _, ...userWithoutPassword } = user

    res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: '注册成功'
    })
  } catch (error) {
    console.error('注册失败:', error)
    res.status(500).json({
      success: false,
      message: '注册失败'
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      })
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '密码错误'
      })
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: '登录成功'
    })
  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({
      success: false,
      message: '登录失败'
    })
  }
})

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    })
  }
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问令牌不存在'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '访问令牌无效'
      })
    }
    req.user = user
    next()
  })
}

export default router
export { authenticateToken }