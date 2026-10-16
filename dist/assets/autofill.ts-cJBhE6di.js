import{F,a as P,i as V,l as X,s as D,b as G}from"./floating-clock-hcteuHpy.js";const O="nexo-floating-clock-host",C=170,j=44,p=10;let s=null,y,d=1,c={x:1,y:.12,mode:"viewport-ratio",expanded:!0},b=null;function K(){if(b)return b;const e={year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"};return b={madridTime:new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),madridDate:new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",day:"2-digit",month:"short"}),limaTime:new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}),madridZone:new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}),offsets:{"America/Lima":new Intl.DateTimeFormat("en-CA",{...e,timeZone:"America/Lima"}),"Europe/Madrid":new Intl.DateTimeFormat("en-CA",{...e,timeZone:"Europe/Madrid"})}},b}function T(){y!==void 0&&window.clearInterval(y),y=void 0,s==null||s.remove(),s=null}async function Z(){try{const e=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),n=Number(e==null?void 0:e.zoom);return Number.isFinite(n)&&n>0?n:1}catch{return 1}}function L(){return{width:window.innerWidth*d,height:window.innerHeight*d}}function I(){return{width:(s==null?void 0:s.offsetWidth)||C,height:(s==null?void 0:s.offsetHeight)||j}}function w(e,n){const t=L(),o=I();return{x:Math.max(p,Math.min(e,t.width-o.width-p)),y:Math.max(p,Math.min(n,t.height-o.height-p))}}function M(e){const n=L(),t=I();if(e.mode!=="viewport-ratio")return w(e.x*d,e.y*d);const o=Math.max(0,n.width-t.width-p*2),i=Math.max(0,n.height-t.height-p*2);return w(p+Math.max(0,Math.min(1,e.x))*o,p+Math.max(0,Math.min(1,e.y))*i)}function k(e){if(!s)return;c=e;const n=M(e);s.style.left=`${n.x/d}px`,s.style.top=`${n.y/d}px`,s.style.transform=`scale(${1/d})`}function B(e,n){const t=L(),o=I(),i=w(e,n),a=Math.max(1,t.width-o.width-p*2),m=Math.max(1,t.height-o.height-p*2);return{x:Math.max(0,Math.min(1,(i.x-p)/a)),y:Math.max(0,Math.min(1,(i.y-p)/m)),mode:"viewport-ratio",expanded:!0}}function q(e,n){const t=Object.fromEntries(n.formatToParts(e).map(i=>[i.type,i.value])),o=Date.UTC(Number(t.year),Number(t.month)-1,Number(t.day),Number(t.hour),Number(t.minute),Number(t.second));return Math.round((o-Math.floor(e.getTime()/1e3)*1e3)/36e5)}async function $(){var S;if(window!==window.top||s||document.getElementById(O))return;d=await Z(),c={...await X()||c,expanded:!0};const e=document.createElement("aside");e.id=O,e.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${C}px`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const n=e.attachShadow({mode:"open"});n.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{position:relative;width:${C}px;height:${j}px;border:1px solid rgba(148,163,184,.22);border-radius:9px;background:linear-gradient(135deg,#080e20 0%,#0f172a 60%,#162035 100%);box-shadow:0 4px 12px rgba(2,6,23,.55),inset 0 1px 0 rgba(255,255,255,.06);color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:grab;user-select:none}.clock:active{cursor:grabbing}
      .clock-grid{display:grid;grid-template-columns:minmax(0,1fr) 50px 11px;column-gap:2px;align-items:stretch;height:100%;padding:4px}
      .madrid-block,.lima-block{display:grid;grid-template-rows:7px minmax(0,1fr) 7px;align-items:center;min-width:0}
      .city-line{display:flex;align-items:center;gap:2px;min-width:0;color:#94a3b8;font-size:6.5px;font-weight:800;letter-spacing:.03em;line-height:1;text-transform:uppercase;white-space:nowrap}
      .live{width:4px;height:4px;border-radius:50%;background:#34d399;box-shadow:0 0 4px #34d399;flex-shrink:0}
      .clock-globe{width:8px;height:8px;display:inline-flex;flex:none}.clock-globe svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
      .madrid-time{font:800 17px/1 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;letter-spacing:-.055em}
      .zone-pill{border-radius:3px;background:rgba(37,71,107,.7);padding:0 2px;color:#bae6fd;font-size:6px;font-weight:800;letter-spacing:0}
      .date-str{min-width:0;overflow:hidden;color:#64748b;font-size:7px;font-weight:600;line-height:1;white-space:nowrap;text-overflow:ellipsis}
      .lima-block{border-left:1px solid rgba(148,163,184,.15);padding-left:4px}
      .lima-time{font:750 12px/1 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;letter-spacing:-.04em;color:#e2e8f0}
      .difference{color:#a5b4fc;font-size:7px;font-weight:750;line-height:1;white-space:nowrap}
      .menu-wrap{position:relative;display:flex;align-items:flex-start;justify-content:flex-end}
      .menu-btn{border:0;border-radius:4px;background:transparent;padding:0 1px;color:#64748b;font:700 12px/1 Inter,ui-sans-serif,system-ui;cursor:pointer;flex-shrink:0}.menu-btn:hover{background:rgba(255,255,255,.08);color:#fff}.menu-icon{width:12px;height:12px;display:block;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .menu{position:absolute;right:-2px;top:16px;display:none;min-width:90px;border:1px solid rgba(148,163,184,.22);border-radius:8px;background:#0f172a;padding:4px;box-shadow:0 8px 20px rgba(2,6,23,.5);z-index:2}.menu.open{display:block}
      .close-btn{width:100%;border:0;border-radius:5px;background:transparent;padding:5px 8px;color:#fca5a5;font:600 9.5px Inter,ui-sans-serif,system-ui;text-align:left;cursor:pointer}.close-btn:hover{background:rgba(239,68,68,.12)}
    </style>
    <section class="clock" aria-label="Reloj de España y Perú">
      <div class="clock-grid">
        <div class="madrid-block">
          <div class="city-line"><i class="live"></i><span class="clock-globe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg></span><span>Madrid</span><span class="zone-pill zone">CET</span></div>
          <strong class="madrid-time time">--:--:--</strong>
          <span class="date-str date"></span>
        </div>
        <div class="lima-block">
          <div class="city-line"><span class="clock-globe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 0 20"/><path d="M12 2a15.3 15.3 0 0 0 0 20"/></svg></span><span>Lima</span></div>
          <strong class="lima-time lima">--:--</strong>
          <span class="difference">−7 h</span>
        </div>
        <div class="menu-wrap"><button class="menu-btn" type="button" aria-label="Opciones del reloj" aria-expanded="false"><svg class="menu-icon" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button><div class="menu"><button class="close-btn" type="button">Desactivar</button></div></div>
      </div>
    </section>`;const t=n.querySelector(".clock"),o=n.querySelector(".time"),i=n.querySelector(".date"),a=n.querySelector(".lima"),m=n.querySelector(".difference"),f=n.querySelector(".zone"),E=n.querySelector(".menu-btn"),z=n.querySelector(".menu");if(!t||!o||!i||!a||!m||!f||!E||!z)return;if(s=e,document.documentElement.appendChild(e),c.mode!=="viewport-ratio"){const r=M(c);c=B(r.x,r.y),D(c)}k(c),e.style.visibility="visible";const g=K(),N=()=>{var A;const r=new Date;o.textContent=g.madridTime.format(r);const u=g.madridDate.format(r).replace(/\./g,"");i.textContent=u.charAt(0).toUpperCase()+u.slice(1),a.textContent=g.limaTime.format(r);const x=g.madridZone.formatToParts(r);f.textContent=((A=x.find(W=>W.type==="timeZoneName"))==null?void 0:A.value)||"Madrid";const h=q(r,g.offsets["America/Lima"])-q(r,g.offsets["Europe/Madrid"]),R=h>0?"+":h<0?"−":"";m.textContent=`${R}${Math.abs(h)} h`};E.addEventListener("click",r=>{r.stopPropagation();const u=z.classList.toggle("open");E.setAttribute("aria-expanded",String(u))});let l=null;t.addEventListener("pointerdown",r=>{const u=M(c);l={pointerX:r.clientX,pointerY:r.clientY,x:u.x,y:u.y},t.setPointerCapture(r.pointerId),r.preventDefault()}),t.addEventListener("pointermove",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*d,x=l.y+(r.clientY-l.pointerY)*d,h=w(u,x);e.style.left=`${h.x/d}px`,e.style.top=`${h.y/d}px`}),t.addEventListener("pointerup",r=>{if(!l)return;const u=l.x+(r.clientX-l.pointerX)*d,x=l.y+(r.clientY-l.pointerY)*d;l=null,t.releasePointerCapture(r.pointerId),c=B(u,x),k(c),D(c)}),(S=n.querySelector(".close-btn"))==null||S.addEventListener("click",()=>{G(!1),T()}),N(),y=window.setInterval(N,1e3)}async function U(){s&&(d=await Z(),k(c))}async function J(){window===window.top&&(await V()?await $():T())}J();window.addEventListener("resize",()=>{U()});chrome.storage.onChanged.addListener((e,n)=>{if(n==="local"&&(F in e&&(e[F].newValue===!0?$():T()),P in e&&s)){const t=e[P].newValue;t&&Number.isFinite(t.x)&&Number.isFinite(t.y)&&(c={...t,expanded:!0},requestAnimationFrame(()=>k(c)))}});function Q(e,n){var m;if(window!==window.top)return;(m=document.getElementById("nexo-reminder-alert"))==null||m.remove();const t=document.createElement("aside");t.id="nexo-reminder-alert",t.setAttribute("role","alert"),t.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.5 Inter,ui-sans-serif,system-ui,-apple-system,sans-serif"].join(";");const o=document.createElement("strong");o.textContent=e,o.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const i=document.createElement("div");i.textContent=n,i.style.cssText="color:#cffafe;font-size:13px";const a=document.createElement("button");a.type="button",a.textContent="×",a.setAttribute("aria-label","Cerrar recordatorio"),a.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",a.addEventListener("click",()=>t.remove()),t.append(o,i,a),document.documentElement.appendChild(t),setTimeout(()=>t.remove(),3e4)}chrome.runtime.onMessage.addListener((e,n,t)=>{e.action==="SHOW_NEXO_REMINDER"&&(Q(String(e.title||"Recordatorio de Nexo"),String(e.message||"")),t({success:!0}))});function Y(){return Array.from(document.querySelectorAll('input[type="password"]'))}function ee(e){const n=e.form;if(!n)return null;const t=n.querySelectorAll('input:not([type="password"])');for(const o of t){const i=o,a=i.type.toLowerCase();if(a==="email"||a==="text"||i.name.toLowerCase().includes("user")||i.name.toLowerCase().includes("email")||i.name.toLowerCase().includes("login")||i.autocomplete==="username"||i.autocomplete==="email")return i}return null}function te(e){var o;const n=(o=e.parentElement)==null?void 0:o.querySelector(".pv-autofill-btn");if(n)return n;const t=document.createElement("button");return t.className="pv-autofill-btn",t.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,t.title="Nexo - Autocompletar",t.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation(),ne(e,t)}),t}async function ne(e,n){const t=document.querySelector(".pv-suggestions");t&&t.remove();const o=ee(e),i=document.createElement("div");i.className="pv-suggestions",ie(i,n),document.body.appendChild(i),v(i,"Buscando accesos…");try{const a=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});a!=null&&a.success?!Array.isArray(a.suggestions)||a.suggestions.length===0?v(i,"No hay accesos para este sitio"):(i.replaceChildren(),a.suggestions.forEach(m=>{const f=document.createElement("div");f.className="pv-suggestion-item pv-suggestion-clickable",f.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${oe(m.username)}</div>
          </div>
        `,f.addEventListener("click",()=>{o&&_(o,m.username),_(e,m.password),i.remove()}),i.appendChild(f)})):v(i,"Bóveda bloqueada — abre la extensión")}catch{v(i,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>i.remove(),{once:!0})},0)}function v(e,n){const t=document.createElement("div");t.className="pv-suggestion-item",t.textContent=n,e.replaceChildren(t)}function _(e,n){var o;const t=(o=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:o.set;t==null||t.call(e,n),e.dispatchEvent(new Event("input",{bubbles:!0})),e.dispatchEvent(new Event("change",{bubbles:!0}))}function ie(e,n){const t=n.getBoundingClientRect();e.style.position="fixed",e.style.top=`${t.bottom+4}px`,e.style.right=`${window.innerWidth-t.right}px`}function oe(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML}function re(){const e=document.createElement("style");e.textContent=`
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
  `,document.head.appendChild(e)}function H(e){var t;if(e.dataset.pvAttached)return;e.dataset.pvAttached="true",e.parentElement&&(e.parentElement.style.position="relative");const n=te(e);(t=e.parentElement)==null||t.appendChild(n)}function ae(){new MutationObserver(()=>{Y().forEach(H)}).observe(document.body,{childList:!0,subtree:!0})}re();Y().forEach(H);ae();
