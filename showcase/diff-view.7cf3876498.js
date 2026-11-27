import{F as e,R as t,d as n,i as r,s as i,w as a}from"./utils.15944e3f2c.js";import{I as o,S as s,a as c}from"./icons.2fcdb739c1.js";import{a as l,n as u,o as d}from"./button.c3892e1da9.js";import{n as f}from"./data-shared.3acfa4e8f3.js";import{append as p,bindProp as m,component as h,cond as g,element as _,insert as v,merge as y,prop as b,spread as x}from"./facades/nsh-rt.3f8ba2bc28.js";import{fontScale as S,platform as C,signal as w,split as T}from"./facades/nsh.75d44d8778.js";import{DiffView as E}from"./facades/nsh-base.e0f64e5000.js";function D(e){let[,t]=T(e,[`styles`,`class`,`classList`,`style`]);return h(E,y(t,{get class(){return e.class},get classList(){return e.classList},get style(){return e.style},get styles(){return P(k(),e.styles)}}))}function O(e){let[,t]=T(e,[`index`,`iconOnly`,`tone`,`onRevert`,`onKeep`,`class`,`classList`,`style`]),i=()=>{let t=r(e.tone);return t?M(t):n.card};return(()=>{let n=_(`view`);return x(n,t),m(n,`class`,()=>e.class),m(n,`classList`,()=>e.classList),m(n,`style`,()=>[F(i),e.style??null]),v(n,[h(N,{variant:`secondary`,label:`Revert`,icon:o,get index(){return e.index},get iconOnly(){return e.iconOnly},get onPress(){return e.onRevert}}),h(N,{variant:`default`,label:`Keep`,icon:c,get index(){return e.index},get iconOnly(){return e.iconOnly},get onPress(){return e.onKeep}})]),n})()}function k(){return{get lineAdded(){return{backgroundColor:M(`success`)}},get lineDeleted(){return{backgroundColor:M(`destructive`)}},get wordAdded(){return{backgroundColor:i(n.success,.28)}},get wordDeleted(){return{backgroundColor:i(n.destructive,.28)}},get indicatorAdded(){return{color:n.success}},get indicatorDeleted(){return{color:n.destructive}}}}function A(e,t){return t===`unified`?e.oldLines>0?`destructive`:`success`:e.newLines>0?`success`:void 0}const j={light:10,dark:16},M=(e,r=n.card)=>e===`neutral`?n.surface:`color-mix(in srgb, ${t(e)} ${a()?j.dark:j.light}%, ${r})`;function N(t){let n=e?void 0:{height:20,minWidth:20,borderRadius:5,paddingHorizontal:t.iconOnly?0:6};return h(u,{get variant(){return t.variant},size:`sm`,style:n,get onPress(){return t.onPress},get accessibilityLabel(){return`${t.label} change ${t.index+1}`},get children(){return t.iconOnly&&!e?h(s,y(l(t.variant,{size:`sm`}),{get icon(){return t.icon},size:11})):(()=>{let n=_(`text`);return b(n,`class`,`font-sans`),m(n,`style`,()=>({...d(t.variant,{size:`sm`}),fontSize:e?void 0:11})),v(n,()=>t.label),n})()}})}function P(e,t){if(t==null)return e;let n={};for(let r of Object.keys(e))Object.defineProperty(n,r,{enumerable:!0,get:()=>t[r]??e[r]});return n}function F(t){return e?{flexDirection:`row`,gap:4}:{flexDirection:`row`,gap:4,paddingLeft:16,paddingRight:12,marginRight:-8,backgroundImage:`linear-gradient(90deg, ${i(t(),0)} 0%, ${t()} 12px)`}}const I=`import { signal, Text, View } from "nsh";

/** A counter that starts at zero. */
export function Counter() {
  const count = signal(0);
  const label = () => "Count: " + count();
  return (
    <View onPress={() => count.set(count() + 1)}>
      <Text>{label()}</Text>
    </View>
  );
}

/** Formats a number for the badge. */
function badge(n: number) {
  return n > 99 ? "99+" : String(n);
}

/** The step of each press. */
const STEP = 1;

export default Counter;
`,L=`import { computed, signal, Text, View } from "nsh";

/** A counter that starts at \`initial\`. */
export function Counter(props: { initial?: number }) {
  const count = signal(props.initial ?? 0);
  const label = computed(() => \`Count: \${count()}\`);
  return (
    <View onPress={() => count.set(count() + STEP)} class="p-4">
      <Text>{label()}</Text>
    </View>
  );
}

/** Formats a number for the badge. */
function badge(n: number) {
  return n > 999 ? "999+" : String(n);
}

/** The step of each press. */
const STEP = 2;

export default Counter;
`,R=e=>e.split(`
`).length,z=Array.from({length:24},(e,t)=>`export const value${t} = ${t}; // a long unwrapped filler line number ${t}`).join(`
`),B=z.replace(`value9 = 9;`,`value9 = 9090;`),V=`diff --git a/src/layout.rs b/src/layout.rs
--- a/src/layout.rs
+++ b/src/layout.rs
@@ -12,6 +12,7 @@ impl Layout {
     pub fn measure(&mut self, node: NodeId, available: Size) -> Size {
         let style = self.style(node);
-        let size = taffy::compute(style, available);
+        let size = taffy::compute(style, available)
+            .max(style.min_size);
         self.cache.insert(node, size);
         size
     }
@@ -40,5 +41,5 @@ impl Layout {
     fn invalidate(&mut self, node: NodeId) {
-        self.cache.remove(&node);
+        self.cache.retain(|id, _| *id != node);
         for child in self.children(node) {
             self.invalidate(child);
         }
`;function H(e){return h(u,{get accessibilityLabel(){return e.label},variant:`secondary`,size:`sm`,get disabled(){return e.disabled},get onPress(){return e.onPress},get children(){return e.name}})}function U(){let t=w(`texts`),r=w(C.desktop?`split`:`unified`),i=w(I),a=w(L),o=w({added:0,deleted:0,hunks:0}),s=w(0),c=w(``),l=w(void 0),u=({stats:e})=>{o.set(e),s.set(Math.min(s(),Math.max(0,e.hunks-1)))},d=e=>{s.set(e),l()?.goToHunk(e)};return(()=>{let y=_(`view`);b(y,`class`,`flex-1 gap-3 p-4`);let x=_(`view`);b(x,`class`,`flex-row flex-wrap items-center gap-3`),v(x,[h(f,{options:[{value:`texts`,label:`Texts`},{value:`long`,label:`Long lines`},{value:`patch`,label:`Patch`}],get value(){return t()},onChange:e=>t.set(e),size:`small`}),h(f,{options:[{value:`split`,label:`Split`},{value:`unified`,label:`Unified`}],get value(){return r()},onChange:e=>r.set(e),size:`small`})]);let w=_(`view`);return b(w,`class`,`border-border bg-card flex-1 overflow-hidden rounded-lg border`),m(w,`style`,()=>e?void 0:{maxHeight:2+20*S()*(t()===`long`?R(B):t()===`patch`?R(V):r()===`split`?Math.max(R(i()),R(a())):R(a())+o().deleted)}),v(w,()=>t()===`long`?h(D,{oldValue:z,newValue:B,language:`util.ts`,get layout(){return r()},get styles(){return k()},onStatsChange:u,expandAll:!0,class:`flex-1`}):t()===`texts`?h(D,{ref:e=>l.set(e),onStatsChange:u,get oldValue(){return i()},get newValue(){return a()},language:`tsx`,get layout(){return r()},get styles(){return k()},renderHunkActions:e=>h(O,{get index(){return e.index},get iconOnly(){return!C.desktop},get tone(){return A(e,r())},onRevert:()=>l()?.revertHunk(e.index),onKeep:()=>l()?.acceptHunk(e.index)}),onChange:({change:e})=>{i.set(e.oldValue),a.set(e.newValue),c.set(`Changed`)},onLineNumberPress:({line:e})=>c.set(`Comment on ${e.side} line ${e.line+1}`),class:`flex-1`}):h(D,{patch:V,onStatsChange:u,get layout(){return r()},get styles(){return k()},indicators:`classic`,renderSeparator:e=>(()=>{let t=_(`view`);b(t,`class`,`bg-muted flex-1 flex-row items-center gap-2 px-3`);let n=_(`text`);return b(n,`class`,`text-muted-foreground font-mono text-[11px]`),v(n,()=>e.header?`@@ ${e.header.trim()}`:`${e.lines} lines`),p(t,n),t})(),onLineNumberPress:({line:e})=>c.set(`Comment on ${e.side} line ${e.line+1}`),class:`flex-1`})),p(y,x),p(y,w),v(y,g(()=>t()===`texts`,()=>(()=>{let e=_(`view`);b(e,`class`,`flex-row flex-wrap items-center gap-2`);let t=_(`text`);b(t,`class`,`text-muted-foreground text-xs tabular-nums`);let r=_(`text`);m(r,`style`,()=>({color:n.success})),v(r,()=>`+${o().added}`);let u=_(`text`);m(u,`style`,()=>({color:n.destructive})),v(u,()=>`−${o().deleted}`),p(t,r),p(t,u),v(t,` `,u),v(t,()=>` · ${o().hunks===0?`No changes`:`Change ${s()+1} of ${o().hunks}`}`);let f=_(`view`);return b(f,`class`,`flex-1`),p(e,t),p(e,f),v(e,[h(H,{label:`Previous change`,name:`↑`,get disabled(){return s()<=0},onPress:()=>d(s()-1)}),h(H,{label:`Next change`,name:`↓`,get disabled(){return s()>=o().hunks-1},onPress:()=>d(s()+1)}),h(H,{label:`Expand all`,name:`Expand`,onPress:()=>l()?.expandAll()}),h(H,{label:`Collapse all`,name:`Collapse`,onPress:()=>l()?.collapseAll()}),h(H,{label:`Reset`,name:`Reset`,onPress:()=>{i.set(I),a.set(L),c.set(`Reset`)}})]),e})()),w),v(y,[g(()=>t()===`long`,()=>(()=>{let e=_(`text`);return b(e,`class`,`text-muted-foreground text-xs`),v(e,()=>`Text size ${S().toFixed(2)}× · raise the system text size: every line stays on its own row`),e})()),g(()=>c(),()=>(()=>{let e=_(`text`);return b(e,`class`,`text-muted-foreground text-xs`),v(e,()=>c()),e})())]),y})()}export{U as DiffViewDemo};