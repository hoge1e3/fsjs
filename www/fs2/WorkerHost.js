define([], function () {
	WorkerHost=Klass({
		$: function (worker) {
			var t=this;
			worker.addEventListener('message', function(e) {
				t[e.data.action].apply(t,e.data.args);
				
			}, false);
		},
	});
	{
		read:function (path) {

		},
		write:function (path, content) {

		},
		ls: function (path) {

		}
	};

});
