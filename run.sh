#!/bin/bash

echo "==================================================="
echo "  正在启动 Minecraft Classic Applet 离线本地服务器..."
echo "==================================================="
echo ""

# 1. 优先后台启动 Node.js 服务器 (支持磁盘自动写盘 API)
if command -v node &> /dev/null && [ -f "server.js" ]; then
    echo "[1/3] [系统提示] 检测到 Node.js 环境，正在启动全功能本地服务器..."
    node server.js &
elif [ -f "web/sws-linux/sws" ]; then
    echo "[1/3] 正在启动后台 Web 服务器 (SWS)..."
    chmod +x web/sws-linux/sws
    ./web/sws-linux/sws -a 127.0.0.1 -p 8080 -d . &
elif command -v static-web-server &> /dev/null; then
    echo "[1/3] 正在启动后台 Web 服务器 (SWS)..."
    static-web-server -a 127.0.0.1 -p 8080 -d . &
else
    echo "[1/3] 未找到 Node.js 或 SWS，正在尝试使用 Python3 后台启动..."
    python3 -m http.server 8080 &
fi

# 2. 等待 1 秒，确保服务器已彻底完成 TCP 8080 端口绑定
echo "[2/3] 等待服务器端口就绪..."
sleep 1

# 3. 智能检测并启动浏览器
echo "[3/3] 正在检测浏览器..."
TARGET_URL="http://127.0.0.1:8080/Minecraft.html"

if command -v palemoon &> /dev/null; then
    echo "检测到 Pale Moon 浏览器，正在自动注入 GDK_SCALE=1 完美模式打开网页..."
    # 核心改进：在此处注入 GDK_SCALE=1 环境变量，彻底解决 Linux 高 DPI 画面裁切 Bug
    env GDK_SCALE=1 palemoon "$TARGET_URL" &
elif command -v xdg-open &> /dev/null; then
    echo "[提示] 未检测到 Pale Moon，正在使用系统默认浏览器打开..."
    xdg-open "$TARGET_URL" &
elif command -v firefox &> /dev/null; then
    echo "[提示] 使用 Firefox 浏览器打开..."
    firefox "$TARGET_URL" &
else
    echo ""
    echo "==================================================="
    echo "  [提示] 未检测到 Pale Moon 或其他可用的图形浏览器！"
    echo "  Pale Moon 浏览器可前往 https://www.palemoon.org/download.shtml 下载"
    echo "  离线 Web 服务器已在后台成功启动，请手动打开浏览器访问："
    echo "  $TARGET_URL"
    echo "==================================================="
    echo ""
fi