@echo off
title VotePulse — Complete Online Voting Platform Launcher
color 0B

echo ====================================================================
echo        VOTEPULSE - ONLINE VOTING PLATFORM RUNNER (WINDOWS)
echo           "Your Voice. Your Choice. Your Future."
echo ====================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Python and Virtual Environment...
if not exist "backend\venv\Scripts\python.exe" (
    echo [*] Creating Python virtual environment...
    python -m venv backend\venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment. Ensure Python is installed and in PATH.
        pause
        exit /b 1
    )
    echo [*] Installing backend dependencies...
    backend\venv\Scripts\pip install -r backend\requirements.txt
)

echo [2/4] Initializing Database & Seed Data...
backend\venv\Scripts\python backend\seed.py

echo [3/4] Checking Frontend Dependencies...
if not exist "frontend\node_modules" (
    echo [*] Installing frontend npm packages...
    cd frontend
    call npm install
    cd ..
)

echo [4/4] Starting VotePulse Services...
echo.
echo [*] Launching Python Flask Backend on http://127.0.0.1:5000 ...
start "VotePulse Backend API" cmd /k "cd /d %~dp0backend && venv\Scripts\python app.py"

timeout /t 2 /nobreak >nul

echo [*] Launching React Vite Frontend on http://localhost:3000 ...
start "VotePulse Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ====================================================================
echo   VotePulse is now running!
echo   Frontend Application: http://localhost:3000
echo   Backend REST API:     http://127.0.0.1:5000/api
echo.
echo   ADMIN CREDENTIALS (Pre-Seeded):
echo   Username: brmovs   ^|   Phone: 7025919468   ^|   Password: qw1988ab1988
echo ====================================================================
echo.
start http://localhost:3000

pause
