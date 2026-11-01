@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "PYTHON="
py -3.13 -c "import sys" >nul 2>nul
if not errorlevel 1 set "PYTHON=py -3.13"
if not defined PYTHON (
  py -3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>nul
  if not errorlevel 1 set "PYTHON=py -3"
)
if not defined PYTHON (
  python -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>nul
  if not errorlevel 1 set "PYTHON=python"
)

if not defined PYTHON (
  echo [错误] 未找到 Python 3.11 或更高版本。
  echo 请安装 64 位 Python 3.13，并在安装时勾选“Add python.exe to PATH”。
  echo.
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" goto setup
".venv\Scripts\python.exe" -c "import webview, aiohttp" >nul 2>nul
if not errorlevel 1 goto run

:setup
echo 首次运行，正在准备运行环境，请稍候...
if exist ".venv" rmdir /s /q ".venv"
%PYTHON% -m venv .venv
if errorlevel 1 goto setup_failed
".venv\Scripts\python.exe" -m pip install --disable-pip-version-check -r requirements.txt
if errorlevel 1 goto setup_failed
goto run

:setup_failed
echo.
echo [错误] 运行环境准备失败，请检查网络连接后重试。
pause
exit /b 1

:run
".venv\Scripts\python.exe" "%~dp0app.py" %*
echo.
echo OpenCode 桌面已退出，按任意键关闭此窗口。
pause >nul
