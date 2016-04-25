//-----------
	var resMod;
	requirejs(["FS"], function (r) {
	  resMod=r;
	});
	if (useGlobal) global.FS=resMod;
	return resMod;
});
})(window);