@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

if exist "cli\opencode.exe" (
  "cli\opencode.exe" auth login
) else (
  where opencode >nul 2>nul
  if errorlevel 1 (
    echo [错误] 未找到 OpenCode CLI。
    echo 请先安装 OpenCode CLI，或使用便携版内置的 CLI。
    echo.
    pause
    exit /b 1
  )
  opencode auth login
)

echo.
echo 登录窗口已结束。回到 OpenCode 桌面后，如有需要请重启服务。
pause
