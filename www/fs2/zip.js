define(["SFile","jszip.min","FileSaver.min","Util","MIMETypes","DeferredUtil"],
function (SFile,JSZip,fsv,Util,M,DU) {
    var zip={};
    zip.zip=function (dir,dstZip,options) {
        if (!SFile.is(dstZip)) options=dstZip;
        options=options||{};
        var zip = new JSZip();
        function loop(dst, dir) {
            return dir.each(function (f) {
                if (f.isDir()) {
                    var sf=dst.folder(f.name());
                    return loop(sf, f);
                } else {
                    return f.getContent(function (c) {
                        dst.file(f.name(),c.toArrayBuffer());
                    });
                }
            });
        }
        return loop(zip, dir).then(function () {
            return DU.resolve(zip.generateAsync({
                type:"arraybuffer",
                compression:"DEFLATE"
            }));
        }).then(function (content) {
            //console.log("zip.con",content);
            if (SFile.is(dstZip)) {
                return dstZip.setBytes(content);
            } else {
                saveAs(
                    new Blob([content],{type:"application/zip"}),
                    dir.name().replace(/[\/\\]$/,"")+".zip"
                );
            }
        });
    };
    zip.unzip=function (arrayBuf,destDir,options) {
        var c;
        var status={};
        options=options||{};
        if (SFile.is(arrayBuf)) {
        	c=arrayBuf.getContent();
        	arrayBuf=c.toArrayBuffer();
        }
        if (!options.onCheckFile) {
            options.onCheckFile=function (f) {
                if (options.overwrite) {
                    return f;
                } else {
                    if (f.exists()) {
                        return false;
                    }
                    return f;
                }
            };
        }
        var zip=new JSZip();
        return DU.resolve(zip.loadAsync(arrayBuf)).then(function () {
            return DU.each(zip.files,function (key,zipEntry) {
                //var zipEntry=zip.files[i];
                return DU.resolve(zipEntry.async("arraybuffer")).then(function (buf) {
                    var dest=destDir.rel(zipEntry.name);
                    console.log("Inflating",zipEntry.name);
                    if (dest.isDir()) return;
                    var s={
                        file:dest,
                        status:"uploaded"
                    };
                    status[dest.path()]=s;
                    var c=FS.Content.bin( buf, dest.contentType() );
                    var res=options.onCheckFile(dest,c);
                    if (res===false) {
                        s.status="cancelled";
                        dest=null;
                    }
                    if (SFile.is(res)) {
                        if (dest.path()!==res.path()) s.redirectedTo=res;
                        dest=res;
                    }
                    if (dest) return dest.setContent(c);
                });
            });
        }).then(function () {
            console.log("unzip done",status);
            return status;
        });
    };
    zip.JSZip=JSZip;
    return zip;
});
