//-----------
	var resMod;
	requirejs(["ShellUI"], function (r) {
	  resMod=r;
	});
	if (typeof window!=="undefined" && window.shui===undefined) window.shui=resMod;
	if (typeof window!=="undefined" && window.sh===undefined) window.sh=resMod.sh;
	if (typeof module!=="undefined") module=resMod;
	return resMod;
});
//})(window);
