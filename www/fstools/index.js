define(["ShellUI","wget","LocalBrowser","FileBrowser"],function(shui/*,wget,lcb,fb*/){
    window.onerror=function (a,b,c,d,e) {
        if (e) shui.sh.err(e.stack);
    };
    //shui.show();
    return shui;
});
