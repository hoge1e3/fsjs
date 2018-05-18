importScripts(
    "lib/promise.js", // Uncomment for IE10/11
    "lib/require.js","lib/reqConf.js"
);
requirejs.config(reqConf);
requirejs(["workerProxy"], function(proxy) {
    onmessage = proxy.onmessage;
    proxy.init();
});
