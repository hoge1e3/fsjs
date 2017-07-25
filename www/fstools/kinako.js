define(["Shell","FS"],function (sh,FS) {
    /*
requirejs ../fstools/kinako
kinako /kn/ / index.html

edit /kn/index.html
*/
    sh.kinako=function (local,remote,html,options) {
        /* FS Mapping?
           remote dir
           remote dir to URL mapper
            このdirより下はhttp://.... で直接参照できます
            {"/":"pub/"}
            
            BA:
            {"/pub/":"fs/pub/"}
        */
        local=sh.resolve(local);
        remote=sh.resolve(remote);
        var htmlPath=remote.rel(html).path();        
        options=options||{};
        var filesS=JSON.stringify([remote.path()]);
        console.log(filesS);
        return $.post("a.php?kinako",{
            cmd:"download",
            files:filesS
        }).then(function (data) {
            console.log(data);
            var ifrm=$("<iframe>");
            var diag=$("<div>").attr({title:htmlPath}).append(ifrm).dialog();
            ifrm.attr("src","pub/"+htmlPath);
            for (var k in data) {
                var rp=PathUtil.relPath(k,  remote.path());
                var dst=local.rel(rp);
                //console.log(rp, local.rel(rp).path(),data[k]);
                if (!dst.isDir()) local.rel(rp).text(data[k]);
            }
            local.observe(function (path,metaInfo) {
                try {
                    console.log(path);
                    if (FS.PathUtil.isDir(path)) return;
                    var files={};
                    files[remote.rel(FS.PathUtil.relPath(path, local.path())).path()]=sh.resolve(path).text();
                    console.log(JSON.stringify(files));
                    $.post("a.php?kinako", {
                        cmd:"upload",
                        files: JSON.stringify(files),
                        page: htmlPath
                    }).then(function (r) {
                        console.log("Reloaded",r);
                        ifrm[0].contentWindow.location.reload();
                    },function (e) {
                       console.log(e);
                    });
                }catch(e){console.log(e.stack);}
            });
        })/*.fail(function (e) {
            console.log(e);
        })*/;
    };
    
});