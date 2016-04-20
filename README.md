# fsjs
File System for Browser JS / nw.js

## Quick start
download www/gen/FS.js
(Using require.js is recommended)

### Run in browser
FS.get method returns a File Object which can access to localStorage

```
<script src="path/to/FS.js"></script>
<script>
  var mydir=FS.get("/mydir/");// Directory in localStorage
  var myfile=mydir.rel("myfile.txt");  // File in localStorage (/mydir/myfile.txt)
  myfile.text("my content"); // write file
  alert(myfile.text()); // read file
  mydir.each(function (f) { // ls mydir
     alert(f.name());
  });
</script>
```

### Run in nw.js
Almost same as running in Browser, but FS.get returns a File Object which can access to local files

```
var mydir=FS.get("/mydir/");// Directory in local file(Linux/Mac)
var mydir=FS.get("C:/mydir/");// Directory in local file(Windows)
```

##Quick Reference for File Object

File Object cab be get by calling `FS.get(path)`. `f` and `d` is a File Object which represents a file and directory respectively.
`fd` can be either file or directory.

* `f.text(str)`   write `str` to the file
* `f.text()`   returns file content of the file in string 
* `f.obj(o)` write object `o` in JSON to the file  
* `f.obj()` returns the file content as object. The content of the file should be written in JSON 
* `f.bytes(b)` write ArrayBuffer/Buffer(node) to the file  
* `f.bytes()` returns file content as ArrayBuffer(browser)/Buffer(node)
* `f.getBytes({binType:ArrayBuffer})` returns file content as ArrayBuffer(both in browser and node)
* `d.each(func)` iterates over the directory by passing each File Object to `func`
* `d.recursive(func)` iterates over all files in the directory and its subdirectory by passing each File Object to `func`
* `d.listFiles()` returns array of File Objects which represents all files in the directory
* `d.ls()` returns array of names of all files in the directory
* `d.rel(relPath)` returns new File Object specified by the relative path
* `d.relPath(base)` returns the relative path of the file from the `base` File Object.
* `fd.up()` returns new File Object which is parent of the file/directory.
* `fd.path()` returns the full path of the file/directory
* `fd.name()` returns the name of the file/directory
* `fd.ext()` returns the extention of the file/directory
* `fd.truncExt(e)` returns the name removing `e` (when `e` is ommited, equals to `fd.ext()` )
* `f.lastUpdate()` return the file's time stamp as the number corrensponding to the value of Date.getTime
* `f.rm()` removes the file
* `d.rm()` removes the directory if it is empty
* `d.rm({r:true})` removes the directory and all subfiles/subdirectories.
* `fd.exists()` checks whether the file/directory exists
* `fd.isDir()` checks whether the File Object is directory
* `f.copyFrom(src)` copies from src(File Object) to the file 
* `f.copyTo(dst)` copies the file to dst(File Object)
* `f.moveFrom(src)` moves from src(File Object) to the file 
* `f.moveTo(dst)` moves the file to dst(File Object)
* `d.mkdir()` creates the directory



