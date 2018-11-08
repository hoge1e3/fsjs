define(["Klass","DeferredUtil"],function (Klass,DU) {
    WorkerService=Klass.define({
        $this:"t",
        $:function (t,worker) {
            // worker is required only in browser context
            t.worker=worker||self;
            t.paths=[];
            t.queue={};
            t.idSeq=1;
            t.worker.addEventListener(function (e) {
                var data=e.data;
                if (typeof data=="string") data=JSON.parse(data);
                switch (data.type) {
                    case: "request":
                    t.procRequest(data);
                    break;
                    case "error":
                    case "success":
                    t.procResponse(data);
                    break;
                }
            });
        },
        procRequest: function (req) {
            for (var k in t.paths) {
                var p=t.paths[k];
                var s=p.path;
                if (req.path.substring(0,s.length)===s) {
                    p.func(req.params).then(function (res) {
                        t.postMessage({
                            type: "success",
                            id: req.id,
                            content: res
                        });
                    },function (e) {
                        t.postMessage({
                            type: "error",
                            id: req.id,
                            content: e
                        });
                    });
                    return;
                }
            }
            t.postMessage({
                type: "error",
                id: req.id,
                content: "path "+req.path+" not match"
            });
        },
        procResponse: function (t,resp) {
            var q=t.queue[resp.id];
            delete t.queue[resp.id];
            q[resp.type](resp.content);
        },
        postMessage: function (data) {
            t.worker.postMessage(JSON.stringify(data));
        },
        serve: function (path, func) {
            // in browser context, serve browser functions to worker
            // in worker context, serve worker functions to browser
            this.paths.push({path:path,func:func});
        },
        newID: function () {
            return this.idSeq++;
        }
        request: function (t,path, params) {
            // in browser context, send request to worker
            // in worker context, send request to browser
            return DU.promise(function (succ,err)) {
                var id=t.newID();
                t.queue[id]={success:succ,error:err};
                t.postMessage({
                    type:"request",
                    path:path,params:params,id:id
                });
            });
        }
    });
});
