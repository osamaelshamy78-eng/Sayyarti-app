import React, { Component, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { startAdminPhotoRequestEnhancer } from "./AdminPhotoRequestEnhancer";
import { startCarMediaEnhancer } from "./CarMediaEnhancer";
import { startAdminCarDeleteEnhancer } from "./AdminCarDeleteEnhancer";
import { startPendingCarAdminEnhancer } from "./PendingCarAdminEnhancer";
import { startKeyboardBehaviorFix } from "./KeyboardBehaviorFix";
import { startOverlayBackHandler } from "./OverlayBackHandler";
import KarajiAIAssistant from "./components/KarajiAIAssistant";
import KarajiMaintenancePlanner from "./components/KarajiMaintenancePlanner";

const App = React.lazy(() => import("./App.jsx"));
const Fix3DLibrary = React.lazy(() => import("./components/Fix3DLibraryV2.jsx"));

class AppErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("Karaji startup error:", error, info); }
  render() {
    if (this.state.error) {
      const message = this.state.error?.message || "Unknown application error";
      return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#14171C",color:"#F2ECDD",padding:24,fontFamily:"system-ui,sans-serif"}}><div style={{maxWidth:560,textAlign:"center"}}><h1>Karaji</h1><p>The app could not start.</p><p dir="ltr" style={{color:"#F5B942",fontSize:13,wordBreak:"break-word"}}>{message}</p><button onClick={()=>window.location.reload()} style={{marginTop:16,padding:"10px 18px",borderRadius:8,border:0}}>Reload</button></div></div>;
    }
    return this.props.children;
  }
}
function StartupFallback() { return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#14171C",color:"#F2ECDD",fontFamily:"system-ui,sans-serif"}}>Loading Karajy…</div>; }

const isFix3DRoute = window.location.pathname === "/3d-fix" || window.location.hash === "#/3d-fix";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <Suspense fallback={<StartupFallback />}>
      {isFix3DRoute ? <Fix3DLibrary /> : <><App /><KarajiAIAssistant lang="ar" /><KarajiMaintenancePlanner /></>}
    </Suspense>
  </AppErrorBoundary>
);

if (!isFix3DRoute) {
  startAdminPhotoRequestEnhancer();
  startCarMediaEnhancer();
  startAdminCarDeleteEnhancer();
  startPendingCarAdminEnhancer();
  startKeyboardBehaviorFix();
  startOverlayBackHandler();
}
