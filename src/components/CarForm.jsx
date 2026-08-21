import React from "react";

/**
 * Minimal, self-contained car form used by the marketplace views.
 * Kept separate from App.jsx so the Add Car flow cannot fail because
 * CarForm is missing from the module scope.
 */
export default function CarForm({
  lang = "en",
  onCancel,
  onSubmit,
  initialCar = {},
}) {
  const isAr = lang === "ar";
  const [form, setForm] = React.useState({
    make: initialCar.make || "",
    model: initialCar.model || "",
    year: initialCar.year || "",
    price: initialCar.price || "",
    mileage: initialCar.mileage || "",
    location: initialCar.location || "",
    description: initialCar.description || "",
    phone: initialCar.phone || "",
  });

  const set = (key) => (e) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === "function") onSubmit(form);
  };

  const field = (label, key, type = "text") => (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontWeight: 700 }}>{label}</span>
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid #2A2F38",
          background: "#14171C",
          color: "#F2ECDD",
        }}
      />
    </label>
  );

  return (
    <form onSubmit={submit} dir={isAr ? "rtl" : "ltr"} style={{ display: "grid", gap: 14 }}>
      {field(isAr ? "الماركة" : "Make", "make")}
      {field(isAr ? "الموديل" : "Model", "model")}
      {field(isAr ? "السنة" : "Year", "year", "number")}
      {field(isAr ? "السعر" : "Price", "price", "number")}
      {field(isAr ? "الممشى" : "Mileage", "mileage", "number")}
      {field(isAr ? "الموقع" : "Location", "location")}
      {field(isAr ? "رقم الهاتف" : "Phone", "phone", "tel")}
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 700 }}>{isAr ? "الوصف" : "Description"}</span>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={4}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #2A2F38",
            background: "#14171C",
            color: "#F2ECDD",
            resize: "vertical",
          }}
        />
      </label>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button type="submit" style={{ flex: 1, padding: "13px 16px", border: 0, borderRadius: 12, background: "#F5B942", color: "#14171C", fontWeight: 800 }}>
          {isAr ? "حفظ السيارة" : "Save car"}
        </button>
        {typeof onCancel === "function" && (
          <button type="button" onClick={onCancel} style={{ padding: "13px 16px", borderRadius: 12, border: "1px solid #2A2F38", background: "#1D2129", color: "#F2ECDD", fontWeight: 700 }}>
            {isAr ? "إلغاء" : "Cancel"}
          </button>
        )}
      </div>
    </form>
  );
}
