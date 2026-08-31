@echo off
setlocal

cd /d "%~dp0"
set "APP_PORT=8100"
set "APP_URL=http://localhost:%APP_PORT%/"

echo Starting Chemistry Simulations at %APP_URL%
echo Keep this window open while using the app.
echo Press Ctrl+C to stop the server.
echo.

start "" "%APP_URL%"

where py >nul 2>nul
if not errorlevel 1 (
    py -3 -m http.server %APP_PORT% --bind 127.0.0.1
    goto :server_stopped
)

where python >nul 2>nul
if not errorlevel 1 (
    python -m http.server %APP_PORT% --bind 127.0.0.1
    goto :server_stopped
)

echo ERROR: Python was not found.
echo Install Python from https://www.python.org/downloads/ and try again.
pause
exit /b 1

:server_stopped
if errorlevel 1 (
    echo.
    echo The server could not start. Port %APP_PORT% may already be in use.
    pause
)
