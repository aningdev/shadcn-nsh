import{_ as e,d as t,j as n,s as r,y as i}from"./utils.bd5102a3cc.js";import{a}from"./motion.c6535129ca.js";import{n as o}from"./button.5707444d31.js";import{J as s,K as c,d as l,f as u,q as d,u as f}from"./app.109d21475e.js";import{t as p}from"./switch.eb5d2b476c.js";import{a as m,c as h,i as g,t as _}from"./graphics-shared.01e82be544.js";import{append as v,bindProp as y,component as b,cond as x,each as S,element as C,insert as w,prop as T,spread as E,text as D}from"./facades/nsh-rt.3f8ba2bc28.js";import{Animated as O,Easing as k,cleanup as A,createAnimatedValue as j,signal as M,token as N}from"./facades/nsh.75d44d8778.js";var P={url:`asset:/assets/logo-dark.svg`,size:{width:128,height:128}};const F=`
fn hash(p: vec2f) -> f32 {
  let q = bitcast<vec2u>(vec2i(floor(p)));
  var h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 1664525u + 1013904223u;
  h = (h ^ (h >> 16u)) * 2246822519u;
  h = h ^ (h >> 13u);
  return f32(h >> 8u) / 16777216.0;
}
fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1.0, 0.0)), u.x),
             mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x), u.y);
}
fn fbm(p0: vec2f) -> f32 {
  var p = p0;
  var v = 0.0;
  var a = 0.5;
  for (var i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2f(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
`,I=`${F}
struct Uniforms { a: vec4f, b: vec4f, c: vec4f, base: vec4f, pointer: vec2f }
fn orb(p: vec2f, center: vec2f, size: f32) -> f32 {
  let d = p - center;
  return exp(-dot(d, d) / (size * size));
}
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let p = uv * aspect;
  let t = nsh.time * 0.35;
  var light = vec3f(0.0);
  light += uniforms.a.rgb * orb(p, vec2f(0.3 + 0.15 * sin(t * 0.8), 0.35 + 0.2 * cos(t * 0.6)) * aspect, 0.38) * 1.1;
  light += uniforms.b.rgb * orb(p, vec2f(0.65 + 0.2 * cos(t * 0.5), 0.55 + 0.25 * sin(t * 0.7 + 1.0)) * aspect, 0.45) * 1.2;
  light += uniforms.c.rgb * orb(p, vec2f(0.85 + 0.1 * sin(t * 0.9 + 2.0), 0.25 + 0.15 * cos(t * 0.4)) * aspect, 0.32);
  light += uniforms.b.rgb * orb(p, vec2f(0.15 + 0.1 * cos(t * 0.6 + 3.0), 0.85) * aspect, 0.3) * 0.6;
  light += uniforms.c.rgb * orb(p, uniforms.pointer * aspect, 0.25) * 0.9;
  var color = uniforms.base.rgb + (vec3f(1.0) - exp(-light * 1.4)) * 0.95;
  color += vec3f((hash(uv * nsh.size * nsh.scale) - 0.5) * 0.04);
  return vec4f(color, 1.0);
}`,L=`${F}
struct Uniforms { a: vec4f, b: vec4f, c: vec4f, base: vec4f, tilt: f32 }
fn glow(p: vec2f, center: vec2f, size: f32) -> f32 {
  let d = p - center;
  return exp(-dot(d, d) / (size * size));
}
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let p = uv * aspect;
  let px = 1.0 / max(nsh.size.y, 1.0);
  let t = nsh.time * 0.25;
  let shift = uniforms.tilt * 0.12;
  var light = vec3f(0.0);
  light += uniforms.a.rgb * glow(p, vec2f(0.82 + shift + 0.04 * sin(t), 0.2 + 0.06 * cos(t * 0.8)) * aspect, 0.34) * 0.9;
  light += uniforms.b.rgb * glow(p, vec2f(0.62 - shift * 0.5 + 0.05 * cos(t * 0.7), 0.85) * aspect, 0.42) * 0.8;
  light += uniforms.c.rgb * glow(p, vec2f(1.0 + 0.04 * sin(t * 0.6 + 1.0), 0.75) * aspect, 0.3) * 0.7;
  light *= smoothstep(0.0, 0.75, uv.x);
  var color = uniforms.base.rgb + (vec3f(1.0) - exp(-light * 1.3)) * 0.9;
  let cell = fract(p / (8.0 * px)) - 0.5;
  let dots = smoothstep(0.14, 0.06, length(cell));
  color += vec3f(1.0) * dots * (0.015 + 0.06 * length(light));
  let s = uv.x * 0.7 + uv.y * 0.3 - 0.55 - uniforms.tilt * 0.5;
  color += vec3f(exp(-s * s * 30.0) * 0.05);
  color += vec3f((hash(uv * nsh.size * nsh.scale + 7.0) - 0.5) * 0.03);
  return vec4f(color, 1.0);
}`,R=`
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let d = length((uv - 0.5) * aspect);
  let t = smoothstep(nsh.progress * 1.2 - 0.04, nsh.progress * 1.2, d);
  return mix(sample_to(uv), sample_from(uv), t);
}`;function z(e){let t=M({width:1,height:1}),n=n=>e(Math.min(Math.max(n.locationX/t().width,0),1),Math.min(Math.max(n.locationY/t().height,0),1));return{onLayout:({bounds:e})=>{t.set(e.size)},onStartShouldSetResponder:()=>!0,onResponderTerminationRequest:()=>!1,onResponderGrant:e=>(n(e),!0),onResponderMove:n}}function B(){let e=j(.5),n=j(.5),r=(t,r)=>{e.set(t),n.set(r)};return b(g,{title:`Glow`,subtitle:`Soft orbs of light that blend`,get children(){return(()=>{let i=C(`view`);T(i,`style`,{gap:12});let a=C(`shader`);return T(a,`source`,I),y(a,`uniforms`,()=>({a:t.destructive,b:t.success,c:t.info,base:t.media,pointer:[e,n]})),T(a,`style`,{height:200,borderRadius:14}),E(a,z(r)),v(i,a),w(i,b(_,{label:`Drag to lead a blue orb; the light rolls off as it adds up.`})),i})()}})}function V(){let e=j(.5),n=j(.5);return b(g,{title:`Plasma`,subtitle:`Sums of sines through a cosine palette`,get children(){return(()=>{let r=C(`view`);T(r,`style`,{gap:10});let i=C(`shader`);return T(i,`source`,`
struct Uniforms { pointer: vec2f, a: vec4f, b: vec4f, c: vec4f }
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let p = (uv - 0.5) * aspect * 4.0;
  let m = (uniforms.pointer - 0.5) * aspect * 4.0;
  let t = nsh.time * 0.5;
  var v = sin(p.x + t) + sin((p.y + t) * 0.7) + sin((p.x + p.y + t) * 0.6);
  v += sin(length(p - m) * 2.5 - t * 2.0) * 1.2;
  let wave = 0.5 + 0.5 * sin(6.2831853 * (v * 0.18 + vec3f(0.0, 0.33, 0.66)));
  let palette = mix(uniforms.a.rgb, uniforms.b.rgb, wave.x);
  let color = mix(palette, uniforms.c.rgb, wave.z * 0.5);
  let vignette = 1.0 - 0.5 * dot(uv - 0.5, uv - 0.5) * 2.0;
  return vec4f(color * vignette, 1.0);
}`),y(i,`uniforms`,()=>({pointer:[e,n],a:t.info,b:t.success,c:t.warning})),T(i,`style`,{height:200,borderRadius:14}),E(i,z((t,r)=>{e.set(t),n.set(r)})),v(r,i),w(r,b(_,{label:`Drag across it: the pointer is a second wave source.`})),r})()}})}function H(){let n=M(1),o=j(0),s={x:j(.5),y:j(.5)},c=O.loop(O.timing(o,{toValue:1,duration:2200,easing:k.out(k.quad)}));c.start(),A(()=>c.stop());let l=(e,t)=>{c.stop(),s.x.set(e),s.y.set(t),o.set(0),c.start()},u=M({width:1,height:1});return b(g,{title:`Code rain`,subtitle:`Animated values as uniforms`,get children(){return(()=>{let c=C(`view`);T(c,`style`,{gap:10});let d=C(`shader`);T(d,`source`,`
fn hash(p: vec2f) -> f32 {
  let q = bitcast<vec2u>(vec2i(floor(p)));
  var h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 1664525u + 1013904223u;
  h = (h ^ (h >> 16u)) * 2246822519u;
  h = h ^ (h >> 13u);
  return f32(h >> 8u) / 16777216.0;
}
struct Uniforms { center: vec2f, wave: f32, tintA: vec4f, tintB: vec4f, head: vec4f, ground: vec4f, speed: f32 }
fn shade(uv: vec2f) -> vec4f {
  let g = uv * nsh.size / vec2f(12.0, 16.0);
  let cell = floor(g);
  let t = nsh.time * uniforms.speed;
  let live = step(0.45, hash(vec2f(cell.x, 3.0)));
  let speed = 3.0 + hash(vec2f(cell.x, 1.0)) * 5.0;
  let head = t * speed + hash(vec2f(cell.x, 2.0)) * 60.0;
  let phase = fract((head - cell.y) / 40.0);
  let trail = pow(clamp(1.0 - phase * 2.5, 0.0, 1.0), 2.0) * live;
  let lead = step(phase, 0.025) * live;
  let tap = floor(uniforms.center * nsh.size / vec2f(12.0, 16.0));
  let d = length((cell - tap) * vec2f(1.0, 1.4));
  let front = uniforms.wave * 14.0;
  let fade = 1.0 - uniforms.wave;
  let ring = step(abs(d - front), 0.8) * fade;
  let inside = step(d, front - 0.8) * step(front - 4.0, d) * fade;
  let rate = 0.8 + hash(cell) * 1.2 + ring * 20.0;
  let id = hash(cell + vec2f(floor(t * rate) * 13.0, 0.0)) * 4096.0;
  let f = (fract(g) - vec2f(0.2, 0.15)) / vec2f(0.6, 0.7);
  let bit = floor(f * vec2f(3.0, 5.0));
  let column = min(bit.x, 2.0 - bit.x);
  let on = step(0.5, hash(vec2f(id + column * 7.0, bit.y * 31.0 + id)))
    * step(0.0, f.x) * step(f.x, 1.0) * step(0.0, f.y) * step(f.y, 1.0);
  let tint = mix(uniforms.tintA.rgb, uniforms.tintB.rgb, uniforms.wave);
  let level = max(trail, inside * 0.5) + ring * 1.2;
  var color = tint * on * level;
  color += uniforms.head.rgb * on * (lead + ring * 0.6);
  color += tint * ring * 0.18;
  color += uniforms.ground.rgb;
  return vec4f(color, 1.0);
}`),y(d,`uniforms`,()=>({center:[s.x,s.y],wave:o,tintA:t.success,tintB:t.brand,head:t.onMedia,ground:t.media,speed:n()})),T(d,`style`,{height:200,borderRadius:14,padding:16,justifyContent:`flex-end`}),T(d,`onLayout`,({bounds:e})=>{u.set(e.size)}),T(d,`onStartShouldSetResponder`,()=>!0),T(d,`onResponderGrant`,e=>l(e.locationX/u().width,e.locationY/u().height));let f=C(`view`);return y(f,`style`,()=>({flexDirection:`row`,alignItems:`center`,alignSelf:`flex-start`,paddingHorizontal:6,paddingVertical:4,borderRadius:2,borderWidth:1,borderColor:r(t.success,.5),backgroundColor:r(t.media,.85)})),T(f,`onStartShouldSetResponder`,()=>!0),T(f,`onResponderTerminationRequest`,()=>!1),w(f,S(()=>[1,2,4],r=>(()=>{let o=C(`view`);T(o,`onPress`,()=>n.set(r())),T(o,`role`,`button`),y(o,`accessibilityLabel`,()=>`${r()}×`),y(o,`accessibilityState`,()=>({selected:n()===r()})),T(o,`hoverStyle`,{opacity:.86}),y(o,`activeStyle`,()=>a().activeStyle),y(o,`focusVisibleStyle`,()=>e()),T(o,`style`,{paddingHorizontal:6,paddingVertical:2});let s=C(`text`);return y(s,`style`,()=>({color:n()===r()?t.onMedia:t.success,fontFamily:i.mono,fontSize:12,fontWeight:n()===r()?`700`:`400`,opacity:n()===r()?1:.7})),w(s,()=>`${r()}×`),v(o,s),o})())),v(d,f),v(c,d),w(c,b(_,{label:`Tap the rain to send a wave; pick how fast it falls.`})),c})()}})}function U(){let e=j(0),n=O.loop(O.sequence([O.timing(e,{toValue:1,duration:2600,easing:k.inOut(k.sin)}),O.timing(e,{toValue:-1,duration:2600,easing:k.inOut(k.sin)})]));n.start(),A(()=>n.stop());let i=()=>{n.stop(),e.set(-1),O.timing(e,{toValue:1,duration:1200,easing:k.inOut(k.cubic)}).start()};return b(g,{title:`Hero banner`,subtitle:`Children drawn over the shader`,get children(){return(()=>{let a=C(`view`);T(a,`style`,{gap:10});let s=C(`shader`);T(s,`source`,L),y(s,`uniforms`,()=>({a:t.brand,b:t.success,c:t.info,base:t.media,tilt:e})),T(s,`style`,{height:200,borderRadius:14,paddingHorizontal:20,paddingVertical:16,justifyContent:`space-between`}),E(s,z(t=>{n.stop(),e.set(t*2-1)}));let c=C(`view`);T(c,`style`,{flexDirection:`row`,alignItems:`center`,gap:10});let l=C(`image`);T(l,`src`,P),T(l,`style`,{width:26,height:26});let u=C(`text`);y(u,`style`,()=>({flex:1,color:t.onMedia,fontSize:15,fontWeight:`700`}));let d=D(`Native Shell`);v(u,d);let f=C(`view`);y(f,`style`,()=>({flexDirection:`row`,alignItems:`center`,gap:6,paddingHorizontal:9,paddingVertical:4,borderRadius:999,borderWidth:.5,borderColor:r(t.brand,.3),backgroundColor:r(t.brand,.1)}));let p=C(`view`);y(p,`style`,()=>({width:5,height:5,borderRadius:999,backgroundColor:t.brand,boxShadow:`0 0 6px ${r(t.brand,.8)}`}));let m=C(`text`);y(m,`style`,()=>({color:t.brand,fontSize:10,fontWeight:`600`,letterSpacing:1.2}));let h=D(`SHADERS`);v(m,h),v(f,p),v(f,m),v(c,l),v(c,u),v(c,f);let g=C(`view`);T(g,`style`,{gap:12});let x=C(`view`);T(x,`style`,{gap:4});let S=C(`text`);y(S,`style`,()=>({color:t.onMedia,fontSize:20,fontWeight:`700`}));let O=D(`Native UI, delivered at run time`);v(S,O);let k=C(`text`);y(k,`style`,()=>({color:t.onMedia,fontSize:13,opacity:.65}));let A=D(`Light swept by a looping animated uniform`);v(k,A),v(x,S),v(x,k);let j=C(`view`);return T(j,`style`,{flexDirection:`row`,gap:8}),w(j,[b(o,{size:`sm`,onPress:i,get children(){return`Sweep light`}}),b(o,{size:`sm`,variant:`secondary`,onPress:()=>n.start(),get children(){return`Loop`}})]),v(g,x),v(g,j),v(s,c),v(s,g),v(a,s),w(a,b(_,{label:`Drag sideways to move the light; the buttons sit over the shader.`})),a})()}})}function W(e){return(()=>{let n=C(`view`);y(n,`style`,()=>({flex:1,borderRadius:14,overflow:`hidden`,backgroundColor:t.media}));let r=C(`image`);y(r,`src`,()=>e.photo),T(r,`style`,{position:`absolute`,top:0,start:0,end:0,bottom:0,objectFit:`cover`});let i=C(`view`);y(i,`style`,()=>({flex:1,padding:16,justifyContent:`flex-end`,gap:2,backgroundImage:`linear-gradient(180deg, transparent 55%, ${N(`scrim`)} 100%)`}));let a=C(`text`);y(a,`style`,()=>({color:t.onMedia,fontSize:17,fontWeight:`600`})),w(a,()=>e.title);let o=C(`text`);return y(o,`style`,()=>({color:t.onMedia,fontSize:13,opacity:.82})),w(o,()=>e.note),v(i,a),v(i,o),v(n,r),v(n,i),n})()}function G(){let e=j(0),t=t=>O.timing(e,{toValue:t,duration:600,easing:k.inOut(k.cubic)}).start();return b(g,{title:`Shader effect`,subtitle:`Children drawn through a shader`,get children(){return(()=>{let n=C(`view`);T(n,`style`,{gap:10});let r=C(`shadereffect`);T(r,`source`,`
fn shade(uv: vec2f) -> vec4f {
  let cell = max(nsh.progress * 14.0, 1.0 / nsh.scale) / nsh.size;
  return sample_content(min((floor(uv / cell) + 0.5) * cell, vec2f(0.999)));
}`),T(r,`progress`,e),T(r,`style`,{height:160}),E(r,z(t=>e.set(t))),w(r,b(W,{title:`Pixelated`,note:`sample_content reads what the children draw`,get photo(){return h(`arc`)}}));let i=C(`view`);return T(i,`style`,{flexDirection:`row`,gap:8}),w(i,[b(o,{style:{flex:1},size:`sm`,variant:`secondary`,onPress:()=>t(1),get children(){return`Pixelate`}}),b(o,{style:{flex:1},size:`sm`,variant:`secondary`,onPress:()=>t(0),get children(){return`Sharpen`}})]),v(n,r),v(n,i),w(n,b(_,{label:`Drag across it to set nsh.progress; the buttons animate it.`})),n})()}})}const K=[{title:`Morning`,note:`A wipe from the top left`,photo:h(`sunrise`)},{title:`Noon`,note:`sample_from: what showed`,photo:h(`day`)},{title:`Night`,note:`sample_to: what shows now`,photo:h(`rollout`)}];function q(){let e=M(0),t=()=>K[e()];return b(g,{title:`Shader transition`,subtitle:`A change drawn through a shader`,get children(){return(()=>{let n=C(`view`);T(n,`style`,{gap:10});let r=C(`shadertransition`);return T(r,`source`,`
fn shade(uv: vec2f) -> vec4f {
  let edge = nsh.progress * 1.4 - 0.2;
  let t = smoothstep(edge - 0.2, edge + 0.2, (uv.x + uv.y) * 0.5);
  return mix(sample_to(uv), sample_from(uv), t);
}`),y(r,`value`,()=>e()),T(r,`duration`,700),T(r,`style`,{height:160}),w(r,b(W,{get title(){return t().title},get note(){return t().note},get photo(){return t().photo}})),v(n,r),w(n,[b(o,{size:`sm`,variant:`secondary`,onPress:()=>e.set((e()+1)%K.length),get children(){return`Next`}}),b(_,{label:`Each change wipes from the old picture to the new one.`})]),n})()}})}function J(){let e=M(!1);return b(g,{title:`Screen effect`,subtitle:`The whole surface through a shader`,get children(){return(()=>{let n=C(`view`);return T(n,`style`,{gap:10}),w(n,[x(()=>e(),()=>(()=>{let e=C(`screeneffect`);return T(e,`source`,`
struct Uniforms { a: vec4f, b: vec4f }
fn shade(uv: vec2f) -> vec4f {
  let c = sample_content(uv);
  let l = dot(c.rgb, vec3f(0.299, 0.587, 0.114));
  let ink = mix(uniforms.a.rgb, uniforms.b.rgb, l);
  let vignette = 1.0 - 0.6 * dot(uv - 0.5, uv - 0.5);
  return vec4f(ink * vignette, c.a);
}`),y(e,`uniforms`,()=>({a:t.success,b:t.warning})),e})()),b(p,{get checked(){return e()},onChange:({checked:t})=>e.set(t),class:`flex-row items-center gap-2`,get children(){return(()=>{let e=C(`text`);y(e,`style`,()=>({fontSize:13,color:t.foreground}));let n=D(`Duotone`);return v(e,n),e})()}}),b(_,{label:`A ScreenEffect draws everything, dialogs included, in two inks.`})]),n})()}})}const Y=s([`Home`]);function X(){let e=M(!1),r=e=>e===`Iris`?b(c,{title:`Iris`,transitionShader:{source:R,duration:600},get children(){return(()=>{let e=C(`view`);return y(e,`style`,()=>({flex:1,padding:24,gap:16,backgroundColor:t.background})),w(e,[b(W,{title:`Iris`,note:`This page came, and goes, through transitionShader`,get photo(){return h(`moon`)}}),b(o,{size:`sm`,onPress:()=>Y.pop(),get children(){return`Leave the page`}})]),e})()}}):b(c,{title:`Home`,get children(){return(()=>{let e=C(`view`);y(e,`style`,()=>({flex:1,alignItems:`center`,justifyContent:`center`,backgroundColor:t.background}));let n=C(`text`);y(n,`style`,()=>({fontSize:13,color:t.mutedForeground}));let r=D(`The iris pages open over this stack`);return v(n,r),v(e,n),e})()}});return b(g,{title:`Pages and dialogs`,subtitle:`transitionShader`,get children(){return(()=>{let i=C(`view`);T(i,`style`,{gap:10});let a=C(`view`);return T(a,`style`,{flexDirection:`row`,gap:8}),w(a,[b(o,{style:{flex:1},size:`sm`,onPress:()=>Y.push(`Iris`),get children(){return`Push a page`}}),b(o,{style:{flex:1},size:`sm`,variant:`secondary`,onPress:()=>e.set(!0),get children(){return`Open a dialog`}})]),v(i,a),w(i,[b(_,{label:`They come and go through an iris instead of the platform's animation.`}),b(d,{state:Y,get style(){return{height:260,borderRadius:n.container,borderWidth:1,borderColor:t.line,overflow:`hidden`}},get children(){return r}}),b(f,{get open(){return e()},onOpenChange:({open:t})=>e.set(t),get children(){return b(u,{width:300,scroll:!1,transitionShader:{source:R,duration:600},get children(){return(()=>{let e=C(`view`);return T(e,`style`,{height:200,gap:12}),w(e,[b(W,{title:`Dialog`,note:`Presented through the iris`,get photo(){return h(`liftoff`)}}),b(l,{get children(){return`Close`}})]),e})()}})}})]),i})()}})}const Z=[B,H,U,V,G,q,J,X];function Q(){return b(m,{detail:`WGSL shaders on the GPU: noise, gradients, animated uniforms`,max:2,cards:Z})}export{Q as ShaderDemo};