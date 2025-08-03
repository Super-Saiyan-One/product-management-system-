# IP地址部署指南（无域名版本）

## 前置要求

### 服务器配置
- Ubuntu 20.04+ 或 CentOS 7+
- 最低配置：2核CPU，4GB内存，20GB存储
- 公网IP地址
- 开放端口：22（SSH）、80（前端）、3001（API）

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

# 重新登录以应用docker组权限
logout
```

### 2. 上传代码
```bash
# 方法1：使用scp上传整个项目
scp -r product-management-system/ user@YOUR_SERVER_IP:/tmp/

# 方法2：使用git clone（如果代码在仓库中）
ssh user@YOUR_SERVER_IP
git clone your-repository-url
cd product-management-system
```

### 3. 配置环境变量
```bash
# 修改前端API地址
nano frontend/.env.ip

# 将 YOUR_SERVER_IP 替换为你的实际服务器IP
# 例如：VITE_API_URL=http://123.456.789.10:3001

# 可选：修改数据库密码（.env.ip文件）
nano .env.ip
```

### 4. 一键部署
```bash
# 给部署脚本执行权限
chmod +x deploy-ip.sh

# 运行部署脚本（替换为你的实际IP）
./deploy-ip.sh 123.456.789.10
```

## 配置示例

假设你的服务器IP是 `203.0.113.100`：

### 修改前端配置
```bash
nano frontend/.env.ip

# 修改为：
VITE_API_URL=http://203.0.113.100:3001
```

### 运行部署
```bash
./deploy-ip.sh 203.0.113.100
```

## 访问地址

部署完成后，通过以下地址访问：

- **前端网站**：`http://YOUR_SERVER_IP`
- **API接口**：`http://YOUR_SERVER_IP:3001/api/health`

例如：
- 前端：`http://203.0.113.100`
- API：`http://203.0.113.100:3001/api/health`

## 服务器端口配置

### 必须开放的端口
```bash
# 使用ufw配置防火墙
sudo ufw enable
sudo ufw allow ssh          # SSH访问
sudo ufw allow 80/tcp       # 前端访问
sudo ufw allow 3001/tcp     # API访问

# 查看防火墙状态
sudo ufw status
```

### 云服务器安全组
如果使用云服务器（阿里云、腾讯云等），还需要在控制台配置安全组：

- **入方向规则**：
  - 端口22：SSH访问
  - 端口80：HTTP访问
  - 端口3001：API访问
  - 来源：0.0.0.0/0（或限制特定IP）

## 验证部署

### 1. 检查服务状态
```bash
# 查看容器状态
docker ps

# 查看服务日志
docker-compose -f /opt/product-management-system/docker-compose.ip.yml logs

# 测试API
curl http://YOUR_SERVER_IP:3001/api/health

# 测试前端
curl http://YOUR_SERVER_IP
```

### 2. 功能测试
在浏览器中访问 `http://YOUR_SERVER_IP`，测试：
- 页面正常加载
- 产品列表显示
- Excel导入功能
- 仓库管理功能

## 管理操作

### 查看日志
```bash
cd /opt/product-management-system
docker-compose -f docker-compose.ip.yml logs -f backend
docker-compose -f docker-compose.ip.yml logs -f frontend
```

### 重启服务
```bash
cd /opt/product-management-system
docker-compose -f docker-compose.ip.yml restart
```

### 停止服务
```bash
cd /opt/product-management-system
docker-compose -f docker-compose.ip.yml down
```

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

# 拉取最新代码（如果使用git）
git pull

# 重新构建并部署
docker-compose -f docker-compose.ip.yml up -d --build
```

## 常见问题

### 1. 无法访问网站
```bash
# 检查防火墙
sudo ufw status

# 检查容器状态
docker ps

# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3001
```

### 2. API连接失败
```bash
# 检查后端日志
docker-compose -f docker-compose.ip.yml logs backend

# 测试API连接
curl http://localhost:3001/api/health
```

### 3. 数据库连接问题
```bash
# 进入数据库容器
docker-compose -f docker-compose.ip.yml exec mysql mysql -u root -p

# 检查数据库日志
docker-compose -f docker-compose.ip.yml logs mysql
```

## 安全提醒

⚠️ **重要安全提醒**：

1. **HTTP协议**：此部署使用HTTP协议，数据传输未加密
2. **端口暴露**：数据库端口不应暴露到公网
3. **强密码**：务必使用强密码
4. **定期备份**：设置定期数据备份
5. **系统更新**：定期更新系统和依赖

## 后续改进

建议后续申请域名并配置HTTPS：
1. 购买域名
2. 配置DNS解析
3. 使用 `deploy-server.sh` 脚本重新部署
4. 自动获取SSL证书

## 故障排除

### 重置部署
如果部署出现问题，可以完全重置：

```bash
# 停止所有服务
docker-compose -f docker-compose.ip.yml down -v

# 清理Docker资源
docker system prune -a

# 删除应用目录
sudo rm -rf /opt/product-management-system

# 重新开始部署
```