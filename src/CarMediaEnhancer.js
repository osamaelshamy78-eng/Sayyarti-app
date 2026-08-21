const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i;
const MAX_VIDEO_BYTES = 15 * 1024 * 1024;

function isCarsPage() {
  const p = window.location.pathname.toLowerCase();
  return p.includes("car") || p.includes("sell");
}

function getFileInputs(root = document) {
  return Array.from(root.querySelectorAll?.('input[type="file"]') || []).filter((input) => {
    const accept = input.getAttribute("accept") || "";
    return accept.includes("image");
  });
}

function findPreviewContainer(input) {
  let node = input.parentElement;
  for (let i = 0; i < 8 && node; i += 1, node = node.parentElement) {
    const images = node.querySelectorAll?.("img") || [];
    const files = Array.from(input.files || []);
    if (files.length && images.length >= files.length) return node;
  }
  return null;
}

function replaceLocalVideoPreviews(input) {
  const files = Array.from(input.files || []);
  const videoFiles = files.filter((file) => VIDEO_TYPES.has(file.type) || VIDEO_EXT.test(file.name || ""));
  if (!videoFiles.length) return;

  const container = findPreviewContainer(input);
  if (!container) return;
  const images = Array.from(container.querySelectorAll("img"));

  videoFiles.forEach((file) => {
    const index = files.indexOf(file);
    const img = images[index];
    if (!img || img.dataset.karajiVideoPreview === "1") return;

    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);
    video.dataset.karajiVideoPreview = "1";
    video.dataset.karajiVideoObjectUrl = video.src;
    video.setAttribute("aria-label", "Car video preview");
    video.style.cssText = img.getAttribute("style") || "width:72px;height:72px;object-fit:cover;display:block;border-radius:10px;";

    const wrapper = img.parentElement;
    if (wrapper) {
      wrapper.dataset.karajiVideoPreviewWrapper = "1";
      wrapper.style.cursor = "pointer";
      wrapper.title = "Play video preview";
      wrapper.replaceChild(video, img);
    } else {
      img.replaceWith(video);
    }
  });
}

function enhanceCarUpload(root = document) {
  if (!isCarsPage()) return;

  const inputs = getFileInputs(root);
  inputs.forEach((input) => {
    if (input.dataset.karajiCarMediaEnhanced !== "1") {
      input.dataset.karajiCarMediaEnhanced = "1";
      input.setAttribute("accept", "image/*,video/mp4,video/webm,video/quicktime,video/x-m4v");

      input.addEventListener("change", (event) => {
        const files = Array.from(event.target.files || []);
        const oversized = files.find((file) => {
          const isVideo = VIDEO_TYPES.has(file.type) || VIDEO_EXT.test(file.name || "");
          return isVideo && file.size > MAX_VIDEO_BYTES;
        });
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

        // React creates its blob previews just after the change event.
        // Run a few times so the video thumbnail is replaced after React renders.
        [0, 60, 180, 400].forEach((delay) => setTimeout(() => replaceLocalVideoPreviews(input), delay));
      }, { capture: true });
    }

    replaceLocalVideoPreviews(input);
  });

  // Also handle already-published listing cards/details when the stored URL is a video.
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
