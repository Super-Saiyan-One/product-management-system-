# 产品管理系统 - 后端

基于Node.js + Express + Prisma的RESTful API服务

## 技术栈

- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **Prisma** - 现代化ORM
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **XLSX** - Excel处理
- **Multer** - 文件上传

## 功能特性

- ✅ RESTful API设计
- 🔐 JWT身份认证
- 📊 Excel导入导出
- 📝 操作记录追踪
- 🚀 高性能查询
- 🛡️ 安全中间件

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 环境配置

创建 `.env` 文件：

```bash
DATABASE_URL="file:../data/database.db"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
UPLOAD_DIR=../uploads
```

### 数据库初始化

```bash
# 生成Prisma客户端
npm run db:generate

# 推送数据库结构
npm run db:push

# 查看数据库（可选）
npm run db:studio
```

### 开发环境

```bash
npm run dev
```

### 生产环境

```bash
npm start
```

## API文档

### 产品管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/products | 获取产品列表 |
| GET | /api/products/:id | 获取产品详情 |
| POST | /api/products | 创建产品 |
| PUT | /api/products/:id | 更新产品 |
| DELETE | /api/products/:id | 删除产品 |
| POST | /api/products/import | 导入Excel |
| GET | /api/products/export | 导出Excel |
| GET | /api/products/:id/records | 获取修改记录 |

### 用户管理

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/users/register | 用户注册 |
| POST | /api/users/login | 用户登录 |
| GET | /api/users/profile | 获取用户信息 |

### 文件上传

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/upload/excel | 上传Excel文件 |

## 项目结构

```
src/
├── routes/              # 路由定义
│   ├── products.js      # 产品路由
│   ├── users.js         # 用户路由
│   └── upload.js        # 上传路由
├── models/              # 数据模型（Prisma）
├── services/            # 业务逻辑
├── middleware/          # 中间件
├── utils/               # 工具函数
│   └── database.js      # 数据库连接
└── server.js            # 服务器入口
```

## 数据库设计

### 产品表 (products)

| 字段 | 类型 | 描述 |
|------|------|------|
| id | Int | 主键 |
| name | String | 商品名称 |
| brand | String | 品牌 |
| barcode | String | 条形码 |
| status | String | 销售状态 |
| marketPrice | Float | 市场价 |
| salePrice | Float | 销本价 |
| purchasePrice | Float | 采购价 |
| ... | ... | 其他字段 |

### 修改记录表 (update_records)

| 字段 | 类型 | 描述 |
|------|------|------|
| id | Int | 主键 |
| productId | Int | 产品ID |
| action | String | 操作类型 |
| changes | String | 变更内容 |
| userId | Int | 操作用户 |
| createdAt | DateTime | 创建时间 |

## 切换到MySQL

如需使用MySQL替代SQLite：

1. 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

2. 更新环境变量：

```bash
DATABASE_URL="mysql://username:password@localhost:3306/product_management"
```

3. 重新生成客户端：

```bash
npm run db:generate
npm run db:migrate
```

## 部署

### Docker部署

```bash
docker build -t product-backend .
docker run -p 3001:3001 product-backend
```

### PM2部署

```bash
npm install -g pm2
pm2 start src/server.js --name product-backend
```

## 安全考虑

- JWT令牌安全
- 请求频率限制
- 文件上传安全
- SQL注入防护（Prisma自动处理）
- XSS防护

## 监控

- 健康检查：GET /api/health
- 日志记录：console输出
- 错误追踪：统一错误处理

## 开发调试

```bash
# 查看数据库
npm run db:studio

# 重置数据库
npm run db:push --force-reset

# 查看日志
tail -f logs/app.log
```