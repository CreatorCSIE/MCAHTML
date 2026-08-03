@echo off
chcp 65001 >nul
title Minecraft Classic Applet 离线本地服务器

set HOST=127.0.0.1
set PORT=8080
set PAGE=Minecraft.html
set URL=http://%HOST%:%PORT%/%PAGE%

echo ==================================================
echo   Minecraft Classic Applet 离线本地服务器已启动！
echo.
echo   请打开支持 Java 插件的浏览器 (如 Pale Moon)，访问：
echo   %URL%
echo.
echo   (提示：关闭本窗口即可停止本地服务器)
echo ==================================================
echo.

:: 1. 优先使用 Node.js 启动 server.js（支持全自动硬盘写入）
where node >nul 2>nul
if %errorlevel% == 0 (
    echo [系统提示] 检测到 Node.js 环境，正在启动全功能本地服务器...
    node server.js
    goto END
)

:: 2. 尝试使用内置 sws.exe
if exist "web\sws-windows\sws.exe" goto RUN_SWS_1
if exist "web\sws-windows\static-web-server.exe" goto RUN_SWS_2
goto RUN_PYTHON

:RUN_SWS_1
"web\sws-windows\sws.exe" -a %HOST% -p %PORT% -d .
goto END

:RUN_SWS_2
"web\sws-windows\static-web-server.exe" -a %HOST% -p %PORT% -d .
goto END

:RUN_PYTHON
python -m http.server %PORT% --bind %HOST%
goto END

:END
pause