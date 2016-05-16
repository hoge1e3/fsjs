<?php
class DtlArray {
    public $raw;
    public function DtlArray() {
        if (func_num_args()==0) $this->raw=array();
        else $this->raw=func_get_arg(0);
    }
    public function create() {
        $r= new DtlArray;
        for ($i=0 ; $i<func_num_args() ; $i++) {
            $r->push(func_get_arg($i));
        }
        return $r;
    }
    public function each($b) {
        for ($i=0;$i<count($this->raw);$i++) {
            $b.execute($this->raw[$i],$i);
        }
    }
    public function push($e) {
        array_push($this->raw, $e);
        return $this;
    }
    public function pop() {
        return array_pop($this->raw);
    }
    public function unshift($e) {
        array_unshift($this->raw, $e);
        return $this;
    }
    public function shift() {
        return array_shift($this->raw);
    }
    public function get($i1) {
        return $this->raw[$i1-1];
    }
    public function set($i1,$v) {
        return $this->raw[$i1-1]=$v;
    }
    public function get0($i) {
        return $this->raw[$i];
    }
    public function set0($i,$v) {
        return $this->raw[$i]=$v;
    }
    public function size() {
        return count($this->raw);
    }
    
}
?>