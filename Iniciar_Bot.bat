@echo off
chcp 65001 >nul
title Bot de WhatsApp (Zero-Cost) - by Lucatoons

echo ================================================================
echo           🤖 BOT DE WHATSAPP (ZERO-COST) - BY LUCATOONS
echo ================================================================
echo.

:: Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] No se detectó Node.js instalado en esta computadora.
    echo Por favor descargalo e instalalo desde: https://nodejs.org/
    echo.
    pause
    exit /b
)

:: Obtener el puerto desde el archivo .env si existe
set PORT=3000
if exist .env (
    for /f "tokens=1,2 delims==" %%A in (.env) do (
        if "%%A"=="PORT" set PORT=%%B
    )
)

echo [1/2] Abriendo el Panel Web en tu navegador (http://localhost:%PORT%)...
start http://localhost:%PORT%

echo [2/2] Iniciando el servicio del bot...
echo.
echo ****************************************************************
echo   RECORDÁ: No cierres esta ventana negra mientras uses el bot.
echo   Para detenerlo, presioná Ctrl + C.
echo ****************************************************************
echo.

node index.js

echo.
echo El bot se ha detenido.
pause
