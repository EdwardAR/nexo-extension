import{F as B,a as U,i as et,l as ot,s as W,b as nt}from"./floating-clock-hcteuHpy.js";const Y="nexo-floating-clock-host",$=304,f=10;let d=null,S,u=1,p={x:1,y:.12,mode:"viewport-ratio",expanded:!0};function P(){S!==void 0&&window.clearInterval(S),S=void 0,d==null||d.remove(),d=null}async function V(){try{const t=await chrome.runtime.sendMessage({action:"GET_TAB_ZOOM"}),o=Number(t==null?void 0:t.zoom);return Number.isFinite(o)&&o>0?o:1}catch{return 1}}function _(){return{width:window.innerWidth*u,height:window.innerHeight*u}}function D(){return{width:(d==null?void 0:d.offsetWidth)||$,height:(d==null?void 0:d.offsetHeight)||164}}function A(t,o){const e=_(),i=D();return{x:Math.max(f,Math.min(t,e.width-i.width-f)),y:Math.max(f,Math.min(o,e.height-i.height-f))}}function R(t){const o=_(),e=D();if(t.mode!=="viewport-ratio")return A(t.x*u,t.y*u);const i=Math.max(0,o.width-e.width-f*2),n=Math.max(0,o.height-e.height-f*2);return A(f+Math.max(0,Math.min(1,t.x))*i,f+Math.max(0,Math.min(1,t.y))*n)}function I(t){if(!d)return;p=t;const o=R(t);d.style.left=`${o.x/u}px`,d.style.top=`${o.y/u}px`,d.style.transform=`scale(${1/u})`}function G(t,o){const e=_(),i=D(),n=A(t,o),r=Math.max(1,e.width-i.width-f*2),s=Math.max(1,e.height-i.height-f*2);return{x:Math.max(0,Math.min(1,(n.x-f)/r)),y:Math.max(0,Math.min(1,(n.y-f)/s)),mode:"viewport-ratio",expanded:!0}}function H(t,o){const e=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:o,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(t).map(n=>[n.type,n.value])),i=Date.UTC(Number(e.year),Number(e.month)-1,Number(e.day),Number(e.hour),Number(e.minute),Number(e.second));return Math.round((i-Math.floor(t.getTime()/1e3)*1e3)/36e5)}async function X(){var k;if(window!==window.top||d||document.getElementById(Y))return;u=await V(),p={...await ot()||p,expanded:!0};const t=document.createElement("aside");t.id=Y,t.style.cssText=["all:initial","position:fixed","left:0","top:0",`width:${$}px`,"z-index:2147483646","transform-origin:top left","visibility:hidden","touch-action:none","pointer-events:auto"].join(";");const o=t.attachShadow({mode:"open"});o.innerHTML=`
    <style>
      :host{color-scheme:dark}*{box-sizing:border-box}
      .clock{width:${$}px;overflow:hidden;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:radial-gradient(circle at 95% 0%,rgba(34,211,238,.22),transparent 38%),linear-gradient(120deg,#020617 0%,#312e81 64%,#0e7490 100%);box-shadow:0 16px 38px rgba(15,23,42,.35);color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .drag{display:flex;height:25px;align-items:center;justify-content:space-between;padding:5px 10px 2px;color:#a5f3fc;cursor:grab;user-select:none}.drag:active{cursor:grabbing}.brand{display:flex;align-items:center;gap:6px;font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.live{width:6px;height:6px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399}.grip{color:rgba(255,255,255,.45);font-size:13px;letter-spacing:1px}
      .main{display:flex;width:100%;align-items:center;gap:10px;padding:5px 11px 11px;color:inherit}.flag{position:relative;display:grid;width:40px;height:40px;flex:none;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.1);font-size:19px}.period{position:absolute;right:-3px;bottom:-3px;display:grid;width:16px;height:16px;place-items:center;border-radius:50%;background:#172554;font-size:8px}.copy{min-width:0;flex:1}.city{display:block;color:#a5f3fc;font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.time-row{display:flex;align-items:center;gap:8px;margin-top:2px}.time{font:750 21px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.04em}.zone{border:1px solid rgba(165,243,252,.2);border-radius:999px;background:rgba(8,145,178,.18);padding:4px 7px;color:#cffafe;font-size:8px;font-weight:800}.date{display:block;margin-top:5px;overflow:hidden;color:#e0e7ff;font-size:10px;font-weight:600;line-height:1.2;text-overflow:ellipsis;text-transform:capitalize;white-space:nowrap}
      .details{display:block;border-top:1px solid rgba(255,255,255,.11);padding:9px 11px 9px;background:rgba(2,6,23,.24)}.info{display:flex;align-items:center;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.055);padding:7px 0}.tile{min-width:0;flex:1;padding:0 8px}.tile+.tile{border-left:1px solid rgba(255,255,255,.11)}.label{display:block;color:#94a3b8;font-size:7px;font-weight:700;text-transform:uppercase}.value{display:block;margin-top:2px;color:#fff;font-size:9px;font-weight:700;white-space:nowrap}.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px}.footer{display:flex;align-items:center;justify-content:space-between;margin-top:7px}.updated{color:#67e8f9;font-size:8px}.close{border:0;border-radius:7px;background:transparent;padding:4px 6px;color:#94a3b8;font:600 8px inherit;cursor:pointer}.close:hover{background:rgba(248,113,113,.16);color:#fecaca}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="drag" title="Arrastra para mover"><span class="brand"><i class="live"></i>Nexo World Time</span><span class="grip">⠿</span></div>
      <div class="main"><span class="flag">🇪🇸<i class="period">☀️</i></span><span class="copy"><span class="city">Madrid · España</span><span class="time-row"><span class="time">--:--:--</span><span class="zone">CEST</span></span><span class="date"></span></span></div>
      <div class="details"><div class="info"><div class="tile"><span class="label">🇵🇪 Lima</span><strong class="value mono lima">--:--</strong></div><div class="tile"><span class="label">Diferencia</span><strong class="value difference">+7 h</strong></div><div class="tile"><span class="label">Estado</span><strong class="value work">Laboral</strong></div></div><div class="footer"><span class="updated">● En vivo</span><button class="close" type="button">Desactivar</button></div></div>
    </section>`;const e=o.querySelector(".drag"),i=o.querySelector(".time"),n=o.querySelector(".date"),r=o.querySelector(".lima"),s=o.querySelector(".difference"),l=o.querySelector(".zone"),b=o.querySelector(".work"),v=o.querySelector(".period");if(!e||!i||!n||!r||!s||!l||!b||!v)return;if(d=t,document.documentElement.appendChild(t),p.mode!=="viewport-ratio"){const a=R(p);p=G(a.x,a.y),W(p)}I(p),t.style.visibility="visible";const M=()=>{var q,j;const a=new Date;i.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(a),n.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(a),r.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}).format(a);const h=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}).formatToParts(a),y=Number(((q=h.find(O=>O.type==="hour"))==null?void 0:q.value)||0);l.textContent=((j=h.find(O=>O.type==="timeZoneName"))==null?void 0:j.value)||"Madrid";const T=H(a,"Europe/Madrid")-H(a,"America/Lima");s.textContent=`${T>=0?"+":""}${T} h`;const F=y>=9&&y<18;b.textContent=F?"Laboral":"No laboral",b.style.color=F?"#6ee7b7":"#fcd34d",v.textContent=y>=7&&y<21?"☀️":"🌙"};let c=null;e.addEventListener("pointerdown",a=>{const h=R(p);c={pointerX:a.clientX,pointerY:a.clientY,x:h.x,y:h.y},e.setPointerCapture(a.pointerId),a.preventDefault()}),e.addEventListener("pointermove",a=>{if(!c)return;const h=c.x+(a.clientX-c.pointerX)*u,y=c.y+(a.clientY-c.pointerY)*u,T=A(h,y);t.style.left=`${T.x/u}px`,t.style.top=`${T.y/u}px`}),e.addEventListener("pointerup",a=>{if(!c)return;const h=c.x+(a.clientX-c.pointerX)*u,y=c.y+(a.clientY-c.pointerY)*u;c=null,e.releasePointerCapture(a.pointerId),p=G(h,y),I(p),W(p)}),(k=o.querySelector(".close"))==null||k.addEventListener("click",()=>{nt(!1),P()}),M(),S=window.setInterval(M,1e3)}async function it(){d&&(u=await V(),I(p))}async function rt(){window===window.top&&(await et()?await X():P())}rt();window.addEventListener("resize",()=>{it()});chrome.storage.onChanged.addListener((t,o)=>{if(o==="local"&&(B in t&&(t[B].newValue===!0?X():P()),U in t&&d)){const e=t[U].newValue;e&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&(p={...e,expanded:!0},requestAnimationFrame(()=>I(p)))}});function at(t,o){var s;if(window!==window.top)return;(s=document.getElementById("nexo-reminder-alert"))==null||s.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.45 system-ui,-apple-system,sans-serif"].join(";");const i=document.createElement("strong");i.textContent=`🔔 ${t}`,i.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const n=document.createElement("div");n.textContent=o,n.style.cssText="color:#cffafe;font-size:13px";const r=document.createElement("button");r.type="button",r.textContent="×",r.setAttribute("aria-label","Cerrar recordatorio"),r.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",r.addEventListener("click",()=>e.remove()),e.append(i,n,r),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}chrome.runtime.onMessage.addListener((t,o,e)=>{t.action==="SHOW_NEXO_REMINDER"&&(at(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0}))});function K(){return Array.from(document.querySelectorAll('input[type="password"]'))}function st(t){const o=t.form;if(!o)return null;const e=o.querySelectorAll('input:not([type="password"])');for(const i of e){const n=i,r=n.type.toLowerCase();if(r==="email"||r==="text"||n.name.toLowerCase().includes("user")||n.name.toLowerCase().includes("email")||n.name.toLowerCase().includes("login")||n.autocomplete==="username"||n.autocomplete==="email")return n}return null}function lt(t){var i;const o=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(o)return o;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),ct(t,e)}),e}async function ct(t,o){const e=document.querySelector(".pv-suggestions");e&&e.remove();const i=st(t),n=document.createElement("div");n.className="pv-suggestions",dt(n,o),document.body.appendChild(n),L(n,"Buscando accesos…");try{const r=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});r!=null&&r.success?!Array.isArray(r.suggestions)||r.suggestions.length===0?L(n,"No hay accesos para este sitio"):(n.replaceChildren(),r.suggestions.forEach(s=>{const l=document.createElement("div");l.className="pv-suggestion-item pv-suggestion-clickable",l.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${pt(s.username)}</div>
          </div>
        `,l.addEventListener("click",()=>{i&&Z(i,s.username),Z(t,s.password),n.remove()}),n.appendChild(l)})):L(n,"Bóveda bloqueada — abre la extensión")}catch{L(n,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>n.remove(),{once:!0})},0)}function L(t,o){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=o,t.replaceChildren(e)}function Z(t,o){var i;const e=(i=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:i.set;e==null||e.call(t,o),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function dt(t,o){const e=o.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function pt(t){const o=document.createElement("div");return o.textContent=t,o.innerHTML}function ut(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function J(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const o=lt(t);(e=t.parentElement)==null||e.appendChild(o)}function mt(){new MutationObserver(()=>{K().forEach(J)}).observe(document.body,{childList:!0,subtree:!0})}let N=!1,w=0,m=0,g=0,z=null,x=null;function C(t){return CSS.escape(t)}function ft(t){try{return document.querySelectorAll(t).length===1}catch{return!1}}function gt(t){const o=[],e=l=>{l&&ft(l)&&!o.includes(l)&&o.push(l)};t.id&&e(`#${C(t.id)}`);for(const l of["data-control-name","data-testid","data-test","data-cy","aria-label","name","title"]){const b=t.getAttribute(l);b&&(e(`${t.tagName.toLowerCase()}[${l}="${C(b)}"]`),e(`[${l}="${C(b)}"]`))}const i=t.getAttribute("role"),n=t.getAttribute("aria-label");i&&n&&e(`[role="${C(i)}"][aria-label="${C(n)}"]`);const r=[];let s=t;for(;s&&s!==document.documentElement&&r.length<7;){let l=s.tagName.toLowerCase();const b=Array.from(s.classList).filter(c=>!c.startsWith("pv-")&&!/\d{3,}/.test(c)).slice(0,2);b.length&&(l+=b.map(c=>`.${C(c)}`).join(""));const v=s.parentElement;if(v){const c=s.tagName,k=Array.from(v.children).filter(a=>a.tagName===c);k.length>1&&(l+=`:nth-of-type(${k.indexOf(s)+1})`)}r.unshift(l);const M=r.join(" > ");e(M),s=v}return o}function xt(t){var o;return t.getAttribute("data-control-name")||t.getAttribute("aria-label")||t.getAttribute("title")||((o=t.textContent)==null?void 0:o.trim().replace(/\s+/g," ").slice(0,80))||t.tagName.toLowerCase()}function Q(t){return t.matches(":disabled")||t.getAttribute("aria-disabled")==="true"||"disabled"in t&&!!t.disabled}function bt(t){const o=t.composedPath().filter(i=>i instanceof Element),e=["[data-control-name]","[data-testid]","button","a","input","select",'[role="button"]','[role="menuitem"]','[role="option"]','[role="tab"]',"[onclick]","[tabindex]"].join(",");for(const i of o){if(i.matches(e))return i;const n=i.closest(e);if(n)return n}return o[0]||null}function ht(t,o){const e=document.createElement("span");e.className=`pv-recorded-click${o?" pv-recorded-click-disabled":""}`,e.style.left=`${t.clientX}px`,e.style.top=`${t.clientY}px`,document.documentElement.appendChild(e),setTimeout(()=>e.remove(),650)}function E(){z&&(z.textContent=String(w))}function tt(t=0){if(m=Math.max(m,t),w=m+g,N=!0,window!==window.top)return;if(document.querySelector("[data-pv-automation-toolbar]")){E();return}const e=document.createElement("div");e.dataset.pvAutomationToolbar="true",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483647","display:grid","grid-template-columns:auto 1fr","gap:10px 12px","padding:12px","min-width:250px","border:1px solid rgba(255,255,255,.14)","border-radius:16px","background:linear-gradient(145deg,#0f172a,#1e293b)","color:white","font:600 13px/1.2 system-ui,sans-serif","box-shadow:0 16px 42px rgba(15,23,42,.38)"].join(";"),e.innerHTML=`
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
  `,document.documentElement.appendChild(e),z=e.querySelector("[data-pv-recording-count]"),x=e.querySelector("[data-pv-recording-last]"),E();const i=e.querySelector("[data-pv-stop-recording]");i==null||i.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation(),N=!1,i.disabled=!0,i.textContent="Guardando secuencia…";try{const r=await chrome.runtime.sendMessage({action:"FINISH_AUTOMATION_RECORDING"});if(!(r!=null&&r.success))throw new Error((r==null?void 0:r.error)||"No se pudo guardar");e.remove(),z=null,x=null,w=0,m=0,g=0}catch{N=!0,i.disabled=!1,i.textContent="Reintentar guardar",x&&(x.textContent="No se pudo guardar. Inténtalo otra vez.",x.style.color="#fca5a5")}})}window.addEventListener("pointerdown",t=>{if(!N||t.button!==0||!t.isPrimary)return;const o=bt(t);if(!o||o.closest("[data-pv-automation-toolbar], #nexo-floating-clock-host, #nexo-reminder-alert"))return;const e=gt(o);if(!e.length)return;const i=xt(o),n=Q(o);ht(t,n),g+=1,w=m+g,x&&(x.textContent=n?`Último: ${i} · deshabilitado`:`Último: ${i}`,x.style.color=n?"#fbbf24":"#94a3b8"),E(),chrome.runtime.sendMessage({action:"RECORD_AUTOMATION_CLICK",step:{selector:e[0],fallbackSelectors:e.slice(1),pageUrl:window.location.href,frameUrl:window.location.href,label:i,disabledWhenRecorded:n}}).then(r=>{g=Math.max(0,g-1),r!=null&&r.success&&typeof r.count=="number"&&(m=Math.max(m,r.count)),w=m+g,E()}).catch(()=>{g=Math.max(0,g-1),w=m+g,E()})},!0);function yt(t){let o=null;for(const i of t){const n=document.querySelector(i);if(n instanceof HTMLElement){o=n;break}}if(!o)return{accepted:!1,retryable:!0,error:`No se encontró el elemento: ${t[0]}`};if(Q(o))return{accepted:!1,retryable:!0,error:"El control continúa deshabilitado"};o.scrollIntoView({behavior:"smooth",block:"center"});const e=o.style.outline;return o.style.outline="3px solid #6366f1",setTimeout(()=>{o.click(),setTimeout(()=>{o.style.outline=e},500)},100),{accepted:!0,success:!0}}chrome.runtime.onMessage.addListener((t,o,e)=>{if(t.action==="START_CLICK_RECORDING"){tt(t.count||0),e({success:!0});return}if(t.action==="PLAY_AUTOMATION_STEP"){e(yt([t.selector,...Array.isArray(t.fallbackSelectors)?t.fallbackSelectors:[]]));return}t.action==="UPDATE_RECORDING_COUNT"&&window===window.top&&(typeof t.count=="number"&&(m=Math.max(m,t.count),w=m+g,E()),x&&t.label&&(x.textContent=t.disabledWhenRecorded?`Último: ${t.label} · deshabilitado`:`Último: ${t.label}`,x.style.color=t.disabledWhenRecorded?"#fbbf24":"#94a3b8"),e({success:!0}))});chrome.runtime.sendMessage({action:"GET_ACTIVE_RECORDING"}).then(t=>{t!=null&&t.active&&tt(t.count||0)}).catch(()=>{});ut();K().forEach(J);mt();
