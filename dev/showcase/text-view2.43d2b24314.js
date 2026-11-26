import{F as e,rt as t,tt as n,ut as r}from"./look.4802e23609.js";import{n as i}from"./icons.38d2123b88.js";import{t as a}from"./play.48b4005e50.js";import{n as o}from"./button.bce3a4b511.js";import{F as s,N as c,P as l,jt as u}from"./app.6d78f15247.js";import{r as d}from"./kit.1e19cc0673.js";import{a as f,i as p,o as m,r as h,t as g}from"./card.a6a6e4086c.js";import{t as _}from"./image-viewer.92ba9af90b.js";import{n as v,t as y}from"./text-view.610c76ba6c.js";import{append as b,bindProp as x,component as S,each as C,element as w,insert as T,prop as E,text as D}from"./facades/nsh-rt.3f8ba2bc28.js";import{cleanup as O,keymap as k,signal as A}from"./facades/nsh.40a708e4ce.js";const j=`# Native Shell

**NSH** loads apps written in *TSX* into native apps at run time and renders them with each platform's ~~web views~~ own views. Press <kbd>${k.label(`mod+k`)}</kbd> to search the docs, or read [the guide](https://github.com/longbridge/nsh).

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
`,M=[{name:`mention`,pattern:`@(\\w+)`},{name:`issue`,pattern:`#(\\d+)`},{name:`chart`,language:`chart`},{name:`callout`,tag:`callout`},{name:`note`,container:`note`}],N=[{name:`task`,pattern:`\\bT-\\d{4}\\b`},{name:`pr`,pattern:`\\b[a-z-]+#\\d+\\b`}];function P(){let t=A(`nothing yet`),n=A(null);return S(g,{get children(){return[S(f,{get children(){return[S(m,{get children(){return`Markdown`}}),S(p,{get children(){return`CommonMark and GitHub's: tables, tasks, math, HTML`}})]}}),S(h,{get children(){return[S(y,{markdown:j,selectable:!0,codeBlockActions:[{id:`copy`,label:`Copy code`}],onLinkPress:({url:e})=>t.set(e),onImagePress:({image:e})=>n.set(e)}),(()=>{let n=w(`text`);return x(n,`style`,()=>({fontSize:12,color:e.mutedForeground})),T(n,()=>`Link pressed: ${t()}`),n})(),S(_,{get image(){return n()},onClose:()=>n.set(null)})]}})]}})}function F(){let e=A(null);return S(g,{get children(){return[S(f,{get children(){return[S(m,{get children(){return`HTML`}}),S(p,{get children(){return`An article page: sections, figures, lists, tables, code`}})]}}),S(h,{get children(){return[S(y,{html:`<article>
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
</article>`,selectable:!0,onImagePress:({image:t})=>e.set(t)}),S(_,{get image(){return e()},onClose:()=>e.set(null)})]}})]}})}function I(r){let i=()=>r.source.split(`
`).map(e=>e.trim().split(/\s+/)).filter(e=>e.length===2).map(([e,t])=>({label:e,value:Number(t)||0})),a=()=>Math.max(1,...i().map(e=>e.value));return(()=>{let r=w(`view`);return x(r,`style`,()=>({height:112,flexDirection:`row`,alignItems:`flex-end`,gap:8,...n(t.control),borderWidth:1,borderColor:e.border,backgroundColor:e.inset,padding:12})),T(r,C(()=>i(),t=>(()=>{let n=w(`view`);E(n,`style`,{flex:1,alignItems:`center`,gap:4});let r=w(`view`);x(r,`style`,()=>({width:`100%`,borderRadius:6,backgroundColor:e.brand,height:t().value/a()*64}));let i=w(`text`);return x(i,`style`,()=>({fontSize:11,color:e.mutedForeground})),T(i,()=>t().label),b(n,r),b(n,i),n})())),r})()}function L(a){switch(a.name){case`mention`:return(()=>{let t=w(`view`);x(t,`style`,()=>({verticalAlign:`middle`,borderRadius:999,backgroundColor:r.info,paddingHorizontal:8}));let n=w(`text`);return x(n,`style`,()=>({fontSize:14,fontWeight:`500`,color:e.info})),T(n,()=>`@${a.attributes?.[`1`]}`),b(t,n),t})();case`issue`:return(()=>{let t=w(`view`);x(t,`style`,()=>({flexDirection:`row`,alignItems:`center`,gap:4,borderRadius:6,borderWidth:1,borderColor:e.border,paddingHorizontal:6,verticalAlign:`middle`,height:20}));let n=w(`text`);return x(n,`style`,()=>({fontSize:13,fontWeight:`600`,color:e.foreground})),T(n,()=>`#${a.attributes?.[`1`]}`),b(t,n),T(t,S(i,{icon:u,size:14,get tint(){return e.foreground}}),n),t})();case`chart`:return S(I,{get source(){return a.text??``}});case`callout`:return(()=>{let i=w(`view`);x(i,`style`,()=>({flexDirection:`row`,gap:12,...n(t.control),backgroundColor:r.up,padding:12}));let o=w(`text`);x(o,`style`,()=>({color:e.up}));let s=D(`✦`);return b(o,s),b(i,o),T(i,S(y,{get document(){return{blocks:a.children??[]}},style:{flex:1}})),i})();default:return(()=>{let r=w(`view`);x(r,`style`,()=>({gap:4,...n(t.control),borderWidth:1,borderColor:e.info,padding:12}));let i=w(`text`);return x(i,`style`,()=>({fontSize:12,fontWeight:`600`,textTransform:`uppercase`,letterSpacing:.6,color:e.info})),T(i,()=>a.attributes?.label??a.name),b(r,i),T(r,S(y,{get document(){return{blocks:a.children??[]}}})),r})()}}function R(){return S(g,{get children(){return[S(f,{get children(){return[S(m,{get children(){return`Inline chips`}}),S(p,{get children(){return`Chips in the text; lines stay evenly spaced`}})]}}),S(h,{get children(){return S(y,{markdown:`Picked up T-0089 after the review of nsh#810: each chip sits in the middle of the text, and a line holding one is as tall as the others. T-0096 follows up on iOS and macOS, with gpui-kit#3766 next in the queue. 中文段落里的 T-0101 也一样，和文字居中对齐，行距保持一致。`,extensions:N,styles:{root:{fontSize:17,lineHeight:26}},renderCustom:t=>(()=>{let n=w(`view`);x(n,`style`,()=>({verticalAlign:`middle`,height:20,flexDirection:`row`,alignItems:`center`,gap:6,borderRadius:999,borderWidth:1,borderColor:e.border,backgroundColor:e.inset,paddingHorizontal:8}));let r=w(`view`);x(r,`style`,()=>({width:6,height:6,borderRadius:3,backgroundColor:t.name===`task`?e.info:e.up}));let i=w(`text`);return x(i,`style`,()=>({fontFamily:`monospace`,fontSize:13,lineHeight:16,color:e.foreground})),T(i,()=>t.text),b(n,r),b(n,i),n})()})}})]}})}function z(){return S(g,{get children(){return[S(f,{get children(){return[S(m,{get children(){return`Extensions`}}),S(p,{get children(){return`Mentions, issue chips with an icon, a chart block, a Callout tag, a note container`}})]}}),S(h,{get children(){return S(y,{markdown:`Thanks @huacnlee and @sunli829 for the review! Fixed in #775 and #799.

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
`,extensions:M,renderCustom:L})}})]}})}function B(){return(()=>{let e=w(`view`);return E(e,`style`,{gap:16}),T(e,[S(R,{}),S(z,{})]),e})()}function V(){return(()=>{let e=w(`view`);return E(e,`class`,v),e})()}function H(){let e=A(``),t=A(!1),n=A(void 0),r=()=>{let e=n();e!==void 0&&clearInterval(e),n.set(void 0),t.set(!1)};O(r);let i=()=>{r();let i=`Here is how to put **an NSH app** in your iOS app:

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

That's it. Ping me if anything looks off.`.match(/\s*\S{1,4}|\s+/g)??[],a=0;e.set(``),t.set(!0),n.set(setInterval(()=>{if(a>=i.length)return r();e.set(e()+i[a]),a+=1},40))};return S(g,{get children(){return[S(f,{get children(){return[S(m,{get children(){return`Streaming`}}),S(p,{get children(){return`A reply as an AI model writes it, with a caret`}})]}}),S(h,{get children(){return[S(y,{get markdown(){return e()},get options(){return{streaming:t()}},get streamingCaret(){return t()?S(V,{}):void 0},selectable:!0,codeBlockActions:[{id:`copy`,label:`Copy code`}]}),S(o,{variant:`secondary`,icon:a,get disabled(){return t()},get accessibilityLabel(){return t()?`Streaming…`:`Stream it`},onPress:i,get children(){return t()?`Streaming…`:`Stream it`}})]}})]}})}const U=`Every one with a native backend:

- iOS and Android: UIKit and Android views
- macOS, Windows and Linux: AppKit, Win32 and GTK 4`;function W(){let t=A(``),n=A(``),r=e=>()=>n.set(`${e} “${t()}”`);return S(g,{get children(){return[S(f,{get children(){return[S(m,{get children(){return`Selectable view`}}),S(p,{get children(){return`One selection across texts and TextViews`}})]}}),S(h,{get children(){return[(()=>{let n=w(`view`);E(n,`selectable`,!0),E(n,`style`,{gap:12}),E(n,`onSelectionChange`,({text:e})=>t.set(e)),x(n,`selectionMenu`,()=>[{label:`Highlight`,onSelect:r(`Highlight`)},{type:`separator`},{label:`Define`,onSelect:r(`Define`)}]);let i=w(`view`);E(i,`style`,{flexDirection:`row`,alignItems:`baseline`,gap:8});let a=w(`text`);x(a,`style`,()=>({userSelect:`none`,fontSize:13,color:e.faint}));let o=D(`Not selectable`);b(a,o);let s=w(`text`);x(s,`style`,()=>({fontSize:15,color:e.foreground}));let c=D(`A plain Text joins the selection too.`);return b(s,c),b(i,a),b(i,s),b(n,i),T(n,[S(y,{markdown:`Which **platforms** does NSH run on?`}),S(y,{markdown:U})],i),n})(),(()=>{let t=w(`text`);x(t,`style`,()=>({fontSize:12,color:e.mutedForeground}));let n=D(`Drag from the question into the answer, or long press and move the handles`);return b(t,n),t})(),(()=>{let n=w(`text`);return x(n,`style`,()=>({fontSize:12,color:e.mutedForeground})),T(n,()=>`Selected: ${t()||`nothing`}`),n})(),(()=>{let t=w(`text`);return x(t,`style`,()=>({fontSize:12,color:e.mutedForeground})),T(t,()=>`Chosen from the selection menu: ${n()||`nothing yet`}`),t})()]}})]}})}const G=[{value:`plain`,label:`Text`},{value:`markdown`,label:`Markdown`},{value:`html`,label:`HTML`}];function K(){let r=A(void 0),i=A(`markdown`),a=A(``),o=async()=>a.set(await r()?.selectedText({format:i()})??``);return S(g,{get children(){return[S(f,{get children(){return[S(m,{get children(){return`Read the selection`}}),S(p,{get children(){return`selectedText of a TextView ref`}})]}}),S(h,{get children(){return[S(y,{ref:e=>r.set(e),selectable:!0,markdown:U,onSelectionChange:()=>void o()}),S(c,{get value(){return i()},onValueChange:e=>{i.set(e),o()},get children(){return S(s,{get children(){return C(()=>G,e=>S(l,{get value(){return e().value},get children(){return e().label}}))}})}}),(()=>{let r=w(`view`);x(r,`style`,()=>({...n(t.control),backgroundColor:e.inset,padding:12}));let i=w(`text`);return x(i,`style`,()=>({fontFamily:`monospace`,fontSize:12,userSelect:`text`,color:e.foreground})),T(i,()=>a()||`Select part of the answer`),b(r,i),r})()]}})]}})}function q(){return(()=>{let e=w(`view`);return E(e,`style`,{gap:16}),T(e,[S(W,{}),S(K,{})]),e})()}const J=[{value:`Markdown`,label:`Markdown`,body:P},{value:`HTML`,label:`HTML`,body:F},{value:`Extensions`,label:`Extensions`,body:B},{value:`Streaming`,label:`Streaming`,body:H},{value:`Selection`,label:`Selection`,body:q}];function Y(){let e=A(`Markdown`);return S(d,{title:`TextView`,get children(){return(()=>{let t=w(`view`);return E(t,`style`,{gap:16}),T(t,[S(c,{get value(){return e()},onValueChange:t=>e.set(t),get children(){return S(s,{fill:!0,get children(){return C(()=>J,e=>S(l,{get value(){return e().value},get children(){return e().label}}))}})}}),C(()=>J.filter(t=>t.value===e()),e=>e().body())]),t})()}})}export{Y as TextViewDemo};