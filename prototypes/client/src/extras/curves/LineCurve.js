import{Curve}from'../core/Curve.js';function LineCurve(a,b){Curve.call(this),this.v1=a,this.v2=b}LineCurve.prototype=Object.create(Curve.prototype),LineCurve.prototype.constructor=LineCurve,LineCurve.prototype.isLineCurve=!0,LineCurve.prototype.getPoint=function(a){if(1===a)return this.v2.clone();var b=this.v2.clone().sub(this.v1);return b.multiplyScalar(a).add(this.v1),b},LineCurve.prototype.getPointAt=function(a){return this.getPoint(a)},LineCurve.prototype.getTangent=function(){var a=this.v2.clone().sub(this.v1);return a.normalize()};export{LineCurve};