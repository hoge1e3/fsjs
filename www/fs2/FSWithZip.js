define(["FS","jszip"], function (FS,jszip) {
    FS.zip.setJSZip(jszip);
    return FS;
});
