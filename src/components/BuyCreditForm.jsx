import { useState } from "react";
import { supabase } from "../supabaseClient"; // عدّل المسار ده لو ملف supabase عندك في مكان مختلف

// ===== بيانات الحساب البنكي (نفس حساب الجراجات) =====
const BANK_DETAILS = {
  bankName: "Emirates NBD",
  accountHolder: "Osama Elshamy",
  iban: "AE22 0260 0010 1566 9507 601",
  accountNumber: "1015669507601",
  currency: "AED",
  swift: "EBILAEAD",
  routing: "202620103",
};

// ===== باقات الرصيد =====
const PACKAGES = [
  { id: "trial", credits: 3, price: 9, labelAr: "تجربة", labelEn: "Trial" },
  { id: "standard", credits: 10, price: 25, labelAr: "قياسية", labelEn: "Standard" },
  { id: "saver", credits: 25, price: 50, labelAr: "موفرة", labelEn: "Saver" },
];

export default function BuyCreditForm({ isOpen, onClose, lang }) {
  const isAr = lang === "ar";

  const [step, setStep] = useState(1); // 1: اختيار الباقة, 2: الدفع
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function t(ar, en) {
    return isAr ? ar : en;
  }

  function selectPackage(pkg) {
    setSelectedPkg(pkg);
    setError("");
  }

  function goToStep2() {
    if (!selectedPkg) {
      setError(t("من فضلك اختر باقة", "Please select a package"));
      return;
    }
    setError("");
    setStep(2);
  }

  async function uploadReceipt(file) {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("photo-diagnosis-receipts")
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage
      .from("photo-diagnosis-receipts")
      .getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function sendNotificationEmail(payload) {
    // نستنى لحد ما سكربت EmailJS يتحمل بدل ما نتجاهل الإرسال بصمت
    let attempts = 0;
    while (!window.emailjs && attempts < 20) {
      await new Promise((r) => setTimeout(r, 250));
      attempts++;
    }
    if (!window.emailjs) {
      console.error("EmailJS لم يتم تحميله، تم تخطي إرسال إشعار الإيميل");
      return;
    }
    try {
      await window.emailjs.send("service_k8e4q6h", "template_rg47ctr", {
        garage_name: "طلب شراء رصيد تشخيص بالصور",
        owner_name: "طلب تشخيص صورة",
        phone: payload.whatsapp,
        address: `باقة التشخيص: ${payload.pkg.labelAr} — ${payload.pkg.credits} تشخيص`,
        map_link: "Photo Diagnosis / Credit Purchase",
        rank: `Credits: ${payload.pkg.credits}`,
        price: payload.pkg.price,
      });
    } catch (err) {
      console.error("فشل إرسال إشعار الإيميل:", err);
    }
  }

  function validateStep2() {
    if (!whatsapp.trim()) return t("من فضلك اكتب رقم الواتساب", "Please enter your WhatsApp number");
    if (!receiptFile) return t("من فضلك ارفع صورة إيصال التحويل", "Please upload the transfer receipt");
    if (!confirmed) return t("من فضلك أكّد أنك قمت بتحويل المبلغ", "Please confirm you made the transfer");
    return "";
  }

  async function handleSubmit() {
    const err = validateStep2();
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const receiptUrl = await uploadReceipt(receiptFile);

      const { error: insertError } = await supabase.rpc("submit_photo_diagnosis_request", {
        p_whatsapp_number: whatsapp.trim(),
        p_package_credits: selectedPkg.credits,
        p_receipt_url: receiptUrl,
      });

      if (insertError) throw insertError;

      sendNotificationEmail({ whatsapp: whatsapp.trim(), pkg: selectedPkg });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(t("حصل خطأ أثناء إرسال الطلب، حاول مرة أخرى", "Something went wrong, please try again"));
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setStep(1);
    setSelectedPkg(null);
    setWhatsapp("");
    setReceiptFile(null);
    setConfirmed(false);
    setError("");
    setSuccess(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            {t("اشترِ رصيد تشخيص", "Buy Diagnosis Credit")}
          </h3>
          <button
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t("تم استلام طلبك", "Request received")}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {t(
                  "هنراجع إيصال التحويل ونبعتلك كود الرصيد على الواتساب قريباً.",
                  "We'll review the receipt and send your credit code on WhatsApp soon."
                )}
              </p>
              <button
                onClick={resetAndClose}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold"
              >
                {t("تم", "Done")}
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
                  <p className="text-sm text-gray-500">
                    {t(
                      "كل كريدت = تشخيص واحد لصورة واحدة. اختار الباقة المناسبة لك:",
                      "Each credit = one photo diagnosis. Choose the package that suits you:"
                    )}
                  </p>

                  <div className="space-y-2">
                    {PACKAGES.map((pkg) => {
                      const isSelected = selectedPkg?.id === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => selectPackage(pkg)}
                          className={`w-full rounded-xl border-2 px-4 py-3 flex items-center justify-between transition ${
                            isSelected ? "border-blue-600 bg-blue-50" : "border-gray-200"
                          }`}
                        >
                          <div className={isAr ? "text-right" : "text-left"}>
                            <div className="font-bold text-gray-900 text-sm">
                              {isAr ? pkg.labelAr : pkg.labelEn}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {t(`${pkg.credits} تشخيص`, `${pkg.credits} diagnoses`)}
                            </div>
                          </div>
                          <div className="font-bold text-gray-900">
                            {pkg.price} {t("درهم", "AED")}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={goToStep2}
                    className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold mt-2"
                  >
                    {t("التالي: الدفع", "Next: Payment")}
                  </button>
                </div>
              )}

              {step === 2 && selectedPkg && (
                <div className="space-y-5">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-800">
                      {t(
                        `المبلغ المطلوب: ${selectedPkg.price} درهم (${selectedPkg.credits} تشخيص)`,
                        `Amount due: ${selectedPkg.price} AED (${selectedPkg.credits} diagnoses)`
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mb-2">
                      {t(
                        "حوّل المبلغ على الحساب التالي، ثم ارفع صورة الإيصال:",
                        "Transfer the amount to the account below, then upload the receipt:"
                      )}
                    </p>
                    <BankRow label={t("اسم البنك", "Bank name")} value={BANK_DETAILS.bankName} />
                    <BankRow label={t("اسم صاحب الحساب", "Account holder")} value={BANK_DETAILS.accountHolder} />
                    <BankRow label="IBAN" value={BANK_DETAILS.iban} />
                    <BankRow label={t("رقم الحساب", "Account number")} value={BANK_DETAILS.accountNumber} />
                    <BankRow label="Swift Code" value={BANK_DETAILS.swift} />
                    <BankRow label="Routing Number" value={BANK_DETAILS.routing} />
                    <BankRow label={t("العملة", "Currency")} value={BANK_DETAILS.currency} />
                  </div>

                  <Field label={t("رقم الواتساب", "WhatsApp number")}>
                    <input
                      className="input"
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="05xxxxxxxx"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      {t("هنبعتلك كود الرصيد عليه بعد المراجعة", "We'll send your credit code here after review")}
                    </p>
                  </Field>

                  <Field label={t("صورة إيصال التحويل", "Transfer receipt photo")}>
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
                    <span>{t("أؤكد أنني قمت بتحويل المبلغ المطلوب على الحساب أعلاه", "I confirm I transferred the amount to the account above")}</span>
                  </label>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold"
                    >
                      {t("رجوع", "Back")}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !whatsapp.trim() || !receiptFile || !confirmed}
                      className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-40"
                    >
                      {submitting ? t("جاري الإرسال...", "Sending...") : t("أرسل الطلب", "Submit request")}
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
