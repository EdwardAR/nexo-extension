import{F as Y,a as G,i as nt,l as it,s as H,b as rt}from"./floating-clock-hcteuHpy.js";const W="nexo-floating-clock-host",P=540,f=10;let c=null,A,u=1,p={x:1,y:.12,mode:"viewport-ratio",expanded:!0};function D(){A!==void 0&&window.clearInterval(A),A=void 0,c==null||c.remove(),c=null}async function K(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),o=Number(t==null?void 0:t.zoom);return Number.isFinite(o)&&o>0?o:1}catch{return 1}}function _(){return{width:window.innerWidth*u,height:window.innerHeight*u}}function F(){return{width:(c==null?void 0:c.offsetWidth)||P,height:(c==null?void 0:c.offsetHeight)||96}}function I(t,o){const e=_(),i=F();return{x:Math.max(f,Math.min(t,e.width-i.width-f)),y:Math.max(f,Math.min(o,e.height-i.height-f))}}function R(t){const o=_(),e=F();if(t.mode!=="viewport-ratio")return I(t.x*u,t.y*u);const i=Math.max(0,o.width-e.width-f*2),n=Math.max(0,o.height-e.height-f*2);return I(f+Math.max(0,Math.min(1,t.x))*i,f+Math.max(0,Math.min(1,t.y))*n)}function z(t){if(!c)return;p=t;const o=R(t);c.style.left=`${o.x/u}px`,c.style.top=`${o.y/u}px`,c.style.transform=`scale(${1/u})`}function Z(t,o){const e=_(),i=F(),n=I(t,o),r=Math.max(1,e.width-i.width-f*2),s=Math.max(1,e.height-i.height-f*2);return{x:Math.max(0,Math.min(1,(n.x-f)/r)),y:Math.max(0,Math.min(1,(n.y-f)/s)),mode:"viewport-ratio",expanded:!0}}function V(t,o){const e=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:o,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(t).map(n=>[n.type,n.value])),i=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((i-Math.floor(t.getTime()/1e3)*1e3)/36e5)}async function J(){var S;if(window!==window.top||c||document.getElementById(W))return;u=await K(),p={...await it()||p,expanded:!0};const t=document.createElement("aside");t.id=W,t.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${P}px`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const o=t.attachShadow({mode:"open"});o.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:${P}px;overflow:visible;border:1px solid rgba(148,163,184,.32);border-radius:13px;background:radial-gradient(circle at 82% 0%,rgba(49,46,129,.2),transparent 45%),linear-gradient(110deg,#070b1c 0%,#11162e 55%,#17203d 100%);box-shadow:0 12px 28px rgba(2,6,23,.42);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .drag{display:flex;height:31px;align-items:end;padding:8px 15px 0;cursor:grab;user-select:none}.drag:active{cursor:grabbing}.brand{display:flex;align-items:center;gap:9px;color:#f8fafc;font-size:12px;font-weight:800;letter-spacing:.035em;text-transform:uppercase}.live{width:9px;height:9px;border-radius:50%;background:#34d399;box-shadow:0 0 10px #34d399}
      .content{display:grid;grid-template-columns:44px 165px 1px 68px 1px 50px 1px 84px 22px;gap:8px;align-items:center;padding:5px 12px 11px}.badge{display:grid;width:44px;height:44px;place-items:center;border:1px solid #d9a514;border-radius:9px;background:rgba(15,23,42,.62);font-size:17px;font-weight:800}.primary{min-width:0}.time-row{display:flex;align-items:center;gap:6px}.time{font:800 23px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.045em}.zone{border-radius:8px;background:linear-gradient(180deg,#25476b,#17304c);padding:5px 7px;color:#e0f2fe;font-size:10px;font-weight:800;box-shadow:inset 0 1px rgba(255,255,255,.08)}.date{display:block;margin-top:5px;overflow:hidden;color:#b8c0d4;font-size:11px;font-weight:500;line-height:1;text-overflow:ellipsis;white-space:nowrap}.separator{width:1px;height:42px;background:rgba(148,163,184,.3)}.tile{min-width:0}.label{display:block;overflow:hidden;color:#cbd5e1;font-size:10px;font-weight:500;line-height:1.1;text-overflow:ellipsis;white-space:nowrap}.value{display:block;margin-top:6px;color:#f8fafc;font-size:16px;font-weight:800;line-height:1;white-space:nowrap}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.work{font-size:14px}.actions{position:relative;display:grid;place-items:center}.menu-button{border:0;border-radius:7px;background:transparent;padding:3px 7px;color:#9ca3b7;font:800 24px/1 system-ui;cursor:pointer}.menu-button:hover,.menu-button[aria-expanded="true"]{background:rgba(255,255,255,.08);color:#fff}.menu{position:absolute;right:-5px;top:36px;display:none;min-width:92px;border:1px solid rgba(148,163,184,.26);border-radius:8px;background:#111827;padding:4px;box-shadow:0 10px 24px rgba(2,6,23,.45);z-index:2}.menu.open{display:block}.close{width:100%;border:0;border-radius:5px;background:transparent;padding:6px 8px;color:#fecaca;font:600 10px system-ui;text-align:left;cursor:pointer}.close:hover{background:rgba(248,113,113,.14)}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="drag" title="Arrastra para mover"><span class="brand"><i class="live"></i>Madrid - España</span></div>
      <div class="content"><span class="badge">ES</span><div class="primary"><span class="time-row"><span class="time">--:--:--</span><span class="zone">CEST</span></span><span class="date"></span></div><i class="separator"></i><div class="tile"><span class="label">PC Lima</span><strong class="value mono lima">--:--</strong></div><i class="separator"></i><div class="tile"><span class="label">Dif.</span><strong class="value difference">+7 h</strong></div><i class="separator"></i><div class="tile"><span class="label">Estado</span><strong class="value work">Laboral</strong></div><div class="actions"><button class="menu-button" type="button" aria-label="Opciones del reloj" aria-expanded="false">⋮</button><div class="menu"><button class="close" type="button">Desactivar</button></div></div></div>
    </section>`;const e=o.querySelector(".drag"),i=o.querySelector(".time"),n=o.querySelector(".date"),r=o.querySelector(".lima"),s=o.querySelector(".difference"),l=o.querySelector(".zone"),b=o.querySelector(".work"),w=o.querySelector(".menu-button"),M=o.querySelector(".menu");if(!e||!i||!n||!r||!s||!l||!b||!w||!M)return;if(c=t,document.documentElement.appendChild(t),p.mode!=="viewport-ratio"){const a=R(p);p=Z(a.x,a.y),H(p)}z(p),t.style.visibility="visible";const h=()=>{var B,U;const a=new Date;i.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(a);const y=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(a).replace(/\./g,"");n.textContent=y.charAt(0).toUpperCase()+y.slice(1),r.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}).format(a);const C=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}).formatToParts(a),T=Number(((B=C.find($=>$.type==="hour"))==null?void 0:B.value)||0);l.textContent=((U=C.find($=>$.type==="timeZoneName"))==null?void 0:U.value)||"Madrid";const q=V(a,"Europe/Madrid")-V(a,"America/Lima");s.textContent=`${q>=0?"+":""}${q} h`;const j=T>=9&&T<18;b.textContent=j?"Laboral":"No laboral",b.style.color=j?"#6ee7b7":"#fcd34d"};w.addEventListener("click",()=>{const a=M.classList.toggle("open");w.setAttribute("aria-expanded",String(a))});let d=null;e.addEventListener("pointerdown",a=>{const y=R(p);d={pointerX:a.clientX,pointerY:a.clientY,x:y.x,y:y.y},e.setPointerCapture(a.pointerId),a.preventDefault()}),e.addEventListener("pointermove",a=>{if(!d)return;const y=d.x+(a.clientX-d.pointerX)*u,C=d.y+(a.clientY-d.pointerY)*u,T=I(y,C);t.style.left=`${T.x/u}px`,t.style.top=`${T.y/u}px`}),e.addEventListener("pointerup",a=>{if(!d)return;const y=d.x+(a.clientX-d.pointerX)*u,C=d.y+(a.clientY-d.pointerY)*u;d=null,e.releasePointerCapture(a.pointerId),p=Z(y,C),z(p),H(p)}),(S=o.querySelector(".close"))==null||S.addEventListener("click",()=>{rt(!1),D()}),h(),A=window.setInterval(h,1e3)}async function at(){c&&(u=await K(),z(p))}async function st(){window===window.top&&(await nt()?await J():D())}st();window.addEventListener("resize",()=>{at()});chrome.storage.onChanged.addListener((t,o)=>{if(o==="local"&&(Y in t&&(t[Y].newValue===!0?J():D()),G in t&&c)){const e=t[G].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(p={...e,expanded:!0},requestAnimationFrame(()=>z(p)))}});function lt(t,o){var s;if(window!==window.top)return;(s=document.getElementById("nexo-reminder-alert"))==null||s.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.45 system-ui,-apple-system,sans-serif"].join(";");const i=document.createElement("strong");i.textContent=`🔔 ${t}`,i.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const n=document.createElement("div");n.textContent=o,n.style.cssText="color:#cffafe;font-size:13px";const r=document.createElement("button");r.type="button",r.textContent="×",r.setAttribute("aria-label","Cerrar recordatorio"),r.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",r.addEventListener("click",()=>e.remove()),e.append(i,n,r),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,o,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(lt(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function Q(){return Array.from(document.querySelectorAll('input[type="password"]'))}function ct(t){const o=t.form;if(!o)return null;const e=o.querySelectorAll('input:not([type="password"])');for(const i of e){const n=i,r=n.type.toLowerCase();if(r==="email"||r==="text"||n.name.toLowerCase().includes("user")||n.name.toLowerCase().includes("email")||n.name.toLowerCase().includes("login")||n.autocomplete==="username"||n.autocomplete==="email")return n}return null}function dt(t){var i;const o=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(o)return o;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),pt(t,e)}),e}async function pt(t,o){const e=document.querySelector(".pv-suggestions");e&&e.remove();const i=ct(t),n=document.createElement("div");n.className="pv-suggestions",ut(n,o),document.body.appendChild(n),L(n,"Buscando accesos…");try{const r=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});r!=null&&r.success?!Array.isArray(r.suggestions)||r.suggestions.length===0?L(n,"No hay accesos para este sitio"):(n.replaceChildren(),r.suggestions.forEach(s=>{const l=document.createElement("div");l.className="pv-suggestion-item pv-suggestion-clickable",l.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${mt(s.username)}</div>
          </div>
        `,l.addEventListener("click",()=>{i&&X(i,s.username),X(t,s.password),n.remove()}),n.appendChild(l)})):L(n,"Bóveda bloqueada — abre la extensión")}catch{L(n,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>n.remove(),{once:!0})},0)}function L(t,o){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=o,t.replaceChildren(e)}function X(t,o){var i;const e=(i=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:i.set;e==null||e.call(t,o),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ut(t,o){const e=o.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function mt(t){const o=document.createElement("div");return o.textContent=t,o.innerHTML}function ft(){const t=document.createElement("style");t.textContent=`
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
    .pv-recorded-click {
      position: fixed !important;
      z-index: 2147483646 !important;
      width: 26px !important;
      height: 26px !important;
      border: 3px solid #6366f1 !important;
      border-radius: 999px !important;
      background: rgba(99, 102, 241, 0.18) !important;
      pointer-events: none !important;
      transform: translate(-50%, -50%) scale(0.35);
      animation: pvRecordedClick 0.62s ease-out forwards !important;
    }
    .pv-recorded-click-disabled {
      border-color: #f59e0b !important;
      background: rgba(245, 158, 11, 0.2) !important;
    }
    @keyframes pvFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pvRecordedClick {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(0.35); }
      75% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.35); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.65); }
    }
  `,document.head.appendChild(t)}function tt(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const o=dt(t);(e=t.parentElement)==null||e.appendChild(o)}function gt(){new MutationObserver(()=>{Q().forEach(tt)}).observe(document.body,{childList:!0,subtree:!0})}let N=!1,v=0,m=0,g=0,O=null,x=null;function E(t){return CSS.escape(t)}function xt(t){try{return document.querySelectorAll(t).length===1}catch{return!1}}function bt(t){const o=[],e=l=>{l&&xt(l)&&!o.includes(l)&&o.push(l)};t.id&&e(`#${E(t.id)}`);for(const l of["data-control-name","data-testid","data-test","data-cy","aria-label","name","title"]){const b=t.getAttribute(l);b&&(e(`${t.tagName.toLowerCase()}[${l}="${E(b)}"]`),e(`[${l}="${E(b)}"]`))}const i=t.getAttribute("role"),n=t.getAttribute("aria-label");i&&n&&e(`[role="${E(i)}"][aria-label="${E(n)}"]`);const r=[];let s=t;for(;s&&s!==document.documentElement&&r.length<7;){let l=s.tagName.toLowerCase();const b=Array.from(s.classList).filter(h=>!h.startsWith("pv-")&&!/\d{3,}/.test(h)).slice(0,2);b.length&&(l+=b.map(h=>`.${E(h)}`).join(""));const w=s.parentElement;if(w){const h=s.tagName,d=Array.from(w.children).filter(S=>S.tagName===h);d.length>1&&(l+=`:nth-of-type(${d.indexOf(s)+1})`)}r.unshift(l);const M=r.join(" > ");e(M),s=w}return o}function ht(t){var o;return t.getAttribute("data-control-name")||t.getAttribute("aria-label")||t.getAttribute("title")||((o=t.textContent)==null?void 0:o.trim().replace(/\s+/g," ").slice(0,80))||t.tagName.toLowerCase()}function et(t){return t.matches(":disabled")||t.getAttribute("aria-disabled")==="true"||"disabled"in t&&!!t.disabled}function yt(t){const o=t.composedPath().filter(i=>i instanceof Element),e=["[data-control-name]","[data-testid]","button","a","input","select",'[role="button"]','[role="menuitem"]','[role="option"]','[role="tab"]',"[onclick]","[tabindex]"].join(",");for(const i of o){if(i.matches(e))return i;const n=i.closest(e);if(n)return n}return o[0]||null}function wt(t,o){const e=document.createElement("span");e.className=`pv-recorded-click${o?" pv-recorded-click-disabled":""}`,e.style.left=`${t.clientX}px`,e.style.top=`${t.clientY}px`,document.documentElement.appendChild(e),setTimeout(()=>e.remove(),650)}function k(){O&&(O.textContent=String(v))}function ot(t=0){if(m=Math.max(m,t),v=m+g,N=!0,window!==window.top)return;if(document.querySelector("[data-pv-automation-toolbar]")){k();return}const e=document.createElement("div");e.dataset.pvAutomationToolbar="true",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483647","display:grid","grid-template-columns:auto 1fr","gap:10px 12px","padding:12px","min-width:250px","border:1px solid rgba(255,255,255,.14)","border-radius:16px","background:linear-gradient(145deg,#0f172a,#1e293b)","color:white","font:600 13px/1.2 system-ui,sans-serif","box-shadow:0 16px 42px rgba(15,23,42,.38)"].join(";"),e.innerHTML=`
    <span style="grid-row:1/3;display:flex;width:42px;height:42px;align-items:center;justify-content:center;border-radius:12px;background:rgba(239,68,68,.14)">
      <span style="width:11px;height:11px;border-radius:999px;background:#ef4444;box-shadow:0 0 0 5px rgba(239,68,68,.16)"></span>
    </span>
    <span style="display:flex;align-items:center;justify-content:space-between;gap:16px">
      <span style="font-size:12px;color:#cbd5e1">Grabando secuencia</span>
      <strong style="display:flex;align-items:baseline;gap:4px;color:#fff">
        <span data-pv-recording-count style="font-size:20px;line-height:1">0</span>
        <small style="font-size:10px;color:#94a3b8">CLICS</small>
      </strong>
    </span>
    <span data-pv-recording-last style="max-width:185px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:#94a3b8">Esperando el primer clic…</span>
    <button data-pv-stop-recording style="grid-column:1/3;border:0;border-radius:10px;padding:9px 12px;background:#fff;color:#0f172a;font:700 12px system-ui;cursor:pointer">Terminar y guardar</button>
  `,document.documentElement.appendChild(e),O=e.querySelector("[data-pv-recording-count]"),x=e.querySelector("[data-pv-recording-last]"),k();const i=e.querySelector("[data-pv-stop-recording]");i==null||i.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation(),N=!1,i.disabled=!0,i.textContent="Guardando secuencia…";try{const r=await chrome.runtime.sendMessage({action:"FINISH_AUTOMATION_RECORDING"});if(!(r!=null&&r.success))throw new Error((r==null?void 0:r.error)||"No se pudo guardar");e.remove(),O=null,x=null,v=0,m=0,g=0}catch{N=!0,i.disabled=!1,i.textContent="Reintentar guardar",x&&(x.textContent="No se pudo guardar. Inténtalo otra vez.",x.style.color="#fca5a5")}})}window.addEventListener("pointerdown",t=>{if(!N||t.button!==0||!t.isPrimary)return;const o=yt(t);if(!o||o.closest("[data-pv-automation-toolbar], #nexo-floating-clock-host, #nexo-reminder-alert"))return;const e=bt(o);if(!e.length)return;const i=ht(o),n=et(o);wt(t,n),g+=1,v=m+g,x&&(x.textContent=n?`Último: ${i} · deshabilitado`:`Último: ${i}`,x.style.color=n?"#fbbf24":"#94a3b8"),k(),chrome.runtime.sendMessage({action:"RECORD_AUTOMATION_CLICK",step:{selector:e[0],fallbackSelectors:e.slice(1),pageUrl:window.location.href,frameUrl:window.location.href,label:i,disabledWhenRecorded:n}}).then(r=>{g=Math.max(0,g-1),r!=null&&r.success&&typeof r.count=="number"&&(m=Math.max(m,r.count)),v=m+g,k()}).catch(()=>{g=Math.max(0,g-1),v=m+g,k()})},!0);function vt(t){let o=null;for(const i of t){const n=document.querySelector(i);if(n instanceof HTMLElement){o=n;break}}if(!o)return{accepted:!1,retryable:!0,error:`No se encontró el elemento: ${t[0]}`};if(et(o))return{accepted:!1,retryable:!0,error:"El control continúa deshabilitado"};o.scrollIntoView({behavior:"smooth",block:"center"});const e=o.style.outline;return o.style.outline="3px solid #6366f1",setTimeout(()=>{o.click(),setTimeout(()=>{o.style.outline=e},500)},100),{accepted:!0,success:!0}}chrome.runtime.onMessage.addListener((t,o,e)=>{if(t.action==="START_CLICK_RECORDING"){ot(t.count||0),e({success:!0});return}if(t.action==="PLAY_AUTOMATION_STEP"){e(vt([t.selector,...Array.isArray(t.fallbackSelectors)?t.fallbackSelectors:[]]));return}t.action==="UPDATE_RECORDING_COUNT"&&window===window.top&&(typeof t.count=="number"&&(m=Math.max(m,t.count),v=m+g,k()),x&&t.label&&(x.textContent=t.disabledWhenRecorded?`Último: ${t.label} · deshabilitado`:`Último: ${t.label}`,x.style.color=t.disabledWhenRecorded?"#fbbf24":"#94a3b8"),e({success:!0}))});chrome.runtime.sendMessage({action:"GET_ACTIVE_RECORDING"}).then(t=>{t!=null&&t.active&&ot(t.count||0)}).catch(()=>{});ft();Q().forEach(tt);gt();
