<?php
function h_err($errno, $errstr, $errfile, $errline) {
    echo "ERR $errno $errstr $errfile:$errline";
    exit(1);
}
set_error_handler("h_err");
?>