@echo off
title WhatsApp Template Messenger
chcp 65001 > nul

REM --- Fix UNC path issue by switching to C: ---
cd /d C:\

echo.
echo ============================================
echo   WhatsApp Template Messenger
echo ============================================
echo.

REM --- Get WSL IP address ---
set WSL_IP=
for /f "tokens=*" %%a in ('wsl.exe hostname -I 2^>nul') do (
    for /f "tokens=1" %%b in ("%%a") do set WSL_IP=%%b
)

if not defined WSL_IP (
    echo   ERROR: Could not get WSL IP.
    pause
    exit /b 1
)

REM --- Remove old port proxy and add new one pointing to WSL IP ---
netsh interface portproxy delete v4tov4 listenport=8080 listenaddress=0.0.0.0 >nul 2>&1
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=%WSL_IP% >nul 2>&1

REM --- Firewall rule (only adds if not exists) ---
netsh advfirewall firewall show rule name="WSL 8080" >nul 2>&1
if errorlevel 1 (
    netsh advfirewall firewall add rule name="WSL 8080" dir=in action=allow protocol=TCP localport=8080 >nul 2>&1
)

REM --- Get Windows WiFi/LAN IP ---
set MOBILE_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "172\."') do (
    for /f "tokens=1" %%b in ("%%a") do (
        if not defined MOBILE_IP set MOBILE_IP=%%b
    )
)

echo   Local:  http://localhost:8080
if defined MOBILE_IP (
    echo.
    echo   *** OPEN THIS ON YOUR PHONE ***
    echo   http://%MOBILE_IP%:8080
    echo   ********************************
) else (
    echo   Could not detect WiFi IP for mobile access.
)
echo.
echo   Ctrl+C to stop
echo ============================================
echo.

wsl.exe bash -c "export LANG=en_US.UTF-8; cd '/home/kulkaran/Work/Dentalflow/Manula whatsapp sending' && python3 server.py"

echo.
pause
