# 产品管理系统

🚀 基于Vue 3 + Node.js的现代化产品管理Web应用

## ✨ 功能特性

- 📊 **产品信息管理** - 支持三种销售状态的产品管理
- 🔍 **实时搜索筛选** - 多条件组合搜索，快速定位产品
- 📥 **Excel导入导出** - 批量导入产品数据，分状态导出报表
- 📝 **修改记录追踪** - 完整的操作历史记录，可追溯每次变更
- 📱 **响应式设计** - 适配PC、平板、手机等多种设备
- 🎨 **现代化UI** - 基于Element Plus的美观界面
- ⚡ **高性能** - 分页加载，虚拟滚动，极速体验

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Element Plus** - Vue 3企业级组件库
- **Pinia** - 新一代状态管理
- **Vue Router** - 官方路由管理
- **Vite** - 下一代构建工具
- **Axios** - HTTP请求库
- **XLSX** - Excel文件处理

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **Prisma** - 现代化数据库ORM
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **Multer** - 文件上传中间件

### 部署
- **Docker** - 容器化部署
- **Nginx** - 反向代理和静态文件服务
- **Docker Compose** - 多容器编排

## 🚀 快速开始

### 一键Docker部署（推荐）

```bash
# 克隆项目
git clone <项目地址>
cd product-management-system

# 一键部署
./deploy.sh
```

等待部署完成后访问：
- 🌐 前端：http://localhost:3000
- 🔧 后端API：http://localhost:3001
- ❤️ 健康检查：http://localhost:3001/api/health

### 本地开发

#### 1. 后端启动

```bash
cd backend
npm install                 # 安装依赖
npm run db:generate         # 生成Prisma客户端
npm run db:push            # 初始化数据库
npm run dev                # 启动开发服务器
```

#### 2. 前端启动

```bash
cd frontend
npm install                # 安装依赖
npm run dev               # 启动开发服务器
```

## 📁 项目结构

```
product-management-system/
├── frontend/              # Vue3前端项目
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── views/         # 页面组件
│   │   ├── stores/        # 状态管理
│   │   ├── api/           # API调用
│   │   └── router/        # 路由配置
│   ├── Dockerfile         # 前端容器配置
│   └── nginx.conf         # Nginx配置
├── backend/               # Node.js后端项目
│   ├── src/
│   │   ├── routes/        # 路由定义
│   │   ├── utils/         # 工具函数
│   │   └── server.js      # 服务器入口
│   ├── prisma/
│   │   └── schema.prisma  # 数据库模型
│   └── Dockerfile         # 后端容器配置
├── data/                  # 数据库文件目录
├── uploads/               # 文件上传目录
├── docker-compose.yml     # Docker编排配置
├── deploy.sh             # 一键部署脚本
└── README.md             # 项目说明
```

## 💡 主要功能

### 1. 产品管理
- ✅ 创建、编辑、删除产品
- ✅ 产品状态管理（可销售/不可销售/需下架）
- ✅ 完整的产品信息字段（价格、库存、描述等）
- ✅ 条形码唯一性验证

### 2. 搜索筛选
- ✅ 商品名称模糊搜索
- ✅ 品牌筛选
- ✅ 销售状态筛选  
- ✅ 条形码精确搜索
- ✅ 组合条件查询

### 3. Excel操作
- ✅ Excel文件上传预览
- ✅ 字段映射自动识别
- ✅ 批量数据导入
- ✅ 分状态导出报表
- ✅ 导入结果统计

### 4. 操作记录
- ✅ 创建、更新、删除记录
- ✅ 字段级变更追踪
- ✅ 操作时间和用户记录
- ✅ 可视化变更对比

## 🔧 配置说明

### 环境变量

#### 后端 (.env)
```bash
DATABASE_URL="file:../data/database.db"  # 数据库连接
PORT=3001                                 # 服务端口
NODE_ENV=development                      # 运行环境
JWT_SECRET=your-jwt-secret-key           # JWT密钥
UPLOAD_DIR=../uploads                    # 上传目录
```

#### 前端 (.env.local)
```bash
VITE_API_URL=http://localhost:3001       # API地址
```

### 数据库切换

默认使用SQLite，如需切换到MySQL：

1. 修改 `backend/prisma/schema.prisma`：
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

## 📚 文档

- 📖 [安装指南](INSTALL.md) - 详细的安装部署说明
- 🔗 [API文档](API.md) - 完整的API接口文档
- 🎯 [前端README](frontend/README.md) - 前端项目说明
- ⚙️ [后端README](backend/README.md) - 后端项目说明

## 🐳 Docker部署

### 开发环境
```bash
docker-compose -f docker-compose.dev.yml up
```

### 生产环境
```bash
docker-compose up -d
```

### 查看日志
```bash
docker-compose logs -f
```

### 停止服务
```bash
docker-compose down
```

## 🔐 安全特性

- 🛡️ JWT身份认证
- 🚫 请求频率限制
- 🔒 SQL注入防护
- 📁 文件上传安全检查
- 🌐 CORS跨域保护
- 🔑 敏感信息加密存储

## 📊 性能优化

- ⚡ Gzip压缩
- 📦 代码分割
- 🗂️ 分页加载
- 💾 静态资源缓存
- 🔍 数据库索引优化
- 📱 响应式图片

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 常见问题

### Q: 端口被占用怎么办？
A: 修改 `docker-compose.yml` 中的端口映射，或停止占用端口的程序。

### Q: 数据库连接失败？
A: 检查数据库文件权限，确保 `data` 目录可写。

### Q: Excel导入失败？
A: 检查Excel文件格式，确保包含必要的表头字段。

### Q: 如何备份数据？
A: SQLite直接复制 `data/database.db` 文件即可。

## 📞 技术支持

如有问题请创建 [Issue](../../issues) 或联系开发团队。

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！