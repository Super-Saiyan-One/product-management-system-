#!/bin/bash

# 手动部署脚本（不依赖sshpass）
SERVER_IP="192.144.128.67"

echo "======================================="
echo "    手动部署到服务器"
echo "    IP: $SERVER_IP"
echo "======================================="

echo "1. 打包项目..."
tar -czf ../product-management-system.tar.gz . 2>/dev/null || {
    echo "使用简单打包方式..."
    cd ..
    tar -czf product-management-system.tar.gz product-management-system/
    cd product-management-system
}

echo "2. 项目已打包为: ../product-management-system.tar.gz"

echo ""
echo "请手动执行以下步骤："
echo ""

echo "步骤1: 上传项目到服务器"
echo "scp ../product-management-system.tar.gz root@$SERVER_IP:/tmp/"
echo "密码: H|Crkz-%9K8f;/A"
echo ""

echo "步骤2: 连接到服务器"
echo "ssh root@$SERVER_IP"
echo "密码: H|Crkz-%9K8f;/A"
echo ""

echo "步骤3: 在服务器上执行以下命令："
cat << 'EOF'
# 解压项目
cd /tmp
tar -xzf product-management-system.tar.gz
rm -rf /opt/product-management-system
mkdir -p /opt
mv product-management-system /opt/

# 安装Docker（如果没有安装）
if ! command -v docker &> /dev/null; then
    echo "安装Docker..."
    apt update
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # 安装Docker Compose
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # 启动Docker
    systemctl enable docker
    systemctl start docker
    
    echo "Docker安装完成"
fi

# 配置防火墙
if command -v ufw &> /dev/null; then
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 3001/tcp
    ufw --force enable
    echo "防火墙配置完成"
fi

# 进入项目目录
cd /opt/product-management-system

# 给脚本执行权限
chmod +x deploy-ip.sh

# 部署应用
./deploy-ip.sh 192.144.128.67

echo ""
echo "🎉 部署完成！"
echo ""
echo "访问地址："
echo "  前端: http://192.144.128.67"
echo "  API:  http://192.144.128.67:3001/api/health"
EOF

echo ""
echo "======================================="
echo "部署完成后，您可以访问："
echo "  网站: http://192.144.128.67"
echo "  API:  http://192.144.128.67:3001/api/health"
echo "======================================="