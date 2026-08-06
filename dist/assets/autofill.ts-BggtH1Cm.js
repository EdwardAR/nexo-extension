import{F as P,i as V,l as Z,s as K,a as J}from"./floating-clock-7l2wMrGf.js";function j(){return Array.from(document.querySelectorAll('input[type="password"]'))}function Q(t){const o=t.form;if(!o)return null;const e=o.querySelectorAll('input:not([type="password"])');for(const i of e){const n=i,r=n.type.toLowerCase();if(r==="email"||r==="text"||n.name.toLowerCase().includes("user")||n.name.toLowerCase().includes("email")||n.name.toLowerCase().includes("login")||n.autocomplete==="username"||n.autocomplete==="email")return n}return null}function tt(t){var i;const o=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(o)return o;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Nexo - Autocompletar",e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),et(t,e)}),e}async function et(t,o){const e=document.querySelector(".pv-suggestions");e&&e.remove();const i=Q(t),n=document.createElement("div");n.className="pv-suggestions",ot(n,o),document.body.appendChild(n),S(n,"Buscando accesos…");try{const r=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});r!=null&&r.success?!Array.isArray(r.suggestions)||r.suggestions.length===0?S(n,"No hay accesos para este sitio"):(n.replaceChildren(),r.suggestions.forEach(l=>{const s=document.createElement("div");s.className="pv-suggestion-item pv-suggestion-clickable",s.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${nt(l.username)}</div>
          </div>
        `,s.addEventListener("click",()=>{i&&_(i,l.username),_(t,l.password),n.remove()}),n.appendChild(s)})):S(n,"Bóveda bloqueada — abre la extensión")}catch{S(n,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>n.remove(),{once:!0})},0)}function S(t,o){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=o,t.replaceChildren(e)}function _(t,o){var i;const e=(i=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:i.set;e==null||e.call(t,o),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function ot(t,o){const e=o.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function nt(t){const o=document.createElement("div");return o.textContent=t,o.innerHTML}function it(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function B(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const o=tt(t);(e=t.parentElement)==null||e.appendChild(o)}function rt(){new MutationObserver(()=>{j().forEach(B)}).observe(document.body,{childList:!0,subtree:!0})}let M=!1,h=0,d=0,p=0,N=null,u=null;function w(t){return CSS.escape(t)}function at(t){try{return document.querySelectorAll(t).length===1}catch{return!1}}function st(t){const o=[],e=s=>{s&&at(s)&&!o.includes(s)&&o.push(s)};t.id&&e(`#${w(t.id)}`);for(const s of["data-control-name","data-testid","data-test","data-cy","aria-label","name","title"]){const f=t.getAttribute(s);f&&(e(`${t.tagName.toLowerCase()}[${s}="${w(f)}"]`),e(`[${s}="${w(f)}"]`))}const i=t.getAttribute("role"),n=t.getAttribute("aria-label");i&&n&&e(`[role="${w(i)}"][aria-label="${w(n)}"]`);const r=[];let l=t;for(;l&&l!==document.documentElement&&r.length<7;){let s=l.tagName.toLowerCase();const f=Array.from(l.classList).filter(c=>!c.startsWith("pv-")&&!/\d{3,}/.test(c)).slice(0,2);f.length&&(s+=f.map(c=>`.${w(c)}`).join(""));const b=l.parentElement;if(b){const c=l.tagName,g=Array.from(b.children).filter(y=>y.tagName===c);g.length>1&&(s+=`:nth-of-type(${g.indexOf(l)+1})`)}r.unshift(s);const T=r.join(" > ");e(T),l=b}return o}function lt(t){var o;return t.getAttribute("data-control-name")||t.getAttribute("aria-label")||t.getAttribute("title")||((o=t.textContent)==null?void 0:o.trim().replace(/\s+/g," ").slice(0,80))||t.tagName.toLowerCase()}function U(t){return t.matches(":disabled")||t.getAttribute("aria-disabled")==="true"||"disabled"in t&&!!t.disabled}function ct(t){const o=t.composedPath().filter(i=>i instanceof Element),e=["[data-control-name]","[data-testid]","button","a","input","select",'[role="button"]','[role="menuitem"]','[role="option"]','[role="tab"]',"[onclick]","[tabindex]"].join(",");for(const i of o){if(i.matches(e))return i;const n=i.closest(e);if(n)return n}return o[0]||null}function dt(t,o){const e=document.createElement("span");e.className=`pv-recorded-click${o?" pv-recorded-click-disabled":""}`,e.style.left=`${t.clientX}px`,e.style.top=`${t.clientY}px`,document.documentElement.appendChild(e),setTimeout(()=>e.remove(),650)}function k(){N&&(N.textContent=String(h))}function Y(t=0){if(d=Math.max(d,t),h=d+p,M=!0,window!==window.top)return;if(document.querySelector("[data-pv-automation-toolbar]")){k();return}const e=document.createElement("div");e.dataset.pvAutomationToolbar="true",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483647","display:grid","grid-template-columns:auto 1fr","gap:10px 12px","padding:12px","min-width:250px","border:1px solid rgba(255,255,255,.14)","border-radius:16px","background:linear-gradient(145deg,#0f172a,#1e293b)","color:white","font:600 13px/1.2 system-ui,sans-serif","box-shadow:0 16px 42px rgba(15,23,42,.38)"].join(";"),e.innerHTML=`
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
  `,document.documentElement.appendChild(e),N=e.querySelector("[data-pv-recording-count]"),u=e.querySelector("[data-pv-recording-last]"),k();const i=e.querySelector("[data-pv-stop-recording]");i==null||i.addEventListener("click",async n=>{n.preventDefault(),n.stopPropagation(),M=!1,i.disabled=!0,i.textContent="Guardando secuencia…";try{const r=await chrome.runtime.sendMessage({action:"FINISH_AUTOMATION_RECORDING"});if(!(r!=null&&r.success))throw new Error((r==null?void 0:r.error)||"No se pudo guardar");e.remove(),N=null,u=null,h=0,d=0,p=0}catch{M=!0,i.disabled=!1,i.textContent="Reintentar guardar",u&&(u.textContent="No se pudo guardar. Inténtalo otra vez.",u.style.color="#fca5a5")}})}window.addEventListener("pointerdown",t=>{if(!M||t.button!==0||!t.isPrimary)return;const o=ct(t);if(!o||o.closest("[data-pv-automation-toolbar], #nexo-floating-clock-host, #nexo-reminder-alert"))return;const e=st(o);if(!e.length)return;const i=lt(o),n=U(o);dt(t,n),p+=1,h=d+p,u&&(u.textContent=n?`Último: ${i} · deshabilitado`:`Último: ${i}`,u.style.color=n?"#fbbf24":"#94a3b8"),k(),chrome.runtime.sendMessage({action:"RECORD_AUTOMATION_CLICK",step:{selector:e[0],fallbackSelectors:e.slice(1),pageUrl:window.location.href,frameUrl:window.location.href,label:i,disabledWhenRecorded:n}}).then(r=>{p=Math.max(0,p-1),r!=null&&r.success&&typeof r.count=="number"&&(d=Math.max(d,r.count)),h=d+p,k()}).catch(()=>{p=Math.max(0,p-1),h=d+p,k()})},!0);function pt(t){let o=null;for(const i of t){const n=document.querySelector(i);if(n instanceof HTMLElement){o=n;break}}if(!o)return{accepted:!1,retryable:!0,error:`No se encontró el elemento: ${t[0]}`};if(U(o))return{accepted:!1,retryable:!0,error:"El control continúa deshabilitado"};o.scrollIntoView({behavior:"smooth",block:"center"});const e=o.style.outline;return o.style.outline="3px solid #6366f1",setTimeout(()=>{o.click(),setTimeout(()=>{o.style.outline=e},500)},100),{accepted:!0,success:!0}}function ut(t,o){var l;if(window!==window.top)return;(l=document.getElementById("nexo-reminder-alert"))==null||l.remove();const e=document.createElement("aside");e.id="nexo-reminder-alert",e.setAttribute("role","alert"),e.style.cssText=["position:fixed","right:20px","top:20px","z-index:2147483647","width:min(340px,calc(100vw - 40px))","box-sizing:border-box","padding:16px","border:1px solid rgba(103,232,249,.45)","border-radius:18px","background:linear-gradient(135deg,#0f172a,#312e81 58%,#0e7490)","box-shadow:0 20px 55px rgba(15,23,42,.4)","color:#fff","font:14px/1.45 system-ui,-apple-system,sans-serif"].join(";");const i=document.createElement("strong");i.textContent=`🔔 ${t}`,i.style.cssText="display:block;padding-right:28px;font-size:15px;margin-bottom:5px";const n=document.createElement("div");n.textContent=o,n.style.cssText="color:#cffafe;font-size:13px";const r=document.createElement("button");r.type="button",r.textContent="×",r.setAttribute("aria-label","Cerrar recordatorio"),r.style.cssText="position:absolute;right:10px;top:8px;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer",r.addEventListener("click",()=>e.remove()),e.append(i,n,r),document.documentElement.appendChild(e),setTimeout(()=>e.remove(),3e4)}let A,C;function z(){var t;A!==void 0&&window.clearInterval(A),A=void 0,C&&window.removeEventListener("resize",C),C=void 0,(t=document.getElementById("nexo-floating-clock-host"))==null||t.remove()}async function W(){var R;if(window!==window.top||document.getElementById("nexo-floating-clock-host"))return;const t=document.createElement("div");t.id="nexo-floating-clock-host",t.style.cssText='all:initial;position:fixed;left:0;top:0;z-index:2147483646;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;visibility:hidden;touch-action:none';const o=t.attachShadow({mode:"open"});o.innerHTML=`
    <style>
      *{box-sizing:border-box}
      .clock{width:246px;border:1px solid rgba(255,255,255,.2);border-radius:15px;background:radial-gradient(circle at 95% 0%,rgba(34,211,238,.2),transparent 38%),linear-gradient(120deg,#020617 0%,#312e81 64%,#0e7490 100%);box-shadow:0 12px 32px rgba(15,23,42,.3);color:#fff;overflow:hidden;transition:width .2s ease,box-shadow .2s ease;font-family:inherit}.clock.open{width:276px}.clock:hover{box-shadow:0 16px 38px rgba(15,23,42,.36)}
      .drag{display:flex;align-items:center;justify-content:space-between;height:20px;padding:4px 9px 1px;color:#a5f3fc;cursor:grab;user-select:none}.drag:active{cursor:grabbing}.brand{display:flex;align-items:center;gap:5px;font-size:7px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.live{width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 7px #34d399}.grip{color:rgba(255,255,255,.4);font-size:12px;letter-spacing:1px}
      .main{display:flex;width:100%;align-items:center;gap:9px;border:0;background:transparent;padding:4px 10px 9px;color:inherit;text-align:left;cursor:pointer}
      .flag{position:relative;display:grid;width:32px;height:32px;flex:none;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.1);font-size:16px}.period{position:absolute;right:-3px;bottom:-3px;display:grid;width:14px;height:14px;place-items:center;border-radius:50%;background:#172554;font-size:8px}
      .copy{min-width:0;flex:1}.city{display:block;color:#a5f3fc;font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.time{display:block;margin-top:1px;font:750 18px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:-.04em}.zone-pill{align-self:center;border:1px solid rgba(165,243,252,.2);border-radius:999px;background:rgba(8,145,178,.18);padding:3px 6px;color:#cffafe;font-size:8px;font-weight:800}
      .chevron{color:#a5b4fc;font-size:11px;transition:transform .2s}.clock.open .chevron{transform:rotate(180deg)}
      .details{display:none;border-top:1px solid rgba(255,255,255,.11);padding:7px 10px 8px;background:rgba(2,6,23,.22)}.clock.open .details{display:block}.date{margin:0 0 7px;color:#c7d2fe;font-size:9px;text-transform:capitalize}
      .info{display:flex;align-items:center;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(255,255,255,.055);padding:6px 0}.tile{min-width:0;flex:1;padding:0 7px;text-align:left}.tile+.tile{border-left:1px solid rgba(255,255,255,.11)}.label{display:block;color:#94a3b8;font-size:7px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}.value{display:block;margin-top:2px;color:#fff;font-size:9px;font-weight:700;white-space:nowrap}.value.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:11px}.work{color:#6ee7b7}
      .footer{display:flex;align-items:center;justify-content:space-between;margin-top:6px}.updated{color:#67e8f9;font-size:7px}.close{border:0;border-radius:6px;background:transparent;padding:3px 5px;color:#94a3b8;font:600 8px inherit;cursor:pointer}.close:hover{background:rgba(248,113,113,.16);color:#fecaca}
      @media (prefers-reduced-motion:reduce){.clock,.chevron{transition:none}}
    </style>
    <section class="clock" aria-label="Reloj de España">
      <div class="drag" title="Arrastra para mover"><span class="brand"><i class="live"></i>Nexo World Time</span><span class="grip">⠿</span></div>
      <button class="main" type="button" aria-expanded="false">
        <span class="flag">🇪🇸<i class="period">☀️</i></span><span class="copy"><span class="city">Madrid · España</span><span class="time">--:--:--</span></span><span class="zone-pill">CEST</span><span class="chevron">⌄</span>
      </button>
      <div class="details">
        <p class="date"></p>
        <div class="info">
          <div class="tile"><span class="label">🇵🇪 Lima</span><strong class="value mono lima">--:--</strong></div>
          <div class="tile"><span class="label">Diferencia</span><strong class="value difference">+7 h</strong></div>
          <div class="tile"><span class="label">Estado</span><strong class="value work">Laboral</strong></div>
        </div>
        <div class="footer"><span class="updated">● En vivo</span><button class="close" type="button">Desactivar</button></div>
      </div>
    </section>`;const e=o.querySelector(".clock"),i=o.querySelector(".main"),n=o.querySelector(".time"),r=o.querySelector(".date"),l=o.querySelector(".lima"),s=o.querySelector(".difference"),f=o.querySelector(".zone-pill"),b=o.querySelector(".work"),T=o.querySelector(".period"),c=o.querySelector(".drag");if(!(e instanceof HTMLElement)||!(i instanceof HTMLButtonElement)||!(n instanceof HTMLElement)||!(r instanceof HTMLElement)||!(l instanceof HTMLElement)||!(s instanceof HTMLElement)||!(f instanceof HTMLElement)||!(b instanceof HTMLElement)||!(T instanceof HTMLElement)||!(c instanceof HTMLElement))return;document.documentElement.appendChild(t);const g=await Z(),y=(a,m)=>({x:Math.max(8,Math.min(a,window.innerWidth-t.offsetWidth-8)),y:Math.max(8,Math.min(m,window.innerHeight-t.offsetHeight-8))}),I=y((g==null?void 0:g.x)??window.innerWidth-214,(g==null?void 0:g.y)??84);t.style.left=`${I.x}px`,t.style.top=`${I.y}px`,t.style.visibility="visible";const $=()=>{var D,O;const a=new Date;n.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(a),r.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"Europe/Madrid",weekday:"long",day:"numeric",month:"long"}).format(a),l.textContent=new Intl.DateTimeFormat("es-PE",{timeZone:"America/Lima",hour:"2-digit",minute:"2-digit",hour12:!1}).format(a);const m=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Madrid",hour:"2-digit",hour12:!1,timeZoneName:"short"}).formatToParts(a),L=Number(((D=m.find(E=>E.type==="hour"))==null?void 0:D.value)||0);f.textContent=((O=m.find(E=>E.type==="timeZoneName"))==null?void 0:O.value)||"Madrid";const H=E=>{const v=Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:E,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(a).map(F=>[F.type,F.value])),X=Date.UTC(Number(v.year),Number(v.month)-1,Number(v.day),Number(v.hour),Number(v.minute),Number(v.second));return Math.round((X-Math.floor(a.getTime()/1e3)*1e3)/36e5)},G=H("Europe/Madrid")-H("America/Lima");s.textContent=`+${G} h`;const q=L>=9&&L<18;b.textContent=q?"Laboral":"No laboral",b.style.color=q?"#6ee7b7":"#fcd34d",T.textContent=L>=7&&L<21?"☀️":"🌙"};i.addEventListener("click",()=>{const a=e.classList.toggle("open");i.setAttribute("aria-expanded",String(a));const m=y(t.offsetLeft,t.offsetTop);t.style.left=`${m.x}px`,t.style.top=`${m.y}px`});let x=null;c.addEventListener("pointerdown",a=>{x={pointerX:a.clientX,pointerY:a.clientY,hostX:t.offsetLeft,hostY:t.offsetTop},c.setPointerCapture(a.pointerId),a.preventDefault()}),c.addEventListener("pointermove",a=>{if(!x)return;const m=y(x.hostX+a.clientX-x.pointerX,x.hostY+a.clientY-x.pointerY);t.style.left=`${m.x}px`,t.style.top=`${m.y}px`}),c.addEventListener("pointerup",a=>{x&&(x=null,c.releasePointerCapture(a.pointerId),K({x:t.offsetLeft,y:t.offsetTop}))}),C=()=>{const a=y(t.offsetLeft,t.offsetTop);t.style.left=`${a.x}px`,t.style.top=`${a.y}px`},window.addEventListener("resize",C),(R=o.querySelector(".close"))==null||R.addEventListener("click",()=>{J(!1),z()}),$(),A=window.setInterval($,1e3)}async function mt(){window===window.top&&(await V()?await W():z())}chrome.runtime.onMessage.addListener((t,o,e)=>{if(t.action==="SHOW_NEXO_REMINDER"){ut(String(t.title||"Recordatorio de Nexo"),String(t.message||"")),e({success:!0});return}if(t.action==="START_CLICK_RECORDING"){Y(t.count||0),e({success:!0});return}if(t.action==="PLAY_AUTOMATION_STEP"){e(pt([t.selector,...Array.isArray(t.fallbackSelectors)?t.fallbackSelectors:[]]));return}t.action==="UPDATE_RECORDING_COUNT"&&window===window.top&&(typeof t.count=="number"&&(d=Math.max(d,t.count),h=d+p,k()),u&&t.label&&(u.textContent=t.disabledWhenRecorded?`Último: ${t.label} · deshabilitado`:`Último: ${t.label}`,u.style.color=t.disabledWhenRecorded?"#fbbf24":"#94a3b8"),e({success:!0}))});chrome.runtime.sendMessage({action:"GET_ACTIVE_RECORDING"}).then(t=>{t!=null&&t.active&&Y(t.count||0)}).catch(()=>{});it();j().forEach(B);rt();mt();chrome.storage.onChanged.addListener((t,o)=>{o==="local"&&P in t&&(t[P].newValue===!0?W():z())});
