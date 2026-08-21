import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const C = {
  asphalt: "#14171C",
  panel: "#1D2129",
  panelLine: "#2A2F38",
  cream: "#F2ECDD",
  creamDim: "#B9B2A0",
  amber: "#F5B942",
  red: "#E4432B",
  blue: "#4C7EA8",
};

export default function FreeGarageListingForm({ isOpen, onClose, lang = "en", country = "uae" }) {
  const ar = lang === "ar";
  const [form, setForm] = useState({ garage_name: "", owner_name: "", phone: "", address: "", lat: null, lng: null, map_link: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setSuccess(false);
  }, [isOpen]);

  if (!isOpen) return null;

  function closeAndReset() {
    setForm({ garage_name: "", owner_name: "", phone: "", address: "", lat: null, lng: null, map_link: "" });
    setPhotoFile(null);
    setError("");
    setSuccess(false);
    onClose?.();
  }

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function useLocation() {
    if (!navigator.geolocation) {
      setError(ar ? "جهازك لا يدعم تحديد الموقع." : "Your device does not support location.");
      return;
    }
    setGpsLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        update("lat", lat);
        update("lng", lng);
        update("map_link", `https://www.google.com/maps?q=${lat},${lng}`);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setError(ar ? "تعذر الحصول على موقعك، اكتب العنوان يدويًا." : "Could not get your location. Please enter the address manually.");
      }
    );
  }

  async function submit() {
    if (!supabase) return;
    if (!form.garage_name.trim() || !form.owner_name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(ar ? "من فضلك أكمل بيانات الجراج الأساسية." : "Please complete the garage details.");
      return;
    }
    if (!photoFile) {
      setError(ar ? "من فضلك ارفع صورة للجراج." : "Please upload a garage photo.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const ext = (photoFile.name.split(".").pop() || "jpg").toLowerCase();
      const fileName = `free-garage/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("garage-photos").upload(fileName, photoFile, { upsert: false });
      if (uploadError) throw uploadError;
      const photoUrl = supabase.storage.from("garage-photos").getPublicUrl(fileName).data.publicUrl;

      const { error: submitError } = await supabase.rpc("submit_free_garage_listing", {
        p_garage_name: form.garage_name,
        p_owner_name: form.owner_name,
        p_phone: form.phone,
        p_address: form.address,
        p_lat: form.lat,
        p_lng: form.lng,
        p_map_link: form.map_link || null,
        p_photo_url: photoUrl,
        p_country: country,
      });
      if (submitError) throw submitError;
      setSuccess(true);
    } catch (e) {
      setError(e?.message || (ar ? "حدث خطأ أثناء إرسال الطلب." : "Something went wrong while submitting."));
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    background: C.asphalt,
    border: `1px solid ${C.panelLine}`,
    borderRadius: 10,
    padding: "11px 12px",
    color: C.cream,
    fontSize: 13,
    marginBottom: 10,
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) closeAndReset(); }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,.68)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
    >
      <div dir={ar ? "rtl" : "ltr"} style={{ width: "min(430px,100%)", maxHeight: "88vh", overflowY: "auto", background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 18, padding: 18, color: C.cream, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
          <h2 style={{ margin: 0, color: C.cream, fontSize: 20, fontWeight: 800 }}>{ar ? "أضف جراجك مجانًا" : "Add Your Garage Free"}</h2>
          <button onClick={closeAndReset} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.panelLine}`, background: C.asphalt, color: C.cream, fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        <p style={{ color: C.creamDim, fontSize: 12.5, lineHeight: 1.6, margin: "0 0 14px" }}>
          {ar ? "أضف جراجك إلى دليل كراجي مجانًا. سيتم مراجعة البيانات قبل ظهور الجراج للعملاء." : "Add your garage to the Karaji directory for free. Your details will be reviewed before the garage is published."}
        </p>

        {success ? (
          <div>
            <div style={{ background: `${C.amber}18`, border: `1px solid ${C.amber}66`, borderRadius: 12, padding: 14, color: C.cream, fontSize: 13, lineHeight: 1.7 }}>
              {ar ? "تم إرسال بيانات جراجك مجانًا بنجاح. سيقوم فريق كراجي بمراجعتها قبل نشرها." : "Your free garage listing was submitted successfully. The Karaji team will review it before publishing."}
            </div>
            <button onClick={closeAndReset} style={{ width: "100%", marginTop: 12, background: C.amber, border: "none", borderRadius: 10, padding: 11, color: C.asphalt, fontWeight: 800, cursor: "pointer" }}>{ar ? "إغلاق" : "Close"}</button>
          </div>
        ) : (
          <>
            <input style={inputStyle} placeholder={ar ? "اسم الجراج" : "Garage name"} value={form.garage_name} onChange={(e) => update("garage_name", e.target.value)} />
            <input style={inputStyle} placeholder={ar ? "اسم صاحب الجراج" : "Owner name"} value={form.owner_name} onChange={(e) => update("owner_name", e.target.value)} />
            <input style={inputStyle} placeholder={ar ? "رقم الهاتف / WhatsApp" : "Phone / WhatsApp"} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            <input style={inputStyle} placeholder={ar ? "العنوان" : "Address"} value={form.address} onChange={(e) => update("address", e.target.value)} />

            <button type="button" onClick={useLocation} disabled={gpsLoading} style={{ width: "100%", marginBottom: 10, background: "transparent", border: `1px solid ${C.blue}88`, borderRadius: 10, padding: 10, color: C.blue, fontWeight: 700, cursor: "pointer" }}>
              {gpsLoading ? (ar ? "جاري تحديد الموقع..." : "Getting location...") : (ar ? "استخدم موقعي على الخريطة" : "Use my location")}
            </button>

            <label style={{ display: "block", color: C.creamDim, fontSize: 11.5, marginBottom: 6 }}>{ar ? "صورة الجراج" : "Garage photo"}</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: 9 }} />
            {photoFile && <div style={{ color: C.amber, fontSize: 11, marginBottom: 10 }}>{photoFile.name}</div>}

            {error && <div style={{ color: C.red, fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{error}</div>}

            <button onClick={submit} disabled={submitting} style={{ width: "100%", background: C.amber, border: "none", borderRadius: 10, padding: 12, color: C.asphalt, fontSize: 13.5, fontWeight: 800, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? (ar ? "جاري الإرسال..." : "Submitting...") : (ar ? "+ أضف جراجك مجانًا" : "+ Add Your Garage Free")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
