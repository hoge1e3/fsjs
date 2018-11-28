const JS="../www/js/";
const requirejs=require("requirejs");
var reqConf=require(JS+"reqConf.js").conf;
//console.log(requirejs);
reqConf.baseUrl=JS;
delete reqConf.urlArgs;
//reqConf.nodeRequire=require;
requirejs.config(reqConf);
console.log(reqConf.paths.FS);
console.log(reqConf.paths.FSLib);
//console.log(reqConf);
requirejs(["FSLib"],function (FS) {
    console.log(FS);
});
