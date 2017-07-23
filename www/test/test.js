requirejs(["WebFS","LSFS","../test/ROM_k","assert","PathUtil","SFile","NativeFS","RootFS","Content"],
function (WebFS,LSFS, romk,assert,P,SFile, NativeFS,RootFS,Content) {
try{
    
    assert.is(arguments,
       [Function,Function,LSFS,Function,Object,Function,Function,Function]);
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

        setTimeout(function () {location.reload();},10000);
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
       var c=f.getContent();
       tmp.setContent(c);
       checkSame(f,tmp);

       // plain->plain(.txt) / url(bin->URL)->url(URL->bin) (.bin)
       var t=f.text();
       tmp.text(t);
       checkSame(f,tmp);
       
       // bin->bin
       var b=f.getBytes();
       tmp.setBytes(b);
       checkSame(f,tmp);
       
        if (f.isText()) {
            // plain->bin(lsfs) , bin->plain(natfs)
           b=f.getBytes();
           c=Content.bin(b,"text/plain");
           t=c.toPlainText();
           tmp.setText(t);
           checkSame(f,tmp);
        }

       
	   tmp.removeWithoutTrash();         
    }
    function checkSame(a,b) {
       console.log("check same",a,b,a.text().length);
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