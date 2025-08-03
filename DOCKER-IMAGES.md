# Docker镜像部署指南

## 概述

我为您创建了完整的Docker镜像解决方案，包括：
1. **数据库初始化脚本** - 自动创建所有必要的表和索引
2. **预构建镜像** - 可以推送到Docker Hub供他人使用
3. **一键部署脚本** - 直接拉取镜像部署

## MySQL数据库说明

### 当前MySQL使用方式

系统使用官方MySQL 8.0镜像，通过以下方式初始化：

```yaml
services:
  mysql:
    image: mysql:8.0
    volumes:
      - ./mysql/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

### 自动初始化功能

**`mysql/init.sql`** 包含完整的数据库结构：

1. **创建所有表**：
   - `products` - 产品表
   - `warehouses` - 仓库表
   - `users` - 用户表
   - `brands` - 品牌表
   - `suppliers` - 供应商表
   - `update_records` - 更新记录表

2. **创建索引** - 优化查询性能
3. **插入示例数据** - 品牌、仓库、供应商基础数据
4. **Prisma迁移记录** - 兼容Prisma ORM

### 数据持久化

```yaml
volumes:
  - mysql_data:/var/lib/mysql  # 数据持久化
  - ./mysql-backup:/backup     # 备份目录
```

## Docker镜像构建

### 1. 构建镜像

```bash
# 修改 build-images.sh 中的用户名
nano build-images.sh
# 将 "your-dockerhub-username" 替换为你的Docker Hub用户名

# 构建所有镜像
./build-images.sh v1.0.0 your-dockerhub-username
```

### 2. 推送到Docker Hub

```bash
# 登录Docker Hub
docker login

# 推送镜像
docker push your-dockerhub-username/product-management-backend:latest
docker push your-dockerhub-username/product-management-frontend:latest
```

## 部署方式

### 方式1：使用预构建镜像（推荐）

```bash
# 1. 修改镜像名称
nano docker-compose.hub.yml
# 修改 BACKEND_IMAGE 和 FRONTEND_IMAGE

# 2. 一键部署
./deploy-docker.sh 192.168.1.100 \
  your-dockerhub-username/product-management-backend:latest \
  your-dockerhub-username/product-management-frontend:latest
```

### 方式2：本地构建

```bash
# 使用本地构建
docker-compose -f docker-compose.hub.yml up -d --build
```

## 镜像说明

### 后端镜像特性
- **基础镜像**：node:18-alpine
- **安全**：使用非root用户运行
- **健康检查**：自动检测服务状态
- **体积优化**：仅包含生产依赖

### 前端镜像特性
- **多阶段构建**：构建阶段 + 运行阶段
- **Nginx优化**：静态文件服务
- **环境配置**：支持IP和域名版本
- **压缩优化**：Gzip压缩

### MySQL配置
- **自动初始化**：首次启动自动创建表
- **示例数据**：预置品牌、仓库等基础数据
- **性能优化**：创建必要索引
- **字符集**：UTF8MB4支持中文和emoji

## 环境变量配置

### 必需配置
```bash
# 数据库配置
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_PASSWORD=your_app_password

# JWT密钥
JWT_SECRET=your_jwt_secret

# 镜像配置
BACKEND_IMAGE=your-dockerhub-username/product-management-backend:latest
FRONTEND_IMAGE=your-dockerhub-username/product-management-frontend:latest
```

### 可选配置
```bash
# 端口配置
FRONTEND_PORT=80
BACKEND_PORT=3001
MYSQL_PORT=3306

# 构建环境
BUILD_ENV=ip  # 或 production
```

## 快速开始示例

### 1. 用户A：构建并推送镜像
```bash
# 构建镜像
./build-images.sh v1.0.0 mycompany

# 推送到Docker Hub
docker push mycompany/product-management-backend:v1.0.0
docker push mycompany/product-management-frontend:v1.0.0
```

### 2. 用户B：拉取镜像部署
```bash
# 直接使用镜像部署
./deploy-docker.sh 192.168.1.100 \
  mycompany/product-management-backend:v1.0.0 \
  mycompany/product-management-frontend:v1.0.0
```

## 数据迁移和备份

### 导出现有数据
```bash
# 导出数据
docker exec mysql-container mysqldump -u root -p product_management > backup.sql
```

### 导入数据到新环境
```bash
# 导入数据
docker exec -i mysql-container mysql -u root -p product_management < backup.sql
```

## 故障排除

### 检查服务状态
```bash
# 查看所有服务
docker-compose -f docker-compose.hub.yml ps

# 查看日志
docker-compose -f docker-compose.hub.yml logs backend
docker-compose -f docker-compose.hub.yml logs frontend
docker-compose -f docker-compose.hub.yml logs mysql
```

### 重置数据库
```bash
# 删除数据卷（注意：会丢失所有数据）
docker-compose -f docker-compose.hub.yml down -v
docker-compose -f docker-compose.hub.yml up -d
```

## 优势

1. **一键部署**：拉取镜像即可运行
2. **版本管理**：支持多版本镜像
3. **数据持久化**：自动数据库初始化
4. **环境隔离**：完全容器化
5. **易于分发**：通过Docker Hub分享

这样，您就可以将整个系统打包成镜像，任何人都可以通过简单的docker pull和运行命令来部署您的产品管理系统了！