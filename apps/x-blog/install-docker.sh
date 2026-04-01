#!/bin/bash
set -e

echo "🐳 Docker & Docker Compose 安装脚本"
echo "===================================="
echo ""

# 检查是否已安装
if command -v docker &> /dev/null; then
    echo "✅ Docker 已安装："
    docker --version
    echo ""
    read -p "是否重新安装？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# 更新包索引
echo "1️⃣  更新系统包..."
apt-get update

# 安装依赖
echo "2️⃣  安装依赖包..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加 Docker GPG 密钥
echo "3️⃣  添加 Docker GPG 密钥..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo "4️⃣  添加 Docker 仓库..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新包索引
echo "5️⃣  更新包索引..."
apt-get update

# 安装 Docker Engine
echo "6️⃣  安装 Docker Engine..."
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 启动 Docker
echo "7️⃣  启动 Docker 服务..."
systemctl start docker
systemctl enable docker

# 验证安装
echo ""
echo "8️⃣  验证安装..."
docker --version
docker compose version

# 测试运行
echo ""
echo "9️⃣  测试运行..."
if docker run hello-world; then
    echo ""
    echo "✅ Docker 安装成功！"
else
    echo ""
    echo "❌ Docker 测试失败"
    exit 1
fi

# 清理测试容器
docker rm $(docker ps -aq --filter ancestor=hello-world) 2>/dev/null || true

echo ""
echo "===================================="
echo "✅ 安装完成！"
echo ""
echo "📋 常用命令："
echo "  docker ps              # 查看运行中的容器"
echo "  docker images          # 查看镜像列表"
echo "  docker compose up -d   # 启动服务"
echo ""
echo "🔧 下一步："
echo "  cd /opt/openclaw/tester/workspace/x-blog"
echo "  ./deploy-docker.sh"
echo ""
