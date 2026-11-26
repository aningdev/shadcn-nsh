import{F as e}from"./utils.a7d1ea248f.js";import{append as t,bindProp as n,component as r,element as i,insert as a,text as o}from"./facades/nsh-rt.3f8ba2bc28.js";import{Canvas as s,Path2D as c}from"./facades/nsh.75d44d8778.js";
/**
* @license lucide v1.75.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
const l=[[`path`,{d:`m12 19-7-7 7-7`}],[`path`,{d:`M19 12H5`}]],u=[[`path`,{d:`M5 12h14`}],[`path`,{d:`m12 5 7 7-7 7`}]],d=[[`path`,{d:`M20 6 9 17l-5-5`}]],f=[[`path`,{d:`m15 18-6-6 6-6`}]],p=[[`path`,{d:`m9 18 6-6-6-6`}]],m=Math.PI*2,h=/* @__PURE__ */ new Set([`circle`,`ellipse`,`rect`,`line`]),g=(e,t,n=0)=>{
/**
* @license lucide v1.75.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.75.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.75.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
/**
* @license lucide v1.75.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
let r=e[t];return r==null?n:Number(r)},_=e=>{let t=String(e.points??``).trim();return t===``?[]:t.split(/[\s,]+/).map(Number)};function v(e,t,n,r){let i=()=>r.fill?n.fill():n.stroke();if(e===`path`){let e=String(t.d??``);if(e===``)return;let i=r.path(e);r.fill?n.fill(i):n.stroke(i)}else if(e===`polyline`||e===`polygon`){let r=_(t);if(r.length<4)return;n.beginPath(),n.moveTo(r[0],r[1]);for(let e=2;e+1<r.length;e+=2)n.lineTo(r[e],r[e+1]);e===`polygon`&&n.closePath(),i()}else if(h.has(e)){switch(n.beginPath(),e){case`circle`:n.arc(g(t,`cx`),g(t,`cy`),g(t,`r`),0,m);break;case`ellipse`:n.ellipse(g(t,`cx`),g(t,`cy`),g(t,`rx`),g(t,`ry`),0,0,m);break;case`rect`:n.roundRect(g(t,`x`),g(t,`y`),g(t,`width`),g(t,`height`),g(t,`rx`,g(t,`ry`)));break;case`line`:n.moveTo(g(t,`x1`),g(t,`y1`)),n.lineTo(g(t,`x2`),g(t,`y2`))}i()}}function y(e,t,n){let r=n.fill===!0;for(let[i,a]of e)v(i,a,t,{fill:r,path:n.path})}function b(e,t){return`<${e} ${Object.entries(t).filter(([,e])=>e!=null).map(([e,t])=>`${e}="${String(t)}"`).join(` `)}/>`}function x(e,t={}){let n=`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${t.ink??`currentColor`}" stroke-width="${t.weight??2}" stroke-linecap="round" stroke-linejoin="round">${e.map(([e,t])=>b(e,t)).join(``)}</svg>`;return`data:image/svg+xml,${encodeURIComponent(n)}`}const S=/* @__PURE__ */ new Map;function C(e){let t=S.get(e);return t||(t=new c(e),S.set(e,t)),t}const w=/* @__PURE__ */ new Set([p,f,l,u]);function T(a){let c=a.size??20;return e&&a.icon===d?(()=>{let e=i(`text`);n(e,`style`,()=>({color:a.tint}));let r=o(`✓`);return t(e,r),e})():r(s,{get class(){return w.has(a.icon)?`rtl:-scale-x-100`:void 0},style:{pointerEvents:`none`,width:c,height:c},draw:(e,{width:t})=>{e.scale(t/24,t/24),e.strokeStyle=a.tint,e.fillStyle=a.tint,e.lineWidth=a.weight??2,e.lineCap=`round`,e.lineJoin=`round`,y(a.icon,e,{fill:a.fill,path:C})}})}function E(t){return e?(()=>{let e=i(`text`);return n(e,`style`,()=>({color:t.tint})),a(e,()=>t.label),e})():r(T,{get icon(){return t.icon},get size(){return t.size},get tint(){return t.tint},get weight(){return t.weight}})}function D(e){let t=e.size??20;return(()=>{let r=i(`image`);return n(r,`src`,()=>x(d,{weight:e.weight??2,ink:`#000`})),n(r,`style`,()=>({pointerEvents:`none`,width:t,height:t,tintColor:e.tint})),r})()}export{p as a,l as c,x as i,T as n,f as o,E as r,d as s,D as t};