define(["WorkerRevProxy","FSClass"],function (WRP,FSClass) {
    var klass=function (rootFS) {
        this.rootFS=rootFS;
    };
    var FSRevProxy=function (rootFS) {
        return new WRP(new klass(rootFS));
    };
    var p=klass.prototype;
    Object.keys(FSClass.prototype).forEach(function (k) {
        p[k]=function () {
            var a=Array.prototype.slice.call(arguments);
            var path=a[0];
            var fs=this.rootFS.resolveFS(path);
            return fs[k].apply(fs,a);
        };
    });
    return FSRevProxy;
});
