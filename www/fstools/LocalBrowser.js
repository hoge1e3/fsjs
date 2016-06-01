define(["Shell", "FS","DeferredUtil","UI"],function (sh,FS,DU,UI) {
    var LocalBrowser={};
    LocalBrowser=function (dom,options) {
        this.iframeArea=dom;//=UI("iframe");
    };
    p=LocalBrowser.prototype;
    p.open=function (f,options) {    
        options=options||{};
        var onload=options.onload || function () {};
        delete options.onload;
        var x=$($.parseXML(f.text()));
        var i=$("<iframe>");
        var base=f.up();
        var iwin;
        var idoc;
        var thiz=this;
        window.ifrm=i[0];
        i.on("load",function () {
            iwin=i[0].contentWindow;
            iwin.LocalIframeInfo={
                __file__: f,
                browser: thiz,
                open: function (url) {
                    if (FS.PathUtil.isRelativePath(url)) {
                        thiz.open(f.up().rel(url));
                    } else {
                        iwin.location.href=url;
                    }
                },
                convertURL:function (url) {
                    return LocalBrowser.convertURL(iwin, url, base);
                }
            };
            idoc=iwin.document;
            return $.when().then(function () {
                return appendTo($(x).find("head")[0], idoc.head);
            }).then(function (){
                return appendTo($(x).find("body")[0], idoc.body);
            }).then(function () {
                onload.apply(i,[]);
            });
        });
        $(this.iframeArea).empty().append(i);
        return i;
        function appendTo(src,dst) {
            var c=src.childNodes;
            return DU.loop(function (i){
                var d;
                if (!(i<c.length)) return DU.brk();
                var n=c[i];
                //console.log(i,n.tagName);
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
                        if (n.tagName=="a" && name=="href" && 
                        FS.PathUtil.isRelativePath(value)) {
                            value="javascript:LocalIframeInfo.open('"+value+"');";
                        }
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
    LocalBrowser.convertURL=function (iwin,url,base) {
        if (FS.PathUtil.isRelativePath(url)) {
            var sfile=base.rel(url);
            url=LocalBrowser.file2blobURL(iwin,sfile);
        }
        return url;
    };
    LocalBrowser.file2blobURL=function (iwin,sfile) {
        var blob;
        if (sfile.isText()) {
            blob = new iwin.Blob([sfile.text()], {type: sfile.contentType()});
        } else {
            blob = new iwin.Blob([sfile.bytes()], {type: sfile.contentType()});
        }
        var url = iwin.URL.createObjectURL(blob);
        return url;
    };
    if (typeof sh=="object") sh.browser=function (f) {
        f=this.resolve(f,true);
        var d=new $.Deferred;
        var place=$("<div>");
        this.echo(place);
        var ifrm=new LocalBrowser(place);
        ifrm.open(f,{onload:function () {
            d.resolve();            
        }});
        return d.promise();
    };
    return LocalBrowser;
});
