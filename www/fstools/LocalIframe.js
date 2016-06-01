define(["Shell", "FS","DeferredUtil"],function (sh,FS,DU) {
    var LocalIframe={};
    LocalIframe.create=function (attrs) {    
        var f=attrs.src;
        var onload=attrs.onload || function () {};
        delete attrs.src;
        delete attrs.onload;
        var x=$($.parseXML(f.text()));
        var i=$("<iframe>");
        i.attr(attrs);
        var base=f.up();
        var iwin;
        var idoc;
        window.ifrm=i[0];
        i.on("load",function () {
            iwin=i[0].contentWindow;
            iwin.LocalIframeInfo={
                __file__: f,
                convertURL:function (url) {
                    return LocalIframe.convertURL(iwin, url, base);
                }
            };
            idoc=iwin.document;
            appendTo($(x).find("head")[0], idoc.head);
            appendTo($(x).find("body")[0], idoc.body);
            onload.apply(i,[]);
        });
        return i;
        function appendTo(src,dst) {
            var c=src.childNodes;
            return DU.loop(function (i){
                var d;
                if (!(i<c.length)) return DU.brk();
                var n=c[i];
                if (n.tagName) {
                    var nn=idoc.createElement(n.tagName);
                    var at=n.attributes;
                    // should charset must be set first than src
                    var names=[];
                    for (var j=0;j<at.length;j++) {
                        names.push(at[j].name);
                    }
                    var idx=names.indexOf("charset");
                    if (idx>=0) { 
                        names.splice(idx,1); 
                        names.unshift("charset"); 
                    }
                    names.forEach(function (name) {
                        var value=n.getAttribute(name);
                        if (name=="src") {
                            value=iwin.LocalIframeInfo.convertURL(value);
                        }
                        if (n.tagName=="script") {
                            d=new $.Deferred;
                            nn.onload = nn.onreadystatechange = function() {
                                d.resolve(i+1);
                            };
                        }
                        nn.setAttribute(name, value);
                    });
                    dst.appendChild(nn);
                    return $.when(d && d.promise()).then(function () {
                        return appendTo(n ,nn);
                    }).then (function () {
                        return i+1;
                    });
                } else {
                    dst.appendChild(idoc.createTextNode(n.textContent));
                    return i+1;
                }
            },0);
        }
    };
    LocalIframe.convertURL=function (iwin,url,base) {
        if (FS.PathUtil.isRelativePath(url)) {
            var sfile=base.rel(url);
            url=LocalIframe.file2blobURL(iwin,sfile);
        }
        return url;
    };
    LocalIframe.file2blobURL=function (iwin,sfile) {
        var blob;
        if (sfile.isText()) {
            blob = new iwin.Blob([sfile.text()], {type: sfile.contentType()});
        } else {
            blob = new iwin.Blob([sfile.bytes()], {type: sfile.contentType()});
        }
        var url = iwin.URL.createObjectURL(blob);
        return url;
    };
    if (typeof sh=="object") sh.showframe=function (f) {
        f=this.resolve(f,true);
        var d=new $.Deferred;
        var ifrm=LocalIframe.create({src:f,onload:function () {
            d.resolve();            
        }});
        this.echo(ifrm);
        return d.promise();
    };
    return LocalIframe;
});
