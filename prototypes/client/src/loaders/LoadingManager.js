function LoadingManager(a,b,c){var d=this,e=!1,f=0,g=0;this.onStart=void 0,this.onLoad=a,this.onProgress=b,this.onError=c,this.itemStart=function(a){g++,!1==e&&d.onStart!==void 0&&d.onStart(a,f,g),e=!0},this.itemEnd=function(a){f++,d.onProgress!==void 0&&d.onProgress(a,f,g),f==g&&(e=!1,d.onLoad!==void 0&&d.onLoad())},this.itemError=function(a){d.onError!==void 0&&d.onError(a)}}var DefaultLoadingManager=new LoadingManager;export{DefaultLoadingManager,LoadingManager};