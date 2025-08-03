#!/bin/bash

# 服务器部署命令集合
# 服务器信息：192.144.128.67 root用户

echo "======================================="
echo "    在服务器上部署产品管理系统"
echo "    服务器IP: 192.144.128.67"
echo "======================================="

# 1. 连接服务器并安装基础环境
echo "1. 安装Docker和基础环境..."
cat << 'EOF'
# 在服务器上执行以下命令：

# 更新系统
apt update && apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version

# 启动Docker服务
systemctl enable docker
systemctl start docker
EOF

echo ""
echo "2. 上传项目文件到服务器..."
echo "使用以下命令上传项目："
echo "scp -r product-management-system/ root@192.144.128.67:/opt/"

echo ""
echo "3. 在服务器上部署..."
cat << 'EOF'
# 在服务器上执行：
cd /opt/product-management-system

# 给脚本执行权限
chmod +x deploy-ip.sh

# 运行部署
./deploy-ip.sh 192.144.128.67
EOF

echo ""
echo "4. 配置防火墙（如果需要）..."
cat << 'EOF'
# 开放必要端口
ufw allow ssh
ufw allow 80/tcp
ufw allow 3001/tcp
ufw --force enable
EOF

echo ""
echo "5. 部署完成后访问地址："
echo "   网站前端：http://192.144.128.67"
echo "   API接口：http://192.144.128.67:3001/api/health"

echo "======================================="