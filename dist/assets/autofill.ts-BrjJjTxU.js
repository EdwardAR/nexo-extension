(function(){function E(){return Array.from(document.querySelectorAll('input[type="password"]'))}function I(t){const n=t.form;if(!n)return null;const e=n.querySelectorAll('input:not([type="password"])');for(const o of e){const r=o,i=r.type.toLowerCase();if(i==="email"||i==="text"||r.name.toLowerCase().includes("user")||r.name.toLowerCase().includes("email")||r.name.toLowerCase().includes("login")||r.autocomplete==="username"||r.autocomplete==="email")return r}return null}function M(t){var o;const n=(o=t.parentElement)==null?void 0:o.querySelector(".pv-autofill-btn");if(n)return n;const e=document.createElement("button");return e.className="pv-autofill-btn",e.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,e.title="Password Vault - Autofill",e.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),N(t,e)}),e}async function N(t,n){const e=document.querySelector(".pv-suggestions");e&&e.remove();const o=I(t),r=document.createElement("div");r.className="pv-suggestions",R(r,n),document.body.appendChild(r),b(r,"Buscando accesos…");try{const i=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});i!=null&&i.success?!Array.isArray(i.suggestions)||i.suggestions.length===0?b(r,"No hay accesos para este sitio"):(r.replaceChildren(),i.suggestions.forEach(s=>{const a=document.createElement("div");a.className="pv-suggestion-item pv-suggestion-clickable",a.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${O(s.username)}</div>
          </div>
        `,a.addEventListener("click",()=>{o&&w(o,s.username),w(t,s.password),r.remove()}),r.appendChild(a)})):b(r,"Bóveda bloqueada — abre la extensión")}catch{b(r,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>r.remove(),{once:!0})},0)}function b(t,n){const e=document.createElement("div");e.className="pv-suggestion-item",e.textContent=n,t.replaceChildren(e)}function w(t,n){var o;const e=(o=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:o.set;e==null||e.call(t,n),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function R(t,n){const e=n.getBoundingClientRect();t.style.position="fixed",t.style.top=`${e.bottom+4}px`,t.style.right=`${window.innerWidth-e.right}px`}function O(t){const n=document.createElement("div");return n.textContent=t,n.innerHTML}function $(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function C(t){var e;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const n=M(t);(e=t.parentElement)==null||e.appendChild(n)}function q(){new MutationObserver(()=>{E().forEach(C)}).observe(document.body,{childList:!0,subtree:!0})}let h=!1,u=0,c=0,l=0,x=null,d=null;function f(t){return CSS.escape(t)}function _(t){try{return document.querySelectorAll(t).length===1}catch{return!1}}function P(t){const n=[],e=a=>{a&&_(a)&&!n.includes(a)&&n.push(a)};t.id&&e(`#${f(t.id)}`);for(const a of["data-control-name","data-testid","data-test","data-cy","aria-label","name","title"]){const p=t.getAttribute(a);p&&(e(`${t.tagName.toLowerCase()}[${a}="${f(p)}"]`),e(`[${a}="${f(p)}"]`))}const o=t.getAttribute("role"),r=t.getAttribute("aria-label");o&&r&&e(`[role="${f(o)}"][aria-label="${f(r)}"]`);const i=[];let s=t;for(;s&&s!==document.documentElement&&i.length<7;){let a=s.tagName.toLowerCase();const p=Array.from(s.classList).filter(m=>!m.startsWith("pv-")&&!/\d{3,}/.test(m)).slice(0,2);p.length&&(a+=p.map(m=>`.${f(m)}`).join(""));const v=s.parentElement;if(v){const m=s.tagName,y=Array.from(v.children).filter(L=>L.tagName===m);y.length>1&&(a+=`:nth-of-type(${y.indexOf(s)+1})`)}i.unshift(a);const S=i.join(" > ");e(S),s=v}return n}function U(t){var n;return t.getAttribute("data-control-name")||t.getAttribute("aria-label")||t.getAttribute("title")||((n=t.textContent)==null?void 0:n.trim().replace(/\s+/g," ").slice(0,80))||t.tagName.toLowerCase()}function k(t){return t.matches(":disabled")||t.getAttribute("aria-disabled")==="true"||"disabled"in t&&!!t.disabled}function j(t){const n=t.composedPath().filter(o=>o instanceof Element),e=["[data-control-name]","[data-testid]","button","a","input","select",'[role="button"]','[role="menuitem"]','[role="option"]','[role="tab"]',"[onclick]","[tabindex]"].join(",");for(const o of n){if(o.matches(e))return o;const r=o.closest(e);if(r)return r}return n[0]||null}function z(t,n){const e=document.createElement("span");e.className=`pv-recorded-click${n?" pv-recorded-click-disabled":""}`,e.style.left=`${t.clientX}px`,e.style.top=`${t.clientY}px`,document.documentElement.appendChild(e),setTimeout(()=>e.remove(),650)}function g(){x&&(x.textContent=String(u))}function T(t=0){if(c=Math.max(c,t),u=c+l,h=!0,window!==window.top)return;if(document.querySelector("[data-pv-automation-toolbar]")){g();return}const e=document.createElement("div");e.dataset.pvAutomationToolbar="true",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483647","display:grid","grid-template-columns:auto 1fr","gap:10px 12px","padding:12px","min-width:250px","border:1px solid rgba(255,255,255,.14)","border-radius:16px","background:linear-gradient(145deg,#0f172a,#1e293b)","color:white","font:600 13px/1.2 system-ui,sans-serif","box-shadow:0 16px 42px rgba(15,23,42,.38)"].join(";"),e.innerHTML=`
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
  `,document.documentElement.appendChild(e),x=e.querySelector("[data-pv-recording-count]"),d=e.querySelector("[data-pv-recording-last]"),g();const o=e.querySelector("[data-pv-stop-recording]");o==null||o.addEventListener("click",async r=>{r.preventDefault(),r.stopPropagation(),h=!1,o.disabled=!0,o.textContent="Guardando secuencia…";try{const i=await chrome.runtime.sendMessage({action:"FINISH_AUTOMATION_RECORDING"});if(!(i!=null&&i.success))throw new Error((i==null?void 0:i.error)||"No se pudo guardar");e.remove(),x=null,d=null,u=0,c=0,l=0}catch{h=!0,o.disabled=!1,o.textContent="Reintentar guardar",d&&(d.textContent="No se pudo guardar. Inténtalo otra vez.",d.style.color="#fca5a5")}})}window.addEventListener("pointerdown",t=>{if(!h||t.button!==0||!t.isPrimary)return;const n=j(t);if(!n||n.closest("[data-pv-automation-toolbar]"))return;const e=P(n);if(!e.length)return;const o=U(n),r=k(n);z(t,r),l+=1,u=c+l,d&&(d.textContent=r?`Último: ${o} · deshabilitado`:`Último: ${o}`,d.style.color=r?"#fbbf24":"#94a3b8"),g(),chrome.runtime.sendMessage({action:"RECORD_AUTOMATION_CLICK",step:{selector:e[0],fallbackSelectors:e.slice(1),pageUrl:window.location.href,frameUrl:window.location.href,label:o,disabledWhenRecorded:r}}).then(i=>{l=Math.max(0,l-1),i!=null&&i.success&&typeof i.count=="number"&&(c=Math.max(c,i.count)),u=c+l,g()}).catch(()=>{l=Math.max(0,l-1),u=c+l,g()})},!0);async function A(t){for(let n=0;n<20;n+=1){for(const e of t){const o=document.querySelector(e);if(o instanceof HTMLElement)return o}await new Promise(e=>setTimeout(e,250))}return null}async function D(t,n){let e=n;for(let o=0;o<60;o+=1){if(!k(e))return e;await new Promise(r=>setTimeout(r,250)),e=await A(t)||e}throw new Error("El control continúa deshabilitado después de 15 segundos")}async function H(t){const n=await A(t);if(!n)throw new Error(`No se encontró el elemento: ${t[0]}`);const e=await D(t,n);e.scrollIntoView({behavior:"smooth",block:"center"});const o=e.style.outline;e.style.outline="3px solid #6366f1",await new Promise(r=>setTimeout(r,300)),setTimeout(()=>{e.click(),setTimeout(()=>{e.style.outline=o},500)},50)}chrome.runtime.onMessage.addListener((t,n,e)=>{if(t.action==="START_CLICK_RECORDING"){T(t.count||0),e({success:!0});return}if(t.action==="PLAY_AUTOMATION_STEP"){e({success:!0,accepted:!0}),H([t.selector,...Array.isArray(t.fallbackSelectors)?t.fallbackSelectors:[]]).then(()=>chrome.runtime.sendMessage({action:"AUTOMATION_STEP_RESULT",requestId:t.requestId,success:!0})).catch(o=>chrome.runtime.sendMessage({action:"AUTOMATION_STEP_RESULT",requestId:t.requestId,success:!1,error:o instanceof Error?o.message:String(o)})).catch(()=>{});return}t.action==="UPDATE_RECORDING_COUNT"&&window===window.top&&(typeof t.count=="number"&&(c=Math.max(c,t.count),u=c+l,g()),d&&t.label&&(d.textContent=t.disabledWhenRecorded?`Último: ${t.label} · deshabilitado`:`Último: ${t.label}`,d.style.color=t.disabledWhenRecorded?"#fbbf24":"#94a3b8"),e({success:!0}))});chrome.runtime.sendMessage({action:"GET_ACTIVE_RECORDING"}).then(t=>{t!=null&&t.active&&T(t.count||0)}).catch(()=>{});$();E().forEach(C);q();
})()
