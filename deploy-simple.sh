#!/bin/bash
set -e

echo "======================================="
echo "    产品管理系统简化部署脚本"
echo "======================================="

# 安装Docker和Docker Compose
if ! command -v docker &> /dev/null; then
    echo "安装Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker && systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    echo "安装Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 克隆项目
echo "克隆项目..."
cd /opt
[ -d "product-management-system" ] && rm -rf product-management-system
git clone https://github.com/Super-Saiyan-One/product-management-system-.git
mv product-management-system- product-management-system
cd product-management-system

# 启动服务
echo "启动服务..."
docker-compose -f docker-compose.ip.yml up -d --build

# 等待启动
sleep 30

echo "🎉 部署完成！访问: http://$(curl -s ifconfig.me || echo '你的服务器IP')"