import { C, FONT_SIGN, FONT_BODY } from "../theme";

/* The wordmark as a road sign: Arabic over English, white on sign blue,
   inside a white inset border. `size` scales the whole sign. */
export default function SignLogo({ size = 1, framed = true }) {
  const word = (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15, color: C.onAccent }}>
      {/* room below the Arabic for the dots of the ي, which hang lower than the line box */}
      <span dir="rtl" style={{ fontFamily: FONT_SIGN, fontWeight: 800, fontSize: 19 * size, paddingBottom: 4 * size }}>سيارتي</span>
      <span dir="ltr" style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 10.5 * size, letterSpacing: "0.08em" }}>SAYYARTI</span>
    </span>
  );
  if (!framed) return word;
  return (
    <span style={{ display: "inline-flex", background: C.accent, borderRadius: 10 * size, padding: 4 * size }}>
      <span style={{ display: "inline-flex", border: `${Math.max(1.5, 2 * size)}px solid ${C.onAccent}`, borderRadius: 7 * size, padding: `${5 * size}px ${12 * size}px` }}>
        {word}
      </span>
    </span>
  );
}
