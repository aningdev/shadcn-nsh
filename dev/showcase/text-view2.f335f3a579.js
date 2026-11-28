import{L as e,d as t,j as n,k as r,y as i}from"./utils.bd5102a3cc.js";import{t as a}from"./play.8c452960c5.js";import{S as o}from"./icons.18ece6854c.js";import{n as s}from"./button.5707444d31.js";import{F as c,I as l,P as u,wt as d}from"./app.109d21475e.js";import{r as f}from"./kit.11d0f646da.js";import{a as p,i as m,o as h,r as g,t as _}from"./card.6fc8f52594.js";import{t as v}from"./image-viewer.be7dac9e59.js";import{n as y,t as b}from"./text-view.f581428e6d.js";import{append as x,bindProp as S,component as C,each as w,element as T,insert as E,prop as D,text as O}from"./facades/nsh-rt.3f8ba2bc28.js";import{cleanup as k,keymap as A,signal as j}from"./facades/nsh.75d44d8778.js";const M=`# Native Shell

**NSH** loads apps written in *TSX* into native apps at run time and renders them with each platform's ~~web views~~ own views. Press <kbd>${A.label(`mod+k`)}</kbd> to search the docs, or read [the guide](https://github.com/longbridge/nsh).

## How it works

1. The bundler compiles TSX to QuickJS bytecode
2. The runtime runs it on a native core
   - the reactive graph and the renderer are Rust
   - layout is Taffy (flex and grid)

- [x] Signed packages, checked before they run
- [x] Hot reload on save
- [ ] A styled component library (that one is yours)

| Platform | Views | Text |
|:---------|:------|-----:|
| iOS      | UIKit | CoreText |
| Android  | Android views | StaticLayout |
| Linux    | GTK 4 | Pango |

\`\`\`tsx
import { mount, Text } from "nsh";

mount(() => <Text class="text-lg font-semibold">Hello, NSH</Text>);
\`\`\`

> Only the app's code is JS: everything else is native.

![Starship between its towers at sunrise](https://pbs.twimg.com/media/HS8AAMSWwAEg-aG?format=jpg&name=medium)

> [!TIP]
> Long-press any paragraph to select and copy it.

> [!WARNING]
> Apps are never rebuilt once delivered, so nothing that reached \`main\` is removed.

A list stays smooth at $60$ frames a second, $16.7\\,\\text{ms}$ each.

$$
t_{\\text{frame}} = \\tfrac{1000}{60}\\,\\text{ms}
$$

The roots of $ax^2 + bx + c = 0$ are $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, and

$$
\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}, \\qquad \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

$$
f(x) = \\begin{cases} x^2 & x \\geq 0 \\\\ -x & \\text{otherwise} \\end{cases} \\qquad A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}
$$

<details>
<summary>Why QuickJS</summary>

It is small, starts fast and runs **bytecode** delivered with the app, so nothing is parsed on the device.

</details>

---

Numbers come from the gallery's benchmarks.[^1]

[^1]: Release builds on a mid-range phone and a 2021 laptop.
`,N=[{name:`mention`,pattern:`@(\\w+)`},{name:`issue`,pattern:`#(\\d+)`},{name:`chart`,language:`chart`},{name:`callout`,tag:`callout`},{name:`note`,container:`note`}],P=[{name:`task`,pattern:`\\bT-\\d{4}\\b`},{name:`pr`,pattern:`\\b[a-z-]+#\\d+\\b`}];function F(){let e=j(`nothing yet`),n=j(null);return C(_,{get children(){return[C(p,{get children(){return[C(h,{get children(){return`Markdown`}}),C(m,{get children(){return`CommonMark and GitHub's: tables, tasks, math, HTML`}})]}}),C(g,{get children(){return[C(b,{markdown:M,selectable:!0,codeBlockActions:[{id:`copy`,label:`Copy code`}],onLinkPress:({url:t})=>e.set(t),onImagePress:({image:e})=>n.set(e)}),(()=>{let n=T(`text`);return S(n,`style`,()=>({fontSize:12,color:t.mutedForeground})),E(n,()=>`Link pressed: ${e()}`),n})(),C(v,{get image(){return n()},onClose:()=>n.set(null)})]}})]}})}function I(){let e=j(null);return C(_,{get children(){return[C(p,{get children(){return[C(h,{get children(){return`HTML`}}),C(m,{get children(){return`An article page: sections, figures, lists, tables, code`}})]}}),C(g,{get children(){return[C(b,{html:`<article>
  <header>
    <h1 id="nsh-0-1-0">NSH 0.1.0: native UI from TSX</h1>
    <p><small>Posted by the NSH team &middot; 6 min read &middot; <a href="https://github.com/longbridge/nsh" title="Repository">GitHub</a></small></p>
  </header>

  <section>
    <h2 id="highlights">Highlights</h2>
    <p>
      NSH    0.1.0 is our <b>first</b> release:   apps written in TSX load
      <i>at run time</i> into native apps, render with <u>each platform's own views</u>, and the
      <s>Node.js</s> <mark>pure Rust</mark> toolchain needs nothing else. Hot reload is
      <mark color="yellow">about 120 ms</mark>, and every bundle is checked before it
      <mark style="background-color: #fecaca">runs</mark>.
    </p>
    <p>
      Styles mean what they mean in a browser: <code>w-1/2</code> or <code>bg-sky-500/15</code>, spacing in
      steps of 2<sup>2</sup> pt, and text sets H<sub>2</sub>O as you would expect. Press <kbd>Ctrl</kbd> + <kbd>B</kbd>
      to fold the gallery's sidebar, or run <code>nsh run examples/gallery</code> to try it. Our first rule says it
      best: <q>QuickJS is the slowest link: JS does as little as possible</q>. The <abbr title="Just-in-time">JIT</abbr>-free
      runtime behind it is open source.
    </p>
    <figure>
      <a href="https://pbs.twimg.com/media/HTpJzwHWMAAIOgb?format=jpg&name=medium"><img src="https://pbs.twimg.com/media/HTpJzwHWMAAIOgb?format=jpg&name=small" alt="A booster under the arc of a launch" width="320" height="160"></a>
      <figcaption>The gallery on a phone, a desktop and the web, one app. <em>Tap to open it full size.</em></figcaption>
    </figure>
    <figure>
      <img src="https://pbs.twimg.com/media/HQ6i3NMW0AAA-TS?format=jpg&name=medium" alt="A Falcon Heavy on the pad under the moon" width="320" height="200">
      <figcaption>Where the renderer was written. <em>Press it to zoom in.</em></figcaption>
    </figure>
  </section>

  <section>
    <h2 id="getting-started">Getting started</h2>
    <h3>Step by step</h3>
    <ol start="3">
      <li>Create an app (steps 1 and 2 were installing Rust and building the CLI)</li>
      <li>Run <b>nsh run</b> and choose a target:
        <ul>
          <li><i>Desktop</i>: AppKit, Win32 or GTK 4, the default</li>
          <li><i>Mobile</i>: a simulator or a device
            <ol>
              <li>iOS with UIKit views</li>
              <li>or Android with Android views</li>
            </ol>
          </li>
        </ul>
      </li>
      <li>Edit, save, and watch it reload</li>
    </ol>

    <h3>Checklist</h3>
    <ul>
      <li><input type="checkbox" checked> Write the app in TSX</li>
      <li><input type="checkbox" checked> Test it headless with nsh test</li>
      <li><input type="checkbox"> Sign and publish the package</li>
    </ul>

    <h4>Terms</h4>
    <dl>
      <dt>Host</dt>
      <dd>The native app that embeds NSH and loads modules.</dd>
      <dt>Package</dt>
      <dd>A signed <code>.nshpkg</code>: an app's bundle, checked before it runs.</dd>
    </dl>
  </section>

  <section>
    <h2 id="components">Components</h2>
    <blockquote>
      <p>Nothing NSH ships has a look of its own: the app's classes and styles draw everything.</p>
      <p>&mdash; <cite>NSH's design rules</cite></p>
    </blockquote>
    <p>An app is a module that mounts a component:</p>
    <pre><code class="language-tsx">import { mount, signal, Text, View } from "nsh";

function Counter() {
  const count = signal(0);
  return (
    &lt;View class="p-4" onPress={() =&gt; count.set(count() + 1)}&gt;
      &lt;Text&gt;{\`Pressed \${count()} times\`}&lt;/Text&gt;
    &lt;/View&gt;
  );
}

mount(Counter);</code></pre>
  </section>

  <section>
    <h2 id="performance">Performance</h2>
    <table>
      <thead>
        <tr><th align="left">Operation</th><th align="right">Platform</th><th align="right">Time</th><th style="text-align: center">Items</th></tr>
      </thead>
      <tbody>
        <tr><td>Counter, first frame</td><td align="right">headless</td><td align="right">0.6 ms</td><td align="center">49</td></tr>
        <tr><td>Counter, one tap</td><td align="right">headless</td><td align="right">0.15 ms</td><td align="center">8</td></tr>
        <tr><td>List row while scrolling</td><td align="right">Android</td><td align="right">0.35 ms</td><td align="center">4</td></tr>
      </tbody>
      <tfoot>
        <tr><td colspan="3">Baselines from docs/dev/performance.md</td><td align="center">&#10003;</td></tr>
      </tfoot>
    </table>
  </section>

  <details>
    <summary>Known issues</summary>
    <p>Zooming scroll views run on iOS and Android only for now. The desktops follow in a later release.</p>
  </details>
  <details open>
    <summary>Thanks</summary>
    <p>
      NSH is created by <a href="https://github.com/sunli829"><img src="https://avatars.githubusercontent.com/u/20092316?s=48" alt="sunli829" style="width: 20px; height: 20px"></a> <a href="https://github.com/sunli829">@sunli829</a>
      and <a href="https://github.com/huacnlee"><img src="https://avatars.githubusercontent.com/u/5518?s=48" alt="huacnlee" width="20" height="20"></a> <a href="https://github.com/huacnlee">@huacnlee</a>,
      with&nbsp;&hearts;.
    </p>
  </details>
</article>`,selectable:!0,onImagePress:({image:t})=>e.set(t)}),C(v,{get image(){return e()},onClose:()=>e.set(null)})]}})]}})}function L(e){let i=()=>e.source.split(`
`).map(e=>e.trim().split(/\s+/)).filter(e=>e.length===2).map(([e,t])=>({label:e,value:Number(t)||0})),a=()=>Math.max(1,...i().map(e=>e.value));return(()=>{let e=T(`view`);return S(e,`style`,()=>({height:112,flexDirection:`row`,alignItems:`flex-end`,gap:8,...r(n.control),borderWidth:1,borderColor:t.border,backgroundColor:t.muted,padding:12})),E(e,w(()=>i(),e=>(()=>{let n=T(`view`);D(n,`style`,{flex:1,alignItems:`center`,gap:4});let r=T(`view`);S(r,`style`,()=>({width:`100%`,borderRadius:6,backgroundColor:t.brand,height:e().value/a()*64}));let i=T(`text`);return S(i,`style`,()=>({fontSize:11,color:t.mutedForeground})),E(i,()=>e().label),x(n,r),x(n,i),n})())),e})()}function R(i){switch(i.name){case`mention`:return(()=>{let n=T(`view`);S(n,`style`,()=>({verticalAlign:`middle`,borderRadius:999,backgroundColor:e.info,paddingHorizontal:8}));let r=T(`text`);return S(r,`style`,()=>({fontSize:14,fontWeight:`500`,color:t.info})),E(r,()=>`@${i.attributes?.[`1`]}`),x(n,r),n})();case`issue`:return(()=>{let e=T(`view`);S(e,`style`,()=>({flexDirection:`row`,alignItems:`center`,gap:4,borderRadius:6,borderWidth:1,borderColor:t.border,paddingHorizontal:6,verticalAlign:`middle`,height:20}));let n=T(`text`);return S(n,`style`,()=>({fontSize:13,fontWeight:`600`,color:t.foreground})),E(n,()=>`#${i.attributes?.[`1`]}`),x(e,n),E(e,C(o,{icon:d,size:14,get tint(){return t.foreground}}),n),e})();case`chart`:return C(L,{get source(){return i.text??``}});case`callout`:return(()=>{let a=T(`view`);S(a,`style`,()=>({flexDirection:`row`,gap:12,...r(n.control),backgroundColor:e.success,padding:12}));let o=T(`text`);S(o,`style`,()=>({color:t.success}));let s=O(`✦`);return x(o,s),x(a,o),E(a,C(b,{get document(){return{blocks:i.children??[]}},style:{flex:1}})),a})();default:return(()=>{let e=T(`view`);S(e,`style`,()=>({gap:4,...r(n.control),borderWidth:1,borderColor:t.info,padding:12}));let a=T(`text`);return S(a,`style`,()=>({fontSize:12,fontWeight:`600`,textTransform:`uppercase`,letterSpacing:.6,color:t.info})),E(a,()=>i.attributes?.label??i.name),x(e,a),E(e,C(b,{get document(){return{blocks:i.children??[]}}})),e})()}}function z(){return C(_,{get children(){return[C(p,{get children(){return[C(h,{get children(){return`Inline chips`}}),C(m,{get children(){return`Chips in the text; lines stay evenly spaced`}})]}}),C(g,{get children(){return C(b,{markdown:`Picked up T-0089 after the review of nsh#810: each chip sits in the middle of the text, and a line holding one is as tall as the others. T-0096 follows up on iOS and macOS, with gpui-kit#3766 next in the queue. 中文段落里的 T-0101 也一样，和文字居中对齐，行距保持一致。`,extensions:P,styles:{root:{fontSize:17,lineHeight:26}},renderCustom:e=>(()=>{let n=T(`view`);S(n,`style`,()=>({verticalAlign:`middle`,height:20,flexDirection:`row`,alignItems:`center`,gap:6,borderRadius:999,borderWidth:1,borderColor:t.border,backgroundColor:t.muted,paddingHorizontal:8}));let r=T(`view`);S(r,`style`,()=>({width:6,height:6,borderRadius:3,backgroundColor:e.name===`task`?t.info:t.success}));let a=T(`text`);return S(a,`style`,()=>({fontFamily:i.mono,fontSize:13,lineHeight:16,color:t.foreground})),E(a,()=>e.text),x(n,r),x(n,a),n})()})}})]}})}function B(){return C(_,{get children(){return[C(p,{get children(){return[C(h,{get children(){return`Extensions`}}),C(m,{get children(){return`Mentions, issue chips with an icon, a chart block, a Callout tag, a note container`}})]}}),C(g,{get children(){return C(b,{markdown:`Thanks @huacnlee and @sunli829 for the review! Fixed in #775 and #799.

\`\`\`chart
Mon 12
Tue 18
Wed 9
Thu 22
Fri 15
\`\`\`

<Callout kind="tip">

Extensions turn the app's own syntax into **custom nodes**.

</Callout>

:::note[Heads up]
Containers wrap Markdown, like *this*.
:::
`,extensions:N,renderCustom:R})}})]}})}function V(){return(()=>{let e=T(`view`);return D(e,`style`,{gap:16}),E(e,[C(z,{}),C(B,{})]),e})()}function H(){return(()=>{let e=T(`view`);return D(e,`class`,y),e})()}function U(){let e=j(``),t=j(!1),n=j(void 0),r=()=>{let e=n();e!==void 0&&clearInterval(e),n.set(void 0),t.set(!1)};k(r);let i=()=>{r();let i=`Here is how to put **an NSH app** in your iOS app:

1. Build the SDK with \`cargo xtask ios-embed\`
2. Add *NativeShell.xcframework* to the project
3. Show the app in an \`NshAppView\`

| Step | Where |
|------|------:|
| SDK | your Mac |
| View | your app |

\`\`\`sh
nsh package my-app --target ios-simulator --run
\`\`\`

That's it. Ping me if anything looks off.`.match(/\s*\S{1,4}|\s+/g)??[],a=0;e.set(``),t.set(!0),n.set(setInterval(()=>{if(a>=i.length)return r();e.set(e()+i[a]),a+=1},40))};return C(_,{get children(){return[C(p,{get children(){return[C(h,{get children(){return`Streaming`}}),C(m,{get children(){return`A reply as an AI model writes it, with a caret`}})]}}),C(g,{get children(){return[C(b,{get markdown(){return e()},get options(){return{streaming:t()}},get streamingCaret(){return t()?C(H,{}):void 0},selectable:!0,codeBlockActions:[{id:`copy`,label:`Copy code`}]}),C(s,{variant:`secondary`,icon:a,get disabled(){return t()},get accessibilityLabel(){return t()?`Streaming…`:`Stream it`},onPress:i,get children(){return t()?`Streaming…`:`Stream it`}})]}})]}})}const W=`Every one with a native backend:

- iOS and Android: UIKit and Android views
- macOS, Windows and Linux: AppKit, Win32 and GTK 4`;function G(){let e=j(``),n=j(``),r=t=>()=>n.set(`${t} “${e()}”`);return C(_,{get children(){return[C(p,{get children(){return[C(h,{get children(){return`Selectable view`}}),C(m,{get children(){return`One selection across texts and TextViews`}})]}}),C(g,{get children(){return[(()=>{let n=T(`view`);D(n,`selectable`,!0),D(n,`style`,{gap:12}),D(n,`onSelectionChange`,({text:t})=>e.set(t)),S(n,`selectionMenu`,()=>[{label:`Highlight`,onSelect:r(`Highlight`)},{type:`separator`},{label:`Define`,onSelect:r(`Define`)}]);let i=T(`view`);D(i,`style`,{flexDirection:`row`,alignItems:`baseline`,gap:8});let a=T(`text`);S(a,`style`,()=>({userSelect:`none`,fontSize:13,color:t.faint}));let o=O(`Not selectable`);x(a,o);let s=T(`text`);S(s,`style`,()=>({fontSize:15,color:t.foreground}));let c=O(`A plain Text joins the selection too.`);return x(s,c),x(i,a),x(i,s),x(n,i),E(n,[C(b,{markdown:`Which **platforms** does NSH run on?`}),C(b,{markdown:W})],i),n})(),(()=>{let e=T(`text`);S(e,`style`,()=>({fontSize:12,color:t.mutedForeground}));let n=O(`Drag from the question into the answer, or long press and move the handles`);return x(e,n),e})(),(()=>{let n=T(`text`);return S(n,`style`,()=>({fontSize:12,color:t.mutedForeground})),E(n,()=>`Selected: ${e()||`nothing`}`),n})(),(()=>{let e=T(`text`);return S(e,`style`,()=>({fontSize:12,color:t.mutedForeground})),E(e,()=>`Chosen from the selection menu: ${n()||`nothing yet`}`),e})()]}})]}})}const K=[{value:`plain`,label:`Text`},{value:`markdown`,label:`Markdown`},{value:`html`,label:`HTML`}];function q(){let e=j(void 0),a=j(`markdown`),o=j(``),s=async()=>o.set(await e()?.selectedText({format:a()})??``);return C(_,{get children(){return[C(p,{get children(){return[C(h,{get children(){return`Read the selection`}}),C(m,{get children(){return`selectedText of a TextView ref`}})]}}),C(g,{get children(){return[C(b,{ref:t=>e.set(t),selectable:!0,markdown:W,onSelectionChange:()=>void s()}),C(u,{get value(){return a()},onValueChange:e=>{a.set(e),s()},get children(){return C(l,{get children(){return w(()=>K,e=>C(c,{get value(){return e().value},get children(){return e().label}}))}})}}),(()=>{let e=T(`view`);S(e,`style`,()=>({...r(n.control),backgroundColor:t.muted,padding:12}));let a=T(`text`);return S(a,`style`,()=>({fontFamily:i.mono,fontSize:12,userSelect:`text`,color:t.foreground})),E(a,()=>o()||`Select part of the answer`),x(e,a),e})()]}})]}})}function J(){return(()=>{let e=T(`view`);return D(e,`style`,{gap:16}),E(e,[C(G,{}),C(q,{})]),e})()}const Y=[{value:`Markdown`,label:`Markdown`,body:F},{value:`HTML`,label:`HTML`,body:I},{value:`Extensions`,label:`Extensions`,body:V},{value:`Streaming`,label:`Streaming`,body:U},{value:`Selection`,label:`Selection`,body:J}];function X(){let e=j(`Markdown`);return C(f,{title:`TextView`,get children(){return(()=>{let t=T(`view`);return D(t,`style`,{gap:16}),E(t,[C(u,{get value(){return e()},onValueChange:t=>e.set(t),get children(){return C(l,{fill:!0,get children(){return w(()=>Y,e=>C(c,{get value(){return e().value},get children(){return e().label}}))}})}}),w(()=>Y.filter(t=>t.value===e()),e=>e().body())]),t})()}})}export{X as TextViewDemo};