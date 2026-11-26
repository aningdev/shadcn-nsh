import{F as e,V as t,j as n,rt as r}from"./look.4802e23609.js";import{t as i}from"./press.29f298692d.js";import{n as a}from"./button.bce3a4b511.js";import{G as o,K as s,d as c,f as l,q as u,u as d}from"./app.6d78f15247.js";import{t as f}from"./switch.24a7b2ae42.js";import{a as p,c as m,i as h,t as g}from"./graphics-shared.71719c8d6a.js";import{append as _,bindProp as v,component as y,cond as b,each as x,element as S,insert as C,prop as w,spread as T,text as E}from"./facades/nsh-rt.3f8ba2bc28.js";import{Animated as D,Easing as O,cleanup as k,createAnimatedValue as A,signal as j,token as M}from"./facades/nsh.40a708e4ce.js";var N={url:`asset:/assets/logo-dark.svg`,size:{width:128,height:128}};const P=`
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
`,F=`${P}
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
}`,I=`${P}
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
}`,L=`
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let d = length((uv - 0.5) * aspect);
  let t = smoothstep(nsh.progress * 1.2 - 0.04, nsh.progress * 1.2, d);
  return mix(sample_to(uv), sample_from(uv), t);
}`;function R(e){let t=j({width:1,height:1}),n=n=>e(Math.min(Math.max(n.locationX/t().width,0),1),Math.min(Math.max(n.locationY/t().height,0),1));return{onLayout:({bounds:e})=>{t.set(e.size)},onStartShouldSetResponder:()=>!0,onResponderTerminationRequest:()=>!1,onResponderGrant:e=>(n(e),!0),onResponderMove:n}}function z(){let t=A(.5),n=A(.5),r=(e,r)=>{t.set(e),n.set(r)};return y(h,{title:`Glow`,subtitle:`Soft orbs of light that blend`,get children(){return(()=>{let i=S(`view`);w(i,`style`,{gap:12});let a=S(`shader`);return w(a,`source`,F),v(a,`uniforms`,()=>({a:e.destructive,b:e.up,c:e.info,base:e.media,pointer:[t,n]})),w(a,`style`,{height:200,borderRadius:14}),T(a,R(r)),_(i,a),C(i,y(g,{label:`Drag to lead a blue orb; the light rolls off as it adds up.`})),i})()}})}function B(){let t=A(.5),n=A(.5);return y(h,{title:`Plasma`,subtitle:`Sums of sines through a cosine palette`,get children(){return(()=>{let r=S(`view`);w(r,`style`,{gap:10});let i=S(`shader`);return w(i,`source`,`
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
}`),v(i,`uniforms`,()=>({pointer:[t,n],a:e.info,b:e.up,c:e.warn})),w(i,`style`,{height:200,borderRadius:14}),T(i,R((e,r)=>{t.set(e),n.set(r)})),_(r,i),C(r,y(g,{label:`Drag across it: the pointer is a second wave source.`})),r})()}})}function V(){let r=j(1),a=A(0),o={x:A(.5),y:A(.5)},s=D.loop(D.timing(a,{toValue:1,duration:2200,easing:O.out(O.quad)}));s.start(),k(()=>s.stop());let c=(e,t)=>{s.stop(),o.x.set(e),o.y.set(t),a.set(0),s.start()},l=j({width:1,height:1});return y(h,{title:`Code rain`,subtitle:`Animated values as uniforms`,get children(){return(()=>{let s=S(`view`);w(s,`style`,{gap:10});let u=S(`shader`);w(u,`source`,`
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
}`),v(u,`uniforms`,()=>({center:[o.x,o.y],wave:a,tintA:e.up,tintB:e.brand,head:e.onMedia,ground:e.media,speed:r()})),w(u,`style`,{height:200,borderRadius:14,padding:16,justifyContent:`flex-end`}),w(u,`onLayout`,({bounds:e})=>{l.set(e.size)}),w(u,`onStartShouldSetResponder`,()=>!0),w(u,`onResponderGrant`,e=>c(e.locationX/l().width,e.locationY/l().height));let d=S(`view`);return v(d,`style`,()=>({flexDirection:`row`,alignItems:`center`,alignSelf:`flex-start`,paddingHorizontal:6,paddingVertical:4,borderRadius:2,borderWidth:1,borderColor:n(e.up,.5),backgroundColor:n(e.media,.85)})),w(d,`onStartShouldSetResponder`,()=>!0),w(d,`onResponderTerminationRequest`,()=>!1),C(d,x(()=>[1,2,4],n=>(()=>{let a=S(`view`);w(a,`onPress`,()=>r.set(n())),w(a,`role`,`button`),v(a,`accessibilityLabel`,()=>`${n()}×`),v(a,`accessibilityState`,()=>({selected:r()===n()})),w(a,`hoverStyle`,{opacity:.86}),v(a,`activeStyle`,()=>i().activeStyle),v(a,`focusVisibleStyle`,()=>t()),w(a,`style`,{paddingHorizontal:6,paddingVertical:2});let o=S(`text`);return v(o,`style`,()=>({color:r()===n()?e.onMedia:e.up,fontFamily:`monospace`,fontSize:12,fontWeight:r()===n()?`700`:`400`,opacity:r()===n()?1:.7})),C(o,()=>`${n()}×`),_(a,o),a})())),_(u,d),_(s,u),C(s,y(g,{label:`Tap the rain to send a wave; pick how fast it falls.`})),s})()}})}function H(){let t=A(0),r=D.loop(D.sequence([D.timing(t,{toValue:1,duration:2600,easing:O.inOut(O.sin)}),D.timing(t,{toValue:-1,duration:2600,easing:O.inOut(O.sin)})]));r.start(),k(()=>r.stop());let i=()=>{r.stop(),t.set(-1),D.timing(t,{toValue:1,duration:1200,easing:O.inOut(O.cubic)}).start()};return y(h,{title:`Hero banner`,subtitle:`Children drawn over the shader`,get children(){return(()=>{let o=S(`view`);w(o,`style`,{gap:10});let s=S(`shader`);w(s,`source`,I),v(s,`uniforms`,()=>({a:e.brand,b:e.up,c:e.info,base:e.media,tilt:t})),w(s,`style`,{height:200,borderRadius:14,paddingHorizontal:20,paddingVertical:16,justifyContent:`space-between`}),T(s,R(e=>{r.stop(),t.set(e*2-1)}));let c=S(`view`);w(c,`style`,{flexDirection:`row`,alignItems:`center`,gap:10});let l=S(`image`);w(l,`src`,N),w(l,`style`,{width:26,height:26});let u=S(`text`);v(u,`style`,()=>({flex:1,color:e.onMedia,fontSize:15,fontWeight:`700`}));let d=E(`Native Shell`);_(u,d);let f=S(`view`);v(f,`style`,()=>({flexDirection:`row`,alignItems:`center`,gap:6,paddingHorizontal:9,paddingVertical:4,borderRadius:999,borderWidth:.5,borderColor:n(e.brand,.3),backgroundColor:n(e.brand,.1)}));let p=S(`view`);v(p,`style`,()=>({width:5,height:5,borderRadius:999,backgroundColor:e.brand,boxShadow:`0 0 6px ${n(e.brand,.8)}`}));let m=S(`text`);v(m,`style`,()=>({color:e.brand,fontSize:10,fontWeight:`600`,letterSpacing:1.2}));let h=E(`SHADERS`);_(m,h),_(f,p),_(f,m),_(c,l),_(c,u),_(c,f);let b=S(`view`);w(b,`style`,{gap:12});let x=S(`view`);w(x,`style`,{gap:4});let D=S(`text`);v(D,`style`,()=>({color:e.onMedia,fontSize:20,fontWeight:`700`}));let O=E(`Native UI, delivered at run time`);_(D,O);let k=S(`text`);v(k,`style`,()=>({color:e.onMedia,fontSize:13,opacity:.65}));let A=E(`Light swept by a looping animated uniform`);_(k,A),_(x,D),_(x,k);let j=S(`view`);return w(j,`style`,{flexDirection:`row`,gap:8}),C(j,[y(a,{size:`sm`,onPress:i,get children(){return`Sweep light`}}),y(a,{size:`sm`,variant:`secondary`,onPress:()=>r.start(),get children(){return`Loop`}})]),_(b,x),_(b,j),_(s,c),_(s,b),_(o,s),C(o,y(g,{label:`Drag sideways to move the light; the buttons sit over the shader.`})),o})()}})}function U(t){return(()=>{let n=S(`view`);v(n,`style`,()=>({flex:1,borderRadius:14,overflow:`hidden`,backgroundColor:e.media}));let r=S(`image`);v(r,`src`,()=>t.photo),w(r,`style`,{position:`absolute`,top:0,start:0,end:0,bottom:0,objectFit:`cover`});let i=S(`view`);v(i,`style`,()=>({flex:1,padding:16,justifyContent:`flex-end`,gap:2,backgroundImage:`linear-gradient(180deg, transparent 55%, ${M(`scrim`)} 100%)`}));let a=S(`text`);v(a,`style`,()=>({color:e.onMedia,fontSize:17,fontWeight:`600`})),C(a,()=>t.title);let o=S(`text`);return v(o,`style`,()=>({color:e.onMedia,fontSize:13,opacity:.82})),C(o,()=>t.note),_(i,a),_(i,o),_(n,r),_(n,i),n})()}function W(){let e=A(0),t=t=>D.timing(e,{toValue:t,duration:600,easing:O.inOut(O.cubic)}).start();return y(h,{title:`Shader effect`,subtitle:`Children drawn through a shader`,get children(){return(()=>{let n=S(`view`);w(n,`style`,{gap:10});let r=S(`shadereffect`);w(r,`source`,`
fn shade(uv: vec2f) -> vec4f {
  let cell = max(nsh.progress * 14.0, 1.0 / nsh.scale) / nsh.size;
  return sample_content(min((floor(uv / cell) + 0.5) * cell, vec2f(0.999)));
}`),w(r,`progress`,e),w(r,`style`,{height:160}),T(r,R(t=>e.set(t))),C(r,y(U,{title:`Pixelated`,note:`sample_content reads what the children draw`,get photo(){return m(`arc`)}}));let i=S(`view`);return w(i,`style`,{flexDirection:`row`,gap:8}),C(i,[y(a,{style:{flex:1},size:`sm`,variant:`secondary`,onPress:()=>t(1),get children(){return`Pixelate`}}),y(a,{style:{flex:1},size:`sm`,variant:`secondary`,onPress:()=>t(0),get children(){return`Sharpen`}})]),_(n,r),_(n,i),C(n,y(g,{label:`Drag across it to set nsh.progress; the buttons animate it.`})),n})()}})}const G=[{title:`Morning`,note:`A wipe from the top left`,photo:m(`sunrise`)},{title:`Noon`,note:`sample_from: what showed`,photo:m(`day`)},{title:`Night`,note:`sample_to: what shows now`,photo:m(`rollout`)}];function K(){let e=j(0),t=()=>G[e()];return y(h,{title:`Shader transition`,subtitle:`A change drawn through a shader`,get children(){return(()=>{let n=S(`view`);w(n,`style`,{gap:10});let r=S(`shadertransition`);return w(r,`source`,`
fn shade(uv: vec2f) -> vec4f {
  let edge = nsh.progress * 1.4 - 0.2;
  let t = smoothstep(edge - 0.2, edge + 0.2, (uv.x + uv.y) * 0.5);
  return mix(sample_to(uv), sample_from(uv), t);
}`),v(r,`value`,()=>e()),w(r,`duration`,700),w(r,`style`,{height:160}),C(r,y(U,{get title(){return t().title},get note(){return t().note},get photo(){return t().photo}})),_(n,r),C(n,[y(a,{size:`sm`,variant:`secondary`,onPress:()=>e.set((e()+1)%G.length),get children(){return`Next`}}),y(g,{label:`Each change wipes from the old picture to the new one.`})]),n})()}})}function q(){let t=j(!1);return y(h,{title:`Screen effect`,subtitle:`The whole surface through a shader`,get children(){return(()=>{let n=S(`view`);return w(n,`style`,{gap:10}),C(n,[b(()=>t(),()=>(()=>{let t=S(`screeneffect`);return w(t,`source`,`
struct Uniforms { a: vec4f, b: vec4f }
fn shade(uv: vec2f) -> vec4f {
  let c = sample_content(uv);
  let l = dot(c.rgb, vec3f(0.299, 0.587, 0.114));
  let ink = mix(uniforms.a.rgb, uniforms.b.rgb, l);
  let vignette = 1.0 - 0.6 * dot(uv - 0.5, uv - 0.5);
  return vec4f(ink * vignette, c.a);
}`),v(t,`uniforms`,()=>({a:e.up,b:e.warn})),t})()),y(f,{get checked(){return t()},onChange:({checked:e})=>t.set(e),class:`flex-row items-center gap-2`,get children(){return(()=>{let t=S(`text`);v(t,`style`,()=>({fontSize:13,color:e.foreground}));let n=E(`Duotone`);return _(t,n),t})()}}),y(g,{label:`A ScreenEffect draws everything, dialogs included, in two inks.`})]),n})()}})}const J=u([`Home`]);function Y(){let t=j(!1),n=t=>t===`Iris`?y(o,{title:`Iris`,transitionShader:{source:L,duration:600},get children(){return(()=>{let t=S(`view`);return v(t,`style`,()=>({flex:1,padding:24,gap:16,backgroundColor:e.background})),C(t,[y(U,{title:`Iris`,note:`This page came, and goes, through transitionShader`,get photo(){return m(`moon`)}}),y(a,{size:`sm`,onPress:()=>J.pop(),get children(){return`Leave the page`}})]),t})()}}):y(o,{title:`Home`,get children(){return(()=>{let t=S(`view`);v(t,`style`,()=>({flex:1,alignItems:`center`,justifyContent:`center`,backgroundColor:e.background}));let n=S(`text`);v(n,`style`,()=>({fontSize:13,color:e.mutedForeground}));let r=E(`The iris pages open over this stack`);return _(n,r),_(t,n),t})()}});return y(h,{title:`Pages and dialogs`,subtitle:`transitionShader`,get children(){return(()=>{let i=S(`view`);w(i,`style`,{gap:10});let o=S(`view`);return w(o,`style`,{flexDirection:`row`,gap:8}),C(o,[y(a,{style:{flex:1},size:`sm`,onPress:()=>J.push(`Iris`),get children(){return`Push a page`}}),y(a,{style:{flex:1},size:`sm`,variant:`secondary`,onPress:()=>t.set(!0),get children(){return`Open a dialog`}})]),_(i,o),C(i,[y(g,{label:`They come and go through an iris instead of the platform's animation.`}),y(s,{state:J,get style(){return{height:260,borderRadius:r.container,borderWidth:1,borderColor:e.line,overflow:`hidden`}},get children(){return n}}),y(d,{get open(){return t()},onOpenChange:({open:e})=>t.set(e),get children(){return y(l,{width:300,scroll:!1,transitionShader:{source:L,duration:600},get children(){return(()=>{let e=S(`view`);return w(e,`style`,{height:200,gap:12}),C(e,[y(U,{title:`Dialog`,note:`Presented through the iris`,get photo(){return m(`liftoff`)}}),y(c,{get children(){return`Close`}})]),e})()}})}})]),i})()}})}const X=[z,V,H,B,W,K,q,Y];function Z(){return y(p,{detail:`WGSL shaders on the GPU: noise, gradients, animated uniforms`,max:2,cards:X})}export{Z as ShaderDemo};