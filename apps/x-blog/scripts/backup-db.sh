#!/bin/bash
# 数据库备份脚本

set -e

BACKUP_DIR="/opt/openclaw/tester/workspace/x-blog/backups"
DB_FILE="/opt/openclaw/tester/workspace/x-blog/data/articles.db"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/articles-$DATE.db"

echo "🗄️  开始备份数据库..."

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
cp "$DB_FILE" "$BACKUP_FILE"
echo "✅ 数据库已复制: $BACKUP_FILE"

# 压缩备份
gzip "$BACKUP_FILE"
echo "✅ 压缩完成: $BACKUP_FILE.gz"

# 计算备份大小
SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
echo "📦 备份大小: $SIZE"

# 保留最近 7 天的备份
DELETED=$(find "$BACKUP_DIR" -name "articles-*.db.gz" -mtime +7 -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "🗑️  已删除 $DELETED 个旧备份（>7天）"
fi

# 列出所有备份
echo ""
echo "📋 现有备份列表:"
ls -lh "$BACKUP_DIR"/articles-*.db.gz | tail -5

echo ""
echo "✅ 备份完成: $BACKUP_FILE.gz"
