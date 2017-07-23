<?php
require_once __DIR__."/dtl/Dtl.php";
require_once __DIR__."/json.php";
require_once __DIR__."/dtlfs/DtlFS.php";
require_once __DIR__."/dtlfs/DtlSys.php";
require_once __DIR__."/dtlfs/DtlParam.php";
require_once __DIR__."/ErrorHandler.php";

if (isset($_POST["script"]) || isset($_GET["file"])) {
    $root=Dtl::createEmptyRoot();
    //----Load Builtin Libraries----
    Dtl::initRoot($root);
    DtlFS::initRoot($root);
    DtlSys::initRoot($root);
    //--------------------------
    $root->param=new DtlParam();
    if (isset($_GET["file"])) {
        $scr=$root->FS->getContent($_GET["file"]);
    } else {
        $scr=$_POST["script"];
    }
    $j=new Services_JSON;
    $vmc=$j->decode($scr);

    header("Content-type: text/json; charset=utf8");
    echo $j->encode( DtlUtil::unwrap( Dtl::run($root,$vmc) ) ); 
} else { ?>
    <form action="runDtl.php" method="POST">
    <textarea name="script" rows=10 cols=40>
    </textarea>
    <input type="submit">
    </form>
<?php 
} 
?>