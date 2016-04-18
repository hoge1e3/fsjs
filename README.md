# fsjs
File System for Browser JS / nw.js

## Quick start

download www/gen/FS.js and require.js

### Run in browser

  <script src="path/to/require.js"></script>
  <script src="path/to/FS.js"></script>
  <script>
  var myfile=FS.get("/mydir/myfile.txt");  // File in localStorage
  myfile.text("my content"); // write file
  alert(myfile.text()); // read file
  </script>
