@echo off
REM RTSP Livestream Overlay - Quick Start Script (Windows)

echo ========================================
echo RTSP Livestream Overlay - Starting Application
echo ========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB in a separate terminal:
    echo   mongod
    echo.
    pause
)

REM Start backend
echo.
echo Starting Backend Server...
cd backend

REM Activate virtual environment if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

REM Start backend in new window
start "Backend Server" cmd /k python app.py

REM Wait for backend to be ready
echo Waiting for backend to be ready...
timeout /t 3 /nobreak >nul

REM Start frontend
echo.
echo Starting Frontend...
cd ..\frontend

REM Start frontend in new window
start "Frontend Server" cmd /k npm start

echo.
echo ========================================
echo Application Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop services
echo.
pause
