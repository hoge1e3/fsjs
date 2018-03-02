define(["FSNoZip","zip"], function (FS,zip) {
    FS.zip=zip;
    FS.DeferredUtil.external.Promise=zip.JSZip.external.Promise;
    return FS;
});
