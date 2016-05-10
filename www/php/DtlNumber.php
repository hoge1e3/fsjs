<?php
class DtlNumber {
    public $value;
    public function __construct($v) {
        $this->value=$v;
    }
    public function add($a) {
        return $this->value+$a;
    }
    public function mul($a) {
        return $this->value*$a;
    }
}
?>