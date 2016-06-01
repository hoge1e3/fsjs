define(["Shell","UI","FS","Util","ShellParser"], 
function (shParent,UI,FS,Util,shp) {
    var res={};
    var sh=shParent.clone();
    res.show=function (dir) {
        var d=res.embed(dir);
        d.dialog({width:600,height:500});
    };
    res.embed=function (dir) {
        if (!res.d) {
            res.d=UI("div",{title:"Shell"},["div",{$var:"inner"},"Type 'help' to show commands.",["br"]]);
            res.inner=res.d.$vars.inner;
            sh.prompt();
        }
        var d=res.d;
        return d;
    };
    sh.cls=function () {
        res.d.$vars.inner.empty();
    };
    function hitBottom() {
        res.inner.closest(".ui-dialog-content").scrollTop(res.inner.height());
    }

    sh.prompt=function () {
        var t=this;
        var line=UI("div",
            ["input",{$var:"cmd",size:40,on:{keydown: kd}}],
            ["pre",{$var:"out","class":"shell out"},["div",{$var:"cand","class":"shell cand"}]]
        );
        var cmd=line.$vars.cmd;
        var out=line.$vars.out;
        var cand=line.$vars.cand;
        line.appendTo(res.inner);
        hitBottom();
        cmd.focus();
        //var d=new $.Deferred;
        t.setout({log:function () {
           // return $.when.apply($,arguments).then(function () {
                var a=[];
                for (var i=0; i<arguments.length; i++) {
                    a.push(arguments[i]);
                }
                if (a[0] instanceof $) {
                    out.append(a[0]);
                } else {
                    out.append(UI("span",a.join(" ")+"\n"));
                }
            //});
        },err:function (e) {
            out.append(UI("div",{"class": "shell error"},e,["br"],["pre",e.stack]));
        }});
        return;// d.promise();
        function kd(e) {
            if (e.which==9) {
                e.stopPropagation();
                e.preventDefault();
                comp();
                return false;
            }
            if (e.which==13) {
                cand.empty();
                exec(cmd.val());
            }
        }
        function exec() {
            try {
                var sres=t.enterCommand(cmd.val());
                cmd.blur();
                return $.when(sres).then(function (sres) {
                    if (typeof sres=="object") {
                        if (sres instanceof Array) {
                            var table=UI("table");
                            var tr=null;
                            var cnt=0;
                            sres.forEach(function (r) {
                                if (typeof r!="string") return;
                                if (!tr) tr=UI("tr").appendTo(table);
                                tr.append(UI("td",r));
                                cnt++;if(cnt%3==0) tr=null;
                            });
                            table.appendTo(out);
                        } else {
                            out.append(JSON.stringify(sres));
                        }
                    } else {
                        out.append(sres);
                    }
                    t.prompt();
                });
            } catch(e) {
                t.err(e);
                //out.append(UI("div",{"class": "shell error"},e,["br"],["pre",e.stack]));
                t.prompt();
            }
        }
        function comp(){
            var c=cmd.val();
            var cs=c.split(" ");
            var fn=cs.pop();
            var canda=[];
            if (cs.length==0) {
                for (var k in sh) {
                    if (typeof sh[k]=="function" && Util.startsWith(k, fn)) {
                        canda.push(k);
                    }
                }
            } else {
                var f=sh.resolve(fn,false);
                //console.log(fn,f);
                if (!f) return;
                var d=(f.isDir() ? f : f.up());
                d.each(function (e) {
                    if ( Util.startsWith(e.path(), f.path()) ) {
                        canda.push(e.name());
                    }
                });
            }
            if (canda.length==1) {
                var fns=fn.split("/");
                fns.pop();
                fns.push(canda[0]);
                cs.push(fns.join("/"));
                cmd.val(cs.join(" "));
                cand.empty();
            } else {
                cand.text(canda.join(", "));
            }
            hitBottom();
            //console.log(canda);
            //cmd.val(cmd.val()+"hokan");
        }
    };
    sh.edit=function (f) {
        f=this.resolve(f);
        var u=UI("div",
            ["div",["textarea",{rows:10,cols:60,$var:"prog"}]],
            ["div",["button",{on:{click:save}},"Save"]]
        );
        if (f.exists()) u.$vars.prog.val(f.text());
        return this.echo(u);
        function save() {
            f.text( u.$vars.prog.val() );
        }
    };
    sh.window=function () {
        res.show(sh.cwd);
    };
    sh.atest=function (a,b,options) {
        console.log(a,b,options);
    };
    var oldcat=sh.cat;
    sh.cat=function (file,options) {
        file=sh.resolve(file, true);
        if (file.contentType().match(/^image\//)) {
            return file.getContent(function (c) {
                sh.echo(UI("img",{src:c.toURL()}));
            });
        } else {
            return oldcat.apply(sh,arguments);
        }
    };
    sh.usopen=function (){
        this.echo(UI("iframe").attr("src","http://jsrun.it/hoge1e4/qgNZ"));
    };
    sh.open=function (f) {
        f=this.resolve(f,true);
        var x=$($.parseXML(f.text()));
        var i=UI("iframe");
        //i.attr("src","blank.html");
        var base=f.up();
        var iwin;
        var idoc;
        var d=new $.Deferred;
        window.ifrm=i[0];
        i.on("load",function () {
            iwin=i[0].contentWindow;
            idoc=iwin.document;
            appendTo($(x).find("head")[0], idoc.head);
            appendTo($(x).find("body")[0], idoc.body);
            d.resolve(i[0]);
        });
        this.echo(i);
        function injectScript(src) {
            var nn=idoc.createElement("script");
            nn.appendChild(idoc.createTextNode(src));
            idoc.head.appendChild(nn);
        }
        function appendTo(src,dst) {
            var c=src.childNodes;
            console.log("appendto",c,c.length);
            for (var i=0;i<c.length ; i++) {
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
                    console.log("names", names);
                    names.forEach(function (name) {
                        var value=n.getAttribute(name);
                        if (name=="src" && FS.PathUtil.isRelativePath(value)) {
                            var sfile=base.rel(value);
                            value=file2blobURL(sfile);
                            console.log("blob",sfile, value);
                        } 
                        nn.setAttribute(name, value);
                    });
                    appendTo(n ,nn);
                    dst.appendChild(nn);
                } else {
                    dst.appendChild(idoc.createTextNode(n.textContent));
                }
            }
        }
        function file2blobURL(sfile) {
            var blob;
            if (sfile.isText()) {
                blob = new iwin.Blob([sfile.text()], {type: sfile.contentType()});
            } else {
                blob = new iwin.Blob([sfile.bytes()], {type: sfile.contentType()});
            }
            var url = iwin.URL.createObjectURL(blob);
            return url;
        }
        return d.promise();
    };
    return res;
});