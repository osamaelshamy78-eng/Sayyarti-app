import { ChevronRight, ChevronLeft } from "lucide-react";
import { C } from "../theme";

export function BackHeader({ label, onBack, isRTL }) {
  const Icon = isRTL ? ChevronRight : ChevronLeft;
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1 px-5 pt-4 pb-2"
      style={{ border: "none", background: "none", cursor: "pointer" }}
    >
      <Icon size={18} color={C.accent} />
      <span style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  );
}
