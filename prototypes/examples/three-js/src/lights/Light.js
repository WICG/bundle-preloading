import{Object3D}from'../core/Object3D.js';import{Color}from'../math/Color.js';function Light(a,b){Object3D.call(this),this.type='Light',this.color=new Color(a),this.intensity=b===void 0?1:b,this.receiveShadow=void 0}Light.prototype=Object.assign(Object.create(Object3D.prototype),{constructor:Light,isLight:!0,copy:function(a){return Object3D.prototype.copy.call(this,a),this.color.copy(a.color),this.intensity=a.intensity,this},toJSON:function(a){var b=Object3D.prototype.toJSON.call(this,a);return b.object.color=this.color.getHex(),b.object.intensity=this.intensity,void 0!==this.groundColor&&(b.object.groundColor=this.groundColor.getHex()),void 0!==this.distance&&(b.object.distance=this.distance),void 0!==this.angle&&(b.object.angle=this.angle),void 0!==this.decay&&(b.object.decay=this.decay),void 0!==this.penumbra&&(b.object.penumbra=this.penumbra),void 0!==this.shadow&&(b.object.shadow=this.shadow.toJSON()),b}});export{Light};