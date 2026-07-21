@echo off
chcp 65001 >nul
rem === Offline launcher: starts a local server, then opens the browser ===
rem pushd handles folder paths that contain non-ASCII characters safely.
pushd "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "server.ps1"
popd
