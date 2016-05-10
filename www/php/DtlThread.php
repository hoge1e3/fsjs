<?php
class DtlThread {
    var $stack;
    public function __construct() {
        $this->stack=array();
    }
    public function push($v) {
        array_push($this->stack,$v);
    } 
    public function pop() {
        return array_pop($this->stack);
    } 
    public function createBlock($scope,$code) {
        $b=new DtlBlock($this, $scope,$code); 
        return $b;
    }
    public function run($self,$block,&$args) {
        $scope=$block->scope->create();//DtlObj::create($block->scope);
        $scope->self=$self;
        $scope->arguments=$args;
        //echo count($block->code);
        foreach ($block->code as $c) {
            //$len=count($this->stack);
            //echo " {$c[0]} sp=$len \n";
            switch ($c[0]) {
            //pushi (immedeate) 
            case "pushi":
                $this->push($c[1]);
                break;
            //push1 nameid (local)
            case "push1":
                $name=$c[1];
                $this->push(DtlObj::s_get($scope,$name));
                break;
            //[obj] push2 nameid
            case "push2":
                $name=$c[1];
                $obj=$this->pop();
                $this->push(DtlObj::s_get($obj,$name));
                break;
            //pushb blockid  (with dtlbind)
            case "pushb":
                $this->push( $this->createBlock($scope,$c[1]) );
                break;
            //[obj] [arg1] .... [argN] send #N,$nameid   
            case "send":
                $n=$c[1];
                $name=$c[2];
                $args=array();
                for ($i=0;$i<$n;$i++) array_unshift($args,$this->pop());
                //$obj=$this->stack[count($this->stack)-($n+1)];
                $obj=$this->pop();
                if ($obj instanceof DtlObj) {
                    $f=DtlObj::s_get($obj,$name);
                    if ($f instanceof DtlBlock) {
                        $this->push($this->run($obj,$f,$args));
                    } else {
                        throw new Exception("$name はメソッドではありません");
                    }
                } else {
                    if (is_float($obj) || is_int($obj)) {
                        $obj=new DtlNumber($obj);
                    }
                    if (is_object($obj) && method_exists($obj,$name)) {
                        $this->push(call_user_func_array(array($obj,$name),$args));
                    } else {
                        throw new Exception("$name はメソッドではありません");
                    }
                }
                break;
            // ret
            case "ret":
                return $this->pop();
            // [val] store1 nameid 
            case "store1":
                $name=$c[1];
                $val=$this->pop();
                DtlObj::s_set($scope,$name,$val);
                break;
            //[obj] [val] store2 nameid (obj.nameid=val)
            case "store2":
                $name=$c[1];
                $val=$this->pop();
                $obj=$this->pop();
                DtlObj::s_set($scope,$name,$val);
                break;
            case "para":
                $name=$c[1];
                DtlObj::s_set($scope, $name, array_shift($scope->arguments));
                break;                
            case "tmp":
                $name=$c[1];
                DtlObj::s_set($scope, $name, 0);
                break;                
            }
        } 
/*
[N]...[1] pop #N
*/
    }
}
?>