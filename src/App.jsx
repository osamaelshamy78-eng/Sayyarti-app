import React, { useState, useEffect } from "react";
import {
  Gauge,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlayCircle,
  Wrench,
  Info,
  Megaphone,
  Settings,
  Car,
  Plus,
  MessageCircle,
  HelpCircle,
  Search,
  Droplet,
  Camera,
  Menu,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Tag,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import GarageListingForm from "./components/GarageListingForm";
import PhotoDiagnosisView from "./components/PhotoDiagnosisView";
import CarValuationView from "./components/CarValuationView";
import CarForm, { CAR_MAKES, CAR_MODELS } from "./components/CarForm";

/* ---------------------------------------------------------------
   Design tokens
--------------------------------------------------------------- */
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
  grey: "#6B7280",
};

/* ---------------------------------------------------------------
   Dashboard warning-light icons
   Hand-drawn to resemble the actual symbols cars show on the
   instrument cluster, not generic icons.
--------------------------------------------------------------- */
const iconProps = (size, color, strokeWidth) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

function EngineLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <rect x="4" y="10" width="12" height="7" rx="1" />
      <rect x="6.5" y="6.5" width="2.5" height="3.5" />
      <rect x="10" y="6.5" width="2.5" height="3.5" />
      <path d="M16 12.5h2.5l1.5 2v2.5h-4" />
      <line x1="2" y1="13.5" x2="4" y2="13.5" />
    </svg>
  );
}

function BatteryLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <rect x="4" y="9" width="16" height="10" rx="1" />
      <rect x="8" y="6.3" width="2.4" height="3" fill={color} stroke="none" />
      <rect x="13.6" y="6.3" width="2.4" height="3" fill={color} stroke="none" />
      <line x1="7.5" y1="14" x2="10.5" y2="14" />
      <line x1="9" y1="12.5" x2="9" y2="15.5" />
      <line x1="13.5" y1="14" x2="16.5" y2="14" />
    </svg>
  );
}

function OilLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <path d="M6 11c0-1.1.9-2 2-2h5l3.5-2.4v2.4H17a2 2 0 012 2v4.5a2 2 0 01-2 2H9.5A3.5 3.5 0 016 14V11z" />
      <circle cx="9.5" cy="18.3" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

function BrakeLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.3 7.5c-1.7 1.6-1.7 7.4 0 9" />
      <path d="M14.7 7.5c1.7 1.6 1.7 7.4 0 9" />
      <line x1="12" y1="8.5" x2="12" y2="13" />
      <circle cx="12" cy="15.5" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

function TempLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <rect x="10.5" y="3.5" width="3" height="10" rx="1.5" />
      <circle cx="12" cy="17" r="3" />
      <line x1="12" y1="7" x2="12" y2="15" />
      <path d="M3.5 20c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" />
    </svg>
  );
}

function TireLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <path d="M4.5 11a7.5 4.5 0 0115 0" />
      <path d="M4.5 11c0 3 1.7 4.8 1.7 7.5h2c0-2.7-1-4.5-1-7.5" />
      <path d="M19.5 11c0 3-1.7 4.8-1.7 7.5h-2c0-2.7 1-4.5 1-7.5" />
      <line x1="12" y1="10" x2="12" y2="14.5" />
      <circle cx="12" cy="16.8" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

function TransmissionLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 5.5v2M12 16.5v2M5.5 12h2M16.5 12h2M7.3 7.3l1.4 1.4M15.3 15.3l1.4 1.4M7.3 16.7l1.4-1.4M15.3 8.7l1.4-1.4" />
    </svg>
  );
}

function SteeringLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.3" />
      <path d="M12 5.5v4.2M6.3 15.2l3.6-2.1M17.7 15.2l-3.6-2.1" />
      <line x1="19" y1="5" x2="19" y2="8" />
      <circle cx="19" cy="10.3" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

/* ---------------------------------------------------------------
   Content data
--------------------------------------------------------------- */
const CATEGORIES = [
  {
    id: "engine",
    icon: EngineLightIcon,
    en: "Engine",
    ar: "المحرك",
    guideEn: "Check Engine",
    guideAr: "افحص المحرك",
    issues: ["checkEngine", "overheating", "noStart", "exhaustSmoke", "fuelSmell", "squealingBelt", "roughIdle"],

  },
  {
    id: "battery",
    icon: BatteryLightIcon,
    en: "Battery & Electrical",
    ar: "البطارية والكهرباء",
    guideEn: "Battery Charge",
    guideAr: "شحن البطارية",
    issues: ["deadBattery", "altWarning", "keyFobIssue", "batteryDrain"],
  },
  {
    id: "brakes",
    icon: BrakeLightIcon,
    en: "Brakes",
    ar: "الفرامل",
    guideEn: "Brake System",
    guideAr: "نظام الفرامل",
    issues: ["brakeNoise", "softPedal", "brakeVibration"],
  },
  {
    id: "ac",
    icon: TempLightIcon,
    en: "AC & Cooling",
    ar: "التكييف والتبريد",
    guideEn: "Engine Temperature",
    guideAr: "حرارة المحرك",
    issues: ["acWarm", "acSmell", "acNoAir"],
  },
  {
    id: "tires",
    icon: TireLightIcon,
    en: "Tires",
    ar: "الإطارات",
    guideEn: "Tire Pressure",
    guideAr: "ضغط الإطارات",
    issues: ["tirePressure", "unevenWear", "flatTire", "tireVibration"],
  },
  {
    id: "oil",
    icon: OilLightIcon,
    en: "Oil & Fluids",
    ar: "الزيت والسوائل",
    guideEn: "Oil Pressure",
    guideAr: "ضغط الزيت",
    issues: ["oilWarning", "oilLeak"],
  },
  {
    id: "transmission",
    icon: TransmissionLightIcon,
    en: "Transmission",
    ar: "ناقل الحركة",
    guideEn: "Transmission",
    guideAr: "ناقل الحركة",
    issues: ["transSlip", "noShift", "clutchSlip"],
  },
  {
    id: "suspension",
    icon: SteeringLightIcon,
    en: "Steering & Suspension",
    ar: "التوجيه والتعليق",
    guideEn: "Power Steering",
    guideAr: "نظام التوجيه",
    issues: ["steeringVibration", "clunkBumps", "shocksWorn"],
  },
  {
    id: "general",
    icon: HelpCircle,
    en: "General / Not Sure What's Wrong",
    ar: "أعطال عامة / مش عارف العطل فين",
    guideEn: "Not Sure? Start Here",
    guideAr: "مش متأكد؟ ابدأ من هنا",
    issues: ["notSureIssue", "powerWindow", "wiperIssue", "commonFuses"],
  },
];

const ISSUES = {
  notSureIssue: {
    en: {
      title: "Not Sure What's Wrong? Start Here",
      symptoms: [
        "Something feels off but you can't tell exactly what",
        "A mix of small symptoms at once (noise + smell + light, etc.)",
        "A new sound, smell, or feeling you don't recognize",
      ],
      causes: [
        "Could be minor (low fluid, loose cap) or serious — the only way to know is to narrow it down",
      ],
      steps: [
        "Check the dashboard for any warning lights — a lit icon points straight to the right category in this app",
        "Note exactly when it happens: at startup, while driving, when braking, when turning, or only when the AC is on",
        "Notice any smell, noise, smoke, or leak, and try to tell where it's coming from (front, back, under the hood, under the car)",
        "Check fluid levels you can safely see: engine oil, coolant, brake fluid, washer fluid",
        "If you have a way to, get an OBD-II scan — many garages do this for free and it reads the exact fault code",
        "Still not sure? Don't keep driving and guessing — use the Garages tab to find a nearby garage and describe the symptoms to them directly",
      ],
      video: "how to diagnose a car problem when you don't know what's wrong",
    },
    ar: {
      title: "مش عارف العطل فين بالظبط؟ ابدأ من هنا",
      symptoms: [
        "حاسس إن في حاجة مش طبيعية بس مش عارف تحددها",
        "أكتر من عرض بسيط في نفس الوقت (صوت + ريحة + لمبة تحذير مثلاً)",
        "صوت أو ريحة أو إحساس جديد مش متعود عليه",
      ],
      causes: [
        "ممكن يكون سبب بسيط (نقص سائل، غطاء مش محكم) أو سبب أكبر، والطريقة الوحيدة لمعرفة السبب هي تحديد العرض بدقة",
      ],
      steps: [
        "افحص لوحة القيادة وشوف هل فيه أي لمبة تحذير مضاءة، فهي بتوجهك مباشرة للقسم المناسب في التطبيق",
        "لاحظ بالظبط إمتى بتحصل المشكلة: عند بدء التشغيل، أثناء القيادة، عند الفرملة، عند لف المقود، أو بس لما المكيف شغال",
        "لاحظ أي ريحة أو صوت أو دخان أو تسريب وحاول تحدد مكانه (قدام، ورا، تحت الكبوت، تحت العربية)",
        "افحص مستويات السوائل اللي تقدر تشوفها بأمان: زيت المحرك، سائل التبريد، زيت الفرامل، سائل الغسيل",
        "لو تقدر، اعمل فحص بجهاز OBD-II، ورش كتير بتعمله مجانًا وبيقرأ كود العطل بالظبط",
        "لسه مش متأكد؟ متكملش تسوق وانت مخمن، استخدم تاب الجراجات في التطبيق ودور على جراج قريب واشرحله العرض مباشرة",
      ],
      video: "طريقة تشخيص عطل السيارة لما ما تعرفش السبب",
    },
  },
  commonFuses: {
    en: {
      title: "Common Car Fuses and What They Do",
      symptoms: [
        "A specific feature (lights, radio, wipers...) suddenly stops working while everything else is fine",
        "You want to check a fuse yourself before going to a garage",
      ],
      causes: [
        "The example below is based on a widely common sedan layout (Toyota Corolla-style cabin fuse box) — most compact/family cars use a similar general grouping, but exact fuse numbers, amperage, and box location still differ by make, model, and year",
        "Always confirm against the diagram printed on the inside of your own fuse box lid or your owner's manual before pulling a fuse — never rely on this list alone",
        "There are usually two boxes: a smaller one under the dashboard (cabin) and a bigger one under the hood (engine bay) with higher-amperage fuses",
      ],
      steps: [
        "Fuse #1 (~15A) — Power outlet / charging socket",
        "Fuse #2 (~7.5A) — OBD diagnostic port (used to scan fault codes)",
        "Fuse #5 (~20A) — Power door lock system",
        "Fuses #10–12 (~20A each) — Power windows (usually one fuse per door group)",
        "Fuse #13 (~15A) — Windshield washer pump",
        "Fuses #14 & #16 (~25A each) — Front wipers",
        "Fuse #17 (~15A) — Cigarette lighter / accessory socket",
        "Fuse #18 (~7.5A) — Mirrors, clock, audio system standby power",
        "Fuse #20 (~10A) — Tail lights, position lights, license plate light",
        "Fuse #26 (~7.5A) — AC system and rear window defogger (ignition-on circuit)",
        "Fuse #29 (~7.5A) — Ignition/start system, fuel injection, steering lock",
        "Fuse #32 (~7.5A) — SRS airbag system — never remove this to test, get a mechanic if it's the suspected issue",
        "Engine bay — Horn fuse (~10A)",
        "Engine bay — Radio/audio system fuse (~20A)",
        "Engine bay — ABS/VSC fuse (~30A)",
        "Engine bay — AC compressor/heater main fuse (~50A)",
        "Engine bay — Alternator/charging main fuse (~120A, one of the largest in the car)",
        "If a fuse is blown (the thin metal strip inside is broken), replace it with one of the exact same amperage — never a higher one, it can cause a fire",
      ],
      video: "how to check and replace a car fuse",
    },
    ar: {
      title: "الفيوزات الشائعة في السيارة ووظيفة كل واحد",
      symptoms: [
        "جهاز معين في السيارة (الإضاءة، الراديو، المساحات...) توقف فجأة وباقي الأجهزة شغالة عادي",
        "عايز تفحص فيوز بنفسك قبل ما تروح الجراج",
      ],
      causes: [
        "الترتيب اللي تحت ده مبني على تصميم شائع في السيارات السيدان (على نمط علبة فيوزات كورولا)، وغالبية السيارات المتوسطة بتقسّم فيوزاتها بنفس المنطق تقريبًا، لكن الرقم والأمبير ومكان العلبة بيختلفوا حسب الماركة والموديل والسنة",
        "لازم دايمًا تتأكد من الرسم المطبوع جوه غطاء علبة الفيوزات بتاعتك أو كتيب السيارة قبل ما تطلع أي فيوز، متعتمدش على القائمة دي لوحدها",
        "غالبًا في علبتين: واحدة صغيرة تحت الديكور جوه العربية، وواحدة أكبر تحت الكبوت فيها فيوزات بأمبيرات أعلى",
      ],
      steps: [
        "الفيوز رقم ١ (حوالي ١٥ أمبير) — منفذ الشحن/الولاعة",
        "الفيوز رقم ٢ (حوالي ٧.٥ أمبير) — منفذ فحص الأعطال OBD",
        "الفيوز رقم ٥ (حوالي ٢٠ أمبير) — نظام قفل الأبواب المركزي",
        "الفيوزات من ١٠ إلى ١٢ (حوالي ٢٠ أمبير لكل واحد) — الشبابيك الكهربائية (غالبًا فيوز لكل مجموعة أبواب)",
        "الفيوز رقم ١٣ (حوالي ١٥ أمبير) — طرمبة سائل غسيل الزجاج",
        "الفيوزات ١٤ و ١٦ (حوالي ٢٥ أمبير لكل واحد) — المساحات الأمامية",
        "الفيوز رقم ١٧ (حوالي ١٥ أمبير) — الولاعة/منفذ الإكسسوارات",
        "الفيوز رقم ١٨ (حوالي ٧.٥ أمبير) — المرايا، الساعة، تغذية الراديو الاحتياطية",
        "الفيوز رقم ٢٠ (حوالي ١٠ أمبير) — الأنوار الخلفية، أنوار الوقوف، لمبة اللوحة",
        "الفيوز رقم ٢٦ (حوالي ٧.٥ أمبير) — نظام التكييف وفتيلة تسخين الزجاج الخلفي (دائرة تعمل مع دوران الكونتاكت)",
        "الفيوز رقم ٢٩ (حوالي ٧.٥ أمبير) — نظام الكونتاكت/التشغيل، حقن الوقود، قفل عمود التوجيه",
        "الفيوز رقم ٣٢ (حوالي ٧.٥ أمبير) — نظام الإيرباج (SRS)، متشيلوش أبدًا للتجربة، لو هو المشتبه فيه لازم فني متخصص",
        "تحت الكبوت — فيوز الكلاكس (حوالي ١٠ أمبير)",
        "تحت الكبوت — فيوز الراديو/نظام الصوت (حوالي ٢٠ أمبير)",
        "تحت الكبوت — فيوز نظام ABS/VSC (حوالي ٣٠ أمبير)",
        "تحت الكبوت — الفيوز الرئيسي للمكيف/الدفاية (حوالي ٥٠ أمبير)",
        "تحت الكبوت — الفيوز الرئيسي للدينامو/الشحن (حوالي ١٢٠ أمبير، من أكبر الفيوزات في السيارة)",
        "لو الفيوز محروق (الشريط المعدني الرفيع جواه مقطوع)، بدّله بفيوز بنفس الأمبير بالظبط، وممنوع تحط أمبير أعلى لأنه ممكن يسبب حريق",
      ],
      video: "كيفية فحص واستبدال فيوز السيارة",
    },
  },
  checkEngine: {
    en: {
      title: "Check Engine Light Is On",
      symptoms: [
        "Dashboard warning icon lit",
        "Rough idling or power loss",
        "Poor fuel economy",
      ],
      causes: [
        "Loose or faulty fuel cap",
        "Faulty oxygen sensor",
        "Worn spark plugs or ignition coils",
        "Catalytic converter issue",
      ],
      steps: [
        "Check that the fuel cap is tightened properly",
        "Get an OBD-II scan to read the exact fault code",
        "Replace worn spark plugs if the code points to misfires",
        "If the light flashes, stop driving and get it towed — that signals a serious misfire",
      ],
      video: "how to diagnose check engine light OBD2",
    },
    ar: {
      title: "لمبة فحص المحرك مضاءة",
      symptoms: [
        "إضاءة أيقونة التحذير في لوحة القيادة",
        "اهتزاز المحرك أثناء التوقف أو ضعف الأداء",
        "زيادة استهلاك الوقود",
      ],
      causes: [
        "غطاء خزان الوقود غير محكم أو تالف",
        "عطل في حساس الأكسجين",
        "شمعات إشعال أو كويلات تالفة",
        "مشكلة في المحول الحفاز",
      ],
      steps: [
        "تأكد من إحكام غطاء خزان الوقود",
        "افحص السيارة بجهاز قراءة الأعطال (OBD-II) لمعرفة الكود بالتحديد",
        "استبدل شمعات الإشعال التالفة إذا أشار الكود إلى خلل في الإشعال",
        "إذا كانت اللمبة تومض، توقف عن القيادة واطلب سطحة فورًا لأن ذلك يشير لخلل خطير",
      ],
      video: "سبب اضاءة لمبة فحص المحرك وطريقة الفحص",
    },
  },
  overheating: {
    en: {
      title: "Engine Overheating",
      symptoms: [
        "Temperature gauge in the red zone",
        "Steam from under the hood",
        "Sweet smell — possible coolant leak",
      ],
      causes: [
        "Low coolant level or a leak",
        "Faulty radiator fan or thermostat",
        "Water pump failure",
      ],
      steps: [
        "Pull over safely and turn off the engine immediately",
        "Let it cool for at least 30 minutes before opening the hood",
        "Check the coolant level once cool and top up if needed",
        "Do not keep driving if it overheats again — have it towed",
      ],
      video: "car engine overheating what to do",
    },
    ar: {
      title: "ارتفاع حرارة المحرك",
      symptoms: [
        "مؤشر الحرارة في المنطقة الحمراء",
        "تصاعد بخار من تحت غطاء المحرك",
        "رائحة حلوة قد تدل على تسرب سائل التبريد",
      ],
      causes: [
        "نقص سائل التبريد أو تسربه",
        "عطل في مروحة الرادياتير أو الثرموستات",
        "تعطل طرمبة المياه",
      ],
      steps: [
        "أوقف السيارة بأمان وأطفئ المحرك فورًا",
        "انتظر ٣٠ دقيقة على الأقل قبل فتح غطاء المحرك",
        "تحقق من مستوى سائل التبريد بعد أن يبرد المحرك وأضف إذا لزم",
        "لا تكمل القيادة إذا تكررت المشكلة، بل اطلب سطحة",
      ],
      video: "ارتفاع حرارة المحرك ماذا افعل",
    },
  },
  deadBattery: {
    en: {
      title: "Car Won't Start (Dead Battery)",
      symptoms: [
        "Clicking sound when turning the key",
        "Dashboard lights dim or won't turn on",
        "Engine cranks slowly",
      ],
      causes: [
        "Battery drained or old (2–4 year lifespan in hot climates)",
        "Corroded battery terminals",
        "Alternator not charging properly",
      ],
      steps: [
        "Try jump-starting with cables from another car",
        "Clean corroded terminals with a wire brush",
        "If the jump-start works but the battery dies again, have the alternator tested",
        "Replace the battery if it's over 3 years old",
      ],
      video: "how to jump start a car battery",
    },
    ar: {
      title: "السيارة لا تعمل (بطارية فارغة)",
      symptoms: [
        "صوت طقطقة عند تشغيل المفتاح",
        "أضواء لوحة القيادة خافتة أو لا تعمل",
        "المحرك يدور ببطء عند المحاولة",
      ],
      causes: [
        "بطارية فارغة أو قديمة (عمرها ٢-٤ سنوات في الأجواء الحارة)",
        "أطراف البطارية متآكلة",
        "الدينامو لا يشحن بشكل صحيح",
      ],
      steps: [
        "حاول تشغيل السيارة بكابلات من سيارة أخرى",
        "نظف أطراف البطارية المتآكلة بفرشاة سلك",
        "إذا اشتغلت بالكابل ثم فرغت مرة أخرى، افحص الدينامو",
        "استبدل البطارية إذا كان عمرها أكثر من ٣ سنوات",
      ],
      video: "طريقة تشغيل السيارة ببطارية فارغة بالكابل",
    },
  },
  brakeNoise: {
    en: {
      title: "Squeaking or Grinding Brakes",
      symptoms: [
        "High-pitched squeal when braking",
        "Grinding metal sound",
        "Car pulls to one side when braking",
      ],
      causes: [
        "Worn brake pads (squeal is often a built-in wear indicator)",
        "Pads fully worn — metal on metal",
        "Warped brake rotor",
      ],
      steps: [
        "Get the brake pads inspected as soon as you hear squealing",
        "Replace pads before the grinding stage to avoid rotor damage",
        "Have rotors resurfaced or replaced if warped",
        "Avoid hard braking until it's inspected",
      ],
      video: "brake pads squeaking grinding causes",
    },
    ar: {
      title: "صوت صرير أو احتكاك في الفرامل",
      symptoms: [
        "صوت صرير حاد عند الضغط على الفرامل",
        "صوت احتكاك معدني",
        "السيارة تنحرف لجهة واحدة عند الفرملة",
      ],
      causes: [
        "تآكل تيل الفرامل (الصرير غالبًا مؤشر تآكل مدمج)",
        "تآكل التيل بالكامل واحتكاك معدني",
        "اعوجاج قرص الفرامل",
      ],
      steps: [
        "افحص تيل الفرامل فور سماع الصرير",
        "استبدل التيل قبل مرحلة الاحتكاك لتجنب تلف القرص",
        "أعد تسوية أو استبدل القرص إذا كان معوجًا",
        "تجنب الفرملة القوية حتى الفحص",
      ],
      video: "سبب صوت الفرامل عند الوقوف والدوس",
    },
  },
  acWarm: {
    en: {
      title: "AC Blowing Warm Air",
      symptoms: [
        "Weak or warm airflow from vents",
        "AC compressor clutch not engaging",
        "Unusual noise when AC is on",
      ],
      causes: [
        "Low refrigerant due to a leak",
        "Faulty AC compressor",
        "Clogged cabin air filter or condenser",
      ],
      steps: [
        "Check the cabin air filter and replace it if dirty",
        "Have the system checked for refrigerant leaks with UV dye",
        "Recharge refrigerant only after the leak is fixed — refilling alone won't last",
        "Have the compressor tested if the clutch doesn't engage",
      ],
      video: "car AC blowing warm air fix",
    },
    ar: {
      title: "المكيف يخرج هواء ساخن",
      symptoms: [
        "هواء ضعيف أو ساخن من الفتحات",
        "كلتش الكمبروسر لا يعمل",
        "صوت غير طبيعي عند تشغيل المكيف",
      ],
      causes: [
        "نقص غاز الفريون بسبب تسرب",
        "عطل في كمبروسر المكيف",
        "انسداد فلتر الهواء الداخلي أو المكثف",
      ],
      steps: [
        "افحص فلتر الهواء الداخلي واستبدله إذا كان متسخًا",
        "اطلب فحص النظام بحثًا عن تسرب الفريون باستخدام صبغة UV",
        "لا تكتفِ بإعادة تعبئة الفريون قبل إصلاح مصدر التسرب",
        "افحص الكمبروسر إذا لم يعمل الكلتش",
      ],
      video: "سبب خروج هواء ساخن من مكيف السيارة",
    },
  },
  tirePressure: {
    en: {
      title: "Tire Pressure Warning or Flat Tire",
      symptoms: [
        "TPMS warning light on the dashboard",
        "Vehicle pulling to one side",
        "Visible bulge or puncture in a tire",
      ],
      causes: [
        "Natural pressure loss from heat fluctuation",
        "Nail or road debris puncture",
        "Slow leak from a damaged valve stem",
      ],
      steps: [
        "Check pressure with a gauge and inflate to the recommended PSI (door-jamb sticker)",
        "Inspect the tire visually for punctures or bulges",
        "Use a spare or emergency inflator kit if flat, then get it patched or replaced",
        "Never patch a sidewall puncture — the tire must be replaced",
      ],
      video: "how to check and fix tire pressure warning",
    },
    ar: {
      title: "تحذير ضغط الإطارات أو إطار مفرغ",
      symptoms: [
        "إضاءة تحذير ضغط الإطارات (TPMS)",
        "انحراف السيارة لجهة واحدة",
        "انتفاخ أو ثقب ظاهر في الإطار",
      ],
      causes: [
        "فقدان طبيعي للضغط بسبب تغير درجة الحرارة",
        "ثقب من مسمار أو حطام على الطريق",
        "تسرب بطيء من صمام الإطار التالف",
      ],
      steps: [
        "افحص الضغط بجهاز قياس وانفخه حسب الملصق الموجود على باب السيارة",
        "افحص الإطار بصريًا بحثًا عن ثقوب أو انتفاخات",
        "استخدم الإطار الاحتياطي أو طقم النفخ الطارئ إذا كان مفرغًا، ثم رقعه أو استبدله",
        "لا يمكن ترقيع ثقب في الجدار الجانبي، يجب استبدال الإطار",
      ],
      video: "طريقة فحص ضغط الاطارات وحل مشكلة التحذير",
    },
  },
  oilWarning: {
    en: {
      title: "Oil Pressure Warning Light",
      symptoms: [
        "Oil-can icon lit on the dashboard",
        "Ticking or knocking engine noise",
        "Oil level low on the dipstick",
      ],
      causes: [
        "Low oil level",
        "Failing oil pump",
        "Worn engine bearings causing pressure loss",
      ],
      steps: [
        "Stop the car safely and turn off the engine right away",
        "Check the oil level with the dipstick once it's safe",
        "Top up oil if low, then recheck the light after restarting",
        "If the light stays on with oil topped up, do not drive — have it towed",
      ],
      video: "oil pressure warning light what to do",
    },
    ar: {
      title: "لمبة تحذير ضغط الزيت",
      symptoms: [
        "إضاءة أيقونة علبة الزيت في لوحة القيادة",
        "صوت طرقعة أو نقر من المحرك",
        "مستوى الزيت منخفض عند فحص العصا",
      ],
      causes: [
        "نقص مستوى الزيت",
        "تعطل طرمبة الزيت",
        "تآكل جلب المحرك مما يسبب فقدان الضغط",
      ],
      steps: [
        "أوقف السيارة بأمان وأطفئ المحرك فورًا",
        "افحص مستوى الزيت بالعصا بعد التأكد من الأمان",
        "أضف زيتًا إذا كان المستوى منخفضًا ثم أعد التشغيل للتأكد",
        "إذا استمرت اللمبة رغم إضافة الزيت، لا تقد السيارة واطلب سطحة",
      ],
      video: "لمبة الزيت اضاءت ماذا افعل",
    },
  },
  transSlip: {
    en: {
      title: "Transmission Slipping or Jerking",
      symptoms: [
        "Delayed or rough gear shifts",
        "RPM rises without a matching speed increase",
        "Jerking or clunking during shifts",
      ],
      causes: [
        "Low or degraded transmission fluid",
        "Worn clutch plates (automatic) or clutch (manual)",
        "Faulty transmission control module or sensor",
      ],
      steps: [
        "Check transmission fluid level and condition (should be red/pink, not dark or burnt)",
        "Top up or change the fluid if it's low or degraded",
        "Get a diagnostic scan done if the issue continues",
        "Avoid towing heavy loads until it's inspected",
      ],
      video: "transmission slipping symptoms and causes",
    },
    ar: {
      title: "ناقل الحركة يهتز أو يتقافز",
      symptoms: [
        "تأخر أو خشونة في تغيير التروس",
        "ارتفاع دورات المحرك دون زيادة السرعة",
        "اهتزاز أو صوت طرق عند تغيير الجير",
      ],
      causes: [
        "نقص أو تدهور زيت ناقل الحركة",
        "تآكل أقراص الكلتش (أوتوماتيك) أو الدبرياج (عادي)",
        "عطل في وحدة تحكم ناقل الحركة أو الحساسات",
      ],
      steps: [
        "افحص مستوى وحالة زيت الفتيس (يجب أن يكون أحمر أو وردي وليس داكنًا أو محروقًا)",
        "أضف أو غيّر الزيت إذا كان منخفضًا أو متدهورًا",
        "اطلب فحصًا بجهاز تشخيص إذا استمرت المشكلة",
        "تجنب سحب أحمال ثقيلة حتى الفحص",
      ],
      video: "سبب اهتزاز الفتيس عند تغيير السرعة",
    },
  },
  steeringVibration: {
    en: {
      title: "Steering Wheel Vibration",
      symptoms: [
        "Shaking felt in the steering wheel at speed",
        "Vibration increases when braking",
        "Uneven tire wear",
      ],
      causes: [
        "Unbalanced or misaligned wheels",
        "Warped brake rotors",
        "Worn suspension parts (tie rods, ball joints)",
      ],
      steps: [
        "Get wheel alignment and balancing checked first — the most common cause",
        "If vibration happens mainly when braking, inspect the rotors for warping",
        "Have a mechanic inspect suspension and steering components",
        "Avoid high-speed driving until it's diagnosed",
      ],
      video: "steering wheel vibration causes fix",
    },
    ar: {
      title: "اهتزاز عجلة القيادة",
      symptoms: [
        "اهتزاز محسوس في عجلة القيادة أثناء السرعة",
        "يزداد الاهتزاز عند الفرملة",
        "تآكل غير منتظم في الإطارات",
      ],
      causes: [
        "عدم توازن أو محاذاة الإطارات",
        "اعوجاج أقراص الفرامل",
        "تآكل أجزاء نظام التعليق (طرف الجنزير، مفصلات الكرة)",
      ],
      steps: [
        "ابدأ بفحص محاذاة وتوازن الإطارات فهي السبب الأكثر شيوعًا",
        "إذا كان الاهتزاز أساسًا عند الفرملة، افحص أقراص الفرامل بحثًا عن اعوجاج",
        "اطلب من الميكانيكي فحص أجزاء التعليق والتوجيه",
        "تجنب القيادة بسرعة عالية حتى يتم التشخيص",
      ],
      video: "سبب اهتزاز السيارة في عجلة القيادة",
    },
  },
  noStart: {
    en: {
      title: "Engine Cranks But Won't Start",
      symptoms: [
        "Engine turns over but doesn't fire up",
        "Smell of fuel without the engine starting",
        "Repeated clicking or a single click, then silence",
      ],
      causes: [
        "Empty or near-empty fuel tank",
        "Faulty fuel pump or clogged fuel filter",
        "Weak spark from worn spark plugs or a failing ignition coil",
        "Immobilizer/security system fault (common on newer cars)",
      ],
      steps: [
        "Check the fuel gauge — an empty tank is the most common cause",
        "Listen for the fuel pump priming (a brief hum) when you turn the key to 'on'",
        "If no hum, the fuel pump or its relay may need testing",
        "If it's a repeated issue, get a full diagnostic scan rather than guessing at parts",
      ],
      video: "car cranks but won't start no fuel",
    },
    ar: {
      title: "المحرك يدور ولا يشتغل",
      symptoms: [
        "المحرك يدور لكنه لا يشتغل",
        "رائحة وقود بدون أن يشتغل المحرك",
        "صوت طقطقة متكرر أو طقة واحدة ثم صمت",
      ],
      causes: [
        "خزان وقود فارغ أو شبه فارغ",
        "عطل في طرمبة الوقود أو انسداد فلتر الوقود",
        "شرارة ضعيفة بسبب شمعات إشعال تالفة أو كويل إشعال معطل",
        "عطل في نظام الإيموبيلايزر/الحماية (شائع في السيارات الحديثة)",
      ],
      steps: [
        "افحص مؤشر الوقود، فالخزان الفارغ هو السبب الأكثر شيوعًا",
        "استمع لصوت طرمبة الوقود (طنين بسيط) عند إدارة المفتاح لوضع التشغيل",
        "إذا لم تسمع الطنين، قد تحتاج طرمبة الوقود أو الريلاي الخاص بها للفحص",
        "إذا تكررت المشكلة، اطلب فحصًا كاملًا بجهاز تشخيص بدل تخمين القطعة التالفة",
      ],
      video: "المحرك يدور ولا يشتغل السبب",
    },
  },
  altWarning: {
    en: {
      title: "Battery Warning Light While Driving",
      symptoms: [
        "Battery-shaped icon lit on the dashboard while the engine is running",
        "Dimming headlights or flickering interior lights",
        "Electronics (radio, windows) acting up while driving",
      ],
      causes: [
        "Failing alternator not charging the battery properly",
        "Loose, worn, or broken alternator drive belt",
        "Corroded or loose battery/alternator connections",
      ],
      steps: [
        "Turn off non-essential electronics (AC, radio) to reduce load",
        "Try to reach a garage rather than stopping on a highway shoulder if possible",
        "Have the alternator output tested — most auto electric shops do this quickly",
        "Replace the alternator or belt as needed; don't ignore it, as the battery will eventually die while driving",
      ],
      video: "alternator warning light while driving",
    },
    ar: {
      title: "لمبة تحذير البطارية أثناء القيادة",
      symptoms: [
        "أيقونة البطارية مضاءة في لوحة القيادة والمحرك يعمل",
        "خفوت المصابيح الأمامية أو وميض الإضاءة الداخلية",
        "أعطال بالأجهزة الكهربائية (الراديو، الزجاج) أثناء القيادة",
      ],
      causes: [
        "تعطل الدينامو وعدم شحنه للبطارية بشكل صحيح",
        "سير الدينامو مرتخي أو تالف أو مقطوع",
        "وصلات البطارية أو الدينامو متآكلة أو غير محكمة",
      ],
      steps: [
        "أطفئ الأجهزة الكهربائية غير الضرورية (المكيف، الراديو) لتقليل الحمل",
        "حاول الوصول لورشة بدل التوقف على كتف الطريق السريع إن أمكن",
        "اطلب فحص خرج الدينامو، معظم ورش الكهرباء تفحصه بسرعة",
        "استبدل الدينامو أو السير حسب الحاجة، ولا تتجاهل الأمر لأن البطارية ستفرغ أثناء القيادة في النهاية",
      ],
      video: "سبب اضاءة لمبة البطارية اثناء القيادة",
    },
  },
  softPedal: {
    en: {
      title: "Brake Pedal Feels Soft or Spongy",
      symptoms: [
        "Pedal sinks closer to the floor than usual",
        "Need to pump the pedal to get full braking power",
        "Longer stopping distance than normal",
      ],
      causes: [
        "Air trapped in the brake lines",
        "Low brake fluid or a fluid leak",
        "Worn brake master cylinder",
      ],
      steps: [
        "Check the brake fluid reservoir level and top up if low",
        "Look under the car and around the wheels for signs of fluid leaks",
        "This usually needs the brake lines to be bled by a mechanic — don't rely on topping up fluid alone",
        "Avoid driving if the pedal goes all the way to the floor — have it towed instead",
      ],
      video: "spongy soft brake pedal causes",
    },
    ar: {
      title: "دواسة الفرامل طرية أو غائرة",
      symptoms: [
        "الدواسة تغوص لأسفل أكثر من المعتاد",
        "تحتاج تضغط على الدواسة أكثر من مرة للحصول على فرملة كاملة",
        "مسافة توقف أطول من المعتاد",
      ],
      causes: [
        "هواء محبوس في خطوط الفرامل",
        "نقص زيت الفرامل أو تسربه",
        "تآكل مضخة الفرامل الرئيسية (الماستر سلندر)",
      ],
      steps: [
        "افحص مستوى زيت الفرامل في الخزان وأضف إذا كان منخفضًا",
        "افحص أسفل السيارة وحول العجلات بحثًا عن علامات تسرب",
        "غالبًا يحتاج الأمر تنفيس خطوط الفرامل عند الميكانيكي، لا تعتمد على إضافة الزيت فقط",
        "تجنب القيادة إذا وصلت الدواسة لأرضية السيارة تمامًا، واطلب سطحة بدلاً من ذلك",
      ],
      video: "سبب دواسة الفرامل طرية",
    },
  },
  acSmell: {
    en: {
      title: "AC Making Noise or Bad Smell",
      symptoms: [
        "Musty or moldy smell when the AC turns on",
        "Rattling, squealing, or clicking noise from the AC",
        "Weak airflow along with the smell or noise",
      ],
      causes: [
        "Mold or bacteria buildup in the evaporator or ducts",
        "Dirty or clogged cabin air filter",
        "Worn AC compressor clutch or bearing",
      ],
      steps: [
        "Replace the cabin air filter — this alone often fixes the smell",
        "Run the AC on fan-only (no cooling) for a few minutes before turning off the car to help dry out the system",
        "Have the evaporator cleaned or treated with an anti-bacterial spray if the smell persists",
        "If the noise is mechanical (grinding, squealing), have the compressor inspected before it fails completely",
      ],
      video: "car AC bad smell noise fix",
    },
    ar: {
      title: "المكيف يصدر صوتًا أو رائحة كريهة",
      symptoms: [
        "رائحة عفن أو رطوبة عند تشغيل المكيف",
        "صوت خشخشة أو صرير أو طقطقة من المكيف",
        "هواء ضعيف مصحوب بالرائحة أو الصوت",
      ],
      causes: [
        "تراكم عفن أو بكتيريا في المبخر أو المجاري الهوائية",
        "فلتر هواء داخلي متسخ أو مسدود",
        "تآكل كلتش أو بلي كمبروسر المكيف",
      ],
      steps: [
        "استبدل فلتر الهواء الداخلي، غالبًا هذا وحده يحل مشكلة الرائحة",
        "شغّل المروحة فقط (بدون تبريد) لبضع دقائق قبل إطفاء السيارة لتجفيف النظام",
        "نظّف المبخر أو عالجه برذاذ مضاد للبكتيريا إذا استمرت الرائحة",
        "إذا كان الصوت ميكانيكيًا (احتكاك، صرير)، افحص الكمبروسر قبل أن يتعطل بالكامل",
      ],
      video: "سبب رائحة وصوت مكيف السيارة",
    },
  },
  unevenWear: {
    en: {
      title: "Uneven or Rapid Tire Wear",
      symptoms: [
        "One tire wears faster than the others",
        "Wear concentrated on the inner or outer edge only",
        "Bald patches or cupping (scalloped wear pattern)",
      ],
      causes: [
        "Wheel misalignment",
        "Incorrect tire pressure (too high or too low)",
        "Worn suspension components affecting wheel angle",
      ],
      steps: [
        "Check and correct tire pressure first — it's the simplest fix",
        "Get a wheel alignment done, especially after hitting a pothole or curb",
        "Rotate tires regularly (every 8,000–10,000 km) to even out wear",
        "If wear is severe on one tire, have suspension components checked too",
      ],
      video: "uneven tire wear causes alignment",
    },
    ar: {
      title: "تآكل غير منتظم أو سريع في الإطارات",
      symptoms: [
        "إطار واحد يتآكل أسرع من الباقي",
        "تآكل مركّز على الحافة الداخلية أو الخارجية فقط",
        "بقع صلعاء أو تآكل متموج (نمط تآكل غير منتظم)",
      ],
      causes: [
        "عدم محاذاة الإطارات",
        "ضغط هواء غير صحيح (مرتفع جدًا أو منخفض جدًا)",
        "تآكل أجزاء التعليق مما يؤثر على زاوية العجلة",
      ],
      steps: [
        "افحص وصحح ضغط الإطارات أولاً، فهو الحل الأبسط",
        "اطلب محاذاة الإطارات، خاصة بعد الدخول في حفرة أو الاصطدام برصيف",
        "دوّر الإطارات بانتظام (كل ٨٠٠٠-١٠٠٠٠ كم) لتوزيع التآكل",
        "إذا كان التآكل شديدًا في إطار واحد، افحص أجزاء التعليق أيضًا",
      ],
      video: "سبب تآكل الاطارات غير المنتظم",
    },
  },
  oilLeak: {
    en: {
      title: "Oil Leak Under the Car",
      symptoms: [
        "Dark spots or puddles under the car after parking",
        "Burning oil smell, especially after driving",
        "Low oil level on the dipstick despite recent top-ups",
      ],
      causes: [
        "Worn oil pan gasket or valve cover gasket",
        "Damaged oil drain plug or loose oil filter",
        "Worn engine seals (more common in older or high-mileage cars)",
      ],
      steps: [
        "Place a piece of cardboard under the car overnight to locate the exact leak point",
        "Check the oil level regularly until the leak is fixed to avoid running low",
        "Have a mechanic inspect the pan gasket, drain plug, and filter first — these are the cheapest fixes",
        "Don't ignore a persistent leak — running low on oil can cause serious engine damage",
      ],
      video: "car oil leak under engine causes",
    },
    ar: {
      title: "تسرب زيت أسفل السيارة",
      symptoms: [
        "بقع داكنة أو بركة زيت أسفل السيارة بعد ركنها",
        "رائحة زيت محروق، خاصة بعد القيادة",
        "مستوى زيت منخفض رغم الإضافة الأخيرة",
      ],
      causes: [
        "تآكل جوان علبة الزيت أو جوان غطاء الصمامات",
        "تلف مسمار تصريف الزيت أو ارتخاء فلتر الزيت",
        "تآكل سيلات المحرك (أكثر شيوعًا في السيارات القديمة أو عالية الكيلومترات)",
      ],
      steps: [
        "ضع قطعة كرتون أسفل السيارة طوال الليل لتحديد مكان التسرب بالضبط",
        "افحص مستوى الزيت بانتظام حتى يتم إصلاح التسرب لتجنب نقصه",
        "اطلب من الميكانيكي فحص جوان العلبة ومسمار التصريف والفلتر أولاً، فهي الأرخص إصلاحًا",
        "لا تتجاهل التسرب المستمر، فنقص الزيت قد يسبب تلفًا خطيرًا للمحرك",
      ],
      video: "سبب تسرب الزيت اسفل السيارة",
    },
  },
  noShift: {
    en: {
      title: "Transmission Won't Shift Into Gear",
      symptoms: [
        "Car doesn't move when shifted into Drive or Reverse",
        "Engine revs but the car stays still",
        "Grinding noise when trying to shift (manual transmission)",
      ],
      causes: [
        "Very low or contaminated transmission fluid",
        "Worn clutch (manual) or torque converter issue (automatic)",
        "Faulty shift solenoid or transmission control module",
      ],
      steps: [
        "Check the transmission fluid level first — this is the most common and cheapest cause",
        "Don't force the gear shift lever if it's resisting — this can cause more damage",
        "Have the car towed to a transmission specialist rather than driving it in this state",
        "Avoid repeated attempts to shift, as this can worsen internal damage",
      ],
      video: "transmission not shifting into gear",
    },
    ar: {
      title: "ناقل الحركة لا يدخل في السرعة",
      symptoms: [
        "السيارة لا تتحرك عند اختيار وضع القيادة (Drive) أو الرجوع للخلف",
        "دورات المحرك ترتفع لكن السيارة تبقى ثابتة",
        "صوت احتكاك عند محاولة تغيير السرعة (ناقل حركة عادي)",
      ],
      causes: [
        "زيت ناقل الحركة منخفض جدًا أو ملوّث",
        "تآكل الدبرياج (عادي) أو مشكلة في المحول العزمي (أوتوماتيك)",
        "عطل في السولينويد أو وحدة تحكم ناقل الحركة",
      ],
      steps: [
        "افحص مستوى زيت الفتيس أولاً، فهو السبب الأكثر شيوعًا والأرخص إصلاحًا",
        "لا تجبر ذراع تغيير السرعة إذا كان يقاوم، فهذا قد يسبب ضررًا أكبر",
        "اطلب سطحة توصل السيارة لمتخصص فتيس بدل قيادتها بهذه الحالة",
        "تجنب المحاولات المتكررة لتغيير السرعة، لأنها قد تزيد الضرر الداخلي سوءًا",
      ],
      video: "سبب عدم دخول الفتيس في السرعة",
    },
  },
  clunkBumps: {
    en: {
      title: "Clunking Noise Over Bumps",
      symptoms: [
        "A knocking or clunking sound when driving over bumps or potholes",
        "Noise more noticeable at low speeds",
        "Slightly looser or less stable steering feel",
      ],
      causes: [
        "Worn sway bar links or bushings",
        "Worn shock absorbers or struts",
        "Loose or worn suspension mounts",
      ],
      steps: [
        "Note whether the noise comes from the front, back, left, or right — this helps the mechanic pinpoint it",
        "Have the sway bar links and bushings inspected first, as they're a common and cheap cause",
        "Check shocks/struts for visible oil leaks or bouncing after pressing down on the car's corner",
        "Don't ignore it for too long — worn suspension parts affect handling and tire wear",
      ],
      video: "clunking noise over bumps suspension",
    },
    ar: {
      title: "صوت طرق عند المرور فوق المطبات",
      symptoms: [
        "صوت طرق أو خبط عند المرور فوق المطبات أو الحفر",
        "الصوت أوضح عند السرعات المنخفضة",
        "إحساس بتوجيه أقل ثباتًا قليلاً",
      ],
      causes: [
        "تآكل وصلات أو بوش عصا موازنة الجنزير (سواي بار)",
        "تآكل المساعدات (الكاتم) أو المكبس (سترَت)",
        "قواعد تعليق مرتخية أو متآكلة",
      ],
      steps: [
        "لاحظ مصدر الصوت (أمامي، خلفي، يمين، يسار) فهذا يساعد الميكانيكي على تحديده بسرعة",
        "افحص وصلات وبوش عصا الموازنة أولاً، فهي سبب شائع ورخيص الإصلاح",
        "افحص المساعدات بحثًا عن تسرب زيت ظاهر أو ارتداد بعد الضغط على زاوية السيارة",
        "لا تتجاهله لفترة طويلة، فتآكل أجزاء التعليق يؤثر على التحكم بالسيارة وتآكل الإطارات",
      ],
      video: "سبب صوت الطرق عند المطبات",
    },
  },
  squealingBelt: {
    en: {
      title: "Squealing or Screeching Belt Noise",
      symptoms: [
        "High-pitched squeal on startup or acceleration",
        "Noise gets louder when AC is on",
        "Chirping sound while driving",
      ],
      causes: [
        "Worn or loose serpentine/drive belt",
        "Worn belt tensioner or pulley",
        "Belt glazed or misaligned",
      ],
      steps: [
        "Check the belt visually for cracks, fraying, or glazing",
        "Have the tensioner and pulleys checked, not just the belt",
        "Replace the belt if it's cracked or over 60,000 km old",
        "Don't ignore it — a snapped belt can cause overheating or loss of power steering",
      ],
      video: "squealing belt noise car causes",
    },
    ar: {
      title: "صوت صرير أو صفير من السير (الحزام)",
      symptoms: [
        "صوت صفير حاد عند بدء التشغيل أو التسارع",
        "الصوت يزيد عند تشغيل المكيف",
        "صوت تغريد أثناء القيادة",
      ],
      causes: [
        "سير المحرك (الترميل) متآكل أو رخو",
        "تعطل شداد السير أو البكرات",
        "السير غير محاذي بشكل صحيح",
      ],
      steps: [
        "افحص السير بصريًا بحثًا عن تشققات أو تلف",
        "اطلب فحص الشداد والبكرات وليس السير فقط",
        "استبدل السير إذا كان متشققًا أو عمره أكثر من ٦٠ ألف كم",
        "لا تتجاهل الصوت، فانقطاع السير قد يسبب ارتفاع حرارة المحرك أو فقدان مقود الباور",
      ],
      video: "سبب صوت صرير السير في السيارة",
    },
  },
  flatTire: {
    en: {
      title: "Flat Tire or Tire Blowout",
      symptoms: [
        "Car pulling to one side suddenly",
        "Thumping sound or vibration",
        "Visible loss of tire pressure or a burst tire",
      ],
      causes: [
        "Sharp object puncture (nail, glass, debris)",
        "Under-inflated tire overheating and bursting",
        "Old or worn-out tire tread",
      ],
      steps: [
        "Hold the wheel firmly, ease off the gas, and pull over slowly — don't brake hard",
        "Turn on hazard lights and move to a safe area away from traffic",
        "Replace with the spare tire if you have one and know how, otherwise call roadside assistance",
        "Get the tire inspected — a repaired puncture is fine, but sidewall damage means replacement",
      ],
      video: "how to safely handle a flat tire blowout",
    },
    ar: {
      title: "إطار مفرغ أو انفجار إطار",
      symptoms: [
        "انجراف مفاجئ للسيارة ناحية واحدة",
        "صوت خبط أو اهتزاز واضح",
        "فقدان واضح في ضغط الإطار أو انفجاره",
      ],
      causes: [
        "ثقب من جسم حاد (مسمار، زجاج، حصى)",
        "نقص هواء الإطار مما يسبب ارتفاع حرارته وانفجاره",
        "قدم أو تآكل نقشة الإطار",
      ],
      steps: [
        "امسك المقود بثبات، ارفع قدمك عن البنزين تدريجيًا، وقف السيارة ببطء دون فرملة مفاجئة",
        "شغّل إشارات الخطر وابتعد عن حركة المرور",
        "بدّل بالإطار الاحتياطي إذا كان متوفرًا وتعرف الطريقة، أو اتصل بخدمة المساعدة على الطريق",
        "افحص الإطار بعدها؛ الثقب البسيط يمكن إصلاحه لكن تلف الجدار الجانبي يستوجب تغيير الإطار",
      ],
      video: "كيفية التعامل مع انفجار الإطار بأمان",
    },
  },
  fuelSmell: {
    en: {
      title: "Smell of Gasoline Inside or Around the Car",
      symptoms: [
        "Strong fuel odor while driving or parked",
        "Smell stronger after refueling",
        "Visible fuel stain or wet spot under the car",
      ],
      causes: [
        "Loose or damaged fuel cap",
        "Fuel line or injector leak",
        "Cracked fuel tank or evaporative system leak",
      ],
      steps: [
        "Check the fuel cap is properly closed first — the most common cause",
        "Do not start the engine if you see fuel dripping or pooling — fire risk",
        "Have the fuel system inspected by a mechanic as soon as possible",
        "Keep the car ventilated and avoid smoking near it in the meantime",
      ],
      video: "smell of gasoline in car causes",
    },
    ar: {
      title: "رائحة بنزين داخل السيارة أو حولها",
      symptoms: [
        "رائحة بنزين قوية أثناء القيادة أو وقوف السيارة",
        "الرائحة تزيد بعد التعبئة",
        "بقعة وقود أو رطوبة ظاهرة تحت السيارة",
      ],
      causes: [
        "غطاء خزان الوقود غير محكم أو تالف",
        "تسرب في خط الوقود أو البخاخات",
        "شرخ في خزان الوقود أو تسرب في نظام تبخر الوقود",
      ],
      steps: [
        "تأكد أولًا من إحكام غطاء الخزان، فهو السبب الأكثر شيوعًا",
        "لا تشغّل المحرك إذا رأيت تسرب وقود أو بركة تحت السيارة لخطورة الحريق",
        "اطلب فحص نظام الوقود من ميكانيكي في أقرب وقت",
        "احرص على تهوية السيارة وتجنب التدخين بالقرب منها لحين الفحص",
      ],
      video: "سبب رائحة البنزين في السيارة",
    },
  },
  powerWindow: {
    en: {
      title: "Power Window Not Working",
      symptoms: [
        "Window won't go up or down",
        "Window moves slowly or gets stuck partway",
        "Clicking or grinding sound from the door",
      ],
      causes: [
        "Blown fuse for the window motor",
        "Faulty window switch",
        "Worn window regulator or motor",
      ],
      steps: [
        "Check if other windows work — if only one fails, it's likely that door's switch or motor",
        "Check the fuse box for a blown window fuse and replace if needed",
        "Avoid forcing the window up or down manually, it can damage the regulator further",
        "Have the door panel opened and the regulator/motor inspected by a mechanic",
      ],
      video: "power window not working fix",
    },
    ar: {
      title: "الشباك الكهربائي لا يعمل",
      symptoms: [
        "الشباك لا يتحرك للأعلى أو الأسفل",
        "الشباك يتحرك ببطء أو يتوقف في المنتصف",
        "صوت طقطقة أو احتكاك من الباب",
      ],
      causes: [
        "فيوز موتور الشباك محروق",
        "عطل في مفتاح تشغيل الشباك",
        "تآكل موتور أو مكينة (ريجيولاتور) الشباك",
      ],
      steps: [
        "تأكد هل باقي الشبابيك تعمل، فإذا كان شباك واحد فقط فالمشكلة غالبًا في مفتاحه أو موتوره",
        "افحص علبة الفيوزات وابحث عن فيوز الشباك المحروق واستبدله إذا لزم",
        "تجنب تحريك الشباك يدويًا بالقوة لأن ذلك قد يزيد تلف المكينة",
        "اطلب فتح باب السيارة وفحص المكينة/الموتور من ميكانيكي",
      ],
      video: "الشباك الكهربائي لا يعمل السبب والحل",
    },
  },
  keyFobIssue: {
    en: {
      title: "Remote Key / Key Fob Not Working",
      symptoms: [
        "Car doesn't unlock or lock with the remote",
        "Push-to-start doesn't recognize the key",
        "Key works only when very close to the car",
      ],
      causes: [
        "Dead or weak key fob battery",
        "Key fob out of sync with the car",
        "Faulty receiver module in the car",
      ],
      steps: [
        "Replace the key fob's small battery first — the most common and cheapest fix",
        "Try the manual key blade to unlock the door if available",
        "Check the owner's manual for the key re-sync procedure",
        "If it still fails, have a dealer or locksmith reprogram or diagnose the key",
      ],
      video: "car remote key fob not working fix",
    },
    ar: {
      title: "الريموت (المفتاح) لا يعمل",
      symptoms: [
        "السيارة لا تفتح أو تقفل بالريموت",
        "نظام التشغيل بالضغط لا يتعرف على المفتاح",
        "المفتاح يعمل فقط عند الاقتراب الشديد من السيارة",
      ],
      causes: [
        "بطارية الريموت ضعيفة أو فارغة",
        "الريموت غير متزامن مع السيارة",
        "عطل في وحدة الاستقبال بالسيارة",
      ],
      steps: [
        "غيّر بطارية الريموت الصغيرة أولًا، فهذا الحل الأشيع والأرخص",
        "استخدم المفتاح اليدوي (السلاح) لفتح الباب إن وجد",
        "راجع كتيب السيارة لمعرفة طريقة إعادة مزامنة المفتاح",
        "إذا استمرت المشكلة، توجه للوكيل أو فني مفاتيح لإعادة برمجة أو فحص المفتاح",
      ],
      video: "الريموت لا يعمل السبب والحل",
    },
  },
  wiperIssue: {
    en: {
      title: "Wipers Not Working Properly",
      symptoms: [
        "Wipers don't move at all",
        "Wipers streak or leave dry spots",
        "Wipers move but no washer fluid sprays",
      ],
      causes: [
        "Worn-out wiper blades",
        "Blown wiper fuse or faulty wiper motor",
        "Empty washer fluid reservoir or clogged nozzle",
      ],
      steps: [
        "Check and top up the washer fluid reservoir first",
        "Replace worn wiper blades — they should be changed every 6–12 months",
        "Check the fuse box if the wipers don't move at all",
        "If the motor is silent even with a good fuse, have it inspected by a mechanic",
      ],
      video: "car wipers not working fix",
    },
    ar: {
      title: "المساحات لا تعمل بشكل صحيح",
      symptoms: [
        "المساحات لا تتحرك إطلاقًا",
        "المساحات تترك خطوط أو مناطق جافة على الزجاج",
        "المساحات تتحرك لكن بدون رشّ سائل الغسيل",
      ],
      causes: [
        "ريش المساحات تالفة",
        "فيوز المساحات محروق أو موتور المساحات معطل",
        "خزان سائل الغسيل فارغ أو الفتحة مسدودة",
      ],
      steps: [
        "تحقق من خزان سائل الغسيل وأضف السائل إذا كان فارغًا",
        "استبدل ريش المساحات التالفة، ويُفضّل تغييرها كل ٦ إلى ١٢ شهرًا",
        "افحص علبة الفيوزات إذا لم تتحرك المساحات إطلاقًا",
        "إذا كان الموتور صامتًا رغم سلامة الفيوز، اطلب فحصه من ميكانيكي",
      ],
      video: "المساحات لا تعمل السبب والحل",
    },
  },
  clutchSlip: {
    en: {
      title: "Clutch Slipping (Manual Transmission)",
      symptoms: [
        "Engine revs rise without matching speed increase",
        "Burning smell while driving",
        "Loss of power especially going uphill or accelerating",
      ],
      causes: [
        "Worn clutch plate/disc",
        "Clutch cable or hydraulic system misadjusted",
        "Oil or fluid contamination on the clutch",
      ],
      steps: [
        "Avoid riding the clutch pedal or resting your foot on it while driving",
        "Have the clutch free play/hydraulic system checked and adjusted",
        "If slipping is severe, avoid heavy loads or steep inclines until it's fixed",
        "Get the clutch disc/pressure plate inspected — it may need replacement",
      ],
      video: "clutch slipping symptoms causes manual car",
    },
    ar: {
      title: "انزلاق الدبرياج (كلتش) - جير عادي",
      symptoms: [
        "ارتفاع دورة المحرك دون زيادة مماثلة في السرعة",
        "رائحة احتراق أثناء القيادة",
        "ضعف واضح في القدرة خاصة عند الصعود أو التسارع",
      ],
      causes: [
        "تآكل قرص الدبرياج",
        "عدم ضبط سلك أو نظام الدبرياج الهيدروليكي",
        "تلوث الدبرياج بالزيت أو السائل",
      ],
      steps: [
        "تجنب إبقاء قدمك على دواسة الدبرياج أثناء القيادة",
        "اطلب فحص وضبط الفراغ الحر لدواسة الدبرياج أو النظام الهيدروليكي",
        "إذا كان الانزلاق شديدًا، تجنب الأحمال الثقيلة أو الطرق شديدة الانحدار لحين الإصلاح",
        "افحص قرص وطبلون الدبرياج، فقد يحتاجا للاستبدال",
      ],
      video: "سبب انزلاق الدبرياج في السيارة",
    },
  },
  exhaustSmoke: {
    en: {
      title: "Smoke Coming From the Exhaust",
      symptoms: [
        "Blue smoke — usually oil burning",
        "White smoke — usually coolant burning or condensation",
        "Black smoke — usually excess fuel or poor combustion",
      ],
      causes: [
        "Worn piston rings or valve seals (blue smoke)",
        "Head gasket leak letting coolant into the engine (white smoke)",
        "Faulty fuel injector or clogged air filter (black smoke)",
      ],
      steps: [
        "Note the smoke color, it strongly narrows down the cause",
        "White smoke on cold mornings that clears quickly is often just condensation and normal",
        "Persistent white or blue smoke means stop driving soon and get it checked",
        "Have a mechanic run a compression test or check the head gasket if smoke continues",
      ],
      video: "exhaust smoke color meaning car",
    },
    ar: {
      title: "دخان من العادم",
      symptoms: [
        "دخان أزرق: غالبًا حرق زيت",
        "دخان أبيض: غالبًا حرق سائل تبريد أو تكاثف",
        "دخان أسود: غالبًا زيادة وقود أو احتراق غير كامل",
      ],
      causes: [
        "تآكل حلقات المكبس أو سدادات الصمامات (دخان أزرق)",
        "تسرب في جوان الكولاسة يدخل سائل التبريد للمحرك (دخان أبيض)",
        "عطل في البخاخات أو انسداد فلتر الهواء (دخان أسود)",
      ],
      steps: [
        "لاحظ لون الدخان جيدًا، فهو يحدد السبب المحتمل بدقة",
        "الدخان الأبيض الخفيف في الصباح البارد الذي يختفي سريعًا غالبًا مجرد تكاثف طبيعي",
        "الدخان الأبيض أو الأزرق المستمر يعني التوقف عن القيادة قريبًا وطلب الفحص",
        "اطلب من الميكانيكي عمل اختبار ضغط أو فحص جوان الكولاسة إذا استمر الدخان",
      ],
      video: "سبب خروج دخان من العادم حسب اللون",
    },
  },
  roughIdle: {
    en: {
      title: "Rough Idle or Engine Shaking",
      symptoms: [
        "The engine shakes or vibrates noticeably while stopped/idling",
        "RPM needle bounces up and down instead of staying steady",
        "Engine feels like it might stall at a red light",
      ],
      causes: [
        "Worn or fouled spark plugs / ignition coils causing a misfire",
        "Dirty or faulty fuel injectors",
        "Vacuum leak in a hose or intake gasket",
        "Dirty throttle body or idle air control valve",
      ],
      steps: [
        "Check if the check-engine light is also on, which points to a stored fault code",
        "Note if it happens only when cold, only when hot, or all the time",
        "Avoid heavy acceleration until it's checked, misfires can damage the catalytic converter over time",
        "Get spark plugs, coils, and vacuum lines inspected at a garage",
      ],
      video: "rough idle car causes and fix",
    },
    ar: {
      title: "اهتزاز المحرك أو خبط عند الوقوف",
      symptoms: [
        "المحرك بيهتز أو يرجّ بشكل واضح وهو واقف/في الدورة الخاملة",
        "عداد اللفات بيصعد وينزل بدل ما يفضل ثابت",
        "حاسس إن العربية ممكن تطفي عند الإشارة",
      ],
      causes: [
        "بواجي أو كويلات إشعال متآكلة بتسبب ميس فاير",
        "بخاخات وقود متسخة أو فيها عطل",
        "تسريب هواء (فاكيوم) في خرطوم أو جوان السحب",
        "جسم خانق أو حساس دورة خاملة متسخ",
      ],
      steps: [
        "شوف لو لمبة المحرك مضاءة كمان، ده بيدل على كود عطل مسجل",
        "لاحظ هل بيحصل وهي باردة، وهي سخنة، أو طول الوقت",
        "تجنب الدعس القوي لحد ما تتفحص، الميس فاير ممكن يضر الكاتاليزر مع الوقت",
        "اطلب فحص البواجي والكويلات وخراطيم الفاكيوم في الجراج",
      ],
      video: "سبب اهتزاز المحرك عند الوقوف",
    },
  },
  batteryDrain: {
    en: {
      title: "Battery Keeps Dying Quickly",
      symptoms: [
        "Battery is dead again just a day or two after being charged/jump-started",
        "Car struggles to start after sitting overnight",
        "No obvious lights left on, yet battery still drains",
      ],
      causes: [
        "A parasitic draw, something staying powered on after the car is off (interior light, aftermarket device, faulty relay)",
        "An old or weak battery that no longer holds charge",
        "A failing alternator not fully recharging the battery while driving",
        "Corroded or loose battery terminals",
      ],
      steps: [
        "Check terminals for corrosion or looseness and clean/tighten if needed",
        "Make sure no interior lights, phone chargers, or accessories are left on",
        "If it keeps happening, ask a garage to test the battery and alternator, and check for a parasitic draw",
        "Note the battery's age, most batteries need replacing after 3-5 years",
      ],
      video: "car battery dies overnight parasitic drain test",
    },
    ar: {
      title: "البطارية بتفضل تفضى بسرعة",
      symptoms: [
        "البطارية بتفضى تاني بعد يوم أو يومين بس من شحنها أو تنشيطها",
        "العربية بتواجه صعوبة في الدوران بعد ما تقف طول الليل",
        "مفيش حاجة واضحة سايبها شغالة، وبرضه البطارية بتفضى",
      ],
      causes: [
        "استهلاك خفي، حاجة فاضلة واخدة كهرباء بعد ما تقفل العربية (نور داخلي، جهاز مركب، ريلاي عاطل)",
        "بطارية قديمة أو ضعيفة مابقتش بتحتفظ بالشحن",
        "دينامو مش بيشحن البطارية بالكامل وقت القيادة",
        "أطراف البطارية متآكلة أو غير مثبتة كويس",
      ],
      steps: [
        "افحص أطراف البطارية من التآكل أو الرخاوة ونضفها أو زودها لو محتاجة",
        "اتأكد مفيش نور داخلي أو شاحن أو جهاز سايبه شغال",
        "لو العطل بيتكرر، اطلب من الجراج يفحص البطارية والدينامو ويدور على استهلاك خفي",
        "لاحظ عمر البطارية، أغلب البطاريات محتاجة تتغير بعد 3-5 سنين",
      ],
      video: "سبب فضاء البطارية بسرعة بدون سبب واضح",
    },
  },
  brakeVibration: {
    en: {
      title: "Vibration or Pulsation When Braking",
      symptoms: [
        "Steering wheel or brake pedal shakes/pulses when pressing the brakes",
        "Vibration gets stronger the harder you brake",
        "Usually noticeable at higher speeds first",
      ],
      causes: [
        "Warped brake rotors (discs), often from overheating or uneven wear",
        "Uneven brake pad deposits on the rotor surface",
        "Worn wheel bearing or loose suspension component (less common)",
      ],
      steps: [
        "Avoid heavy or panic braking until it's checked, warped rotors reduce braking effectiveness",
        "Note whether it happens only at high speed or at all speeds",
        "Have a garage inspect the rotor thickness and surface for warping",
        "Rotors may need resurfacing or replacement along with the pads",
      ],
      video: "brake pedal vibration warped rotors causes",
    },
    ar: {
      title: "اهتزاز في العجلة أو الدواسة عند الفرملة",
      symptoms: [
        "عجلة القيادة أو دواسة الفرامل بتهتز عند الدعس على الفرامل",
        "الاهتزاز بيزيد كل ما تفرمل بقوة أكتر",
        "غالبًا بيبان الأول في السرعات العالية",
      ],
      causes: [
        "طارة فرامل (دسك) معوجة، غالبًا من السخونة الزيادة أو التآكل الغير متساوي",
        "ترسبات غير متساوية من التيل على سطح الطارة",
        "بلي عجلة متآكل أو جزء في التعليق فك (أقل شيوعًا)",
      ],
      steps: [
        "تجنب الفرملة القوية المفاجئة لحد الفحص، الطارة المعوجة بتقلل كفاءة الفرملة",
        "لاحظ هل بيحصل بس في السرعة العالية ولا في كل السرعات",
        "اطلب من الجراج يفحص سمك وسطح الطارة عشان يتأكد من الاعوجاج",
        "الطارة ممكن تحتاج تسوية أو تغيير مع التيل",
      ],
      video: "سبب اهتزاز الفرامل عند الدعس",
    },
  },
  acNoAir: {
    en: {
      title: "AC Blowing Weak or No Air",
      symptoms: [
        "Very little or no air comes out of the vents even on high fan speed",
        "Air is cold when it does come out, just not much airflow",
        "Sometimes gets better/worse when tapping the dashboard",
      ],
      causes: [
        "Clogged cabin air filter blocking airflow",
        "Blower motor weakening or failing",
        "Blend door or blower motor resistor issue",
        "Blocked vents or evaporator housing",
      ],
      steps: [
        "Check and replace the cabin air filter first, it's the most common and cheapest cause",
        "Test all fan speed settings to see if only certain speeds fail (points to the resistor)",
        "If replacing the filter doesn't help, have a garage check the blower motor and resistor",
      ],
      video: "car AC blowing weak air fix",
    },
    ar: {
      title: "التكييف بيطلع هوا ضعيف أو مفيش هوا خالص",
      symptoms: [
        "هوا قليل جدًا أو مفيش هوا طالع من الفتحات حتى على أعلى سرعة مروحة",
        "الهوا بارد لما يطلع، بس الكمية قليلة",
        "أحيانًا بيتحسن أو يسوء لما تخبط على التابلوه",
      ],
      causes: [
        "فلتر هوا الكابينة متسد وبيمنع مرور الهواء",
        "موتور المروحة (البلوّر) ضعيف أو بيعطل",
        "عطل في مقاومة موتور المروحة أو باب الخلط",
        "انسداد في الفتحات أو مبيت المبخر",
      ],
      steps: [
        "افحص وغيّر فلتر هوا الكابينة الأول، ده أشيع سبب وأرخص حل",
        "جرب كل سرعات المروحة عشان تشوف لو سرعات معينة بس مش شغالة (بيدل على المقاومة)",
        "لو تغيير الفلتر مافادش، اطلب من الجراج يفحص موتور المروحة والمقاومة",
      ],
      video: "سبب ضعف هواء التكييف في السيارة",
    },
  },
  tireVibration: {
    en: {
      title: "Steering Wheel Vibration at Speed",
      symptoms: [
        "Steering wheel shakes or wobbles, usually starting around 60-100 km/h",
        "Vibration may lessen or increase at different speeds",
        "Sometimes felt through the seat/floor as well",
      ],
      causes: [
        "Wheel out of balance (most common cause)",
        "Misaligned wheels",
        "Bent rim or tire with an internal defect",
        "Worn suspension or steering components",
      ],
      steps: [
        "Note the exact speed range where it happens, this helps the technician diagnose it faster",
        "Check tires for uneven wear, bulges, or visible damage",
        "Get a wheel balance and alignment done, this fixes most cases",
        "If it persists after balancing/alignment, ask the garage to check for bent rims or worn suspension parts",
      ],
      video: "steering wheel vibration at highway speed causes",
    },
    ar: {
      title: "اهتزاز عجلة القيادة في السرعات العالية",
      symptoms: [
        "عجلة القيادة بتهتز أو ترعش، غالبًا بيبدأ حوالين 60-100 كم/س",
        "الاهتزاز ممكن يقل أو يزيد في سرعات مختلفة",
        "أحيانًا بيتحس كمان في الكرسي أو الأرضية",
      ],
      causes: [
        "عدم توازن في الكاوتش (أشيع سبب)",
        "عدم ضبط زوايا العجلات (الفرمة)",
        "جنط معوج أو كاوتش فيه عيب داخلي",
        "أجزاء تعليق أو توجيه متآكلة",
      ],
      steps: [
        "لاحظ السرعة بالظبط اللي بيحصل فيها الاهتزاز، ده بيساعد الفني يشخص بسرعة",
        "افحص الكاوتش من التآكل الغير متساوي أو الانتفاخ أو أي تلف واضح",
        "اعمل توازن وضبط زوايا للعجلات، ده بيحل أغلب الحالات",
        "لو الاهتزاز استمر بعد التوازن والضبط، اطلب من الجراج يفحص الجنوط وأجزاء التعليق",
      ],
      video: "سبب اهتزاز عجلة القيادة في السرعة العالية",
    },
  },
  shocksWorn: {
    en: {
      title: "Bouncy or Rough Ride (Worn Shocks/Struts)",
      symptoms: [
        "Car bounces multiple times after going over a bump instead of settling quickly",
        "Feels less stable/floaty during turns or braking",
        "Uneven tire wear over time",
      ],
      causes: [
        "Worn or leaking shock absorbers or struts",
        "Worn suspension bushings",
        "Broken or weakened springs",
      ],
      steps: [
        "Do a simple bounce test, push down firmly on a corner of the car and release; if it bounces more than once or twice, shocks may be worn",
        "Check for visible oil leaking from the shocks/struts",
        "Have a garage inspect the suspension, worn shocks affect braking distance and handling, not just comfort",
      ],
      video: "worn shocks struts bounce test symptoms",
    },
    ar: {
      title: "العربية بترتج كتير أو مشية مش مريحة (مساعدين تعبانين)",
      symptoms: [
        "العربية بترتج أكتر من مرة بعد ما تعدي مطب بدل ما تستقر بسرعة",
        "حاسس إنها مش ثابتة أو طايرة شوية في اللفة أو الفرملة",
        "تآكل غير متساوي في الكاوتش مع الوقت",
      ],
      causes: [
        "مساعدين (شكمانات) تعبانين أو بيسرّبوا زيت",
        "جلد التعليق (البوش) متآكل",
        "سلندر أو نابض ضعيف أو مكسور",
      ],
      steps: [
        "اعمل اختبار بسيط، ادعس بقوة على ركن العربية وسيبها؛ لو ارتدت أكتر من مرة أو اتنين يبقى المساعدين محتاجين تغيير",
        "افحص لو فيه تسريب زيت واضح من المساعدين",
        "اطلب من الجراج يفحص التعليق، المساعدين التعبانين بيأثروا على مسافة الفرملة والتحكم مش بس الراحة",
      ],
      video: "علامات تلف المساعدين وطريقة الفحص",
    },
  },
};

const OBD_CODES = {
  P0100: {
    relatedIssue: "checkEngine",
    en: { title: "Mass Air Flow (MAF) Circuit", meaning: "The airflow sensor signal is missing or out of range, usually from a dirty/faulty MAF sensor or a vacuum leak." },
    ar: { title: "دائرة حساس هواء المحرك (MAF)", meaning: "إشارة حساس الهواء مفقودة أو خارج النطاق، غالبًا بسبب اتساخ الحساس أو تسريب هواء في السلندر." },
  },
  P0110: {
    relatedIssue: "checkEngine",
    en: { title: "Intake Air Temperature Sensor", meaning: "The intake air temperature sensor circuit is reading incorrectly." },
    ar: { title: "حساس حرارة هواء السحب", meaning: "دائرة حساس حرارة الهواء الداخل للمحرك بتقرأ قراءة غير صحيحة." },
  },
  P0115: {
    relatedIssue: "overheating",
    en: { title: "Engine Coolant Temperature Circuit", meaning: "The coolant temperature sensor signal is faulty, which can throw off engine timing and the temp gauge." },
    ar: { title: "دائرة حساس حرارة المحرك", meaning: "إشارة حساس حرارة سائل التبريد فيها عطل، وده ممكن يأثر على توقيت المحرك وقراءة عداد الحرارة." },
  },
  P0120: {
    relatedIssue: "checkEngine",
    en: { title: "Throttle Position Sensor Circuit", meaning: "The throttle position sensor signal is out of range, can cause rough idle or hesitation." },
    ar: { title: "دائرة حساس وضع دواسة البنزين", meaning: "إشارة حساس دبدوب البنزين خارج النطاق الطبيعي، وممكن يسبب تذبذب في السرعة أو تردد عند التسارع." },
  },
  P0128: {
    relatedIssue: "overheating",
    en: { title: "Coolant Thermostat Below Regulating Temp", meaning: "The engine is taking too long to warm up — usually a stuck-open thermostat." },
    ar: { title: "الثرموستات تحت درجة التنظيم", meaning: "المحرك بياخد وقت طويل عشان يسخن، غالبًا بسبب الثرموستات عالقة مفتوحة." },
  },
  P0130: {
    relatedIssue: "checkEngine",
    en: { title: "O2 Sensor Circuit (Bank 1 Sensor 1)", meaning: "The upstream oxygen sensor signal is faulty, affecting fuel mixture and mileage." },
    ar: { title: "دائرة حساس الأكسجين (البنك ١ حساس ١)", meaning: "إشارة حساس الأكسجين الأول فيها عطل، وده بيأثر على خلطة الوقود واستهلاك البنزين." },
  },
  P0135: {
    relatedIssue: "checkEngine",
    en: { title: "O2 Sensor Heater Circuit", meaning: "The oxygen sensor's internal heater circuit has failed." },
    ar: { title: "دائرة سخان حساس الأكسجين", meaning: "دائرة السخان الداخلية لحساس الأكسجين بها عطل." },
  },
  P0171: {
    relatedIssue: "checkEngine",
    en: { title: "System Too Lean (Bank 1)", meaning: "Too much air / not enough fuel in the mixture — often a vacuum leak, dirty MAF, or weak fuel pump." },
    ar: { title: "الخليط فقير جدًا (البنك ١)", meaning: "هواء زيادة عن الوقود في خلطة الاحتراق، غالبًا بسبب تسريب هواء أو اتساخ حساس MAF أو ضعف طرمبة البنزين." },
  },
  P0172: {
    relatedIssue: "checkEngine",
    en: { title: "System Too Rich (Bank 1)", meaning: "Too much fuel / not enough air in the mixture — often a faulty sensor or a leaking injector." },
    ar: { title: "الخليط غني جدًا (البنك ١)", meaning: "وقود زيادة عن الهواء في خلطة الاحتراق، غالبًا بسبب حساس معطل أو بخاخ بيسرب." },
  },
  P0174: {
    relatedIssue: "checkEngine",
    en: { title: "System Too Lean (Bank 2)", meaning: "Same as P0171 but on the engine's second bank of cylinders." },
    ar: { title: "الخليط فقير جدًا (البنك ٢)", meaning: "نفس عطل P0171 لكن على المجموعة التانية من السلندرات." },
  },
  P0175: {
    relatedIssue: "checkEngine",
    en: { title: "System Too Rich (Bank 2)", meaning: "Same as P0172 but on the engine's second bank of cylinders." },
    ar: { title: "الخليط غني جدًا (البنك ٢)", meaning: "نفس عطل P0172 لكن على المجموعة التانية من السلندرات." },
  },
  P0217: {
    relatedIssue: "overheating",
    en: { title: "Engine Overtemperature Condition", meaning: "The engine has actually overheated — stop driving and let it cool down." },
    ar: { title: "ارتفاع حرارة المحرك", meaning: "المحرك فعليًا سخن أكتر من الطبيعي، وقف عن القيادة وسيب المحرك يبرد." },
  },
  P0230: {
    relatedIssue: "noStart",
    en: { title: "Fuel Pump Primary Circuit", meaning: "A wiring or relay problem in the fuel pump's power circuit — can cause no-start or stalling." },
    ar: { title: "دائرة تغذية طرمبة البنزين", meaning: "عطل في الأسلاك أو الريلاي المغذي لطرمبة البنزين، ممكن يسبب عدم بدء التشغيل أو وقفة مفاجئة." },
  },
  P0300: {
    relatedIssue: "checkEngine",
    en: { title: "Random/Multiple Cylinder Misfire", meaning: "More than one cylinder is misfiring — common causes are worn spark plugs/coils, or a lean/rich mixture." },
    ar: { title: "قطع تماس عشوائي في أكتر من سلندر", meaning: "أكتر من سلندر بيحصله قطع تماس، غالبًا بسبب بواجي أو كويلات قديمة أو خلطة وقود غير متزنة." },
  },
  P0301: {
    relatedIssue: "checkEngine",
    en: { title: "Cylinder 1 Misfire", meaning: "Cylinder 1 specifically is misfiring — check its spark plug, coil, and injector first." },
    ar: { title: "قطع تماس في السلندر ١", meaning: "السلندر رقم ١ تحديدًا بيحصله قطع تماس، ابدأ بفحص البوجيه والكويل والبخاخ بتاعه." },
  },
  P0302: {
    relatedIssue: "checkEngine",
    en: { title: "Cylinder 2 Misfire", meaning: "Cylinder 2 specifically is misfiring — check its spark plug, coil, and injector first." },
    ar: { title: "قطع تماس في السلندر ٢", meaning: "السلندر رقم ٢ تحديدًا بيحصله قطع تماس، ابدأ بفحص البوجيه والكويل والبخاخ بتاعه." },
  },
  P0303: {
    relatedIssue: "checkEngine",
    en: { title: "Cylinder 3 Misfire", meaning: "Cylinder 3 specifically is misfiring — check its spark plug, coil, and injector first." },
    ar: { title: "قطع تماس في السلندر ٣", meaning: "السلندر رقم ٣ تحديدًا بيحصله قطع تماس، ابدأ بفحص البوجيه والكويل والبخاخ بتاعه." },
  },
  P0304: {
    relatedIssue: "checkEngine",
    en: { title: "Cylinder 4 Misfire", meaning: "Cylinder 4 specifically is misfiring — check its spark plug, coil, and injector first." },
    ar: { title: "قطع تماس في السلندر ٤", meaning: "السلندر رقم ٤ تحديدًا بيحصله قطع تماس، ابدأ بفحص البوجيه والكويل والبخاخ بتاعه." },
  },
  P0325: {
    relatedIssue: "checkEngine",
    en: { title: "Knock Sensor Circuit", meaning: "The sensor that detects engine knock/detonation isn't reporting correctly." },
    ar: { title: "دائرة حساس الطرق (الكسة)", meaning: "الحساس اللي بيكتشف صوت الطرق في المحرك مش بيبعت قراءة صحيحة." },
  },
  P0335: {
    relatedIssue: "noStart",
    en: { title: "Crankshaft Position Sensor Circuit", meaning: "A key sensor for engine timing has failed — can cause stalling or a no-start." },
    ar: { title: "دائرة حساس وضع عمود المرفق", meaning: "حساس مهم لتوقيت المحرك بيه عطل، ممكن يسبب وقفة مفاجئة أو {t.adminReject} تشغيل." },
  },
  P0340: {
    relatedIssue: "checkEngine",
    en: { title: "Camshaft Position Sensor Circuit", meaning: "The camshaft timing sensor signal is faulty." },
    ar: { title: "دائرة حساس وضع عمود الكامة", meaning: "إشارة حساس توقيت عمود الكامة فيها عطل." },
  },
  P0401: {
    relatedIssue: "exhaustSmoke",
    en: { title: "EGR Flow Insufficient", meaning: "The exhaust gas recirculation valve isn't flowing enough — often carbon buildup clogging it." },
    ar: { title: "ضعف تدفق صمام EGR", meaning: "صمام إعادة تدوير غازات العادم مش بيدفق كفاية، غالبًا بسبب تراكم كربون سادّ عليه." },
  },
  P0420: {
    relatedIssue: "exhaustSmoke",
    en: { title: "Catalyst System Efficiency Below Threshold (Bank 1)", meaning: "The catalytic converter isn't cleaning exhaust efficiently anymore — sometimes just a sensor issue, sometimes the converter itself." },
    ar: { title: "كفاءة الكاتاليزر أقل من الحد المطلوب (البنك ١)", meaning: "المحول الحفاز مش بينظف عادم المحرك بكفاءة، أحيانًا يكون سبب بسيط في حساس، وأحيانًا يكون الكاتاليزر نفسه." },
  },
  P0430: {
    relatedIssue: "exhaustSmoke",
    en: { title: "Catalyst System Efficiency Below Threshold (Bank 2)", meaning: "Same as P0420 but on the engine's second bank." },
    ar: { title: "كفاءة الكاتاليزر أقل من الحد المطلوب (البنك ٢)", meaning: "نفس عطل P0420 لكن على المجموعة التانية من السلندرات." },
  },
  P0440: {
    relatedIssue: "fuelSmell",
    en: { title: "EVAP System Malfunction", meaning: "A general fault in the fuel vapor recovery system." },
    ar: { title: "عطل في نظام تبخر الوقود (EVAP)", meaning: "عطل عام في نظام استرجاع أبخرة الوقود." },
  },
  P0442: {
    relatedIssue: "fuelSmell",
    en: { title: "EVAP System Small Leak Detected", meaning: "A small leak in the fuel vapor system — check the fuel cap first." },
    ar: { title: "تسريب صغير في نظام EVAP", meaning: "تسريب بسيط في نظام أبخرة الوقود، افحص غطاء الخزان أولًا." },
  },
  P0455: {
    relatedIssue: "fuelSmell",
    en: { title: "EVAP System Large Leak Detected", meaning: "Almost always a loose, missing, or damaged fuel cap — check that first before anything else." },
    ar: { title: "تسريب كبير في نظام EVAP", meaning: "غالبًا جدًا سببه غطاء خزان البنزين مش مقفول كويس أو تالف أو مفقود، افحص ده الأول قبل أي حاجة." },
  },
  P0500: {
    relatedIssue: "checkEngine",
    en: { title: "Vehicle Speed Sensor Malfunction", meaning: "The sensor that reports road speed to the computer is faulty, can affect the speedometer and transmission shifting." },
    ar: { title: "عطل حساس سرعة السيارة", meaning: "الحساس اللي بيبلغ الكمبيوتر بسرعة السيارة فيه عطل، ممكن يأثر على العداد وتعشيق الجير." },
  },
  P0505: {
    relatedIssue: "checkEngine",
    en: { title: "Idle Control System Malfunction", meaning: "The system that controls idle speed isn't working correctly — rough or unstable idle." },
    ar: { title: "عطل نظام التحكم بالسرعة عند السكون", meaning: "النظام المسؤول عن ضبط سرعة المحرك وهو واقف مش شغال صح، بيسبب اهتزاز أو عدم ثبات في السكون." },
  },
  P0562: {
    relatedIssue: "deadBattery",
    en: { title: "System Voltage Low", meaning: "The car's electrical system voltage is lower than it should be — check the battery and alternator." },
    ar: { title: "انخفاض جهد النظام الكهربائي", meaning: "جهد النظام الكهربائي للسيارة أقل من الطبيعي، افحص البطارية والدينامو." },
  },
  P0601: {
    relatedIssue: "checkEngine",
    en: { title: "Internal Control Module Memory Error", meaning: "An internal fault in the engine computer's memory — usually needs a dealer/specialist diagnosis." },
    ar: { title: "خطأ في ذاكرة وحدة التحكم", meaning: "عطل داخلي في ذاكرة كمبيوتر المحرك، غالبًا محتاج فحص عند الوكيل أو متخصص." },
  },
  P0700: {
    relatedIssue: "noShift",
    en: { title: "Transmission Control System Malfunction", meaning: "The transmission computer has detected a fault — check the transmission for stored codes too." },
    ar: { title: "عطل في نظام التحكم بالجير", meaning: "كمبيوتر الجير اكتشف عطل، لازم تتفحص أكواد الجير كمان بالتفصيل." },
  },
  P0715: {
    relatedIssue: "transSlip",
    en: { title: "Input/Turbine Speed Sensor Circuit", meaning: "A transmission speed sensor is faulty — can cause harsh or delayed shifting." },
    ar: { title: "دائرة حساس سرعة دخول الجير", meaning: "حساس سرعة في الجير فيه عطل، ممكن يسبب تعشيق قاسي أو متأخر." },
  },
  P0730: {
    relatedIssue: "noShift",
    en: { title: "Incorrect Gear Ratio", meaning: "The transmission isn't shifting into the gear the computer commanded — often low or old transmission fluid." },
    ar: { title: "نسبة تروس غير صحيحة", meaning: "الجير مش بيدخل في الترس اللي الكمبيوتر طالبه، غالبًا بسبب نقص أو قدم زيت الجير." },
  },
  P0740: {
    relatedIssue: "transSlip",
    en: { title: "Torque Converter Clutch Circuit", meaning: "A fault in the torque converter lockup clutch circuit — can feel like slipping or shuddering at cruising speed." },
    ar: { title: "دائرة كلتش محول عزم الدوران", meaning: "عطل في دائرة كلتش قفل محول العزم، ممكن حاسس بيه كإنزلاق أو اهتزاز أثناء السرعة الثابتة." },
  },
};


/* ---------------------------------------------------------------
   SEO-friendly URL routing helpers
--------------------------------------------------------------- */
function seoSlug(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ISSUE_SLUGS = Object.fromEntries(
  Object.entries(ISSUES).map(([id, item]) => [id, seoSlug(item.en.title)])
);

function issueIdFromSlug(slug) {
  return Object.keys(ISSUE_SLUGS).find((id) => ISSUE_SLUGS[id] === slug) || null;
}

function categoryFromId(id) {
  return CATEGORIES.find((cat) => cat.id === id) || null;
}

function categoryForIssue(issueId) {
  return CATEGORIES.find((cat) => cat.issues.includes(issueId)) || null;
}

function routeFromPath(pathname) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/") return { view: "home" };
  if (path === "/fix") return { view: "fix" };
  if (path === "/guide") return { view: "guide" };
  if (path === "/garages") return { view: "garages" };
  if (path === "/maintenance") return { view: "maintenance" };
  if (path === "/parts") return { view: "parts" };
  if (path === "/diagnosis") return { view: "diagnosis" };
  if (path === "/cars") return { view: "cars", carMode: "add" };
  if (path === "/cars/add") return { view: "cars", carMode: "add" };
  if (path === "/cars/submitted") return { view: "cars", carMode: "submitted" };
  if (path === "/buy-car") return { view: "buy-car" };
  if (path === "/valuation") return { view: "valuation" };
  if (path === "/admin") return { view: "admin" };

  const fixMatch = path.match(/^\/fix\/([^/]+)$/);
  if (fixMatch) {
    const category = categoryFromId(fixMatch[1]);
    if (category) return { view: "category", activeCategory: category };
  }

  const faultMatch = path.match(/^\/fault\/([^/]+)$/);
  if (faultMatch) {
    const issueId = issueIdFromSlug(faultMatch[1]);
    if (issueId) {
      return {
        view: "issue",
        activeIssueId: issueId,
        activeCategory: categoryForIssue(issueId),
      };
    }
  }

  const obdMatch = path.match(/^\/obd\/([^/]+)$/i);
  if (obdMatch) {
    const code = obdMatch[1].toUpperCase();
    if (OBD_CODES[code]) return { view: "obd", activeObdCode: code };
  }

  return { view: "home", fallback: true };
}

function routePathForIssue(issueId) {
  return `/fault/${ISSUE_SLUGS[issueId] || seoSlug(issueId)}`;
}

function routePathForCategory(category) {
  return `/fix/${category.id}`;
}

function applySeoMeta({ lang, view, activeIssueId, activeCategory, activeObdCode }) {
  if (typeof document === "undefined") return;
  const isArabic = lang === "ar";
  let title = "Karaji — Car Issues & Trusted Garages";
  let description = isArabic
    ? "كراجي يساعدك في تشخيص أعطال السيارات، معرفة أكواد OBD والعثور على الجراج المناسب."
    : "Karaji helps you diagnose car problems, understand OBD fault codes and find trusted garages.";

  if (view === "issue" && activeIssueId && ISSUES[activeIssueId]) {
    const item = ISSUES[activeIssueId][lang];
    title = `${item.title} | Karaji`;
    description = isArabic
      ? `${item.title}: الأعراض والأسباب وخطوات الفحص والإصلاح على كراجي.`
      : `${item.title}: symptoms, common causes and practical diagnostic steps on Karaji.`;
  } else if (view === "obd" && activeObdCode && OBD_CODES[activeObdCode]) {
    const item = OBD_CODES[activeObdCode][lang];
    title = `${activeObdCode} — ${item.title} | Karaji`;
    description = `${item.title}. ${item.meaning}`;
  } else if (view === "category" && activeCategory) {
    title = `${activeCategory[lang]} — Car Problems & Fixes | Karaji`;
    description = isArabic
      ? `دليل أعطال ${activeCategory.ar}: الأعراض والأسباب وطرق الفحص والإصلاح.`
      : `${activeCategory.en} problems: symptoms, causes and practical repair guidance.`;
  } else if (view === "fix") {
    title = isArabic ? "تشخيص أعطال السيارات | كراجي" : "Car Fault Diagnosis | Karaji";
    description = isArabic
      ? "ابحث عن عطل سيارتك، افحص أكواد OBD وشاهد دليل الأعطال والإصلاح."
      : "Search car problems, check OBD-II codes and browse practical repair guides.";
  } else if (view === "guide") {
    title = isArabic ? "دليل لمبات السيارة | كراجي" : "Car Warning Lights Guide | Karaji";
    description = isArabic
      ? "افهم لمبات التحذير في لوحة القيادة واعرف الخطوة التالية."
      : "Understand dashboard warning lights and know what to check next.";
  } else if (view === "garages") {
    title = isArabic ? "جراجات وورش سيارات | كراجي" : "Car Garages & Workshops | Karaji";
    description = isArabic
      ? "اعثر على جراجات وورش سيارات حسب الدولة والموقع."
      : "Find car garages and workshops by country and location.";
  }

  document.title = title;
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", description);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + window.location.pathname);

  let jsonLd = document.getElementById("karaji-route-jsonld");
  if (!jsonLd) {
    jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.id = "karaji-route-jsonld";
    document.head.appendChild(jsonLd);
  }
  jsonLd.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: window.location.href,
    inLanguage: lang,
    isPartOf: { "@type": "WebSite", name: "Karaji", url: window.location.origin },
  });
}

const GARAGES = {
  uae: {
    en: "United Arab Emirates",
    ar: "الإمارات العربية المتحدة",
    list: [
      {
        name: "Al Nahdha Auto Garage",
        area: { en: "Dubai & Abu Dhabi", ar: "دبي وأبوظبي" },
        note: {
          en: "Bosch-certified Toyota & Lexus hybrid specialist",
          ar: "متخصص معتمد من بوش لسيارات تويوتا ولكزس الهجينة",
        },
      },
      {
        name: "AAA Auto Garage",
        area: { en: "Al Quoz, Dubai", ar: "القوز، دبي" },
        note: {
          en: "Full-service garage with home service option",
          ar: "ورشة متكاملة الخدمات مع خدمة منزلية",
        },
      },
      {
        name: "Kings Auto Garage",
        area: { en: "Dubai", ar: "دبي" },
        note: {
          en: "German luxury car repair specialist",
          ar: "متخصص في إصلاح السيارات الألمانية الفاخرة",
        },
      },
      {
        name: "Aarya Auto Repair Body Shop",
        area: { en: "Abu Dhabi", ar: "أبوظبي" },
        note: {
          en: "Specialist in Rolls Royce, Bentley, Porsche & more",
          ar: "متخصص في رولز رويس وبنتلي وبورش وغيرها",
        },
      },
      {
        name: "ZDegree",
        area: { en: "8 branches across the UAE", ar: "٨ فروع في الإمارات" },
        note: {
          en: "Large multi-branch service network",
          ar: "شبكة خدمة كبيرة متعددة الفروع",
        },
      },
      {
        name: "Royal Swiss Auto Services",
        area: {
          en: "Dubai, Abu Dhabi, Sharjah, Al Ain, RAK",
          ar: "دبي، أبوظبي، الشارقة، العين، رأس الخيمة",
        },
        note: {
          en: "Luxury car workshop, 6 branches across the UAE",
          ar: "ورشة سيارات فاخرة بـ ٦ فروع في الإمارات",
        },
      },
      {
        name: "CarMate Auto Care",
        area: { en: "Dubai & Abu Dhabi", ar: "دبي وأبوظبي" },
        note: {
          en: "Trusted auto care with free vehicle collection",
          ar: "مركز صيانة موثوق مع خدمة استلام مجانية",
        },
      },
      {
        name: "Max Garage",
        area: { en: "Al Quoz, Dubai", ar: "القوز، دبي" },
        note: {
          en: "Independent multi-brand garage, trusted since the 1980s",
          ar: "ورشة مستقلة متعددة الماركات، موثوقة منذ الثمانينيات",
        },
      },
      {
        name: "Orange Auto",
        area: { en: "Dubai", ar: "دبي" },
        note: {
          en: "Family-owned specialist in BMW, Audi & Porsche",
          ar: "ورشة عائلية متخصصة في بي إم دبليو وأودي وبورش",
        },
      },
      {
        name: "Drums Auto Service Center",
        area: { en: "Mussafah, Abu Dhabi", ar: "مصفح، أبوظبي" },
        note: {
          en: "Full-service multi-brand workshop with 1,500+ reviews",
          ar: "ورشة متكاملة الخدمات لكل الماركات، بأكتر من 1500 تقييم",
        },
      },
      {
        name: "KM Garage",
        area: { en: "7 branches across the UAE", ar: "٧ فروع في الإمارات" },
        note: {
          en: "ISO 9001-certified workshop, operating since 1983",
          ar: "ورشة معتمدة بشهادة ISO 9001، شغالة من سنة 1983",
        },
      },
    ],
  },
  ksa: {
    en: "Saudi Arabia",
    ar: "المملكة العربية السعودية",
    list: [
      {
        name: "Wahj Al Remal Workshop",
        area: { en: "Riyadh", ar: "الرياض" },
        note: {
          en: "Well-equipped workshop, strong with Jeep, Chrysler, Dodge",
          ar: "ورشة مجهزة جيدًا، قوية في جيب وكرايسلر ودودج",
        },
      },
      {
        name: "Technocar",
        area: { en: "Riyadh", ar: "الرياض" },
        note: {
          en: "Loyal customer base, competitive rates",
          ar: "قاعدة عملاء وفية وأسعار تنافسية",
        },
      },
      {
        name: "Fix Auto Service (Gulf Motors Company)",
        area: { en: "Riyadh", ar: "الرياض" },
        note: {
          en: "Global Fix Network partner in the Kingdom",
          ar: "شريك شبكة Fix العالمية في المملكة",
        },
      },
    ],
  },
  egypt: {
    en: "Egypt",
    ar: "مصر",
    list: [
      {
        name: "Caps Auto Egypt",
        area: { en: "Cairo", ar: "القاهرة" },
        note: {
          en: "Multi-brand car service center",
          ar: "مركز صيانة سيارات متعدد الماركات",
        },
      },
      {
        name: "CRANK BMW & MINI",
        area: { en: "Cairo", ar: "القاهرة" },
        note: {
          en: "BMW & MINI specialist workshop",
          ar: "ورشة متخصصة في BMW و MINI",
        },
      },
      {
        name: "Jaguar Joseph Tito Service Centre",
        area: { en: "Cairo", ar: "القاهرة" },
        note: {
          en: "Jaguar specialist service center",
          ar: "مركز خدمة متخصص في جاكوار",
        },
      },
      {
        name: "A To Z Car Service",
        area: { en: "Fifth Settlement, Cairo", ar: "التجمع الخامس، القاهرة" },
        note: {
          en: "Multi-brand car service center",
          ar: "مركز صيانة سيارات متعدد الماركات",
        },
      },
      {
        name: "King of French Renault Company",
        area: { en: "Alexandria & Giza", ar: "الإسكندرية والجيزة" },
        note: {
          en: "Renault specialist, genuine parts",
          ar: "متخصص في رينو بقطع غيار أصلية",
        },
      },
      {
        name: "Nacita Auto Care",
        area: { en: "New Cairo & Smart Village", ar: "القاهرة الجديدة وسمارت فيلدج" },
        note: {
          en: "Multi-branch mechanical repair specialist",
          ar: "متخصص في الإصلاح الميكانيكي بعدة فروع",
        },
      },
    ],
  },
};

const SPARE_PARTS = {
  uae: {
    en: "United Arab Emirates",
    ar: "الإمارات العربية المتحدة",
    list: [
      {
        name: "Al Hammadi Spare Parts",
        area: { en: "Dubai, Abu Dhabi & Sharjah", ar: "دبي وأبوظبي والشارقة" },
        note: {
          en: "Trusted supplier since 1990 — body, engine parts & accessories",
          ar: "مورّد موثوق منذ ١٩٩٠ — قطع هيكل ومحرك واكسسوارات",
        },
      },
      {
        name: "Al Zayan Auto Spare Parts",
        area: { en: "Dubai", ar: "دبي" },
        note: {
          en: "Authorised dealer for genuine parts — Rolls Royce, BMW, Porsche & more",
          ar: "وكيل معتمد لقطع أصلية — رولز رويس وبي إم دبليو وبورش وغيرها",
        },
      },
      {
        name: "Noorhan Trading",
        area: { en: "Al Quoz Industrial Area 2, Dubai", ar: "منطقة القوز الصناعية ٢، دبي" },
        note: {
          en: "Genuine parts for Toyota, Honda, Nissan, Mazda & more since 1989",
          ar: "قطع أصلية لتويوتا وهوندا ونيسان ومازدا وغيرها منذ ١٩٨٩",
        },
      },
      {
        name: "Divya Auto Spare Parts",
        area: { en: "6 branches across the UAE", ar: "٦ فروع في الإمارات" },
        note: {
          en: "50,000+ parts in stock — Japanese & Korean brand specialist",
          ar: "أكثر من ٥٠،٠٠٠ قطعة بالمخزون — متخصص في الماركات اليابانية والكورية",
        },
      },
      {
        name: "Best Auto Parts",
        area: { en: "Dubai", ar: "دبي" },
        note: {
          en: "35+ years supplying genuine & aftermarket parts across the UAE",
          ar: "أكثر من ٣٥ عامًا في توريد قطع أصلية وبديلة في الإمارات",
        },
      },
    ],
  },
  ksa: {
    en: "Saudi Arabia",
    ar: "السعودية",
    list: [
      {
        name: "Abdul Latif Jameel Parts",
        area: { en: "Jeddah & branches nationwide", ar: "جدة وفروع بجميع أنحاء المملكة" },
        note: {
          en: "Official Toyota-authorised genuine spare parts distributor",
          ar: "الموزع المعتمد الرسمي لقطع غيار تويوتا الأصلية",
        },
      },
      {
        name: "Al Shamry Auto Parts",
        area: { en: "Riyadh", ar: "الرياض" },
        note: {
          en: "OEM & aftermarket parts for Japanese, Korean & European brands",
          ar: "قطع أصلية وبديلة للماركات اليابانية والكورية والأوروبية",
        },
      },
      {
        name: "Al Hazmi Auto Parts",
        area: { en: "Jeddah & Riyadh, delivery nationwide", ar: "جدة والرياض، توصيل لكل المملكة" },
        note: {
          en: "Wholesale American-brand spare parts, well-established name",
          ar: "قطع غيار أمريكية بالجملة، اسم راسخ في السوق",
        },
      },
    ],
  },
  egypt: {
    en: "Egypt",
    ar: "مصر",
    list: [
      {
        name: "Cairo Spare Parts Market — Al Kholafawy",
        area: { en: "Shubra, Cairo", ar: "شبرا، القاهرة" },
        note: {
          en: "Long-established parts market hub with wide brand coverage",
          ar: "سوق قطع غيار عريق يغطي معظم الماركات",
        },
      },
      {
        name: "New Cairo Auto Parts — 90th Street",
        area: { en: "5th Settlement, New Cairo", ar: "التجمع الخامس، القاهرة الجديدة" },
        note: {
          en: "Bosch service point, genuine & aftermarket parts",
          ar: "نقطة خدمة بوش، قطع أصلية وبديلة",
        },
      },
      {
        name: "Alexandria Auto Parts — Sahara Road",
        area: { en: "Sahara Road, Alexandria", ar: "طريق مصر إسكندرية الصحراوي" },
        note: {
          en: "Major industrial-zone parts supplier for Alexandria",
          ar: "مورّد قطع غيار رئيسي بالمنطقة الصناعية بالإسكندرية",
        },
      },
    ],
  },
};

/* ---------------------------------------------------------------
   UI copy
--------------------------------------------------------------- */
const T = {
  en: {
    wordmark: "Karaji",
    tagline: "Diagnose car issues & find trusted garages",
    navHome: "Home",
    navIssues: "Issues",
    navGarages: "Garages",
    homeHeading: "What's wrong with your car?",
    homeSub: "Tap a system to see common issues",
    lightsGuideTile: "Warning Lights Guide",
    lightsGuideHeading: "Dashboard Warning Lights",
    lightsGuideSub: "Tap any light to learn what it means and how to fix it",
    issuesCount: "issue",
    issuesCountPlural: "issues",
    symptoms: "Symptoms",
    causes: "Possible Causes",
    steps: "What To Do",
    watchVideo: "Watch fix video",
    garagesHeading: "Trusted garages",
    garagesSub: "Pick a country to browse workshops",
    garagesNote:
      "Starter directory from public sources — confirm hours, pricing & contact details before visiting.",
    openInMaps: "Open in Maps →",
    addGarageBtn: "+ Add Your Garage",
    requestQuoteBtn: "Request a price quote from a garage",
    quoteBannerLabel: "Requesting a quote for:",
    quoteBannerHint: "Pick a Plus garage below to send this request on WhatsApp",
    quoteClear: "Cancel",
    quoteCardBtn: "📩 Request quote via WhatsApp",
    quoteStaticNote: "Directory listing — not set up for direct quote requests",
    navParts: "Spare Parts",
    partsHeading: "Spare parts shops",
    partsSub: "Pick a country to browse trusted spare parts dealers",
    partsNote:
      "Starter directory from public sources — confirm stock, pricing & authenticity before visiting. Want your shop listed? Add it via the Garages tab.",
    navAdvertise: "Advertise",
    advertiseHeading: "Advertise With Us",
    advertiseSub: "Reach car owners across the UAE, KSA & Egypt",
    advertiseBullets: [
      "Bilingual audience — Arabic and English speakers in one app",
      "Garage placement — get your workshop featured at the top of its city list",
      "In-app banner space on high-traffic issue and garage pages",
      "Sponsored content — a featured tip or offer shown to relevant car issues",
    ],
    advertiseCTA: "Get in touch",
    advertiseNote: "Tap below to email us your advertising inquiry.",
    navCars: "Sell Your Car",
    carsHeading: "Sell Your Car",
    carsSub: "Post your car for sale in a few steps",
    navBuyCar: "Buy a Car",
    buyCarHeading: "Buy a Car",
    buyCarSub: "Browse listings or narrow down with filters",
    filterCountry: "Country",
    filterMake: "Make",
    filterModel: "Model",
    filterPrice: "Price range",
    filterYear: "Year",
    filterMileage: "Mileage",
    filterAll: "All",
    filterClear: "Clear filters",
    filterNoResults: "No cars match these filters yet.",
    addCarBtn: "+ List Your Car",
    carModel: "Make & Model",
    carMake: "Make",
    carModelType: "Model",
    carYear: "Year",
    carPrice: "Price",
    carMileage: "Mileage (km)",
    carChassis: "Chassis Number (VIN)",
    carCity: "City",
    carCountry: "Country",
    carSpecs: "Specs",
    carSpecsGulf: "GCC Specs",
    carSpecsAmerican: "American Specs",
    carPhone: "WhatsApp / Phone Number",
    carDescription: "Description",
    carPhotoUrl: "Photo Link (optional)",
    carAddPhoto: "Add Photo",
    carChangePhoto: "Change Photo",
    carUploading: "Uploading...",
    carPhotoError: "Couldn't upload photo. Try a smaller image.",
    carSubmit: "Submit Listing",
    carCancel: "Cancel",
    carSubmitted: "Thanks! Your listing is live now.",
    carEmpty: "No cars listed yet. Be the first!",
    carLoading: "Loading listings...",
    carContact: "Contact Seller",
    carNoDb:
      "The cars marketplace isn't connected yet. Once Supabase is set up, listings will appear here.",
    adminTitle: "Karajy Admin",
    adminMenuLabel: "Dashboard",
    adminRememberMe: "Remember me / Stay signed in",
    adminSubtitle: "Manage car listings",
    adminEmail: "Username / Email",
    adminPassword: "Password",
    adminLogin: "Sign in",
    adminLogout: "Sign out",
    adminLoginRequired: "Admin access only",
    adminInvalid: "You are not authorized to manage listings.",
    adminLoading: "Loading admin panel...",
    adminNoListings: "No listings found.",
    adminAvailable: "Available",
    adminSold: "Sold",
    adminMarkSold: "Mark as sold",
    adminMarkAvailable: "Mark as available",
    adminUpdateError: "Could not update this listing.",
    adminManageSubtitle: "Manage garages + photo diagnosis requests + cars",
    adminPhotosTab: "Photo Diagnosis",
    adminGaragesTab: "Garage Requests",
    adminCarsTab: "Cars",
    adminManageGaragesTab: "Manage Garages",
    adminMaintenanceTab: "Maintenance Centers",
    adminMediaTab: "Fault Media",
    adminAddMedia: "Add fault photo/video",
    adminMediaIssue: "Fault",
    adminMediaLanguage: "Language",
    adminMediaFile: "Photo / video",
    adminMediaUpload: "Upload media",
    adminMediaLimit: "Video: max 8 MB and 30 seconds. Images are compressed automatically.",
    adminMediaEmpty: "No uploaded fault media yet.",
    adminAddGarage: "Add Garage",
    adminAddMaintenance: "Add Maintenance Center",
    adminDelete: "Delete",
    adminCountry: "Country",
    adminRequestsCount: "requests",
    adminLoadingRequests: "Loading requests...",
    adminNoPhotoRequests: "No photo diagnosis requests.",
    adminPhotoRequest: "Photo diagnosis request",
    adminPackage: "Package",
    adminDiagnosis: "diagnoses",
    adminStatus: "Status",
    adminViewReceipt: "View transfer receipt",
    adminCreditCode: "Credit code",
    adminSendCode: "Send code to customer on WhatsApp",
    adminApproving: "Approving...",
    adminApproveGenerate: "Approve + Generate Code",
    adminNoGarageRequests: "No garage requests.",
    adminRank: "Rank",
    adminYear: "AED/year",
    adminApprove: "Approve",
    adminReject: "Decline & Delete",
    adminNoCars: "No cars.",
    soldBadge: "SOLD",
    faultCodeSearchLabel: "Search a Fault Code",
    faultCodeSearchPlaceholder: "e.g. P0300 or \"misfire\"",
    faultCodeSearchHint: "Enter the OBD-II code your scanner showed, or a keyword",
    faultCodeNoResults: "No matching code found — try the categories below, or ask a garage to scan it.",
    faultCodeMeaning: "What it means",
    faultCodeViewGuide: "View full troubleshooting guide →",
    navMaintenance: "Quick Service",
    maintenanceHeading: "Quick Service & Oil Change Centers",
    maintenanceSub: "Pick a country to browse trusted quick-service chains",
    maintenanceNote:
      "National/regional quick-service chains from public sources — confirm the nearest branch, hours & pricing before visiting.",
    navDiagnosis: "Photo Diagnosis",
    navValuation: "Car Valuation",
    backHome: "Home",
  },
  ar: {
    wordmark: "كراجي",
    tagline: "شخّص مشاكل سيارتك واعثر على ورش موثوقة",
    navHome: "الرئيسية",
    navIssues: "الأعطال",
    navGarages: "الورش",
    homeHeading: "ما هي مشكلة سيارتك؟",
    homeSub: "اضغط على أحد الأنظمة لرؤية الأعطال الشائعة",
    lightsGuideTile: "دليل لمبات التحذير",
    lightsGuideHeading: "لمبات لوحة القيادة",
    lightsGuideSub: "اضغط على أي لمبة لمعرفة معناها وطريقة حلها",
    issuesCount: "عطل",
    issuesCountPlural: "أعطال",
    symptoms: "الأعراض",
    causes: "الأسباب المحتملة",
    steps: "ماذا تفعل",
    watchVideo: "شاهد فيديو الإصلاح",
    garagesHeading: "ورش موثوقة",
    garagesSub: "اختر دولة لتصفح الورش",
    garagesNote:
      "دليل أولي من مصادر عامة — يرجى التأكد من مواعيد العمل والأسعار وبيانات التواصل قبل الزيارة.",
    openInMaps: "← افتح في الخرائط",
    addGarageBtn: "+ أضف جراجك",
    requestQuoteBtn: "اطلب عرض سعر من ورشة",
    quoteBannerLabel: "بتطلب عرض سعر عن:",
    quoteBannerHint: "اختر ورشة من قايمة \"بلس\" تحت عشان تبعتلها الطلب على واتساب",
    quoteClear: "إلغاء",
    quoteCardBtn: "📩 اطلب عرض سعر عبر واتساب",
    quoteStaticNote: "ورشة من الدليل العام — مش متاح ليها طلب عرض سعر مباشر",
    navParts: "قطع غيار",
    partsHeading: "محلات قطع الغيار",
    partsSub: "اختر دولة لتصفح موزعي قطع الغيار الموثوقين",
    partsNote:
      "دليل أولي من مصادر عامة — يرجى التأكد من توفر القطعة والسعر والأصالة قبل الزيارة. عايز تضيف محلك؟ ضيفه من تبويب الجراجات.",
    navAdvertise: "أعلن معنا",
    advertiseHeading: "أعلن معنا",
    advertiseSub: "وصّل لأصحاب السيارات في الإمارات والسعودية ومصر",
    advertiseBullets: [
      "جمهور ثنائي اللغة — متحدثو العربية والإنجليزية في تطبيق واحد",
      "ظهور مميز لورشتك في أعلى قائمة مدينتها",
      "مساحة إعلانية داخل التطبيق في صفحات الأعطال والورش الأكثر زيارة",
      "محتوى مدعوم — نصيحة أو عرض مميز يظهر مع الأعطال ذات الصلة",
    ],
    advertiseCTA: "تواصل معنا",
    advertiseNote: "اضغط بالأسفل لإرسال استفسار الإعلان عبر البريد الإلكتروني.",
    navCars: "بيع سيارتك",
    carsHeading: "بيع سيارتك",
    carsSub: "اعرض سيارتك للبيع في خطوات بسيطة",
    navBuyCar: "اشتري سيارة",
    buyCarHeading: "اشتري سيارة",
    buyCarSub: "تصفح السيارات المعروضة أو ضيّق البحث بالفلاتر",
    filterCountry: "الدولة",
    filterMake: "الماركة",
    filterModel: "الموديل",
    filterPrice: "نطاق السعر",
    filterYear: "السنة",
    filterMileage: "الكيلومترات",
    filterAll: "الكل",
    filterClear: "مسح الفلاتر",
    filterNoResults: "مفيش سيارات مطابقة للفلاتر دي دلوقتي.",
    addCarBtn: "+ اعرض سيارتك",
    carModel: "الماركة والموديل",
    carMake: "الماركة",
    carModelType: "الموديل",
    carYear: "سنة الصنع",
    carPrice: "السعر",
    carMileage: "الكيلومترات",
    carChassis: "رقم الشاصية",
    carCity: "المدينة",
    carCountry: "الدولة",
    carSpecs: "الفئة",
    carSpecsGulf: "خليجي",
    carSpecsAmerican: "أمريكي",
    carPhone: "رقم واتساب / التواصل",
    carDescription: "الوصف",
    carPhotoUrl: "رابط صورة (اختياري)",
    carAddPhoto: "أضف صورة",
    carChangePhoto: "غيّر الصورة",
    carUploading: "جاري رفع الصورة...",
    carPhotoError: "تعذر رفع الصورة، جرب صورة أصغر حجمًا.",
    carSubmit: "إرسال الإعلان",
    carCancel: "إلغاء",
    carSubmitted: "شكرًا! إعلانك ظاهر الآن.",
    carEmpty: "لا توجد سيارات معروضة حاليًا. كن أول من يعرض سيارته!",
    carLoading: "جاري تحميل الإعلانات...",
    carContact: "تواصل مع البائع",
    carNoDb: "سوق السيارات لسه مش متصل بقاعدة البيانات. بعد إعداد Supabase هتظهر الإعلانات هنا.",
    adminTitle: "إدارة كراجي",
    adminSubtitle: "إدارة إعلانات السيارات",
    adminEmail: "اسم المستخدم / البريد الإلكتروني",
    adminPassword: "كلمة المرور",
    adminLogin: "تسجيل الدخول",
    adminLogout: "تسجيل الخروج",
    adminLoginRequired: "الدخول مخصص للإدارة فقط",
    adminMenuLabel: "لوحة التحكم",
    adminRememberMe: "تذكرني / البقاء مسجّل الدخول",
    adminInvalid: "هذا الحساب غير مصرح له بإدارة الإعلانات.",
    adminLoading: "جاري تحميل لوحة الإدارة...",
    adminNoListings: "لا توجد إعلانات.",
    adminAvailable: "متاحة",
    adminSold: "تم البيع",
    adminMarkSold: "تحديد تم البيع",
    adminMarkAvailable: "إعادة للعرض",
    adminUpdateError: "تعذر تحديث الإعلان.",
    adminManageSubtitle: "إدارة الجراجات + طلبات تشخيص الصور + السيارات",
    adminPhotosTab: "صور الأعطال",
    adminGaragesTab: "طلبات الجراجات",
    adminCarsTab: "السيارات",
    adminManageGaragesTab: "إدارة الجراجات",
    adminMaintenanceTab: "مراكز الصيانة",
    adminMediaTab: "صور وفيديو الأعطال",
    adminAddMedia: "إضافة صورة / فيديو للعطل",
    adminMediaIssue: "العطل",
    adminMediaLanguage: "اللغة",
    adminMediaFile: "الصورة / الفيديو",
    adminMediaUpload: "رفع الملف",
    adminMediaLimit: "الفيديو: حد أقصى 8 ميجابايت و30 ثانية. الصور يتم ضغطها تلقائيًا.",
    adminMediaEmpty: "لا توجد وسائط مرفوعة للأعطال.",
    adminAddGarage: "إضافة جراج",
    adminAddMaintenance: "إضافة مركز صيانة",
    adminDelete: "حذف",
    adminCountry: "الدولة",
    adminRequestsCount: "طلب",
    adminLoadingRequests: "جاري تحميل الطلبات...",
    adminNoPhotoRequests: "لا توجد طلبات تشخيص صور.",
    adminPhotoRequest: "طلب تشخيص صور",
    adminPackage: "الباقة",
    adminDiagnosis: "تشخيص",
    adminStatus: "الحالة",
    adminViewReceipt: "عرض إيصال التحويل",
    adminCreditCode: "كود الرصيد",
    adminSendCode: "إرسال الكود للعميل على WhatsApp",
    adminApproving: "جاري الاعتماد...",
    adminApproveGenerate: "اعتماد + توليد الكود",
    adminNoGarageRequests: "لا توجد طلبات جراجات.",
    adminRank: "الترتيب",
    adminYear: "درهم/سنة",
    adminApprove: "اعتماد",
    adminReject: "رفض وحذف",
    adminNoCars: "لا توجد سيارات.",
    soldBadge: "تم البيع",
    faultCodeSearchLabel: "دور برمز العطل",
    faultCodeSearchPlaceholder: "مثال: P0300 أو \"قطع تماس\"",
    faultCodeSearchHint: "اكتب كود الـ OBD-II اللي طلعلك في جهاز الفحص، أو كلمة مفتاحية",
    faultCodeNoResults: "مفيش كود مطابق، جرب الأقسام تحت، أو اطلب من الجراج يفحصه بالجهاز.",
    faultCodeMeaning: "معنى الكود",
    faultCodeViewGuide: "شوف دليل الحل الكامل ←",
    navMaintenance: "الصيانة السريعة",
    maintenanceHeading: "مراكز الصيانة السريعة وتغيير الزيت",
    maintenanceSub: "اختر الدولة عشان تشوف السلاسل الموثوقة",
    maintenanceNote:
      "سلاسل صيانة سريعة وطنية/إقليمية من مصادر عامة، تأكد من أقرب فرع والمواعيد والأسعار قبل ما تروح.",
    navDiagnosis: "تشخيص بالصورة",
    navValuation: "تقييم سعر السيارة",
    backHome: "الرئيسية",
  },
};

/* ---------------------------------------------------------------
   Small building blocks
--------------------------------------------------------------- */
function TopBar({ lang, setLang, t, onLogoTap, menuOpen, onToggleMenu, onAddGarage, onOpenAdmin }) {
  const isRTL = lang === "ar";
  return (
    <div
      className="flex items-center justify-between px-5 pt-3 pb-4"
      style={{ borderBottom: `1px solid ${C.panelLine}`, position: "relative" }}
    >
      <button
        onClick={onLogoTap}
        className="flex items-center gap-2"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 30,
            height: 30,
            background: C.amber,
            boxShadow: `0 0 14px ${C.amber}66`,
          }}
        >
          <Wrench size={16} color={C.asphalt} strokeWidth={2.5} />
        </div>
        <span
          style={{
            color: C.cream,
            fontFamily: "'Oswald', sans-serif",
            fontSize: 19,
            letterSpacing: isRTL ? 0 : "0.02em",
            fontWeight: 600,
          }}
        >
          {t.wordmark}
        </span>
      </button>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center rounded-full p-0.5"
          style={{ background: C.panel, border: `1px solid ${C.panelLine}` }}
        >
          {["en", "ar"].map((code) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "5px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                background: lang === code ? C.amber : "transparent",
                color: lang === code ? C.asphalt : C.creamDim,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {code === "en" ? "EN" : "AR"}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleMenu}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 32,
            height: 32,
            background: C.panel,
            border: `1px solid ${C.panelLine}`,
            cursor: "pointer",
          }}
        >
          <Menu size={16} color={C.cream} strokeWidth={2} />
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: 54,
            insetInlineEnd: 20,
            background: C.panel,
            border: `1px solid ${C.panelLine}`,
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
            zIndex: 50,
            minWidth: 190,
          }}
        >
          <button
            onClick={onOpenAdmin}
            className="w-full flex items-center gap-2"
            style={{
              display: "flex",
              width: "100%",
              padding: "12px 16px",
              background: "none",
              border: "none",
              color: C.cream,
              fontSize: 13,
              fontWeight: 600,
              textAlign: isRTL ? "right" : "left",
              cursor: "pointer",
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            <ShieldCheck size={16} color={C.amber} strokeWidth={2} />
            <span style={{ flex: 1 }}>{t.adminMenuLabel}</span>
          </button>

          <button
            onClick={onAddGarage}
            className="w-full flex items-center gap-2"
            style={{
              display: "flex",
              width: "100%",
              padding: "12px 16px",
              background: "none",
              border: "none",
              borderTop: `1px solid ${C.panelLine}`,
              color: C.cream,
              fontSize: 13,
              fontWeight: 600,
              textAlign: isRTL ? "right" : "left",
              cursor: "pointer",
              flexDirection: isRTL ? "row-reverse" : "row",
            }}
          >
            <Plus size={16} color={C.amber} strokeWidth={2} />
            <span style={{ flex: 1 }}>{t.addGarageBtn}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function BottomNav({ lang, t, view, setView }) {
  const items = [
    { id: "home", label: t.navHome, icon: Gauge },
    { id: "garages", label: t.navGarages, icon: MapPin },
    { id: "maintenance", label: t.navMaintenance, icon: Droplet },
    { id: "cars", label: t.navCars, icon: Car },
    { id: "parts", label: t.navParts, icon: Settings },
    { id: "diagnosis", label: t.navDiagnosis, icon: Camera },
  ];
  return (
    <div
      className="flex"
      style={{
        borderTop: `1px solid ${C.panelLine}`,
        background: C.panel,
        overflowX: "auto",
      }}
    >
      {items.map((it) => {
        const active =
          view === it.id ||
          (it.id === "home" && (view === "category" || view === "issue" || view === "guide"));
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className="flex-1 flex flex-col items-center gap-1 py-3"
            style={{ border: "none", background: "none", cursor: "pointer", minWidth: 58 }}
          >
            <Icon size={20} color={active ? C.amber : C.grey} strokeWidth={2} />
            <span
              style={{
                fontSize: 10.5,
                fontFamily: lang === "ar" ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                color: active ? C.amber : C.grey,
                fontWeight: active ? 600 : 500,
                textAlign: "center",
              }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Dial({ Icon, label, count, unitLabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2"
      style={{ border: "none", background: "none", cursor: "pointer" }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: 76,
          height: 76,
          background: `radial-gradient(circle at 35% 30%, ${C.panel}, ${C.asphalt})`,
          border: `2px solid ${C.panelLine}`,
          boxShadow: `inset 0 0 0 3px ${C.asphalt}, 0 0 0 1px ${C.panelLine}`,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 58,
            height: 58,
            border: `1px solid ${C.amberDim}`,
            background: `${C.amber}14`,
          }}
        >
          <Icon size={24} color={C.amber} strokeWidth={1.8} />
        </div>
      </div>
      <div className="text-center" style={{ maxWidth: 88 }}>
        <div
          style={{
            color: C.cream,
            fontSize: 12.5,
            fontWeight: 600,
            lineHeight: 1.25,
            fontFamily: "inherit",
          }}
        >
          {label}
        </div>
        <div style={{ color: C.grey, fontSize: 10.5, marginTop: 2 }}>
          {count} {unitLabel}
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------
   Views
--------------------------------------------------------------- */
const MAIN_SECTIONS = [
  { id: "fix", icon: Gauge, labelKey: "navIssues" },
  { id: "garages", icon: MapPin, labelKey: "navGarages" },
  { id: "maintenance", icon: Droplet, labelKey: "navMaintenance" },
  { id: "buy-car", icon: Search, labelKey: "navBuyCar" },
  { id: "cars", icon: Car, labelKey: "navCars" },
  { id: "parts", icon: Settings, labelKey: "navParts" },
  { id: "diagnosis", icon: Camera, labelKey: "navDiagnosis" },
  { id: "valuation", icon: Tag, labelKey: "navValuation" },
];

function MainSectionsGrid({ lang, t, onOpenSection }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-7">
      {MAIN_SECTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => onOpenSection(s.id)}
            className="flex flex-col items-center gap-2"
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 14,
              padding: "14px 8px",
              cursor: "pointer",
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                background: `${C.amber}18`,
                border: `1px solid ${C.amberDim}`,
              }}
            >
              <Icon size={20} color={C.amber} strokeWidth={1.8} />
            </div>
            <span
              style={{
                color: C.cream,
                fontSize: 11.5,
                fontWeight: 600,
                textAlign: "center",
                lineHeight: 1.25,
              }}
            >
              {t[s.labelKey]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HomeView({ lang, t, onOpenSection }) {
  return (
    <div className="px-5 pt-5 pb-6">
      <h1
        style={{
          color: C.cream,
          fontSize: 21,
          fontWeight: 700,
          fontFamily: "inherit",
          margin: 0,
        }}
      >
        {t.homeHeading}
      </h1>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 16 }}>
        {t.homeSub}
      </p>

      <MainSectionsGrid lang={lang} t={t} onOpenSection={onOpenSection} />
    </div>
  );
}

function FixView({ lang, t, onOpenCategory, onOpenGuide, onOpenIssue, onOpenObdCode }) {
  const [query, setQuery] = useState("");
  const [expandedCode, setExpandedCode] = useState(null);

  const norm = query.trim().toUpperCase();
  const matches =
    norm.length >= 2
      ? Object.keys(OBD_CODES)
          .filter((code) => {
            const entry = OBD_CODES[code];
            return (
              code.includes(norm) ||
              entry.en.title.toUpperCase().includes(norm) ||
              entry.ar.title.includes(query.trim())
            );
          })
          .slice(0, 6)
      : [];

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="mb-2">
        <label
          style={{
            color: C.creamDim,
            fontSize: 12,
            fontWeight: 600,
            display: "block",
            marginBottom: 6,
          }}
        >
          {t.faultCodeSearchLabel}
        </label>
        <div
          className="flex items-center gap-2"
          style={{
            background: "#ffffff0d",
            border: `1px solid #ffffff1f`,
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <Search size={16} color={C.creamDim} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setExpandedCode(null);
            }}
            placeholder={t.faultCodeSearchPlaceholder}
            dir={lang === "ar" ? "rtl" : "ltr"}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: C.cream,
              fontSize: 13.5,
              width: "100%",
              fontFamily: "inherit",
            }}
          />
        </div>
        <p style={{ color: C.creamDim, fontSize: 10.5, marginTop: 5, opacity: 0.75 }}>
          {t.faultCodeSearchHint}
        </p>
      </div>

      {norm.length >= 2 && (
        <div className="mb-6">
          {matches.length === 0 ? (
            <p style={{ color: C.creamDim, fontSize: 12, padding: "10px 2px" }}>
              {t.faultCodeNoResults}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {matches.map((code) => {
                const entry = OBD_CODES[code];
                const info = entry[lang];
                const isOpen = expandedCode === code;
                return (
                  <div
                    key={code}
                    style={{
                      background: "#ffffff0a",
                      border: `1px solid #ffffff1a`,
                      borderRadius: 12,
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => onOpenObdCode(code)}
                      className="w-full flex items-center gap-3"
                      style={{
                        padding: "11px 13px",
                        textAlign: lang === "ar" ? "right" : "left",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        style={{
                          color: C.amber,
                          fontSize: 12.5,
                          fontWeight: 700,
                          flexShrink: 0,
                          fontFamily: "monospace",
                        }}
                      >
                        {code}
                      </span>
                      <span style={{ color: C.cream, fontSize: 12.5, fontWeight: 600, flex: 1 }}>
                        {info.title}
                      </span>
                      {lang === "ar" ? (
                        <ChevronLeft size={14} color={C.creamDim} />
                      ) : (
                        <ChevronRight size={14} color={C.creamDim} />
                      )}
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 13px 13px" }}>
                        <p
                          style={{
                            color: C.creamDim,
                            fontSize: 11.5,
                            lineHeight: 1.6,
                            marginBottom: entry.relatedIssue ? 10 : 0,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: C.cream }}>
                            {t.faultCodeMeaning}:{" "}
                          </span>
                          {info.meaning}
                        </p>
                        {entry.relatedIssue && (
                          <button
                            onClick={() => onOpenIssue(entry.relatedIssue)}
                            style={{
                              color: C.blue,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {t.faultCodeViewGuide}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onOpenGuide}
        className="w-full flex items-center gap-3 mb-6"
        style={{
          background: `${C.blue}14`,
          border: `1px solid ${C.blue}55`,
          borderRadius: 14,
          padding: "13px 16px",
          cursor: "pointer",
          textAlign: lang === "ar" ? "right" : "left",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 38, height: 38, background: `${C.blue}22`, flexShrink: 0 }}
        >
          <EngineLightIcon size={19} color={C.blue} strokeWidth={1.6} />
        </div>
        <span style={{ color: C.cream, fontSize: 13.5, fontWeight: 600, flex: 1 }}>
          {t.lightsGuideTile}
        </span>
        {lang === "ar" ? (
          <ChevronLeft size={16} color={C.blue} />
        ) : (
          <ChevronRight size={16} color={C.blue} />
        )}
      </button>

      <div className="grid grid-cols-2 gap-y-7 gap-x-3">
        {CATEGORIES.map((cat) => (
          <Dial
            key={cat.id}
            Icon={cat.icon}
            label={cat[lang]}
            count={cat.issues.length}
            unitLabel={cat.issues.length === 1 ? t.issuesCount : t.issuesCountPlural}
            onClick={() => onOpenCategory(cat)}
          />
        ))}
      </div>
    </div>
  );
}


function ObdCodeView({ lang, t, code, onOpenIssue, onBack, isRTL }) {
  const entry = OBD_CODES[code];
  if (!entry) return null;
  const info = entry[lang];
  const related = entry.relatedIssue ? ISSUES[entry.relatedIssue]?.[lang] : null;

  return (
    <div className="pb-6">
      <BackHeader label={t.navIssues} onBack={onBack} isRTL={isRTL} />
      <div className="px-5">
        <div style={{ color: C.amber, fontFamily: "monospace", fontWeight: 800, fontSize: 22, marginBottom: 5 }}>
          {code}
        </div>
        <h1 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: "0 0 8px" }}>
          {info.title}
        </h1>
        <div
          style={{
            background: C.panel,
            border: `1px solid ${C.panelLine}`,
            borderRadius: 14,
            padding: "14px 15px",
            marginBottom: 14,
          }}
        >
          <div style={{ color: C.creamDim, fontSize: 11.5, fontWeight: 700, marginBottom: 5 }}>
            {t.faultCodeMeaning}
          </div>
          <p style={{ color: C.cream, fontSize: 13, lineHeight: 1.65, margin: 0 }}>{info.meaning}</p>
        </div>

        {related && (
          <button
            onClick={() => onOpenIssue(entry.relatedIssue)}
            style={{
              width: "100%",
              background: `${C.blue}14`,
              border: `1px solid ${C.blue}55`,
              borderRadius: 14,
              padding: "13px 15px",
              color: C.blue,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: "pointer",
              textAlign: lang === "ar" ? "right" : "left",
            }}
          >
            {t.faultCodeViewGuide}: {related.title}
          </button>
        )}
      </div>
    </div>
  );
}

function LightsGuideView({ lang, t, onOpenCategory, onBack, isRTL }) {
  return (
    <div className="pb-6">
      <BackHeader label={t.navIssues} onBack={onBack} isRTL={isRTL} />
      <div className="px-5">
        <h1 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: "0 0 4px 0" }}>
          {t.lightsGuideHeading}
        </h1>
        <p style={{ color: C.creamDim, fontSize: 13, marginBottom: 18 }}>{t.lightsGuideSub}</p>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => onOpenCategory(cat)}
                className="flex flex-col items-center gap-2"
                style={{
                  background: C.panel,
                  border: `1px solid ${C.panelLine}`,
                  borderRadius: 14,
                  padding: "16px 10px",
                  cursor: "pointer",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 56,
                    height: 56,
                    background: `radial-gradient(circle, ${C.amber}22, ${C.amber}08 70%)`,
                    border: `1px solid ${C.amber}`,
                  }}
                >
                  <Icon size={26} color={C.amber} strokeWidth={1.5} />
                </div>
                <span
                  style={{
                    color: C.cream,
                    fontSize: 12.5,
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {lang === "ar" ? cat.guideAr : cat.guideEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BackHeader({ label, onBack, isRTL }) {
  const Icon = isRTL ? ChevronRight : ChevronLeft;
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1 px-5 pt-4 pb-2"
      style={{ border: "none", background: "none", cursor: "pointer" }}
    >
      <Icon size={18} color={C.amber} />
      <span style={{ color: C.amber, fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function CategoryView({ lang, t, category, onOpenIssue, onBack, isRTL }) {
  const Icon = category.icon;
  return (
    <div className="pb-6">
      <BackHeader label={t.navIssues} onBack={onBack} isRTL={isRTL} />
      <div className="px-5 flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 42, height: 42, background: `${C.amber}18`, border: `1px solid ${C.amberDim}` }}
        >
          <Icon size={20} color={C.amber} />
        </div>
        <h2 style={{ color: C.cream, fontSize: 18, fontWeight: 700, margin: 0 }}>
          {category[lang]}
        </h2>
      </div>
      <div className="px-5 flex flex-col gap-2.5">
        {category.issues.map((issueId) => {
          const issue = ISSUES[issueId][lang];
          return (
            <button
              key={issueId}
              onClick={() => onOpenIssue(issueId)}
              className="text-start"
              style={{
                background: C.panel,
                border: `1px solid ${C.panelLine}`,
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: C.cream, fontSize: 14, fontWeight: 600, textAlign: isRTL ? "right" : "left" }}>
                {issue.title}
              </span>
              {isRTL ? (
                <ChevronLeft size={16} color={C.grey} />
              ) : (
                <ChevronRight size={16} color={C.grey} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Section({ label, color, children }) {
  return (
    <div className="mb-5">
      <div
        style={{
          color,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function IssueView({ lang, t, issueId, onBack, categoryLabel, CategoryIcon, isRTL, onRequestQuote }) {
  const issue = ISSUES[issueId][lang];
  const [media, setMedia] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadIssueMedia() {
      if (!supabase) return;
      const { data } = await supabase
        .from("issue_media")
        .select("id,media_type,url,title,sort_order,created_at")
        .eq("issue_id", issueId)
        .eq("lang", lang)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (active) setMedia(data || []);
    }
    loadIssueMedia();
    return () => { active = false; };
  }, [issueId, lang]);

  return (
    <div className="pb-6" style={{ paddingBottom: "calc(90px + env(safe-area-inset-bottom))" }}>
      <BackHeader label={categoryLabel} onBack={onBack} isRTL={isRTL} />
      <div className="px-5">
        {CategoryIcon && (
          <div className="flex justify-center mb-4">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 84,
                height: 84,
                background: `radial-gradient(circle, ${C.amber}33, ${C.amber}08 70%)`,
                border: `1.5px solid ${C.amber}`,
                boxShadow: `0 0 22px ${C.amber}55, inset 0 0 12px ${C.amber}22`,
              }}
            >
              <CategoryIcon size={38} color={C.amber} strokeWidth={1.5} />
            </div>
          </div>
        )}
        <h2 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.3, textAlign: "center" }}>
          {issue.title}
        </h2>

        <Section label={t.symptoms} color={C.blue}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {issue.symptoms.map((s, i) => (
              <li
                key={i}
                style={{
                  color: C.creamDim,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: C.blue, flexShrink: 0 }}>●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section label={t.causes} color={C.amber}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {issue.causes.map((s, i) => (
              <li
                key={i}
                style={{
                  color: C.creamDim,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span style={{ color: C.amber, flexShrink: 0 }}>●</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section label={t.steps} color={C.red}>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", counterReset: "step" }}>
            {issue.steps.map((s, i) => (
              <li
                key={i}
                style={{
                  color: C.cream,
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: `${C.red}22`,
                    color: C.red,
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        {media.length > 0 && (
          <Section label={lang === "ar" ? "فيديو وصور الإصلاح" : "Repair photos & videos"} color={C.blue}>
            <div className="flex flex-col gap-3">
              {media.map((m) => (
                <div key={m.id} style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 12, overflow: "hidden" }}>
                  {m.media_type === "video" ? (
                    <video src={m.url} controls playsInline preload="metadata" style={{ width: "100%", maxHeight: 230, background: "#000", display: "block" }} />
                  ) : (
                    <img src={m.url} alt={m.title || issue.title} loading="lazy" style={{ width: "100%", maxHeight: 230, objectFit: "cover", display: "block" }} />
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        <button
          onClick={() =>
            window.open(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(issue.video)}`,
              "_blank"
            )
          }
          className="w-full flex items-center justify-center gap-2"
          style={{
            background: C.amber,
            border: "none",
            borderRadius: 12,
            padding: "13px 16px",
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          <PlayCircle size={18} color={C.asphalt} />
          <span style={{ color: C.asphalt, fontSize: 14, fontWeight: 700 }}>{t.watchVideo}</span>
        </button>

        {onRequestQuote && (
          <button
            onClick={() => onRequestQuote(issue)}
            className="w-full flex items-center justify-center gap-2"
            style={{
              background: "transparent",
              border: `1.5px solid ${C.blue}`,
              borderRadius: 12,
              padding: "13px 16px",
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            <MapPin size={18} color={C.blue} />
            <span style={{ color: C.blue, fontSize: 14, fontWeight: 700 }}>{t.requestQuoteBtn}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function GaragesView({ lang, t, country, setCountry, isRTL, quoteRequest, onClearQuote }) {
  const [showGarageForm, setShowGarageForm] = useState(false);
  const [dbGarages, setDbGarages] = useState([]);
  const data = GARAGES[country];
  useEffect(() => {
    let active = true;
    if (supabase) {
      supabase.from("garage_directory").select("*").eq("country", country).order("rank", { ascending: true }).order("created_at", { ascending: false })
        .then(({ data }) => { if (active) setDbGarages(data || []); });
    }
    return () => { active = false; };
  }, [country]);
  return (
    <div className="px-5 pt-5 pb-6">
      <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>
        {t.garagesHeading}
      </h1>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 14 }}>{t.garagesSub}</p>

      <div className="flex gap-2 mb-4">
        {Object.keys(GARAGES).map((code) => {
          const active = code === country;
          return (
            <button
              key={code}
              onClick={() => setCountry(code)}
              style={{
                flex: 1,
                border: `1px solid ${active ? C.amber : C.panelLine}`,
                background: active ? `${C.amber}18` : C.panel,
                color: active ? C.amber : C.creamDim,
                borderRadius: 10,
                padding: "9px 6px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {GARAGES[code][lang]}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setShowGarageForm(true)}
        className="w-full flex items-center justify-center gap-2 mb-4"
        style={{
          background: C.amber,
          border: "none",
          borderRadius: 12,
          padding: "12px 16px",
          cursor: "pointer",
        }}
      >
        <Plus size={16} color={C.asphalt} strokeWidth={2.5} />
        <span style={{ color: C.asphalt, fontSize: 13.5, fontWeight: 700 }}>{t.addGarageBtn}</span>
      </button>

      <div
        className="flex items-start gap-2 mb-4"
        style={{
          background: `${C.blue}14`,
          border: `1px solid ${C.blue}44`,
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <Info size={14} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
        <span style={{ color: C.creamDim, fontSize: 11.5, lineHeight: 1.5 }}>{t.garagesNote}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {data.list.map((g, i) => (
          <button
            key={i}
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${g.name} ${g.area.en} ${data.en}`
                )}`,
                "_blank"
              )
            }
            className="w-full"
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 14,
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: isRTL ? "right" : "left",
              display: "block",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span style={{ color: C.cream, fontSize: 14, fontWeight: 700 }}>{g.name}</span>
              <MapPin size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            </div>
            <div style={{ color: C.amberDim, fontSize: 11.5, marginTop: 3, fontWeight: 600 }}>
              {g.area[lang]}
            </div>
            <div style={{ color: C.creamDim, fontSize: 12.5, marginTop: 5, lineHeight: 1.5 }}>
              {g.note[lang]}
            </div>
            <div style={{ color: C.blue, fontSize: 11, marginTop: 7, fontWeight: 600 }}>
              {t.openInMaps}
            </div>
          </button>
        ))}
        {dbGarages.map((g) => (
          <button key={g.id} onClick={() => window.open(g.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.garage_name + " " + g.address)}`, "_blank")} className="w-full" style={{ background:C.panel, border:`1px solid ${C.panelLine}`, borderRadius:14, overflow:"hidden", padding:0, cursor:"pointer", textAlign:isRTL?"right":"left", display:"block" }}>
            {g.photo_url && <img src={g.photo_url} alt={g.garage_name} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
            <div style={{padding:"14px 16px"}}>
              <div className="flex items-start justify-between gap-2"><span style={{color:C.cream,fontSize:14,fontWeight:700}}>{g.garage_name}</span><MapPin size={15} color={C.amber} /></div>
              <div style={{color:C.amberDim,fontSize:11.5,marginTop:3,fontWeight:600}}>{g.address}</div>
              <div style={{color:C.blue,fontSize:11,marginTop:7,fontWeight:600}}>{t.openInMaps}</div>
            </div>
          </button>
        ))}

      </div>

      <GarageListingForm
        isOpen={showGarageForm}
        onClose={() => setShowGarageForm(false)}
      />
    </div>
  );
}

function SparePartsView({ lang, t, country, setCountry, isRTL }) {
  const data = SPARE_PARTS[country] || SPARE_PARTS.uae;
  const partsCountryCode = SPARE_PARTS[country] ? country : "uae";
  return (
    <div className="px-5 pt-5 pb-6">
      <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>
        {t.partsHeading}
      </h1>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 14 }}>{t.partsSub}</p>

      <div className="flex gap-2 mb-4">
        {Object.keys(SPARE_PARTS).map((code) => {
          const active = code === partsCountryCode;
          return (
            <button
              key={code}
              onClick={() => setCountry(code)}
              style={{
                flex: 1,
                border: `1px solid ${active ? C.amber : C.panelLine}`,
                background: active ? `${C.amber}18` : C.panel,
                color: active ? C.amber : C.creamDim,
                borderRadius: 10,
                padding: "9px 6px",
                fontSize: 11.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {SPARE_PARTS[code][lang]}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-start gap-2 mb-4"
        style={{
          background: `${C.blue}14`,
          border: `1px solid ${C.blue}44`,
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <Info size={14} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
        <span style={{ color: C.creamDim, fontSize: 11.5, lineHeight: 1.5 }}>{t.partsNote}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {data.list.map((p, i) => (
          <button
            key={i}
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${p.name} ${p.area.en} ${data.en}`
                )}`,
                "_blank"
              )
            }
            className="w-full"
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 14,
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: isRTL ? "right" : "left",
              display: "block",
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span style={{ color: C.cream, fontSize: 14, fontWeight: 700 }}>{p.name}</span>
              <MapPin size={15} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            </div>
            <div style={{ color: C.amberDim, fontSize: 11.5, marginTop: 3, fontWeight: 600 }}>
              {p.area[lang]}
            </div>
            <div style={{ color: C.creamDim, fontSize: 12.5, marginTop: 5, lineHeight: 1.5 }}>
              {p.note[lang]}
            </div>
            <div style={{ color: C.blue, fontSize: 11, marginTop: 7, fontWeight: 600 }}>
              {t.openInMaps}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

}

const MAINTENANCE_CENTERS = {
  uae: {
    en: "United Arab Emirates",
    ar: "الإمارات العربية المتحدة",
    list: [
      {
        name: "ADNOC Voyager Lube Change",
        area: { en: "200+ stations across the UAE", ar: "أكتر من ٢٠٠ محطة في الإمارات" },
        note: {
          en: "Drive-thru quick oil change with a free 12-point vehicle check",
          ar: "تغيير زيت سريع في الطابور بدون نزول من العربية، مع فحص مجاني من ١٢ نقطة",
        },
      },
      {
        name: "AutoPro (ENOC Group)",
        area: { en: "40+ locations across Dubai, Sharjah & Ras Al Khaimah", ar: "أكتر من ٤٠ فرع في دبي والشارقة ورأس الخيمة" },
        note: {
          en: "UAE's largest quick-service network — oil, tyres, battery & AC",
          ar: "أكبر شبكة صيانة سريعة في الإمارات، بتشمل الزيت والإطارات والبطارية والتكييف",
        },
      },
      {
        name: "Petromin Express",
        area: { en: "Branches across the UAE", ar: "فروع في مختلف إمارات الدولة" },
        note: {
          en: "Regional quick-service chain — multi-brand oil, battery, tyres & AC under one roof",
          ar: "سلسلة صيانة سريعة إقليمية، زيوت وبطاريات وإطارات وتكييف تحت سقف واحد",
        },
      },
    ],
  },
  ksa: {
    en: "Saudi Arabia",
    ar: "المملكة العربية السعودية",
    list: [
      {
        name: "Petromin Express",
        area: { en: "700+ stations nationwide", ar: "أكتر من ٧٠٠ محطة في كل أنحاء المملكة" },
        note: {
          en: "Saudi's largest professional quick-service network — oil, battery, tyres & AC",
          ar: "أكبر شبكة صيانة سريعة احترافية في السعودية، زيوت وبطاريات وإطارات وتكييف",
        },
      },
      {
        name: "Shell Helix Service Centers",
        area: { en: "Stations across the Kingdom", ar: "محطات في مختلف مناطق المملكة" },
        note: {
          en: "Branded quick oil-change service at Shell fuel stations",
          ar: "خدمة تغيير زيت سريعة بعلامة شل داخل محطات وقود شل",
        },
      },
      {
        name: "ADNOC Distribution",
        area: { en: "Service stations in the Eastern Province & other regions", ar: "محطات خدمة في المنطقة الشرقية ومناطق أخرى" },
        note: {
          en: "Oil-change and car-care services at ADNOC stations in KSA",
          ar: "خدمات تغيير زيت وعناية بالسيارة في محطات أدنوك بالمملكة",
        },
      },
    ],
  },
  egypt: {
    en: "Egypt",
    ar: "مصر",
    list: [
      {
        name: "TotalEnergies Quartz Auto Care",
        area: { en: "40+ centers nationwide", ar: "أكتر من ٤٠ مركز في جميع المحافظات" },
        note: {
          en: "Quick oil change with free lubricant inspection, plus tyres, battery & wheel alignment",
          ar: "تغيير زيت سريع مع فحص مجاني للتشحيم، وكمان إطارات وبطاريات وضبط زوايا",
        },
      },
      {
        name: "Petromin Express",
        area: { en: "Branches across Egypt", ar: "فروع في مختلف المحافظات" },
        note: {
          en: "Regional quick-service chain — multi-brand oil, battery, tyres & AC under one roof",
          ar: "سلسلة صيانة سريعة إقليمية، زيوت وبطاريات وإطارات وتكييف تحت سقف واحد",
        },
      },
      {
        name: "Nacita Auto Care",
        area: { en: "Multiple branches across Egypt", ar: "فروع متعددة في مصر" },
        note: {
          en: "Oil change and general car-care service centers",
          ar: "مراكز لتغيير الزيت والعناية العامة بالسيارة",
        },
      },
    ],
  },
};

function MaintenanceView({ lang, t, country, setCountry, isRTL }) {
  const [dbCenters, setDbCenters] = useState([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    if (supabase) {
      supabase.from("maintenance_centers").select("*").eq("country", country).eq("is_active", true).order("created_at", { ascending: true })
        .then(({ data }) => { if (active) { setDbCenters(data || []); setLoaded(true); } });
    }
    return () => { active = false; };
  }, [country]);
  const staticData = MAINTENANCE_CENTERS[country] || MAINTENANCE_CENTERS.uae;
  const items = loaded && dbCenters.length ? dbCenters : staticData.list.map((p, i) => ({ id: `static-${i}`, name_en: p.name, name_ar: p.name, area_en: p.area.en, area_ar: p.area.ar, note_en: p.note.en, note_ar: p.note.ar }));
  const countries = ["uae", "ksa", "egypt"];
  return (
    <div className="px-5 pt-5 pb-6">
      <h1 style={{ color:C.cream, fontSize:21, fontWeight:700, margin:0 }}>{t.maintenanceHeading}</h1>
      <p style={{ color:C.creamDim, fontSize:13, marginTop:4, marginBottom:14 }}>{t.maintenanceSub}</p>
      <div className="flex gap-2 mb-4">{countries.map(code => <button key={code} onClick={()=>setCountry(code)} style={{flex:1,border:`1px solid ${code===country?C.amber:C.panelLine}`,background:code===country?`${C.amber}18`:C.panel,color:code===country?C.amber:C.creamDim,borderRadius:10,padding:"9px 6px",fontSize:11.5,fontWeight:600}}>{MAINTENANCE_CENTERS[code][lang]}</button>)}</div>
      <div className="flex items-start gap-2 mb-4" style={{background:`${C.blue}14`,border:`1px solid ${C.blue}44`,borderRadius:10,padding:"10px 12px"}}><Info size={14} color={C.blue} style={{marginTop:2}}/><span style={{color:C.creamDim,fontSize:11.5,lineHeight:1.5}}>{t.maintenanceNote}</span></div>
      <div className="flex flex-col gap-2.5">
        {items.map(p => <button key={p.id} onClick={()=>window.open(p.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((lang==='ar'?p.name_ar:p.name_en)+" "+(lang==='ar'?p.area_ar:p.area_en))}`,"_blank")} className="w-full" style={{background:C.panel,border:`1px solid ${C.panelLine}`,borderRadius:14,overflow:"hidden",padding:0,cursor:"pointer",textAlign:isRTL?"right":"left",display:"block"}}>
          {p.photo_url && <img src={p.photo_url} alt={lang==='ar'?p.name_ar:p.name_en} style={{width:"100%",height:130,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
          <div style={{padding:"14px 16px"}}>
            <div className="flex items-start justify-between gap-2"><span style={{color:C.cream,fontSize:14,fontWeight:700}}>{lang==='ar'?p.name_ar:p.name_en}</span><MapPin size={15} color={C.amber}/></div>
            <div style={{color:C.amberDim,fontSize:11.5,marginTop:3,fontWeight:600}}>{lang==='ar'?p.area_ar:p.area_en}</div>
            <div style={{color:C.creamDim,fontSize:12.5,marginTop:5,lineHeight:1.5}}>{lang==='ar'?p.note_ar:p.note_en}</div>
            <div style={{color:C.blue,fontSize:11,marginTop:7,fontWeight:600}}>{t.openInMaps}</div>
          </div>
        </button>)}
      </div>
    </div>
  );
}

function CarDetailView({ lang, t, isRTL, car, onBack }) {
  const photos =
    car.photo_urls && car.photo_urls.length
      ? car.photo_urls
      : car.photo_url
      ? [car.photo_url]
      : [];
  const countryLabel = CAR_COUNTRIES.find((x) => x.code === car.country)?.[lang];

  return (
    <div className="pb-6">
      <BackHeader label={t.navCars} onBack={onBack} isRTL={isRTL} />

      {photos.length > 0 ? (
        <div
          className="flex gap-2 px-5 mb-4"
          style={{ overflowX: "auto", scrollSnapType: "x mandatory" }}
        >
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              style={{
                width: "85%",
                height: 220,
                objectFit: "cover",
                borderRadius: 14,
                flexShrink: 0,
                scrollSnapAlign: "start",
              }}
              onError={(e) => (e.target.style.opacity = 0.3)}
            />
          ))}
        </div>
      ) : null}

      <div className="px-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: 0 }}>
            {car.make_model} {car.year ? `· ${car.year}` : ""}
          </h2>
          <span style={{ color: C.amber, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
            {car.price}
          </span>
        </div>

        <div style={{ color: C.creamDim, fontSize: 12.5, marginBottom: 14 }}>
          {[car.city, countryLabel].filter(Boolean).join(" · ")}
          {car.mileage ? ` · ${car.mileage} km` : ""}
          {car.specs === "gulf" ? ` · ${t.carSpecsGulf}` : ""}
          {car.specs === "american" ? ` · ${t.carSpecsAmerican}` : ""}
        </div>

        {car.description && (
          <div
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 16,
            }}
          >
            <p style={{ color: C.creamDim, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              {car.description}
            </p>
          </div>
        )}

        {car.status === "sold" ? (
          <div
            className="w-full flex items-center justify-center gap-2"
            style={{
              background: `${C.red}18`,
              border: `1px solid ${C.red}66`,
              borderRadius: 12,
              padding: "13px 16px",
              boxSizing: "border-box",
            }}
          >
            <CheckCircle2 size={18} color={C.red} />
            <span style={{ color: C.red, fontSize: 14, fontWeight: 800 }}>{t.soldBadge}</span>
          </div>
        ) : (
          <button
            onClick={() =>
              window.open(`https://wa.me/${car.phone.replace(/[^0-9]/g, "")}`, "_blank")
            }
            className="w-full flex items-center justify-center gap-2"
            style={{
              background: C.amber,
              border: "none",
              borderRadius: 12,
              padding: "13px 16px",
              cursor: "pointer",
            }}
          >
            <MessageCircle size={18} color={C.asphalt} />
            <span style={{ color: C.asphalt, fontSize: 14, fontWeight: 700 }}>{t.carContact}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CarsView({ lang, t, isRTL, mode, onSubmitted, onBack }) {
  if (mode === "submitted") {
    return (
      <div className="px-5 pt-8 pb-6 text-center">
        <div
          className="flex items-center justify-center rounded-full mb-4"
          style={{
            width: 60,
            height: 60,
            background: `${C.amber}18`,
            border: `1px solid ${C.amberDim}`,
            margin: "0 auto 16px",
          }}
        >
          <Car size={26} color={C.amber} />
        </div>
        <p style={{ color: C.cream, fontSize: 14, lineHeight: 1.6, marginBottom: 18 }}>
          {t.carSubmitted}
        </p>
        <button
          onClick={onBack}
          style={{
            background: C.amber,
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            color: C.asphalt,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {t.navCars}
        </button>
      </div>
    );
  }

  return (
    <CarForm
      lang={lang}
      t={t}
      isRTL={isRTL}
      onClose={onBack}
      onSubmitted={onSubmitted}
    />
  );
}

/* ---------------------------------------------------------------
   Buy a car — browse & filter approved listings
--------------------------------------------------------------- */
const PRICE_RANGES = [
  { id: "u20k", min: 0, max: 20000 },
  { id: "20-50k", min: 20000, max: 50000 },
  { id: "50-100k", min: 50000, max: 100000 },
  { id: "100-200k", min: 100000, max: 200000 },
  { id: "o200k", min: 200000, max: null },
];
const YEAR_RANGES = [
  { id: "pre2015", min: null, max: 2014 },
  { id: "2015-2019", min: 2015, max: 2019 },
  { id: "2020-2022", min: 2020, max: 2022 },
  { id: "2023plus", min: 2023, max: null },
];
const MILEAGE_RANGES = [
  { id: "u20k", min: 0, max: 20000 },
  { id: "20-60k", min: 20000, max: 60000 },
  { id: "60-120k", min: 60000, max: 120000 },
  { id: "o120k", min: 120000, max: null },
];

function rangeLabel(r, lang, unit) {
  if (r.min == null) return lang === "ar" ? `أقل من ${r.max.toLocaleString()}${unit}` : `Under ${r.max.toLocaleString()}${unit}`;
  if (r.max == null) return lang === "ar" ? `أكتر من ${r.min.toLocaleString()}${unit}` : `Over ${r.min.toLocaleString()}${unit}`;
  return `${r.min.toLocaleString()} – ${r.max.toLocaleString()}${unit}`;
}

function inRange(value, range) {
  if (!range) return true;
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  if (range.min != null && n < range.min) return false;
  if (range.max != null && n > range.max) return false;
  return true;
}

function BuyCarView({ lang, t, isRTL }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ country: "", make: "", model: "", price: "", year: "", mileage: "" });

  useEffect(() => {
    let active = true;
    let timer;
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError("");
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Car listings request timed out")), 10000);
      });
      try {
        const query = supabase
          .from("car_listings")
          .select("*")
          .in("status", ["approved", "sold"])
          .order("created_at", { ascending: false });
        const { data, error } = await Promise.race([query, timeout]);
        if (!active) return;
        if (error) throw error;
        setListings(data || []);
      } catch (err) {
        if (active) {
          setListings([]);
          setLoadError(err?.message || "Could not load car listings.");
        }
      } finally {
        clearTimeout(timer);
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  if (selected) {
    return <CarDetailView lang={lang} t={t} isRTL={isRTL} car={selected} onBack={() => setSelected(null)} />;
  }

  const modelOptions = filters.make && filters.make !== "Other" ? CAR_MODELS[filters.make] || [] : [];
  const priceRange = PRICE_RANGES.find((r) => r.id === filters.price);
  const yearRange = YEAR_RANGES.find((r) => r.id === filters.year);
  const mileageRange = MILEAGE_RANGES.find((r) => r.id === filters.mileage);

  const filtered = listings.filter((c) => {
    if (filters.country && c.country !== filters.country) return false;
    if (filters.make && !(c.make_model || "").toLowerCase().startsWith(filters.make.toLowerCase())) return false;
    if (filters.model && !(c.make_model || "").toLowerCase().includes(filters.model.toLowerCase())) return false;
    if (priceRange && !inRange(c.price, priceRange)) return false;
    if (yearRange && !inRange(c.year, yearRange)) return false;
    if (mileageRange && !inRange(c.mileage, mileageRange)) return false;
    return true;
  });

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const selectStyle = {
    background: C.panel,
    border: `1px solid ${C.panelLine}`,
    borderRadius: 10,
    padding: "9px 10px",
    color: C.cream,
    fontSize: 12.5,
    width: "100%",
  };

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>{t.buyCarHeading}</h1>
      </div>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 14 }}>{t.buyCarSub}</p>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <span style={{ color: C.creamDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterCountry}</span>
          <select
            style={selectStyle}
            value={filters.country}
            onChange={(e) => setFilters((f) => ({ ...f, country: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {CAR_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c[lang]}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.creamDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterMake}</span>
          <select
            style={selectStyle}
            value={filters.make}
            onChange={(e) => setFilters((f) => ({ ...f, make: e.target.value, model: "" }))}
          >
            <option value="">{t.filterAll}</option>
            {CAR_MAKES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.creamDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterModel}</span>
          <select
            style={selectStyle}
            value={filters.model}
            disabled={!modelOptions.length}
            onChange={(e) => setFilters((f) => ({ ...f, model: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.creamDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterPrice}</span>
          <select
            style={selectStyle}
            value={filters.price}
            onChange={(e) => setFilters((f) => ({ ...f, price: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {PRICE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{rangeLabel(r, lang, "")}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.creamDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterYear}</span>
          <select
            style={selectStyle}
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {YEAR_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{rangeLabel(r, lang, "")}</option>
            ))}
          </select>
        </div>
        <div>
          <span style={{ color: C.creamDim, fontSize: 10.5, fontWeight: 700, display: "block", marginBottom: 3 }}>{t.filterMileage}</span>
          <select
            style={selectStyle}
            value={filters.mileage}
            onChange={(e) => setFilters((f) => ({ ...f, mileage: e.target.value }))}
          >
            <option value="">{t.filterAll}</option>
            {MILEAGE_RANGES.map((r) => (
              <option key={r.id} value={r.id}>{rangeLabel(r, lang, " km")}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => setFilters({ country: "", make: "", model: "", price: "", year: "", mileage: "" })}
          style={{ background: "none", border: "none", color: C.blue, fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: "4px 0", marginBottom: 10 }}
        >
          {t.filterClear}
        </button>
      )}

      {!supabase ? (
        <div
          className="flex items-start gap-2"
          style={{ background: `${C.blue}14`, border: `1px solid ${C.blue}44`, borderRadius: 10, padding: "10px 12px", marginTop: 8 }}
        >
          <Info size={14} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: C.creamDim, fontSize: 11.5, lineHeight: 1.5 }}>{t.carNoDb}</span>
        </div>
      ) : loading ? (
        <p style={{ color: C.creamDim, fontSize: 13, textAlign: "center", marginTop: 20 }}>{t.carLoading}</p>
      ) : loadError ? (
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <p style={{ color: C.red, fontSize: 13, marginBottom: 10 }}>
            {lang === "ar" ? "تعذر تحميل السيارات حاليًا." : "Could not load car listings right now."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: C.amber, border: "none", borderRadius: 10, padding: "9px 14px", color: C.asphalt, fontWeight: 700, cursor: "pointer" }}
          >
            {lang === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: C.creamDim, fontSize: 13, textAlign: "center", marginTop: 20 }}>
          {listings.length === 0 ? t.carEmpty : t.filterNoResults}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5" style={{ marginTop: 6 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              style={{
                background: C.panel,
                border: `1px solid ${C.panelLine}`,
                borderRadius: 14,
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              {(c.photo_url || (c.photo_urls && c.photo_urls[0])) && (
                <div style={{ position: "relative" }}>
                  <img
                    src={c.photo_url || c.photo_urls[0]}
                    alt={c.make_model}
                    style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                  {c.status === "sold" && (
                    <div
                      aria-label={t.soldBadge}
                      style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%) rotate(-12deg)",
                        border: `3px solid ${C.red}`, color: C.red,
                        background: "rgba(10,11,13,0.78)", borderRadius: 10,
                        padding: "7px 18px", fontSize: 21, fontWeight: 900,
                        letterSpacing: 2, textTransform: lang === "en" ? "uppercase" : "none",
                        whiteSpace: "nowrap", zIndex: 3, pointerEvents: "none",
                      }}
                    >
                      {t.soldBadge}
                    </div>
                  )}
                  {c.photo_urls && c.photo_urls.length > 1 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        insetInlineEnd: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: C.cream,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 999,
                      }}
                    >
                      +{c.photo_urls.length - 1}
                    </span>
                  )}
                </div>
              )}
              <div style={{ padding: "12px 14px" }}>
                {c.status === "sold" && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: `${C.red}18`,
                      border: `1px solid ${C.red}66`,
                      color: C.red,
                      borderRadius: 999,
                      padding: "3px 8px",
                      fontSize: 10.5,
                      fontWeight: 800,
                      marginBottom: 7,
                    }}
                  >
                    <CheckCircle2 size={12} />
                    {t.soldBadge}
                  </div>
                )}
                <div className="flex items-start justify-between gap-2">
                  <span style={{ color: C.cream, fontSize: 14.5, fontWeight: 700 }}>
                    {c.make_model} {c.year ? `· ${c.year}` : ""}
                  </span>
                  <span style={{ color: C.amber, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {c.price}
                  </span>
                </div>
                <div style={{ color: C.creamDim, fontSize: 11.5, marginTop: 3 }}>
                  {[c.city, CAR_COUNTRIES.find((x) => x.code === c.country)?.[lang]]
                    .filter(Boolean)
                    .join(" · ")}
                  {c.mileage ? ` · ${c.mileage} km` : ""}
                  {c.specs === "gulf" ? ` · ${t.carSpecsGulf}` : ""}
                  {c.specs === "american" ? ` · ${t.carSpecsAmerican}` : ""}
                </div>
                {c.description && (
                  <p style={{ color: C.creamDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                )}
                {c.status === "sold" ? (
                  <div
                    className="flex items-center justify-center gap-2 mt-3"
                    style={{
                      width: "100%",
                      background: `${C.red}12`,
                      border: `1px solid ${C.red}55`,
                      borderRadius: 10,
                      padding: "8px 12px",
                    }}
                  >
                    <CheckCircle2 size={14} color={C.red} />
                    <span style={{ color: C.red, fontSize: 12.5, fontWeight: 700 }}>
                      {t.soldBadge}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`, "_blank");
                    }}
                    className="flex items-center justify-center gap-2 mt-3"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: `1px solid ${C.amberDim}`,
                      borderRadius: 10,
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                  >
                    <MessageCircle size={14} color={C.amber} />
                    <span style={{ color: C.amber, fontSize: 12.5, fontWeight: 600 }}>
                      {t.carContact}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Admin car listing management
--------------------------------------------------------------- */
function AdminCarsView({ lang, t, isRTL, onBack }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("karajy_admin_remember") === "1");
  const [tab, setTab] = useState("cars");
  const [cars, setCars] = useState([]);
  const [garageRequests, setGarageRequests] = useState([]);
  const [photoRequests, setPhotoRequests] = useState([]);
  const [adminGarages, setAdminGarages] = useState([]);
  const [maintenanceCenters, setMaintenanceCenters] = useState([]);
  const [garageForm, setGarageForm] = useState({ garage_name: "", owner_name: "", phone: "", address: "", country: "uae", rank: 0, photo_url: "" });
  const [garagePhotoFile, setGaragePhotoFile] = useState(null);
  const [maintenancePhotoFile, setMaintenancePhotoFile] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({ country: "uae", name_en: "", name_ar: "", area_en: "", area_ar: "", note_en: "", note_ar: "", map_link: "" });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaIssueId, setMediaIssueId] = useState(Object.keys(ISSUES)[0] || "");
  const [mediaLang, setMediaLang] = useState(lang);
  const [issueMedia, setIssueMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [generatedCodes, setGeneratedCodes] = useState({});

  useEffect(() => {
    if (!supabase) {
      setChecking(false);
      return;
    }
    let active = true;
    async function verifySession() {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user || null;
      if (!currentUser) {
        if (active) {
          setUser(null);
          setChecking(false);
        }
        return;
      }
      // Remember-me controls whether the admin session survives a full reload.
      // Without the flag, an existing Supabase session from a previous visit is cleared.
      const remembered = localStorage.getItem("karajy_admin_remember") === "1";
      const currentVisit = sessionStorage.getItem("karajy_admin_session") === "1";
      if (!remembered && !currentVisit) {
        await supabase.auth.signOut();
        if (active) {
          setUser(null);
          setChecking(false);
        }
        return;
      }
      const { data: adminData, error: adminError } = await supabase.rpc("is_car_admin");
      if (!adminError && adminData === true) {
        if (active) {
          setUser(currentUser);
          setChecking(false);
        }
        return;
      }
      // Do NOT log the admin out just because the permission RPC has a
      // transient/network/database error. Only an explicit false means the
      // authenticated account is not an admin.
      if (adminError) {
        if (active) {
          setUser(currentUser);
          setLoginError(adminError.message || t.adminInvalid);
          setChecking(false);
        }
        return;
      }
      // Never sign the user out during a background permission check.
      // The server-side RPCs still enforce admin permissions for every mutation.
      if (active) {
        setUser(currentUser);
        setLoginError(t.adminInvalid);
        setChecking(false);
      }
    }
    verifySession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      setTimeout(() => verifySession(), 0);
    });
    return () => {
      active = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function loadAll() {
    if (!supabase || !user) return;
    setLoading(true);
    const [carsRes, garagesRes, photosRes, adminGaragesRes, maintenanceRes, mediaRes] = await Promise.all([
      supabase.from("car_listings").select("*").in("status", ["approved", "sold"]).order("created_at", { ascending: false }),
      supabase.rpc("get_garage_admin_requests"),
      supabase.rpc("get_photo_diagnosis_requests"),
      supabase.from("garage_listings").select("*").eq("status", "approved").order("created_at", { ascending: false }),
      supabase.from("maintenance_centers").select("*").order("country").order("created_at", { ascending: false }),
      supabase.from("issue_media").select("*").order("sort_order").order("created_at", { ascending: false }),
    ]);
    if (carsRes.error) setLoginError(carsRes.error.message);
    if (garagesRes.error) setLoginError(garagesRes.error.message);
    if (photosRes.error) setLoginError(photosRes.error.message);
    if (adminGaragesRes.error) setLoginError(adminGaragesRes.error.message);
    if (maintenanceRes.error) setLoginError(maintenanceRes.error.message);
    if (mediaRes.error) setLoginError(mediaRes.error.message);
    setCars(carsRes.data || []);
    setGarageRequests(garagesRes.data || []);
    setPhotoRequests(photosRes.data || []);
    setAdminGarages(adminGaragesRes.data || []);
    setMaintenanceCenters(maintenanceRes.data || []);
    setIssueMedia(mediaRes.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (user) loadAll();
  }, [user]);

  async function handleLogin(e) {
    e.preventDefault();
    if (!supabase) return;
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
      return;
    }
    const { data: adminData, error: adminError } = await supabase.rpc("is_car_admin");
    if (adminError) {
      setLoginError(adminError.message || t.adminInvalid);
      setUser(data?.user || null);
      return;
    }
    if (adminData !== true) {
      await supabase.auth.signOut();
      setLoginError(t.adminInvalid);
      return;
    }
    if (rememberMe) {
      localStorage.setItem("karajy_admin_remember", "1");
      sessionStorage.removeItem("karajy_admin_session");
    } else {
      localStorage.removeItem("karajy_admin_remember");
      sessionStorage.setItem("karajy_admin_session", "1");
    }
    setUser(data?.user || null);
  }

  async function updateCarStatus(car, nextStatus) {
    if (!supabase || !user) return;
    setBusyId(car.id);
    const { error } = await supabase
      .from("car_listings")
      .update({ status: nextStatus, sold_at: nextStatus === "sold" ? new Date().toISOString() : null })
      .eq("id", car.id);
    setBusyId(null);
    if (error) {
      setLoginError(t.adminUpdateError);
      return;
    }
    await loadAll();
  }

  function carPhotoStoragePath(url) {
    if (!url) return null;
    const marker = "/car-photos/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
  }

  async function deleteCar(car) {
    if (!supabase || !user) return;
    const ok = window.confirm(lang === "ar" ? "متأكد إنك عايز تمسح إعلان السيارة ده نهائيًا؟" : "Permanently delete this car listing?");
    if (!ok) return;
    setBusyId(car.id);
    setLoginError("");
    const { data, error } = await supabase.rpc("admin_delete_car", { p_id: car.id });
    if (error) {
      setBusyId(null);
      setLoginError(error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    const urls = new Set();
    if (row?.photo_url) urls.add(row.photo_url);
    if (Array.isArray(row?.photo_urls)) row.photo_urls.forEach((u) => u && urls.add(u));
    const paths = [...urls].map(carPhotoStoragePath).filter(Boolean);
    if (paths.length) {
      await supabase.storage.from("car-photos").remove(paths);
    }
    setBusyId(null);
    await loadAll();
  }

  async function updateGarageStatus(item, nextStatus) {
    if (!supabase || !user) return;
    setBusyId(item.id);
    const { error } = await supabase.rpc("set_garage_status", {
      p_id: item.id,
      p_status: nextStatus,
    });
    setBusyId(null);
    if (error) {
      setLoginError(error.message);
      return;
    }
    await loadAll();
  }

  async function approvePhoto(item) {
    if (!supabase || !user) return;
    setBusyId(item.id);
    setLoginError("");
    const { data, error } = await supabase.rpc("generate_photo_credit_code", {
      p_request_id: item.id,
    });
    setBusyId(null);
    if (error) {
      setLoginError(error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.code) {
      setGeneratedCodes((prev) => ({ ...prev, [item.id]: row.code }));
    }
    await loadAll();
  }

  async function rejectPhoto(item) {
    if (!supabase || !user) return;
    const ok = window.confirm(lang === "ar" ? "هل تريد رفض وحذف طلب شراء الرصيد نهائيًا؟" : "Decline and permanently delete this photo diagnosis request?");
    if (!ok) return;
    setBusyId(item.id);
    setLoginError("");
    const { error } = await supabase.rpc("set_photo_diagnosis_status", {
      p_request_id: item.id,
      p_status: "rejected",
    });
    setBusyId(null);
    if (error) {
      setLoginError(error.message);
      return;
    }
    setGeneratedCodes((prev) => { const next = { ...prev }; delete next[item.id]; return next; });
    await loadAll();
  }

  function openWhatsApp(phone, code, credits) {
    if (!phone || !code) return;
    const clean = String(phone).replace(/[^\d]/g, "");
    const msg = encodeURIComponent(
      `كود كراجي لتشخيص الصور: ${code}\nالرصيد: ${credits} تشخيص\nاستخدم الكود داخل قسم تشخيص بالصور في تطبيق كراجي.`
    );
    window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
  }

  async function uploadAdminPhoto(file, prefix) {
    if (!file) return null;
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : "jpg";
    const fileName = `admin/${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.${safeExt}`;
    const { error: uploadError } = await supabase.storage.from("garage-photos").upload(fileName, file, { upsert: false });
    if (uploadError) throw uploadError;
    return supabase.storage.from("garage-photos").getPublicUrl(fileName).data.publicUrl;
  }

  async function addAdminGarage() {
    if (!supabase || !user) return;
    setLoginError("");
    setBusyId("new-garage");
    try {
      const f = garageForm;
      if (!f.garage_name.trim() || !f.address.trim()) throw new Error(lang === "ar" ? "اكتب اسم الجراج والعنوان أولاً." : "Enter the garage name and address first.");
      const uploadedPhotoUrl = await uploadAdminPhoto(garagePhotoFile, "garage");
      const { error } = await supabase.rpc("admin_create_garage", {
        p_garage_name: f.garage_name, p_owner_name: f.owner_name, p_phone: f.phone, p_address: f.address,
        p_country: f.country, p_lat: null, p_lng: null, p_map_link: null, p_rank: Number(f.rank), p_photo_url: uploadedPhotoUrl || f.photo_url || null
      });
      if (error) throw error;
      setGarageForm({ garage_name: "", owner_name: "", phone: "", address: "", country: "uae", rank: 0, photo_url: "" });
      setGaragePhotoFile(null);
      await loadAll();
    } catch (error) {
      setLoginError(error?.message || t.adminUpdateError);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteAdminGarage(id) {
    if (!supabase || !user || !window.confirm(lang === "ar" ? "حذف هذا الجراج؟" : "Delete this garage?")) return;
    setBusyId(id);
    const { error } = await supabase.rpc("admin_delete_garage", { p_id: id });
    setBusyId(null);
    if (error) { setLoginError(error.message); return; }
    await loadAll();
  }

  async function addMaintenanceCenter() {
    if (!supabase || !user) return;
    setLoginError("");
    setBusyId("new-maintenance");
    try {
      const f = maintenanceForm;
      if (!f.name_en.trim() && !f.name_ar.trim()) throw new Error(lang === "ar" ? "اكتب اسم مركز الصيانة." : "Enter the maintenance center name.");
      const uploadedPhotoUrl = await uploadAdminPhoto(maintenancePhotoFile, "maintenance");
      const { error } = await supabase.rpc("admin_create_maintenance", {
        p_country: f.country, p_name_en: f.name_en, p_name_ar: f.name_ar, p_area_en: f.area_en, p_area_ar: f.area_ar,
        p_note_en: f.note_en, p_note_ar: f.note_ar, p_map_link: f.map_link || null, p_photo_url: uploadedPhotoUrl || null
      });
      if (error) throw error;
      setMaintenanceForm({ country: "uae", name_en: "", name_ar: "", area_en: "", area_ar: "", note_en: "", note_ar: "", map_link: "" });
      setMaintenancePhotoFile(null);
      await loadAll();
    } catch (error) {
      setLoginError(error?.message || t.adminUpdateError);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMaintenanceCenter(id) {
    if (!supabase || !user || !window.confirm(lang === "ar" ? "حذف مركز الصيانة؟" : "Delete this maintenance center?")) return;
    setBusyId(id);
    const { error } = await supabase.rpc("admin_delete_maintenance", { p_id: id });
    setBusyId(null);
    if (error) { setLoginError(error.message); return; }
    await loadAll();
  }

  async function compressImageForUpload(file) {
    if (!file || !file.type.startsWith("image/")) return file;
    const img = new Image();
    const url = URL.createObjectURL(file);
    try {
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
      const max = 1280;
      const scale = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
      canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.78));
      if (!blob) return file;
      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
    } finally { URL.revokeObjectURL(url); }
  }

  async function compressVideoForUpload(file) {
    if (!file || !file.type.startsWith("video/") || file.size <= 4 * 1024 * 1024) return file;
    if (typeof MediaRecorder === "undefined") return file;
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    const src = URL.createObjectURL(file);
    video.src = src;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });
    if (Number.isFinite(video.duration) && video.duration > 30) {
      URL.revokeObjectURL(src);
      throw new Error(lang === "ar" ? "الفيديو يجب ألا يتجاوز 30 ثانية." : "Video must be 30 seconds or less.");
    }
    if (!video.captureStream || !HTMLCanvasElement.prototype.captureStream) {
      URL.revokeObjectURL(src);
      return file;
    }
    const scale = Math.min(1, 854 / Math.max(video.videoWidth || 854, video.videoHeight || 480));
    const width = Math.max(320, Math.round((video.videoWidth || 854) * scale));
    const height = Math.max(180, Math.round((video.videoHeight || 480) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const canvasStream = canvas.captureStream(24);
    const sourceStream = video.captureStream();
    sourceStream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
    const mimeCandidates = ["video/webm;codecs=vp8,opus", "video/webm"];
    const mimeType = mimeCandidates.find((m) => MediaRecorder.isTypeSupported(m)) || "";
    const chunks = [];
    const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType, videoBitsPerSecond: 700000 } : undefined);
    recorder.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
    const stopped = new Promise((resolve) => { recorder.onstop = resolve; });
    let raf = 0;
    const draw = () => {
      if (video.ended || video.paused) return;
      ctx.drawImage(video, 0, 0, width, height);
      raf = requestAnimationFrame(draw);
    };
    await video.play();
    recorder.start(250);
    draw();
    await new Promise((resolve) => setTimeout(resolve, Math.min(30000, Math.max(1000, video.duration * 1000 + 100))));
    cancelAnimationFrame(raf);
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    sourceStream.getTracks().forEach((track) => track.stop());
    canvasStream.getTracks().forEach((track) => track.stop());
    video.pause();
    URL.revokeObjectURL(src);
    const blob = new Blob(chunks, { type: mimeType || "video/webm" });
    if (!blob.size || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}.webm`, { type: blob.type || "video/webm" });
  }

  async function addIssueMedia() {
    if (!supabase || !user || !mediaFile || !mediaIssueId) return;
    setBusyId("new-media");
    setLoginError("");
    try {
      let file = mediaFile;
      if (file.type.startsWith("video/")) {
        const probe = document.createElement("video");
        const probeUrl = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          probe.onloadedmetadata = resolve;
          probe.onerror = reject;
          probe.src = probeUrl;
        });
        URL.revokeObjectURL(probeUrl);
        if (Number.isFinite(probe.duration) && probe.duration > 30) throw new Error(lang === "ar" ? "الفيديو يجب ألا يتجاوز 30 ثانية." : "Video must be 30 seconds or less.");
        file = await compressVideoForUpload(file);
        if (file.size > 8 * 1024 * 1024) throw new Error(lang === "ar" ? "الفيديو بعد الضغط ما زال أكبر من 8 ميجابايت. استخدم فيديو أقصر أو بجودة 480p." : "The video is still larger than 8 MB after compression. Use a shorter 480p video.");
      } else if (file.type.startsWith("image/")) {
        file = await compressImageForUpload(file);
      } else {
        throw new Error(lang === "ar" ? "اختر صورة أو فيديو فقط." : "Choose an image or video only.");
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || (file.type.startsWith("video/") ? "mp4" : "jpg");
      const path = `issues/${mediaIssueId}/${mediaLang}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("fault-media").upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      const url = supabase.storage.from("fault-media").getPublicUrl(path).data.publicUrl;
      const { error } = await supabase.from("issue_media").insert({
        issue_id: mediaIssueId, lang: mediaLang, media_type: file.type.startsWith("video/") ? "video" : "image",
        url, title: ISSUES[mediaIssueId]?.[mediaLang]?.title || null, file_size_bytes: file.size, sort_order: 0, is_active: true
      });
      if (error) throw error;
      setMediaFile(null);
      await loadAll();
    } catch (error) {
      setLoginError(error?.message || t.adminUpdateError);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteIssueMedia(item) {
    if (!supabase || !user || !window.confirm(lang === "ar" ? "حذف هذه الصورة/الفيديو؟" : "Delete this photo/video?")) return;
    setBusyId(item.id);
    const { error } = await supabase.from("issue_media").delete().eq("id", item.id);
    setBusyId(null);
    if (error) { setLoginError(error.message); return; }
    await loadAll();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    localStorage.removeItem("karajy_admin_remember");
    sessionStorage.removeItem("karajy_admin_session");
    setUser(null);
    setCars([]);
    setGarageRequests([]);
    setPhotoRequests([]);
    setAdminGarages([]);
    setMaintenanceCenters([]);
    setIssueMedia([]);
  }

  const fieldStyle = {
    width: "100%",
    background: C.asphalt,
    border: `1px solid ${C.panelLine}`,
    borderRadius: 10,
    padding: "11px 12px",
    color: C.cream,
    fontSize: 13,
    marginBottom: 10,
    fontFamily: "inherit",
    textAlign: isRTL ? "right" : "left",
    boxSizing: "border-box",
  };

  if (checking) {
    return <div className="px-5 pt-8 text-center" style={{ color: C.creamDim }}>{t.adminLoading}</div>;
  }

  if (!user) {
    return (
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={24} color={C.amber} />
          <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>{t.adminTitle}</h1>
        </div>
        <p style={{ color: C.creamDim, fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
          {t.adminLoginRequired}
        </p>
        <form onSubmit={handleLogin}>
          <input type="email" autoComplete="username" placeholder={t.adminEmail} value={email}
            onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
          <input type="password" autoComplete="current-password" placeholder={t.adminPassword} value={password}
            onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: C.creamDim, fontSize: 12, margin: "2px 0 12px", cursor: "pointer" }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: C.amber }} />
            <span>{t.adminRememberMe}</span>
          </label>
          {loginError && <p style={{ color: C.red, fontSize: 12, lineHeight: 1.5 }}>{loginError}</p>}
          <button type="submit" style={{ width: "100%", background: C.amber, border: "none", borderRadius: 10, padding: "12px 14px", color: C.asphalt, fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
            {t.adminLogin}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} color={C.amber} />
          <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>{t.adminTitle}</h1>
        </div>
        <button onClick={logout} style={{ background: "transparent", border: `1px solid ${C.panelLine}`, color: C.creamDim, borderRadius: 9, padding: "7px 9px", cursor: "pointer" }}>
          <LogOut size={15} />
        </button>
      </div>

      <p style={{ color: C.creamDim, fontSize: 12, marginTop: 4, marginBottom: 14 }}>
        {t.adminManageSubtitle}
      </p>

      {loginError && <p style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{loginError}</p>}

      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ paddingBottom: 3 }}>
        {[
          ["cars", t.adminCarsTab, cars.length],
          ["manageGarages", t.adminManageGaragesTab, adminGarages.length],
          ["maintenance", t.adminMaintenanceTab, maintenanceCenters.length],
          ["media", t.adminMediaTab, issueMedia.length],
        ].map(([id, label, count]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ minWidth: 105, background: tab === id ? C.amber : C.panel, color: tab === id ? C.asphalt : C.cream, border: `1px solid ${tab === id ? C.amber : C.panelLine}`, borderRadius: 10, padding: "9px 7px", fontSize: 10.5, fontWeight: 800 }}>
            {label}<br /><span style={{ fontSize: 9, opacity: .8 }}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: C.creamDim, fontSize: 13, textAlign: "center" }}>{t.adminLoadingRequests}</p>
      ) : tab === "photo" ? (
        <div className="flex flex-col gap-2.5">
          {photoRequests.length === 0 && <p style={{ color: C.creamDim, textAlign: "center", fontSize: 13 }}>{t.adminNoPhotoRequests}</p>}
          {photoRequests.map((p) => {
            const code = generatedCodes[p.id] || p.generated_code;
            return (
              <div key={p.id} style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 14, padding: 12 }}>
                <div style={{ color: C.cream, fontWeight: 800, fontSize: 14 }}>{t.adminPhotoRequest}</div>
                <div style={{ color: C.creamDim, fontSize: 12, marginTop: 5 }}>WhatsApp: {p.whatsapp_number}</div>
                <div style={{ color: C.creamDim, fontSize: 12 }}>{t.adminPackage}: {p.package_credits} {t.adminDiagnosis} — {p.package_price} AED</div>
                <div style={{ color: p.status === "approved" ? "#7BC67B" : p.status === "rejected" ? "#F06A5F" : C.amber, fontSize: 11, fontWeight: 800, marginTop: 4 }}>
                  {t.adminStatus}: {p.status}
                </div>
                {p.receipt_url && (
                  <a href={p.receipt_url} target="_blank" rel="noreferrer"
                    style={{ display: "block", color: C.blue, fontSize: 12, marginTop: 8 }}>
                    {t.adminViewReceipt}
                  </a>
                )}
                {code && (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: C.asphalt, border: `1px solid ${C.amber}55` }}>
                    <div style={{ color: C.creamDim, fontSize: 11 }}>{t.adminCreditCode}</div>
                    <div dir="ltr" style={{ color: C.amber, fontSize: 18, fontWeight: 900, letterSpacing: 1.2 }}>{code}</div>
                    <button onClick={() => openWhatsApp(p.whatsapp_number, code, p.package_credits)}
                      style={{ width: "100%", marginTop: 8, background: C.amber, color: C.asphalt, border: "none", borderRadius: 8, padding: 9, fontWeight: 800 }}>
                      {t.adminSendCode}
                    </button>
                  </div>
                )}
                {!code && p.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button disabled={busyId === p.id} onClick={() => approvePhoto(p)}
                      style={{ flex: 1, background: C.amber, color: C.asphalt, border: "none", borderRadius: 9, padding: 10, fontWeight: 900 }}>
                      {busyId === p.id ? t.adminApproving : t.adminApproveGenerate}
                    </button>
                    <button disabled={busyId === p.id} onClick={() => rejectPhoto(p)}
                      style={{ flex: 1, background: "transparent", color: "#F06A5F", border: "1px solid #F06A5F66", borderRadius: 9, padding: 10, fontWeight: 900 }}>
                      {t.adminReject}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : tab === "garage" ? (
        <div className="flex flex-col gap-2.5">
          {garageRequests.length === 0 && <p style={{ color: C.creamDim, textAlign: "center", fontSize: 13 }}>{t.adminNoGarageRequests}</p>}
          {garageRequests.map((g) => (
            <div key={g.id} style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 14, overflow: "hidden" }}>
              {g.photo_url && <img src={g.photo_url} alt={g.garage_name} style={{ width: "100%", height: 130, objectFit: "cover" }} />}
              <div style={{ padding: 12 }}>
                <div style={{ color: C.cream, fontSize: 14, fontWeight: 800 }}>{g.garage_name}</div>
                <div style={{ color: C.creamDim, fontSize: 12, marginTop: 4 }}>{g.owner_name} · {g.phone}</div>
                <div style={{ color: C.creamDim, fontSize: 12 }}>{g.address}</div>
                <div style={{ color: C.amber, fontSize: 12, marginTop: 5 }}>{t.adminRank}: {g.rank} · {Number(g.price).toLocaleString()} {t.adminYear}</div>
                <div style={{ color: C.creamDim, fontSize: 11, marginTop: 4 }}>{t.adminStatus}: {g.status}</div>
                {g.receipt_url && <a href={g.receipt_url} target="_blank" rel="noreferrer" style={{ display: "block", color: C.blue, fontSize: 12, marginTop: 8 }}>{t.adminViewReceipt}</a>}
                {g.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button disabled={busyId === g.id} onClick={() => updateGarageStatus(g, "approved")}
                      style={{ background: "#2F7D32", color: "#fff", border: "none", borderRadius: 8, padding: 9, fontWeight: 800 }}>
                      {t.adminApprove}
                    </button>
                    <button disabled={busyId === g.id} onClick={() => updateGarageStatus(g, "rejected")}
                      style={{ background: "transparent", color: C.red, border: `1px solid ${C.red}88`, borderRadius: 8, padding: 9, fontWeight: 800 }}>
                      {t.adminReject}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : tab === "manageGarages" ? (
        <div>
          <div style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.cream, fontWeight: 800, marginBottom: 10 }}>{t.adminAddGarage}</div>
            {[["garage_name", lang === "ar" ? "اسم الجراج" : "Garage name"],["owner_name", lang === "ar" ? "اسم المالك" : "Owner name"],["phone", lang === "ar" ? "الهاتف" : "Phone"],["address", lang === "ar" ? "العنوان" : "Address"]].map(([k,ph]) => <input key={k} placeholder={ph} value={garageForm[k]} onChange={e=>setGarageForm(v=>({...v,[k]:e.target.value}))} style={fieldStyle} />)}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display:"block", color:C.creamDim, fontSize:11.5, marginBottom:6 }}>{lang === "ar" ? "صورة الجراج" : "Garage photo"}</label>
              <input type="file" accept="image/*" onChange={e=>setGaragePhotoFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding:9 }} />
              {garagePhotoFile && <div style={{ color:C.amber, fontSize:11, marginTop:-5, marginBottom:8 }}>{garagePhotoFile.name}</div>}
              {garagePhotoFile && <img src={URL.createObjectURL(garagePhotoFile)} alt="" style={{ width:"100%", height:110, objectFit:"cover", borderRadius:10, marginBottom:10 }} />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={garageForm.country} onChange={e=>setGarageForm(v=>({...v,country:e.target.value}))} style={fieldStyle}><option value="uae">UAE</option><option value="ksa">KSA</option><option value="egypt">Egypt</option></select>
              <select value={garageForm.rank} onChange={e=>setGarageForm(v=>({...v,rank:e.target.value}))} style={fieldStyle}><option value="0">Normal</option><option value="1">Rank 1</option><option value="2">Rank 2</option><option value="3">Rank 3</option></select>
            </div>
            <button disabled={busyId === "new-garage"} onClick={addAdminGarage} style={{ width:"100%", background:C.amber,color:C.asphalt,border:"none",borderRadius:9,padding:10,fontWeight:900 }}>{busyId === "new-garage" ? "..." : t.adminAddGarage}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {adminGarages.map(g => <div key={g.id} style={{background:C.panel,border:`1px solid ${C.panelLine}`,borderRadius:14,overflow:"hidden"}}>
              {g.photo_url && <img src={g.photo_url} alt={g.garage_name} style={{width:"100%",height:120,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
              <div style={{padding:12}}>
                <div style={{color:C.cream,fontWeight:800}}>{g.garage_name}</div><div style={{color:C.creamDim,fontSize:12,marginTop:4}}>{g.address} · {g.country}</div>
                <button disabled={busyId===g.id} onClick={()=>deleteAdminGarage(g.id)} style={{width:"100%",marginTop:9,background:"transparent",color:C.red,border:`1px solid ${C.red}88`,borderRadius:8,padding:9,fontWeight:800}}><Trash2 size={14} style={{verticalAlign:"middle",marginRight:5}} />{t.adminDelete}</button>
              </div>
            </div>)}
          </div>
        </div>
      ) : tab === "maintenance" ? (
        <div>
          <div style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.cream, fontWeight: 800, marginBottom: 10 }}>{t.adminAddMaintenance}</div>
            <select value={maintenanceForm.country} onChange={e=>setMaintenanceForm(v=>({...v,country:e.target.value}))} style={fieldStyle}><option value="uae">UAE</option><option value="ksa">KSA</option><option value="egypt">Egypt</option></select>
            {[["name_en","Name (EN)"],["name_ar","الاسم (AR)"],["area_en","Area (EN)"],["area_ar","المنطقة (AR)"],["note_en","Description (EN)"],["note_ar","الوصف (AR)"],["map_link","Maps link"]].map(([k,ph]) => <input key={k} placeholder={ph} value={maintenanceForm[k]} onChange={e=>setMaintenanceForm(v=>({...v,[k]:e.target.value}))} style={fieldStyle} />)}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display:"block", color:C.creamDim, fontSize:11.5, marginBottom:6 }}>{lang === "ar" ? "صورة مركز الصيانة" : "Maintenance center photo"}</label>
              <input type="file" accept="image/*" onChange={e=>setMaintenancePhotoFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding:9 }} />
              {maintenancePhotoFile && <div style={{ color:C.amber, fontSize:11, marginTop:-5, marginBottom:8 }}>{maintenancePhotoFile.name}</div>}
              {maintenancePhotoFile && <img src={URL.createObjectURL(maintenancePhotoFile)} alt="" style={{ width:"100%", height:110, objectFit:"cover", borderRadius:10, marginBottom:10 }} />}
            </div>
            <button disabled={busyId === "new-maintenance"} onClick={addMaintenanceCenter} style={{ width:"100%", background:C.amber,color:C.asphalt,border:"none",borderRadius:9,padding:10,fontWeight:900 }}>{busyId === "new-maintenance" ? "..." : t.adminAddMaintenance}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {maintenanceCenters.map(m => <div key={m.id} style={{background:C.panel,border:`1px solid ${C.panelLine}`,borderRadius:14,overflow:"hidden"}}>
              {m.photo_url && <img src={m.photo_url} alt={lang === "ar" ? m.name_ar : m.name_en} style={{width:"100%",height:120,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
              <div style={{padding:12}}>
                <div style={{color:C.cream,fontWeight:800}}>{lang === "ar" ? m.name_ar : m.name_en}</div><div style={{color:C.creamDim,fontSize:12,marginTop:4}}>{m.country} · {lang === "ar" ? m.area_ar : m.area_en}</div>
                <button disabled={busyId===m.id} onClick={()=>deleteMaintenanceCenter(m.id)} style={{width:"100%",marginTop:9,background:"transparent",color:C.red,border:`1px solid ${C.red}88`,borderRadius:8,padding:9,fontWeight:800}}><Trash2 size={14} style={{verticalAlign:"middle",marginRight:5}} />{t.adminDelete}</button>
              </div>
            </div>)}
          </div>
        </div>
      ) : tab === "media" ? (
        <div>
          <div style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.cream, fontWeight: 800, marginBottom: 10 }}>{t.adminAddMedia}</div>
            <select value={mediaIssueId} onChange={e=>setMediaIssueId(e.target.value)} style={fieldStyle}>
              {Object.keys(ISSUES).map(id => <option key={id} value={id}>{ISSUES[id]?.en?.title || id}</option>)}
            </select>
            <select value={mediaLang} onChange={e=>setMediaLang(e.target.value)} style={fieldStyle}>
              <option value="en">English</option><option value="ar">العربية</option>
            </select>
            <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={e=>setMediaFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding:9 }} />
            {mediaFile && <div style={{ color:C.amber, fontSize:11, marginTop:-5, marginBottom:8 }}>{mediaFile.name} · {(mediaFile.size/1024/1024).toFixed(2)} MB</div>}
            <div style={{ color:C.creamDim, fontSize:10.5, lineHeight:1.5, marginBottom:10 }}>{t.adminMediaLimit}</div>
            <button disabled={!mediaFile || busyId === "new-media"} onClick={addIssueMedia} style={{ width:"100%", background:C.amber,color:C.asphalt,border:"none",borderRadius:9,padding:10,fontWeight:900 }}>{busyId === "new-media" ? "..." : t.adminMediaUpload}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {issueMedia.length === 0 && <p style={{ color:C.creamDim, textAlign:"center", fontSize:13 }}>{t.adminMediaEmpty}</p>}
            {issueMedia.map(m => <div key={m.id} style={{background:C.panel,border:`1px solid ${C.panelLine}`,borderRadius:14,overflow:"hidden"}}>
              {m.media_type === "video" ? <video src={m.url} controls preload="metadata" style={{width:"100%",maxHeight:180,background:"#000"}} /> : <img src={m.url} alt={m.title || m.issue_id} style={{width:"100%",height:140,objectFit:"cover",display:"block"}} />}
              <div style={{padding:10}}>
                <div style={{color:C.cream,fontWeight:800,fontSize:12}}>{ISSUES[m.issue_id]?.[m.lang]?.title || m.issue_id}</div>
                <div style={{color:C.creamDim,fontSize:10.5,marginTop:3}}>{m.lang.toUpperCase()} · {m.media_type} · {m.file_size_bytes ? `${(m.file_size_bytes/1024/1024).toFixed(2)} MB` : ""}</div>
                <button disabled={busyId===m.id} onClick={()=>deleteIssueMedia(m)} style={{width:"100%",marginTop:8,background:"transparent",color:C.red,border:`1px solid ${C.red}88`,borderRadius:8,padding:8,fontWeight:800}}><Trash2 size={13} style={{verticalAlign:"middle",marginRight:5}} />{t.adminDelete}</button>
              </div>
            </div>)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cars.length === 0 && <p style={{ color: C.creamDim, textAlign: "center", fontSize: 13 }}>{t.adminNoCars}</p>}
          {cars.map((c) => (
            <div key={c.id} style={{ background: C.panel, border: `1px solid ${C.panelLine}`, borderRadius: 14, overflow: "hidden" }}>
              {(c.photo_url || c.photo_urls?.[0]) && (
                <div style={{ position: "relative" }}>
                  <img src={c.photo_url || c.photo_urls[0]} alt={c.make_model} style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
                  {c.status === "sold" && (
                    <div
                      aria-label={t.soldBadge}
                      style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%) rotate(-12deg)",
                        border: `3px solid ${C.red}`, color: C.red,
                        background: "rgba(10,11,13,0.78)", borderRadius: 10,
                        padding: "6px 16px", fontSize: 18, fontWeight: 900,
                        letterSpacing: 2, textTransform: lang === "en" ? "uppercase" : "none",
                        whiteSpace: "nowrap", zIndex: 3, pointerEvents: "none",
                      }}
                    >
                      {t.soldBadge}
                    </div>
                  )}
                </div>
              )}
              <div style={{ padding: "11px 12px" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div style={{ color: C.cream, fontSize: 14, fontWeight: 700 }}>{c.make_model}{c.year ? ` · ${c.year}` : ""}</div>
                    <div style={{ color: C.creamDim, fontSize: 11.5, marginTop: 3 }}>{c.price}{c.city ? ` · ${c.city}` : ""}</div>
                  </div>
                  <span style={{ color: c.status === "sold" ? C.red : C.amber, fontSize: 11, fontWeight: 800 }}>{c.status === "sold" ? t.adminSold : t.adminAvailable}</span>
                </div>
                <button disabled={busyId === c.id} onClick={() => updateCarStatus(c, c.status === "sold" ? "approved" : "sold")}
                  className="flex items-center justify-center gap-2 mt-3"
                  style={{ width: "100%", background: "transparent", border: `1px solid ${c.status === "sold" ? C.amberDim : C.red}88`, borderRadius: 10, padding: "9px 12px", cursor: busyId === c.id ? "wait" : "pointer", color: c.status === "sold" ? C.amber : C.red, fontSize: 12.5, fontWeight: 700 }}>
                  {c.status === "sold" ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                  {c.status === "sold" ? t.adminMarkAvailable : t.adminMarkSold}
                </button>
                <button disabled={busyId === c.id} onClick={() => deleteCar(c)}
                  className="flex items-center justify-center gap-2 mt-2"
                  style={{ width: "100%", background: "transparent", border: `1px solid ${C.red}88`, borderRadius: 10, padding: "9px 12px", cursor: busyId === c.id ? "wait" : "pointer", color: C.red, fontSize: 12.5, fontWeight: 700 }}>
                  <Trash2 size={14} />
                  {t.adminDelete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   App
--------------------------------------------------------------- */
export default function App() {
  const initialRoute = routeFromPath(typeof window !== "undefined" ? window.location.pathname : "/");
  const [lang, setLang] = useState("en");
  const [view, setView] = useState(initialRoute.view);
  const [activeCategory, setActiveCategory] = useState(initialRoute.activeCategory || null);
  const [activeIssueId, setActiveIssueId] = useState(initialRoute.activeIssueId || null);
  const [activeObdCode, setActiveObdCode] = useState(initialRoute.activeObdCode || null);
  const [country, setCountry] = useState("uae");
  const [carMode, setCarMode] = useState(initialRoute.carMode || "browse"); // browse | add | submitted
  const [selectedCar, setSelectedCar] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGarageForm, setShowGarageForm] = useState(false);
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  // --- URL routing + browser back-button support -----------------
  function navPush(path, replace = false) {
    try {
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({ t: Date.now() }, "", path);
      const route = routeFromPath(path);
      setView(route.view);
      setActiveCategory(route.activeCategory || null);
      setActiveIssueId(route.activeIssueId || null);
      setActiveObdCode(route.activeObdCode || null);
      setCarMode(route.carMode || "browse");
    } catch (e) {}
  }

  const goBack = () => {
    try {
      window.history.back();
    } catch (e) {}
  };

  useEffect(() => {
    function handlePopState() {
      const route = routeFromPath(window.location.pathname);
      setView(route.view);
      setActiveCategory(route.activeCategory || null);
      setActiveIssueId(route.activeIssueId || null);
      setActiveObdCode(route.activeObdCode || null);
      setCarMode(route.carMode || "browse");
      setSelectedCar(null);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    applySeoMeta({ lang, view, activeIssueId, activeCategory, activeObdCode });
  }, [lang, view, activeIssueId, activeCategory, activeObdCode]);

  const isRTL = lang === "ar";
  const t = T[lang];
  const bodyFont = isRTL ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif";

  function goHome() {
    navPush("/");
  }
  function openCategory(cat) {
    navPush(routePathForCategory(cat));
  }
  function openGuide() {
    navPush("/guide");
  }
  function openIssue(id) {
    navPush(routePathForIssue(id));
  }
  function openObdCode(code) {
    navPush(`/obd/${String(code).toUpperCase()}`);
  }
  function openCarAdd() {
    setCarMode("add");
    navPush("/cars/add");
  }
  function carSubmitted() {
    setCarMode("submitted");
    navPush("/cars/submitted", true);
  }
  function selectCar(car) {
    setSelectedCar(car);
    navPush("/cars");
  }
  function openSection(id) {
    navPush(id === "home" ? "/" : `/${id}`);
  }
  function toggleMenu() {
    setMenuOpen((m) => !m);
  }
  function handleAddGarage() {
    setMenuOpen(false);
    setShowGarageForm(true);
  }
  function handleOpenAdmin() {
    setMenuOpen(false);
    navPush("/admin");
  }

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center py-8"
      style={{ background: "#0A0B0D" }}
    >
      <div
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          width: 380,
          height: 760,
          background: C.asphalt,
          borderRadius: 40,
          border: `8px solid #05060700`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: bodyFont,
          position: "relative",
        }}
      >
        {/* status bar */}
        <div
          className="flex items-center justify-between px-6"
          style={{ height: 30, color: C.creamDim, fontSize: 12, fontWeight: 600 }}
        >
          <span>{clock}</span>
          <span style={{ letterSpacing: 1 }}>●●●●</span>
        </div>

        <TopBar
          lang={lang}
          setLang={setLang}
          t={t}
          onLogoTap={goHome}
          menuOpen={menuOpen}
          onToggleMenu={toggleMenu}
          onAddGarage={handleAddGarage}
          onOpenAdmin={handleOpenAdmin}
        />
        <GarageListingForm isOpen={showGarageForm} onClose={() => setShowGarageForm(false)} />

        <div className="flex-1 overflow-y-auto">
          {view === "home" && (
            <HomeView
              lang={lang}
              t={t}
              onOpenSection={openSection}
            />
          )}
          {view === "fix" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <FixView
                lang={lang}
                t={t}
                onOpenCategory={openCategory}
                onOpenGuide={openGuide}
                onOpenIssue={openIssue}
                onOpenObdCode={openObdCode}
              />
            </>
          )}
          {view === "obd" && activeObdCode && (
            <ObdCodeView
              lang={lang}
              t={t}
              code={activeObdCode}
              onOpenIssue={openIssue}
              onBack={goBack}
              isRTL={isRTL}
            />
          )}
          {view === "guide" && (
            <LightsGuideView
              lang={lang}
              t={t}
              onOpenCategory={openCategory}
              onBack={goBack}
              isRTL={isRTL}
            />
          )}
          {view === "category" && activeCategory && (
            <CategoryView
              lang={lang}
              t={t}
              category={activeCategory}
              onOpenIssue={openIssue}
              onBack={goBack}
              isRTL={isRTL}
            />
          )}
          {view === "issue" && activeIssueId && (
            <IssueView
              lang={lang}
              t={t}
              issueId={activeIssueId}
              onBack={goBack}
              categoryLabel={activeCategory ? activeCategory[lang] : t.navIssues}
              CategoryIcon={activeCategory ? activeCategory.icon : null}
              isRTL={isRTL}
            />
          )}
          {view === "garages" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <GaragesView lang={lang} t={t} country={country} setCountry={setCountry} isRTL={isRTL} />
            </>
          )}
          {view === "maintenance" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <MaintenanceView lang={lang} t={t} country={country} setCountry={setCountry} isRTL={isRTL} />
            </>
          )}
          {view === "parts" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <SparePartsView lang={lang} t={t} country={country} setCountry={setCountry} isRTL={isRTL} />
            </>
          )}
          {view === "diagnosis" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <PhotoDiagnosisView lang={lang} />
            </>
          )}
          {view === "valuation" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <CarValuationView lang={lang} />
            </>
          )}
          {view === "admin" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <AdminCarsView lang={lang} t={t} isRTL={isRTL} onBack={goHome} />
            </>
          )}
          {view === "buy-car" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <BuyCarView lang={lang} t={t} isRTL={isRTL} />
            </>
          )}
          {view === "cars" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <CarsView
                lang={lang}
                t={t}
                isRTL={isRTL}
                mode={carMode}
                onSubmitted={carSubmitted}
                onBack={goBack}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
