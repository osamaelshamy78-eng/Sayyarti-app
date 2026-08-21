import React from "react";
import { supabase } from "../supabaseClient";
import { ChevronLeft, ChevronRight, Camera, X } from "lucide-react";

const C = {
  asphalt: "#14171C",
  panel: "#1D2129",
  panelLine: "#2A2F38",
  cream: "#F2ECDD",
  creamDim: "#B9B2A0",
  amber: "#F5B942",
  amberDim: "#8A6A2A",
  red: "#E4432B",
  blue: "#4C7EA8",
};

const MAX_PHOTOS = 6;

export default function CarForm({ lang = "en", t = {}, isRTL = false, onClose, onSubmitted }) {
  const [form, setForm] = React.useState({
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    chassis: "",
    city: "",
    country: "",
    specs: "",
    phone: "",
    description: "",
  });
  const [photos, setPhotos] = React.useState([]); // File[]
  const [previews, setPreviews] = React.useState([]); // object URLs
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadError, setUploadError] = React.useState("");
  const [formError, setFormError] = React.useState("");

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  function set(key) {
    return (e) => setForm((cur) => ({ ...cur, [key]: e.target.value }));
  }

  function addPhotos(fileList) {
    const files = Array.from(fileList || []).slice(0, MAX_PHOTOS - photos.length);
    if (!files.length) return;
    setUploadError("");
    setPhotos((cur) => [...cur, ...files]);
    setPreviews((cur) => [...cur, ...files.map((f) => URL.createObjectURL(f))]);
  }

  function removePhoto(idx) {
    setPhotos((cur) => cur.filter((_, i) => i !== idx));
    setPreviews((cur) => {
      URL.revokeObjectURL(cur[idx]);
      return cur.filter((_, i) => i !== idx);
    });
  }

  async function uploadPhotos() {
    const urls = [];
    for (const file of photos) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${safeExt}`;
      const { error } = await supabase.storage.from("car-photos").upload(fileName, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("car-photos").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  function validate() {
    if (!form.make.trim() || !form.model.trim()) return lang === "ar" ? "من فضلك اكتب الماركة والموديل" : "Please enter the make and model";
    if (!form.chassis.trim()) return lang === "ar" ? "رقم الشاصية مطلوب" : "Chassis number (VIN) is required";
    if (!form.phone.trim()) return lang === "ar" ? "رقم الهاتف مطلوب" : "Phone number is required";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError("");
    setUploadError("");
    setSubmitting(true);
    try {
      const photoUrls = photos.length ? await uploadPhotos() : [];
      const { error } = await supabase.from("car_listings").insert({
        make_model: `${form.make.trim()} ${form.model.trim()}`.trim(),
        year: form.year || null,
        price: form.price || null,
        mileage: form.mileage || null,
        chassis_number: form.chassis.trim(),
        city: form.city || null,
        country: form.country || null,
        specs: form.specs || null,
        phone: form.phone.trim(),
        description: form.description || null,
        photo_url: photoUrls[0] || null,
        photo_urls: photoUrls,
      });
      if (error) throw error;
      if (typeof onSubmitted === "function") onSubmitted();
    } catch (err) {
      console.error(err);
      setUploadError(
        lang === "ar" ? "حصل خطأ أثناء إرسال الإعلان، حاول مرة أخرى" : "Something went wrong submitting your listing, please try again"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: 12,
    border: `1px solid ${C.panelLine}`,
    background: C.panel,
    color: C.cream,
    fontSize: 14,
  };
  const labelStyle = { color: C.creamDim, fontSize: 12.5, fontWeight: 700, marginBottom: 6, display: "block" };

  function Field({ label, children }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <span style={labelStyle}>{label}</span>
        {children}
      </div>
    );
  }

  return (
    <div className="pb-8">
      <button
        onClick={onClose}
        className="flex items-center gap-1 px-5 pt-4 pb-2"
        style={{ border: "none", background: "none", cursor: "pointer" }}
      >
        <BackIcon size={18} color={C.amber} />
        <span style={{ color: C.amber, fontSize: 13, fontWeight: 600 }}>{t.navCars}</span>
      </button>

      <h2 style={{ color: C.cream, fontSize: 18, fontWeight: 800, margin: "6px 20px 14px" }}>{t.addCarBtn}</h2>

      <form onSubmit={handleSubmit} dir={isRTL ? "rtl" : "ltr"} className="px-5">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label={t.carMake}>
            <input style={inputStyle} value={form.make} onChange={set("make")} />
          </Field>
          <Field label={t.carModelType}>
            <input style={inputStyle} value={form.model} onChange={set("model")} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label={t.carYear}>
            <input style={inputStyle} type="number" value={form.year} onChange={set("year")} />
          </Field>
          <Field label={t.carPrice}>
            <input style={inputStyle} type="number" value={form.price} onChange={set("price")} />
          </Field>
        </div>

        <Field label={t.carMileage}>
          <input style={inputStyle} type="number" value={form.mileage} onChange={set("mileage")} />
        </Field>

        <Field label={t.carChassis}>
          <input style={inputStyle} value={form.chassis} onChange={set("chassis")} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label={t.carCity}>
            <input style={inputStyle} value={form.city} onChange={set("city")} />
          </Field>
          <Field label={t.carCountry}>
            <input style={inputStyle} value={form.country} onChange={set("country")} />
          </Field>
        </div>

        <Field label={t.carSpecs}>
          <select style={inputStyle} value={form.specs} onChange={set("specs")}>
            <option value="">—</option>
            <option value={t.carSpecsGulf}>{t.carSpecsGulf}</option>
            <option value={t.carSpecsAmerican}>{t.carSpecsAmerican}</option>
          </select>
        </Field>

        <Field label={t.carPhone}>
          <input style={inputStyle} type="tel" value={form.phone} onChange={set("phone")} />
        </Field>

        <Field label={t.carDescription}>
          <textarea style={{ ...inputStyle, resize: "vertical" }} rows={4} value={form.description} onChange={set("description")} />
        </Field>

        <Field label={t.carAddPhoto}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
                <img src={src} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: "cover", border: `1px solid ${C.panelLine}` }} />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  style={{
                    position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                    background: C.red, border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <label
                style={{
                  width: 72, height: 72, borderRadius: 10, border: `1px dashed ${C.panelLine}`,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.creamDim,
                }}
              >
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => addPhotos(e.target.files)}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
          {uploadError && <p style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{uploadError}</p>}
        </Field>

        {formError && <p style={{ color: C.red, fontSize: 13, marginBottom: 10 }}>{formError}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button
            type="submit"
            disabled={submitting}
            style={{ flex: 1, padding: "13px 16px", border: "none", borderRadius: 12, background: C.amber, color: C.asphalt, fontWeight: 800, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? t.carUploading : t.carSubmit}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "13px 16px", borderRadius: 12, border: `1px solid ${C.panelLine}`, background: C.panel, color: C.cream, fontWeight: 700 }}
          >
            {t.carCancel}
          </button>
        </div>
      </form>
    </div>
  );
}
