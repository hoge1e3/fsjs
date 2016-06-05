define(["Shell","FS"],function (sh,FS) {
    sh.wget=function (url,options) {
        var dst=this.resolve(FS.PathUtil.name(url));
        sh.echo("Getting ",url,"...");
        return $.get(url).then(function (r) {
            sh.echo("Save to ",dst.path());
            dst.text(r);
        });
    };
    sh.wget=function (url,options) {
        var dst=this.resolve(FS.PathUtil.name(url));
        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";
        sh.echo("Getting ",url,"...");
        var d=new $.Deferred;
        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                sh.echo("Save to ",dst.path());
                dst.bytes(arrayBuffer);
                d.resolve(arrayBuffer);
            } else {
                d.reject();
            }
        };
        oReq.send(null);
        return d.promise();
    }
    return sh.wget;
});