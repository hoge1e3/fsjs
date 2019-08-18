cd /d %~dp0
:loop
call r_js -o build_fs.js
sleep 1
call r_js -o build_fswithzip.js
sleep 1
call r_js -o build_fstools.js

cd ..
call babel www\gen\FS.js --out-file www\gen\FS_es5.js
cd www
pause
goto loop
