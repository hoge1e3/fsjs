define(["Klass","DeferredUtil"], function (Klass,DU) {
	if (typeof importScripts!=="undefined") {
		// worker side
		WorkerRevProxy = Klass.define({
			$: function (fragment) {
				/*fragment::{
					isRevProxyFragment:true,
					proxyID:this.id,
					methodNames: this.methodNames
				}*/
				this.fragment=fragment;
				var methodNames=fragment.methodNames;
				var queue={};
				var t=this;
				methodNames.forEach(function (k) {
					t[k]=(function () {
						var a=Array.prototype.slice.call(arguments);
						return DU.promise(function (succ,fail) {
							var id=Math.random()+"";
							self.postMessage({
								isRequestToRevProxy:true,
								proxyID:fragment.proxyID,
								id:id,
								method: k,
								arguments: a.map(function (v) {
									if (v instanceof WorkerRevProxy) {
										return v.fragment;
									}
									return v;
								})
							});
							queue[id]=function (type,result) {
								if (type=="succ") succ(result);
								if (type=="fail") fail(result);
							};
						});
					});
				});
				self.addEventListener("message",function (e) {
					if (e.data.isResponseFromRevProxy) {
						/*
						{
							isResponseFromRevProxy:true,
							id: e.data.id,
							type: "succ"||"fail",
							result: res
						}
						*/
						queue[e.data.id](e.data.type,e.data.result);
						delete queue[e.data.id];
					}
				});
			}
		});
	} else {
		//browser side
		WorkerRevProxy = Klass.define({
			$: function (target,context) {//context is optional, it will be task id or somewhat
				var proxyID=this.id=Math.random()+"";
				WorkerRevProxy.manager.instances[this.id]=this;
				this.methodNames=[];
				this.context=context;
				var methodDefs=this.methodDefs={};
				for (var k in target) {
					var v=target[k];
					this.methodNames.push(k);
					this.methodDefs[k]=v;
				}
			},
			processMessage: function (worker,e) {
				/*e.data::{
					isRequestToRevProxy:true,
					proxyID:fragment.id,
					id:id,
					method: k,
					arguments: arguments
				}*/
				var proxy=this;
				var methodDefs=proxy.methodDefs;
				var target=proxy.target;
				DU.resolve().then(function (){
					return methodDefs[e.data.method].apply(
						target,
						e.data.arguments.map(function (a) {
							return proxy.unwrap(a);
						})
					);
				}).then(function (res) {
					res=proxy.wrap(res);
					worker.postMessage({
						isResponseFromRevProxy:true,
						id: e.data.id,
						type: "succ",
						result: res
					});
				},function (e) {
					worker.postMessage({
						isResponseFromRevProxy:true,
						id: e.data.id,
						type: "fail",
						result: e
					});
				});
			},
			wrap: function (o) {
				if (o && o.requestWrap) {
					o=new WorkerRevProxy(o,this.context);
				}
				if (o instanceof WorkerRevProxy) {
					return o.fragment();
				}
				return o;
			},
			unwrap: function (o) {
				if (o.isRevProxyFragment) {
					return WorkerRevProxy.manager.instances[o.proxyID]
				}
				return o;
			},
			fragment: function () {
				return {
					isRevProxyFragment:true,
					proxyID:this.id,
					methodNames: this.methodNames,
					context: this.context
				};
			},
			dispose: function () {
				delete WorkerRevProxy.manager.instances[this.id];
			}
		});
		WorkerRevProxy.manager={
			instances: {},
			initWorkerEvent: function (worker){
				worker.addEventListener("message",function (e) {
					/*e.data::{
						isRequestToRevProxy:true,
						proxyID:fragment.id,
						id:id,
						method: k,
						arguments: arguments
					}*/
					if (!e.data.isRequestToRevProxy) return;
					var proxy=WorkerRevProxy.manager.instances[e.data.proxyID];
					proxy.processMessage(worker,e);
				});
			}
		};
	}
	return WorkerRevProxy;
});
