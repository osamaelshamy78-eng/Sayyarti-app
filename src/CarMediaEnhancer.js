const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

function isCarsPage() {
  const p = window.location.pathname.toLowerCase();
  return p.includes("car") || p.includes("sell");
}

function replaceLocalVideoPreviews(root = document) {
  const images = root.querySelectorAll?.('img[src^="blob:"]') || [];
  images.forEach(async (img) => {
    if (img.dataset.karajiLocalVideoChecked === "1") return;
    img.dataset.karajiLocalVideoChecked = "1";

    const src = img.currentSrc || img.src || "";
    if (!src.startsWith("blob:")) return;

    try {
      const response = await fetch(src);
      const blob = await response.blob();
      if (!VIDEO_TYPES.has(blob.type)) return;
      if (!img.isConnected) return;

      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.muted = true;
      video.setAttribute("aria-label", "Short car video preview");
      video.style.cssText = "width:72px;height:72px;border-radius:10px;object-fit:cover;border:1px solid #2A2F38;background:#0F1115;display:block;";
      video.dataset.karajiLocalVideoPreview = "1";
      img.replaceWith(video);
    } catch (error) {
      console.debug("Karaji: could not inspect local media preview", error);
    }
  });
}

function enhanceCarUpload(root = document) {
  if (!isCarsPage()) return;

  const inputs = root.querySelectorAll?.('input[type="file"]') || [];
  inputs.forEach((input) => {
    const accept = input.getAttribute("accept") || "";
    if (!accept.includes("image")) return;
    if (input.dataset.karajiCarMediaEnhanced === "1") return;

    input.dataset.karajiCarMediaEnhanced = "1";
    input.setAttribute("accept", "image/*,video/mp4,video/webm,video/quicktime,video/x-m4v");

    input.addEventListener("change", (event) => {
      const files = Array.from(event.target.files || []);
      const oversized = files.find((file) => VIDEO_TYPES.has(file.type) && file.size > MAX_VIDEO_BYTES);
      if (oversized) {
        event.target.value = "";
        window.alert("Short car videos must be 15 MB or smaller.");
        return;
      }

      const label = input.closest("label");
      if (label && !label.querySelector("[data-karaji-video-hint]")) {
        const hint = document.createElement("span");
        hint.dataset.karajiVideoHint = "1";
        hint.textContent = "Photo or short video (max 15 MB)";
        hint.style.cssText = "display:block;width:100%;margin-top:5px;text-align:center;font-size:10px;color:#B9B2A0;line-height:1.2;";
        label.appendChild(hint);
      }
    }, { capture: true });
  });

  // The React car form creates object URLs and currently renders every
  // selected file as <img>. Detect local video blobs and replace only those
  // previews with a native video player. This keeps image previews untouched.
  replaceLocalVideoPreviews(root);

  // React currently previews uploaded listing media with <img>. Replace
  // remote video URLs with a native player when a listing is displayed.
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

export function startCarMediaEnhancer() {
  if (window.__karajiCarMediaEnhancerStarted) return;
  window.__karajiCarMediaEnhancerStarted = true;

  const run = () => enhanceCarUpload(document);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  const observer = new MutationObserver(() => run());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
