@echo off
REM Script to start server and 2 client instances
REM This batch file runs the backend server and two frontend clients

echo.
echo ========================================
echo 🚀 Restaurant Management System
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: pnpm is not installed or not in PATH
    echo Install it with: npm install -g pnpm
    pause
    exit /b 1
)

REM Get script directory
set SCRIPT_DIR=%~dp0
set SERVER_DIR=%SCRIPT_DIR%app\server
set CLIENT_DIR=%SCRIPT_DIR%app\client

echo.
echo 📦 Starting Backend Server...
echo.
start "Restaurant - Server (Port 5000)" cmd /k "cd /d %SERVER_DIR% && pnpm run start:prod"

timeout /t 5 /nobreak

echo.
echo 🌐 Starting Client (Port 3000)...
echo.
start "Restaurant - Client (Port 3000)" cmd /k "cd /d %CLIENT_DIR% && set PORT=3000 && pnpm start"

echo.
echo ========================================
echo ✨ All services started!
echo ========================================
echo.
echo 📍 Access points:
echo    - Server:   http://localhost:5000
echo    - Client: http://localhost:3000
echo.
echo ⚠️  Close any window to stop that service
echo 💡 To stop all: Close all windows
echo.
pause
