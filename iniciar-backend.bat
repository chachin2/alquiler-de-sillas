@echo off
title Sistema Alquiler - Backend (Spring Boot)
echo Iniciando Spring Boot Backend usando Java 17 Portable...
set "JAVA_HOME=%~dp0.jdk\jdk-17.0.19+10"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0sistema-backend"
java -jar target\sistema-alquiler-1.0.0.jar
pause
