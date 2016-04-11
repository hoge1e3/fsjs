requirejs(["LSFS","../test/ROM_k","assert","DataURL","PathUtil","SFile","SandBoxFile","NativeFS"],
function (LSFS, romk,assert,DataURL,P,SFile,SandBoxFile, NativeFS) {
    assert.is(arguments,
       [Function,LSFS,Function,Function,Object,Function,Object, Function]);
    var rootFS=window.rfs=new LSFS(localStorage);
    window.onerror=function (e) {
        alert(e);
        alert(e.stack)
        //console.log(e.stack);
        //if (e.preventDefault) e.preventDefault();
        return false;
    };

    window.PathUtil=P;
    window.romk=romk;
    rootFS.mount("/rom/",romk);
    rootFS.mount("/ram/",LSFS.ramDisk());
    rootFS.get("/var/").mkdir();
    assert.ensureError(function (){
        rootFS.mount("/var/",romk);
    });
    var cd=assert.is(rootFS.get("/"),SFile);
    var root=cd;
    // relpath:
    //  path= /a/b/c   base=/a/b/  res=c
    assert( root.rel("a/b/c").relPath("/a/b/")==="c");
    assert( root.rel("a/b/c").relPath(root.rel("a/b/"))==="c");
    //  path= /a/b/c/   base=/a/b/  res=c/
    assert( root.rel("a/b/c/").relPath("/a/b/")==="c/");
    //  path= /a/b/c/   base=/a/b/c/d  res= ../
    assert( root.rel("a/b/c/").relPath("/a/b/c/d")==="../");
    //  path= /a/b/c/   base=/a/b/e/f  res= ../../c/
    assert( root.rel("a/b/c/").relPath("/a/b/e/f")==="../../c/");
    var nfs;
    if (NativeFS.available)  {
        require('nw.gui').Window.get().showDevTools();
        var nfsp=P.rel(process.cwd().replace(/\\/g,"/"), "fs/");
        console.log(nfsp);
        rootFS.mount("/fs/",new NativeFS(nfsp));
        nfs=root.rel("fs/");
    }
    var r=cd.ls();
    var ABCD="abcd\nefg";
    var CDEF="defg\nてすと";
    assert(r.indexOf("rom/")>=0, r);
    var romd=root.rel("rom/");
    var ramd=root.rel("ram/");
    var testf=root.rel("testfn.txt");
    /*assert.ensureError(function () {
        root.rel("fuga.txt").text("hoge");
    });*/
    assert.eq(P.ext("test.txt"),".txt");
    if (nfs) assert(nfs.fs.isText("/test.txt"));

    var testd;
    if (!testf.exists()) {
        console.log("Test pass",1);
        testd=cd=cd.rel(/*Math.random()*/"testdir"+"/");
        console.log("Enter", cd);
        testd.mkdir();
        chkrom();
        assert(testd.exists({includeTrashed:true}));
        assert(testd.exists());
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
        var sf=SandBoxFile.create(testd._clone());
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
    console.log(rootFS.opendir("/var/"));
    console.log(rootFS.opendir("/rom/"));

    window.DataURL=DataURL;
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
    }
});