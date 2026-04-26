import{c as r,a as d,m as h,e as x}from"./index-DKdQmqXD.js";import{j as e}from"./vendor-ui-CLuiZejp.js";import{F as p}from"./file-check-Bu9aXAkx.js";import{B as f}from"./badge-check-DiK4iuFZ.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=r("Bath",[["path",{d:"M10 4 8 6",key:"1rru8s"}],["path",{d:"M17 19v2",key:"ts1sot"}],["path",{d:"M2 12h20",key:"9i4pu4"}],["path",{d:"M7 19v2",key:"12npes"}],["path",{d:"M9 5 7.621 3.621A2.121 2.121 0 0 0 4 5v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5",key:"14ym8i"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=r("BedDouble",[["path",{d:"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8",key:"1k78r4"}],["path",{d:"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4",key:"fb3tl2"}],["path",{d:"M12 4v6",key:"1dcgq2"}],["path",{d:"M2 18h20",key:"ajqnye"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=r("Maximize",[["path",{d:"M8 3H5a2 2 0 0 0-2 2v3",key:"1dcmit"}],["path",{d:"M21 8V5a2 2 0 0 0-2-2h-3",key:"1e4gt3"}],["path",{d:"M3 16v3a2 2 0 0 0 2 2h3",key:"wsl5sc"}],["path",{d:"M16 21h3a2 2 0 0 0 2-2v-3",key:"18trek"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=r("MessageCircle",[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]]);function w({score:c,size:s=74,strokeWidth:t=7,label:l="Investment Score",className:n}){const a=Math.max(0,Math.min(100,Math.round(c))),o=(s-t)/2,i=2*Math.PI*o,m=i-a/100*i;return e.jsxs("div",{className:d("flex items-center gap-4",n),children:[e.jsxs("div",{className:"relative grid place-items-center",style:{width:s,height:s},children:[e.jsxs("svg",{width:s,height:s,className:"-rotate-90",children:[e.jsx("circle",{cx:s/2,cy:s/2,r:o,fill:"none",stroke:"rgba(15,23,42,0.08)",strokeWidth:t}),e.jsx("circle",{cx:s/2,cy:s/2,r:o,fill:"none",stroke:"url(#investmentScoreGradient)",strokeWidth:t,strokeLinecap:"round",strokeDasharray:i,strokeDashoffset:m}),e.jsx("defs",{children:e.jsxs("linearGradient",{id:"investmentScoreGradient",x1:"0%",y1:"0%",x2:"100%",y2:"100%",children:[e.jsx("stop",{offset:"0%",stopColor:"#f59e0b"}),e.jsx("stop",{offset:"55%",stopColor:"#facc15"}),e.jsx("stop",{offset:"100%",stopColor:"#10b981"})]})})]}),e.jsx("div",{className:"absolute inset-0 grid place-items-center",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"text-lg font-extrabold",children:a}),e.jsx("div",{className:"text-[10px] uppercase tracking-[0.18em] text-muted-foreground",children:"/100"})]})})]}),e.jsxs("div",{children:[e.jsx("div",{className:"text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",children:l}),e.jsx("div",{className:"mt-1 text-sm text-foreground/70",children:a>=85?"Excellent entry profile":a>=70?"Strong shortlist candidate":"Needs closer review"})]})]})}const v={"verified-seller":{label:"Verified Seller",icon:f,className:"border-emerald-200 bg-emerald-50 text-emerald-800"},"ownership-reviewed":{label:"Ownership Reviewed",icon:p,className:"border-sky-200 bg-sky-50 text-sky-800"},"legal-checked":{label:"Legal Checked",icon:x,className:"border-amber-200 bg-amber-50 text-amber-900"},"low-risk":{label:"Low Risk",icon:h,className:"border-emerald-200 bg-emerald-50 text-emerald-800"}};function C({variant:c,className:s}){const{icon:t,label:l,className:n}=v[c];return e.jsxs("span",{className:d("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",n,s),children:[e.jsx(t,{className:"h-3.5 w-3.5"}),l]})}export{M as B,w as I,N as M,C as T,j as a,y as b};
