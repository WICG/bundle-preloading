import{BufferAttribute}from'./BufferAttribute.js';function InstancedBufferAttribute(a,b,c){BufferAttribute.call(this,a,b),this.meshPerAttribute=c||1}InstancedBufferAttribute.prototype=Object.assign(Object.create(BufferAttribute.prototype),{constructor:InstancedBufferAttribute,isInstancedBufferAttribute:!0,copy:function(a){return BufferAttribute.prototype.copy.call(this,a),this.meshPerAttribute=a.meshPerAttribute,this}});export{InstancedBufferAttribute};