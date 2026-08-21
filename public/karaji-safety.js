(function () {
  "use strict";

  const C = {
    asphalt: "#14171C",
    panel: "#1D2129",
    line: "#2A2F38",
    cream: "#F2ECDD",
    dim: "#B9B2A0",
    amber: "#F5B942",
  };

  function isArabic() {
    return document.documentElement.dir === "rtl" || document.documentElement.lang === "ar";
  }

  function replaceText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      const value = textNode.nodeValue || "";
      const next = value
        .replace(/Diagnose car issues & find trusted garages/g, "Diagnose car issues & find nearby garages")
        .replace(/Trusted garages/g, "Garage directory")
        .replace(/trusted garages/g, "nearby garages")
        .replace(/شخّص مشاكل سيارتك واعثر على ورش موثوقة/g, "شخّص مشاكل سيارتك واعثر على ورش قريبة")
        .replace(/اعثر على ورش موثوقة/g, "اعثر على ورش قريبة")
        .replace(/ورش موثوقة/g, "دليل الورش");
      if (next !== value) textNode.nodeValue = next;
    });
  }

  function normalizedText(value) {
    return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  // The paid button can contain two plus signs because one comes from
  // the icon and another is part of the label: "++ Add Your Garage".
  // Keep the FREE version visible; hide only the exact paid CTA.
  function isPaidGarageLabel(value) {
    const text = normalizedText(value);
    return /^(?:\+\s*)+(add your garage|أضف جراجك|ضيف جراجك)$/.test(text);
  }

  function findGarageButton() {
    const candidates = Array.from(document.querySelectorAll("button, a"));
    return candidates.find((el) => {
      const text = normalizedText(el.textContent);
      return text.includes("add your garage") || text.includes("أضف جراجك") || text.includes("ضيف جراجك");
    });
  }

  function openAbout() {
    let modal = document.getElementById("karaji-about-modal");
    if (modal) { modal.style.display = "flex"; return; }
    const ar = isArabic();
    modal = document.createElement("div");
    modal.id = "karaji-about-modal";
    Object.assign(modal.style, { position:"fixed", inset:"0", zIndex:"100000", display:"flex", alignItems:"center", justifyContent:"center", padding:"18px", background:"rgba(0,0,0,.68)", direction:ar?"rtl":"ltr" });
    const card = document.createElement("div");
    Object.assign(card.style, { width:"min(520px, 100%)", maxHeight:"82vh", overflow:"auto", background:C.panel, border:`1px solid ${C.line}`, borderRadius:"18px", padding:"22px", color:C.cream, boxShadow:"0 18px 60px rgba(0,0,0,.4)", position:"relative" });
    const close = document.createElement("button");
    close.type="button"; close.textContent="×";
    Object.assign(close.style, { position:"absolute", top:"10px", [ar?"left":"right"]:"10px", width:"34px", height:"34px", borderRadius:"50%", border:`1px solid ${C.line}`, background:C.asphalt, color:C.cream, fontSize:"22px", cursor:"pointer" });
    close.onclick=()=>{modal.style.display="none";};
    const title=document.createElement("h2"); title.textContent=ar?"عن كراجي":"About Karaji"; Object.assign(title.style,{margin:ar?"0 0 10px 42px":"0 42px 10px 0",color:C.amber,fontSize:"24px"});
    const p1=document.createElement("p"); p1.textContent=ar?"كراجي منصة رقمية ثنائية اللغة تساعد أصحاب السيارات على فهم مشاكل السيارة، استكشاف الأعطال، وتحويل نتيجة البحث إلى خطوة عملية مثل مشاهدة فيديو مناسب أو الوصول إلى جراج قريب.":"Karaji is a bilingual digital platform that helps car owners understand vehicle problems, explore common faults, and turn the result into a practical next step such as watching a relevant video or finding a nearby garage."; p1.style.color=C.dim; p1.style.lineHeight="1.8";
    const p2=document.createElement("p"); p2.textContent=ar?"يوفر كراجي أيضًا دليلًا للجراجات، وميزات لإضافة الجراجات، وإعلانات السيارات، ومحتوى إرشادي عن أعطال السيارات.":"Karaji also provides a garage directory, garage listing tools, vehicle listings, and educational car-fault guidance."; p2.style.color=C.dim; p2.style.lineHeight="1.8";
    const note=document.createElement("div"); note.textContent=ar?"الهدف: جمع معلومات السيارة والخطوة التالية في مكان واحد، مع إبقاء المستخدم صاحب القرار النهائي.":"Goal: put the car information and the next step in one place while keeping the user in control of the final decision."; Object.assign(note.style,{marginTop:"16px",padding:"12px 14px",background:`${C.amber}12`,borderRight:ar?`3px solid ${C.amber}`:"none",borderLeft:ar?"none":`3px solid ${C.amber}`,borderRadius:"10px",color:C.cream,lineHeight:"1.7"});
    card.append(close,title,p1,p2,note); modal.appendChild(card); modal.addEventListener("click",e=>{if(e.target===modal)modal.style.display="none";}); document.body.appendChild(modal);
  }

  function addNativeMenuItem(menu,key) {
    if(menu.querySelector(`[data-karaji-menu-item="${key}"]`))return;
    const ar=isArabic(),btn=document.createElement("button"); btn.type="button"; btn.dataset.karajiMenuItem=key;
    Object.assign(btn.style,{display:"flex",width:"100%",padding:"12px 16px",background:"none",border:"none",borderTop:`1px solid ${C.line}`,color:C.cream,fontSize:"13px",fontWeight:600,textAlign:ar?"right":"left",cursor:"pointer",flexDirection:ar?"row-reverse":"row",gap:"8px",boxSizing:"border-box"});
    const icon=document.createElement("span");
    icon.textContent=key==="legal"?"⚖":key==="about"?"ⓘ":key==="sellCar"?"🚗":"+";
    icon.style.color=C.amber; icon.style.fontSize="16px"; icon.style.width="18px"; icon.style.flex="0 0 18px"; icon.style.textAlign="center";
    const label=document.createElement("span"); label.style.flex="1";
    label.textContent=key==="legal"?(ar?"قانوني":"Legal")
      :key==="about"?(ar?"عن التطبيق":"About the App")
      :key==="sellCar"?(ar?"عرض السيارة للبيع":"List Your Car for Sale")
      :(ar?"أضف جراجك مجانًا":"Add Your Garage Free");
    btn.append(icon,label);
    btn.onmouseenter=()=>{btn.style.background=`${C.amber}12`;btn.style.color=C.amber;};
    btn.onmouseleave=()=>{btn.style.background="none";btn.style.color=C.cream;};
    btn.onclick=()=>{
      if(key==="legal") window.location.href="/legal/";
      else if(key==="about") openAbout();
      else if(key==="sellCar") window.location.href="/cars/add";
      else window.location.href="/free-garage/";
    };
    menu.appendChild(btn);
  }

  function findNativeMenu(){
    const garageBtn=findGarageButton(); if(!garageBtn)return null; let menu=garageBtn.parentElement;
    while(menu&&menu!==document.body){const directButtons=Array.from(menu.children).filter(c=>c.tagName==="BUTTON"); const hasGarage=directButtons.some(b=>/add your garage|أضف جراجك|ضيف جراجك/i.test(b.textContent||"")); const hasDashboard=directButtons.some(b=>/dashboard|admin|الإدارة|لوحة التحكم/i.test(b.textContent||"")); if(hasGarage&&hasDashboard)return menu; menu=menu.parentElement;} return null;
  }

  function hidePaidMenuGarageButton(menu){
    if(!menu)return;
    Array.from(menu.querySelectorAll("button, a")).forEach((el)=>{
      if(el.dataset.karajiMenuItem)return;
      if(isPaidGarageLabel(el.textContent)){
        el.style.setProperty("display","none","important");
        el.setAttribute("data-karaji-hidden-paid-garage","true");
      }
    });
  }

  // Safety net: hide the paid CTA anywhere it is rendered, including
  // React re-renders and menu/page variants. The FREE CTA is untouched.
  function hidePaidGarageButtonsEverywhere(){
    Array.from(document.querySelectorAll("button, a")).forEach((el)=>{
      if(el.dataset.karajiMenuItem)return;
      if(el.closest("#karaji-garage-network-cta"))return;
      if(isPaidGarageLabel(el.textContent)){
        el.style.setProperty("display","none","important");
        el.setAttribute("data-karaji-hidden-paid-garage","true");
      }
    });
  }

  function syncNativeMenu(){
    const menu=findNativeMenu();
    if(!menu)return;
    hidePaidMenuGarageButton(menu);
    addNativeMenuItem(menu,"freeGarage");
    addNativeMenuItem(menu,"sellCar");
    addNativeMenuItem(menu,"legal");
    addNativeMenuItem(menu,"about");
  }

  function closeMenuOnOutsideClick(){
    document.addEventListener("pointerdown",(event)=>{
      const menu=findNativeMenu();
      if(!menu || !document.body.contains(menu))return;
      if(menu.contains(event.target))return;
      const parent=menu.parentElement;
      const toggle=Array.from(parent?.querySelectorAll("button")||[]).find((button)=>{
        const text=(button.textContent||"").trim();
        const r=button.getBoundingClientRect();
        return !text && r.width<=42 && r.height<=42;
      });
      if(toggle && toggle.contains(event.target))return;
      toggle?.click();
    },true);
  }

  function addGarageNetworkCta(){
    if(window.location.pathname!=="/garages")return;
    if(document.getElementById("karaji-garage-network-cta"))return;
    const ar=isArabic();
    const headings=Array.from(document.querySelectorAll("h1,h2,h3")).filter(el=>{const text=(el.textContent||"").replace(/\s+/g," ").trim().toLowerCase();return text==="garage directory"||text==="دليل الورش"||text.includes("ورش قريبة")||text.includes("جراجات");});
    const anchor=headings[0]; if(!anchor||!anchor.parentElement)return;
    const wrap=document.createElement("div"); wrap.id="karaji-garage-network-cta";
    Object.assign(wrap.style,{margin:"0 0 18px 0",padding:"15px 16px",background:`linear-gradient(135deg, ${C.panel}, ${C.asphalt})`,border:`1px solid ${C.line}`,borderRadius:"14px",direction:ar?"rtl":"ltr",boxShadow:"0 8px 24px rgba(0,0,0,.16)"});
    const title=document.createElement("div"); title.textContent=ar?"صاحب جراج؟ خلّي أصحاب السيارات يلاقوك":"Own a garage? Let car owners find you"; Object.assign(title.style,{color:C.cream,fontSize:"15px",fontWeight:"700",marginBottom:"5px",lineHeight:"1.45"});
    const text=document.createElement("div"); text.textContent=ar?"أضف جراجك إلى دليل كراجي مجانًا، وعرّف أصحاب السيارات بخدماتك وموقعك وبيانات التواصل.":"Add your garage to the Karaji directory for free and let car owners discover your services, location and contact details."; Object.assign(text.style,{color:C.dim,fontSize:"12px",lineHeight:"1.7",marginBottom:"10px"});
    const button=document.createElement("button"); button.type="button"; button.textContent=ar?"+ ضيف جراجك مجانًا":"+ Add Your Garage Free"; Object.assign(button.style,{border:"none",borderRadius:"10px",padding:"9px 13px",background:C.amber,color:C.asphalt,fontWeight:"800",fontSize:"12px",cursor:"pointer",width:"100%"});
    button.onclick=()=>{window.location.href="/free-garage/";}; wrap.append(title,text,button); anchor.parentElement.insertBefore(wrap,anchor);
  }

  function hideOldGaragePageButton(){
    if(window.location.pathname!=="/garages")return;
    const newCta=document.getElementById("karaji-garage-network-cta"); if(!newCta)return;
    Array.from(document.querySelectorAll("button, a")).forEach(el=>{
      if(newCta.contains(el))return;
      if(isPaidGarageLabel(el.textContent)){
        el.style.setProperty("display","none","important");
        el.setAttribute("data-karaji-hidden-old-garage","true");
      }
    });
  }

  function removeLegacyDuplicateMenu(){const old=document.getElementById("karaji-top-menu");if(old)old.remove();const oldBadge=document.getElementById("karaji-legal-entry");if(oldBadge)oldBadge.remove();}
  function run(){if(!document.body)return;replaceText(document.body);removeLegacyDuplicateMenu();syncNativeMenu();addGarageNetworkCta();hideOldGaragePageButton();hidePaidGarageButtonsEverywhere();}
  const observer=new MutationObserver(run); observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  closeMenuOnOutsideClick();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",run);else run();
})();