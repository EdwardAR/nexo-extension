(function(){let u=[];function l(){return Array.from(document.querySelectorAll('input[type="password"]'))}function d(t){const o=t.form;if(!o)return null;const n=o.querySelectorAll('input:not([type="password"])');for(const i of n){const e=i,a=e.type.toLowerCase();if(a==="email"||a==="text"||e.name.toLowerCase().includes("user")||e.name.toLowerCase().includes("email")||e.name.toLowerCase().includes("login")||e.autocomplete==="username"||e.autocomplete==="email")return e}return null}function g(t){var i;const o=(i=t.parentElement)==null?void 0:i.querySelector(".pv-autofill-btn");if(o)return o;const n=document.createElement("button");return n.className="pv-autofill-btn",n.innerHTML=`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,n.title="Password Vault - Autofill",n.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation(),v(t,n)}),n}function v(t,o){const n=document.querySelector(".pv-suggestions");n&&n.remove();const i=d(t),e=document.createElement("div");e.className="pv-suggestions",chrome.storage.local.get("password_vault").then(a=>{if(!a.password_vault){e.innerHTML='<div class="pv-suggestion-item">Vault locked - open extension</div>';return}const m=window.location.hostname,p=u.filter(r=>r.site.includes(m));p.length===0?e.innerHTML='<div class="pv-suggestion-item">No passwords for this site</div>':p.forEach(r=>{const s=document.createElement("div");s.className="pv-suggestion-item pv-suggestion-clickable",s.innerHTML=`
          <div class="pv-suggestion-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div class="pv-suggestion-text">
            <div class="pv-suggestion-username">${h(r.username)}</div>
          </div>
        `,s.addEventListener("click",()=>{i&&(i.value=r.username,i.dispatchEvent(new Event("input",{bubbles:!0}))),t.value=r.password,t.dispatchEvent(new Event("input",{bubbles:!0})),e.remove()}),e.appendChild(s)}),f(e,o),document.body.appendChild(e),setTimeout(()=>{document.addEventListener("click",()=>e.remove(),{once:!0})},0)})}function f(t,o){const n=o.getBoundingClientRect();t.style.position="fixed",t.style.top=`${n.bottom+4}px`,t.style.right=`${window.innerWidth-n.right}px`}function h(t){const o=document.createElement("div");return o.textContent=t,o.innerHTML}function x(){const t=document.createElement("style");t.textContent=`
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
  `,document.head.appendChild(t)}function c(t){var n;if(t.dataset.pvAttached)return;t.dataset.pvAttached="true",t.parentElement&&(t.parentElement.style.position="relative");const o=g(t);(n=t.parentElement)==null||n.appendChild(o)}function b(){new MutationObserver(()=>{l().forEach(c)}).observe(document.body,{childList:!0,subtree:!0})}x();l().forEach(c);b();
})()
