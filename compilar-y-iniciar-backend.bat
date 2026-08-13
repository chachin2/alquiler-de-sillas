@echo off
title Sistema Alquiler - Compilar y Ejecutar Backend
echo Iniciando entorno portable de Java y Maven...
set "JAVA_HOME=%~dp0.jdk\jdk-17.0.19+10"
set "PATH=%JAVA_HOME%\bin;%~dp0.maven\apache-maven-3.9.9\bin;%PATH%"
cd /d "%~dp0sistema-backend"
echo Compilando y empaquetando proyecto con Maven...
call mvn clean package -DskipTests
if %ERRORLEVEL% EQU 0 (
    echo Compilacion exitosa. Iniciando servidor...
    java -jar target\sistema-alquiler-1.0.0.jar
) else (
    echo Error durante la compilacion de Maven.
)
pause
