define(["WorkerRevProxy","FS2"],function (WRP,FS2) {
    var klass=function (rootFS) {
        this.rootFS=rootFS;
    };
    var FSRevProxy=function (rootFS) {
        return new WRP(new klass(rootFS));
    };
    var p=klass.prototype;
    Object.keys(FS2.prototype).forEach(function (k) {
        p[k]=function () {
            var a=Array.prototype.slice.call(arguments);
            var path=a[0];
            var fs=this.rootFS.resolveFS(path);
            return fs[k].apply(fs,a);
        };
    });
    return FSRevProxy;
});
