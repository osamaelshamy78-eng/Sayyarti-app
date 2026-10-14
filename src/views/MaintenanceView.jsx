import { useState, useEffect } from "react";
import { Info, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { MAINTENANCE_CENTERS } from "../data/directory";
import { C } from "../theme";

export function MaintenanceView({ lang, t, country, setCountry, isRTL }) {
  const [dbCenters, setDbCenters] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    if (supabase) {
      supabase.from("maintenance_centers").select("*").eq("country", country).eq("is_active", true).order("created_at", { ascending: true })
        .then(({ data }) => { if (active) { setDbCenters(data || []); setLoaded(true); } });
    }
    return () => { active = false; };
  }, [country]);
  const staticData = MAINTENANCE_CENTERS[country] || MAINTENANCE_CENTERS.uae;
  const items = loaded && dbCenters.length ? dbCenters : staticData.list.map((p, i) => ({ id: `static-${i}`, name_en: p.name, name_ar: p.name, area_en: p.area.en, area_ar: p.area.ar, note_en: p.note.en, note_ar: p.note.ar }));
  const countries = ["uae", "ksa", "egypt"];
  return (
    <div className="px-5 pt-5 pb-6">
      <h1 style={{ color:C.text, fontSize:21, fontWeight:700, margin:0 }}>{t.maintenanceHeading}</h1>
      <p style={{ color:C.textDim, fontSize:13, marginTop:4, marginBottom:14 }}>{t.maintenanceSub}</p>
      <div className="flex gap-2 mb-4">{countries.map(code => <button key={code} onClick={()=>setCountry(code)} style={{flex:1,border:`1px solid ${code===country?C.accent:C.line}`,background:code===country?`${C.accent}18`:C.surface,color:code===country?C.accent:C.textDim,borderRadius:10,padding:"9px 6px",fontSize:11.5,fontWeight:600}}>{MAINTENANCE_CENTERS[code][lang]}</button>)}</div>
      <div className="flex items-start gap-2 mb-4" style={{background:`${C.blue}14`,border:`1px solid ${C.blue}44`,borderRadius:10,padding:"10px 12px"}}><Info size={14} color={C.blue} style={{marginTop:2}}/><span style={{color:C.textDim,fontSize:11.5,lineHeight:1.5}}>{t.maintenanceNote}</span></div>
      <div className="flex flex-col gap-2.5">
        {items.map(p => <button key={p.id} onClick={()=>window.open(p.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lang==='ar'?p.name_ar:p.name_en)+" "+(lang==='ar'?p.area_ar:p.area_en))}`,"_blank")} className="w-full" style={{background:C.surface,border:`1px solid ${C.line}`,borderRadius:14,overflow:"hidden",padding:0,cursor:"pointer",textAlign:isRTL?"right":"left",display:"block"}}>
          {p.photo_url && <img src={p.photo_url} alt={lang==='ar'?p.name_ar:p.name_en} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
          <div style={{padding:"14px 16px"}}>
            <div className="flex items-start justify-between gap-2"><span style={{color:C.text,fontSize:14,fontWeight:700}}>{lang==='ar'?p.name_ar:p.name_en}</span><MapPin size={15} color={C.accent}/></div>
            <div style={{color:C.accentDim,fontSize:11.5,marginTop:3,fontWeight:600}}>{lang==='ar'?p.area_ar:p.area_en}</div>
            <div style={{color:C.textDim,fontSize:12.5,marginTop:5,lineHeight:1.5}}>{lang==='ar'?p.note_ar:p.note_en}</div>
            <div style={{color:C.blue,fontSize:11,marginTop:7,fontWeight:600}}>{t.openInMaps}</div>
          </div>
        </button>)}
      </div>
    </div>
  );
}
