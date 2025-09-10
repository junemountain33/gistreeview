@echo off
REM Railway automated deploy helper for Windows (cmd.exe)
REM Prereqs: Railway CLI installed and logged in (run: railway login)
REM Usage: railway-deploy.bat backend|frontend|all

SETLOCAL ENABLEDELAYEDEXPANSION

nIF "%1"=="" (
  ECHO Usage: %0 backend^|frontend^|all
  EXIT /B 1
)

IF /I "%1"=="backend" (
  ECHO Deploying backend...
  CD backend
  ECHO Installing dependencies...
  npm install
  ECHO If this is the first time, run: railway login && railway init
  ECHO Running interactive Railway init/link; choose or create your Railway project for the backend service.
  railway init
  ECHO Deploying with railway up (interactive)
  railway up
  EXIT /B 0
)

IF /I "%1"=="frontend" (
  ECHO Deploying frontend...
  CD frontend
  ECHO Installing dependencies...
  npm install
  ECHO Run railway init to link or create the frontend service when prompted.
  railway init
  railway up
  EXIT /B 0
)

IF /I "%1"=="all" (
  CALL "%~f0" backend
  CALL "%~f0" frontend
  EXIT /B 0
)

ECHO Unknown option "%1"
EXIT /B 1
