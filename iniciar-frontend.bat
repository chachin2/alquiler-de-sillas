@echo off
title Sistema Alquiler - Frontend (Angular)
echo Iniciando Angular Frontend en http://localhost:4200 ...
cd /d "%~dp0sistema-frontend"
call npx ng serve
pause
