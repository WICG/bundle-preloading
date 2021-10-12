import{LineSegments}from'../objects/LineSegments.js';import{Matrix4}from'../math/Matrix4.js';import{VertexColors}from'../constants.js';import{LineBasicMaterial}from'../materials/LineBasicMaterial.js';import{Color}from'../math/Color.js';import{Vector3}from'../math/Vector3.js';import{BufferGeometry}from'../core/BufferGeometry.js';import{Float32BufferAttribute}from'../core/BufferAttribute.js';function SkeletonHelper(a){this.bones=this.getBoneList(a);for(var b,c=new BufferGeometry,d=[],e=[],f=new Color(0,0,1),g=new Color(0,1,0),h=0;h<this.bones.length;h++)b=this.bones[h],b.parent&&b.parent.isBone&&(d.push(0,0,0),d.push(0,0,0),e.push(f.r,f.g,f.b),e.push(g.r,g.g,g.b));c.addAttribute('position',new Float32BufferAttribute(d,3)),c.addAttribute('color',new Float32BufferAttribute(e,3));var i=new LineBasicMaterial({vertexColors:VertexColors,depthTest:!1,depthWrite:!1,transparent:!0});LineSegments.call(this,c,i),this.root=a,this.matrix=a.matrixWorld,this.matrixAutoUpdate=!1,this.update()}SkeletonHelper.prototype=Object.create(LineSegments.prototype),SkeletonHelper.prototype.constructor=SkeletonHelper,SkeletonHelper.prototype.getBoneList=function(a){var b=[];a&&a.isBone&&b.push(a);for(var c=0;c<a.children.length;c++)b.push.apply(b,this.getBoneList(a.children[c]));return b},SkeletonHelper.prototype.update=function(){var a=new Vector3,b=new Matrix4,c=new Matrix4;return function(){var d=this.geometry,e=d.getAttribute('position');c.getInverse(this.root.matrixWorld);for(var f,g=0,h=0;g<this.bones.length;g++)f=this.bones[g],f.parent&&f.parent.isBone&&(b.multiplyMatrices(c,f.matrixWorld),a.setFromMatrixPosition(b),e.setXYZ(h,a.x,a.y,a.z),b.multiplyMatrices(c,f.parent.matrixWorld),a.setFromMatrixPosition(b),e.setXYZ(h+1,a.x,a.y,a.z),h+=2);d.getAttribute('position').needsUpdate=!0}}();export{SkeletonHelper};