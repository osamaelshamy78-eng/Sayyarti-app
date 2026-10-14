import { lazy, useState, useEffect, Suspense } from "react";
import { Plus, MapPin } from "lucide-react";
import { supabase } from "../supabaseClient";
import { CAR_RENTALS } from "../data/directory";
import { C } from "../theme";

const RentalListingForm = lazy(() => import("../components/RentalListingForm"));

export function RentalsView({ lang, t, country, setCountry, isRTL }) {
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [dbRentals, setDbRentals] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [dbListings, setDbListings] = useState([]);
  useEffect(() => {
    let active = true;
    if (supabase) {
      supabase.from("car_rentals").select("*").eq("country", country).eq("is_active", true).order("created_at", { ascending: true })
        .then(({ data }) => { if (active) { setDbRentals(data || []); setLoaded(true); } });
      supabase.from("rental_directory").select("*").eq("country", country).order("rank", { ascending: true }).order("created_at", { ascending: false })
        .then(({ data }) => { if (active) setDbListings(data || []); });
    }
    return () => { active = false; };
  }, [country]);
  const staticData = CAR_RENTALS[country] || CAR_RENTALS.uae;
  const items = loaded && dbRentals.length ? dbRentals : staticData.list.map((p, i) => ({ id: `static-${i}`, name_en: p.name, name_ar: p.name, area_en: p.area.en, area_ar: p.area.ar, note_en: p.note.en, note_ar: p.note.ar }));
  const countries = ["uae", "ksa", "egypt"];
  return (
    <div className="px-5 pt-5 pb-6">
      <h1 style={{ color:C.text, fontSize:21, fontWeight:700, margin:0 }}>{t.rentalsHeading}</h1>
      <p style={{ color:C.textDim, fontSize:13, marginTop:4, marginBottom:14 }}>{t.rentalsSub}</p>
      <div className="flex gap-2 mb-4">{countries.map(code => <button key={code} onClick={()=>setCountry(code)} style={{flex:1,border:`1px solid ${code===country?C.accent:C.line}`,background:code===country?`${C.accent}18`:C.surface,color:code===country?C.accent:C.textDim,borderRadius:10,padding:"9px 6px",fontSize:11.5,fontWeight:600}}>{CAR_RENTALS[code][lang]}</button>)}</div>

      <button
        onClick={() => setShowRentalForm(true)}
        className="w-full flex items-center justify-center gap-2 mb-4"
        style={{ background: C.accent, border: "none", borderRadius: 12, padding: "12px 16px", cursor: "pointer" }}
      >
        <Plus size={16} color={C.onAccent} strokeWidth={2.5} />
        <span style={{ color: C.onAccent, fontSize: 13.5, fontWeight: 700 }}>{t.addRentalBtn}</span>
      </button>

      <div className="flex flex-col gap-2.5">
        {dbListings.map(g => <button key={g.id} onClick={() => window.open(g.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.rental_name + " " + g.address)}`, "_blank")} className="w-full" style={{ background:C.surface, border:`1px solid ${C.line}`, borderRadius:14, overflow:"hidden", padding:0, cursor:"pointer", textAlign:isRTL?"right":"left", display:"block" }}>
          {g.photo_url && (
            <div style={{ position: "relative" }}>
              <img src={g.photo_url} alt={g.rental_name} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />
              {g.photo_urls && g.photo_urls.length > 1 && (
                <span style={{ position:"absolute", bottom:8, insetInlineEnd:8, background:"rgba(0,0,0,0.6)", color:C.text, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:999 }}>
                  +{g.photo_urls.length - 1}
                </span>
              )}
            </div>
          )}
          <div style={{padding:"14px 16px"}}>
            <div className="flex items-start justify-between gap-2"><span style={{color:C.text,fontSize:14,fontWeight:700}}>{g.rental_name}</span><MapPin size={15} color={C.accent} /></div>
            <div style={{color:C.accentDim,fontSize:11.5,marginTop:3,fontWeight:600}}>{g.address}</div>
            <div style={{color:C.blue,fontSize:11,marginTop:7,fontWeight:600}}>{t.openInMaps}</div>
          </div>
        </button>)}
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

      <Suspense fallback={null}>
        <RentalListingForm isOpen={showRentalForm} onClose={() => setShowRentalForm(false)} country={country} lang={lang} />
      </Suspense>
    </div>
  );
}
