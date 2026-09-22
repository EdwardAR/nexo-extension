import{F,a as P,i as V,l as X,s as D,b as G}from"./floating-clock-hcteuHpy.js";const O="nexo-floating-clock-host",C=170,$=44,p=10;let s=null,y,c=1,d={x:1,y:.12,mode:"viewport-ratio",expanded:!0},b=null;function K(){if(b)return b;const t={year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"};return b={madridTime:new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),madridDate:new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",day:"2-digit",month:"short"}),limaTime:new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}),madridZone:new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}),offsets:{"America/Lima":new Intl.DateTimeFormat("en-CA",{...t,timeZone:"America/Lima"}),"Europe/Madrid":new Intl.DateTimeFormat("en-CA",{...t,timeZone:"Europe/Madrid"})}},b}function T(){y!==void 0&&window.clearInterval(y),y=void 0,s==null||s.remove(),s=null}async function B(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),n=Number(t==null?void 0:t.zoom);return Number.isFinite(n)&&n>0?n:1}catch{return 1}}function L(){return{width:window.innerWidth*c,height:window.innerHeight*c}}function z(){return{width:(s==null?void 0:s.offsetWidth)||C,height:(s==null?void 0:s.offsetHeight)||$}}function w(t,n){const e=L(),i=z();return{x:Math.max(p,Math.min(t,e.width-i.width-p)),y:Math.max(p,Math.min(n,e.height-i.height-p))}}function M(t){const n=L(),e=z();if(t.mode!=="viewport-ratio")return w(t.x*c,t.y*c);const i=Math.max(0,n.width-e.width-p*2),o=Math.max(0,n.height-e.height-p*2);return w(p+Math.max(0,Math.min(1,t.x))*i,p+Math.max(0,Math.min(1,t.y))*o)}function E(t){if(!s)return;d=t;const n=M(t);s.style.left=`${n.x/c}px`,s.style.top=`${n.y/c}px`,s.style.transform=`scale(${1/c})`}function q(t,n){const e=L(),i=z(),o=w(t,n),a=Math.max(1,e.width-i.width-p*2),m=Math.max(1,e.height-i.height-p*2);return{x:Math.max(0,Math.min(1,(o.x-p)/a)),y:Math.max(0,Math.min(1,(o.y-p)/m)),mode:"viewport-ratio",expanded:!0}}function _(t,n){const e=Object.fromEntries(n.formatToParts(t).map(o=>[o.type,o.value])),i=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((i-Math.floor(t.getTime()/1e3)*1e3)/36e5)}async function j(){var N;if(window!==window.top||s||document.getElementById(O))return;c=await B(),d={...await X()||d,expanded:!0};const t=document.createElement("aside");t.id=O,t.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${C}px`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const n=t.attachShadow({mode:"open"});n.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:${C}px;height:${$}px;border:1px solid rgba(148,163,184,.22);border-radius:9px;background:linear-gradient(135deg,#080e20 0%,#0f172a 60%,#162035 100%);box-shadow:0 4px 12px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.06);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}.clock:active{cursor:grabbing}
      .clock-grid{display:grid;grid-template-columns:minmax(0,1fr) 50px 11px;column-gap:2px;align-items:stretch;height:100%;padding:4px}
      .madrid-block,.lima-block{display:grid;grid-template-rows:7px minmax(0,1fr) 7px;align-items:center;min-width:0}
      .city-line{display:flex;align-items:center;gap:2px;min-width:0;color:#94a3b8;font-size:6.5px;font-weight:800;letter-spacing:.03em;line-height:1;text-transform:uppercase;white-space:nowrap}
      .live{width:4px;height:4px;border-radius:50%;background:#34d399;box-shadow:0 0 4px #34d399;flex-shrink:0}
      .flag{font-size:8px;letter-spacing:0}
      .madrid-time{font:800 17px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.055em}
      .zone-pill{border-radius:3px;background:rgba(37,71,107,.7);padding:0 2px;color:#bae6fd;font-size:6px;font-weight:800;letter-spacing:0}
      .date-str{min-width:0;overflow:hidden;color:#64748b;font-size:7px;font-weight:600;line-height:1;white-space:nowrap;text-overflow:ellipsis}
      .lima-block{border-left:1px solid rgba(148,163,184,.15);padding-left:4px}
      .lima-time{font:750 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.04em;color:#e2e8f0}
      .difference{color:#a5b4fc;font-size:7px;font-weight:750;line-height:1;white-space:nowrap}
      .menu-wrap{position:relative;display:flex;align-items:flex-start;justify-content:flex-end}
      .menu-btn{border:0;border-radius:4px;background:transparent;padding:0 1px;color:#64748b;font:700 12px/1 system-ui;cursor:pointer;flex-shrink:0}.menu-btn:hover{background:rgba(255,255,255,.08);color:#fff}
      .menu{position:absolute;right:-2px;top:16px;display:none;min-width:90px;border:1px solid rgba(148,163,184,.22);border-radius:8px;background:#0f172a;padding:4px;box-shadow:0 8px 20px rgba(2,6,23,.5);z-index:2}.menu.open{display:block}
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
    </section>`;const e=n.querySelector(".clock"),i=n.querySelector(".time"),o=n.querySelector(".date"),a=n.querySelector(".lima"),m=n.querySelector(".difference"),f=n.querySelector(".zone"),k=n.querySelector(".menu-btn"),I=n.querySelector(".menu");if(!e||!i||!o||!a||!m||!f||!k||!I)return;if(s=t,document.documentElement.appendChild(t),d.mode!=="viewport-ratio"){const r=M(d);d=q(r.x,r.y),D(d)}E(d),t.style.visibility="visible";const g=K(),S=()=>{var A;const r=new Date;i.textContent=g.madridTime.format(r);const u=g.madridDate.format(r).replace(/\./g,"");o.textContent=u.charAt(0).toUpperCase()+u.slice(1),a.textContent=g.limaTime.format(r);const x=g.madridZone.formatToParts(r);f.textContent=((A=x.find(W=>W.type==="timeZoneName"))==null?void 0:A.value)||"Madrid";const h=_(r,g.offsets["America/Lima"])-_(r,g.offsets["Europe/Madrid"]),R=h>0?"+":h<0?"−":"";m.textContent=`${R}${Math.abs(h)} h`};k.addEventListener("click",r=>{r.stopPropagation();const u=I.classList.toggle("open");k.setAttribute("aria-expanded",String(u))});let l=null;e.addEventListener("pointerdown",r=>{const u=M(d);l={pointerX:r.clientX,pointerY:r.clientY,x:u.x,y:u.y},e.setPointerCapture(r.pointerId),r.preventDefault()}),e.addEventListener("pointermove",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*c,x=l.y+(r.clientY-l.pointerY)*c,h=w(u,x);t.style.left=`${h.x/c}px`,t.style.top=`${h.y/c}px`}),e.addEventListener("pointerup",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*c,x=l.y+(r.clientY-l.pointerY)*c;l=null,e.releasePointerCapture(r.pointerId),d=q(u,x),E(d),D(d)}),(N=n.querySelector(".close-btn"))==null||N.addEventListener("click",()=>{G(!1),T()}),S(),y=window.setInterval(S,1e3)}async function U(){s&&(c=await B(),E(d))}async function J(){window===window.top&&(await V()?await j():T())}J();window.addEventListener("resize",()=>{U()});chrome.storage.onChanged.addListener((t,n)=>{if(n==="local"&&(F in t&&(t[F].newValue===!0?j():T()),P in t&&s)){const e=t[P].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(d={...e,expanded:!0},requestAnimationFrame(()=>E(d)))}});function Q(t,n){var m;if(window!==window.top)return;(m=document.getElementById("nexo-reminder-alert"))==null||m.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.45 system-ui,-apple-system,sans-serif"].join(";");const i=document.createElement("strong");i.textContent=`🔔 ${t}`,i.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const o=document.createElement("div");o.textContent=n,o.style.cssText="color:#cffafe;font-size:13px";const a=document.createElement("button");a.type="button",a.textContent="×",a.setAttribute("aria-label","Cerrar recordatorio"),a.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",a.addEventListener("click",()=>e.remove()),e.append(i,o,a),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,n,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(Q(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function Y(){return Array.from(document.querySelectorAll('input[type="password"]'))}function tt(t){const n=t.form;if(!n)return null;const e=n.querySelectorAll('input:not([type="password"])');for(const i of e){const o=i,a=o.type.toLowerCase();if(a==="email"||a==="text"||o.name.toLowerCase().includes("user")||o.name.toLowerCase().includes("email")||o.name.toLowerCase().includes("login")||o.autocomplete==="username"||o.autocomplete==="email")return o}return null}function et(t){var i;const n=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(n)return n;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),nt(t,e)}),e}async function nt(t,n){const e=document.querySelector(".pv-suggestions");e&&e.remove();const i=tt(t),o=document.createElement("div");o.className="pv-suggestions",ot(o,n),document.body.appendChild(o),v(o,"Buscando accesos…");try{const a=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});a!=null&&a.success?!Array.isArray(a.suggestions)||a.suggestions.length===0?v(o,"No hay accesos para este sitio"):(o.replaceChildren(),a.suggestions.forEach(m=>{const f=document.createElement("div");f.className="pv-suggestion-item pv-suggestion-clickable",f.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${it(m.username)}</div>
          </div>
        `,f.addEventListener("click",()=>{i&&Z(i,m.username),Z(t,m.password),o.remove()}),o.appendChild(f)})):v(o,"Bóveda bloqueada — abre la extensión")}catch{v(o,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>o.remove(),{once:!0})},0)}function v(t,n){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=n,t.replaceChildren(e)}function Z(t,n){var i;const e=(i=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:i.set;e==null||e.call(t,n),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ot(t,n){const e=n.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function it(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}function rt(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function H(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const n=et(t);(e=t.parentElement)==null||e.appendChild(n)}function at(){new MutationObserver(()=>{Y().forEach(H)}).observe(document.body,{childList:!0,subtree:!0})}rt();Y().forEach(H);at();
