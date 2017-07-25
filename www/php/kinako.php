<?php
require_once __DIR__."/json.php";
require_once __DIR__."/fs/NativeFS.php";
require_once __DIR__."/fs/SFile.php";

$fs=new NativeFS(__DIR__."/../pub/");
$home=new SFile($fs,"/");
if (isset($_POST["cmd"]) && $_POST["cmd"]=="download") {
    $files=json2array($_POST["files"]); // downloading files(idx=>name_of_dir)
    header("Content-type: text/json;charset=UTF-8");
    $res=new stdClass;
    foreach ($files as $dirName) {
        recur($home->rel($dirName),$res);
    }
    echo json_encode($res);
} else if (isset($_POST["files"])) {
    $files=json2array($_POST["files"]); // uploading files(name=>cont)
    $page=$_POST["page"];  // showing page file path
    foreach ($files as $path=>$cont) {
        echo $home->rel($path)->path()." cont=".$cont;
        $home->rel($path)->text($cont);
    }
    //header("Location: pub/$page");
} else {
    ?><form action="a.php?kinako" method=POST>
        <input type=hidden name="cmd" value="download"/>
        <textarea name=files>["/"]</textarea>
        <input type="submit"/>
    </form><?php
}

function recur($dir,$res) {
	if (!$dir->isDir()) {
		throw new Exception($dir->path()." is not dir!");
	}
    foreach ($dir->listFiles() as $file) {
        if ($file->isDir()) {
            recur($file,$res);
        } else {
            $res->{$file->path()}=$file->text();
            //echo $file->path(). $file->text();
        }
    }
    
}

?>