import{F as N,a as A,i as Z,l as W,s as F,b as V}from"./floating-clock-hcteuHpy.js";const P="nexo-floating-clock-host",E=225,_=56,p=10;let s=null,b,d=1,c={x:1,y:.12,mode:"viewport-ratio",expanded:!0};function C(){b!==void 0&&window.clearInterval(b),b=void 0,s==null||s.remove(),s=null}async function $(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),n=Number(t==null?void 0:t.zoom);return Number.isFinite(n)&&n>0?n:1}catch{return 1}}function M(){return{width:window.innerWidth*d,height:window.innerHeight*d}}function L(){return{width:(s==null?void 0:s.offsetWidth)||E,height:(s==null?void 0:s.offsetHeight)||_}}function v(t,n){const e=M(),i=L();return{x:Math.max(p,Math.min(t,e.width-i.width-p)),y:Math.max(p,Math.min(n,e.height-i.height-p))}}function k(t){const n=M(),e=L();if(t.mode!=="viewport-ratio")return v(t.x*d,t.y*d);const i=Math.max(0,n.width-e.width-p*2),o=Math.max(0,n.height-e.height-p*2);return v(p+Math.max(0,Math.min(1,t.x))*i,p+Math.max(0,Math.min(1,t.y))*o)}function y(t){if(!s)return;c=t;const n=k(t);s.style.left=`${n.x/d}px`,s.style.top=`${n.y/d}px`,s.style.transform=`scale(${1/d})`}function O(t,n){const e=M(),i=L(),o=v(t,n),a=Math.max(1,e.width-i.width-p*2),m=Math.max(1,e.height-i.height-p*2);return{x:Math.max(0,Math.min(1,(o.x-p)/a)),y:Math.max(0,Math.min(1,(o.y-p)/m)),mode:"viewport-ratio",expanded:!0}}function D(t,n){const e=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:n,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(t).map(o=>[o.type,o.value])),i=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((i-Math.floor(t.getTime()/1e3)*1e3)/36e5)}async function B(){var S;if(window!==window.top||s||document.getElementById(P))return;d=await $(),c={...await W()||c,expanded:!0};const t=document.createElement("aside");t.id=P,t.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${E}px`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const n=t.attachShadow({mode:"open"});n.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:${E}px;height:${_}px;border:1px solid rgba(148,163,184,.22);border-radius:11px;background:linear-gradient(135deg,#080e20 0%,#0f172a 60%,#162035 100%);box-shadow:0 5px 15px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.06);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}.clock:active{cursor:grabbing}
      .clock-grid{display:grid;grid-template-columns:minmax(0,1fr) 64px 13px;column-gap:4px;align-items:stretch;height:100%;padding:5px}
      .madrid-block,.lima-block{display:grid;grid-template-rows:9px minmax(0,1fr) 9px;align-items:center;min-width:0}
      .city-line{display:flex;align-items:center;gap:3px;min-width:0;color:#94a3b8;font-size:7.5px;font-weight:800;letter-spacing:.04em;line-height:1;text-transform:uppercase;white-space:nowrap}
      .live{width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 5px #34d399;flex-shrink:0}
      .flag{font-size:9px;letter-spacing:0}
      .madrid-time{font:800 19px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.04em}
      .zone-pill{border-radius:4px;background:rgba(37,71,107,.7);padding:1px 3px;color:#bae6fd;font-size:7px;font-weight:800;letter-spacing:.01em}
      .date-str{min-width:0;overflow:hidden;color:#64748b;font-size:8px;font-weight:500;line-height:1;white-space:nowrap;text-overflow:ellipsis}
      .lima-block{border-left:1px solid rgba(148,163,184,.15);padding-left:6px}
      .lima-time{font:750 14px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.03em;color:#e2e8f0}
      .difference{color:#a5b4fc;font-size:8px;font-weight:750;line-height:1;white-space:nowrap}
      .menu-wrap{position:relative;display:flex;align-items:flex-start;justify-content:flex-end}
      .menu-btn{border:0;border-radius:5px;background:transparent;padding:1px 2px;color:#64748b;font:700 14px/1 system-ui;cursor:pointer;flex-shrink:0}.menu-btn:hover{background:rgba(255,255,255,.08);color:#fff}
      .menu{position:absolute;right:-2px;top:20px;display:none;min-width:90px;border:1px solid rgba(148,163,184,.22);border-radius:8px;background:#0f172a;padding:4px;box-shadow:0 8px 20px rgba(2,6,23,.5);z-index:2}.menu.open{display:block}
      .close-btn{width:100%;border:0;border-radius:5px;background:transparent;padding:5px 8px;color:#fca5a5;font:600 9.5px system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
    </style>
    <section class="clock" aria-label="Reloj de España y Perú">
      <div class="clock-grid">
        <div class="madrid-block">
          <div class="city-line"><i class="live"></i><span class="flag" aria-hidden="true">🇪🇸</span><span>Madrid</span><span class="zone-pill zone">CET</span></div>
          <strong class="madrid-time time">--:--:--</strong>
          <span class="date-str date"></span>
        </div>
        <div class="lima-block">
          <div class="city-line"><span class="flag" aria-hidden="true">🇵🇪</span><span>Lima</span></div>
          <strong class="lima-time lima">--:--</strong>
          <span class="difference">−7 h</span>
        </div>
        <div class="menu-wrap"><button class="menu-btn" type="button" aria-label="Opciones del reloj" aria-expanded="false">⋮</button><div class="menu"><button class="close-btn" type="button">Desactivar</button></div></div>
      </div>
    </section>`;const e=n.querySelector(".clock"),i=n.querySelector(".time"),o=n.querySelector(".date"),a=n.querySelector(".lima"),m=n.querySelector(".difference"),g=n.querySelector(".zone"),w=n.querySelector(".menu-btn"),T=n.querySelector(".menu");if(!e||!i||!o||!a||!m||!g||!w||!T)return;if(s=t,document.documentElement.appendChild(t),c.mode!=="viewport-ratio"){const r=k(c);c=O(r.x,r.y),F(c)}y(c),t.style.visibility="visible";const z=()=>{var I;const r=new Date;i.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(r);const u=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(r).replace(/\./g,"");o.textContent=u.charAt(0).toUpperCase()+u.slice(1),a.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}).format(r);const h=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}).formatToParts(r);g.textContent=((I=h.find(R=>R.type==="timeZoneName"))==null?void 0:I.value)||"Madrid";const f=D(r,"America/Lima")-D(r,"Europe/Madrid"),H=f>0?"+":f<0?"−":"";m.textContent=`${H}${Math.abs(f)} h`};w.addEventListener("click",r=>{r.stopPropagation();const u=T.classList.toggle("open");w.setAttribute("aria-expanded",String(u))});let l=null;e.addEventListener("pointerdown",r=>{const u=k(c);l={pointerX:r.clientX,pointerY:r.clientY,x:u.x,y:u.y},e.setPointerCapture(r.pointerId),r.preventDefault()}),e.addEventListener("pointermove",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*d,h=l.y+(r.clientY-l.pointerY)*d,f=v(u,h);t.style.left=`${f.x/d}px`,t.style.top=`${f.y/d}px`}),e.addEventListener("pointerup",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*d,h=l.y+(r.clientY-l.pointerY)*d;l=null,e.releasePointerCapture(r.pointerId),c=O(u,h),y(c),F(c)}),(S=n.querySelector(".close-btn"))==null||S.addEventListener("click",()=>{V(!1),C()}),z(),b=window.setInterval(z,1e3)}async function X(){s&&(d=await $(),y(c))}async function G(){window===window.top&&(await Z()?await B():C())}G();window.addEventListener("resize",()=>{X()});chrome.storage.onChanged.addListener((t,n)=>{if(n==="local"&&(N in t&&(t[N].newValue===!0?B():C()),A in t&&s)){const e=t[A].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(c={...e,expanded:!0},requestAnimationFrame(()=>y(c)))}});function K(t,n){var m;if(window!==window.top)return;(m=document.getElementById("nexo-reminder-alert"))==null||m.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.45 system-ui,-apple-system,sans-serif"].join(";");const i=document.createElement("strong");i.textContent=`🔔 ${t}`,i.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const o=document.createElement("div");o.textContent=n,o.style.cssText="color:#cffafe;font-size:13px";const a=document.createElement("button");a.type="button",a.textContent="×",a.setAttribute("aria-label","Cerrar recordatorio"),a.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",a.addEventListener("click",()=>e.remove()),e.append(i,o,a),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,n,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(K(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function j(){return Array.from(document.querySelectorAll('input[type="password"]'))}function U(t){const n=t.form;if(!n)return null;const e=n.querySelectorAll('input:not([type="password"])');for(const i of e){const o=i,a=o.type.toLowerCase();if(a==="email"||a==="text"||o.name.toLowerCase().includes("user")||o.name.toLowerCase().includes("email")||o.name.toLowerCase().includes("login")||o.autocomplete==="username"||o.autocomplete==="email")return o}return null}function J(t){var i;const n=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(n)return n;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),Q(t,e)}),e}async function Q(t,n){const e=document.querySelector(".pv-suggestions");e&&e.remove();const i=U(t),o=document.createElement("div");o.className="pv-suggestions",tt(o,n),document.body.appendChild(o),x(o,"Buscando accesos…");try{const a=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});a!=null&&a.success?!Array.isArray(a.suggestions)||a.suggestions.length===0?x(o,"No hay accesos para este sitio"):(o.replaceChildren(),a.suggestions.forEach(m=>{const g=document.createElement("div");g.className="pv-suggestion-item pv-suggestion-clickable",g.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${et(m.username)}</div>
          </div>
        `,g.addEventListener("click",()=>{i&&q(i,m.username),q(t,m.password),o.remove()}),o.appendChild(g)})):x(o,"Bóveda bloqueada — abre la extensión")}catch{x(o,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>o.remove(),{once:!0})},0)}function x(t,n){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=n,t.replaceChildren(e)}function q(t,n){var i;const e=(i=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:i.set;e==null||e.call(t,n),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function tt(t,n){const e=n.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function et(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}function nt(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function Y(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const n=J(t);(e=t.parentElement)==null||e.appendChild(n)}function ot(){new MutationObserver(()=>{j().forEach(Y)}).observe(document.body,{childList:!0,subtree:!0})}nt();j().forEach(Y);ot();
