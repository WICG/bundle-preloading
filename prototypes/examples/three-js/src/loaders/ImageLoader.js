import{Cache}from'./Cache.js';import{DefaultLoadingManager}from'./LoadingManager.js';function ImageLoader(a){this.manager=a===void 0?DefaultLoadingManager:a}Object.assign(ImageLoader.prototype,{load:function(a,b,c,d){void 0===a&&(a=''),void 0!==this.path&&(a=this.path+a);var e=this,f=Cache.get(a);if(void 0!==f)return e.manager.itemStart(a),setTimeout(function(){b&&b(f),e.manager.itemEnd(a)},0),f;var g=document.createElementNS('http://www.w3.org/1999/xhtml','img');return g.addEventListener('load',function(){Cache.add(a,this),b&&b(this),e.manager.itemEnd(a)},!1),g.addEventListener('error',function(b){d&&d(b),e.manager.itemEnd(a),e.manager.itemError(a)},!1),'data:'!==a.substr(0,5)&&void 0!==this.crossOrigin&&(g.crossOrigin=this.crossOrigin),e.manager.itemStart(a),g.src=a,g},setCrossOrigin:function(a){return this.crossOrigin=a,this},setPath:function(a){return this.path=a,this}});export{ImageLoader};