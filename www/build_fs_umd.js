({
    name: 'FS',
    out: 'gen/FS_umd.js',
    optimize:"none",
    //namespace: "fsjs",
    baseUrl: "./fs2",
    wrap: {
        startFile: "requireSimulator2_head_umd.js",
        endFile: "requireSimulator2_tail.js"
    }
    /*,
    paths: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.paths;
     })(),
    shim: (function () {
        var conf=nodeRequire(process.cwd()+"/reqConf.js");
        return conf.conf.shim;
     })()*/
})
