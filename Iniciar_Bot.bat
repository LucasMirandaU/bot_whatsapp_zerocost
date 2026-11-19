@echo off
setlocal
title Bot de WhatsApp (Zero-Cost) - by Lucatoons

REM Asegurar que Node.js este en el PATH si esta instalado en Program Files
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=%PATH%;C:\Program Files\nodejs"
)

echo ================================================================
echo           BOT DE WHATSAPP (ZERO-COST) - BY LUCATOONS
echo ================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] No se detecto Node.js instalado en esta computadora.
    echo Por favor descargalo e instalalo desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Leer el puerto desde el archivo .env si existe
set PORT=3000
if exist .env (
    for /f "tokens=1,2 delims==" %%A in (.env) do (
        if "%%A"=="PORT" set PORT=%%B
    )
)

echo Iniciando el bot y abriendo el panel web en http://localhost:%PORT%...
echo.
echo ****************************************************************
echo   RECORDA: No cierres esta ventana mientras uses el bot.
echo   Para detenerlo, presiona Ctrl + C.
echo ****************************************************************
echo.

REM Abrir el navegador tras 2 segundos para asegurar que el servidor web ya este escuchando
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:%PORT%"

node index.js

echo.
echo El bot se ha detenido.
pause
