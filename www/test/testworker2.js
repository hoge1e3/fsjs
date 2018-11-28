importScripts("lib/reqConf.js");
importScripts("lib/require.js");
requirejs.conf(reqConf);
requirejs(["FS","WorkerService"],function (FS,WS) {
    var nw=new WS();
    nw.serve("/proc",function (params) {
        var work=FS.get("/tmp/");
        work.importFromObject(params.tree);
        var res=[];
        work.recursive(function (f) {
            res+=f.path()+"\n"+f.text()+"\n------\n";
        });
        return res;
    });
});
