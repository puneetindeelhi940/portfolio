@echo off
title JobPilot — Remove Daily Auto-Run
schtasks /delete /tn "JobPilot Daily Scraper" /f
echo.
echo Daily auto-run has been removed.
echo.
pause
