import{A as e,F as t,Y as n,ct as r,dt as i,j as a}from"./look.4802e23609.js";import{n as o,s}from"./icons.38d2123b88.js";import{t as c}from"./undo-2.bcb6309b65.js";import{c as l,l as u,n as d}from"./button.bce3a4b511.js";import{n as f}from"./data-shared.584db7b777.js";import{append as p,bindProp as m,component as h,cond as g,element as _,insert as v,merge as y,prop as b}from"./facades/nsh-rt.3f8ba2bc28.js";import{fontScale as x,platform as S,signal as C,split as w}from"./facades/nsh.40a708e4ce.js";import{DiffView as T}from"./facades/nsh-base.2d7ed6498e.js";const E={light:10,dark:16},D=(e,r=t.card)=>e===`neutral`?t.raised:`color-mix(in srgb, ${i(e)} ${n()?E.dark:E.light}%, ${r})`;function O(e){let t=r?void 0:{height:20,minWidth:20,borderRadius:5,paddingHorizontal:e.iconOnly?0:6};return h(d,{get variant(){return e.variant},size:`sm`,style:t,get onPress(){return e.onPress},get accessibilityLabel(){return`${e.label} change ${e.index+1}`},get children(){return e.iconOnly&&!r?h(o,y(l(e.variant,{size:`sm`}),{get icon(){return e.icon},size:11})):(()=>{let t=_(`text`);return b(t,`class`,`font-sans`),m(t,`style`,()=>({...u(e.variant,{size:`sm`}),fontSize:r?void 0:11})),v(t,()=>e.label),t})()}})}function k(){return{get lineAdded(){return{backgroundColor:D(`up`)}},get lineDeleted(){return{backgroundColor:D(`down`)}},get wordAdded(){return{backgroundColor:a(t.up,.28)}},get wordDeleted(){return{backgroundColor:a(t.destructive,.28)}},get indicatorAdded(){return{color:t.up}},get indicatorDeleted(){return{color:t.destructive}}}}function A(e,t){return t===`unified`?e.oldLines>0?`down`:`up`:e.newLines>0?`up`:void 0}function j(n){let i=()=>{let r=e(n.tone);return r?D(r):t.card};return(()=>{let e=_(`view`);return m(e,`style`,()=>r?{flexDirection:`row`,gap:4}:{flexDirection:`row`,gap:4,paddingLeft:16,paddingRight:12,marginRight:-8,backgroundImage:`linear-gradient(90deg, ${a(i(),0)} 0%, ${i()} 12px)`}),v(e,[h(O,{variant:`secondary`,label:`Revert`,icon:c,get index(){return n.index},get iconOnly(){return n.iconOnly},get onPress(){return n.onRevert}}),h(O,{variant:`default`,label:`Keep`,icon:s,get index(){return n.index},get iconOnly(){return n.iconOnly},get onPress(){return n.onKeep}})]),e})()}function M(e,t){if(t==null)return e;let n={};for(let r of Object.keys(e))Object.defineProperty(n,r,{enumerable:!0,get:()=>t[r]??e[r]});return n}function N(e){let[,t]=w(e,[`styles`,`class`,`style`]);return h(T,y(t,{get class(){return e.class},get style(){return e.style},get styles(){return M(k(),e.styles)}}))}const P=`import { signal, Text, View } from "nsh";

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
`,F=`import { computed, signal, Text, View } from "nsh";

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
`,I=e=>e.split(`
`).length,L=Array.from({length:24},(e,t)=>`export const value${t} = ${t}; // a long unwrapped filler line number ${t}`).join(`
`),R=L.replace(`value9 = 9;`,`value9 = 9090;`),z=`diff --git a/src/layout.rs b/src/layout.rs
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
`;function B(e){return h(d,{get accessibilityLabel(){return e.label},variant:`secondary`,size:`sm`,get disabled(){return e.disabled},get onPress(){return e.onPress},get children(){return e.name}})}function V(){let e=C(`texts`),n=C(S.desktop?`split`:`unified`),i=C(P),a=C(F),o=C({added:0,deleted:0,hunks:0}),s=C(0),c=C(``),l=C(void 0),u=({stats:e})=>{o.set(e),s.set(Math.min(s(),Math.max(0,e.hunks-1)))},d=e=>{s.set(e),l()?.goToHunk(e)};return(()=>{let y=_(`view`);b(y,`class`,`flex-1 gap-3 p-4`);let C=_(`view`);b(C,`class`,`flex-row flex-wrap items-center gap-3`),v(C,[h(f,{options:[{value:`texts`,label:`Texts`},{value:`long`,label:`Long lines`},{value:`patch`,label:`Patch`}],get value(){return e()},onChange:t=>e.set(t),size:`small`}),h(f,{options:[{value:`split`,label:`Split`},{value:`unified`,label:`Unified`}],get value(){return n()},onChange:e=>n.set(e),size:`small`})]);let w=_(`view`);return b(w,`class`,`border-border bg-card flex-1 overflow-hidden rounded-lg border`),m(w,`style`,()=>r?void 0:{maxHeight:2+20*x()*(e()===`long`?I(R):e()===`patch`?I(z):n()===`split`?Math.max(I(i()),I(a())):I(a())+o().deleted)}),v(w,()=>e()===`long`?h(N,{oldValue:L,newValue:R,language:`util.ts`,get layout(){return n()},get styles(){return k()},onStatsChange:u,expandAll:!0,class:`flex-1`}):e()===`texts`?h(N,{ref:e=>l.set(e),onStatsChange:u,get oldValue(){return i()},get newValue(){return a()},language:`tsx`,get layout(){return n()},get styles(){return k()},renderHunkActions:e=>h(j,{get index(){return e.index},get iconOnly(){return!S.desktop},get tone(){return A(e,n())},onRevert:()=>l()?.revertHunk(e.index),onKeep:()=>l()?.acceptHunk(e.index)}),onChange:({change:e})=>{i.set(e.oldValue),a.set(e.newValue),c.set(`Changed`)},onLineNumberPress:({line:e})=>c.set(`Comment on ${e.side} line ${e.line+1}`),class:`flex-1`}):h(N,{patch:z,onStatsChange:u,get layout(){return n()},get styles(){return k()},indicators:`classic`,renderSeparator:e=>(()=>{let t=_(`view`);b(t,`class`,`bg-muted flex-1 flex-row items-center gap-2 px-3`);let n=_(`text`);return b(n,`class`,`text-muted-foreground font-mono text-[11px]`),v(n,()=>e.header?`@@ ${e.header.trim()}`:`${e.lines} lines`),p(t,n),t})(),onLineNumberPress:({line:e})=>c.set(`Comment on ${e.side} line ${e.line+1}`),class:`flex-1`})),p(y,C),p(y,w),v(y,g(()=>e()===`texts`,()=>(()=>{let e=_(`view`);b(e,`class`,`flex-row flex-wrap items-center gap-2`);let n=_(`text`);b(n,`class`,`text-muted-foreground text-xs tabular-nums`);let r=_(`text`);m(r,`style`,()=>({color:t.up})),v(r,()=>`+${o().added}`);let u=_(`text`);m(u,`style`,()=>({color:t.destructive})),v(u,()=>`−${o().deleted}`),p(n,r),p(n,u),v(n,` `,u),v(n,()=>` · ${o().hunks===0?`No changes`:`Change ${s()+1} of ${o().hunks}`}`);let f=_(`view`);return b(f,`class`,`flex-1`),p(e,n),p(e,f),v(e,[h(B,{label:`Previous change`,name:`↑`,get disabled(){return s()<=0},onPress:()=>d(s()-1)}),h(B,{label:`Next change`,name:`↓`,get disabled(){return s()>=o().hunks-1},onPress:()=>d(s()+1)}),h(B,{label:`Expand all`,name:`Expand`,onPress:()=>l()?.expandAll()}),h(B,{label:`Collapse all`,name:`Collapse`,onPress:()=>l()?.collapseAll()}),h(B,{label:`Reset`,name:`Reset`,onPress:()=>{i.set(P),a.set(F),c.set(`Reset`)}})]),e})()),w),v(y,[g(()=>e()===`long`,()=>(()=>{let e=_(`text`);return b(e,`class`,`text-muted-foreground text-xs`),v(e,()=>`Text size ${x().toFixed(2)}× · raise the system text size: every line stays on its own row`),e})()),g(()=>c(),()=>(()=>{let e=_(`text`);return b(e,`class`,`text-muted-foreground text-xs`),v(e,()=>c()),e})())]),y})()}export{V as DiffViewDemo};