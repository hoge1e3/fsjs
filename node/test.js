const JS="../www/";
//const requirejs=require("requirejs");
const requirejs=require("./r.js");//../node_modules/requirejs/bin/r.js");
/*var reqConf=require(JS+"reqConf.js").conf;
//console.log(requirejs);
reqConf.baseUrl=JS;
delete reqConf.urlArgs;
//reqConf.nodeRequire=require;
requirejs.config(reqConf);
console.log(reqConf.paths.FS);
console.log(reqConf.paths.FSLib);*/
requirejs.config({
    baseUrl:JS+"fs2",
    /*nodeRequire: function (p) {
        console.log(p);
        if (p==="fs") {
            const fs=require(p);
            console.log("require(fs)4",!!fs);
            return fs;
        }
        return require(p);
    }*/
});
//console.log(reqConf);
requirejs(["FS"],function (FS) {
    //const fs=require("fs");
    //console.log("require(fs)3",!!fs,require);
    //console.log(FS);
    /*FS.DeferredUtil.resolve(3)*/
    /*new Promise(function (s){s(3);}).then(function (r) {
        console.log("r1",r);
    });
    console.log("r2");*/
    var c=FS.get(process.cwd());
    console.log(c.ls());
    var fl=c.listFiles();
    console.log(fl.map((f)=>f.name()));
    var f=c.rel("test.js");
    console.log(f.path(),f.text());
    FS.get("c:\\tmp\\").watch((...e)=>console.log(e),{recursive:true});
    FS.get("c:\\tmp\\test.txt").text("test");
    FS.get("c:\\tmp\\a\\test.txt").text("test");
    //var fs=require("fs");
    //var rdb=fs.readFileSync(f.path());
    //console.log("rdb",rdb instanceof Buffer,rdb.length,rdb.buffer.byteLength);
    //var cn=FS.Content.bin(rdb,f.contentType());//  f.getContent();
    /*console.log(cn);
    var buf=new Uint8Array(cn.arrayBuffer);
    var con="";
    for (var i=0;i<100;i++) {con+=String.fromCharCode(buf[i]);}*/
    //console.log(con);
    //console.log(cn.toPlainText());
});
