import { lazy, useState, useEffect, Suspense } from "react";
import { storedLang, announceLang } from "./appLanguage";
import { closeTopDialogOnBack } from "./backButton";
import { C } from "./theme";
import { routeFromPath, routePathForIssue, routePathForCategory, applySeoMeta } from "./routes";
import { T } from "./i18n/strings";
import { TopBar } from "./components/TopBar";
import { HomeView } from "./views/HomeView";
import { BackHeader } from "./components/BackHeader";
import { FixView, ObdCodeView, LightsGuideView, CategoryView, IssueView } from "./views/FixViews";
import { GaragesView } from "./views/GaragesView";
import { MaintenanceView } from "./views/MaintenanceView";
import { SparePartsView } from "./views/SparePartsView";
import { RentalsView } from "./views/RentalsView";
import { AdminCarsView } from "./views/AdminView";
import { CarsView, BuyCarView } from "./views/CarViews";

// Loaded only when the user opens these screens (smaller first load)
const PhotoDiagnosisView = lazy(() => import("./components/PhotoDiagnosisView"));
const CarValuationView = lazy(() => import("./components/CarValuationView"));

/* ---------------------------------------------------------------
   App
--------------------------------------------------------------- */
function LazyFallback({ lang }) {
  return (
    <div style={{ padding: 32, textAlign: "center", color: C.creamDim, fontSize: 13 }}>
      {lang === "ar" ? "جارٍ التحميل..." : "Loading..."}
    </div>
  );
}

export default function App() {
  const initialRoute = routeFromPath(typeof window !== "undefined" ? window.location.pathname : "/");
  // Start in the language the user picked (login screen or last visit), else the phone's language
  const [lang, setLang] = useState(storedLang);
  useEffect(() => {
    try {
      localStorage.setItem("karajy-language", lang);
      localStorage.setItem("karajiLanguage", lang);
    } catch (e) {}
  }, [lang]);
  const [view, setView] = useState(initialRoute.view);
  const [activeCategory, setActiveCategory] = useState(initialRoute.activeCategory || null);
  const [activeIssueId, setActiveIssueId] = useState(initialRoute.activeIssueId || null);
  const [activeObdCode, setActiveObdCode] = useState(initialRoute.activeObdCode || null);
  const [country, setCountry] = useState("uae");
  const [carMode, setCarMode] = useState(initialRoute.carMode || "browse"); // browse | add | submitted
  const [selectedCar, setSelectedCar] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep <html lang>/<html dir> in sync with the in-app language toggle,
  // so external scripts (karaji-safety.js) and browsers/screen readers
  // can correctly detect which language is actually showing,
  // and tell the bottom nav / AI assistant / planner about the change.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    announceLang(lang);
  }, [lang]);

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
    function handlePopState(event) {
      // If a dialog or the photo viewer is open, Back only closes it
      if (closeTopDialogOnBack(event)) return;
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

  // the bottom nav highlights Home while the home screen shows
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("karaji-view-change", { detail: { view } }));
  }, [view]);

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
  function closeMenu() {
    setMenuOpen(false);
  }
  function navigateFromMenu(path) {
    setMenuOpen(false);
    navPush(path);
  }
  function handleOpenAdmin() {
    setMenuOpen(false);
    navPush("/admin");
  }

  return (
    <div className="w-full flex justify-center" style={{ background: "#0A0B0D" }}>
      {/* the whole screen on a phone; a centred column on a wider screen (see .app-shell) */}
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="app-shell"
        style={{
          background: C.asphalt,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: bodyFont,
          position: "relative",
        }}
      >

        <TopBar
          lang={lang}
          setLang={setLang}
          t={t}
          onLogoTap={goHome}
          menuOpen={menuOpen}
          onToggleMenu={toggleMenu}
          onCloseMenu={closeMenu}
          onNavigate={navigateFromMenu}
          onOpenAdmin={handleOpenAdmin}
        />

        {/* bottom padding keeps the end of every screen clear of the fixed bottom nav */}
        <div role="main" className="flex-1 overflow-y-auto" style={{ paddingBottom: "calc(84px + env(safe-area-inset-bottom))" }}>
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
              <Suspense fallback={<LazyFallback lang={lang} />}>
                <PhotoDiagnosisView lang={lang} />
              </Suspense>
            </>
          )}
          {view === "valuation" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <Suspense fallback={<LazyFallback lang={lang} />}>
                <CarValuationView lang={lang} />
              </Suspense>
            </>
          )}
          {view === "rentals" && (
            <>
              <BackHeader label={t.backHome} onBack={goHome} isRTL={isRTL} />
              <RentalsView lang={lang} t={t} country={country} setCountry={setCountry} isRTL={isRTL} />
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
