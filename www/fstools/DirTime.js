/*global requirejs*/
requirejs(["PathUtil","Shell"],function (p,sh) {
    sh.dirTime=function (f) {
        f=this.resolve(f);
        var t=this;
        //t.echo("Listing",f);
        var k=0;
        f.each(function (f) {
            var d=new Date(t.maxModified(f));
            if (d.getYear()<116) {
                t.echo("rmdir /s /q "+f.path().replace(/\/$/,""));
            }
        },{nosep:true});
        return k;
    };
    sh.maxModified=function (f) {
        try {
            f=this.resolve(f);
            if (!f.isDir()) {
                return f.lastUpdate();
            }
            var t=this;
            var k=0;
            f.each(function (f) {
                var e=t.maxModified(f);
                if (e>k) k=e;
            },{nosep:true});
            return k;
        } catch(e) {
            return new Date().getTime();
        }
    };
    /*
    requirejs ../fstools/DirTime
    dirTime ${TEMP}
    */
});
