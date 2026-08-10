import React, { useState } from "react";
import {
  Gauge,
  BatteryWarning,
  Disc,
  Wind,
  CircleDot,
  Droplet,
  Settings2,
  CarFront,
  ChevronLeft,
  ChevronRight,
  MapPin,
  PlayCircle,
  Wrench,
  Info,
} from "lucide-react";

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
   Content data
--------------------------------------------------------------- */
const CATEGORIES = [
  {
    id: "engine",
    icon: Gauge,
    en: "Engine",
    ar: "المحرك",
    issues: ["checkEngine", "overheating"],
  },
  {
    id: "battery",
    icon: BatteryWarning,
    en: "Battery & Electrical",
    ar: "البطارية والكهرباء",
    issues: ["deadBattery"],
  },
  {
    id: "brakes",
    icon: Disc,
    en: "Brakes",
    ar: "الفرامل",
    issues: ["brakeNoise"],
  },
  {
    id: "ac",
    icon: Wind,
    en: "AC & Cooling",
    ar: "التكييف والتبريد",
    issues: ["acWarm"],
  },
  {
    id: "tires",
    icon: CircleDot,
    en: "Tires",
    ar: "الإطارات",
    issues: ["tirePressure"],
  },
  {
    id: "oil",
    icon: Droplet,
    en: "Oil & Fluids",
    ar: "الزيت والسوائل",
    issues: ["oilWarning"],
  },
  {
    id: "transmission",
    icon: Settings2,
    en: "Transmission",
    ar: "ناقل الحركة",
    issues: ["transSlip"],
  },
  {
    id: "suspension",
    icon: CarFront,
    en: "Steering & Suspension",
    ar: "التوجيه والتعليق",
    issues: ["steeringVibration"],
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

function IssueView({ lang, t, issueId, onBack, categoryLabel, isRTL }) {
  const issue = ISSUES[issueId][lang];
  return (
    <div className="pb-6">
      <BackHeader label={categoryLabel} onBack={onBack} isRTL={isRTL} />
      <div className="px-5">
        <h2 style={{ color: C.cream, fontSize: 19, fontWeight: 700, margin: "0 0 16px 0", lineHeight: 1.3 }}>
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
          <div
            key={i}
            style={{
              background: C.panel,
              border: `1px solid ${C.panelLine}`,
              borderRadius: 14,
              padding: "14px 16px",
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
          </div>
        ))}
      </div>
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
              isRTL={isRTL}
            />
          )}
          {view === "garages" && (
            <GaragesView lang={lang} t={t} country={country} setCountry={setCountry} isRTL={isRTL} />
          )}
        </div>

        <BottomNav lang={lang} t={t} view={view} setView={setNav} />
      </div>
    </div>
  );
}
