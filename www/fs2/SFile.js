define(["extend","assert","PathUtil","Util","Content","FS2","FileSaver.min","DeferredUtil"],
function (extend,A,P,Util,Content,FS2,sv,DU) {

var SFile=function (rootFS, path) {
    A.is(path, P.Absolute);
    //A(fs && fs.getReturnTypes, fs);
    this._path=path;
    this.rootFS=rootFS;
    this.fs=rootFS.resolveFS(path);
    /*this.act={};// path/fs after follwed symlink
    this.act.path=this.fs.resolveLink(path);
    this.act.fs=rootFS.resolveFS(this.act.path);
    A.is(this.act, {fs:FS2, path:P.Absolute});*/
    if (this.isDir() && !P.isDir(path)) {
        this._path+=P.SEP;
    }
};
SFile.is=function (path) {
    return path && typeof (path.isSFile)=="function" && path.isSFile();
};
function getPath(f) {
    if (SFile.is(f)) {
        return f.path();
    } else {
        A.is(f,P.Absolute);
        return f;
    }
}
SFile.prototype={
    isSFile: function (){return true;},
    setPolicy: function (p) {
        if (this.policy) throw new Error("policy already set");
        this.policy=p;
        return this._clone();
    },
    getPolicy: function (p) {
        return this.policy;
    },
    _clone: function (){
        return this._resolve(this.path());
    },
    _resolve: function (path, options) {
        var res;
        options=options||{};
        if (SFile.is(path)) {
            res=path;
        } else {
            A.is(path,P.Absolute);
            var topdir;
            var policy=options.policy || this.policy;
            if (policy && (topdir=policy.topDir)) {
                if (topdir.path) topdir=topdir.path();
                if (!P.startsWith(path, topdir)) {
                    throw new Error(path+": cannot access. Restricted to "+topdir);
                }
            }
            res=new SFile(this.rootFS, path);
            res.policy=policy;
        }
        if (res.policy) {
            return Util.privatize(res);
        } else {
            return res;
        }
    },
    contains: function (file) {
        A(SFile.is(file),file+" shoud be a SFile object.");
        if (!this.isDir()) return false;
        return P.startsWith( file.path(), this.path());
    },
    path: function () {
        return this._path;
    },
    name: function () {
        return P.name(this.path());
    },
    truncExt: function (ext) {
        return P.truncExt(this.path(),ext);
    },
    ext: function () {
        return P.ext(this.path());
    },
    relPath: function (base) {
        // base should be SFile or Path from rootFS
        var bp=(base.path ?
                base.path() :
                base );
        return P.relPath(this.path(), A.is(bp,P.Absolute) );
    },
    up: function () {
        var pathR=this.path();
        var pa=P.up(pathR);
        if (pa==null) return null;
        return this._resolve(pa);
    },
    rel: function (relPath) {
        A.is(relPath, P.Relative);
        this.assertDir();
        var pathR=this.path();
        return this._resolve(P.rel(pathR, relPath));
    },
    sibling: function (n) {
        return this.up().rel(n);
    },
    startsWith: function (pre) {
        return P.startsWith(this.name(),pre);
    },
    endsWith: function (post) {
        return P.endsWith(this.name(),post);
    },
    equals:function (o) {
        return (o && typeof o.path=="function" && o.path()==this.path());
    },
    toString:function (){
        return this.path();
    },
    //Common
    touch: function () {
        return this.act.fs.touch(this.act.path);
    },
    isReadOnly: function () {
        return this.act.fs.isReadOnly(this.act.path);
    },
    isTrashed:function () {
        var m=this.metaInfo();
        if (!m) return false;
        return m.trashed;
    },
    metaInfo: function () {
        if (arguments.length==0) {
            return this.getMetaInfo.apply(this,arguments);
        } else {
            return this.setMetaInfo.apply(this,arguments);
        }
    },
    getMetaInfo: function (options) {
        return this.act.fs.getMetaInfo(this.act.path,options);
    },
    setMetaInfo: function (info, options) {
        return this.act.fs.setMetaInfo(this.act.path,info, options);
    },
    getDirTree: function (options) {
        return this.act.fs.getDirTree(this.act.path, options);
    },
    assertExists: function () {
        A(this.exists(),this.path()+" does not exist.");
    },
    lastUpdate:function () {
        this.assertExists();
        return this.metaInfo().lastUpdate;
    },
    exists: function (options) {
        var args=Array.prototype.slice.call(arguments);
        if (typeof args[0]==="function") {
            var f=args.shift();
            return DU.resolve(this.exists.apply(this,args)).then(f);
        }
        options=options||{};
        var p=this.fs.exists(this.path(),options);
        if (p || options.noFollowLink) {
            return p;
        } else {
            return this.act.fs.exists(this.act.path,{noFollowLink:true});
        }
    },
    rm: function (options) {
        //   ln /test/c /a/b/
        //   rm a/b/c/
        //   rm a/b/c/d
        var t=this;
        options=options||{};
        if (this.isLink()) {
            return DU.resolve(this.fs.rm(this.path(),options));
        }
        /*if (!this.exists({noFollowLink:true})) {
            return this.act.fs.rm(this.act.path, options);
        }*/
        var a;
        if (this.isDir() && (options.recursive||options.r)) {
            a=this.each(function (f) {
                return f.rm(options);
            });
        } else {
            a=DU.resolve();
        }
        return a.then(function () {
            return t.act.fs.rm(t.act.path, options);
        });
        //var pathT=this.path();
        //this.fs.rm(pathT, options);
    },
    removeWithoutTrash: function (options) {
        options=options||{};
        options.noTrash=true;
        this.rm(options);
    },
    isDir: function () {
        return this.act.fs.isDir(this.act.path);
    },
    // File
    text:function (f) {
    	if (typeof f==="function") {
			return this.getText(f);
		}
        if (arguments.length>0) {
            return this.setText(arguments[0]);
        } else {
            return this.getText();
        }
    },
    setText:function (t) {
        A.is(t,String);
        if (this.isDir()) {
            throw new Error("Cannot write to directory: "+this.path());
        }
        var ct=this.contentType({def:null});
        //if (this.isText()) {
        if (ct!==null && !ct.match(/^text/) && Content.looksLikeDataURL(t)) {
            // bad knowhow: if this is a binary file apparently, convert to URL
            return DU.throwNowIfRejected(this.setContent(Content.url(t)));
            return DU.resolve(this.act.fs.setContent(this.act.path, Content.url(t)));
        } else {
            // if use fs.setContentAsync, the error should be handled by .fail
            // setText should throw error immediately (Why? maybe old style of text("foo") did it so...)
            return DU.throwNowIfRejected(this.setContent(Content.plainText(t)));
            return DU.resolve(this.act.fs.setContent(this.act.path, Content.plainText(t)));
        }
    },
    appendText:function (t) {
        A.is(t,String);
        //if (this.isText()) {
        return this.act.fs.appendContent(this.act.path, Content.plainText(t));
        /*} else {
            throw new Error("append only for text file");
        }*/
    },
    getContent: function (f) {
        if (typeof f=="function") {
            return this.act.fs.getContentAsync(this.act.path).then(f);
        }
        return this.act.fs.getContent(this.act.path);
    },
    setContent: function (c) {
        if (this.isDir()) {
            throw new Error("Cannot write to directory: "+this.path());
        }
        return this.act.fs.setContentAsync(this.act.path,c);
    },

    getText:function (f) {
    	if (typeof f==="function") {
    		var t=this;
    	    return this.getContent(forceText).then(f);
    	}
        return forceText(this.act.fs.getContent(this.act.path));
        /*if (this.isText()) {
            return this.act.fs.getContent(this.act.path).toPlainText();
        } else {
            return this.act.fs.getContent(this.act.path).toURL();
        }*/
        function forceText(c) {
	    	//if (t.isText()) {
            try {
                return c.toPlainText();
            } catch(e) {
    	    	return c.toURL();
    	    }
        }
    },
    getDataURL: function (f) {
        if (typeof f==="function") {
            return this.getContent(function (c) {
                return c.toURL();
            });
        }
        return this.getContent().toURL();
    },
    setDataURL: function (u) {
        return this.setContent(Content.url(u));
    },
    dataURL:function (d) {
        if (typeof d==="string") return this.setDataURL(d);
        if (typeof d==="function") return this.getDataURL(d);
        return this.getDataURL();
    },
    isText: function () {
        return this.act.fs.isText(this.act.path);
    },
    contentType: function (options) {
        return this.act.fs.getContentType(this.act.path,options);
    },
    bytes: function (b) {
        if (Content.isBuffer(b)) return this.setBytes(b);
        return this.getBytes();
    },
    setBytes:function (b) {
        return this.act.fs.setContent(this.act.path, Content.bin(b,this.contentType()));
    },
    getBytes:function (options) {
        options=options||{};
        return this.act.fs.getContent(this.act.path).toBin(options.binType);
    },
    getURL: function () {
        return this.act.fs.getURL(this.act.path);
    },
    lines:function () {
        return this.text().replace(/\r/g,"").split("\n");
    },
    obj: function () {
        var file=this;
        if (arguments.length==0) {
            var t=file.text();
            if (!t) return null;
            return JSON.parse(t);
        } else {
            file.text(JSON.stringify(A.is(arguments[0],Object) ));
        }
    },
    copyFrom: function (src, options) {
        return src.copyTo(this,options);
    },
    copyTo: function (dst, options) {
        A(dst && dst.isSFile(),dst+" is not a file");
        var src=this;
        var options=options||{};
        var srcIsDir=src.isDir();
        var dstIsDir=dst.isDir();
        if (!srcIsDir && dstIsDir) {
            dst=dst.rel(src.name());
            A(!dst.isDir(), dst+" is a directory.");
            dstIsDir=false;
        }
        if (srcIsDir && !dstIsDir) {
           this.err("Cannot move dir "+src.path()+" to file "+dst.path());
        } else if (!srcIsDir && !dstIsDir) {
            if (options.echo) options.echo(src+" -> "+dst);
            var res=this.act.fs.cp(this.act.path, dst.getResolvedLinkPath(),options);
            res=DU.resolve(res);
            if (options.a) {
                return res.then(function () {
                    return dst.setMetaInfo(src.getMetaInfo());
                });
            }
            return res;
        } else {
            A(srcIsDir && dstIsDir,"Both src and dst should be dir");
            return src.each(function (s) {
                return dst.rel(s.name()).copyFrom(s, options);
            });
        }
        //file.text(src.text());
        //if (options.a) file.metaInfo(src.metaInfo());
    },
    moveFrom: function (src, options) {
        var t=this;
        return t.exists(function (ex) {
            return t.copyFrom(src,options).then(function () {
                return src.rm({recursive:true});
            },function (e) {
                // rollback
                if (!ex) return t.exists(function (ex) {
                    if (ex) return t.rm({recursive:true});
                }).then(function () {throw e;});
                throw e;
            });
        });
    },
    moveTo: function (dst, options) {
        return dst.moveFrom(this,options);
    },
    // Dir
    assertDir:function () {
        A.is(this.path(),P.Dir);
        return this;
    },
    /*files:function (f,options) {
        var dir=this.assertDir();
        var res=[];
        this.each(function (f) {
            res.add(f);
        },options);
        return res;
    },*/
    each:function (f,options) {
        var dir=this.assertDir();
        return dir.listFilesAsync(options).then(function (ls) {
            return DU.each(ls,f);// ls.forEach(f)
        });
    },
    eachrev:function (f,options) {
        var dir=this.assertDir();
        return dir.listFilesAsync(options).then(function (ls) {
            return DU.each(ls.reverse(),f);// ls.forEach(f)
        });
    },
    recursive:function (fun,options) {
        var dir=this.assertDir();
        return dir.each(function (f) {
            if (f.isDir()) return f.recursive(fun);
            else return fun(f);
        },options);
    },
    listFilesAsync:function (options) {
        A(options==null || typeof options=="object");
        var dir=this.assertDir();
        var path=this.path();
        var ord;
        options=dir.convertOptions(options);
        if (!ord) ord=options.order;
        return this.act.fs.opendirAsync(this.act.path, options).
        then(function (di) {
            var res=[];
            for (var i=0;i<di.length; i++) {
                var name=di[i];
                //if (!options.includeTrashed && dinfo[i].trashed) continue;
                if (options.excludes[path+name] ) continue;
                res.push(dir.rel(name));
            }
            if (typeof ord=="function" && res.sort) res.sort(ord);
            return res;
        });
    },
    listFiles:function (options) {
        var args=Array.prototype.slice.call(arguments);
        return DU.assertResolved(this.listFilesAsync.apply(this,args));
        //----------ABOLISHED
        if (typeof args[0]==="function") {
            var f=args.shift();
            return this.listFilesAsync.apply(this,args).then(f);
        }
        A(options==null || typeof options=="object");
        var dir=this.assertDir();
        var path=this.path();
        var ord;
        if (typeof options=="function") ord=options;
        options=dir.convertOptions(options);
        if (!ord) ord=options.order;
        var di=this.act.fs.opendir(this.act.path, options);
        var res=[];
        for (var i=0;i<di.length; i++) {
            var name=di[i];
            //if (!options.includeTrashed && dinfo[i].trashed) continue;
            if (options.excludes[path+name] ) continue;
            res.push(dir.rel(name));
        }
        if (typeof ord=="function" && res.sort) res.sort(ord);
        return res;
    },
    ls:function (options) {
        A(options==null || typeof options=="object");
        var dir=this.assertDir();
        if (!options) {
            return this.act.fs.opendir(this.act.path, options);
        }
        var res=dir.listFiles(options);
        return res.map(function (f) {
            return f.name();
        });
    },
    convertOptions:function(o) {
        var options=Util.extend({},o);
        var dir=this.assertDir();
        var pathR=this.path();
        if (!options.excludes) options.excludes={};
        if (options.excludes instanceof Array) {
            var excludes={};
            options.excludes.forEach(function (e) {
                if (P.startsWith(e,"/")) {
                    excludes[e]=1;
                } else {
                    excludes[pathR+e]=1;
                }
            });
            options.excludes=excludes;
        }
        return A.is(options,{excludes:{}});
    },
    mkdir: function () {
        return this.touch();
    },
    link: function (to,options) {// % ln to path
        if (this.exists()) throw new Error(this.path()+": exists.");
        return this.act.fs.link(this.act.path,to.path(),options);
    },
    resolveLink:function () {
        return this._resolve(this.act.path);
    },
    isLink: function () {
        return this.fs.isLink(this.path());
    },
    getResolvedLinkPath: function () {
        return this.act.path;
    },
    getFS:function () {
        return this.act.fs;
    },
    observe: function (h) {
        return this.getFS().getRootFS().addObserver(this.path(),h);
    },
    getBlob: function () {
        return new Blob([this.bytes()],{type:this.contentType()});
    },
    download: function () {
        if (this.isDir()) throw new Error(this+": Download dir is not support yet. Use 'zip' instead.");
        saveAs(this.getBlob(),this.name());;
    },
    err: function () {
        var a=Array.prototype.slice.call(arguments);
        console.log.apply(console,a);
        throw new Error(a.join(""));
    }
};
Object.defineProperty(SFile.prototype,"act",{
    get: function () {
        if (this._act) return this._act;
        this._act={};// path/fs after follwed symlink
        this._act.path=this.fs.resolveLink(this._path);
        this._act.fs=this.rootFS.resolveFS(this._act.path);
        A.is(this._act, {fs:FS2, path:P.Absolute});
        return this._act;
    }
});

return SFile;
});
