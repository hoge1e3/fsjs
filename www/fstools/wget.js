define(["Shell","FS"],function (sh,FS) {
    sh.wget=function (url,options) {
        var dst=this.resolve(FS.PathUtil.name(url));
        sh.echo("Getting ",url,"...");
        return $.get(url).then(function (r) {
            sh.echo("Save to ",dst.path());
            dst.text(r);
        });
    };
    return sh.wget;
});