import{F as N,a as A,i as R,l as Z,s as F,b as H}from"./floating-clock-hcteuHpy.js";const P="nexo-floating-clock-host",E=370,p=10;let s=null,b,c=1,d={x:1,y:.12,mode:"viewport-ratio",expanded:!0};function C(){b!==void 0&&window.clearInterval(b),b=void 0,s==null||s.remove(),s=null}async function _(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),n=Number(t==null?void 0:t.zoom);return Number.isFinite(n)&&n>0?n:1}catch{return 1}}function M(){return{width:window.innerWidth*c,height:window.innerHeight*c}}function L(){return{width:(s==null?void 0:s.offsetWidth)||E,height:(s==null?void 0:s.offsetHeight)||96}}function v(t,n){const e=M(),i=L();return{x:Math.max(p,Math.min(t,e.width-i.width-p)),y:Math.max(p,Math.min(n,e.height-i.height-p))}}function k(t){const n=M(),e=L();if(t.mode!=="viewport-ratio")return v(t.x*c,t.y*c);const i=Math.max(0,n.width-e.width-p*2),o=Math.max(0,n.height-e.height-p*2);return v(p+Math.max(0,Math.min(1,t.x))*i,p+Math.max(0,Math.min(1,t.y))*o)}function y(t){if(!s)return;d=t;const n=k(t);s.style.left=`${n.x/c}px`,s.style.top=`${n.y/c}px`,s.style.transform=`scale(${1/c})`}function D(t,n){const e=M(),i=L(),o=v(t,n),a=Math.max(1,e.width-i.width-p*2),m=Math.max(1,e.height-i.height-p*2);return{x:Math.max(0,Math.min(1,(o.x-p)/a)),y:Math.max(0,Math.min(1,(o.y-p)/m)),mode:"viewport-ratio",expanded:!0}}function O(t,n){const e=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:n,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(t).map(o=>[o.type,o.value])),i=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((i-Math.floor(t.getTime()/1e3)*1e3)/36e5)}async function B(){var z;if(window!==window.top||s||document.getElementById(P))return;c=await _(),d={...await Z()||d,expanded:!0};const t=document.createElement("aside");t.id=P,t.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${E}px`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const n=t.attachShadow({mode:"open"});n.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:${E}px;overflow:visible;border:1px solid rgba(148,163,184,.32);border-radius:11px;background:radial-gradient(circle at 82% 0%,rgba(49,46,129,.2),transparent 45%),linear-gradient(110deg,#070b1c 0%,#11162e 55%,#17203d 100%);box-shadow:0 8px 20px rgba(2,6,23,.42);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .drag{display:flex;height:24px;align-items:end;padding:6px 11px 0;cursor:grab;user-select:none}.drag:active{cursor:grabbing}.brand{display:flex;align-items:center;gap:7px;color:#f8fafc;font-size:10px;font-weight:800;letter-spacing:.035em;text-transform:uppercase}.live{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399}
      .content{display:grid;grid-template-columns:34px 1fr 1px 58px 1px 48px 18px;gap:6px;align-items:center;padding:4px 10px 9px}.badge{display:grid;width:34px;height:34px;place-items:center;border:1px solid #d9a514;border-radius:7px;background:rgba(15,23,42,.62);font-size:13px;font-weight:800}.primary{min-width:0}.time-row{display:flex;align-items:center;gap:5px}.time{font:800 20px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.045em}.zone{border-radius:6px;background:linear-gradient(180deg,#25476b,#17304c);padding:3px 6px;color:#e0f2fe;font-size:9px;font-weight:800;box-shadow:inset 0 1px rgba(255,255,255,.08)}.date{display:block;margin-top:4px;overflow:hidden;color:#b8c0d4;font-size:10px;font-weight:500;line-height:1;text-overflow:ellipsis;white-space:nowrap}.separator{width:1px;height:34px;background:rgba(148,163,184,.3)}.tile{min-width:0}.label{display:block;overflow:hidden;color:#cbd5e1;font-size:9px;font-weight:500;line-height:1.1;text-overflow:ellipsis;white-space:nowrap}.value{display:block;margin-top:4px;color:#f8fafc;font-size:13px;font-weight:800;line-height:1;white-space:nowrap}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.actions{position:relative;display:grid;place-items:center}.menu-button{border:0;border-radius:6px;background:transparent;padding:2px 5px;color:#9ca3b7;font:800 20px/1 system-ui;cursor:pointer}.menu-button:hover,.menu-button[aria-expanded="true"]{background:rgba(255,255,255,.08);color:#fff}.menu{position:absolute;right:-5px;top:28px;display:none;min-width:88px;border:1px solid rgba(148,163,184,.26);border-radius:7px;background:#111827;padding:4px;box-shadow:0 8px 20px rgba(2,6,23,.45);z-index:2}.menu.open{display:block}.close{width:100%;border:0;border-radius:4px;background:transparent;padding:5px 7px;color:#fecaca;font:600 9px system-ui;text-align:left;cursor:pointer}.close:hover{background:rgba(248,113,113,.14)}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="drag" title="Arrastra para mover"><span class="brand"><i class="live"></i>Madrid - España</span></div>
      <div class="content"><span class="badge">ES</span><div class="primary"><span class="time-row"><span class="time">--:--:--</span><span class="zone">CEST</span></span><span class="date"></span></div><i class="separator"></i><div class="tile"><span class="label">PC Lima</span><strong class="value mono lima">--:--</strong></div><i class="separator"></i><div class="tile"><span class="label">Dif.</span><strong class="value difference">+7 h</strong></div><div class="actions"><button class="menu-button" type="button" aria-label="Opciones del reloj" aria-expanded="false">⋮</button><div class="menu"><button class="close" type="button">Desactivar</button></div></div></div>
    </section>`;const e=n.querySelector(".drag"),i=n.querySelector(".time"),o=n.querySelector(".date"),a=n.querySelector(".lima"),m=n.querySelector(".difference"),g=n.querySelector(".zone"),w=n.querySelector(".menu-button"),T=n.querySelector(".menu");if(!e||!i||!o||!a||!m||!g||!w||!T)return;if(s=t,document.documentElement.appendChild(t),d.mode!=="viewport-ratio"){const r=k(d);d=D(r.x,r.y),F(d)}y(d),t.style.visibility="visible";const S=()=>{var I;const r=new Date;i.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(r);const u=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(r).replace(/\./g,"");o.textContent=u.charAt(0).toUpperCase()+u.slice(1),a.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}).format(r);const f=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}).formatToParts(r);g.textContent=((I=f.find(Y=>Y.type==="timeZoneName"))==null?void 0:I.value)||"Madrid";const x=O(r,"Europe/Madrid")-O(r,"America/Lima");m.textContent=`${x>=0?"+":""}${x} h`};w.addEventListener("click",()=>{const r=T.classList.toggle("open");w.setAttribute("aria-expanded",String(r))});let l=null;e.addEventListener("pointerdown",r=>{const u=k(d);l={pointerX:r.clientX,pointerY:r.clientY,x:u.x,y:u.y},e.setPointerCapture(r.pointerId),r.preventDefault()}),e.addEventListener("pointermove",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*c,f=l.y+(r.clientY-l.pointerY)*c,x=v(u,f);t.style.left=`${x.x/c}px`,t.style.top=`${x.y/c}px`}),e.addEventListener("pointerup",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*c,f=l.y+(r.clientY-l.pointerY)*c;l=null,e.releasePointerCapture(r.pointerId),d=D(u,f),y(d),F(d)}),(z=n.querySelector(".close"))==null||z.addEventListener("click",()=>{H(!1),C()}),S(),b=window.setInterval(S,1e3)}async function W(){s&&(c=await _(),y(d))}async function V(){window===window.top&&(await R()?await B():C())}V();window.addEventListener("resize",()=>{W()});chrome.storage.onChanged.addListener((t,n)=>{if(n==="local"&&(N in t&&(t[N].newValue===!0?B():C()),A in t&&s)){const e=t[A].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(d={...e,expanded:!0},requestAnimationFrame(()=>y(d)))}});function X(t,n){var m;if(window!==window.top)return;(m=document.getElementById("nexo-reminder-alert"))==null||m.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.45 system-ui,-apple-system,sans-serif"].join(";");const i=document.createElement("strong");i.textContent=`🔔 ${t}`,i.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const o=document.createElement("div");o.textContent=n,o.style.cssText="color:#cffafe;font-size:13px";const a=document.createElement("button");a.type="button",a.textContent="×",a.setAttribute("aria-label","Cerrar recordatorio"),a.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",a.addEventListener("click",()=>e.remove()),e.append(i,o,a),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,n,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(X(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function $(){return Array.from(document.querySelectorAll('input[type="password"]'))}function G(t){const n=t.form;if(!n)return null;const e=n.querySelectorAll('input:not([type="password"])');for(const i of e){const o=i,a=o.type.toLowerCase();if(a==="email"||a==="text"||o.name.toLowerCase().includes("user")||o.name.toLowerCase().includes("email")||o.name.toLowerCase().includes("login")||o.autocomplete==="username"||o.autocomplete==="email")return o}return null}function K(t){var i;const n=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(n)return n;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),U(t,e)}),e}async function U(t,n){const e=document.querySelector(".pv-suggestions");e&&e.remove();const i=G(t),o=document.createElement("div");o.className="pv-suggestions",J(o,n),document.body.appendChild(o),h(o,"Buscando accesos…");try{const a=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});a!=null&&a.success?!Array.isArray(a.suggestions)||a.suggestions.length===0?h(o,"No hay accesos para este sitio"):(o.replaceChildren(),a.suggestions.forEach(m=>{const g=document.createElement("div");g.className="pv-suggestion-item pv-suggestion-clickable",g.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${Q(m.username)}</div>
          </div>
        `,g.addEventListener("click",()=>{i&&q(i,m.username),q(t,m.password),o.remove()}),o.appendChild(g)})):h(o,"Bóveda bloqueada — abre la extensión")}catch{h(o,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>o.remove(),{once:!0})},0)}function h(t,n){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=n,t.replaceChildren(e)}function q(t,n){var i;const e=(i=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:i.set;e==null||e.call(t,n),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function J(t,n){const e=n.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function Q(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}function tt(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function j(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const n=K(t);(e=t.parentElement)==null||e.appendChild(n)}function et(){new MutationObserver(()=>{$().forEach(j)}).observe(document.body,{childList:!0,subtree:!0})}tt();$().forEach(j);et();
