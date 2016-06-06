<?php 
require_once"./fs/NativeFS.php";
require_once"./fs/PathUtil.php";
require_once"./fs/Permission.php";
require_once"./fs/SFile.php";
require_once"./dtl/Dtl.php";
require_once"./dtlfs/DtlSys.php";
class DtlFS {
    public static function init() {
        $fs=new NativeFS("./tmp/");
        $ap=new Permission(null);
        $rootDir=new SFile($fs,"/",$ap);
        $root=Dtl::init();
        $root->system=new DtlSys($rootDir->rel("scripts/"));
        $root->rootDir=$rootDir;
        return $root;
    }
    public static function run($vmcode) {
        return Dtl::run($vmcode);
    }
}
?>