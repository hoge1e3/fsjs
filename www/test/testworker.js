define(function () {
    return {
        proc: function (console,FS,dir) {
            console.log("WORKER", dir, "["+(typeof process)+"]" );
            return FS.opendir(dir).then(function (r) {
                r.forEach(function (e) {
                    console.log("WORKER", e);
                });
            });
            /*
            var t=new Date().getTime();
            while(new Date().getTime()-t<500);*/
        }
    };
});
