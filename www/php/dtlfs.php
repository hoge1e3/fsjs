<?php
require_once"fs/NativeFS.php";
require_once"fs/PathUtil.php";
require_once"fs/Permission.php";
require_once"fs/SFile.php";
require_once"dtl/DtlNumber.php";
require_once"dtl/DtlString.php";
require_once"dtl/DtlObj.php";
require_once"dtl/DtlBlock.php";
require_once"dtl/DtlArray.php";
require_once"dtl/DtlThread.php";
require_once"json.php";


if (isset($_POST["script"])) {
    $scr=$_POST["script"];
    
    $fs=new NativeFS("./tmp/");
    $ap=new Permission(null);
    //$p=new Permission(new SFile($fs,"../tmp/",$ap));
    $rootDir=new SFile($fs,"/",$ap);
    $root=new DtlObj(null,"ROOT");
    $root->Array=new DtlArray;
    $root->root=$root;
    $root->self=$root;
    $root->rootDir=$rootDir;
    $j=new Services_JSON;
    $vmc=$j->decode($scr);
    $b=new DtlBlock($root,$vmc);
    /*array(
        array("push1", "rootDir"), array("pushi","test.txt"),array("send",1,"rel"),
        array("send",0,"getText"),array("ret")
    ) );*/
    $args=array();
    header("Content-type: text/json; charset=utf8");
    echo $j->encode( DtlThread::run($root,$b,$args ) ); 
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
