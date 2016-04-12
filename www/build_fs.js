({
    name: 'FS',
    out: 'gen/FS.js',
    optimize:"none",
    //namespace: "fsjs",
    baseUrl: "./fs2"/*,
    paths: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.paths;
     })(),
    shim: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.shim;
     })()*/
})
