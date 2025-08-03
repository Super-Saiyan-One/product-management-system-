# 产品管理系统 - 项目总结文档

## 项目概述
产品管理系统是一个全栈Web应用，用于管理产品信息、仓库库存和更新历史。系统采用前后端分离架构，支持Excel批量导入和完整的CRUD操作。

## 技术架构

### 前端技术栈
- **框架**: Vue.js 3 + Composition API
- **构建工具**: Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **部署**: Nginx (Docker容器化)

### 后端技术栈
- **运行时**: Node.js 18
- **框架**: Express.js
- **数据库ORM**: Prisma
- **数据库**: MySQL 8.0
- **认证**: JWT
- **文件上传**: Multer
- **部署**: Docker容器化

### 基础设施
- **容器化**: Docker + Docker Compose
- **数据持久化**: Docker Volumes
- **反向代理**: Nginx (前端静态资源)

## 项目结构

```
product-management-system/
├── frontend/                    # Vue.js前端应用
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   │   ├── ExcelUpload.vue
│   │   │   └── ProductForm.vue
│   │   ├── views/             # 页面组件
│   │   │   ├── ProductList.vue
│   │   │   ├── ProductEdit.vue
│   │   │   ├── UpdateHistory.vue
│   │   │   └── AllUpdateHistory.vue
│   │   ├── stores/            # Pinia状态管理
│   │   ├── api/               # API接口封装
│   │   └── router/            # 路由配置
│   ├── Dockerfile             # 前端Docker配置
│   ├── nginx.conf             # Nginx配置
│   └── vite.config.js         # Vite配置
│
├── backend/                    # Node.js后端API
│   ├── src/
│   │   ├── routes/            # API路由
│   │   │   ├── products.js    # 产品相关API
│   │   │   ├── warehouses.js  # 仓库相关API
│   │   │   ├── upload.js      # 文件上传API
│   │   │   ├── users.js       # 用户相关API
│   │   │   └── records.js     # 操作记录API
│   │   ├── models/            # 数据模型
│   │   ├── middleware/        # 中间件
│   │   ├── services/          # 业务逻辑
│   │   └── utils/             # 工具函数
│   ├── prisma/                # 数据库Schema和迁移
│   │   ├── schema.prisma      # Prisma数据模型定义
│   │   └── migrations/        # 数据库迁移文件
│   ├── data/                  # SQLite开发数据库
│   ├── Dockerfile             # 后端Docker配置
│   └── server.js              # 应用入口文件
│
├── uploads/                   # 文件上传目录
├── data/                      # 数据库数据目录
├── docker-compose.yml         # Docker服务编排
├── deploy.sh                  # 一键部署脚本
└── README.md                  # 项目说明
```

## 核心功能模块

### 1. 产品管理
- 产品CRUD操作
- 产品分类管理
- 产品状态跟踪

### 2. 库存管理
- 多仓库支持
- 库存增减记录
- 库存预警

### 3. 文件导入
- Excel批量导入产品
- 数据验证和错误处理
- 导入历史记录

### 4. 操作记录
- 完整的操作审计日志
- 按用户/时间筛选
- 操作详情查看

### 5. 用户认证
- JWT Token认证
- 用户权限管理
- 登录状态保持

## 数据模型

### 主要实体关系
- **Product** (产品) ←→ **Warehouse** (仓库) ←→ **Inventory** (库存)
- **User** (用户) ←→ **OperationRecord** (操作记录)
- **UploadHistory** (上传历史) ←→ **User**

## 依赖清单

### 前端依赖
```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.4.0",
    "element-plus": "^2.3.0",
    "@element-plus/icons-vue": "^2.1.0",
    "xlsx": "^0.18.0"
  }
}
```

### 后端依赖
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.0",
    "multer": "^1.4.0",
    "cors": "^2.8.0",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.0",
    "xlsx": "^0.18.0"
  }
}
```

### 系统依赖
- Docker & Docker Compose
- Node.js 18+ (开发环境)
- MySQL 8.0 (或SQLite用于开发)

## 部署方式

### 1. 生产环境部署
```bash
# 克隆代码
git clone <repository-url>
cd product-management-system

# 一键部署
chmod +x deploy.sh
./deploy.sh

# 访问地址
# 前端: http://localhost:3002
# 后端API: http://localhost:3001
```

### 2. 开发环境部署
```bash
# 启动数据库
docker-compose up mysql -d

# 后端开发
cd backend
npm install
npm run dev

# 前端开发
npm install
npm run dev
```

### 3. Docker服务配置
- **MySQL**: 端口3307→3306，持久化存储
- **Backend**: 端口3001，连接MySQL
- **Frontend**: 端口3002→80，Nginx静态文件服务

### 4. 环境变量
```bash
# 后端环境变量
NODE_ENV=production
DATABASE_URL=mysql://root:password@mysql:3306/product_management
JWT_SECRET=your-super-secret-jwt-key
PORT=3001

# 前端环境变量
VITE_API_URL=http://localhost:3001
```

## 数据持久化

### Docker Volumes
- `mysql_data`: MySQL数据持久化
- `uploads`: 上传文件持久化
- 本地目录挂载: `./uploads:/app/uploads`

### 备份策略
- 数据库: 定期备份MySQL数据卷
- 上传文件: 直接备份本地uploads目录

## 开发工作流

### 1. 代码更新流程
1. 修改代码
2. 测试本地功能
3. 重新构建镜像: `docker-compose up --build -d`
4. 或使用部署脚本: `./deploy.sh`

### 2. 数据库迁移
```bash
# 开发环境
cd backend
npx prisma migrate dev

# 生产环境
npx prisma migrate deploy
```

### 3. 调试和日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 扩展指南

### 1. 添加新功能
- 后端: 在`src/routes/`添加新路由文件
- 前端: 在`src/views/`添加新页面，在`src/api/`添加API接口

### 2. 数据库修改
- 修改`prisma/schema.prisma`
- 运行`npx prisma migrate dev`
- 更新相关API和前端组件

### 3. 部署到新环境
- 修改环境变量
- 更新数据库连接配置
- 调整端口映射

## 故障排除

### 常见问题
1. **端口冲突**: 修改docker-compose.yml中的端口映射
2. **权限问题**: 确保uploads和data目录权限正确
3. **数据库连接**: 检查DATABASE_URL配置
4. **构建失败**: 清理Docker缓存 `docker system prune -a`

### 健康检查
- 后端健康检查: `http://localhost:3001/api/health`
- 前端访问: `http://localhost:3002`
- 数据库连接: 通过后端API测试

---

*最后更新: 2025年8月2日*
*文档版本: v1.0*