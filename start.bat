@echo off
title Aurelia Grand Luxury Hotel Management System
echo =====================================================================
echo    AURELIA GRAND LUXURY RESORT & HOTEL MANAGEMENT SYSTEM
echo    Starting Authentication Backend Server & Portal...
echo =====================================================================
echo.

set NODE_EXEC=node
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%APPDATA%\Antigravity\bin\agy-node.cmd" (
        set NODE_EXEC="%APPDATA%\Antigravity\bin\agy-node.cmd"
    ) else (
        echo [ERROR] Node.js runtime not found.
        pause
        exit /b 1
    )
)

echo [1/2] Starting server at http://localhost:5000 ...
start "" http://localhost:5000
%NODE_EXEC% server.js
