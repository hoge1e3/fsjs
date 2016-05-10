<?php
class DtlBlock {
    public $thread;
    public $scope;
    public $code;
    public function __construct($t,$s,$c) {
        $this->thread=$t;
        $this->scope=$s;
        $this->code=$c;
    }
    public function execute() {
        $args=array();
        $n=func_num_args();
        for ($i=0;$i<$n;$i++) array_push($args,func_get_arg($i));
        return $this->thread->run($this->scope->self, $this ,$args);
    }

}

?>