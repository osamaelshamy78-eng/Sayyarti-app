const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

function isCarsPage() {
  const p = window.location.pathname.toLowerCase();
  return p.includes("car") || p.includes("sell");
}

function isVideoFile(file) {
  return !!file && (VIDEO_TYPES.has(file.type) || VIDEO_EXT.test(file.name || ""));
}

function enhanceInput(input) {
  if (!input || input.type !== "file") return;
  const accept = input.getAttribute("accept") || "";
  if (!accept.includes("image")) return;

  input.setAttribute("accept", "image/*,video/mp4,video/webm,video/quicktime,video/x-m4v");
  input.dataset.karajiCarMediaEnhanced = "1";

  if (input.dataset.karajiCarMediaListener !== "1") {
    input.dataset.karajiCarMediaListener = "1";
    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      const oversized = files.find((file) => isVideoFile(file) && file.size > MAX_VIDEO_BYTES);
      if (oversized) {
        input.value = "";
        window.alert("Short car videos must be 15 MB or smaller.");
        return;
      }

      input.dataset.karajiSelectedVideo = files.some(isVideoFile) ? "1" : "0";
      scheduleVideoPreviewRepair(input);
    }, { capture: true });
  }

  scheduleVideoPreviewRepair(input);
}

function findPreviewImages(input, expectedCount) {
  let node = input.parentElement;
  for (let i = 0; i < 12 && node; i += 1, node = node.parentElement) {
    const images = Array.from(node.querySelectorAll?.("img") || []).filter((img) => {
      const src = img.currentSrc || img.src || "";
      return src.startsWith("blob:");
    });
    if (images.length >= expectedCount) return { container: node, images };
  }
  return null;
}

function repairVideoPreviews(input) {
  if (!input || !input.isConnected) return;
  const files = Array.from(input.files || []);
  const videoIndexes = files.map((file, index) => (isVideoFile(file) ? index : -1)).filter((index) => index >= 0);
  if (!videoIndexes.length) return;

  const found = findPreviewImages(input, files.length);
  if (!found) return;

  videoIndexes.forEach((index) => {
    const img = found.images[index];
    if (!img || img.dataset.karajiVideoPreview === "1") return;

    const src = URL.createObjectURL(files[index]);
    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.muted = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", "Short car video preview");
    video.dataset.karajiVideoPreview = "1";
    video.dataset.karajiVideoObjectUrl = src;
    video.style.cssText = img.getAttribute("style") || "width:72px;height:72px;object-fit:cover;display:block;border-radius:10px;border:1px solid #2A2F38;background:#0F1115;";

    video.addEventListener("loadeddata", () => {
      try { video.currentTime = 0.01; } catch (_) {}
    }, { once: true });

    img.replaceWith(video);
  });
}

function scheduleVideoPreviewRepair(input) {
  [0, 50, 120, 250, 500, 900, 1400].forEach((delay) => {
    window.setTimeout(() => repairVideoPreviews(input), delay);
  });
}

function replacePublishedVideoImages(root = document) {
  const mediaNodes = root.querySelectorAll?.("img") || [];
  mediaNodes.forEach((img) => {
    const src = img.currentSrc || img.src || "";
    if (!VIDEO_EXT.test(src) || img.dataset.karajiVideoReplaced === "1") return;

    const video = document.createElement("video");
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.dataset.karajiVideoReplaced = "1";
    video.style.cssText = img.getAttribute("style") || "width:100%;height:150px;object-fit:cover;display:block;";
    video.setAttribute("aria-label", "Car listing video");
    img.replaceWith(video);
  });
}

function enhanceCarUpload(root = document) {
  if (!isCarsPage()) return;

  const inputs = root.querySelectorAll?.('input[type="file"]') || [];
  inputs.forEach(enhanceInput);
  inputs.forEach((input) => {
    if (input.dataset.karajiSelectedVideo === "1") scheduleVideoPreviewRepair(input);
  });

  replacePublishedVideoImages(root);
}

export function startCarMediaEnhancer() {
  if (window.__karajiCarMediaEnhancerStarted) return;
  window.__karajiCarMediaEnhancerStarted = true;

  const run = () => enhanceCarUpload(document);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  let observerTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimer);
    observerTimer = window.setTimeout(run, 50);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
