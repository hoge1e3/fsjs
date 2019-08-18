({
    name: 'ShellUI',
    out: 'gen/fsTools.js',
    optimize:"none",
    //namespace: "fsjs",
    baseUrl: "./fstools",
    wrap: {
        startFile: "requireSimulator2_head.js",
        endFile: "requireSimulator2_tail_tool.js"
    },
    paths:{
        root:"../lib/root",
        UI:"../lib/UI",
        "source-map":"../lib/source-map",
        Util:"../fs2/Util",
        assert:"../fs2/assert",
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
