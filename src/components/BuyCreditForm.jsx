import { useState } from "react";
import { useCloseOnBack } from "../backButton";
import { uploadReceipt } from "../receipts";
import { supabase } from "../supabaseClient";
import { C } from "../theme";

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

// ===== باقات الرصيد (رصيد مشترك: تشخيص صور + تقييم سعر) =====
export const PACKAGES = [
  { id: "trial", credits: 3, price: 9, labelAr: "تجربة", labelEn: "Trial" },
  { id: "standard", credits: 10, price: 25, labelAr: "قياسية", labelEn: "Standard" },
  { id: "saver", credits: 25, price: 50, labelAr: "موفرة", labelEn: "Saver" },
];

export default function BuyCreditForm({ isOpen, onClose, lang, userEmail }) {
  const isAr = lang === "ar";

  const [step, setStep] = useState(1); // 1: اختيار الباقة, 2: الدفع
  const [selectedPkg, setSelectedPkg] = useState(null);
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

  function validateStep2() {
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
      const receiptUrl = await uploadReceipt("photo-diagnosis-receipts", receiptFile);

      const { error: insertError } = await supabase.rpc("submit_credit_purchase", {
        p_credits_requested: selectedPkg.credits,
        p_receipt_url: receiptUrl,
      });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err) {
      console.error(err);
      // the database says why it refused; show the cases a customer can act on
      const msg = String(err?.message || "");
      if (msg.includes("too many pending requests")) {
        setError(t("عندك ٣ طلبات لسه بنراجعها. استنى لحد ما نراجعهم وبعدين ابعت طلب جديد.", "You have 3 requests we're still reviewing. Please wait for them before sending another."));
      } else if (msg.includes("receipt already used")) {
        setError(t("الإيصال ده اتبعت قبل كده. ارفع صورة إيصال التحويل الجديد.", "This receipt was already sent. Please upload the receipt for this transfer."));
      } else {
        setError(t("حصل خطأ أثناء إرسال الطلب، حاول مرة أخرى", "Something went wrong, please try again"));
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resetAndClose() {
    setStep(1);
    setSelectedPkg(null);
    setReceiptFile(null);
    setConfirmed(false);
    setError("");
    setSuccess(false);
    onClose();
  }

  useCloseOnBack(isOpen, () => resetAndClose());

  if (!isOpen) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="fixed inset-0 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      style={{ zIndex: 10050 /* above the bottom nav (9990) and the AI button (10001) */ }}
    >
      <div
        className="w-full sm:max-w-lg bg-surface rounded-t-2xl sm:rounded-2xl overflow-y-auto shadow-2xl"
        style={{ maxHeight: "92dvh", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-bold text-ink">
            {t("اشترِ كريديتس", "Buy Credits")}
          </h3>
          <button
            onClick={resetAndClose}
            className="text-dim hover:text-ink text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-green-500/15 text-green-400 flex items-center justify-center text-2xl mx-auto mb-4">
                ✓
              </div>
              <h3 className="text-lg font-bold text-ink mb-2">
                {t("تم استلام طلبك", "Request received")}
              </h3>
              <p className="text-dim text-sm mb-6">
                {t(
                  "هنراجع إيصال التحويل ونضيف الرصيد لحسابك تلقائيًا — مفيش كود هتحتاج تكتبه.",
                  "We'll review the receipt and add the credits to your account automatically — no code needed."
                )}
              </p>
              <button
                onClick={resetAndClose}
                className="w-full py-3 rounded-xl bg-accent text-on-accent font-semibold"
              >
                {t("تم", "Done")}
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-dim">
                    {t(
                      "كل كريدت = تشخيص صورة واحد أو تقييم سعر سيارة واحد. اختار الباقة المناسبة لك:",
                      "Each credit = one photo diagnosis or one car valuation. Choose the package that suits you:"
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
                            isSelected ? "border-accent bg-accent/10" : "border-line"
                          }`}
                        >
                          <div className={isAr ? "text-right" : "text-left"}>
                            <div className="font-bold text-ink text-sm">
                              {isAr ? pkg.labelAr : pkg.labelEn}
                            </div>
                            <div className="text-xs text-dim mt-1">
                              {t(`${pkg.credits} كريديت`, `${pkg.credits} credits`)}
                            </div>
                          </div>
                          <div className="font-bold text-ink">
                            {pkg.price} {t("درهم", "AED")}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={goToStep2}
                    className="w-full py-3 rounded-xl bg-accent text-on-accent font-semibold mt-2"
                  >
                    {t("التالي: الدفع", "Next: Payment")}
                  </button>
                </div>
              )}

              {step === 2 && selectedPkg && (
                <div className="space-y-5">
                  <div className="bg-page border border-line rounded-xl p-4 space-y-2">
                    <p className="text-sm font-semibold text-ink">
                      {t(
                        `المبلغ المطلوب: ${selectedPkg.price} درهم (${selectedPkg.credits} كريديت)`,
                        `Amount due: ${selectedPkg.price} AED (${selectedPkg.credits} credits)`
                      )}
                    </p>
                    <p className="text-xs text-dim mb-2">
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

                  {userEmail && (
                    <div className="text-xs text-dim">
                      {t("الرصيد هيتضاف لحساب: ", "Credits will be added to: ")}
                      <span className="font-semibold text-dim">{userEmail}</span>
                    </div>
                  )}

                  <Field label={t("صورة إيصال التحويل", "Transfer receipt photo")}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="input"
                    />
                  </Field>

                  <label className="flex items-start gap-2 text-sm text-dim">
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
                      className="flex-1 py-3 rounded-xl border border-line text-dim font-semibold"
                    >
                      {t("رجوع", "Back")}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !receiptFile || !confirmed}
                      className="flex-[2] py-3 rounded-xl bg-accent text-on-accent font-semibold disabled:opacity-40"
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
          border: 1px solid ${C.line};
          border-radius: 0.75rem;
          padding: 0.65rem 0.85rem;
          font-size: 0.9rem;
          background: ${C.bg};
          color: ${C.text};
          color-scheme: dark;
        }
        .input::placeholder {
          color: ${C.textDim};
          opacity: 0.6;
        }
        .input:focus {
          outline: none;
          border-color: ${C.accent};
        }
        input[type="checkbox"] {
          accent-color: ${C.accent};
        }
        .input::file-selector-button {
          margin-inline-end: 0.75rem;
          padding: 0.35rem 0.8rem;
          border: 1px solid ${C.line};
          border-radius: 0.5rem;
          background: ${C.surface};
          color: ${C.text};
          font: inherit;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-dim mb-1">{label}</label>
      {children}
    </div>
  );
}

function BankRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-dim">{label}</span>
      <span className="font-mono font-semibold text-ink" dir="ltr">
        {value}
      </span>
    </div>
  );
}
