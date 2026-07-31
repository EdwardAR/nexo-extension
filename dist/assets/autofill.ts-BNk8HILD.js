(function(){function g(){return Array.from(document.querySelectorAll('input[type="password"]'))}function y(t){const e=t.form;if(!e)return null;const n=e.querySelectorAll('input:not([type="password"])');for(const r of n){const o=r,i=o.type.toLowerCase();if(i==="email"||i==="text"||o.name.toLowerCase().includes("user")||o.name.toLowerCase().includes("email")||o.name.toLowerCase().includes("login")||o.autocomplete==="username"||o.autocomplete==="email")return o}return null}function w(t){var r;const e=(r=t.parentElement)==null?void 0:r.querySelector(".pv-autofill-btn");if(e)return e;const n=document.createElement("button");return n.className="pv-autofill-btn",n.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,n.title="Password Vault - Autofill",n.addEventListener("click",o=>{o.preventDefault(),o.stopPropagation(),E(t,n)}),n}async function E(t,e){const n=document.querySelector(".pv-suggestions");n&&n.remove();const r=y(t),o=document.createElement("div");o.className="pv-suggestions",C(o,e),document.body.appendChild(o),c(o,"Buscando accesos…");try{const i=await chrome.runtime.sendMessage({action:"getAutofillData",url:window.location.href});i!=null&&i.success?!Array.isArray(i.suggestions)||i.suggestions.length===0?c(o,"No hay accesos para este sitio"):(o.replaceChildren(),i.suggestions.forEach(s=>{const a=document.createElement("div");a.className="pv-suggestion-item pv-suggestion-clickable",a.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${k(s.username)}</div>
          </div>
        `,a.addEventListener("click",()=>{r&&f(r,s.username),f(t,s.password),o.remove()}),o.appendChild(a)})):c(o,"Bóveda bloqueada — abre la extensión")}catch{c(o,"No se pudo acceder a la bóveda")}setTimeout(()=>{document.addEventListener("click",()=>o.remove(),{once:!0})},0)}function c(t,e){const n=document.createElement("div");n.className="pv-suggestion-item",n.textContent=e,t.replaceChildren(n)}function f(t,e){var r;const n=(r=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value"))==null?void 0:r.set;n==null||n.call(t,e),t.dispatchEvent(new Event("input",{bubbles:!0})),t.dispatchEvent(new Event("change",{bubbles:!0}))}function C(t,e){const n=e.getBoundingClientRect();t.style.position="fixed",t.style.top=`${n.bottom+4}px`,t.style.right=`${window.innerWidth-n.right}px`}function k(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}function A(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function h(t){var n;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const e=w(t);(n=t.parentElement)==null||n.appendChild(e)}function T(){new MutationObserver(()=>{g().forEach(h)}).observe(document.body,{childList:!0,subtree:!0})}let d=!1,l=0;function u(t){return CSS.escape(t)}function p(t){try{return document.querySelectorAll(t).length===1}catch{return!1}}function L(t){if(t.id){const r=`#${u(t.id)}`;if(p(r))return r}for(const r of["data-testid","data-test","data-cy","name","aria-label"]){const o=t.getAttribute(r);if(!o)continue;const i=`${t.tagName.toLowerCase()}[${r}="${u(o)}"]`;if(p(i))return i}const e=[];let n=t;for(;n&&n!==document.documentElement&&e.length<7;){let r=n.tagName.toLowerCase();const o=Array.from(n.classList).filter(a=>!a.startsWith("pv-")&&!/\d{3,}/.test(a)).slice(0,2);o.length&&(r+=o.map(a=>`.${u(a)}`).join(""));const i=n.parentElement;if(i){const a=n.tagName,m=Array.from(i.children).filter(x=>x.tagName===a);m.length>1&&(r+=`:nth-of-type(${m.indexOf(n)+1})`)}e.unshift(r);const s=e.join(" > ");if(p(s))return s;n=i}return e.join(" > ")}function S(t){var e;return t.getAttribute("aria-label")||t.getAttribute("title")||((e=t.textContent)==null?void 0:e.trim().replace(/\s+/g," ").slice(0,80))||t.tagName.toLowerCase()}function v(){const t=document.querySelector("[data-pv-recording-count]");t&&(t.textContent=`${l} clic${l===1?"":"s"}`)}function b(t=0){var n,r;l=t,d=!0,(n=document.querySelector("[data-pv-automation-toolbar]"))==null||n.remove();const e=document.createElement("div");e.dataset.pvAutomationToolbar="true",e.style.cssText=["position:fixed","right:18px","bottom:18px","z-index:2147483647","display:flex","align-items:center","gap:10px","padding:10px 12px","border-radius:12px","background:#0f172a","color:white","font:600 13px/1.2 system-ui,sans-serif","box-shadow:0 8px 30px rgba(0,0,0,.3)"].join(";"),e.innerHTML=`
    <span style="width:9px;height:9px;border-radius:999px;background:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.2)"></span>
    <span>Grabando · <span data-pv-recording-count></span></span>
    <button data-pv-stop-recording style="border:0;border-radius:8px;padding:7px 10px;background:#fff;color:#0f172a;font:700 12px system-ui;cursor:pointer">Terminar y guardar</button>
  `,document.documentElement.appendChild(e),v(),(r=e.querySelector("[data-pv-stop-recording]"))==null||r.addEventListener("click",async o=>{o.preventDefault(),o.stopPropagation(),d=!1,e.remove(),await chrome.runtime.sendMessage({action:"FINISH_AUTOMATION_RECORDING"})})}document.addEventListener("click",t=>{if(!d)return;const e=t.target instanceof Element?t.target.closest('button, a, input, select, [role="button"], [onclick]')||t.target:null;if(!e||e.closest("[data-pv-automation-toolbar]"))return;const n=L(e);n&&(l+=1,v(),chrome.runtime.sendMessage({action:"RECORD_AUTOMATION_CLICK",step:{selector:n,pageUrl:window.location.href,label:S(e)}}).catch(()=>{}))},!0);async function I(t){for(let e=0;e<20;e+=1){const n=document.querySelector(t);if(n instanceof HTMLElement)return n;await new Promise(r=>setTimeout(r,250))}return null}async function N(t){const e=await I(t);if(!e)throw new Error(`No se encontró el elemento: ${t}`);e.scrollIntoView({behavior:"smooth",block:"center"});const n=e.style.outline;e.style.outline="3px solid #6366f1",await new Promise(r=>setTimeout(r,300)),setTimeout(()=>{e.click(),setTimeout(()=>{e.style.outline=n},500)},50)}chrome.runtime.onMessage.addListener((t,e,n)=>{if(t.action==="START_CLICK_RECORDING"){b(t.count||0),n({success:!0});return}if(t.action==="PLAY_AUTOMATION_STEP")return N(t.selector).then(()=>n({success:!0})).catch(r=>n({success:!1,error:String(r)})),!0});chrome.runtime.sendMessage({action:"GET_ACTIVE_RECORDING"}).then(t=>{t!=null&&t.active&&b(t.count||0)}).catch(()=>{});A();g().forEach(h);T();
})()
