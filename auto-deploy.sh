#!/bin/bash

# 自动部署到服务器脚本
# 服务器：192.144.128.67

SERVER_IP="192.144.128.67"
SERVER_USER="root"
SERVER_PASS="H|Crkz-%9K8f;/A"

echo "======================================="
echo "    自动部署到服务器"
echo "    IP: $SERVER_IP"
echo "======================================="

# 检查sshpass是否安装
if ! command -v sshpass &> /dev/null; then
    echo "安装sshpass..."
    # macOS
    if command -v brew &> /dev/null; then
        brew install hudochenkov/sshpass/sshpass
    # Ubuntu/Debian
    elif command -v apt &> /dev/null; then
        sudo apt install -y sshpass
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y sshpass
    else
        echo "请手动安装sshpass"
        exit 1
    fi
fi

echo "1. 打包项目..."
tar -czf ../product-management-system.tar.gz . --exclude='.git' --exclude='**/node_modules' --exclude='logs' --exclude='uploads' || tar -czf ../product-management-system.tar.gz .

echo "2. 上传项目到服务器..."
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no ../product-management-system.tar.gz root@$SERVER_IP:/tmp/

echo "3. 在服务器上解压和安装..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'ENDSSH'
# 进入目录
cd /tmp

# 解压项目
tar -xzf product-management-system.tar.gz
rm -rf /opt/product-management-system
mv product-management-system /opt/

# 进入项目目录
cd /opt/product-management-system

# 检查Docker是否安装
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
fi

# 配置防火墙
if command -v ufw &> /dev/null; then
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 3001/tcp
    ufw --force enable
fi

# 给脚本执行权限
chmod +x deploy-ip.sh

# 部署应用
./deploy-ip.sh 192.144.128.67

echo "部署完成！"
echo "访问地址："
echo "  前端: http://192.144.128.67"
echo "  API:  http://192.144.128.67:3001/api/health"
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署成功！"
    echo ""
    echo "📱 访问地址："
    echo "   网站: http://192.144.128.67"
    echo "   API:  http://192.144.128.67:3001/api/health"
    echo ""
    echo "🔧 管理命令（在服务器上执行）："
    echo "   查看状态: cd /opt/product-management-system && docker-compose -f docker-compose.ip.yml ps"
    echo "   查看日志: cd /opt/product-management-system && docker-compose -f docker-compose.ip.yml logs -f"
    echo "   重启服务: cd /opt/product-management-system && docker-compose -f docker-compose.ip.yml restart"
else
    echo "❌ 部署失败，请检查错误信息"
fi

echo "======================================="