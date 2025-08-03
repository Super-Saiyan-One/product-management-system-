# 产品管理系统 - 安装指南

## 快速开始（推荐）

### 一键Docker部署

```bash
# 克隆项目
git clone <项目地址>
cd product-management-system

# 一键部署
./deploy.sh
```

访问 http://localhost:3000

## 手动安装

### 环境要求

- Node.js >= 16
- npm >= 8
- Git

### 1. 克隆项目

```bash
git clone <项目地址>
cd product-management-system
```

### 2. 安装后端

```bash
cd backend
npm install
cp .env.example .env  # 配置环境变量
npm run db:generate
npm run db:push
npm run dev  # 开发环境
# 或
npm start   # 生产环境
```

### 3. 安装前端

```bash
cd ../frontend
npm install
npm run dev  # 开发环境
# 或
npm run build && npm run preview  # 生产环境
```

### 4. 访问应用

- 前端：http://localhost:5173 (开发) / http://localhost:3000 (生产)
- 后端：http://localhost:3001
- API文档：http://localhost:3001/api/health

## Docker部署

### 使用docker-compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 单独构建

```bash
# 构建前端
cd frontend
docker build -t product-frontend .

# 构建后端
cd ../backend
docker build -t product-backend .

# 运行
docker run -d -p 3000:80 product-frontend
docker run -d -p 3001:3001 product-backend
```

## 生产环境部署

### 服务器要求

- CPU: 2核
- 内存: 4GB
- 硬盘: 20GB SSD
- 系统: Ubuntu 20.04+ / CentOS 7+

### 部署步骤

1. **安装Docker**

```bash
# Ubuntu
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装docker-compose
sudo pip3 install docker-compose
```

2. **克隆代码**

```bash
git clone <项目地址>
cd product-management-system
```

3. **配置环境**

```bash
# 修改生产环境配置
cp backend/.env.example backend/.env
nano backend/.env
```

4. **部署**

```bash
chmod +x deploy.sh
./deploy.sh
```

5. **配置反向代理（可选）**

```nginx
# /etc/nginx/sites-available/product-management
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 数据库配置

### 使用SQLite（默认）

无需额外配置，开箱即用。

### 切换到MySQL

1. **安装MySQL**

```bash
# Ubuntu
sudo apt install mysql-server

# 创建数据库
mysql -u root -p
CREATE DATABASE product_management;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON product_management.* TO 'app_user'@'localhost';
```

2. **修改配置**

```bash
# backend/prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

# backend/.env
DATABASE_URL="mysql://app_user:password@localhost:3306/product_management"
```

3. **迁移数据库**

```bash
cd backend
npm run db:generate
npm run db:migrate
```

## 常见问题

### 1. 端口冲突

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"    # 前端改为8080
  - "8081:3001"  # 后端改为8081
```

### 2. 权限问题

```bash
sudo chown -R $USER:$USER data uploads
chmod 755 data uploads
```

### 3. 内存不足

增加Node.js内存限制：

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 4. 数据库连接失败

检查数据库文件权限：

```bash
ls -la data/database.db
chmod 664 data/database.db
```

## 监控和维护

### 日志查看

```bash
# Docker日志
docker-compose logs -f

# 应用日志
tail -f backend/logs/app.log
```

### 备份数据

```bash
# SQLite备份
cp data/database.db backup/database_$(date +%Y%m%d).db

# MySQL备份
mysqldump -u app_user -p product_management > backup.sql
```

### 更新应用

```bash
git pull
docker-compose down
docker-compose up --build -d
```

## 性能优化

### 1. 启用Gzip压缩

已在nginx配置中启用。

### 2. 数据库索引

关键字段已添加索引，如需优化查询可添加复合索引。

### 3. 缓存配置

可配置Redis缓存来提升性能：

```yaml
# docker-compose.yml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
```

## 安全配置

### 1. 更改默认密钥

```bash
# 生成随机JWT密钥
openssl rand -base64 32
```

### 2. 防火墙配置

```bash
# Ubuntu
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. SSL证书（推荐）

使用Let's Encrypt配置HTTPS：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```