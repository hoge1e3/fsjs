onerror=function (a,b,c,d,e) {
    console.log(arguments);
    document.getElementById("helloWorld").innerText=(e.stack);
};

//try {
a.b.c.d=0;