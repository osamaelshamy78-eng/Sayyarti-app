export const OBD_CODES = {
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
