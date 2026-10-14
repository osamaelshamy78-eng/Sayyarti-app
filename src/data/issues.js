import { HelpCircle } from "lucide-react";
import { EngineLightIcon, BatteryLightIcon, OilLightIcon, BrakeLightIcon, TempLightIcon, TireLightIcon, TransmissionLightIcon, SteeringLightIcon } from "./warningLights";

/* ---------------------------------------------------------------
   Content data
--------------------------------------------------------------- */
export const CATEGORIES = [
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

export const ISSUES = {
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
