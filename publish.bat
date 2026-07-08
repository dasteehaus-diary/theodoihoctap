@echo off
title Cap Nhat Tiem Tra Hoc Tap
echo =======================================================
echo     TIEM TRA HOC TAP - CAP NHAT WEB LEN GITHUB
echo =======================================================
echo.
echo [*] Dang quet cac thay doi...
git status -s
echo.
echo [*] Dang dong goi file...
git add .

set /p msg="[?] Nhap mo ta thay doi [Nhan Enter de dung mac dinh]: "
if "%msg%"=="" (
    set msg="Auto-update from computer"
)

echo.
echo [*] Dang luu phien ban moi...
git commit -m %msg%

echo.
echo [*] Dang tai len GitHub Pages...
git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [x] LOI: Khong the tai len GitHub.
    echo     Vui long kiem tra internet hoac tai khoan GitHub.
) else (
    echo.
    echo [v] THANH CONG! Cho 1-2 phut roi F5 lai link web cua chi nhe!
)
echo.
echo =======================================================
pause
