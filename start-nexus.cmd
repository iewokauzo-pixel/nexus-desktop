@echo off
setlocal
cd /d "%~dp0"
set "NEXUS_NODE=node"
where node >nul 2>nul
if errorlevel 1 (
  set "NEXUS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  if not exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    echo Node.js was not found. Install Node.js and try again.
    pause
    exit /b 1
  )
)
if "%OPENAI_API_KEY%"=="" (
  echo OPENAI_API_KEY is not set. NEXUS will start in local demo mode.
)
echo NEXUS: http://127.0.0.1:4310
echo Keep this window open while using NEXUS. Press Ctrl+C to stop.
"%NEXUS_NODE%" src\server.js
if errorlevel 1 pause
