import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// ===== بيانات الحساب البنكي =====
const BANK_DETAILS = {
  bankName: "Emirates NBD",
  accountHolder: "Osama Elshamy",
  iban: "AE22 0260 0010 1566 9507 601",
  accountNumber: "1015669507601",
  currency: "AED",
  swift: "EBILAEAD",
  routing: "202620103",
};

// ===== أسعار الترتيب =====
const RANK_PRICES = {
  1: 10000,
  2: 7000,
  3: 4000,
  0: 2000, // أي ترتيب آخر
};

const RANK_LABELS = {
  1: "الترتيب الأول",
  2: "الترتيب الثاني",
  3: "الترتيب الثالث",
  0: "ترتيب عادي",
};

export default function GarageListingForm({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: بيانات الجراج, 2: الترتيب والدفع
  const [takenRanks, setTakenRanks] = useState([]);
  const [loadingRanks, setLoadingRanks] = useState(true);

  const [form, setForm] = useState({
    garage_name: "",
    owner_name: "",
    phone: "",
    address: "",
    lat: null,
    lng: null,
    map_link: "",
    rank: null,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // جيب الترتيبات المحجوزة حالياً (1، 2، 3) عند فتح الفورم
  useEffect(() => {
    if (!isOpen) return;
    fetchTakenRanks();
  }, [isOpen]);

  async function fetchTakenRanks() {
    setLoadingRanks(true);
    const { data, error } = await supabase
      .from("garage_listings")
      .select("rank")
      .in("rank", [1, 2, 3])
      .neq("status", "rejected");

    if (!error && data) {
      setTakenRanks(data.map((r) => r.rank));
    }
    setLoadingRanks(false);
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("جهازك لا يدعم تحديد الموقع");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const link = `https://www.google.com/maps?q=${lat},${lng}`;
        setForm((prev) => ({ ...prev, lat, lng, map_link: link }));
        setGpsLoading(false);
      },
      () => {
        setError("تعذر الحصول على موقعك، حاول مرة أخرى أو اكتب العنوان يدوياً");
        setGpsLoading(false);
      }
    );
  }

  function validateStep1() {
    if (!form.garage_name.trim()) return "من فضلك اكتب اسم الجراج";
    if (!form.owner_name.trim()) return "من فضلك اكتب اسم صاحب الجراج";
    if (!form.phone.trim()) return "من فضلك اكتب رقم الهاتف";
    if (!form.address.trim()) return "من فضلك اكتب العنوان";
    if (!photoFile) return "من فضلك ارفع صورة للجراج";
    return "";
  }

  function goToStep2() {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep(2);
  }

  function selectRank(rankKey) {
    if (rankKey !== 0 && takenRanks.includes(rankKey)) return; // محجوز، منع الاختيار
    setForm((prev) => ({ ...prev, rank: rankKey }));
    setError("");
  }

  async function uploadFile(file, bucket) {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  }

  function sendNotificationEmail(payload) {
    if (!window.emailjs) return; // لو السكربت لسه مايتحملش، تجاهل بهدوء
    window.emailjs.send("service_k8e4q6h", "template_rg47ctr", {
      garage_name: payload.garage_name,
      owner_name: payload.owner_name,
      phone: payload.phone,
      address: payload.address,
      map_link: payload.map_link || "لم يتم تحديد الموقع بالـ GPS",
      rank: RANK_LABELS[payload.rank],
      price: RANK_PRICES[payload.rank],
    });
  }

  async function handleSubmit() {
    if (form.rank === null) {
      setError("من فضلك اختر الترتيب المطلوب");
      return;
    }
    if (!receiptFile) {
      setError("من فضلك ارفع صورة إيصال التحويل البنكي");
      return;
    }
    if (!confirmed) {
      setError("من فضلك أكّد أنك قمت بتحويل المبلغ");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // ارفع الصور
      const photoUrl = await uploadFile(photoFile, "garage-photos");
      const receiptUrl = await uploadFile(receiptFile, "garage-receipts");

      // احجز الترتيب فوراً بإدخال السطر (الـ unique index في قاعدة البيانات
      // بيمنع اتنين ياخدوا نفس الترتيب 1/2/3 في نفس اللحظة)
      const { error: insertError } = await supabase.from("garage_listings").insert({
        garage_name: form.garage_name,
        owner_name: form.owner_name,
        phone: form.phone,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        map_link: form.map_link,
        rank: form.rank,
        price: RANK_PRICES[form.rank],
        photo_url: photoUrl,
        receipt_url: receiptUrl,
        status: "pending",
      });

      if (insertError) {
        // لو الترتيب اتحجز من حد تاني في نفس اللحظة بالظبط
        if (insertError.code === "23505") {
          setError("للأسف تم حجز هذا الترتيب للتو من مستخدم آخر، من فضلك اختر ترتيب آخر");
          await fetchTakenRanks();
          setSubmitting(false);
          return;
        }
        throw insertError;
      }

      sendNotificationEmail(form);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("حصل خطأ أثناء إرسال الطلب، من فضلك حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setStep(1);
    setForm({
      garage_name: "",
      owner_name: "",
      phone: "",
      address: "",
      lat: null,
      lng: null,
      map_link: "",
      rank: null,
    });
    setPhotoFile(null);
    setReceiptFile(null);
    setConfirmed(false);
    setError("");
    setSuccess(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* هيدر */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">أضف جراجك</h2>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-5">
          {success ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">تم استلام طلبك</h3>
              <p className="text-gray-500 text-sm mb-6">
                سيتم مراجعة إيصال التحويل والموافقة على ظهور الجراج قريباً.
              </p>
              <button
                onClick={resetAndClose}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold"
              >
                تم
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <Field label="اسم الجراج">
                    <input
                      className="input"
                      value={form.garage_name}
                      onChange={(e) => handleChange("garage_name", e.target.value)}
                      placeholder="مثال: جراج النجاح لصيانة السيارات"
                    />
                  </Field>

                  <Field label="اسم صاحب الجراج">
                    <input
                      className="input"
                      value={form.owner_name}
                      onChange={(e) => handleChange("owner_name", e.target.value)}
                    />
                  </Field>

                  <Field label="رقم الهاتف">
                    <input
                      className="input"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="05xxxxxxxx"
                    />
                  </Field>

                  <Field label="العنوان">
                    <textarea
                      className="input min-h-[80px]"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="المنطقة، الشارع، أقرب معلم"
                    />
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={gpsLoading}
                      className="mt-2 text-sm text-blue-600 font-medium flex items-center gap-1"
                    >
                      📍 {gpsLoading ? "جاري تحديد موقعك..." : "استخدم موقعي الحالي"}
                    </button>
                    {form.map_link && (
                      <p className="mt-1 text-xs text-green-600">
                        تم تحديد الموقع بنجاح ✓
                      </p>
                    )}
                  </Field>

                  <Field label="صورة الجراج">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="input"
                    />
                  </Field>

                  <button
                    onClick={goToStep2}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold mt-2"
                  >
                    التالي: اختر الترتيب
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      اختر ترتيب ظهور الجراج
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 0].map((rankKey) => {
                        const isTaken = rankKey !== 0 && takenRanks.includes(rankKey);
                        const isSelected = form.rank === rankKey;
                        return (
                          <button
                            key={rankKey}
                            type="button"
                            disabled={isTaken || loadingRanks}
                            onClick={() => selectRank(rankKey)}
                            className={`rounded-xl border-2 px-3 py-3 text-right transition ${
                              isSelected
                                ? "border-blue-600 bg-blue-50"
                                : isTaken
                                ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="font-bold text-gray-900 text-sm">
                              {RANK_LABELS[rankKey]}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {RANK_PRICES[rankKey].toLocaleString()} درهم/سنة
                            </div>
                            {isTaken && (
                              <div className="text-[11px] text-red-500 mt-1">محجوز</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {form.rank !== null && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-800">
                        المبلغ المطلوب: {RANK_PRICES[form.rank].toLocaleString()} درهم
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        حوّل المبلغ على الحساب التالي، ثم ارفع صورة الإيصال:
                      </p>
                      <BankRow label="اسم البنك" value={BANK_DETAILS.bankName} />
                      <BankRow label="اسم صاحب الحساب" value={BANK_DETAILS.accountHolder} />
                      <BankRow label="IBAN" value={BANK_DETAILS.iban} />
                      <BankRow label="رقم الحساب" value={BANK_DETAILS.accountNumber} />
                      <BankRow label="Swift Code" value={BANK_DETAILS.swift} />
                      <BankRow label="Routing Number" value={BANK_DETAILS.routing} />
                      <BankRow label="العملة" value={BANK_DETAILS.currency} />
                    </div>
                  )}

                  {form.rank !== null && (
                    <>
                      <Field label="صورة إيصال التحويل">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                          className="input"
                        />
                      </Field>

                      <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={confirmed}
                          onChange={(e) => setConfirmed(e.target.checked)}
                          className="mt-1"
                        />
                        <span>أؤكد أنني قمت بتحويل المبلغ المطلوب على الحساب أعلاه</span>
                      </label>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        submitting ||
                        form.rank === null ||
                        !receiptFile ||
                        !confirmed
                      }
                      className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-40"
                    >
                      {submitting ? "جاري الإرسال..." : "أضف جراجك"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.65rem 0.85rem;
          font-size: 0.9rem;
        }
        .input:focus {
          outline: none;
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function BankRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-semibold text-gray-800" dir="ltr">
        {value}
      </span>
    </div>
  );
}
