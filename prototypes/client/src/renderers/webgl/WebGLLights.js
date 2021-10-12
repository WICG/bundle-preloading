import{Color}from'../../math/Color.js';import{Vector3}from'../../math/Vector3.js';import{Vector2}from'../../math/Vector2.js';function WebGLLights(){var a={};return{get:function(b){if(void 0!==a[b.id])return a[b.id];var c;switch(b.type){case'DirectionalLight':c={direction:new Vector3,color:new Color,shadow:!1,shadowBias:0,shadowRadius:1,shadowMapSize:new Vector2};break;case'SpotLight':c={position:new Vector3,direction:new Vector3,color:new Color,distance:0,coneCos:0,penumbraCos:0,decay:0,shadow:!1,shadowBias:0,shadowRadius:1,shadowMapSize:new Vector2};break;case'PointLight':c={position:new Vector3,color:new Color,distance:0,decay:0,shadow:!1,shadowBias:0,shadowRadius:1,shadowMapSize:new Vector2};break;case'HemisphereLight':c={direction:new Vector3,skyColor:new Color,groundColor:new Color};break;case'RectAreaLight':c={color:new Color,position:new Vector3,halfWidth:new Vector3,halfHeight:new Vector3};}return a[b.id]=c,c}}}export{WebGLLights};