var reqConf={
        "shim": {
        },
        "paths": {
            "UI":"../lib/UI",
            "Shell":"../fstools/Shell",
            "ShellUI":"../fstools/ShellUI",
            "LocalIframe":"../fstools/LocalIframe",
            "LocalBrowser":"../fstools/LocalBrowser",
            "FileBrowser":"../fstools/FileBrowser",
            "ShellParser":"../fstools/ShellParser",
            "wget":"../fstools/wget",
            "DragDrop":"../fstools/DragDrop",
            "source-map":"../lib/source-map",
            "promise": "../lib/promise",
	        worker: "../worker/worker",//ADD
       		workerProxy: "../worker/proxy",//ADD
            WorkerRevProxy: "../worker/WorkerRevProxy", //ADD
            testworker: "../test/testworker",
            "foooooo":"bar"
        },
        worker: {//ADD all
            //debug: true,
            stack: true,
            path: "webworker.js"// relative from html. Not influenced by baseUrl and needs .js
        },
        "baseUrl": "fs2"
};
if (typeof exports!=="undefined") exports.conf=reqConf;
