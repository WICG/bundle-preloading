import{WebGLUniforms}from'./WebGLUniforms.js';import{WebGLShader}from'./WebGLShader.js';import{ShaderChunk}from'../shaders/ShaderChunk.js';import{NoToneMapping,AddOperation,MixOperation,MultiplyOperation,EquirectangularRefractionMapping,CubeRefractionMapping,SphericalReflectionMapping,EquirectangularReflectionMapping,CubeUVRefractionMapping,CubeUVReflectionMapping,CubeReflectionMapping,PCFSoftShadowMap,PCFShadowMap,CineonToneMapping,Uncharted2ToneMapping,ReinhardToneMapping,LinearToneMapping,GammaEncoding,RGBDEncoding,RGBM16Encoding,RGBM7Encoding,RGBEEncoding,sRGBEncoding,LinearEncoding}from'../../constants.js';var programIdCount=0;function getEncodingComponents(a){switch(a){case LinearEncoding:return['Linear','( value )'];case sRGBEncoding:return['sRGB','( value )'];case RGBEEncoding:return['RGBE','( value )'];case RGBM7Encoding:return['RGBM','( value, 7.0 )'];case RGBM16Encoding:return['RGBM','( value, 16.0 )'];case RGBDEncoding:return['RGBD','( value, 256.0 )'];case GammaEncoding:return['Gamma','( value, float( GAMMA_FACTOR ) )'];default:throw new Error('unsupported encoding: '+a);}}function getTexelDecodingFunction(a,b){var c=getEncodingComponents(b);return'vec4 '+a+'( vec4 value ) { return '+c[0]+'ToLinear'+c[1]+'; }'}function getTexelEncodingFunction(a,b){var c=getEncodingComponents(b);return'vec4 '+a+'( vec4 value ) { return LinearTo'+c[0]+c[1]+'; }'}function getToneMappingFunction(a,b){var c;switch(b){case LinearToneMapping:c='Linear';break;case ReinhardToneMapping:c='Reinhard';break;case Uncharted2ToneMapping:c='Uncharted2';break;case CineonToneMapping:c='OptimizedCineon';break;default:throw new Error('unsupported toneMapping: '+b);}return'vec3 '+a+'( vec3 color ) { return '+c+'ToneMapping( color ); }'}function generateExtensions(a,b,c){a=a||{};var d=[a.derivatives||b.envMapCubeUV||b.bumpMap||b.normalMap||b.flatShading?'#extension GL_OES_standard_derivatives : enable':'',(a.fragDepth||b.logarithmicDepthBuffer)&&c.get('EXT_frag_depth')?'#extension GL_EXT_frag_depth : enable':'',a.drawBuffers&&c.get('WEBGL_draw_buffers')?'#extension GL_EXT_draw_buffers : require':'',(a.shaderTextureLOD||b.envMap)&&c.get('EXT_shader_texture_lod')?'#extension GL_EXT_shader_texture_lod : enable':''];return d.filter(filterEmptyLine).join('\n')}function generateDefines(a){var b=[];for(var c in a){var d=a[c];!1===d||b.push('#define '+c+' '+d)}return b.join('\n')}function fetchAttributeLocations(a,b){for(var c={},d=a.getProgramParameter(b,a.ACTIVE_ATTRIBUTES),e=0;e<d;e++){var f=a.getActiveAttrib(b,e),g=f.name;c[g]=a.getAttribLocation(b,g)}return c}function filterEmptyLine(a){return''!==a}function replaceLightNums(a,b){return a.replace(/NUM_DIR_LIGHTS/g,b.numDirLights).replace(/NUM_SPOT_LIGHTS/g,b.numSpotLights).replace(/NUM_RECT_AREA_LIGHTS/g,b.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,b.numPointLights).replace(/NUM_HEMI_LIGHTS/g,b.numHemiLights)}function parseIncludes(a){var b=/^[ \t]*#include +<([\w\d.]+)>/gm;return a.replace(b,function(a,b){var c=ShaderChunk[b];if(c===void 0)throw new Error('Can not resolve #include <'+b+'>');return parseIncludes(c)})}function unrollLoops(a){var b=/for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;return a.replace(b,function(a,b,c,d){for(var e='',f=parseInt(b);f<parseInt(c);f++)e+=d.replace(/\[ i \]/g,'[ '+f+' ]');return e})}function WebGLProgram(a,b,c,d){var e=a.context,f=c.extensions,g=c.defines,h=c.__webglShader.vertexShader,i=c.__webglShader.fragmentShader,j='SHADOWMAP_TYPE_BASIC';d.shadowMapType===PCFShadowMap?j='SHADOWMAP_TYPE_PCF':d.shadowMapType===PCFSoftShadowMap&&(j='SHADOWMAP_TYPE_PCF_SOFT');var k='ENVMAP_TYPE_CUBE',l='ENVMAP_MODE_REFLECTION',m='ENVMAP_BLENDING_MULTIPLY';if(d.envMap){switch(c.envMap.mapping){case CubeReflectionMapping:case CubeRefractionMapping:k='ENVMAP_TYPE_CUBE';break;case CubeUVReflectionMapping:case CubeUVRefractionMapping:k='ENVMAP_TYPE_CUBE_UV';break;case EquirectangularReflectionMapping:case EquirectangularRefractionMapping:k='ENVMAP_TYPE_EQUIREC';break;case SphericalReflectionMapping:k='ENVMAP_TYPE_SPHERE';}switch(c.envMap.mapping){case CubeRefractionMapping:case EquirectangularRefractionMapping:l='ENVMAP_MODE_REFRACTION';}switch(c.combine){case MultiplyOperation:m='ENVMAP_BLENDING_MULTIPLY';break;case MixOperation:m='ENVMAP_BLENDING_MIX';break;case AddOperation:m='ENVMAP_BLENDING_ADD';}}var n,o,p=0<a.gammaFactor?a.gammaFactor:1,q=generateExtensions(f,d,a.extensions),r=generateDefines(g),s=e.createProgram();c.isRawShaderMaterial?(n=[r,'\n'].filter(filterEmptyLine).join('\n'),o=[q,r,'\n'].filter(filterEmptyLine).join('\n')):(n=['precision '+d.precision+' float;','precision '+d.precision+' int;','#define SHADER_NAME '+c.__webglShader.name,r,d.supportsVertexTextures?'#define VERTEX_TEXTURES':'','#define GAMMA_FACTOR '+p,'#define MAX_BONES '+d.maxBones,d.useFog&&d.fog?'#define USE_FOG':'',d.useFog&&d.fogExp?'#define FOG_EXP2':'',d.map?'#define USE_MAP':'',d.envMap?'#define USE_ENVMAP':'',d.envMap?'#define '+l:'',d.lightMap?'#define USE_LIGHTMAP':'',d.aoMap?'#define USE_AOMAP':'',d.emissiveMap?'#define USE_EMISSIVEMAP':'',d.bumpMap?'#define USE_BUMPMAP':'',d.normalMap?'#define USE_NORMALMAP':'',d.displacementMap&&d.supportsVertexTextures?'#define USE_DISPLACEMENTMAP':'',d.specularMap?'#define USE_SPECULARMAP':'',d.roughnessMap?'#define USE_ROUGHNESSMAP':'',d.metalnessMap?'#define USE_METALNESSMAP':'',d.alphaMap?'#define USE_ALPHAMAP':'',d.vertexColors?'#define USE_COLOR':'',d.flatShading?'#define FLAT_SHADED':'',d.skinning?'#define USE_SKINNING':'',d.useVertexTexture?'#define BONE_TEXTURE':'',d.morphTargets?'#define USE_MORPHTARGETS':'',d.morphNormals&&!1===d.flatShading?'#define USE_MORPHNORMALS':'',d.doubleSided?'#define DOUBLE_SIDED':'',d.flipSided?'#define FLIP_SIDED':'','#define NUM_CLIPPING_PLANES '+d.numClippingPlanes,d.shadowMapEnabled?'#define USE_SHADOWMAP':'',d.shadowMapEnabled?'#define '+j:'',d.sizeAttenuation?'#define USE_SIZEATTENUATION':'',d.logarithmicDepthBuffer?'#define USE_LOGDEPTHBUF':'',d.logarithmicDepthBuffer&&a.extensions.get('EXT_frag_depth')?'#define USE_LOGDEPTHBUF_EXT':'','uniform mat4 modelMatrix;','uniform mat4 modelViewMatrix;','uniform mat4 projectionMatrix;','uniform mat4 viewMatrix;','uniform mat3 normalMatrix;','uniform vec3 cameraPosition;','attribute vec3 position;','attribute vec3 normal;','attribute vec2 uv;','#ifdef USE_COLOR','\tattribute vec3 color;','#endif','#ifdef USE_MORPHTARGETS','\tattribute vec3 morphTarget0;','\tattribute vec3 morphTarget1;','\tattribute vec3 morphTarget2;','\tattribute vec3 morphTarget3;','\t#ifdef USE_MORPHNORMALS','\t\tattribute vec3 morphNormal0;','\t\tattribute vec3 morphNormal1;','\t\tattribute vec3 morphNormal2;','\t\tattribute vec3 morphNormal3;','\t#else','\t\tattribute vec3 morphTarget4;','\t\tattribute vec3 morphTarget5;','\t\tattribute vec3 morphTarget6;','\t\tattribute vec3 morphTarget7;','\t#endif','#endif','#ifdef USE_SKINNING','\tattribute vec4 skinIndex;','\tattribute vec4 skinWeight;','#endif','\n'].filter(filterEmptyLine).join('\n'),o=[q,'precision '+d.precision+' float;','precision '+d.precision+' int;','#define SHADER_NAME '+c.__webglShader.name,r,d.alphaTest?'#define ALPHATEST '+d.alphaTest:'','#define GAMMA_FACTOR '+p,d.useFog&&d.fog?'#define USE_FOG':'',d.useFog&&d.fogExp?'#define FOG_EXP2':'',d.map?'#define USE_MAP':'',d.envMap?'#define USE_ENVMAP':'',d.envMap?'#define '+k:'',d.envMap?'#define '+l:'',d.envMap?'#define '+m:'',d.lightMap?'#define USE_LIGHTMAP':'',d.aoMap?'#define USE_AOMAP':'',d.emissiveMap?'#define USE_EMISSIVEMAP':'',d.bumpMap?'#define USE_BUMPMAP':'',d.normalMap?'#define USE_NORMALMAP':'',d.specularMap?'#define USE_SPECULARMAP':'',d.roughnessMap?'#define USE_ROUGHNESSMAP':'',d.metalnessMap?'#define USE_METALNESSMAP':'',d.alphaMap?'#define USE_ALPHAMAP':'',d.vertexColors?'#define USE_COLOR':'',d.gradientMap?'#define USE_GRADIENTMAP':'',d.flatShading?'#define FLAT_SHADED':'',d.doubleSided?'#define DOUBLE_SIDED':'',d.flipSided?'#define FLIP_SIDED':'','#define NUM_CLIPPING_PLANES '+d.numClippingPlanes,'#define UNION_CLIPPING_PLANES '+(d.numClippingPlanes-d.numClipIntersection),d.shadowMapEnabled?'#define USE_SHADOWMAP':'',d.shadowMapEnabled?'#define '+j:'',d.premultipliedAlpha?'#define PREMULTIPLIED_ALPHA':'',d.physicallyCorrectLights?'#define PHYSICALLY_CORRECT_LIGHTS':'',d.logarithmicDepthBuffer?'#define USE_LOGDEPTHBUF':'',d.logarithmicDepthBuffer&&a.extensions.get('EXT_frag_depth')?'#define USE_LOGDEPTHBUF_EXT':'',d.envMap&&a.extensions.get('EXT_shader_texture_lod')?'#define TEXTURE_LOD_EXT':'','uniform mat4 viewMatrix;','uniform vec3 cameraPosition;',d.toneMapping===NoToneMapping?'':'#define TONE_MAPPING',d.toneMapping===NoToneMapping?'':ShaderChunk.tonemapping_pars_fragment,d.toneMapping===NoToneMapping?'':getToneMappingFunction('toneMapping',d.toneMapping),d.dithering?'#define DITHERING':'',d.outputEncoding||d.mapEncoding||d.envMapEncoding||d.emissiveMapEncoding?ShaderChunk.encodings_pars_fragment:'',d.mapEncoding?getTexelDecodingFunction('mapTexelToLinear',d.mapEncoding):'',d.envMapEncoding?getTexelDecodingFunction('envMapTexelToLinear',d.envMapEncoding):'',d.emissiveMapEncoding?getTexelDecodingFunction('emissiveMapTexelToLinear',d.emissiveMapEncoding):'',d.outputEncoding?getTexelEncodingFunction('linearToOutputTexel',d.outputEncoding):'',d.depthPacking?'#define DEPTH_PACKING '+c.depthPacking:'','\n'].filter(filterEmptyLine).join('\n')),h=parseIncludes(h,d),h=replaceLightNums(h,d),i=parseIncludes(i,d),i=replaceLightNums(i,d),c.isShaderMaterial||(h=unrollLoops(h),i=unrollLoops(i));var t=n+h,u=o+i,v=WebGLShader(e,e.VERTEX_SHADER,t),w=WebGLShader(e,e.FRAGMENT_SHADER,u);e.attachShader(s,v),e.attachShader(s,w),void 0===c.index0AttributeName?!0===d.morphTargets&&e.bindAttribLocation(s,0,'position'):e.bindAttribLocation(s,0,c.index0AttributeName),e.linkProgram(s);var x=e.getProgramInfoLog(s),y=e.getShaderInfoLog(v),z=e.getShaderInfoLog(w),A=!0,B=!0;!1===e.getProgramParameter(s,e.LINK_STATUS)?(A=!1,console.error('THREE.WebGLProgram: shader error: ',e.getError(),'gl.VALIDATE_STATUS',e.getProgramParameter(s,e.VALIDATE_STATUS),'gl.getProgramInfoLog',x,y,z)):''===x?(''===y||''===z)&&(B=!1):console.warn('THREE.WebGLProgram: gl.getProgramInfoLog()',x),B&&(this.diagnostics={runnable:A,material:c,programLog:x,vertexShader:{log:y,prefix:n},fragmentShader:{log:z,prefix:o}}),e.deleteShader(v),e.deleteShader(w);var C;this.getUniforms=function(){return void 0==C&&(C=new WebGLUniforms(e,s,a)),C};var D;return this.getAttributes=function(){return void 0==D&&(D=fetchAttributeLocations(e,s)),D},this.destroy=function(){e.deleteProgram(s),this.program=void 0},Object.defineProperties(this,{uniforms:{get:function(){return console.warn('THREE.WebGLProgram: .uniforms is now .getUniforms().'),this.getUniforms()}},attributes:{get:function(){return console.warn('THREE.WebGLProgram: .attributes is now .getAttributes().'),this.getAttributes()}}}),this.id=programIdCount++,this.code=b,this.usedTimes=1,this.program=s,this.vertexShader=v,this.fragmentShader=w,this}export{WebGLProgram};