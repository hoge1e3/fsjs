<?php
class DtlBlock {
    public $scope;
    public $code;
    public function __construct($s,$c) {
        $this->scope=$s;
        $this->code=$c;
    }
    public function execute() {
        $args=array();
        $n=func_num_args();
        for ($i=0;$i<$n;$i++) array_push($args,func_get_arg($i));
        return DtlThread::run($this->scope->self, $this ,$args);
    }
    public function then() {
        $res=$this->execute();
        return $res ? (new DtlTrue): (new DtlFalse);
    }
}
class DtlTrue {
    public function _else($func) {
        return new DtlDone($func->execute());
    }
    public function execute($func) {
        return $func->execute();
    }
	public function then($func){
		return $func->then();
	}
}
class DtlFalse {
    public function _else($func) {
        return new DtlTrue();
    }
    public function execute($func) {
        return null;
    }
	public function then($func){
		return $func->then();
	}
}
class DtlDone {
    private $result;
    public function DtlDone($result) {
        $this->result=$result;
    }
    public function _else($func) {
        return $this;
    }
    public function execute($func) {
        return $this->result;
    }
	public function then($func){
		return $this;
	}
}

?>