#!/bin/bash
# 数据库恢复脚本

set -e

BACKUP_DIR="/opt/openclaw/tester/workspace/x-blog/backups"
DB_FILE="/opt/openclaw/tester/workspace/x-blog/data/articles.db"

echo "🔄 X-Blog 数据库恢复"
echo "===================="
echo ""

# 列出可用备份
echo "📋 可用备份列表:"
BACKUPS=($(ls -t "$BACKUP_DIR"/articles-*.db.gz 2>/dev/null))

if [ ${#BACKUPS[@]} -eq 0 ]; then
  echo "❌ 未找到任何备份文件"
  exit 1
fi

for i in "${!BACKUPS[@]}"; do
  FILENAME=$(basename "${BACKUPS[$i]}")
  SIZE=$(du -h "${BACKUPS[$i]}" | cut -f1)
  DATE=$(echo "$FILENAME" | sed 's/articles-\(.*\)\.db\.gz/\1/')
  echo "   [$i] $DATE ($SIZE)"
done

echo ""
echo -n "请选择要恢复的备份编号 [0-$((${#BACKUPS[@]}-1))]: "
read -r CHOICE

if [ -z "$CHOICE" ] || [ "$CHOICE" -lt 0 ] || [ "$CHOICE" -ge ${#BACKUPS[@]} ]; then
  echo "❌ 无效选择"
  exit 1
fi

BACKUP_FILE="${BACKUPS[$CHOICE]}"
echo ""
echo "📦 选择的备份: $(basename "$BACKUP_FILE")"
echo ""
echo "⚠️  警告: 此操作将覆盖当前数据库！"
echo -n "是否继续？[y/N]: "
read -r CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
  echo "❌ 已取消恢复"
  exit 0
fi

echo ""
echo "🛑 停止容器..."
cd /opt/openclaw/tester/workspace/x-blog
docker compose down

echo "💾 备份当前数据库..."
CURRENT_BACKUP="$BACKUP_DIR/articles-before-restore-$(date +%Y%m%d-%H%M%S).db"
cp "$DB_FILE" "$CURRENT_BACKUP"
echo "✅ 当前数据库已备份至: $CURRENT_BACKUP"

echo "📂 解压备份文件..."
gunzip -c "$BACKUP_FILE" > "$DB_FILE"

echo "🔍 验证数据库..."
if sqlite3 "$DB_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
  echo "✅ 数据库完整性检查通过"
else
  echo "❌ 数据库损坏，正在恢复原数据库..."
  cp "$CURRENT_BACKUP" "$DB_FILE"
  echo "❌ 恢复失败，已回滚"
  exit 1
fi

echo "🚀 启动容器..."
docker compose up -d

echo ""
echo "✅ 恢复完成！"
echo "📊 恢复的备份: $(basename "$BACKUP_FILE")"
echo "💾 原数据库备份: $CURRENT_BACKUP"
