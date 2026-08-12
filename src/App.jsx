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
  Car,
  Plus,
  MessageCircle,
} from "lucide-react";
import { supabase } from "./supabaseClient";

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
    issues: ["checkEngine", "overheating", "noStart"],

  },
  {
    id: "battery",
    icon: BatteryLightIcon,
    en: "Battery & Electrical",
    ar: "البطارية والكهرباء",
    issues: ["deadBattery", "altWarning"],
  },
  {
    id: "brakes",
    icon: BrakeLightIcon,
    en: "Brakes",
    ar: "الفرامل",
    issues: ["brakeNoise", "softPedal"],
  },
  {
    id: "ac",
    icon: TempLightIcon,
    en: "AC & Cooling",
    ar: "التكييف والتبريد",
    issues: ["acWarm", "acSmell"],
  },
  {
    id: "tires",
    icon: TireLightIcon,
    en: "Tires",
    ar: "الإطارات",
    issues: ["tirePressure", "unevenWear"],
  },
  {
    id: "oil",
    icon: OilLightIcon,
    en: "Oil & Fluids",
    ar: "الزيت والسوائل",
    issues: ["oilWarning", "oilLeak"],
  },
  {
    id: "transmission",
    icon: TransmissionLightIcon,
    en: "Transmission",
    ar: "ناقل الحركة",
    issues: ["transSlip", "noShift"],
  },
  {
    id: "suspension",
    icon: SteeringLightIcon,
    en: "Steering & Suspension",
    ar: "التوجيه والتعليق",
    issues: ["steeringVibration", "clunkBumps"],
  },
];

const ISSUES = {
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
};

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

/* ---------------------------------------------------------------
   UI copy
--------------------------------------------------------------- */
const T = {
  en: {
    wordmark: "Sayyarti",
    tagline: "Diagnose car issues & find trusted garages",
    navIssues: "Issues",
    navGarages: "Garages",
    homeHeading: "What's wrong with your car?",
    homeSub: "Tap a system to see common issues",
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
    carsSub: "Browse listings or post your own car",
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
    carSubmitted: "Thanks! Your listing was submitted and will appear once reviewed.",
    carEmpty: "No cars listed yet. Be the first!",
    carLoading: "Loading listings...",
    carContact: "Contact Seller",
    carNoDb:
      "The cars marketplace isn't connected yet. Once Supabase is set up, listings will appear here.",
  },
  ar: {
    wordmark: "سيارتي",
    tagline: "شخّص مشاكل سيارتك واعثر على ورش موثوقة",
    navIssues: "الأعطال",
    navGarages: "الورش",
    homeHeading: "ما هي مشكلة سيارتك؟",
    homeSub: "اضغط على أحد الأنظمة لرؤية الأعطال الشائعة",
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
    carsSub: "تصفح السيارات المعروضة أو اعرض سيارتك",
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
    carSubmitted: "شكرًا! تم إرسال إعلانك وسيظهر بعد المراجعة.",
    carEmpty: "لا توجد سيارات معروضة حاليًا. كن أول من يعرض سيارته!",
    carLoading: "جاري تحميل الإعلانات...",
    carContact: "تواصل مع البائع",
    carNoDb: "سوق السيارات لسه مش متصل بقاعدة البيانات. بعد إعداد Supabase هتظهر الإعلانات هنا.",
  },
};

/* ---------------------------------------------------------------
   Small building blocks
--------------------------------------------------------------- */
function TopBar({ lang, setLang, t, onLogoTap }) {
  const isRTL = lang === "ar";
  return (
    <div
      className="flex items-center justify-between px-5 pt-3 pb-4"
      style={{ borderBottom: `1px solid ${C.panelLine}` }}
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
    </div>
  );
}

function BottomNav({ lang, t, view, setView }) {
  const items = [
    { id: "home", label: t.navIssues, icon: Gauge },
    { id: "garages", label: t.navGarages, icon: MapPin },
    { id: "cars", label: t.navCars, icon: Car },
    { id: "advertise", label: t.navAdvertise, icon: Megaphone },
  ];
  return (
    <div
      className="flex"
      style={{
        borderTop: `1px solid ${C.panelLine}`,
        background: C.panel,
      }}
    >
      {items.map((it) => {
        const active =
          view === it.id || (it.id === "home" && (view === "category" || view === "issue"));
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => setView(it.id)}
            className="flex-1 flex flex-col items-center gap-1 py-3"
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <Icon size={20} color={active ? C.amber : C.grey} strokeWidth={2} />
            <span
              style={{
                fontSize: 11,
                fontFamily: lang === "ar" ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                color: active ? C.amber : C.grey,
                fontWeight: active ? 600 : 500,
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
function HomeView({ lang, t, onOpenCategory }) {
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
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 20 }}>
        {t.homeSub}
      </p>
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

function IssueView({ lang, t, issueId, onBack, categoryLabel, CategoryIcon, isRTL }) {
  const issue = ISSUES[issueId][lang];
  return (
    <div className="pb-6">
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
      </div>
    </div>
  );
}

function GaragesView({ lang, t, country, setCountry, isRTL }) {
  const data = GARAGES[country];
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
      </div>
    </div>
  );
}

function AdvertiseView({ lang, t, isRTL }) {
  return (
    <div className="px-5 pt-5 pb-6">
      <div
        className="flex items-center justify-center rounded-full mb-4"
        style={{
          width: 52,
          height: 52,
          background: `${C.amber}18`,
          border: `1px solid ${C.amberDim}`,
        }}
      >
        <Megaphone size={24} color={C.amber} />
      </div>
      <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>
        {t.advertiseHeading}
      </h1>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 18 }}>
        {t.advertiseSub}
      </p>

      <div className="flex flex-col gap-2.5 mb-6">
        {t.advertiseBullets.map((b, i) => (
          <div
            key={i}
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 12,
              padding: "12px 14px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            <span style={{ color: C.amber, flexShrink: 0 }}>●</span>
            <span style={{ color: C.creamDim, fontSize: 13, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>

      <p style={{ color: C.creamDim, fontSize: 12, marginBottom: 10, textAlign: isRTL ? "right" : "left" }}>
        {t.advertiseNote}
      </p>

      <button
        onClick={() =>
          (window.location.href =
            "mailto:osamaelshamy78@gmail.com?subject=" + encodeURIComponent("Advertising Inquiry — Sayyarti"))
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
        <Megaphone size={18} color={C.asphalt} />
        <span style={{ color: C.asphalt, fontSize: 14, fontWeight: 700 }}>{t.advertiseCTA}</span>
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------
   Cars for Sale (Supabase-backed marketplace)
--------------------------------------------------------------- */
const CAR_COUNTRIES = [
  { code: "uae", en: "UAE", ar: "الإمارات" },
  { code: "ksa", en: "Saudi Arabia", ar: "السعودية" },
  { code: "egypt", en: "Egypt", ar: "مصر" },
];

const UAE_EMIRATES = [
  { en: "Abu Dhabi", ar: "أبوظبي" },
  { en: "Dubai", ar: "دبي" },
  { en: "Sharjah", ar: "الشارقة" },
  { en: "Ajman", ar: "عجمان" },
  { en: "Umm Al Quwain", ar: "أم القيوين" },
  { en: "Ras Al Khaimah", ar: "رأس الخيمة" },
  { en: "Fujairah", ar: "الفجيرة" },
];

const CAR_MAKES = [
  {
    code: "toyota",
    en: "Toyota",
    ar: "تويوتا",
    models: [
      { en: "Corolla", ar: "كورولا" },
      { en: "Camry", ar: "كامري" },
      { en: "Land Cruiser", ar: "لاند كروزر" },
      { en: "Yaris", ar: "يارس" },
      { en: "Hilux", ar: "هايلوكس" },
    ],
  },
  {
    code: "hyundai",
    en: "Hyundai",
    ar: "هيونداي",
    models: [
      { en: "Elantra", ar: "النترا" },
      { en: "Sonata", ar: "سوناتا" },
      { en: "Tucson", ar: "توسان" },
      { en: "Accent", ar: "أكسنت" },
      { en: "Santa Fe", ar: "سنتافي" },
    ],
  },
  {
    code: "nissan",
    en: "Nissan",
    ar: "نيسان",
    models: [
      { en: "Sunny", ar: "صني" },
      { en: "Altima", ar: "التيما" },
      { en: "Patrol", ar: "باترول" },
      { en: "X-Trail", ar: "إكستريل" },
      { en: "Sentra", ar: "سنترا" },
    ],
  },
  {
    code: "kia",
    en: "Kia",
    ar: "كيا",
    models: [
      { en: "Cerato", ar: "سيراتو" },
      { en: "Sportage", ar: "سبورتاج" },
      { en: "Sorento", ar: "سورينتو" },
      { en: "Picanto", ar: "بيكانتو" },
      { en: "Rio", ar: "ريو" },
    ],
  },
  {
    code: "honda",
    en: "Honda",
    ar: "هوندا",
    models: [
      { en: "Civic", ar: "سيفيك" },
      { en: "Accord", ar: "أكورد" },
      { en: "CR-V", ar: "سي آر في" },
      { en: "City", ar: "سيتي" },
      { en: "Pilot", ar: "بايلوت" },
    ],
  },
  {
    code: "chevrolet",
    en: "Chevrolet",
    ar: "شيفروليه",
    models: [
      { en: "Malibu", ar: "ماليبو" },
      { en: "Cruze", ar: "كروز" },
      { en: "Tahoe", ar: "تاهو" },
      { en: "Captiva", ar: "كابتيفا" },
      { en: "Spark", ar: "سبارك" },
    ],
  },
  {
    code: "ford",
    en: "Ford",
    ar: "فورد",
    models: [
      { en: "Fusion", ar: "فيوجن" },
      { en: "Explorer", ar: "إكسبلورر" },
      { en: "F-150", ar: "إف 150" },
      { en: "EcoSport", ar: "إيكوسبورت" },
      { en: "Edge", ar: "إيدج" },
    ],
  },
  {
    code: "bmw",
    en: "BMW",
    ar: "بي إم دبليو",
    models: [
      { en: "3 Series", ar: "الفئة الثالثة" },
      { en: "5 Series", ar: "الفئة الخامسة" },
      { en: "X5", ar: "إكس 5" },
      { en: "X3", ar: "إكس 3" },
      { en: "7 Series", ar: "الفئة السابعة" },
    ],
  },
  {
    code: "mercedes",
    en: "Mercedes-Benz",
    ar: "مرسيدس بنز",
    models: [
      { en: "C-Class", ar: "سي كلاس" },
      { en: "E-Class", ar: "إي كلاس" },
      { en: "S-Class", ar: "إس كلاس" },
      { en: "GLE", ar: "جي إل إي" },
      { en: "GLC", ar: "جي إل سي" },
    ],
  },
  {
    code: "lexus",
    en: "Lexus",
    ar: "لكزس",
    models: [
      { en: "ES", ar: "إي إس" },
      { en: "RX", ar: "آر إكس" },
      { en: "LX", ar: "إل إكس" },
      { en: "NX", ar: "إن إكس" },
      { en: "GX", ar: "جي إكس" },
    ],
  },
  {
    code: "mitsubishi",
    en: "Mitsubishi",
    ar: "ميتسوبيشي",
    models: [
      { en: "Lancer", ar: "لانسر" },
      { en: "Pajero", ar: "باجيرو" },
      { en: "Outlander", ar: "أوتلاندر" },
      { en: "ASX", ar: "إيه إس إكس" },
      { en: "Attrage", ar: "أتراج" },
    ],
  },
  {
    code: "jeep",
    en: "Jeep",
    ar: "جيب",
    models: [
      { en: "Wrangler", ar: "رانجلر" },
      { en: "Grand Cherokee", ar: "جراند شيروكي" },
      { en: "Cherokee", ar: "شيروكي" },
      { en: "Compass", ar: "كومباس" },
      { en: "Renegade", ar: "رينيجيد" },
    ],
  },
  {
    code: "renault",
    en: "Renault",
    ar: "رينو",
    models: [
      { en: "Duster", ar: "داستر" },
      { en: "Logan", ar: "لوجان" },
      { en: "Koleos", ar: "كوليوس" },
      { en: "Kadjar", ar: "كادجار" },
      { en: "Symbol", ar: "سيمبول" },
    ],
  },
  {
    code: "mg",
    en: "MG",
    ar: "إم جي",
    models: [
      { en: "MG5", ar: "إم جي 5" },
      { en: "MG6", ar: "إم جي 6" },
      { en: "ZS", ar: "زد إس" },
      { en: "HS", ar: "إتش إس" },
      { en: "RX5", ar: "آر إكس 5" },
    ],
  },
  {
    code: "landrover",
    en: "Land Rover",
    ar: "لاند روفر",
    models: [
      { en: "Range Rover", ar: "رنج روفر" },
      { en: "Discovery", ar: "ديسكفري" },
      { en: "Defender", ar: "ديفندر" },
      { en: "Evoque", ar: "إيفوك" },
      { en: "Sport", ar: "سبورت" },
    ],
  },
  { code: "other", en: "Other", ar: "أخرى", models: [] },
];

function CarForm({ lang, t, isRTL, onClose, onSubmitted }) {
  const [form, setForm] = useState({
    car_make: "",
    car_model: "",
    custom_make: "",
    custom_model: "",
    year: "",
    price: "",
    mileage: "",
    chassis_number: "",
    city: "",
    country: "uae",
    specs: "",
    phone: "",
    description: "",
    photo_urls: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectedMake = CAR_MAKES.find((m) => m.code === form.car_make);

  function handleMakeChange(e) {
    const code = e.target.value;
    setForm((f) => ({ ...f, car_make: code, car_model: "", custom_model: "" }));
  }

  async function handlePhotoSelect(e) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length || !supabase) return;
    setUploading(true);
    setError("");
    const newUrls = [];
    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("car-photos")
        .upload(fileName, file);
      if (uploadError) {
        setError(t.carPhotoError);
        continue;
      }
      const { data: urlData } = supabase.storage.from("car-photos").getPublicUrl(fileName);
      newUrls.push(urlData.publicUrl);
    }
    setForm((f) => ({ ...f, photo_urls: [...f.photo_urls, ...newUrls] }));
    setUploading(false);
  }

  function removePhoto(url) {
    setForm((f) => ({ ...f, photo_urls: f.photo_urls.filter((u) => u !== url) }));
  }

  const fieldStyle = {
    width: "100%",
    background: C.asphalt,
    border: `1px solid ${C.panelLine}`,
    borderRadius: 10,
    padding: "10px 12px",
    color: C.cream,
    fontSize: 13,
    marginBottom: 10,
    fontFamily: "inherit",
    textAlign: isRTL ? "right" : "left",
  };

  async function handleSubmit() {
    if (!supabase) {
      setError(t.carNoDb);
      return;
    }
    const makeLabel =
      form.car_make === "other" ? form.custom_make : selectedMake ? selectedMake[lang] : "";
    const modelLabel =
      form.car_make === "other" || form.car_model === "other"
        ? form.custom_model
        : selectedMake?.models.find((m) => m.en === form.car_model)?.[lang] || form.car_model;
    if (!makeLabel || !modelLabel || !form.price || !form.phone || !form.chassis_number) return;
    setSubmitting(true);
    setError("");
    const { error: insertError } = await supabase.from("car_listings").insert([
      {
        make_model: `${makeLabel} ${modelLabel}`,
        year: form.year,
        price: form.price,
        mileage: form.mileage,
        chassis_number: form.chassis_number,
        city: form.city,
        country: form.country,
        specs: form.country === "uae" ? form.specs : null,
        phone: form.phone,
        description: form.description,
        photo_url: form.photo_urls[0] || null,
        photo_urls: form.photo_urls,
        status: "pending",
      },
    ]);
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    onSubmitted();
  }

  return (
    <div className="px-5 pt-5 pb-6">
      <select value={form.car_make} onChange={handleMakeChange} style={fieldStyle}>
        <option value="" disabled>
          {t.carMake}
        </option>
        {CAR_MAKES.map((m) => (
          <option key={m.code} value={m.code}>
            {m[lang]}
          </option>
        ))}
      </select>

      {form.car_make === "other" && (
        <input
          placeholder={t.carMake}
          value={form.custom_make}
          onChange={set("custom_make")}
          style={fieldStyle}
        />
      )}

      {form.car_make && form.car_make !== "other" && (
        <select value={form.car_model} onChange={set("car_model")} style={fieldStyle}>
          <option value="" disabled>
            {t.carModelType}
          </option>
          {selectedMake?.models.map((mo) => (
            <option key={mo.en} value={mo.en}>
              {mo[lang]}
            </option>
          ))}
          <option value="other">{lang === "ar" ? "أخرى" : "Other"}</option>
        </select>
      )}

      {form.car_make && form.car_make !== "other" && form.car_model === "other" && (
        <input
          placeholder={t.carModelType}
          value={form.custom_model}
          onChange={set("custom_model")}
          style={fieldStyle}
        />
      )}

      <div className="flex gap-2">
        <input
          placeholder={t.carYear}
          value={form.year}
          onChange={set("year")}
          style={{ ...fieldStyle, flex: 1 }}
        />
        <input
          placeholder={t.carPrice}
          value={form.price}
          onChange={set("price")}
          style={{ ...fieldStyle, flex: 1 }}
        />
      </div>
      <input
        placeholder={t.carMileage}
        value={form.mileage}
        onChange={set("mileage")}
        style={fieldStyle}
      />
      <input
        placeholder={t.carChassis}
        value={form.chassis_number}
        onChange={set("chassis_number")}
        style={fieldStyle}
      />
      <div className="flex gap-2">
        {form.country === "uae" ? (
          <select
            value={form.city}
            onChange={set("city")}
            style={{ ...fieldStyle, flex: 1 }}
          >
            <option value="" disabled>
              {t.carCity}
            </option>
            {UAE_EMIRATES.map((e) => (
              <option key={e.en} value={e.en}>
                {e[lang]}
              </option>
            ))}
          </select>
        ) : (
          <input
            placeholder={t.carCity}
            value={form.city}
            onChange={set("city")}
            style={{ ...fieldStyle, flex: 1 }}
          />
        )}
        <select
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, city: "" }))}
          style={{ ...fieldStyle, flex: 1 }}
        >
          {CAR_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c[lang]}
            </option>
          ))}
        </select>
      </div>

      {form.country === "uae" && (
        <select value={form.specs} onChange={set("specs")} style={fieldStyle}>
          <option value="" disabled>
            {t.carSpecs}
          </option>
          <option value="gulf">{t.carSpecsGulf}</option>
          <option value="american">{t.carSpecsAmerican}</option>
        </select>
      )}

      <input
        placeholder={t.carPhone}
        value={form.phone}
        onChange={set("phone")}
        style={fieldStyle}
      />
      <textarea
        placeholder={t.carDescription}
        value={form.description}
        onChange={set("description")}
        rows={3}
        style={{ ...fieldStyle, resize: "none" }}
      />

      {form.photo_urls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {form.photo_urls.map((url) => (
            <div key={url} style={{ position: "relative", width: 78, height: 78 }}>
              <img
                src={url}
                alt=""
                style={{
                  width: 78,
                  height: 78,
                  objectFit: "cover",
                  borderRadius: 8,
                  display: "block",
                }}
                onError={(e) => (e.target.style.opacity = 0.3)}
              />
              <button
                onClick={() => removePhoto(url)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: C.red,
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  lineHeight: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className="flex items-center justify-center gap-2 mb-3"
        style={{
          width: "100%",
          background: C.panel,
          border: `1px dashed ${C.amberDim}`,
          borderRadius: 10,
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
        }}
      >
        <Plus size={16} color={C.amber} />
        <span style={{ color: C.amber, fontSize: 13, fontWeight: 600 }}>
          {uploading ? t.carUploading : form.photo_urls.length ? t.carChangePhoto : t.carAddPhoto}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {error && (
        <p style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onClose}
          style={{
            flex: 1,
            background: C.panel,
            border: `1px solid ${C.panelLine}`,
            borderRadius: 12,
            padding: "12px 14px",
            color: C.creamDim,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {t.carCancel}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          style={{
            flex: 2,
            background: C.amber,
            border: "none",
            borderRadius: 12,
            padding: "12px 14px",
            color: C.asphalt,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {t.carSubmit}
        </button>
      </div>
    </div>
  );
}

function CarsView({ lang, t, isRTL }) {
  const [mode, setMode] = useState("browse"); // browse | add | submitted
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("car_listings")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (active) {
        setListings(data || []);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [mode]);

  if (mode === "add") {
    return (
      <CarForm
        lang={lang}
        t={t}
        isRTL={isRTL}
        onClose={() => setMode("browse")}
        onSubmitted={() => setMode("submitted")}
      />
    );
  }

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
          onClick={() => setMode("browse")}
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
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-1">
        <h1 style={{ color: C.cream, fontSize: 21, fontWeight: 700, margin: 0 }}>
          {t.carsHeading}
        </h1>
      </div>
      <p style={{ color: C.creamDim, fontSize: 13, marginTop: 4, marginBottom: 14 }}>
        {t.carsSub}
      </p>

      <button
        onClick={() => setMode("add")}
        className="w-full flex items-center justify-center gap-2 mb-5"
        style={{
          background: C.amber,
          border: "none",
          borderRadius: 12,
          padding: "12px 16px",
          cursor: "pointer",
        }}
      >
        <Plus size={16} color={C.asphalt} strokeWidth={2.5} />
        <span style={{ color: C.asphalt, fontSize: 13.5, fontWeight: 700 }}>{t.addCarBtn}</span>
      </button>

      {!supabase ? (
        <div
          className="flex items-start gap-2"
          style={{
            background: `${C.blue}14`,
            border: `1px solid ${C.blue}44`,
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <Info size={14} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: C.creamDim, fontSize: 11.5, lineHeight: 1.5 }}>{t.carNoDb}</span>
        </div>
      ) : loading ? (
        <p style={{ color: C.creamDim, fontSize: 13, textAlign: "center", marginTop: 20 }}>
          {t.carLoading}
        </p>
      ) : listings.length === 0 ? (
        <p style={{ color: C.creamDim, fontSize: 13, textAlign: "center", marginTop: 20 }}>
          {t.carEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {listings.map((c) => (
            <div
              key={c.id}
              style={{
                background: C.panel,
                border: `1px solid ${C.panelLine}`,
                borderRadius: 14,
                overflow: "hidden",
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
                <button
                  onClick={() =>
                    window.open(
                      `https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`,
                      "_blank"
                    )
                  }
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
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("home"); // home | category | issue | garages
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeIssueId, setActiveIssueId] = useState(null);
  const [country, setCountry] = useState("uae");

  const isRTL = lang === "ar";
  const t = T[lang];
  const bodyFont = isRTL ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif";

  function goHome() {
    setView("home");
    setActiveCategory(null);
    setActiveIssueId(null);
  }
  function openCategory(cat) {
    setActiveCategory(cat);
    setView("category");
  }
  function openIssue(id) {
    setActiveIssueId(id);
    setView("issue");
  }
  function setNav(id) {
    if (id === "home") goHome();
    else setView(id);
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
          <span>9:41</span>
          <span style={{ letterSpacing: 1 }}>●●●●</span>
        </div>

        <TopBar lang={lang} setLang={setLang} t={t} onLogoTap={goHome} />

        <div className="flex-1 overflow-y-auto">
          {view === "home" && <HomeView lang={lang} t={t} onOpenCategory={openCategory} />}
          {view === "category" && activeCategory && (
            <CategoryView
              lang={lang}
              t={t}
              category={activeCategory}
              onOpenIssue={openIssue}
              onBack={goHome}
              isRTL={isRTL}
            />
          )}
          {view === "issue" && activeIssueId && (
            <IssueView
              lang={lang}
              t={t}
              issueId={activeIssueId}
              onBack={() => setView("category")}
              categoryLabel={activeCategory ? activeCategory[lang] : t.navIssues}
              CategoryIcon={activeCategory ? activeCategory.icon : null}
              isRTL={isRTL}
            />
          )}
          {view === "garages" && (
            <GaragesView lang={lang} t={t} country={country} setCountry={setCountry} isRTL={isRTL} />
          )}
          {view === "advertise" && <AdvertiseView lang={lang} t={t} isRTL={isRTL} />}
          {view === "cars" && <CarsView lang={lang} t={t} isRTL={isRTL} />}
        </div>

        <BottomNav lang={lang} t={t} view={view} setView={setNav} />
      </div>
    </div>
  );
}
