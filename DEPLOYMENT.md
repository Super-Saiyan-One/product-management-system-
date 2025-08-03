# 服务器部署指南

## 前置要求

### 服务器配置
- Ubuntu 20.04+ 或 CentOS 7+
- 最低配置：2核CPU，4GB内存，20GB存储
- 推荐配置：4核CPU，8GB内存，50GB存储

### 域名和DNS
- 已注册的域名
- DNS A记录指向服务器IP
- 可选：www子域名CNAME记录

## 快速部署

### 1. 服务器初始化
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装Nginx和Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# 重新登录以应用docker组权限
```

### 2. 上传代码
```bash
# 方法1：使用scp上传整个项目
scp -r product-management-system/ user@your-server:/tmp/

# 方法2：使用git clone
git clone your-repository-url
cd product-management-system
```

### 3. 配置环境变量
```bash
# 复制并编辑生产环境配置
cp .env.production .env.production.local
nano .env.production.local

# 必须修改以下值：
# MYSQL_ROOT_PASSWORD=你的安全密码
# MYSQL_PASSWORD=你的应用密码  
# JWT_SECRET=你的JWT密钥
# DOMAIN=你的域名

# 修改前端API地址
nano frontend/.env.production
# 将 your-domain.com 替换为你的实际域名
```

### 4. 一键部署
```bash
# 给部署脚本执行权限
chmod +x deploy-server.sh

# 运行部署脚本
./deploy-server.sh your-domain.com
```

## 手动部署步骤

如果自动部署失败，可以手动执行以下步骤：

### 1. 配置Nginx
```bash
# 复制Nginx配置
sudo cp nginx-server.conf /etc/nginx/sites-available/product-management

# 修改域名
sudo sed -i 's/your-domain.com/实际域名/g' /etc/nginx/sites-available/product-management

# 启用站点
sudo ln -sf /etc/nginx/sites-available/product-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

### 2. 获取SSL证书
```bash
# 获取Let's Encrypt证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. 启动应用
```bash
# 使用生产环境配置启动
docker-compose -f docker-compose.prod.yml --env-file .env.production.local up -d --build
```

## 部署后配置

### 1. 验证部署
```bash
# 检查服务状态
docker-compose -f docker-compose.prod.yml ps

# 检查日志
docker-compose -f docker-compose.prod.yml logs

# 测试API
curl https://your-domain.com/api/health

# 测试前端
curl https://your-domain.com
```

### 2. 安全加固
```bash
# 配置防火墙
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# 禁用不必要的端口
sudo ufw deny 3001
sudo ufw deny 3002
sudo ufw deny 3306
```

### 3. 监控配置
```bash
# 查看资源使用
docker stats

# 设置日志监控
tail -f /opt/product-management-system/logs/app.log
```

## 维护操作

### 数据备份
```bash
# 手动备份
/usr/local/bin/backup-product-management.sh

# 查看备份文件
ls -la /opt/backups/product-management/
```

### 更新应用
```bash
cd /opt/product-management-system

# 拉取最新代码
git pull

# 重新构建并部署
docker-compose -f docker-compose.prod.yml up -d --build
```

### 扩容配置
```bash
# 如需要可以调整docker-compose.prod.yml中的资源限制
# 例如：
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 常见问题

### 1. SSL证书问题
```bash
# 手动续期证书
sudo certbot renew

# 检查证书状态
sudo certbot certificates
```

### 2. 服务无法启动
```bash
# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# 检查Docker日志
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

### 3. 数据库连接问题
```bash
# 进入数据库容器
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p

# 检查数据库状态
docker-compose -f docker-compose.prod.yml exec mysql mysqladmin -u root -p status
```

### 4. 性能优化
```bash
# 清理Docker资源
docker system prune -a

# 查看磁盘使用
df -h
du -sh /opt/product-management-system/
```

## 安全建议

1. **定期更新系统和依赖**
2. **使用强密码**
3. **启用防火墙**
4. **定期备份数据**
5. **监控系统日志**
6. **使用非root用户运行应用**

## 支持
如有部署问题，请查看：
- 应用日志：`/opt/product-management-system/logs/`
- Nginx日志：`/var/log/nginx/`
- 系统日志：`journalctl -u docker`