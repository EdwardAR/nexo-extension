import{F as q,a as it,b as Y,i as nt,l as ot,c as at,s as R,d as rt,e as st}from"./floating-clock-CeoaKat2.js";import{T as y}from"./timezones-vgLoi8w3.js";const G="nexo-floating-clock-host",u=10,K={width:260,height:76};let c=null,C,p=1,d={x:1,y:.12,mode:"viewport-ratio",expanded:!0},k=null,b=null;function ct(t){return t===1?{width:200,height:76}:t===2?{width:270,height:76}:{width:350,height:80}}function lt(){if(k)return k;const t={year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"};return k={zones:Object.fromEntries(y.map(e=>[e.id,{time:new Intl.DateTimeFormat(e.locale,{timeZone:e.timeZone,hour:"2-digit",minute:"2-digit",hour12:!1}),date:new Intl.DateTimeFormat(e.locale,{timeZone:e.timeZone,day:"2-digit",month:"short"}),zone:new Intl.DateTimeFormat("en-GB",{timeZone:e.timeZone,hour:"2-digit",hour12:!1,timeZoneName:"short"}),offset:new Intl.DateTimeFormat("en-CA",{...t,timeZone:e.timeZone})}]))},k}function dt(t){const i=t.cities.map(o=>y.find(n=>n.id===o)).filter(o=>!!o),e=i.find(o=>o.id===t.primary)||i[0];return e?[e,...i.filter(o=>o.id!==e.id)]:[y[0]]}function w(){C!==void 0&&window.clearInterval(C),C=void 0,b==null||b(),b=null,c==null||c.remove(),c=null}async function X(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),i=Number(t==null?void 0:t.zoom);return Number.isFinite(i)&&i>0?i:1}catch{return 1}}function T(){return{width:window.innerWidth*p,height:window.innerHeight*p}}function z(){return{width:(c==null?void 0:c.offsetWidth)||K.width,height:(c==null?void 0:c.offsetHeight)||K.height}}function L(t,i){const e=T(),o=z();return{x:Math.max(u,Math.min(t,e.width-o.width-u)),y:Math.max(u,Math.min(i,e.height-o.height-u))}}function S(t){const i=T(),e=z();if(t.mode!=="viewport-ratio")return L(t.x*p,t.y*p);const o=Math.max(0,i.width-e.width-u*2),n=Math.max(0,i.height-e.height-u*2);return L(u+Math.max(0,Math.min(1,t.x))*o,u+Math.max(0,Math.min(1,t.y))*n)}function M(t){if(!c)return;d=t;const i=S(t);c.style.left=`${i.x/p}px`,c.style.top=`${i.y/p}px`,c.style.transform=`scale(${1/p})`}function U(t,i){const e=T(),o=z(),n=L(t,i),r=Math.max(1,e.width-o.width-u*2),l=Math.max(1,e.height-o.height-u*2);return{x:Math.max(0,Math.min(1,(n.x-u)/r)),y:Math.max(0,Math.min(1,(n.y-u)/l)),mode:"viewport-ratio",expanded:!0}}function H(t,i){const e=Object.fromEntries(i.formatToParts(t).map(n=>[n.type,n.value])),o=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((o-Math.floor(t.getTime()/1e3)*1e3)/36e5)}function pt(t,i){const e=t.format(i).replace(/\./g,"");return e.charAt(0).toUpperCase()+e.slice(1)}function ut(t,i,e,o){if(i.id===e.id)return"Referencia";const n=H(t,o.zones[i.id].offset)-H(t,o.zones[e.id].offset);return n===0?`= ${e.city}`:`${n>0?"+":"−"}${Math.abs(n)} h ${e.city}`}function mt(){return'<span class="clock-globe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg></span>'}function gt(t){return`<article class="city-block" data-zone-id="${t.id}" aria-label="Hora de ${t.city}">
    <div class="city-line">${mt()}<span class="city-name">${t.city}</span><span class="zone-pill" data-zone-label>--</span></div>
    <strong class="city-time" data-time>--:--</strong>
    <span class="city-context" data-context><span data-date>--</span><span aria-hidden="true">·</span><span data-difference>Referencia</span></span>
  </article>`}function ft(t){const i=y.map(o=>{const n=t.cities.includes(o.id);return`<button class="city-toggle${n?" selected":""}" type="button" data-city-toggle="${o.id}" aria-pressed="${n}"><span>${o.city}</span><span class="city-toggle-state">${n?"Visible":"Oculta"}</span></button>`}).join(""),e=y.filter(o=>t.cities.includes(o.id)).map(o=>`<option value="${o.id}"${o.id===t.primary?" selected":""}>${o.city}</option>`).join("");return`<div class="menu" role="dialog" aria-label="Configurar reloj flotante">
    <span class="menu-label">Ciudades visibles</span>
    <div class="city-options">${i}</div>
    <label class="primary-label"><span>Ciudad principal</span><select data-primary-select>${e}</select></label>
    <button class="close-btn" type="button">Desactivar reloj</button>
  </div>`}async function V(t){await st(t),w(),await N()}async function J(){if(window!==window.top||c||document.getElementById(G))return;p=await X();const t=await ot(),i=dt(t),e=i.find(a=>a.id===t.primary)||i[0],o=ct(i.length);d={...await at()||d,expanded:!0};const n=document.createElement("aside");n.id=G,n.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${o.width}px`,`max-width:calc(100vw - ${u*2}px)`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const r=n.attachShadow({mode:"open"});r.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:100%;min-height:${o.height}px;border:1px solid rgba(148,163,184,.25);border-radius:13px;background:linear-gradient(135deg,#0d1735 0%,#111d43 58%,#17275a 100%);box-shadow:0 8px 22px rgba(2,6,23,.42),inset 0 1px 0 rgba(255,255,255,.07);color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}
      .clock:active{cursor:grabbing}.clock-toolbar{display:flex;align-items:center;justify-content:space-between;height:25px;padding:5px 8px 0;color:#94a3b8}.live-label{display:flex;align-items:center;gap:5px;font-size:8px;font-weight:800;letter-spacing:.1em;line-height:1;text-transform:uppercase}.live{width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 5px #34d399;flex-shrink:0}
      .clock-grid{display:grid;align-items:stretch;gap:0;padding:6px 9px 9px}.clock[data-count="1"] .clock-grid{grid-template-columns:minmax(0,1fr)}.clock[data-count="2"] .clock-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.city-block{display:grid;grid-template-rows:16px 25px 13px minmax(22px,auto);align-items:center;min-width:0;padding:0 6px;text-align:center}.city-block+.city-block{border-left:1px solid rgba(148,163,184,.18)}
      .city-line{display:flex;align-items:center;justify-content:center;gap:4px;min-width:0;color:#cbd5e1;font-size:10px;font-weight:700;letter-spacing:.01em;line-height:1;white-space:nowrap}.city-name{min-width:0;white-space:nowrap}.clock-globe{width:11px;height:11px;display:inline-flex;flex:none}.clock-globe svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.zone-pill{border-radius:4px;background:rgba(56,189,248,.14);padding:2px 4px;color:#bae6fd;font-size:8px;font-weight:800;line-height:1;white-space:nowrap}.city-time{display:block;color:#fff;font:750 21px/1 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.045em;white-space:nowrap}.date-str{display:block;min-width:0;overflow:hidden;color:#94a3b8;font-size:9px;font-weight:600;line-height:1;white-space:nowrap;text-overflow:ellipsis}.difference{display:flex;align-items:center;justify-content:center;min-width:0;color:#a5b4fc;font-size:10px;font-weight:600;line-height:1.15;text-align:center}.clock[data-count="3"] .city-time{font-size:18px}.clock[data-count="3"] .city-block{padding:0 4px}.clock[data-count="3"] .difference{font-size:9px}
      .menu-wrap{position:relative;display:flex;align-items:center}.menu-btn{display:flex;align-items:center;justify-content:center;width:34px;height:32px;border:0;border-radius:8px;background:transparent;padding:0;color:#94a3b8;font:700 12px/1 Inter,ui-sans-serif,system-ui;cursor:pointer;flex-shrink:0}.menu-btn:hover,.menu-btn[aria-expanded="true"]{background:rgba(255,255,255,.09);color:#fff}.menu-btn:focus-visible,.city-toggle:focus-visible,.primary-label select:focus-visible,.close-btn:focus-visible{outline:2px solid #67e8f9;outline-offset:2px}.menu-icon{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .menu{position:absolute;right:0;top:30px;display:none;width:185px;border:1px solid rgba(148,163,184,.28);border-radius:11px;background:#0e1836;padding:9px;box-shadow:0 12px 28px rgba(2,6,23,.55);z-index:3}.menu.open{display:block}.menu-label,.primary-label>span{display:block;color:#cbd5e1;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.city-options{display:grid;gap:4px;margin-top:6px}.city-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;border:1px solid transparent;border-radius:7px;background:transparent;padding:7px 8px;color:#aab6d2;font:600 10px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.city-toggle:hover{background:rgba(255,255,255,.07);color:#fff}.city-toggle.selected{border-color:rgba(103,232,249,.2);background:rgba(56,189,248,.12);color:#fff}.city-toggle-state{color:#64748b;font-size:8px;font-weight:700}.city-toggle.selected .city-toggle-state{color:#67e8f9}.primary-label{display:block;margin-top:10px}.primary-label select{width:100%;margin-top:5px;border:1px solid rgba(148,163,184,.24);border-radius:7px;background:#111d43;padding:7px 8px;color:#fff;font:600 10px Inter,ui-sans-serif,system-ui;cursor:pointer}.close-btn{width:100%;margin-top:9px;border:1px solid rgba(248,113,113,.16);border-radius:7px;background:transparent;padding:7px 8px;color:#fca5a5;font:600 10px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
      @media (max-width:360px){.clock[data-count="3"]{min-height:128px}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:6px}.clock[data-count="3"] .city-block:last-child{grid-column:1/-1;width:50%;justify-self:center;border-top:1px solid rgba(148,163,184,.18);border-left:0;padding-top:6px}}
      .clock{height:auto;max-height:62px;min-height:0;overflow:visible;padding:3px 6px 4px;border-radius:8px;box-shadow:0 2px 8px rgba(2,6,23,.25),inset 0 1px 0 rgba(255,255,255,.06)}
      .clock-toolbar{position:relative;display:flex;align-items:center;justify-content:flex-start;height:10px;margin:0 0 1px;padding:0}.live-label{gap:3px;font-size:7px;line-height:1}.live{width:5px;height:5px}
      .clock-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:0;height:auto;padding:0}.clock[data-count="1"] .clock-grid{grid-template-columns:minmax(0,1fr)}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .city-block{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:0;min-width:0;padding:0 5px;text-align:center}.city-block+.city-block{border-left:0}.city-block+.city-block::before{position:absolute;top:50%;left:0;width:1px;height:31px;background:rgba(186,230,253,.2);content:"";transform:translateY(-50%)}
      .city-line{display:flex;align-items:center;justify-content:center;gap:2px;min-width:0;margin:0;color:#cbd5e1;font-size:9px;font-weight:700;line-height:1;white-space:nowrap}.city-name{min-width:0;white-space:nowrap}.clock-globe{width:8px;height:8px}.zone-pill{border-radius:3px;padding:1px 2px;font-size:7px;line-height:1}.city-time{display:block;margin:1px 0 0;color:#fff;font-size:16px;font-weight:700;line-height:.95;font-variant-numeric:tabular-nums;letter-spacing:-.035em;white-space:nowrap}.city-context{display:flex;align-items:center;justify-content:center;gap:3px;min-width:0;margin-top:1px;color:#a5b4fc;font-size:8px;font-weight:600;line-height:1;white-space:nowrap}.city-context [data-date]{color:#94a3b8}.city-context [data-difference]{color:inherit}.clock[data-count="3"] .city-time{font-size:16px}.clock[data-count="3"] .city-block{padding:0 5px}.clock[data-count="3"] .city-context{font-size:7.5px}
      .menu-wrap{position:absolute;top:-7px;right:0;width:24px;height:24px}.menu-btn{width:24px;height:24px}.menu-icon{width:11px;height:11px}
      .menu{top:26px;z-index:10}
      @media (max-width:360px){.clock[data-count="3"]{height:auto;max-height:62px;min-height:0}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:0}.clock[data-count="3"] .city-block:last-child{grid-column:auto;width:auto;border-top:0;border-left:0;padding-top:0}.clock[data-count="3"] .city-block:last-child::before{display:block}}
    </style>
    <section class="clock" data-count="${i.length}" aria-label="Reloj flotante de ${i.map(a=>a.city).join(", ")}">
      <div class="clock-toolbar"><span class="live-label"><i class="live"></i> En vivo</span><div class="menu-wrap"><button class="menu-btn" type="button" aria-label="Configurar reloj flotante" title="Configurar reloj flotante" aria-expanded="false"><svg class="menu-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>${ft(t)}</div></div>
      <div class="clock-grid">${i.map(gt).join("")}</div>
    </section>`;const l=r.querySelector(".clock"),m=r.querySelector(".menu-btn"),x=r.querySelector(".menu"),$=r.querySelector(".close-btn"),I=r.querySelector("[data-primary-select]");if(!l||!m||!x||!$||!I||!e)return;if(c=n,document.documentElement.appendChild(n),d.mode!=="viewport-ratio"){const a=S(d);d=U(a.x,a.y),R(d)}M(d),n.style.visibility="visible";const F=lt(),j=()=>{const a=new Date;i.forEach(s=>{var Z;const f=r.querySelector(`[data-zone-id="${s.id}"]`);if(!f)return;const h=F.zones[s.id],v=f.querySelector("[data-time]"),D=f.querySelector("[data-date]"),_=f.querySelector("[data-zone-label]"),B=f.querySelector("[data-difference]");v&&(v.textContent=h.time.format(a)),D&&(D.textContent=pt(h.date,a)),_&&(_.textContent=((Z=h.zone.formatToParts(a).find(et=>et.type==="timeZoneName"))==null?void 0:Z.value)||s.city),B&&(B.textContent=ut(a,s,e,F))})};m.addEventListener("click",a=>{a.stopPropagation();const s=x.classList.toggle("open");m.setAttribute("aria-expanded",String(s))}),m.addEventListener("pointerdown",a=>a.stopPropagation()),x.addEventListener("pointerdown",a=>a.stopPropagation());const A=()=>{x.classList.remove("open"),m.setAttribute("aria-expanded","false")},O=a=>{const s=a.composedPath();!s.includes(x)&&!s.includes(m)&&A()},P=a=>{a.key==="Escape"&&x.classList.contains("open")&&(A(),m.focus())};document.addEventListener("pointerdown",O,!0),document.addEventListener("keydown",P,!0),b=()=>{document.removeEventListener("pointerdown",O,!0),document.removeEventListener("keydown",P,!0)},r.querySelectorAll("[data-city-toggle]").forEach(a=>{a.addEventListener("click",()=>{const s=a.dataset.cityToggle;if(!s)return;const f=t.cities.includes(s);if(f&&t.cities.length===1)return;const h=f?t.cities.filter(v=>v!==s):[...t.cities,s];V({cities:h,primary:h.includes(t.primary)?t.primary:h[0]})})}),I.addEventListener("change",()=>{V({...t,primary:I.value})}),$.addEventListener("click",()=>{rt(!1),w()});let g=null;l.addEventListener("pointerdown",a=>{const s=S(d);g={pointerX:a.clientX,pointerY:a.clientY,x:s.x,y:s.y},l.setPointerCapture(a.pointerId),a.preventDefault()}),l.addEventListener("pointermove",a=>{if(!g)return;const s=g.x+(a.clientX-g.pointerX)*p,f=g.y+(a.clientY-g.pointerY)*p,h=L(s,f);n.style.left=`${h.x/p}px`,n.style.top=`${h.y/p}px`}),l.addEventListener("pointerup",a=>{if(!g)return;const s=g.x+(a.clientX-g.pointerX)*p,f=g.y+(a.clientY-g.pointerY)*p;g=null,l.releasePointerCapture(a.pointerId),d=U(s,f),M(d),R(d)}),j(),C=window.setInterval(j,1e3)}async function ht(){c&&(p=await X(),M(d))}async function N(){window===window.top&&(await nt()?await J():w())}N();window.addEventListener("resize",()=>{ht()});chrome.storage.onChanged.addListener((t,i)=>{if(i==="local"&&(q in t&&(t[q].newValue===!0?J():w()),it in t&&(w(),N()),Y in t&&c)){const e=t[Y].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(d={...e,expanded:!0},requestAnimationFrame(()=>M(d)))}});function xt(t,i){var l;if(window!==window.top)return;(l=document.getElementById("nexo-reminder-alert"))==null||l.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif"].join(";");const o=document.createElement("strong");o.textContent=t,o.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const n=document.createElement("div");n.textContent=i,n.style.cssText="color:#cffafe;font-size:13px";const r=document.createElement("button");r.type="button",r.textContent="×",r.setAttribute("aria-label","Cerrar recordatorio"),r.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",r.addEventListener("click",()=>e.remove()),e.append(o,n,r),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,i,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(xt(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function Q(){return Array.from(document.querySelectorAll('input[type="password"]'))}function bt(t){const i=t.form;if(!i)return null;const e=i.querySelectorAll('input:not([type="password"])');for(const o of e){const n=o,r=n.type.toLowerCase();if(r==="email"||r==="text"||n.name.toLowerCase().includes("user")||n.name.toLowerCase().includes("email")||n.name.toLowerCase().includes("login")||n.autocomplete==="username"||n.autocomplete==="email")return n}return null}function yt(t){var n;const i=(n=t.parentElement)==null?void 0:n.querySelector(".pv-autofill-btn");if(i)return i;const e=document.createElement("button");e.className="pv-autofill-btn",e.type="button",e.setAttribute("aria-label","Autocompletar con Nexo");const o=document.createElement("img");return o.src=chrome.runtime.getURL("public/icons/icon-source.svg"),o.alt="",o.width=20,o.height=20,o.setAttribute("aria-hidden","true"),e.appendChild(o),e.title="Nexo - Autocompletar",e.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),wt(t,e)}),e}async function wt(t,i){const e=document.querySelector(".pv-suggestions");e&&e.remove();const o=bt(t),n=document.createElement("div");n.className="pv-suggestions",vt(n,i),document.body.appendChild(n),E(n,"Buscando accesos…");try{const r=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});r!=null&&r.success?!Array.isArray(r.suggestions)||r.suggestions.length===0?E(n,"No hay accesos para este sitio"):(n.replaceChildren(),r.suggestions.forEach(l=>{const m=document.createElement("div");m.className="pv-suggestion-item pv-suggestion-clickable",m.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${kt(l.username)}</div>
          </div>
        `,m.addEventListener("click",()=>{o&&W(o,l.username),W(t,l.password),n.remove()}),n.appendChild(m)})):E(n,"Bóveda bloqueada — abre la extensión")}catch{E(n,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>n.remove(),{once:!0})},0)}function E(t,i){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=i,t.replaceChildren(e)}function W(t,i){var o;const e=(o=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:o.set;e==null||e.call(t,i),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function vt(t,i){const e=i.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function kt(t){const i=document.createElement("div");return i.textContent=t,i.innerHTML}function Et(){const t=document.createElement("style");t.textContent=`
    .pv-autofill-btn {
      position: absolute !important;
      right: 4px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 28px !important;
      height: 28px !important;
      padding: 0 !important;
      margin: 0 !important;
      border: none !important;
      border-radius: 6px !important;
      background: transparent !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2147483647 !important;
      opacity: 0.96 !important;
      transition: opacity 0.15s ease, transform 0.15s ease !important;
    }
    .pv-autofill-btn:hover {
      opacity: 1 !important;
      transform: translateY(-50%) scale(1.05) !important;
    }
    .pv-autofill-btn:focus-visible {
      outline: 2px solid #818cf8 !important;
      outline-offset: 2px !important;
    }
    .pv-autofill-btn img {
      display: block !important;
      width: 20px !important;
      height: 20px !important;
      border-radius: 5px !important;
      pointer-events: none !important;
    }
    .pv-suggestions {
      position: fixed !important;
      z-index: 2147483647 !important;
      min-width: 200px !important;
      max-width: 280px !important;
      background: white !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
      overflow: hidden !important;
      animation: pvFadeIn 0.15s ease-out !important;
    }
    .pv-suggestion-item {
      padding: 8px 12px !important;
      font-size: 13px !important;
      color: #334155 !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      border-bottom: 1px solid #f1f5f9 !important;
    }
    .pv-suggestion-item:last-child {
      border-bottom: none !important;
    }
    .pv-suggestion-clickable {
      cursor: pointer !important;
      transition: background 0.1s ease !important;
    }
    .pv-suggestion-clickable:hover {
      background: #f8fafc !important;
    }
    .pv-suggestion-icon {
      width: 28px !important;
      height: 28px !important;
      border-radius: 6px !important;
      background: #eef2ff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex-shrink: 0 !important;
    }
    .pv-suggestion-icon svg {
      color: #6366f1 !important;
    }
    .pv-suggestion-username {
      font-weight: 500 !important;
      font-size: 12px !important;
      color: #0f172a !important;
    }
    @keyframes pvFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,document.head.appendChild(t)}function tt(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const i=yt(t);(e=t.parentElement)==null||e.appendChild(i)}function Ct(){new MutationObserver(()=>{Q().forEach(tt)}).observe(document.body,{childList:!0,subtree:!0})}Et();Q().forEach(tt);Ct();
