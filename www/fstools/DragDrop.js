define(["DeferredUtil","SFile"],function (DU,SFile) {
    DragDrop={};
    DragDrop.readFile=function (file) {
        return DU.promise(function (succ) {
            var reader = new FileReader();
            reader.onload = function(e) {
                //var fileContent = reader.result;
                //console.log("SUCC",reader);
                succ(reader);
            };
            reader.readAsArrayBuffer(file);
        });
    };
    DragDrop.accept=function (dom, dst,options) {
        options=options||{};
        dom.on("dragover",over);
        dom.on("dragenter",enter);
        dom.on("dragleave",leave);
        dom.on("drop",dropAdd);
        if (!options.onCheckFile) {
            options.onCheckFile=function (f) {
                if (options.overwrite) {
                    return f;
                } else {
                    if (f.exists()) return false;
                    return f;
                }
            };
        }
        if (!options.onError) {
            options.onError=function (e) {
                console.error(e);
            };
        }
        function dropAdd(e) {
            dom.removeClass("dragging");
            var status={};
            var eo=e.originalEvent;
            e.stopPropagation();
            e.preventDefault();
            var files = Array.prototype.slice.call(eo.dataTransfer.files);
            var added=[],cnt=files.length;
            DU.each(files,function (file) {
                var itemName=file.name;
                var itemFile=dst.rel(itemName),actFile;
                return DU.resolve(
                    options.onCheckFile(itemFile,file)
                ).then(function (cr) {
                    if (cr===false) {
                        status[itemFile.path()]={
                            file:itemFile,
                            status:"cancelled"
                        };
                        return;                
                    }
                    if (SFile.is(cr)) actFile=cr;
                    else actFile=itemFile;
                    return DragDrop.readFile(file).then(function (reader) {
                        var fileContent=reader.result;
                        actFile.setBytes(fileContent);
                        status[itemFile.path()]={
                            file:itemFile,
                            status:"uploaded"
                        };
                        if (actFile.path()!==itemFile.path()) {
                            status[itemFile.path()].redirectedTo=actFile;
                        }
                    });
                });
            }).then(function () {
                if (options.onComplete) options.onComplete(status);
            }).fail(function (e) {
                //console.log(e);
                options.onError(e);
            });
            return false;
        }
        function over(e) {
            //console.log("over",e);
            e.stopPropagation();
            e.preventDefault();
        }
        function enter(e) {
            var eo=e.originalEvent;
            console.log("enter",eo.target.innerHTML,e);
            /*if (dom[0]===eo.relatedTarget) {
                dom.addClass("dragging");
            }*/
            //if (eo.target===dom[0]) {
                $(eo.target).addClass("dragging");
            //}
                //$(eo.target).addClass("dragging");
            //e.stopPropagation();
            //e.preventDefault();
        }
        function leave(e) {
            var eo=e.originalEvent;
            //dom.removeClass("dragging");
            console.log("leave",eo.target.innerHTML,e);
            /*if (dom[0]===eo.relatedTarget) {
                dom.removeClass("dragging");
            }*/
            //if (eo.target===dom[0]) {
                $(eo.target).removeClass("dragging");
            //}
            //$(eo.target).removeClass("dragging");
            //e.stopPropagation();
            //e.preventDefault();
        }
    };
    return DragDrop;
});