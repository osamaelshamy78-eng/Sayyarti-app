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
      const mediaFiles = mediaFilesRef.current;
      if (!mediaFiles.length) return;

      const thumbnails = Array.from(root.querySelectorAll("img")).filter((img) => img.width === 72 || img.height === 72);
      mediaFiles.forEach((file, index) => {
        if (!file.type.startsWith("video/")) return;
        const img = thumbnails[index];
        if (!img || img.dataset.videoPreview === "true") return;

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
        video.setAttribute("aria-label", "Video preview");
        img.replaceWith(video);
      });
    };

    const onChangeCapture = (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.type !== "file") return;

      const files = Array.from(input.files || []);
      const remaining = Math.max(0, MAX_MEDIA - mediaFilesRef.current.length);
      const accepted = files.slice(0, remaining);

      for (const file of accepted) {
        mediaFilesRef.current.push(file);
        mediaUrlsRef.current.push(URL.createObjectURL(file));
      }

      requestAnimationFrame(renderVideoPreviews);
      setTimeout(renderVideoPreviews, 50);
    };

    root.addEventListener("change", onChangeCapture, true);

    const observer = new MutationObserver(() => {
      syncMediaInput();
      renderVideoPreviews();
    });
    observer.observe(root, { childList: true, subtree: true });
    syncMediaInput();

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
