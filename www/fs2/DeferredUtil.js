define([], function () {
    //  promise.then(S,F)  and promise.then(S).fail(F) is not same!
    //  ->  when fail on S,  F is executed?
    var DU;
    var DUBRK=function(r){this.res=r;};
    DU={
        isPromise: function (p) {
            return p && (typeof p.then==="function");
        },
        ensureDefer: function (v) {
            var d=new $.Deferred;
            var isDeferred;
            $.when(v).then(function (r) {
                if (!isDeferred) {
                    setTimeout(function () {
                        d.resolve(r);
                    },0);
                } else {
                    d.resolve(r);
                }
            }).fail(function (r) {
                if (!isDeferred) {
                    setTimeout(function () {
                        d.reject(r);
                    },0);
                } else {
                    d.reject(r);
                }
            });
            isDeferred=true;
            return d.promise();
        },
        directPromise:function (v) {
            return DU.timeout(v,0);
        },
        then: function (f) {
            return DU.directPromise().then(f);
        },
        timeout:function (timeout,value) {
            return DU.promise(function (resolve) {
                setTimeout(function () {resolve(value);},timeout||0);
            });
        },
        funcPromise:function (f) {
            if (window.$ && window.$.Deferred) {
                var d=new $.Deferred;
                try {
                    f(function (v) {
                        d.resolve(v);
                    },function (e) {
                        d.reject(e);
                    });
                }catch(e) {
                    d.reject(e);
                }
                return d.promise();
            } else if (DU.external.Promise) {
                return new DU.external.Promise(f);
            } else {
                throw new Error("promise is not found");
            }
        },
        throwPromise:function (e) {
            var d=new $.Deferred;
            setTimeout(function () {
                d.reject(e);
            }, 0);
            return d.promise();
        },
        throwF: function (f) {
            return function () {
                try {
                    return f.apply(this,arguments);
                } catch(e) {
                    console.log(e,e.stack);
                    return DU.throwPromise(e);
                }
            };
        },
        each: function (set,f) {
            if (set instanceof Array) {
                return DU.loop(function (i) {
                    if (i>=set.length) return DU.brk();
                    return $.when(f(set[i],i)).then(function () {
                        return i+1;
                    });
                },0);
            } else {
                var objs=[];
                for (var i in set) {
                    objs.push({k:i,v:set[i]});
                }
                return DU.each(objs,function (e) {
                    return f(e.k, e.v);
                });
            }
        },
        loop: function (f,r) {
            try {
                while(true) {
                    if (r instanceof DUBRK) return $.when(r.res);
                    var deff1=true, deff2=false;
                    // ★ not deffered  ☆  deferred
                    var r1=f(r);
                    var dr=$.when(r1).then(function (r2) {
                        r=r2;
                        deff1=false;
                        if (r instanceof DUBRK) return r.res;
                        if (deff2) return DU.loop(f,r); //☆
                    }).fail(function () {
                        deff1=false;
                    });
                    deff2=true;
                    if (deff1) return dr;//☆
                    //★
                }
            }catch (e) {
                return DU.throwPromise(e);
            }
        },
        brk: function (res) {
            return new DUBRK(res);
        },
        tryLoop: function (f,r) {
            return DU.loop(DU.tr(f),r);
        },
        tryEach: function (s,f) {
            return DU.loop(s,DU.tr(f));
        },
        documentReady:function () {
            return DU.callbackToPromise(function (s) {$(s);});
        },
        requirejs:function (modules) {
            if (!window.requirejs) throw new Error("requirejs is not loaded");
            return DU.callbackToPromise(function (s) {
                window.requirejs(modules,s);
            });
        }
    };
    DU.begin=DU.try=DU.tr=DU.throwF;
    DU.promise=DU.callbackToPromise=DU.funcPromise;
    DU.external={Promise:window.Promise};
    return DU;
});
