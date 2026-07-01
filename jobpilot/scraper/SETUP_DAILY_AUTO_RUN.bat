@echo off
title JobPilot — Setup Daily Auto-Run
echo.
echo ============================================================
echo   JobPilot — Setting up daily automatic job search
echo ============================================================
echo.
echo This will create a Windows Scheduled Task that runs the
echo scraper every day at 8:00 AM automatically.
echo.
echo You can change the time later in Task Scheduler.
echo.

set /p CONFIRM=Continue? (Y/N):
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    pause
    exit /b
)

set SCRIPT_PATH=%~dp0RUN_SCRAPER.bat

schtasks /create /tn "JobPilot Daily Scraper" /tr "\"%SCRIPT_PATH%\"" /sc daily /st 08:00 /f

if errorlevel 1 (
    echo.
    echo ERROR: Could not create scheduled task.
    echo Try running this file as Administrator (right-click ^> Run as administrator).
) else (
    echo.
    echo SUCCESS! JobPilot will now run every day at 8:00 AM.
    echo.
    echo To change the time: Open Task Scheduler ^> find "JobPilot Daily Scraper"
    echo To stop it: Run REMOVE_DAILY_AUTO_RUN.bat
)

echo.
pause
