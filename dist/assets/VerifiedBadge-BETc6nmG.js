import{j as e}from"./vendor-ui-0jn8072n.js";import{c as n,f as i,b as o}from"./index-DC-YTLmf.js";import{T as d}from"./triangle-alert-C8I23Tv7.js";import{B as t}from"./building-2-Brnd5H2V.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=n("BadgeCheck",[["path",{d:"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z",key:"3c2336"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=n("FileQuestion",[["path",{d:"M12 17h.01",key:"p32p05"}],["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z",key:"1mlx9k"}],["path",{d:"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3",key:"mhlwft"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=n("LoaderCircle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]),p={pending:{label:"Pending Review",labelAr:"قيد المراجعة",icon:b,className:"border-sky-400/30 bg-sky-500/12 text-sky-100"},verified:{label:"Verified",labelAr:"موثق",icon:c,className:"border-emerald-400/30 bg-emerald-500/12 text-emerald-100"},"legal-risk":{label:"Legal Risk",labelAr:"مخاطر قانونية",icon:d,className:"border-rose-400/30 bg-rose-500/12 text-rose-100"},"missing-documents":{label:"Missing Documents",labelAr:"مستندات ناقصة",icon:m,className:"border-amber-400/30 bg-amber-500/12 text-amber-100"}};function k({status:s,className:l}){const a=p[s],r=a.icon;return e.jsxs("div",{className:i("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",a.className,l),children:[e.jsx(r,{className:i("h-4 w-4",s==="pending"&&"animate-spin")}),e.jsx("span",{children:a.label}),e.jsx("span",{className:"opacity-70",children:"|"}),e.jsx("span",{children:a.labelAr})]})}const x={seller:{label:"Verified Seller",labelAr:"بائع موثوق",icon:c,className:"border-emerald-400/30 bg-emerald-500/15 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.18)]"},agency:{label:"Verified Agency",labelAr:"وكالة موثوقة",icon:t,className:"border-amber-300/35 bg-amber-400/15 text-amber-50 shadow-[0_0_24px_rgba(245,158,11,0.16)]"},ownership:{label:"Ownership Reviewed",labelAr:"تمت مراجعة الملكية",icon:o,className:"border-lime-300/35 bg-lime-400/15 text-lime-50 shadow-[0_0_24px_rgba(132,204,22,0.16)]"}};function y({variant:s,className:l}){const a=x[s],r=a.icon;return e.jsxs("div",{className:i("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm",a.className,l),children:[e.jsx(r,{className:"h-4 w-4"}),e.jsx("span",{children:a.label}),e.jsx("span",{className:"opacity-75",children:"|"}),e.jsx("span",{children:a.labelAr})]})}export{c as B,k as O,y as V};
