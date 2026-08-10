import{F as N,a as A,i as R,l as Z,s as F,b as H}from"./floating-clock-hcteuHpy.js";const P="nexo-floating-clock-host",E=310,d=10;let s=null,b,c=1,l={x:1,y:.12,mode:"viewport-ratio",expanded:!0};function C(){b!==void 0&&window.clearInterval(b),b=void 0,s==null||s.remove(),s=null}async function _(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),n=Number(t==null?void 0:t.zoom);return Number.isFinite(n)&&n>0?n:1}catch{return 1}}function M(){return{width:window.innerWidth*c,height:window.innerHeight*c}}function L(){return{width:(s==null?void 0:s.offsetWidth)||E,height:(s==null?void 0:s.offsetHeight)||96}}function v(t,n){const e=M(),i=L();return{x:Math.max(d,Math.min(t,e.width-i.width-d)),y:Math.max(d,Math.min(n,e.height-i.height-d))}}function k(t){const n=M(),e=L();if(t.mode!=="viewport-ratio")return v(t.x*c,t.y*c);const i=Math.max(0,n.width-e.width-d*2),o=Math.max(0,n.height-e.height-d*2);return v(d+Math.max(0,Math.min(1,t.x))*i,d+Math.max(0,Math.min(1,t.y))*o)}function y(t){if(!s)return;l=t;const n=k(t);s.style.left=`${n.x/c}px`,s.style.top=`${n.y/c}px`,s.style.transform=`scale(${1/c})`}function O(t,n){const e=M(),i=L(),o=v(t,n),a=Math.max(1,e.width-i.width-d*2),m=Math.max(1,e.height-i.height-d*2);return{x:Math.max(0,Math.min(1,(o.x-d)/a)),y:Math.max(0,Math.min(1,(o.y-d)/m)),mode:"viewport-ratio",expanded:!0}}function D(t,n){const e=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:n,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(t).map(o=>[o.type,o.value])),i=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((i-Math.floor(t.getTime()/1e3)*1e3)/36e5)}async function B(){var S;if(window!==window.top||s||document.getElementById(P))return;c=await _(),l={...await Z()||l,expanded:!0};const t=document.createElement("aside");t.id=P,t.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${E}px`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const n=t.attachShadow({mode:"open"});n.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:${E}px;border:1px solid rgba(148,163,184,.22);border-radius:14px;background:linear-gradient(135deg,#080e20 0%,#0f172a 60%,#162035 100%);box-shadow:0 6px 18px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.06);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}.clock:active{cursor:grabbing}
      .row1{display:flex;align-items:center;gap:0;padding:8px 10px 5px}
      .live{width:6px;height:6px;border-radius:50%;background:#34d399;box-shadow:0 0 6px #34d399;flex-shrink:0}
      .madrid-time{font:800 22px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.04em;margin-left:8px}
      .zone-pill{margin-left:5px;border-radius:5px;background:rgba(37,71,107,.7);padding:2px 5px;color:#bae6fd;font-size:8.5px;font-weight:800;letter-spacing:.02em;align-self:center}
      .spacer{flex:1}
      .diff-pill{border-radius:5px;background:rgba(99,102,241,.18);border:1px solid rgba(99,102,241,.3);padding:2px 6px;color:#c7d2fe;font-size:8.5px;font-weight:700;white-space:nowrap}
      .menu-btn{border:0;border-radius:5px;background:transparent;padding:2px 4px;color:#64748b;font:700 16px/1 system-ui;cursor:pointer;margin-left:4px;flex-shrink:0}.menu-btn:hover{background:rgba(255,255,255,.08);color:#fff}
      .row2{display:flex;align-items:center;gap:6px;padding:0 10px 7px}
      .date-str{color:#64748b;font-size:9.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
      .lima-wrap{display:flex;align-items:center;gap:4px;flex-shrink:0}
      .lima-label{color:#475569;font-size:8.5px;font-weight:600;text-transform:uppercase;letter-spacing:.04em}
      .lima-time{font:700 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace;color:#94a3b8}
      .menu{position:absolute;right:6px;top:36px;display:none;min-width:96px;border:1px solid rgba(148,163,184,.22);border-radius:8px;background:#0f172a;padding:4px;box-shadow:0 8px 20px rgba(2,6,23,.5);z-index:2}.menu.open{display:block}
      .close-btn{width:100%;border:0;border-radius:5px;background:transparent;padding:5px 8px;color:#fca5a5;font:600 9.5px system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="row1"><i class="live"></i><span class="madrid-time time">--:--:--</span><span class="zone-pill zone">CET</span><span class="spacer"></span><span class="diff-pill">Lima <strong class="difference">+7 h</strong></span><div style="position:relative"><button class="menu-btn" type="button" aria-label="Opciones del reloj" aria-expanded="false">⋮</button><div class="menu"><button class="close-btn" type="button">Desactivar</button></div></div></div>
      <div class="row2"><span class="date-str date"></span><span class="lima-wrap"><span class="lima-label">Lima</span><span class="lima-time mono lima">--:--</span></span></div>
    </section>`;const e=n.querySelector(".clock"),i=n.querySelector(".time"),o=n.querySelector(".date"),a=n.querySelector(".lima"),m=n.querySelector(".difference"),f=n.querySelector(".zone"),w=n.querySelector(".menu-btn"),T=n.querySelector(".menu");if(!e||!i||!o||!a||!m||!f||!w||!T)return;if(s=t,document.documentElement.appendChild(t),l.mode!=="viewport-ratio"){const r=k(l);l=O(r.x,r.y),F(l)}y(l),t.style.visibility="visible";const z=()=>{var I;const r=new Date;i.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(r);const u=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(r).replace(/\./g,"");o.textContent=u.charAt(0).toUpperCase()+u.slice(1),a.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}).format(r);const g=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}).formatToParts(r);f.textContent=((I=g.find(Y=>Y.type==="timeZoneName"))==null?void 0:I.value)||"Madrid";const x=D(r,"Europe/Madrid")-D(r,"America/Lima");m.textContent=`${x>=0?"+":""}${x} h`};w.addEventListener("click",r=>{r.stopPropagation();const u=T.classList.toggle("open");w.setAttribute("aria-expanded",String(u))});let p=null;e.addEventListener("pointerdown",r=>{const u=k(l);p={pointerX:r.clientX,pointerY:r.clientY,x:u.x,y:u.y},e.setPointerCapture(r.pointerId),r.preventDefault()}),e.addEventListener("pointermove",r=>{if(!p)return;const u=p.x+(r.clientX-p.pointerX)*c,g=p.y+(r.clientY-p.pointerY)*c,x=v(u,g);t.style.left=`${x.x/c}px`,t.style.top=`${x.y/c}px`}),e.addEventListener("pointerup",r=>{if(!p)return;const u=p.x+(r.clientX-p.pointerX)*c,g=p.y+(r.clientY-p.pointerY)*c;p=null,e.releasePointerCapture(r.pointerId),l=O(u,g),y(l),F(l)}),(S=n.querySelector(".close-btn"))==null||S.addEventListener("click",()=>{H(!1),C()}),z(),b=window.setInterval(z,1e3)}async function W(){s&&(c=await _(),y(l))}async function V(){window===window.top&&(await R()?await B():C())}V();window.addEventListener("resize",()=>{W()});chrome.storage.onChanged.addListener((t,n)=>{if(n==="local"&&(N in t&&(t[N].newValue===!0?B():C()),A in t&&s)){const e=t[A].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(l={...e,expanded:!0},requestAnimationFrame(()=>y(l)))}});function X(t,n){var m;if(window!==window.top)return;(m=document.getElementById("nexo-reminder-alert"))==null||m.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.45 system-ui,-apple-system,sans-serif"].join(";");const i=document.createElement("strong");i.textContent=`🔔 ${t}`,i.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const o=document.createElement("div");o.textContent=n,o.style.cssText="color:#cffafe;font-size:13px";const a=document.createElement("button");a.type="button",a.textContent="×",a.setAttribute("aria-label","Cerrar recordatorio"),a.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",a.addEventListener("click",()=>e.remove()),e.append(i,o,a),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,n,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(X(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function $(){return Array.from(document.querySelectorAll('input[type="password"]'))}function G(t){const n=t.form;if(!n)return null;const e=n.querySelectorAll('input:not([type="password"])');for(const i of e){const o=i,a=o.type.toLowerCase();if(a==="email"||a==="text"||o.name.toLowerCase().includes("user")||o.name.toLowerCase().includes("email")||o.name.toLowerCase().includes("login")||o.autocomplete==="username"||o.autocomplete==="email")return o}return null}function K(t){var i;const n=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(n)return n;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),U(t,e)}),e}async function U(t,n){const e=document.querySelector(".pv-suggestions");e&&e.remove();const i=G(t),o=document.createElement("div");o.className="pv-suggestions",J(o,n),document.body.appendChild(o),h(o,"Buscando accesos…");try{const a=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});a!=null&&a.success?!Array.isArray(a.suggestions)||a.suggestions.length===0?h(o,"No hay accesos para este sitio"):(o.replaceChildren(),a.suggestions.forEach(m=>{const f=document.createElement("div");f.className="pv-suggestion-item pv-suggestion-clickable",f.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${Q(m.username)}</div>
          </div>
        `,f.addEventListener("click",()=>{i&&q(i,m.username),q(t,m.password),o.remove()}),o.appendChild(f)})):h(o,"Bóveda bloqueada — abre la extensión")}catch{h(o,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>o.remove(),{once:!0})},0)}function h(t,n){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=n,t.replaceChildren(e)}function q(t,n){var i;const e=(i=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:i.set;e==null||e.call(t,n),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function J(t,n){const e=n.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function Q(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}function tt(){const t=document.createElement("style");t.textContent=`
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
