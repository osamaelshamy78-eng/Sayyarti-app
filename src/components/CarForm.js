import React, { useEffect, useRef } from "react";
import OriginalCarForm from "./CarForm.jsx";

const MAX_MEDIA = 6;

export default function CarFormMediaWrapper(props) {
  const rootRef = useRef(null);
  const mediaFilesRef = useRef([]);
  const mediaUrlsRef = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaInput = () => {
      const input = root.querySelector('input[type="file"]');
      if (!input) return false;

      input.accept = "image/*,video/*";
      input.multiple = true;
      input.setAttribute("aria-label", props.lang === "ar" ? "إضافة صور أو فيديو" : "Add photos or videos");

      const label = input.closest("label");
      if (label && !label.querySelector("[data-media-hint]")) {
        const hint = document.createElement("span");
        hint.setAttribute("data-media-hint", "true");
        hint.textContent = props.lang === "ar" ? "صور / فيديو" : "Photo / Video";
        hint.style.fontSize = "9px";
        hint.style.marginLeft = "4px";
        hint.style.fontWeight = "700";
        hint.style.textAlign = "center";
        hint.style.lineHeight = "1.1";
        label.appendChild(hint);
      }

      return true;
    };

    const renderVideoPreviews = () => {
      if (!mediaFilesRef.current.length) return;

      const images = Array.from(root.querySelectorAll("img"));
      images.forEach((img) => {
        const src = img.getAttribute("src") || img.src;
        const index = mediaUrlsRef.current.indexOf(src);
        if (index < 0) return;

        const file = mediaFilesRef.current[index];
        if (!file || !file.type.startsWith("video/")) return;
        if (img.dataset.videoPreview === "true") return;

        const video = document.createElement("video");
        video.dataset.videoPreview = "true";
        video.src = mediaUrlsRef.current[index];
        video.muted = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.style.cssText = img.style.cssText;
        video.style.width = "72px";
        video.style.height = "72px";
        video.style.objectFit = "cover";
        video.style.borderRadius = "10px";
        video.style.border = "1px solid #2A2F38";
        video.setAttribute("aria-label", props.lang === "ar" ? "معاينة الفيديو" : "Video preview");

        const badge = document.createElement("span");
        badge.textContent = props.lang === "ar" ? "فيديو" : "VIDEO";
        badge.style.cssText = "position:absolute;left:4px;bottom:4px;padding:2px 5px;border-radius:5px;background:rgba(0,0,0,.72);color:#fff;font-size:8px;font-weight:800;line-height:1";

        const wrapper = img.parentElement;
        if (wrapper) {
          img.replaceWith(video);
          wrapper.appendChild(badge);
        }
      });
    };

    const onChangeCapture = (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file") return;

      const files = Array.from(input.files || []);
      const remaining = Math.max(0, MAX_MEDIA - mediaFilesRef.current.length);
      const accepted = files.slice(0, remaining);

      accepted.forEach((file) => {
        mediaFilesRef.current.push(file);
        mediaUrlsRef.current.push(URL.createObjectURL(file));
      });

      requestAnimationFrame(renderVideoPreviews);
      setTimeout(renderVideoPreviews, 50);
      setTimeout(renderVideoPreviews, 250);
    };

    root.addEventListener("change", onChangeCapture, true);

    const observer = new MutationObserver(() => {
      syncMediaInput();
      renderVideoPreviews();
    });
    observer.observe(root, { childList: true, subtree: true });

    syncMediaInput();
    renderVideoPreviews();

    return () => {
      root.removeEventListener("change", onChangeCapture, true);
      observer.disconnect();
      mediaUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      mediaUrlsRef.current = [];
      mediaFilesRef.current = [];
    };
  }, [props.lang]);

  return React.createElement(
    "div",
    { ref: rootRef, style: { width: "100%" } },
    React.createElement(OriginalCarForm, props)
  );
}
