({
    name: 'FSWithZip',
    out: 'gen/FSWithZip.js',
    optimize:"none",
    //namespace: "fsjs",
    baseUrl: "./fs2",
    wrap: {
        startFile: "requireSimulator2_head.js",
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
