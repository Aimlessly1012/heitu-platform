#!/bin/bash
set -e

echo "🐳 X-Blog Docker 部署脚本"
echo "=========================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装！${NC}"
    echo "请先安装 Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装！${NC}"
    echo "请先安装 Docker Compose"
    exit 1
fi

# 检查 .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local 文件不存在！${NC}"
    echo "请先创建 .env.local 文件并配置环境变量"
    exit 1
fi

echo -e "${GREEN}✅ 环境检查通过${NC}"
echo ""

# 停止旧容器
echo "1️⃣  停止旧容器..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true

# 清理旧镜像（可选）
read -p "是否清理旧镜像？(y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 清理旧镜像..."
    docker rmi x-blog-x-blog 2>/dev/null || true
fi

# 构建镜像
echo ""
echo "2️⃣  构建 Docker 镜像..."
docker-compose build || docker compose build

# 启动容器
echo ""
echo "3️⃣  启动容器..."
docker-compose up -d || docker compose up -d

# 等待启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查状态
echo ""
echo "4️⃣  检查容器状态..."
docker-compose ps || docker compose ps

# 健康检查
echo ""
echo "5️⃣  健康检查..."
for i in {1..10}; do
    if curl -s http://localhost:3001 > /dev/null; then
        echo -e "${GREEN}✅ 服务启动成功！${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ 服务启动失败，请查看日志${NC}"
        echo "docker-compose logs x-blog"
        exit 1
    fi
    echo "等待服务响应... ($i/10)"
    sleep 3
done

echo ""
echo "=========================="
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "📍 访问地址："
echo "   http://localhost:3001"
echo "   http://heitu.wang"
echo ""
echo "📋 常用命令："
echo "   docker-compose logs -f x-blog    # 查看实时日志"
echo "   docker-compose restart x-blog    # 重启服务"
echo "   docker-compose stop              # 停止服务"
echo "   docker-compose up -d             # 启动服务"
echo "   docker-compose down              # 停止并删除容器"
echo ""
echo "🔧 进入容器："
echo "   docker exec -it x-blog sh"
echo ""
echo "📊 资源监控："
echo "   docker stats x-blog"
echo ""
