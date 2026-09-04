import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

// ===== Bank account details =====
const BANK_DETAILS = {
  bankName: "Emirates NBD",
  accountHolder: "Osama Elshamy",
  iban: "AE22 0260 0010 1566 9507 601",
  accountNumber: "1015669507601",
  currency: "AED",
  swift: "EBILAEAD",
  routing: "202620103",
};

// ===== Rank prices =====
const RANK_PRICES = {
  1: 10000,
  2: 7000,
  3: 4000,
  0: 2000,
};

const MAX_PHOTOS = 6;

const T = {
  ar: {
    title: "أضف مكتب تأجير سيارات",
    nameLabel: "اسم مكتب التأجير",
    namePlaceholder: "مثال: مكتب النجاح لتأجير السيارات",
    ownerLabel: "اسم صاحب المكتب",
    phoneLabel: "رقم الهاتف",
    phonePlaceholder: "05xxxxxxxx",
    addressLabel: "العنوان",
    addressPlaceholder: "المنطقة، الشارع، أقرب معلم",
    useLocation: "استخدم موقعي الحالي",
    useLocationLoading: "جاري تحديد موقعك...",
    locationSet: "تم تحديد الموقع بنجاح ✓",
    photoLabel: "صور المكتب",
    photoHint: `تقدر ترفع لحد ${MAX_PHOTOS} صور`,
    photoCount: (n) => `${n} صورة مختارة`,
    nextBtn: "التالي: اختر الترتيب",
    rankSectionTitle: "اختر ترتيب ظهور المكتب",
    rankLabels: { 1: "الترتيب الأول", 2: "الترتيب الثاني", 3: "الترتيب الثالث", 0: "ترتيب عادي" },
    perYear: "درهم/سنة",
    taken: "محجوز",
    amountRequired: (n) => `المبلغ المطلوب: ${n.toLocaleString()} درهم`,
    transferInstructions: "حوّل المبلغ على الحساب التالي، ثم ارفع صورة الإيصال:",
    bankName: "اسم البنك",
    accountHolder: "اسم صاحب الحساب",
    accountNumber: "رقم الحساب",
    currency: "العملة",
    receiptLabel: "صورة إيصال التحويل",
    confirmLabel: "أؤكد أنني قمت بتحويل المبلغ المطلوب على الحساب أعلاه",
    backBtn: "رجوع",
    submitBtn: "أضف مكتبك",
    submittingBtn: "جاري الإرسال...",
    successTitle: "تم استلام طلبك",
    successMsg: "سيتم مراجعة إيصال التحويل والموافقة على ظهور مكتبك قريباً.",
    doneBtn: "تم",
    errName: "من فضلك اكتب اسم مكتب التأجير",
    errOwner: "من فضلك اكتب اسم صاحب المكتب",
    errPhone: "من فضلك اكتب رقم الهاتف",
    errAddress: "من فضلك اكتب العنوان",
    errPhoto: "من فضلك ارفع صورة واحدة على الأقل للمكتب",
    errGeo: "جهازك لا يدعم تحديد الموقع",
    errGeoFail: "تعذر الحصول على موقعك، حاول مرة أخرى أو اكتب العنوان يدوياً",
    errRank: "من فضلك اختر الترتيب المطلوب",
    errReceipt: "من فضلك ارفع صورة إيصال التحويل البنكي",
    errConfirm: "من فضلك أكّد أنك قمت بتحويل المبلغ",
    errRankTaken: "للأسف تم حجز هذا الترتيب للتو من مستخدم آخر، من فضلك اختر ترتيب آخر",
    errGeneric: "حصل خطأ أثناء إرسال الطلب، من فضلك حاول مرة أخرى",
  },
  en: {
    title: "Add a Car Rental Office",
    nameLabel: "Rental office name",
    namePlaceholder: "e.g. Al Najah Car Rental Office",
    ownerLabel: "Owner's name",
    phoneLabel: "Phone number",
    phonePlaceholder: "05xxxxxxxx",
    addressLabel: "Address",
    addressPlaceholder: "Area, street, nearest landmark",
    useLocation: "Use my current location",
    useLocationLoading: "Getting your location...",
    locationSet: "Location set successfully ✓",
    photoLabel: "Office photos",
    photoHint: `You can upload up to ${MAX_PHOTOS} photos`,
    photoCount: (n) => `${n} photo${n === 1 ? "" : "s"} selected`,
    nextBtn: "Next: choose ranking",
    rankSectionTitle: "Choose your listing rank",
    rankLabels: { 1: "1st position", 2: "2nd position", 3: "3rd position", 0: "Standard listing" },
    perYear: "AED/year",
    taken: "Taken",
    amountRequired: (n) => `Amount due: AED ${n.toLocaleString()}`,
    transferInstructions: "Transfer the amount to the account below, then upload the receipt:",
    bankName: "Bank name",
    accountHolder: "Account holder",
    accountNumber: "Account number",
    currency: "Currency",
    receiptLabel: "Transfer receipt photo",
    confirmLabel: "I confirm I have transferred the required amount to the account above",
    backBtn: "Back",
    submitBtn: "Add your office",
    submittingBtn: "Submitting...",
    successTitle: "Your request has been received",
    successMsg: "We'll review your transfer receipt and approve your listing shortly.",
    doneBtn: "Done",
    errName: "Please enter the rental office name",
    errOwner: "Please enter the owner's name",
    errPhone: "Please enter a phone number",
    errAddress: "Please enter the address",
    errPhoto: "Please upload at least one photo of the office",
    errGeo: "Your device doesn't support location detection",
    errGeoFail: "Couldn't get your location, try again or enter the address manually",
    errRank: "Please choose a listing rank",
    errReceipt: "Please upload the bank transfer receipt",
    errConfirm: "Please confirm you've transferred the amount",
    errRankTaken: "Sorry, this rank was just taken by someone else — please pick another one",
    errGeneric: "Something went wrong while submitting, please try again",
  },
};

export default function RentalListingForm({ isOpen, onClose, country = "uae", lang = "ar" }) {
  const isAr = lang !== "en";
  const t = isAr ? T.ar : T.en;
  const dir = isAr ? "rtl" : "ltr";

  const [step, setStep] = useState(1);
  const [takenRanks, setTakenRanks] = useState([]);
  const [loadingRanks, setLoadingRanks] = useState(true);

  const [form, setForm] = useState({
    rental_name: "",
    owner_name: "",
    phone: "",
    address: "",
    lat: null,
    lng: null,
    map_link: "",
    rank: null,
  });

  const [photoFiles, setPhotoFiles] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetchTakenRanks();
  }, [isOpen]);

  async function fetchTakenRanks() {
    setLoadingRanks(true);
    const { data, error } = await supabase
      .from("rental_active_ranks")
      .select("rank");

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
      setError(t.errGeo);
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
        setError(t.errGeoFail);
        setGpsLoading(false);
      }
    );
  }

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS);
    setPhotoFiles(files);
  }

  function validateStep1() {
    if (!form.rental_name.trim()) return t.errName;
    if (!form.owner_name.trim()) return t.errOwner;
    if (!form.phone.trim()) return t.errPhone;
    if (!form.address.trim()) return t.errAddress;
    if (!photoFiles.length) return t.errPhoto;
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
    if (rankKey !== 0 && takenRanks.includes(rankKey)) return;
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
    if (!window.emailjs) return;
    window.emailjs.send("service_k8e4q6h", "template_rg47ctr", {
      garage_name: payload.rental_name,
      owner_name: payload.owner_name,
      phone: payload.phone,
      address: payload.address,
      map_link: payload.map_link || (isAr ? "لم يتم تحديد الموقع بالـ GPS" : "GPS location not set"),
      rank: T.ar.rankLabels[payload.rank],
      price: RANK_PRICES[payload.rank],
    });
  }

  async function handleSubmit() {
    if (form.rank === null) {
      setError(t.errRank);
      return;
    }
    if (!receiptFile) {
      setError(t.errReceipt);
      return;
    }
    if (!confirmed) {
      setError(t.errConfirm);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const photoUrls = [];
      for (const file of photoFiles) {
        photoUrls.push(await uploadFile(file, "garage-photos"));
      }
      const receiptUrl = await uploadFile(receiptFile, "garage-receipts");

      const { data: requestId, error: submitError } = await supabase.rpc("submit_rental_listing", {
        p_rental_name: form.rental_name,
        p_owner_name: form.owner_name,
        p_phone: form.phone,
        p_address: form.address,
        p_lat: form.lat,
        p_lng: form.lng,
        p_map_link: form.map_link || null,
        p_rank: form.rank,
        p_photo_url: photoUrls[0],
        p_photo_urls: photoUrls,
        p_receipt_url: receiptUrl,
        p_country: country,
      });

      if (submitError) {
        const msg = String(submitError.message || "");
        if (msg.toLowerCase().includes("rank") || msg.includes("duplicate") || submitError.code === "23505") {
          setError(t.errRankTaken);
          await fetchTakenRanks();
          return;
        }
        throw submitError;
      }

      if (!requestId) throw new Error("no id");

      sendNotificationEmail(form);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(t.errGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setStep(1);
    setForm({
      rental_name: "",
      owner_name: "",
      phone: "",
      address: "",
      lat: null,
      lng: null,
      map_link: "",
      rank: null,
    });
    setPhotoFiles([]);
    setReceiptFile(null);
    setConfirmed(false);
    setError("");
    setSuccess(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      dir={dir}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{t.title}</h2>
          <button onClick={resetAndClose} className="text-gray-400 text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.successTitle}</h3>
              <p className="text-gray-500 text-sm mb-6">{t.successMsg}</p>
              <button
                onClick={resetAndClose}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold"
              >
                {t.doneBtn}
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
                  <Field label={t.nameLabel}>
                    <input
                      className="input"
                      value={form.rental_name}
                      onChange={(e) => handleChange("rental_name", e.target.value)}
                      placeholder={t.namePlaceholder}
                    />
                  </Field>

                  <Field label={t.ownerLabel}>
                    <input
                      className="input"
                      value={form.owner_name}
                      onChange={(e) => handleChange("owner_name", e.target.value)}
                    />
                  </Field>

                  <Field label={t.phoneLabel}>
                    <input
                      className="input"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder={t.phonePlaceholder}
                    />
                  </Field>

                  <Field label={t.addressLabel}>
                    <textarea
                      className="input min-h-[80px]"
                      value={form.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder={t.addressPlaceholder}
                    />
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={gpsLoading}
                      className="mt-2 text-sm text-blue-600 font-medium flex items-center gap-1"
                    >
                      📍 {gpsLoading ? t.useLocationLoading : t.useLocation}
                    </button>
                    {form.map_link && (
                      <p className="mt-1 text-xs text-green-600">{t.locationSet}</p>
                    )}
                  </Field>

                  <Field label={t.photoLabel}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="input"
                    />
                    <p className="mt-1 text-xs text-gray-400">{t.photoHint}</p>
                    {photoFiles.length > 0 && (
                      <>
                        <p className="mt-1 text-xs text-green-600">{t.photoCount(photoFiles.length)}</p>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {photoFiles.map((f, i) => (
                            <img
                              key={i}
                              src={URL.createObjectURL(f)}
                              alt=""
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </Field>

                  <button
                    onClick={goToStep2}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold mt-2"
                  >
                    {t.nextBtn}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">{t.rankSectionTitle}</p>
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
                            className={`rounded-xl border-2 px-3 py-3 text-${isAr ? "right" : "left"} transition ${
                              isSelected
                                ? "border-blue-600 bg-blue-50"
                                : isTaken
                                ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="font-bold text-gray-900 text-sm">
                              {t.rankLabels[rankKey]}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {RANK_PRICES[rankKey].toLocaleString()} {t.perYear}
                            </div>
                            {isTaken && (
                              <div className="text-[11px] text-red-500 mt-1">{t.taken}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {form.rank !== null && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                      <p className="text-sm font-semibold text-gray-800">
                        {t.amountRequired(RANK_PRICES[form.rank])}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">{t.transferInstructions}</p>
                      <BankRow label={t.bankName} value={BANK_DETAILS.bankName} />
                      <BankRow label={t.accountHolder} value={BANK_DETAILS.accountHolder} />
                      <BankRow label="IBAN" value={BANK_DETAILS.iban} />
                      <BankRow label={t.accountNumber} value={BANK_DETAILS.accountNumber} />
                      <BankRow label="Swift Code" value={BANK_DETAILS.swift} />
                      <BankRow label="Routing Number" value={BANK_DETAILS.routing} />
                      <BankRow label={t.currency} value={BANK_DETAILS.currency} />
                    </div>
                  )}

                  {form.rank !== null && (
                    <>
                      <Field label={t.receiptLabel}>
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
                        <span>{t.confirmLabel}</span>
                      </label>
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold"
                    >
                      {t.backBtn}
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
                      {submitting ? t.submittingBtn : t.submitBtn}
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
