import{Vector3}from'../math/Vector3.js';import{Audio}from'./Audio.js';import{Object3D}from'../core/Object3D.js';function PositionalAudio(a){Audio.call(this,a),this.panner=this.context.createPanner(),this.panner.connect(this.gain)}PositionalAudio.prototype=Object.assign(Object.create(Audio.prototype),{constructor:PositionalAudio,getOutput:function(){return this.panner},getRefDistance:function(){return this.panner.refDistance},setRefDistance:function(a){this.panner.refDistance=a},getRolloffFactor:function(){return this.panner.rolloffFactor},setRolloffFactor:function(a){this.panner.rolloffFactor=a},getDistanceModel:function(){return this.panner.distanceModel},setDistanceModel:function(a){this.panner.distanceModel=a},getMaxDistance:function(){return this.panner.maxDistance},setMaxDistance:function(a){this.panner.maxDistance=a},updateMatrixWorld:function(){var a=new Vector3;return function(b){Object3D.prototype.updateMatrixWorld.call(this,b),a.setFromMatrixPosition(this.matrixWorld),this.panner.setPosition(a.x,a.y,a.z)}}()});export{PositionalAudio};