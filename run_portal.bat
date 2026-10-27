@echo off
title Data Science Digital Library - DS Lab Portal
echo =======================================================
echo   Data Science Digital Library - DS Lab Portal
echo   Department of Computer Science & Engineering (DS)
echo =======================================================
echo.
cd /d "%~dp0"
echo Starting DS Lab Portal server...
start "" http://127.0.0.1:8000
python server.py
pause
