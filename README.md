# fsjs
File System for Browser JS / nw.js

## Quick start
download www/gen/FS.js
(Using require.js is recommended)

### Run in browser
FS.get method returns File Object which allow accesses to localStorage

```
<script src="path/to/FS.js"></script>
<script>
  var mydir=FS.get("/mydir/");// Directory in localStorage
  var myfile=mydir.rel("myfile.txt");  // File in localStorage
  myfile.text("my content"); // write file
  alert(myfile.text()); // read file
  mydir.each(function (f) { // ls mydir
     alert(f.name());
  });
</script>
```

### Run in nw.js
Almost same as running in Browser, but FS.get returns File Object which allow accesses to local files

```
var mydir=FS.get("/mydir/");// Directory in local file(Linux/Mac)
var mydir=FS.get("C:/mydir/");// Directory in local file(Windows)
```


