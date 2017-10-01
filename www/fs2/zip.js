define(["SFile","jszip.min","Util","MIMETypes","DeferredUtil"],
function (SFile,JSZip,Util,M,DU) {
    var zip={};
    zip.zip=function (dir,dst,options) {
        var zip = new JSZip();
        function loop(dst, dir) {
            dir.each(function (f) {
                if (f.isDir()) {
                    var sf=dst.folder(f.name());
                    loop(sf, f);
                } else {
                    dst.file(f.name(),f.text());
                }
            });
        }
        loop(zip, dir);
        return zip.generateAsync({
            type:"arraybuffer",
            compression:"DEFLATE"
        }).then(function (content) {
            return dst.setBytes(content);
        });
    };
    zip.unzip=function (arrayBuf,destDir) {
        var c;
        if (SFile.is(arrayBuf)) {
        	c=arrayBuf.getContent();
        	arrayBuf=c.toArrayBuffer();
        }
        var zip=new JSZip();
        return zip.loadAsync(arrayBuf).then(function () {
            return DU.each(zip.files,function (key,zipEntry) {
                //var zipEntry=zip.files[i];
                return zipEntry.async("arraybuffer").then(function (buf) {
                    var dest=destDir.rel(zipEntry.name);
                    var c=FS.Content.bin( buf, dest.contentType() );
                    if (!dest.isDir()) dest.setContent(c);
                    console.log("Inflating",zipEntry.name);
                });
            });
        });
    };
    zip.JSZip=JSZip;
    return zip;
});