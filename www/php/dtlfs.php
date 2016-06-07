<?php
require_once"fs/NativeFS.php";
require_once"fs/PathUtil.php";
require_once"fs/Permission.php";
require_once"fs/SFile.php";
require_once"dtl/Dtl.php";
require_once"json.php";
require_once"dtlfs/DtlFS.php";


if (isset($_POST["script"])) {
    $scr=$_POST["script"];
    $j=new Services_JSON;
    $vmc=$j->decode($scr);
    DtlFS::init();
    header("Content-type: text/json; charset=utf8");
    echo $j->encode( DtlUtil::unwrap( DtlFS::run($vmc) ) ); 
} else {
?>
<form action="dtlfs.php" method="POST">
<textarea name="script" rows=10 cols=40>
[["push1", "rootDir"], ["pushi","test.txt"],["send",1,"rel"],
["send",0,"getText"],["ret"]]
</textarea>
<input type="submit">
</form>
<?php 
} 
?>
