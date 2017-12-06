importScripts(
    // "https://rawgit.com/stefanpenner/es6-promise/master/dist/es6-promise.auto.js", // Uncomment for IE10
    "lib/require.js","lib/reqConf.js"
);
requirejs.config(reqConf);
requirejs(["workerProxy"], function(proxy) {
    onmessage = proxy.onmessage;
    proxy.init();
});
