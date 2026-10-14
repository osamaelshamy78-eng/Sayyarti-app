import { useState, useEffect } from "react";
import { ShieldCheck, LogOut, Trash2, RotateCcw, CheckCircle2 } from "lucide-react";
import { supabase } from "../supabaseClient";
import { openReceipt } from "../receipts";
import PendingCars from "../components/PendingCars";
import { PACKAGES } from "../components/BuyCreditForm";
import CarMedia from "../components/CarMedia";
import { CAR_MAKES, CAR_MODELS } from "../components/CarForm";
import { ISSUES } from "../data/issues";
import { C } from "../theme";

/* ---------------------------------------------------------------
   Admin car listing management
--------------------------------------------------------------- */
export function AdminCarsView({ lang, t, isRTL, onBack }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("karajy_admin_remember") === "1");
  const [tab, setTab] = useState("cars");
  const [cars, setCars] = useState([]);
  const [pendingCars, setPendingCars] = useState([]);
  const [garageRequests, setGarageRequests] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [photoRequests, setPhotoRequests] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [adminGarages, setAdminGarages] = useState([]);
  const [maintenanceCenters, setMaintenanceCenters] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [garageForm, setGarageForm] = useState({ garage_name: "", owner_name: "", phone: "", address: "", country: "uae", rank: 0, photo_url: "" });
  const [garagePhotoFile, setGaragePhotoFile] = useState(null);
  const [maintenancePhotoFile, setMaintenancePhotoFile] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({ country: "uae", name_en: "", name_ar: "", area_en: "", area_ar: "", note_en: "", note_ar: "", map_link: "" });
  const [rentalPhotoFile, setRentalPhotoFile] = useState(null);
  const [rentalForm, setRentalForm] = useState({ country: "uae", name_en: "", name_ar: "", area_en: "", area_ar: "", note_en: "", note_ar: "", map_link: "" });
  const [valuationForm, setValuationForm] = useState({ country: "uae", make: "", model: "", trim: "", year: "", mileage: "", engineSize: "", specs: "", condition: "", defects: "" });
  const [valuationPhotos, setValuationPhotos] = useState([]);
  const [valuationLoading, setValuationLoading] = useState(false);
  const [valuationResult, setValuationResult] = useState(null);
  const [valuationError, setValuationError] = useState("");
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
      // The whole app now requires Google sign-in (AppLoginGate), so the
      // session here is the user's app session. Never sign it out from the
      // admin page — that logged everyone out of the app and, because Google
      // returned them to /admin, trapped them in a sign-in loop.
      // Admin access is decided only by is_car_admin below.
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
      // Signed in, but not an admin: keep them signed in to the app,
      // just don't open the dashboard for them.
      if (active) {
        setUser(null);
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
    const [carsRes, garagesRes, photosRes, adminGaragesRes, maintenanceRes, mediaRes, rentalsRes, rentalRequestsRes, creditRequestsRes, pendingCarsRes] = await Promise.all([
      supabase.from("car_listings").select("*").in("status", ["approved", "sold"]).order("created_at", { ascending: false }),
      supabase.rpc("get_garage_admin_requests"),
      supabase.rpc("get_photo_diagnosis_requests"),
      supabase.from("garage_listings").select("*").eq("status", "approved").order("created_at", { ascending: false }),
      supabase.from("maintenance_centers").select("*").order("country").order("created_at", { ascending: false }),
      supabase.from("issue_media").select("*").order("sort_order").order("created_at", { ascending: false }),
      supabase.from("car_rentals").select("*").order("country").order("created_at", { ascending: false }),
      supabase.rpc("get_rental_admin_requests"),
      supabase.rpc("admin_list_credit_purchase_requests"),
      supabase.from("car_listings").select("*").eq("status", "pending").order("created_at", { ascending: false }),
    ]);
    if (carsRes.error) setLoginError(carsRes.error.message);
    if (garagesRes.error) setLoginError(garagesRes.error.message);
    if (photosRes.error) setLoginError(photosRes.error.message);
    if (adminGaragesRes.error) setLoginError(adminGaragesRes.error.message);
    if (maintenanceRes.error) setLoginError(maintenanceRes.error.message);
    if (mediaRes.error) setLoginError(mediaRes.error.message);
    if (rentalsRes.error) setLoginError(rentalsRes.error.message);
    if (rentalRequestsRes.error) setLoginError(rentalRequestsRes.error.message);
    if (creditRequestsRes.error) setLoginError(creditRequestsRes.error.message);
    setCars(carsRes.data || []);
    setGarageRequests(garagesRes.data || []);
    setPhotoRequests(photosRes.data || []);
    setAdminGarages(adminGaragesRes.data || []);
    setMaintenanceCenters(maintenanceRes.data || []);
    setIssueMedia(mediaRes.data || []);
    setRentals(rentalsRes.data || []);
    setRentalRequests(rentalRequestsRes.data || []);
    setCreditRequests(creditRequestsRes.data || []);
    setPendingCars(pendingCarsRes.data || []);
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

  async function updateRentalRequestStatus(item, nextStatus) {
    if (!supabase || !user) return;
    setBusyId(item.id);
    const { error } = await supabase.rpc("set_rental_status", {
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

  async function approveCreditPurchase(item) {
    if (!supabase || !user) return;
    setBusyId(item.id);
    setLoginError("");
    const { error } = await supabase.rpc("admin_approve_credit_purchase", {
      p_request_id: item.id,
    });
    setBusyId(null);
    if (error) {
      setLoginError(error.message);
      return;
    }
    await loadAll();
  }

  async function rejectCreditPurchase(item) {
    if (!supabase || !user) return;
    const ok = window.confirm(lang === "ar" ? "هل تريد رفض طلب شراء الكريديتس ده؟" : "Decline this credit purchase request?");
    if (!ok) return;
    setBusyId(item.id);
    setLoginError("");
    const { error } = await supabase.rpc("admin_reject_credit_purchase", {
      p_request_id: item.id,
    });
    setBusyId(null);
    if (error) {
      setLoginError(error.message);
      return;
    }
    await loadAll();
  }

  function openWhatsApp(phone, code, credits) {
    if (!phone || !code) return;
    const clean = String(phone).replace(/[^\d]/g, "");
    const msg = encodeURIComponent(
      `كود سيارتي لتشخيص الصور: ${code}\nالرصيد: ${credits} تشخيص\nاستخدم الكود داخل قسم تشخيص بالصور في تطبيق سيارتي.`
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

  async function addRental() {
    if (!supabase || !user) return;
    setLoginError("");
    setBusyId("new-rental");
    try {
      const f = rentalForm;
      if (!f.name_en.trim() && !f.name_ar.trim()) throw new Error(lang === "ar" ? "اكتب اسم شركة التأجير." : "Enter the rental company name.");
      const uploadedPhotoUrl = await uploadAdminPhoto(rentalPhotoFile, "rental");
      const { error } = await supabase.rpc("admin_create_rental", {
        p_country: f.country, p_name_en: f.name_en, p_name_ar: f.name_ar, p_area_en: f.area_en, p_area_ar: f.area_ar,
        p_note_en: f.note_en, p_note_ar: f.note_ar, p_map_link: f.map_link || null, p_photo_url: uploadedPhotoUrl || null
      });
      if (error) throw error;
      setRentalForm({ country: "uae", name_en: "", name_ar: "", area_en: "", area_ar: "", note_en: "", note_ar: "", map_link: "" });
      setRentalPhotoFile(null);
      await loadAll();
    } catch (error) {
      setLoginError(error?.message || t.adminUpdateError);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteRental(id) {
    if (!supabase || !user || !window.confirm(lang === "ar" ? "حذف شركة التأجير؟" : "Delete this rental company?")) return;
    setBusyId(id);
    const { error } = await supabase.rpc("admin_delete_rental", { p_id: id });
    setBusyId(null);
    if (error) { setLoginError(error.message); return; }
    await loadAll();
  }

  async function runAdminValuation() {
    if (!supabase || !user) return;
    setValuationError("");
    setValuationResult(null);
    setValuationLoading(true);
    try {
      const imageUrls = [];
      for (const file of valuationPhotos) {
        imageUrls.push(await uploadAdminPhoto(file, "valuation"));
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const res = await fetch("https://fgexzguyjgbwvvqoakly.supabase.co/functions/v1/car-valuation-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: supabase.supabaseKey,
        },
        body: JSON.stringify({ ...valuationForm, lang, imageUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.adminUpdateError);
      setValuationResult(data.estimate);
    } catch (err) {
      setValuationError(err?.message || t.adminUpdateError);
    } finally {
      setValuationLoading(false);
    }
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
    setRentals([]);
    setRentalRequests([]);
    setIssueMedia([]);
  }

  const fieldStyle = {
    width: "100%",
    background: C.bg,
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    padding: "11px 12px",
    color: C.text,
    fontSize: 13,
    marginBottom: 10,
    fontFamily: "inherit",
    textAlign: isRTL ? "right" : "left",
    boxSizing: "border-box",
  };

  if (checking) {
    return <div className="px-5 pt-8 text-center" style={{ color: C.textDim }}>{t.adminLoading}</div>;
  }

  if (!user) {
    return (
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={24} color={C.accent} />
          <h1 style={{ color: C.text, fontSize: 21, fontWeight: 700, margin: 0 }}>{t.adminTitle}</h1>
        </div>
        <p style={{ color: C.textDim, fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>
          {t.adminLoginRequired}
        </p>
        <form onSubmit={handleLogin}>
          <input type="email" autoComplete="username" placeholder={t.adminEmail} value={email}
            onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
          <input type="password" autoComplete="current-password" placeholder={t.adminPassword} value={password}
            onChange={(e) => setPassword(e.target.value)} style={fieldStyle} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: C.textDim, fontSize: 12, margin: "2px 0 12px", cursor: "pointer" }}>
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: C.accent }} />
            <span>{t.adminRememberMe}</span>
          </label>
          {loginError && <p style={{ color: C.red, fontSize: 12, lineHeight: 1.5 }}>{loginError}</p>}
          <button type="submit" style={{ width: "100%", background: C.accent, border: "none", borderRadius: 10, padding: "12px 14px", color: C.onAccent, fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
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
          <ShieldCheck size={22} color={C.accent} />
          <h1 style={{ color: C.text, fontSize: 21, fontWeight: 700, margin: 0 }}>{t.adminTitle}</h1>
        </div>
        <button onClick={logout} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.textDim, borderRadius: 9, padding: "7px 9px", cursor: "pointer" }}>
          <LogOut size={15} />
        </button>
      </div>

      <p style={{ color: C.textDim, fontSize: 12, marginTop: 4, marginBottom: 14 }}>
        {t.adminManageSubtitle}
      </p>

      {loginError && <p style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{loginError}</p>}

      <PendingCars
        cars={pendingCars}
        lang={lang}
        busyId={busyId}
        onApprove={(car) => updateCarStatus(car, "approved")}
        onReject={deleteCar}
      />

      <div className="flex gap-2 mb-4 overflow-x-auto" style={{ paddingBottom: 3 }}>
        {[
          ["cars", t.adminCarsTab, cars.length],
          ["creditRequests", lang === "ar" ? "طلبات كريديتس" : "Credit requests", creditRequests.filter(r=>r.status==="pending").length],
          ["manageGarages", t.adminManageGaragesTab, adminGarages.length],
          ["garage", t.adminGarageTab, garageRequests.filter(g=>g.status==="pending").length],
          ["rentalRequests", t.adminRentalRequestsTab, rentalRequests.filter(r=>r.status==="pending").length],
          ["maintenance", t.adminMaintenanceTab, maintenanceCenters.length],
          ["rentals", t.adminRentalsTab, rentals.length],
          ["valuation", t.adminValuationTab, "AI"],
          ["media", t.adminMediaTab, issueMedia.length],
        ].map(([id, label, count]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ minWidth: 105, background: tab === id ? C.accent : C.surface, color: tab === id ? C.onAccent : C.text, border: `1px solid ${tab === id ? C.accent : C.line}`, borderRadius: 10, padding: "9px 7px", fontSize: 10.5, fontWeight: 800 }}>
            {label}<br /><span style={{ fontSize: 9, opacity: .8 }}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: C.textDim, fontSize: 13, textAlign: "center" }}>{t.adminLoadingRequests}</p>
      ) : tab === "photo" ? (
        <div className="flex flex-col gap-2.5">
          {photoRequests.length === 0 && <p style={{ color: C.textDim, textAlign: "center", fontSize: 13 }}>{t.adminNoPhotoRequests}</p>}
          {photoRequests.map((p) => {
            const code = generatedCodes[p.id] || p.generated_code;
            return (
              <div key={p.id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12 }}>
                <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>{t.adminPhotoRequest}</div>
                <div style={{ color: C.textDim, fontSize: 12, marginTop: 5 }}>WhatsApp: {p.whatsapp_number}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>{t.adminPackage}: {p.package_credits} {t.adminDiagnosis} — {p.package_price} AED</div>
                <div style={{ color: p.status === "approved" ? C.green : p.status === "rejected" ? C.red : C.accent, fontSize: 11, fontWeight: 800, marginTop: 4 }}>
                  {t.adminStatus}: {p.status}
                </div>
                {p.receipt_url && (
                  <button type="button" onClick={() => openReceipt(p.receipt_url)}
                    style={{ display: "block", color: C.blue, fontSize: 12, marginTop: 8, background: "none", border: 0, padding: 0, cursor: "pointer" }}>
                    {t.adminViewReceipt}
                  </button>
                )}
                {code && (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: C.bg, border: `1px solid ${C.accent}55` }}>
                    <div style={{ color: C.textDim, fontSize: 11 }}>{t.adminCreditCode}</div>
                    <div dir="ltr" style={{ color: C.accent, fontSize: 18, fontWeight: 900, letterSpacing: 1.2 }}>{code}</div>
                    <button onClick={() => openWhatsApp(p.whatsapp_number, code, p.package_credits)}
                      style={{ width: "100%", marginTop: 8, background: C.accent, color: C.onAccent, border: "none", borderRadius: 8, padding: 9, fontWeight: 800 }}>
                      {t.adminSendCode}
                    </button>
                  </div>
                )}
                {!code && p.status === "pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button disabled={busyId === p.id} onClick={() => approvePhoto(p)}
                      style={{ flex: 1, background: C.accent, color: C.onAccent, border: "none", borderRadius: 9, padding: 10, fontWeight: 900 }}>
                      {busyId === p.id ? t.adminApproving : t.adminApproveGenerate}
                    </button>
                    <button disabled={busyId === p.id} onClick={() => rejectPhoto(p)}
                      style={{ flex: 1, background: "transparent", color: C.red, border: `1px solid ${C.red}66`, borderRadius: 9, padding: 10, fontWeight: 900 }}>
                      {t.adminReject}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : tab === "creditRequests" ? (
        <div className="flex flex-col gap-2.5">
          {creditRequests.length === 0 && (
            <p style={{ color: C.textDim, textAlign: "center", fontSize: 13 }}>
              {lang === "ar" ? "مفيش طلبات شراء كريديتس" : "No credit purchase requests"}
            </p>
          )}
          {creditRequests.map((r) => (
            <div key={r.id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12 }}>
              <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>
                {lang === "ar" ? "طلب شراء كريديتس" : "Credit purchase request"}
              </div>
              <div style={{ color: C.textDim, fontSize: 12, marginTop: 5 }}>
                {lang === "ar" ? "الكمية" : "Amount"}: {r.credits_requested} {lang === "ar" ? "كريديت" : "credits"}
              </div>
              <div style={{ color: C.text, fontSize: 12, marginTop: 2 }}>
                {lang === "ar" ? "المفروض الإيصال يكون بـ" : "Receipt should show"}:{" "}
                <strong style={{ color: C.accent }}>
                  {PACKAGES.find((p) => p.credits === r.credits_requested)?.price ?? "?"} {lang === "ar" ? "درهم" : "AED"}
                </strong>
              </div>
              <div style={{ color: r.status === "approved" ? C.green : r.status === "rejected" ? C.red : C.accent, fontSize: 11, fontWeight: 800, marginTop: 4 }}>
                {t.adminStatus}: {r.status}
              </div>
              {r.receipt_url && (
                <button type="button" onClick={() => openReceipt(r.receipt_url)}
                  style={{ display: "block", color: C.blue, fontSize: 12, marginTop: 8, background: "none", border: 0, padding: 0, cursor: "pointer" }}>
                  {t.adminViewReceipt}
                </button>
              )}
              {r.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button disabled={busyId === r.id} onClick={() => approveCreditPurchase(r)}
                    style={{ flex: 1, background: C.accent, color: C.onAccent, border: "none", borderRadius: 9, padding: 10, fontWeight: 900 }}>
                    {busyId === r.id ? t.adminApproving : (lang === "ar" ? "وافق وزوّد الرصيد" : "Approve & add credits")}
                  </button>
                  <button disabled={busyId === r.id} onClick={() => rejectCreditPurchase(r)}
                    style={{ flex: 1, background: "transparent", color: C.red, border: `1px solid ${C.red}66`, borderRadius: 9, padding: 10, fontWeight: 900 }}>
                    {t.adminReject}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : tab === "garage" ? (
        <div className="flex flex-col gap-2.5">
          {garageRequests.length === 0 && <p style={{ color: C.textDim, textAlign: "center", fontSize: 13 }}>{t.adminNoGarageRequests}</p>}
          {garageRequests.map((g) => (
            <div key={g.id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
              {g.photo_url && <img src={g.photo_url} alt={g.garage_name} style={{ width: "100%", height: 130, objectFit: "cover" }} />}
              <div style={{ padding: 12 }}>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 800 }}>{g.garage_name}</div>
                <div style={{ color: C.textDim, fontSize: 12, marginTop: 4 }}>{g.owner_name} · {g.phone}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>{g.address}</div>
                <div style={{ color: C.accent, fontSize: 12, marginTop: 5 }}>{t.adminRank}: {g.rank} · {Number(g.price).toLocaleString()} {t.adminYear}</div>
                <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>{t.adminStatus}: {g.status}</div>
                {g.receipt_url && <button type="button" onClick={() => openReceipt(g.receipt_url)} style={{ display: "block", color: C.blue, fontSize: 12, marginTop: 8, background: "none", border: 0, padding: 0, cursor: "pointer" }}>{t.adminViewReceipt}</button>}
                {g.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button disabled={busyId === g.id} onClick={() => updateGarageStatus(g, "approved")}
                      style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: 9, fontWeight: 800 }}>
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
      ) : tab === "rentalRequests" ? (
        <div className="flex flex-col gap-2.5">
          {rentalRequests.length === 0 && <p style={{ color: C.textDim, textAlign: "center", fontSize: 13 }}>{t.adminNoRentalRequests}</p>}
          {rentalRequests.map((g) => (
            <div key={g.id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
              {g.photo_url && <img src={g.photo_url} alt={g.rental_name} style={{ width: "100%", height: 130, objectFit: "cover" }} />}
              <div style={{ padding: 12 }}>
                <div style={{ color: C.text, fontSize: 14, fontWeight: 800 }}>{g.rental_name}</div>
                <div style={{ color: C.textDim, fontSize: 12, marginTop: 4 }}>{g.owner_name} · {g.phone}</div>
                <div style={{ color: C.textDim, fontSize: 12 }}>{g.address}</div>
                <div style={{ color: C.accent, fontSize: 12, marginTop: 5 }}>{t.adminRank}: {g.rank} · {Number(g.price).toLocaleString()} {t.adminYear}</div>
                <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>{t.adminStatus}: {g.status}</div>
                {g.receipt_url && <button type="button" onClick={() => openReceipt(g.receipt_url)} style={{ display: "block", color: C.blue, fontSize: 12, marginTop: 8, background: "none", border: 0, padding: 0, cursor: "pointer" }}>{t.adminViewReceipt}</button>}
                {g.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button disabled={busyId === g.id} onClick={() => updateRentalRequestStatus(g, "approved")}
                      style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: 9, fontWeight: 800 }}>
                      {t.adminApprove}
                    </button>
                    <button disabled={busyId === g.id} onClick={() => updateRentalRequestStatus(g, "rejected")}
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
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.text, fontWeight: 800, marginBottom: 10 }}>{t.adminAddGarage}</div>
            {[["garage_name", lang === "ar" ? "اسم الجراج" : "Garage name"],["owner_name", lang === "ar" ? "اسم المالك" : "Owner name"],["phone", lang === "ar" ? "الهاتف" : "Phone"],["address", lang === "ar" ? "العنوان" : "Address"]].map(([k,ph]) => <input key={k} placeholder={ph} value={garageForm[k]} onChange={e=>setGarageForm(v=>({...v,[k]:e.target.value}))} style={fieldStyle} />)}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display:"block", color:C.textDim, fontSize:11.5, marginBottom:6 }}>{lang === "ar" ? "صورة الجراج" : "Garage photo"}</label>
              <input type="file" accept="image/*" onChange={e=>setGaragePhotoFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding:9 }} />
              {garagePhotoFile && <div style={{ color:C.accent, fontSize:11, marginTop:-5, marginBottom:8 }}>{garagePhotoFile.name}</div>}
              {garagePhotoFile && <img src={URL.createObjectURL(garagePhotoFile)} alt="" style={{ width:"100%", height:110, objectFit:"cover", borderRadius:10, marginBottom:10 }} />}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={garageForm.country} onChange={e=>setGarageForm(v=>({...v,country:e.target.value}))} style={fieldStyle}><option value="uae">UAE</option><option value="ksa">KSA</option><option value="egypt">Egypt</option></select>
              <select value={garageForm.rank} onChange={e=>setGarageForm(v=>({...v,rank:e.target.value}))} style={fieldStyle}><option value="0">Normal</option><option value="1">Rank 1</option><option value="2">Rank 2</option><option value="3">Rank 3</option></select>
            </div>
            <button disabled={busyId === "new-garage"} onClick={addAdminGarage} style={{ width:"100%", background:C.accent,color:C.bg,border:"none",borderRadius:9,padding:10,fontWeight:900 }}>{busyId === "new-garage" ? "..." : t.adminAddGarage}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {adminGarages.map(g => <div key={g.id} style={{background:C.surface,border:`1px solid ${C.line}`,borderRadius:14,overflow:"hidden"}}>
              {g.photo_url && <img src={g.photo_url} alt={g.garage_name} style={{width:"100%",height:120,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
              <div style={{padding:12}}>
                <div style={{color:C.text,fontWeight:800}}>{g.garage_name}</div><div style={{color:C.textDim,fontSize:12,marginTop:4}}>{g.address} · {g.country}</div>
                <button disabled={busyId===g.id} onClick={()=>deleteAdminGarage(g.id)} style={{width:"100%",marginTop:9,background:"transparent",color:C.red,border:`1px solid ${C.red}88`,borderRadius:8,padding:9,fontWeight:800}}><Trash2 size={14} style={{verticalAlign:"middle",marginRight:5}} />{t.adminDelete}</button>
              </div>
            </div>)}
          </div>
        </div>
      ) : tab === "maintenance" ? (
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.text, fontWeight: 800, marginBottom: 10 }}>{t.adminAddMaintenance}</div>
            <select value={maintenanceForm.country} onChange={e=>setMaintenanceForm(v=>({...v,country:e.target.value}))} style={fieldStyle}><option value="uae">UAE</option><option value="ksa">KSA</option><option value="egypt">Egypt</option></select>
            {[["name_en","Name (EN)"],["name_ar","الاسم (AR)"],["area_en","Area (EN)"],["area_ar","المنطقة (AR)"],["note_en","Description (EN)"],["note_ar","الوصف (AR)"],["map_link","Maps link"]].map(([k,ph]) => <input key={k} placeholder={ph} value={maintenanceForm[k]} onChange={e=>setMaintenanceForm(v=>({...v,[k]:e.target.value}))} style={fieldStyle} />)}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display:"block", color:C.textDim, fontSize:11.5, marginBottom:6 }}>{lang === "ar" ? "صورة مركز الصيانة" : "Maintenance center photo"}</label>
              <input type="file" accept="image/*" onChange={e=>setMaintenancePhotoFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding:9 }} />
              {maintenancePhotoFile && <div style={{ color:C.accent, fontSize:11, marginTop:-5, marginBottom:8 }}>{maintenancePhotoFile.name}</div>}
              {maintenancePhotoFile && <img src={URL.createObjectURL(maintenancePhotoFile)} alt="" style={{ width:"100%", height:110, objectFit:"cover", borderRadius:10, marginBottom:10 }} />}
            </div>
            <button disabled={busyId === "new-maintenance"} onClick={addMaintenanceCenter} style={{ width:"100%", background:C.accent,color:C.bg,border:"none",borderRadius:9,padding:10,fontWeight:900 }}>{busyId === "new-maintenance" ? "..." : t.adminAddMaintenance}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {maintenanceCenters.map(m => <div key={m.id} style={{background:C.surface,border:`1px solid ${C.line}`,borderRadius:14,overflow:"hidden"}}>
              {m.photo_url && <img src={m.photo_url} alt={lang === "ar" ? m.name_ar : m.name_en} style={{width:"100%",height:120,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
              <div style={{padding:12}}>
                <div style={{color:C.text,fontWeight:800}}>{lang === "ar" ? m.name_ar : m.name_en}</div><div style={{color:C.textDim,fontSize:12,marginTop:4}}>{m.country} · {lang === "ar" ? m.area_ar : m.area_en}</div>
                <button disabled={busyId===m.id} onClick={()=>deleteMaintenanceCenter(m.id)} style={{width:"100%",marginTop:9,background:"transparent",color:C.red,border:`1px solid ${C.red}88`,borderRadius:8,padding:9,fontWeight:800}}><Trash2 size={14} style={{verticalAlign:"middle",marginRight:5}} />{t.adminDelete}</button>
              </div>
            </div>)}
          </div>
        </div>
      ) : tab === "rentals" ? (
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.text, fontWeight: 800, marginBottom: 10 }}>{t.adminAddRental}</div>
            <select value={rentalForm.country} onChange={e=>setRentalForm(v=>({...v,country:e.target.value}))} style={fieldStyle}><option value="uae">UAE</option><option value="ksa">KSA</option><option value="egypt">Egypt</option></select>
            {[["name_en","Name (EN)"],["name_ar","الاسم (AR)"],["area_en","Area (EN)"],["area_ar","المنطقة (AR)"],["note_en","Description (EN)"],["note_ar","الوصف (AR)"],["map_link","Maps link"]].map(([k,ph]) => <input key={k} placeholder={ph} value={rentalForm[k]} onChange={e=>setRentalForm(v=>({...v,[k]:e.target.value}))} style={fieldStyle} />)}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display:"block", color:C.textDim, fontSize:11.5, marginBottom:6 }}>{lang === "ar" ? "صورة شركة التأجير" : "Rental company photo"}</label>
              <input type="file" accept="image/*" onChange={e=>setRentalPhotoFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding:9 }} />
              {rentalPhotoFile && <div style={{ color:C.accent, fontSize:11, marginTop:-5, marginBottom:8 }}>{rentalPhotoFile.name}</div>}
              {rentalPhotoFile && <img src={URL.createObjectURL(rentalPhotoFile)} alt="" style={{ width:"100%", height:110, objectFit:"cover", borderRadius:10, marginBottom:10 }} />}
            </div>
            <button disabled={busyId === "new-rental"} onClick={addRental} style={{ width:"100%", background:C.accent,color:C.bg,border:"none",borderRadius:9,padding:10,fontWeight:900 }}>{busyId === "new-rental" ? "..." : t.adminAddRental}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {rentals.map(m => <div key={m.id} style={{background:C.surface,border:`1px solid ${C.line}`,borderRadius:14,overflow:"hidden"}}>
              {m.photo_url && <img src={m.photo_url} alt={lang === "ar" ? m.name_ar : m.name_en} style={{width:"100%",height:120,objectFit:"cover",display:"block"}} onError={(e)=>e.currentTarget.style.display="none"} />}
              <div style={{padding:12}}>
                <div style={{color:C.text,fontWeight:800}}>{lang === "ar" ? m.name_ar : m.name_en}</div><div style={{color:C.textDim,fontSize:12,marginTop:4}}>{m.country} · {lang === "ar" ? m.area_ar : m.area_en}</div>
                <button disabled={busyId===m.id} onClick={()=>deleteRental(m.id)} style={{width:"100%",marginTop:9,background:"transparent",color:C.red,border:`1px solid ${C.red}88`,borderRadius:8,padding:9,fontWeight:800}}><Trash2 size={14} style={{verticalAlign:"middle",marginRight:5}} />{t.adminDelete}</button>
              </div>
            </div>)}
          </div>
        </div>
      ) : tab === "valuation" ? (
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.text, fontWeight: 800, marginBottom: 4 }}>{t.adminValuationTitle}</div>
            <div style={{ color: C.textDim, fontSize: 11, lineHeight: 1.5, marginBottom: 10 }}>{t.adminValuationHint}</div>
            <select value={valuationForm.country} onChange={e=>setValuationForm(v=>({...v,country:e.target.value}))} style={fieldStyle}><option value="uae">UAE</option><option value="ksa">KSA</option><option value="egypt">Egypt</option></select>
            <select value={valuationForm.make} onChange={e=>setValuationForm(v=>({...v,make:e.target.value,model:""}))} style={fieldStyle}>
              <option value="">{lang==="ar"?"الماركة":"Make"}</option>
              {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {(CAR_MODELS[valuationForm.make]||[]).length ? (
              <select value={valuationForm.model} onChange={e=>setValuationForm(v=>({...v,model:e.target.value}))} style={fieldStyle}>
                <option value="">{lang==="ar"?"الموديل":"Model"}</option>
                {CAR_MODELS[valuationForm.make].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input placeholder={lang==="ar"?"الموديل":"Model"} value={valuationForm.model} onChange={e=>setValuationForm(v=>({...v,model:e.target.value}))} style={fieldStyle} />
            )}
            <input placeholder={lang==="ar"?"الفئة/التريم (اختياري)":"Trim (optional)"} value={valuationForm.trim} onChange={e=>setValuationForm(v=>({...v,trim:e.target.value}))} style={fieldStyle} />
            <input type="number" placeholder={lang==="ar"?"السنة":"Year"} value={valuationForm.year} onChange={e=>setValuationForm(v=>({...v,year:e.target.value}))} style={fieldStyle} />
            <input type="number" placeholder={lang==="ar"?"الكيلومترات":"Mileage (km)"} value={valuationForm.mileage} onChange={e=>setValuationForm(v=>({...v,mileage:e.target.value}))} style={fieldStyle} />
            <input placeholder={lang==="ar"?"سعة المحرك (اختياري)":"Engine size (optional)"} value={valuationForm.engineSize} onChange={e=>setValuationForm(v=>({...v,engineSize:e.target.value}))} style={fieldStyle} />
            <select value={valuationForm.specs} onChange={e=>setValuationForm(v=>({...v,specs:e.target.value}))} style={fieldStyle}>
              <option value="">{lang==="ar"?"المواصفات":"Specs"}</option>
              <option value="gulf">{lang==="ar"?"خليجي":"Gulf"}</option>
              <option value="american">{lang==="ar"?"أمريكي":"American"}</option>
            </select>
            <select value={valuationForm.condition} onChange={e=>setValuationForm(v=>({...v,condition:e.target.value}))} style={fieldStyle}>
              <option value="">{lang==="ar"?"الحالة العامة":"Condition"}</option>
              <option value="excellent">{lang==="ar"?"ممتازة":"Excellent"}</option>
              <option value="good">{lang==="ar"?"جيدة":"Good"}</option>
              <option value="fair">{lang==="ar"?"فيها أعطال":"Has issues"}</option>
            </select>
            <textarea rows={2} placeholder={lang==="ar"?"عيوب (اختياري)":"Defects (optional)"} value={valuationForm.defects} onChange={e=>setValuationForm(v=>({...v,defects:e.target.value}))} style={{...fieldStyle, resize:"vertical"}} />
            <div style={{ marginBottom: 10 }}>
              <label style={{ display:"block", color:C.textDim, fontSize:11.5, marginBottom:6 }}>{t.adminValuationPhotos}</label>
              <input type="file" accept="image/*" multiple onChange={e=>setValuationPhotos(Array.from(e.target.files||[]).slice(0,6))} style={{ ...fieldStyle, padding:9 }} />
              {valuationPhotos.length > 0 && (
                <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
                  {valuationPhotos.map((f,i) => <img key={i} src={URL.createObjectURL(f)} alt="" style={{ width:64, height:64, objectFit:"cover", borderRadius:8 }} />)}
                </div>
              )}
            </div>
            <button disabled={valuationLoading || !valuationForm.make || !valuationForm.model || !valuationForm.year || !valuationForm.mileage} onClick={runAdminValuation} style={{ width:"100%", background:C.accent,color:C.bg,border:"none",borderRadius:9,padding:11,fontWeight:900 }}>
              {valuationLoading ? t.adminValuationRunning : t.adminValuationBtn}
            </button>
          </div>
          {valuationError && <div style={{ color: C.red, fontSize:12.5, background:`${C.red}14`, border:`1px solid ${C.red}55`, borderRadius:10, padding:"10px 12px", marginBottom:12 }}>{valuationError}</div>}
          {valuationResult && (
            <div style={{ background: C.surface, border: `1px solid ${C.accentDim}`, borderRadius: 14, padding: 14, whiteSpace:"pre-wrap", color:C.text, fontSize:13, lineHeight:1.7 }}>
              {valuationResult}
            </div>
          )}
        </div>
      ) : tab === "media" ? (
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 12 }}>
            <div style={{ color: C.text, fontWeight: 800, marginBottom: 10 }}>{t.adminAddMedia}</div>
            <select value={mediaIssueId} onChange={e=>setMediaIssueId(e.target.value)} style={fieldStyle}>
              {Object.keys(ISSUES).map(id => <option key={id} value={id}>{ISSUES[id]?.en?.title || id}</option>)}
            </select>
            <select value={mediaLang} onChange={e=>setMediaLang(e.target.value)} style={fieldStyle}>
              <option value="en">English</option><option value="ar">العربية</option>
            </select>
            <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={e=>setMediaFile(e.target.files?.[0] || null)} style={{ ...fieldStyle, padding:9 }} />
            {mediaFile && <div style={{ color:C.accent, fontSize:11, marginTop:-5, marginBottom:8 }}>{mediaFile.name} · {(mediaFile.size/1024/1024).toFixed(2)} MB</div>}
            <div style={{ color:C.textDim, fontSize:10.5, lineHeight:1.5, marginBottom:10 }}>{t.adminMediaLimit}</div>
            <button disabled={!mediaFile || busyId === "new-media"} onClick={addIssueMedia} style={{ width:"100%", background:C.accent,color:C.bg,border:"none",borderRadius:9,padding:10,fontWeight:900 }}>{busyId === "new-media" ? "..." : t.adminMediaUpload}</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {issueMedia.length === 0 && <p style={{ color:C.textDim, textAlign:"center", fontSize:13 }}>{t.adminMediaEmpty}</p>}
            {issueMedia.map(m => <div key={m.id} style={{background:C.surface,border:`1px solid ${C.line}`,borderRadius:14,overflow:"hidden"}}>
              {m.media_type === "video" ? <video src={m.url} controls preload="metadata" style={{width:"100%",maxHeight:180,background:"#000"}} /> : <img src={m.url} alt={m.title || m.issue_id} style={{width:"100%",height:140,objectFit:"cover",display:"block"}} />}
              <div style={{padding:10}}>
                <div style={{color:C.text,fontWeight:800,fontSize:12}}>{ISSUES[m.issue_id]?.[m.lang]?.title || m.issue_id}</div>
                <div style={{color:C.textDim,fontSize:10.5,marginTop:3}}>{m.lang.toUpperCase()} · {m.media_type} · {m.file_size_bytes ? `${(m.file_size_bytes/1024/1024).toFixed(2)} MB` : ""}</div>
                <button disabled={busyId===m.id} onClick={()=>deleteIssueMedia(m)} style={{width:"100%",marginTop:8,background:"transparent",color:C.red,border:`1px solid ${C.red}88`,borderRadius:8,padding:8,fontWeight:800}}><Trash2 size={13} style={{verticalAlign:"middle",marginRight:5}} />{t.adminDelete}</button>
              </div>
            </div>)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cars.length === 0 && <p style={{ color: C.textDim, textAlign: "center", fontSize: 13 }}>{t.adminNoCars}</p>}
          {cars.map((c) => (
            <div key={c.id} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
              {(c.photo_url || c.photo_urls?.[0]) && (
                <div style={{ position: "relative" }}>
                  <CarMedia src={c.photo_url || c.photo_urls[0]} alt={c.make_model} style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} />
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
                    <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{c.make_model}{c.year ? ` · ${c.year}` : ""}</div>
                    <div style={{ color: C.textDim, fontSize: 11.5, marginTop: 3 }}>{c.price}{c.city ? ` · ${c.city}` : ""}</div>
                  </div>
                  <span style={{ color: c.status === "sold" ? C.red : C.accent, fontSize: 11, fontWeight: 800 }}>{c.status === "sold" ? t.adminSold : t.adminAvailable}</span>
                </div>
                <button disabled={busyId === c.id} onClick={() => updateCarStatus(c, c.status === "sold" ? "approved" : "sold")}
                  className="flex items-center justify-center gap-2 mt-3"
                  style={{ width: "100%", background: "transparent", border: `1px solid ${c.status === "sold" ? C.accentDim : C.red}88`, borderRadius: 10, padding: "9px 12px", cursor: busyId === c.id ? "wait" : "pointer", color: c.status === "sold" ? C.accent : C.red, fontSize: 12.5, fontWeight: 700 }}>
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
