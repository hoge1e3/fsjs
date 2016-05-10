<pre>
<?php
require_once"DtlNumber.php";
require_once"DtlObj.php";
require_once"DtlBlock.php";
require_once"DtlThread.php";
class Test{
    public function hoge($x,$y) {
        return $x+$y;
    }
}
class Num {
    public $value;
    public function add() {
        
    }
}
$t=new Test;
$th=new DtlThread;
$root=new DtlObj;
$b=$th->createBlock($root,array(
    array("pushi", 2), array("pushi",3),array("send",1,"mul"),
    array("store1","x"),
    array("pushi", 31), array("store1","y"),
    
    //array("pushb", array(  ) ) , array("store1", "b"),
    array("pushi", $t), array("push1", "x"),     array("push1", "y"),
    array("send",2,"hoge"),array("ret")
) );
$args=array();
echo $th->run($root,$b,$args );   // DtlObj::call($d, array(3,5), "hoge");


?></pre>