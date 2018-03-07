cd /d %~dp0
call r_js -o build_fs.js
sleep 1
call r_js -o build_fswithzip.js

pause
