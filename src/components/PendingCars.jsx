import React from "react";
import CarMedia from "./CarMedia";

// Admin: car listings waiting for approval, shown above the dashboard tabs.
export default function PendingCars({ cars, lang, busyId, onApprove, onReject }) {
  const ar = lang === "ar";
  return (
    <section style={{ margin: "0 0 16px", padding: 14, background: "#1D2129", border: "1px solid #F5B94255", borderRadius: 14 }}>
      <div style={{ color: "#F5B942", fontSize: 15, fontWeight: 800, marginBottom: 10 }}>
        {ar ? `سيارات بانتظار الموافقة (${cars.length})` : `Cars awaiting approval (${cars.length})`}
      </div>
      {cars.length === 0 && (
        <div style={{ color: "#B9B2A0", fontSize: 12.5 }}>
          {ar ? "لا توجد سيارات جديدة بانتظار الموافقة." : "No new cars are waiting for approval."}
        </div>
      )}
      {cars.map((car) => {
        const photo = car.photo_url || car.photo_urls?.[0];
        const busy = busyId === car.id;
        const button = { flex: 1, padding: "9px 10px", border: "1px solid #F5B94288", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: busy ? "wait" : "pointer" };
        return (
          <div key={car.id} style={{ padding: 10, marginTop: 8, background: "#14171C", border: "1px solid #2A2F38", borderRadius: 12 }}>
            {photo && <CarMedia src={photo} alt={car.make_model || "Car"} style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 9, marginBottom: 8, display: "block" }} />}
            <div style={{ color: "#F2ECDD", fontSize: 13, lineHeight: 1.6 }}>
              <strong>{car.make_model}{car.year ? ` · ${car.year}` : ""}</strong>
              <br />
              {car.price ?? ""}{car.city ? ` · ${car.city}` : ""}
              <br />
              {ar ? "الهاتف" : "Phone"}: {car.phone || ""}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button type="button" disabled={busy} onClick={() => onApprove(car)} style={{ ...button, background: "#F5B942", color: "#14171C" }}>
                {ar ? "✓ اعتماد" : "✓ Approve"}
              </button>
              <button type="button" disabled={busy} onClick={() => onReject(car)} style={{ ...button, background: "transparent", color: "#E4432B", border: "1px solid #E4432B88" }}>
                {ar ? "حذف / رفض" : "Reject / Delete"}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
