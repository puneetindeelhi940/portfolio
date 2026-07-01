@echo off
title JobPilot
echo.
echo ============================================================
echo   JobPilot — Starting...
echo ============================================================
echo.

cd /d "%~dp0"

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Download from: https://www.python.org/downloads/
    echo IMPORTANT: Check "Add Python to PATH" during installation!
    pause
    exit /b 1
)

:: Install dependencies (first run only)
if not exist ".deps_installed" (
    echo Installing dependencies (first time only)...
    pip install requests beautifulsoup4 lxml
    echo. > .deps_installed
    echo.
)

:: Start the server (opens browser automatically)
python server.py
