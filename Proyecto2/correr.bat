@echo off
setlocal

REM Cambia al directorio del script
cd /d %~dp0

REM Abrir index.html en el navegador predeterminado
start http://localhost:8000

REM Iniciar servidor local con Python 3
python -m http.server 8000

pause
