@echo off
echo ===================================================
echo   VRISHTI AI — MULTI-STATE NWP RAINFALL POST-PROCESSING
echo ===================================================
echo.
echo 1. Starting FastAPI Backend Server (Port 8000)...
start "Vrishti AI Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo 2. Starting Vite Frontend Dashboard (Port 5173)...
start "Vrishti AI Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ===================================================
echo Servers launching!
echo Frontend Dashboard : http://localhost:5173
echo API & Swagger Docs : http://localhost:8000/docs
echo ===================================================
pause
