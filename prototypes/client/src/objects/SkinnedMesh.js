import{Mesh}from'./Mesh.js';import{Vector4}from'../math/Vector4.js';import{Skeleton}from'./Skeleton.js';import{Bone}from'./Bone.js';import{Matrix4}from'../math/Matrix4.js';function SkinnedMesh(a,b){Mesh.call(this,a,b),this.type='SkinnedMesh',this.bindMode='attached',this.bindMatrix=new Matrix4,this.bindMatrixInverse=new Matrix4;var c=this.initBones(),d=new Skeleton(c);this.bind(d,this.matrixWorld),this.normalizeSkinWeights()}SkinnedMesh.prototype=Object.assign(Object.create(Mesh.prototype),{constructor:SkinnedMesh,isSkinnedMesh:!0,initBones:function(){var a,b,c,d,e=[];if(this.geometry&&void 0!==this.geometry.bones){for(c=0,d=this.geometry.bones.length;c<d;c++)b=this.geometry.bones[c],a=new Bone,e.push(a),a.name=b.name,a.position.fromArray(b.pos),a.quaternion.fromArray(b.rotq),void 0!==b.scl&&a.scale.fromArray(b.scl);for(c=0,d=this.geometry.bones.length;c<d;c++)b=this.geometry.bones[c],-1!==b.parent&&null!==b.parent&&void 0!==e[b.parent]?e[b.parent].add(e[c]):this.add(e[c])}return this.updateMatrixWorld(!0),e},bind:function(a,b){this.skeleton=a,b===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),b=this.matrixWorld),this.bindMatrix.copy(b),this.bindMatrixInverse.getInverse(b)},pose:function(){this.skeleton.pose()},normalizeSkinWeights:function(){var a,b;if(this.geometry&&this.geometry.isGeometry)for(b=0;b<this.geometry.skinWeights.length;b++){var c=this.geometry.skinWeights[b];a=1/c.lengthManhattan(),a===Infinity?c.set(1,0,0,0):c.multiplyScalar(a)}else if(this.geometry&&this.geometry.isBufferGeometry){var d=new Vector4,e=this.geometry.attributes.skinWeight;for(b=0;b<e.count;b++)d.x=e.getX(b),d.y=e.getY(b),d.z=e.getZ(b),d.w=e.getW(b),a=1/d.lengthManhattan(),a===Infinity?d.set(1,0,0,0):d.multiplyScalar(a),e.setXYZW(b,d.x,d.y,d.z,d.w)}},updateMatrixWorld:function(a){Mesh.prototype.updateMatrixWorld.call(this,a),'attached'===this.bindMode?this.bindMatrixInverse.getInverse(this.matrixWorld):'detached'===this.bindMode?this.bindMatrixInverse.getInverse(this.bindMatrix):console.warn('THREE.SkinnedMesh: Unrecognized bindMode: '+this.bindMode)},clone:function(){return new this.constructor(this.geometry,this.material).copy(this)}});export{SkinnedMesh};