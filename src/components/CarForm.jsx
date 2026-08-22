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
const OTHER = "Other";

const CAR_MODELS = {
  Toyota: ["Corolla", "Camry", "Yaris", "Yaris Cross", "Avanza", "Rush", "Fortuner", "Land Cruiser", "Land Cruiser Prado", "Hilux", "RAV4", "Highlander", "Prius", "C-HR", "Avalon", "Innova", "86", "Supra", "Coaster"],
  Honda: ["Civic", "Accord", "City", "Jazz", "CR-V", "HR-V", "BR-V", "Pilot", "Odyssey", "Fit"],
  Nissan: ["Sunny", "Altima", "Maxima", "Sentra", "Patrol", "Patrol Safari", "X-Trail", "Kicks", "Juke", "Pathfinder", "Navara", "Urvan", "GT-R", "370Z"],
  Hyundai: ["Accent", "Elantra", "Sonata", "Tucson", "Santa Fe", "Creta", "Kona", "i10", "i20", "i30", "Palisade", "Staria", "Veloster", "Azera"],
  Kia: ["Picanto", "Rio", "Cerato", "K5", "Sportage", "Sorento", "Seltos", "Carnival", "Soul", "Stinger", "Telluride", "Niro"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "V-Class", "Maybach", "AMG GT"],
  BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "M2", "M3", "M4", "M5"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "TT", "RS6", "RS7", "e-tron"],
  Volkswagen: ["Golf", "Polo", "Jetta", "Passat", "Tiguan", "Touareg", "Teramont", "T-Roc", "Arteon", "ID.4", "Beetle"],
  Chevrolet: ["Aveo", "Cruze", "Malibu", "Impala", "Camaro", "Corvette", "Captiva", "Trailblazer", "Tahoe", "Suburban", "Silverado", "Spark", "Traverse"],
  Ford: ["Fiesta", "Focus", "Fusion", "Mustang", "EcoSport", "Escape", "Edge", "Explorer", "Expedition", "F-150", "Ranger", "Taurus", "Territory"],
  Mitsubishi: ["Attrage", "Lancer", "Mirage", "ASX", "Eclipse Cross", "Outlander", "Pajero", "Pajero Sport", "L200", "Xpander"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-5", "CX-9", "CX-30", "MX-5"],
  Lexus: ["ES", "IS", "LS", "GS", "RC", "LC", "UX", "NX", "RX", "GX", "LX"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar", "Discovery", "Discovery Sport", "Defender"],
  Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator"],
  Peugeot: ["208", "301", "308", "508", "2008", "3008", "5008", "Partner"],
  Renault: ["Symbol", "Logan", "Duster", "Kadjar", "Koleos", "Megane", "Clio", "Captur"],
  Opel: ["Corsa", "Astra", "Insignia", "Grandland", "Mokka"],
  Fiat: ["500", "Tipo", "Panda", "Punto", "Doblo"],
  Suzuki: ["Alto", "Swift", "Ciaz", "Baleno", "Vitara", "Grand Vitara", "Jimny", "Ertiga", "Celerio"],
  Subaru: ["Impreza", "Legacy", "Outback", "Forester", "XV", "BRZ", "WRX"],
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
  Porsche: ["911", "718 Cayman", "718 Boxster", "Panamera", "Macan", "Cayenne", "Taycan"],
  Jaguar: ["XE", "XF", "XJ", "F-Type", "E-Pace", "F-Pace", "I-Pace"],
  Mini: ["Cooper", "Cooper S", "Countryman", "Clubman"],
  Chrysler: ["300", "Pacifica"],
  Dodge: ["Charger", "Challenger", "Durango", "Journey"],
  GMC: ["Yukon", "Yukon XL", "Sierra", "Terrain", "Acadia"],
  Cadillac: ["Escalade", "CT4", "CT5", "XT4", "XT5", "XT6"],
  Infiniti: ["Q50", "Q60", "QX50", "QX60", "QX80"],
  Acura: ["ILX", "TLX", "RDX", "MDX"],
  Skoda: ["Fabia", "Octavia", "Superb", "Kodiaq", "Karoq"],
  Seat: ["Ibiza", "Leon", "Ateca", "Tarraco"],
  Citroen: ["C3", "C4", "C5 Aircross"],
  Genesis: ["G70", "G80", "G90", "GV70", "GV80"],
  Bentley: ["Continental GT", "Flying Spur", "Bentayga"],
  "Rolls-Royce": ["Ghost", "Phantom", "Cullinan", "Wraith", "Dawn"],
  Maserati: ["Ghibli", "Quattroporte", "Levante", "GranTurismo"],
  Ferrari: ["Roma", "Portofino", "F8", "SF90", "296"],
  Lamborghini: ["Huracan", "Aventador", "Urus"],
  "Aston Martin": ["Vantage", "DB11", "DBS", "DBX"],
  McLaren: ["570S", "720S", "GT", "Artura"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  BYD: ["Han", "Tang", "Song", "Atto 3", "Seal", "Dolphin"],
  MG: ["MG3", "MG5", "MG6", "ZS", "HS", "RX5", "RX8", "GT"],
  Changan: ["Alsvin", "Eado", "CS35", "CS55", "CS75", "CS85"],
  Geely: ["Emgrand", "Coolray", "Azkarra", "Okavango"],
  Haval: ["H6", "Jolion", "H9", "Dargo"],
  Chery: ["Tiggo 2", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 5", "Arrizo 6"],
  Isuzu: ["D-Max", "MU-X"],
  [OTHER]: [],
};

const CAR_MAKES = [...Object.keys(CAR_MODELS).filter((m) => m !== OTHER).sort(), OTHER];

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

export default function CarForm({ lang = "en", t = {}, isRTL = false, onClose, onSubmitted }) {
  const [form, setForm] = React.useState({
    make: "",
    makeOther: "",
    model: "",
    modelOther: "",
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

  function setMake(e) {
    const value = e.target.value;
    setForm((cur) => ({ ...cur, make: value, model: "", modelOther: "" }));
  }

  const modelOptions = form.make && form.make !== OTHER ? CAR_MODELS[form.make] || [] : [];
  const effectiveMake = form.make === OTHER ? form.makeOther.trim() : form.make;
  const effectiveModel =
    form.model === OTHER || !form.make || form.make === OTHER ? form.modelOther.trim() : form.model;

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
    if (!effectiveMake || !effectiveModel) return lang === "ar" ? "من فضلك اختر الماركة والموديل" : "Please choose the make and model";
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
        make_model: `${effectiveMake} ${effectiveModel}`.trim(),
        status: "approved",
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
            <select style={inputStyle} value={form.make} onChange={setMake}>
              <option value="">—</option>
              {CAR_MAKES.map((m) => (
                <option key={m} value={m}>{m === OTHER ? (lang === "ar" ? "أخرى" : "Other") : m}</option>
              ))}
            </select>
            {form.make === OTHER && (
              <input
                style={{ ...inputStyle, marginTop: 8 }}
                value={form.makeOther}
                onChange={set("makeOther")}
                placeholder={lang === "ar" ? "اكتب الماركة" : "Type the make"}
              />
            )}
          </Field>
          <Field label={t.carModelType}>
            {form.make && form.make !== OTHER ? (
              <>
                <select style={inputStyle} value={form.model} onChange={set("model")}>
                  <option value="">—</option>
                  {modelOptions.map((mo) => (
                    <option key={mo} value={mo}>{mo}</option>
                  ))}
                  <option value={OTHER}>{lang === "ar" ? "أخرى" : "Other"}</option>
                </select>
                {form.model === OTHER && (
                  <input
                    style={{ ...inputStyle, marginTop: 8 }}
                    value={form.modelOther}
                    onChange={set("modelOther")}
                    placeholder={lang === "ar" ? "اكتب الموديل" : "Type the model"}
                  />
                )}
              </>
            ) : (
              <input
                style={inputStyle}
                value={form.modelOther}
                onChange={set("modelOther")}
                placeholder={
                  !form.make
                    ? (lang === "ar" ? "اختر الماركة أولاً" : "Choose a make first")
                    : (lang === "ar" ? "اكتب الموديل" : "Type the model")
                }
                disabled={!form.make}
              />
            )}
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
