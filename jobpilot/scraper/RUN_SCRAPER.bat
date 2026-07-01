@echo off
title JobPilot Scraper
echo.
echo ============================================================
echo   JobPilot Scraper — Finding fresh jobs for you...
echo ============================================================
echo.

cd /d "%~dp0"

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Download it from: https://www.python.org/downloads/
    echo IMPORTANT: Check "Add Python to PATH" during installation!
    echo.
    pause
    exit /b 1
)

:: Install dependencies (first run only)
if not exist ".deps_installed" (
    echo Installing dependencies (first time only)...
    pip install -r requirements.txt
    echo. > .deps_installed
    echo.
)

:: Run the scraper
python jobpilot_scraper.py

pause
