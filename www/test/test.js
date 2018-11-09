//requirejs(["WebFS","LSFS","../test/ROM_k","assert","PathUtil","SFile","NativeFS","RootFS","Content","DeferredUtil","WorkerRevProxy","FSRevProxy"],
//function (WebFS,LSFS, romk,assert,P,SFile, NativeFS,RootFS,Content,DU,WRP,FSRevProxy) {
requirejs(["FS","../test/ROM_k","WorkerRevProxy","FSRevProxy"],
function (FS,romk,WRP,FSRevProxy) {
try{
    var assert=FS.assert;
    assert.is(arguments,
        [Object,FS.LSFS,Function,Function]);
//       [Function,Function,LSFS,Function,Object,Function,Function,Function]);
    var WebFS=assert(FS.WebFS),
        LSFS=assert(FS.LSFS),
        P=assert(FS.PathUtil),
        SFile=assert(FS.SFile),
        NativeFS=assert(FS.NativeFS),
        RootFS=assert(FS.RootFS),
        Content=assert(FS.Content),
        DU=assert(FS.DeferredUtil);
    var rootFS=window.rfs=new RootFS(new LSFS(localStorage));
    window.onerror=function (e) {
        alert(e);
        alert(e.stack);
        //console.log(e.stack);
        //if (e.preventDefault) e.preventDefault();
        return false;
    };

    window.PathUtil=P;
    window.romk=romk;
    rootFS.mount("/rom/",romk);
    rootFS.mount("/ram/",LSFS.ramDisk());
    rootFS.get("/var/").mkdir();
    // check cannot mount which is already exists (別にできてもいいじゃん)
    /*assert.ensureError(function (){
        rootFS.mount("/var/",romk);
    });*/
    var cd=assert.is(rootFS.get("/"),SFile);
    var root=cd;
    // check relpath:
    //  path= /a/b/c   base=/a/b/  res=c
    assert( root.rel("a/b/c").relPath("/a/b/")==="c");
    assert( root.rel("a/b/c").relPath(root.rel("a/b/"))==="c");
    //  path= /a/b/c/   base=/a/b/  res=c/
    assert( root.rel("a/b/c/").relPath("/a/b/")==="c/");
    //  path= /a/b/c/   base=/a/b/c/d  res= ../
    assert( root.rel("a/b/c/").relPath("/a/b/c/d")==="../");
    //  path= /a/b/c/   base=/a/b/e/f  res= ../../c/
    assert( root.rel("a/b/c/").relPath("/a/b/e/f")==="../../c/");
    // ext()
    assert.eq(P.ext("test.txt"),".txt");
    testContent();
    var nfs;
    if (NativeFS.available)  {
        require('nw.gui').Window.get().showDevTools();
        var nfsp="C:/bin/Dropbox/workspace/fsjs/fs/";//P.rel(PathUtil.directorify(process.cwd()), "fs/");
        console.log(nfsp);
        var nfso;
        rootFS.mount("/fs/",nfso=new NativeFS(nfsp));
        assert(nfso.exists("/fs/"),"/fs/ not exists");
        nfs=root.rel("fs/");
    }
    var r=cd.ls();
    var ABCD="abcd\nefg";
    var CDEF="defg\nてすと";
    //obsolate: ls does not enum mounted dirs
    //assert(r.indexOf("rom/")>=0, r);
    var romd=root.rel("rom/");
    var ramd=root.rel("ram/");
    var testf=root.rel("testfn.txt");
    if (nfs) assert(nfs.fs.isText("/test.txt"));

    var testd;
    if (!testf.exists()) {
        console.log("Test pass",1);
        testd=cd=cd.rel(/*Math.random()*/"testdir"+"/");
        console.log("Enter", cd);
        testd.mkdir();
        chkrom();
        //--- check exists
        assert(testd.exists({includeTrashed:true}));
        assert(testd.exists());
        //--- check lastUpdate
        var d=LSFS.now();
        testf.text(testd.path());
        assert( Math.abs( testf.lastUpdate()-d) <= 1000);
        chkrom();
        testd.rel("test.txt").text(ABCD);
        chkrom();
        assert(romd.rel("Actor.tonyu").text().length>0);
        assert.ensureError(function () {
            romd.rel("Actor.tonyu").text("hoge");
        });
        testd.rel("sub/test2.txt").text(romd.rel("Actor.tonyu").text());
        chkrom();
        var tncnt=0;
        romd.recursive(function (f) {
            //console.log("ROM",tncnt,f.path());
            tncnt++;
        },{excludes:function (f){ return !f.isDir() && f.ext()!==".tonyu"; }});
        console.log(".tonyu files in romd/",tncnt);
        assert.eq(tncnt,46,"tncnt");
        tncnt=0;
        var exdirs=["physics/","event/","graphics/"];
        romd.recursive(function (f) {
            tncnt++;
        },{excludes:exdirs});
        console.log("files in romd/ except",exdirs,tncnt);
        assert.eq(tncnt,33,"tncnt");

        assert(testd.rel("sub/").exists());
        assert(rootFS.get("/testdir/sub/").exists());
        assert(testf.exists());
        var sf=testd.setPolicy({topDir:testd});//SandBoxFile.create(testd._clone());
        assert(sf.rel("test.txt").text()==ABCD);
        sf.rel("test3.txt").text(CDEF);
        assert.ensureError(function () {
            var rp=romd.rel("Actor.tonyu").relPath(sf) ;
            console.log(rp);
            //alert("RP="+ rp );
            alert( sf.rel( rp ).text() );
        });
        assert.eq(sf.rel("test3.txt").text(),CDEF);
        assert.ensureError(function () {
            alert( sf.listFiles()[0].up().rel("../rom/Actor.tonyu").text() );
        });
        sf.rel("test3.txt").rm({noTrash:true});
        assert(!testd.rel("test3.txt").exists({includeTrashed:true}));
        ramd.rel("toste.txt").text("fuga");
        assert.ensureError(function (){
            ramd.rel("files").link(testd);
        });
        ramd.rel("files/").link(testd);
        testd.rel("sub/del.txt").text("DEL");
        assert(ramd.rel("files/").isLink());
        assert.eq(ramd.rel("files/test.txt").resolveLink().path(), testd.rel("test.txt").path() );
        assert.eq(ramd.rel("files/test.txt").text(),ABCD);
        assert.eq(ramd.rel("files/sub/test2.txt").text(),romd.rel("Actor.tonyu").text());
        ramd.rel("files/sub/del.txt").rm();
        assert(!testd.rel("sub/del.txt").exists());
        ramd.rel("files/sub/del.txt").rm({noTrash:true});
        assert(!testd.rel("sub/del.txt").exists({includeTrashed:true}));
        ramd.rel("files/").rm();
        assert(testd.exists());
        console.log(ramd.fs.storage);
        assert(!("/../" in ramd.fs.storage));
        if (nfs) {
            console.log(nfs.ls());
            nfs.rel("sub/test2.txt").text(romd.rel("Actor.tonyu").text());
            nfs.rel("test.txt").text(ABCD);
            var pngurl=nfs.rel("Tonyu/Projects/MapTest/images/park.png").text();
            assert(P.startsWith(pngurl, "data:"));
            document.getElementById("img").src=pngurl;
            nfs.rel("sub/test.png").text(pngurl);

            nfs.rel("sub/test.png").copyTo(testd.rel("test.png"));
            chkCpy(nfs.rel("Tonyu/Projects/MapTest/Test.tonyu"));
            chkCpy(nfs.rel("Tonyu/Projects/MapTest/images/park.png"));
            chkCpy(testd.rel("test.png"));
            testd.rel("test.png").removeWithoutTrash();
            //---- test append
            var beforeAppend=nfs.rel("Tonyu/Projects/MapTest/Test.tonyu");
            var appended=nfs.rel("Tonyu/Projects/MapTest/TestApp.tonyu");
            beforeAppend.copyTo(appended);
            var apText="\n//tuikasitayo-n\n";
            appended.appendText(apText);
            assert.eq(beforeAppend.text()+apText,appended.text());
        }
        console.log(testd.rel("test.txt").path(),testd.rel("test.txt").text());
        testd.rel("test.txt").text(romd.rel("Actor.tonyu").text()+ABCD+CDEF);
        chkCpy(testd.rel("test.txt"));
        testd.rel("test.txt").text(ABCD);
        //--- the big file
        var cap=LSFS.getCapacity();
        console.log("usage",cap);
        if (cap.max<100000000) {
            var len=cap.max-cap.using+1500;
            var buf="a";
            while(buf.length<len) buf+=buf;
            var bigDir=testd.rel("bigDir/");
            var bigDir2=bigDir.sibling("bigDir2/");
            if (bigDir2.exists()) bigDir2.rm({r:1});
            var bigFile=bigDir.rel("theBigFile.txt");
            assert.ensureError(function () {
                console.log("Try to create the BIG ",buf.length,"bytes file");
                return bigFile.text(buf);
            });
            assert(!bigFile.exists(), "BIG file remains...?");
            buf=buf.substring(0,cap.max-cap.using-1500);
            buf=buf.substring(0,buf.length/10);
            for (var i=0;i<6;i++) bigDir.rel("test"+i+".txt").text(buf);
            bigDir.moveTo(bigDir2).then(
                function () {alert("You cannot come here(move big)");},
                function () {
                    console.log("Successfully kowareta!(move big!)");
                    return DU.resolve();
                }
            ).then(function () {
                for (var i=0;i<6;i++) assert(bigDir.rel("test"+i+".txt").exists());
                assert(!bigDir2.exists(),"Bigdir2 remains");
                console.log("Bigdir removing");
                bigDir.removeWithoutTrash({recursive:true});
                bigDir2.removeWithoutTrash({recursive:true});
                assert(!bigDir.exists());
                console.log("Bigdir removed!");
                return DU.resolve();
            }).then(DU.NOP,DU.E);
        }

        //------------------
        if (!nfs) {
            rootFS.mount(
                location.protocol+"//"+location.host+"/",
                "web");
            rootFS.get(location.href).getContent(function (c) {
                try {
                    console.log(location.href, c.toPlainText());
                    assert(c.toPlainText().indexOf("989174192312")>=0);
                }catch(e) {
                    alert(e);
                }
            });
        }
        DU.each([1,2,3],function(i) {
            //return DU.timeout(1000).then(function ()  {
                console.log("DU.EACH",i);
                if (i==2) i.c.d;
                return i;
            //});
        }).fail(function (e) {console.log("DU.ERR",(e+"").replace(/\n.*/,""));});
        DU.each({a:1,b:2,c:3},function(k,v) {
            return DU.timeout(500).then(function ()  {
                console.log("DU.EACH t/o",k,v);
                if (v==2) v.c.d;
                return v;
            });
        }).fail(function (e) {console.log("DU.ERR",(e+"").replace(/\n.*/,""));});
        DU.all([DU.timeout(500,"A"),DU.timeout(200,"B")]).then(function (r) {
            if (r.join(",")!=="A,B") alert(r.join(","));
            console.log("DU.all1",r);
        });
        DU.all([DU.timeout(500,"A"),DU.timeout(200,"B"),DU.reject("ERAA")]).then(function (r) {
            alert("DU.all2 Shoult not t reach here");
            console.log("DU.all2",r);
        },function (e) {
            if (e!=="ERAA") alert(e);
            console.log("DU.all rej",e);
        });
        assert.ensureError(function () {
            DU.throwNowIfRejected(
                DU.resolve(0).then(function (r) {
                    alert(r.a.b);
                })
            );
        });
        DU.throwNowIfRejected(
            DU.timeout(100).then(function (r) {
                alert(r.a.b);
            })
        ).then(
            function () {alert("NO!");},
            function (r) {console.log("DU.TNIR",(r+"").replace(/\n.*/,""));}
        );
        DU.throwNowIfRejected(
            DU.timeout(100).then(function (r) {
                return "OK";
            })
        ).then(
            function (r) {console.log("DU.TNIR",r);},
            function (r) {alert("NO! 2");}
        );
        DU.throwNowIfRejected(
            DU.resolve(100).then(function (r) {
                return "OK"+r;
            })
        ).then(
            function (r) {console.log("DU.TNIR",r);},
            function (r) {alert("NO! 3");}
        );
        requirejs(["worker!testworker"],function (tw) {
            var con=new WRP(console);
            //var fs=new WRP(rootFS);
            var fs=new FSRevProxy(rootFS);
            tw.proc(con,fs,"/").then(function (r) {
                console.log("testw ok",r);
                con.dispose();
            },function (e) {
                alert("testw err"+e);
            });
        });
        // blob->blob
        var f=testd.rel("hoge.txt");
        f.text("hogefuga");
        var tmp=testd.rel("fuga.txt");
        var b=f.getBlob();
        console.log("BLOB reading...",f.name(),tmp.name());
        tmp.setBlob(b).then(function () {
            checkSame(f,tmp);
            console.log("BLOB read done!",f.name(),tmp.name());
            tmp.rm({noTrash:true});
            f.rm({noTrash:true});
        });
        //setTimeout(function () {location.reload();},10000);
    } else {
        try {
            console.log("Test pass",2);
            testd=cd=rootFS.get(testf.text());
            assert(cd.exists());
            console.log("Enter", cd);
            assert(testd.rel("test.txt").text()===ABCD );
            assert(testd.rel("sub/").exists());
            assert(testd.rel("sub/test2.txt").text()===romd.rel("Actor.tonyu").text() );
            chkRecur(testd,{},"test.txt,sub/test2.txt");
            assert.eq(testd.ls().join(","), "test.txt,sub/");
            chkRecur(testd,{excludes:["sub/"]}, "test.txt");
            testd.rel("test.txt").rm();
            chkRecur(testd,{},"sub/test2.txt");
            console.log("FULLL",testd.path());
            console.log("FULLL",localStorage[testd.path()]);
            chkRecur(testd,{includeTrashed:true}, "test.txt,sub/test2.txt");
            testd.rel("test.txt").rm({noTrash:true});
            chkRecur(testd,{}, "sub/test2.txt");


            testd.removeWithoutTrash({recursive:true});
            chkrom();
            assert(!testd.exists({includeTrashed:false}));
            assert(!testd.exists({includeTrashed:true}));
            testf.removeWithoutTrash({recursive:true});
            chkrom();
            assert(!testf.exists({includeTrashed:false}));
            assert(!testf.exists({includeTrashed:true}));
            assert(!testd.rel("test.txt").exists({includeTrashed:true}));
            ramd.rel("a/b.txt").text("c").then(function () {
                return ramd.rel("c.txt").text("d");
            }).then(function () {
                return chkRecurAsync(ramd,{},"a/b.txt,c.txt");
            });
            if (nfs) {
                assert.eq(nfs.rel("sub/test2.txt").text(), romd.rel("Actor.tonyu").text());
                assert.eq(nfs.rel("test.txt").text(),ABCD);
                var pngurl=nfs.rel("Tonyu/Projects/MapTest/images/park.png").text();
                assert.eq(nfs.rel("sub/test.png").text(),pngurl);

            }
        } catch (e) {
            console.log(e.stack);
            testd.removeWithoutTrash({recursive:true});
            testf.removeWithoutTrash({recursive:true});
        }
    }
    console.log(rootFS.get("/var/").ls());
    console.log(rootFS.get("/rom/").ls());

    function chkCpy(f) {
       var tmp=f.up().rel("tmp_"+f.name());
       f.copyTo(tmp);
       checkSame(f,tmp);
       tmp.text("DUMMY");

       var c=f.getContent();
       tmp.setContent(c);
       checkSame(f,tmp);
       tmp.text("DUMMY");

       // plain->plain(.txt) / url(bin->URL)->url(URL->bin) (.bin)
       var t=f.text();
       tmp.text(t);
       checkSame(f,tmp);
       tmp.text("DUMMY");

       // url(bin->URL)->url(URL->bin)
       var t=f.dataURL();
       tmp.dataURL(t);
       checkSame(f,tmp);
       tmp.text("DUMMY");

       // bin->bin
       var b=f.getBytes();
       tmp.setBytes(b);
       checkSame(f,tmp);
       tmp.text("DUMMY");


        if (f.isText()) {
            // plain->bin(lsfs) , bin->plain(natfs)
           b=f.getBytes();
           c=Content.bin(b,"text/plain");
           t=c.toPlainText();
           tmp.setText(t);
           checkSame(f,tmp);
           tmp.text("DUMMY");
        }




	   tmp.removeWithoutTrash();
    }
    function checkSame(a,b) {
       console.log("check same",a.name(),b.name(),a.text().length);
       assert(a.text()==b.text(),"text is not match: "+a+","+b);
       var a1=a.getBytes({binType:ArrayBuffer});
       var b1=b.getBytes({binType:ArrayBuffer});
       a1=new Uint8Array(a1);
       b1=new Uint8Array(b1);
       console.log("bin dump:",a1[0],a1[1],a1[2],a1[3]);
       assert(a1.length>0,"shoule be longer than 0");
       assert(a1.length==b1.length,"length is not match: "+a+","+b);
       for (var i=0;i<a1.length;i++) assert(a1[i]==b1[i],"failed at ["+i+"]");
    }
    //window.DataURL=Content.DataURL;
    function chkrom() {
        var p=JSON.parse(localStorage["/"]);
        if ("rom/" in p) {
            delete p["rom/"];
            localStorage["/"]=JSON.stringify(p);
            throw new Error("ROM!");
        }
    }
    function chkRecurAsync(dir,options,result) {
        var di=[];
        DU.timeout(100).then(function () {
            return dir.recursive(function (f) {
                di.push(f.relPath(dir));
                console.log("CHKRA",f.name());
                return DU.timeout(500);
            },options);
        }).then(function () {
            assert.eq(di.join(","), "start,"+result);
            console.log("checkRecurasync",di);
        }).fail(function (e) {
            console.error(e);
            alert(e);
        });
        di.push("start");
    }
    function chkRecur(dir,options,result) {
        var di=[];
        dir.recursive(function (f) {
            di.push(f.relPath(dir));
        },options);
        assert.eq(di.join(","), result);
        options.style="flat-relative";
        var t=dir.getDirTree(options);
        assert.eq( Object.keys(t).join(","), result);
    }
    function testContent() {
       var s="てすとabc";
       var C=Content;
       var c1=C.plainText(s);
       test(c1,[s]);

       function test(c,path) {
           var p=c.toPlainText();
           var u=c.toURL();
           var a=c.toArrayBuffer();
           var n=C.hasNodeBuffer() && c.toNodeBuffer();
           console.log(path,"->",p,u,a,n);
           var c1=C.plainText(p);
           var c2=C.url(u);
           var c3=C.bin(a,"text/plain");
           var c4=n && C.bin(n,"text/plain");
           if (path.length<2) {
               test(c1, path.concat([p]));
               test(c2, path.concat([u]));
               test(c3, path.concat([a]));
               if (n) test(c4, path.concat([n]));
           }
        }
    }
}catch(e) {
    console.log(e.stack);
    alert(e);
}
});
