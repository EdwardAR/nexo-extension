import{F as P,a as U,b as B,i as J,l as Q,c as tt,s as _,d as et,e as it}from"./floating-clock-CeoaKat2.js";import{T as x}from"./timezones-vgLoi8w3.js";const q="nexo-floating-clock-host",u=10,D={width:260,height:76};let c=null,k,p=1,d={x:1,y:.12,mode:"viewport-ratio",expanded:!0},w=null;function nt(t){return t===1?{width:200,height:76}:t===2?{width:270,height:76}:{width:350,height:80}}function ot(){if(w)return w;const t={year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"};return w={zones:Object.fromEntries(x.map(e=>[e.id,{time:new Intl.DateTimeFormat(e.locale,{timeZone:e.timeZone,hour:"2-digit",minute:"2-digit",hour12:!1}),zone:new Intl.DateTimeFormat("en-GB",{timeZone:e.timeZone,hour:"2-digit",hour12:!1,timeZoneName:"short"}),offset:new Intl.DateTimeFormat("en-CA",{...t,timeZone:e.timeZone})}]))},w}function rt(t){const i=t.cities.map(o=>x.find(n=>n.id===o)).filter(o=>!!o),e=i.find(o=>o.id===t.primary)||i[0];return e?[e,...i.filter(o=>o.id!==e.id)]:[x[0]]}function b(){k!==void 0&&window.clearInterval(k),k=void 0,c==null||c.remove(),c=null}async function H(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),i=Number(t==null?void 0:t.zoom);return Number.isFinite(i)&&i>0?i:1}catch{return 1}}function I(){return{width:window.innerWidth*p,height:window.innerHeight*p}}function S(){return{width:(c==null?void 0:c.offsetWidth)||D.width,height:(c==null?void 0:c.offsetHeight)||D.height}}function E(t,i){const e=I(),o=S();return{x:Math.max(u,Math.min(t,e.width-o.width-u)),y:Math.max(u,Math.min(i,e.height-o.height-u))}}function z(t){const i=I(),e=S();if(t.mode!=="viewport-ratio")return E(t.x*p,t.y*p);const o=Math.max(0,i.width-e.width-u*2),n=Math.max(0,i.height-e.height-u*2);return E(u+Math.max(0,Math.min(1,t.x))*o,u+Math.max(0,Math.min(1,t.y))*n)}function C(t){if(!c)return;d=t;const i=z(t);c.style.left=`${i.x/p}px`,c.style.top=`${i.y/p}px`,c.style.transform=`scale(${1/p})`}function Z(t,i){const e=I(),o=S(),n=E(t,i),a=Math.max(1,e.width-o.width-u*2),l=Math.max(1,e.height-o.height-u*2);return{x:Math.max(0,Math.min(1,(n.x-u)/a)),y:Math.max(0,Math.min(1,(n.y-u)/l)),mode:"viewport-ratio",expanded:!0}}function Y(t,i){const e=Object.fromEntries(i.formatToParts(t).map(n=>[n.type,n.value])),o=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((o-Math.floor(t.getTime()/1e3)*1e3)/36e5)}function at(t,i,e,o){if(i.id===e.id)return"Referencia";const n=Y(t,o.zones[i.id].offset)-Y(t,o.zones[e.id].offset);return n===0?`= ${e.city}`:`${n>0?"+":"−"}${Math.abs(n)} h ${e.city}`}function st(){return'<span class="clock-globe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg></span>'}function ct(t){return`<article class="city-block" data-zone-id="${t.id}" aria-label="Hora de ${t.city}">
    <div class="city-line">${st()}<span class="city-name">${t.city}</span><span class="zone-pill" data-zone-label>--</span></div>
    <strong class="city-time" data-time>--:--</strong>
    <span class="difference" data-difference>Referencia</span>
  </article>`}function lt(t){const i=x.map(o=>{const n=t.cities.includes(o.id);return`<button class="city-toggle${n?" selected":""}" type="button" data-city-toggle="${o.id}" aria-pressed="${n}"><span>${o.city}</span><span class="city-toggle-state">${n?"Visible":"Oculta"}</span></button>`}).join(""),e=x.filter(o=>t.cities.includes(o.id)).map(o=>`<option value="${o.id}"${o.id===t.primary?" selected":""}>${o.city}</option>`).join("");return`<div class="menu" role="dialog" aria-label="Configurar reloj flotante">
    <span class="menu-label">Ciudades visibles</span>
    <div class="city-options">${i}</div>
    <label class="primary-label"><span>Ciudad principal</span><select data-primary-select>${e}</select></label>
    <button class="close-btn" type="button">Desactivar reloj</button>
  </div>`}async function R(t){await it(t),b(),await T()}async function V(){if(window!==window.top||c||document.getElementById(q))return;p=await H();const t=await Q(),i=rt(t),e=i.find(r=>r.id===t.primary)||i[0],o=nt(i.length);d={...await tt()||d,expanded:!0};const n=document.createElement("aside");n.id=q,n.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${o.width}px`,`max-width:calc(100vw - ${u*2}px)`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const a=n.attachShadow({mode:"open"});a.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:100%;min-height:${o.height}px;border:1px solid rgba(148,163,184,.25);border-radius:13px;background:linear-gradient(135deg,#0d1735 0%,#111d43 58%,#17275a 100%);box-shadow:0 8px 22px rgba(2,6,23,.42),inset 0 1px 0 rgba(255,255,255,.07);color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}
      .clock:active{cursor:grabbing}.clock-toolbar{display:flex;align-items:center;justify-content:space-between;height:25px;padding:5px 8px 0;color:#94a3b8}.live-label{display:flex;align-items:center;gap:5px;font-size:8px;font-weight:800;letter-spacing:.1em;line-height:1;text-transform:uppercase}.live{width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 5px #34d399;flex-shrink:0}
      .clock-grid{display:grid;align-items:stretch;gap:0;padding:6px 9px 9px}.clock[data-count="1"] .clock-grid{grid-template-columns:minmax(0,1fr)}.clock[data-count="2"] .clock-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.city-block{display:grid;grid-template-rows:16px 25px 13px minmax(22px,auto);align-items:center;min-width:0;padding:0 6px;text-align:center}.city-block+.city-block{border-left:1px solid rgba(148,163,184,.18)}
      .city-line{display:flex;align-items:center;justify-content:center;gap:4px;min-width:0;color:#cbd5e1;font-size:10px;font-weight:700;letter-spacing:.01em;line-height:1;white-space:nowrap}.city-name{min-width:0;white-space:nowrap}.clock-globe{width:11px;height:11px;display:inline-flex;flex:none}.clock-globe svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.zone-pill{border-radius:4px;background:rgba(56,189,248,.14);padding:2px 4px;color:#bae6fd;font-size:8px;font-weight:800;line-height:1;white-space:nowrap}.city-time{display:block;color:#fff;font:750 21px/1 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-variant-numeric:tabular-nums;letter-spacing:-.045em;white-space:nowrap}.date-str{display:block;min-width:0;overflow:hidden;color:#94a3b8;font-size:9px;font-weight:600;line-height:1;white-space:nowrap;text-overflow:ellipsis}.difference{display:flex;align-items:center;justify-content:center;min-width:0;color:#a5b4fc;font-size:10px;font-weight:600;line-height:1.15;text-align:center}.clock[data-count="3"] .city-time{font-size:18px}.clock[data-count="3"] .city-block{padding:0 4px}.clock[data-count="3"] .difference{font-size:9px}
      .menu-wrap{position:relative;display:flex;align-items:center}.menu-btn{display:flex;align-items:center;justify-content:center;width:34px;height:32px;border:0;border-radius:8px;background:transparent;padding:0;color:#94a3b8;font:700 12px/1 Inter,ui-sans-serif,system-ui;cursor:pointer;flex-shrink:0}.menu-btn:hover,.menu-btn[aria-expanded="true"]{background:rgba(255,255,255,.09);color:#fff}.menu-btn:focus-visible,.city-toggle:focus-visible,.primary-label select:focus-visible,.close-btn:focus-visible{outline:2px solid #67e8f9;outline-offset:2px}.menu-icon{width:16px;height:16px;display:block;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .menu{position:absolute;right:0;top:30px;display:none;width:185px;border:1px solid rgba(148,163,184,.28);border-radius:11px;background:#0e1836;padding:9px;box-shadow:0 12px 28px rgba(2,6,23,.55);z-index:3}.menu.open{display:block}.menu-label,.primary-label>span{display:block;color:#cbd5e1;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.city-options{display:grid;gap:4px;margin-top:6px}.city-toggle{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;border:1px solid transparent;border-radius:7px;background:transparent;padding:7px 8px;color:#aab6d2;font:600 10px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.city-toggle:hover{background:rgba(255,255,255,.07);color:#fff}.city-toggle.selected{border-color:rgba(103,232,249,.2);background:rgba(56,189,248,.12);color:#fff}.city-toggle-state{color:#64748b;font-size:8px;font-weight:700}.city-toggle.selected .city-toggle-state{color:#67e8f9}.primary-label{display:block;margin-top:10px}.primary-label select{width:100%;margin-top:5px;border:1px solid rgba(148,163,184,.24);border-radius:7px;background:#111d43;padding:7px 8px;color:#fff;font:600 10px Inter,ui-sans-serif,system-ui;cursor:pointer}.close-btn{width:100%;margin-top:9px;border:1px solid rgba(248,113,113,.16);border-radius:7px;background:transparent;padding:7px 8px;color:#fca5a5;font:600 10px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
      @media (max-width:360px){.clock[data-count="3"]{min-height:128px}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(2,minmax(0,1fr));row-gap:6px}.clock[data-count="3"] .city-block:last-child{grid-column:1/-1;width:50%;justify-self:center;border-top:1px solid rgba(148,163,184,.18);border-left:0;padding-top:6px}}
      .clock{height:auto;min-height:0;overflow:hidden;padding:4px 6px 5px;border-radius:8px;box-shadow:0 2px 8px rgba(2,6,23,.25),inset 0 1px 0 rgba(255,255,255,.06)}
      .clock-toolbar{position:relative;display:flex;align-items:center;justify-content:flex-start;height:10px;margin:0 0 2px;padding:0}.live-label{gap:3px;font-size:7px;line-height:1}.live{width:5px;height:5px}
      .clock-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:0;height:auto;padding:0}.clock[data-count="1"] .clock-grid{grid-template-columns:minmax(0,1fr)}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .city-block{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:0;min-width:0;padding:0 6px;text-align:center}.city-block+.city-block{border-left:1px solid rgba(148,163,184,.16)}
      .city-line{display:flex;align-items:center;justify-content:center;gap:2px;min-width:0;margin:0;color:#cbd5e1;font-size:9px;font-weight:700;line-height:1;white-space:nowrap}.city-name{min-width:0;white-space:nowrap}.clock-globe{width:8px;height:8px}.zone-pill{border-radius:3px;padding:1px 2px;font-size:7px;line-height:1}.city-time{display:block;margin:1px 0;color:#fff;font-size:16px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.035em;white-space:nowrap}.difference{display:block;min-width:0;margin:0;color:#a5b4fc;font-size:8px;font-weight:600;line-height:1;white-space:nowrap}.clock[data-count="3"] .city-time{font-size:16px}.clock[data-count="3"] .city-block{padding:0 5px}.clock[data-count="3"] .difference{font-size:8px}
      .menu-wrap{position:absolute;top:-7px;right:0;width:24px;height:24px}.menu-btn{width:24px;height:24px}.menu-icon{width:12px;height:12px}
      .menu{top:26px}
      @media (max-width:360px){.clock[data-count="3"]{height:auto;min-height:0}.clock[data-count="3"] .clock-grid{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:0}.clock[data-count="3"] .city-block:last-child{grid-column:auto;width:auto;border-top:0;border-left:1px solid rgba(148,163,184,.16);padding-top:0}}
    </style>
    <section class="clock" data-count="${i.length}" aria-label="Reloj flotante de ${i.map(r=>r.city).join(", ")}">
      <div class="clock-toolbar"><span class="live-label"><i class="live"></i> En vivo</span><div class="menu-wrap"><button class="menu-btn" type="button" aria-label="Configurar reloj flotante" title="Configurar reloj flotante" aria-expanded="false"><svg class="menu-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>${lt(t)}</div></div>
      <div class="clock-grid">${i.map(ct).join("")}</div>
    </section>`;const l=a.querySelector(".clock"),f=a.querySelector(".menu-btn"),M=a.querySelector(".menu"),$=a.querySelector(".close-btn"),L=a.querySelector("[data-primary-select]");if(!l||!f||!M||!$||!L||!e)return;if(c=n,document.documentElement.appendChild(n),d.mode!=="viewport-ratio"){const r=z(d);d=Z(r.x,r.y),_(d)}C(d),n.style.visibility="visible";const N=ot(),j=()=>{const r=new Date;i.forEach(s=>{var A;const g=a.querySelector(`[data-zone-id="${s.id}"]`);if(!g)return;const h=N.zones[s.id],y=g.querySelector("[data-time]"),F=g.querySelector("[data-zone-label]"),O=g.querySelector("[data-difference]");y&&(y.textContent=h.time.format(r)),F&&(F.textContent=((A=h.zone.formatToParts(r).find(X=>X.type==="timeZoneName"))==null?void 0:A.value)||s.city),O&&(O.textContent=at(r,s,e,N))})};f.addEventListener("click",r=>{r.stopPropagation();const s=M.classList.toggle("open");f.setAttribute("aria-expanded",String(s))}),f.addEventListener("pointerdown",r=>r.stopPropagation()),M.addEventListener("pointerdown",r=>r.stopPropagation()),a.querySelectorAll("[data-city-toggle]").forEach(r=>{r.addEventListener("click",()=>{const s=r.dataset.cityToggle;if(!s)return;const g=t.cities.includes(s);if(g&&t.cities.length===1)return;const h=g?t.cities.filter(y=>y!==s):[...t.cities,s];R({cities:h,primary:h.includes(t.primary)?t.primary:h[0]})})}),L.addEventListener("change",()=>{R({...t,primary:L.value})}),$.addEventListener("click",()=>{et(!1),b()});let m=null;l.addEventListener("pointerdown",r=>{const s=z(d);m={pointerX:r.clientX,pointerY:r.clientY,x:s.x,y:s.y},l.setPointerCapture(r.pointerId),r.preventDefault()}),l.addEventListener("pointermove",r=>{if(!m)return;const s=m.x+(r.clientX-m.pointerX)*p,g=m.y+(r.clientY-m.pointerY)*p,h=E(s,g);n.style.left=`${h.x/p}px`,n.style.top=`${h.y/p}px`}),l.addEventListener("pointerup",r=>{if(!m)return;const s=m.x+(r.clientX-m.pointerX)*p,g=m.y+(r.clientY-m.pointerY)*p;m=null,l.releasePointerCapture(r.pointerId),d=Z(s,g),C(d),_(d)}),j(),k=window.setInterval(j,1e3)}async function dt(){c&&(p=await H(),C(d))}async function T(){window===window.top&&(await J()?await V():b())}T();window.addEventListener("resize",()=>{dt()});chrome.storage.onChanged.addListener((t,i)=>{if(i==="local"&&(P in t&&(t[P].newValue===!0?V():b()),U in t&&(b(),T()),B in t&&c)){const e=t[B].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(d={...e,expanded:!0},requestAnimationFrame(()=>C(d)))}});function pt(t,i){var l;if(window!==window.top)return;(l=document.getElementById("nexo-reminder-alert"))==null||l.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif"].join(";");const o=document.createElement("strong");o.textContent=t,o.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const n=document.createElement("div");n.textContent=i,n.style.cssText="color:#cffafe;font-size:13px";const a=document.createElement("button");a.type="button",a.textContent="×",a.setAttribute("aria-label","Cerrar recordatorio"),a.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",a.addEventListener("click",()=>e.remove()),e.append(o,n,a),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,i,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(pt(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function K(){return Array.from(document.querySelectorAll('input[type="password"]'))}function ut(t){const i=t.form;if(!i)return null;const e=i.querySelectorAll('input:not([type="password"])');for(const o of e){const n=o,a=n.type.toLowerCase();if(a==="email"||a==="text"||n.name.toLowerCase().includes("user")||n.name.toLowerCase().includes("email")||n.name.toLowerCase().includes("login")||n.autocomplete==="username"||n.autocomplete==="email")return n}return null}function mt(t){var o;const i=(o=t.parentElement)==null?void 0:o.querySelector(".pv-autofill-btn");if(i)return i;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),gt(t,e)}),e}async function gt(t,i){const e=document.querySelector(".pv-suggestions");e&&e.remove();const o=ut(t),n=document.createElement("div");n.className="pv-suggestions",ft(n,i),document.body.appendChild(n),v(n,"Buscando accesos…");try{const a=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});a!=null&&a.success?!Array.isArray(a.suggestions)||a.suggestions.length===0?v(n,"No hay accesos para este sitio"):(n.replaceChildren(),a.suggestions.forEach(l=>{const f=document.createElement("div");f.className="pv-suggestion-item pv-suggestion-clickable",f.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${ht(l.username)}</div>
          </div>
        `,f.addEventListener("click",()=>{o&&G(o,l.username),G(t,l.password),n.remove()}),n.appendChild(f)})):v(n,"Bóveda bloqueada — abre la extensión")}catch{v(n,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>n.remove(),{once:!0})},0)}function v(t,i){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=i,t.replaceChildren(e)}function G(t,i){var o;const e=(o=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:o.set;e==null||e.call(t,i),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ft(t,i){const e=i.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function ht(t){const i=document.createElement("div");return i.textContent=t,i.innerHTML}function xt(){const t=document.createElement("style");t.textContent=`
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
      background: #6366f1 !important;
      color: white !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 2147483647 !important;
      opacity: 0.9 !important;
      transition: opacity 0.15s ease !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important;
    }
    .pv-autofill-btn:hover {
      opacity: 1 !important;
      background: #4f46e5 !important;
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
  `,document.head.appendChild(t)}function W(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const i=mt(t);(e=t.parentElement)==null||e.appendChild(i)}function bt(){new MutationObserver(()=>{K().forEach(W)}).observe(document.body,{childList:!0,subtree:!0})}xt();K().forEach(W);bt();
