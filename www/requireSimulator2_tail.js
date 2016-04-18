//-----------
	var resMod;
	requirejs(["FS"], function (r) {
	  resMod=r;
	});
	if (typeof useGlobal!="undefined" && useGlobal) window.FS=resMod;
	return resMod;
});
