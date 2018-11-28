const JS="../www/";
const requirejs=require("./r.js");//../node_modules/requirejs/bin/r.js");
requirejs([JS+"gen/FS"],function (FS) {
    var c=FS.get(process.cwd());
    console.log(c.ls());
    var fl=c.listFiles();
    console.log(fl.map((f)=>f.name()));
    var f=c.rel("test.js");
    console.log(f.path(),f.text());

});
