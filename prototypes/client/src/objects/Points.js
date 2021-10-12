import{Sphere}from'../math/Sphere.js';import{Ray}from'../math/Ray.js';import{Matrix4}from'../math/Matrix4.js';import{Object3D}from'../core/Object3D.js';import{Vector3}from'../math/Vector3.js';import{PointsMaterial}from'../materials/PointsMaterial.js';import{BufferGeometry}from'../core/BufferGeometry.js';function Points(a,b){Object3D.call(this),this.type='Points',this.geometry=a===void 0?new BufferGeometry:a,this.material=b===void 0?new PointsMaterial({color:16777215*Math.random()}):b}Points.prototype=Object.assign(Object.create(Object3D.prototype),{constructor:Points,isPoints:!0,raycast:function(){var b=new Matrix4,c=new Ray,d=new Sphere;return function(e,f){function g(a,b){var d=c.distanceSqToPoint(a);if(d<o){var g=c.closestPointToPoint(a);g.applyMatrix4(k);var i=e.ray.origin.distanceTo(g);if(i<e.near||i>e.far)return;f.push({distance:i,distanceToRay:Math.sqrt(d),point:g.clone(),index:b,face:null,object:h})}}var h=this,j=this.geometry,k=this.matrixWorld,m=e.params.Points.threshold;if(null===j.boundingSphere&&j.computeBoundingSphere(),d.copy(j.boundingSphere),d.applyMatrix4(k),d.radius+=m,!1!==e.ray.intersectsSphere(d)){b.getInverse(k),c.copy(e.ray).applyMatrix4(b);var n=m/((this.scale.x+this.scale.y+this.scale.z)/3),o=n*n,p=new Vector3;if(j.isBufferGeometry){var q=j.index,r=j.attributes,s=r.position.array;if(null!==q)for(var t,a=q.array,u=0,i=a.length;u<i;u++)t=a[u],p.fromArray(s,3*t),g(p,t);else for(var u=0,v=s.length/3;u<v;u++)p.fromArray(s,3*u),g(p,u)}else for(var l=j.vertices,u=0,v=l.length;u<v;u++)g(l[u],u)}}}(),clone:function(){return new this.constructor(this.geometry,this.material).copy(this)}});export{Points};