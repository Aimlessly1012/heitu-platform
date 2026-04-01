#!/bin/bash
# AI 早报定时任务 - 每天 08:00 CST 执行
# 由 crontab 调用

export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin:$PATH"
# 从环境文件加载敏感配置
ENV_FILE="/root/.openclaw/workspace/heitu-platform/apps/x-blog/.env.morning-news"
if [ -f "$ENV_FILE" ]; then
  set -a; source "$ENV_FILE"; set +a
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="/root/.openclaw/workspace/heitu-platform/apps/x-blog/logs"
mkdir -p "$LOG_DIR"

DATE=$(TZ=Asia/Shanghai date +%Y-%m-%d)
LOG_FILE="$LOG_DIR/morning-news-${DATE}.log"

echo "=== AI 早报 ${DATE} ===" >> "$LOG_FILE"
echo "Started: $(date)" >> "$LOG_FILE"

cd /root/.openclaw/workspace/heitu-platform/apps/x-blog
python3 "$SCRIPT_DIR/generate_morning_news.py" --date "$DATE" >> "$LOG_FILE" 2>&1

echo "Finished: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
