<?php
$qs=$_SERVER["QUERY_STRING"];
$action=preg_replace("/&.*/","",$qs);
if (isset($_POST["action"])) $action=$_POST["action"];
$actions=array(
    "runDtl"=>"php/runDtl.php",
    "kinako"=>"php/kinako.php",
    "dummy"=>"hoge"
);
if (isset($actions[$action])) {
    require_once $actions[$action];
} else {
    echo "Action $action not found. Add '$action' to \$actions in a.php";
}
?>