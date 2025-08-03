#!/bin/bash

# 产品管理系统服务器部署脚本
# 使用方法: ./deploy-server.sh [domain]

set -e

DOMAIN=${1:-"your-domain.com"}
APP_DIR="/opt/product-management-system"
BACKUP_DIR="/opt/backups/product-management"

echo "======================================="
echo "    产品管理系统服务器部署脚本"
echo "    域名: $DOMAIN"
echo "======================================="

# 检查是否为root用户
if [[ $EUID -eq 0 ]]; then
   echo "请不要使用root用户运行此脚本" 
   exit 1
fi

# 检查Docker环境
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p $APP_DIR/logs
sudo mkdir -p $APP_DIR/uploads
sudo mkdir -p $APP_DIR/mysql-backup

# 复制应用文件
echo "📋 复制应用文件..."
sudo cp -r ./* $APP_DIR/
sudo chown -R $USER:$USER $APP_DIR

# 切换到应用目录
cd $APP_DIR

# 检查环境变量文件
if [ ! -f .env.production ]; then
    echo "❌ 请先配置 .env.production 文件"
    echo "参考模板："
    cat .env.production
    exit 1
fi

# 加载环境变量
source .env.production

# 验证关键环境变量
if [ -z "$MYSQL_ROOT_PASSWORD" ] || [ "$MYSQL_ROOT_PASSWORD" = "your_secure_root_password_here" ]; then
    echo "❌ 请在 .env.production 中设置安全的 MYSQL_ROOT_PASSWORD"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_super_secure_jwt_secret_key_change_this_in_production" ]; then
    echo "❌ 请在 .env.production 中设置安全的 JWT_SECRET"
    exit 1
fi

# 配置Nginx
echo "🔧 配置Nginx..."
sudo cp nginx-server.conf /etc/nginx/sites-available/product-management
sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/product-management
sudo ln -sf /etc/nginx/sites-available/product-management /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 检查Nginx配置
sudo nginx -t

# 启动Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# 获取SSL证书
echo "🔒 配置SSL证书..."
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
    echo "获取Let's Encrypt证书..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
else
    echo "SSL证书已存在"
fi

# 停止旧服务
echo "🔧 停止旧服务..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# 构建并启动服务
echo "🏗️  构建并启动服务..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

if curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ 前端服务启动成功"
else
    echo "❌ 前端服务启动失败"
    docker-compose -f docker-compose.prod.yml logs frontend
    exit 1
fi

# 设置自动备份
echo "💾 配置自动备份..."
cat > /tmp/backup-script.sh << EOF
#!/bin/bash
BACKUP_DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_\$BACKUP_DATE.sql"

# 数据库备份
docker exec \$(docker-compose -f $APP_DIR/docker-compose.prod.yml ps -q mysql) \
    mysqldump -u root -p\$MYSQL_ROOT_PASSWORD product_management > \$BACKUP_FILE

# 压缩备份文件
gzip \$BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: \$BACKUP_FILE.gz"
EOF

sudo mv /tmp/backup-script.sh /usr/local/bin/backup-product-management.sh
sudo chmod +x /usr/local/bin/backup-product-management.sh

# 添加到crontab（每天凌晨2点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-product-management.sh") | crontab -

# 配置日志轮转
sudo tee /etc/logrotate.d/product-management << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f $APP_DIR/docker-compose.prod.yml restart backend
    endscript
}
EOF

echo ""
echo "🎉 部署完成！"
echo ""
echo "📱 访问地址:"
echo "   网站: https://$DOMAIN"
echo "   API: https://$DOMAIN/api/health"
echo ""
echo "📊 管理命令:"
echo "   查看日志: cd $APP_DIR && docker-compose -f docker-compose.prod.yml logs -f"
echo "   重启服务: cd $APP_DIR && docker-compose -f docker-compose.prod.yml restart"
echo "   停止服务: cd $APP_DIR && docker-compose -f docker-compose.prod.yml down"
echo "   数据备份: /usr/local/bin/backup-product-management.sh"
echo ""
echo "🔧 配置文件位置:"
echo "   应用目录: $APP_DIR"
echo "   Nginx配置: /etc/nginx/sites-available/product-management"
echo "   SSL证书: /etc/letsencrypt/live/$DOMAIN/"
echo "   备份目录: $BACKUP_DIR"
echo ""
echo "⚠️  重要提醒:"
echo "   1. 请定期检查SSL证书自动续期状态"
echo "   2. 请定期检查数据备份"
echo "   3. 请定期更新系统和Docker镜像"
echo "======================================="