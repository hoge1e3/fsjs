<?php
class DtlObj {
    public static function s_get($obj,$name) {
        if (is_object($obj)) {
            $v=$obj->$name;
            if (is_null($v)) {
                $p=$obj->__proto__;
                if (is_null($p)) return $v;
                return self::get($p,$obj,$name);
            } else {
                return $v;
            }
        }
        throw new Exception("$obj から属性$nameを取得できません");
    }
    public static function s_set($obj,$name,$val) {
        if (is_object($obj)) {
            return $obj->$name=$val;
        }
        throw new Exception("$obj には、属性$nameを書き込めません");
    }
    public function create() {
        $r=new DtlObj;
        $r->__proto__=$this;
        return $r;
    }
    /*public static function s_create($obj) {
        $r=new DtlObj;
        $r->__proto__=$obj;
        return $r;
    }*/
    /*public static function call($obj,$args,$name) {
        if (is_object($obj)) {
            if (method_exists($obj,$name)) {
                return call_user_func_array(array($obj,$name),$args);
            } else {
                $f=self::get($obj,$name);
                if ($f instanceof DtlBlock) {
                    return $f->execSelf($obj,$args);
                } else {
                    throw new Exception("$name はメソッドではありません");
                }
            }
        } else {
            throw new Exception("$obj は呼出できません");
        }
    }*/
}
?>