import React from "react";

// Car listings take short videos as well as photos; both live in the same photo fields.
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"]);
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024;
export const CAR_MEDIA_ACCEPT = "image/*,video/mp4,video/webm,video/quicktime,video/x-m4v";

export function isVideoFile(file) {
  return !!file && (VIDEO_TYPES.has(file.type) || VIDEO_EXT.test(file.name || ""));
}

// `video` forces a video for a local preview, whose blob: address has no file extension.
export default function CarMedia({ src, video, alt, style, onClick, onError, muted, controls = true }) {
  if (video || VIDEO_EXT.test(src || "")) {
    return (
      <video
        src={src}
        controls={controls}
        playsInline
        muted={muted}
        preload="metadata"
        aria-label={alt || "Car video"}
        onClick={onClick}
        // show the first frame instead of a blank box
        onLoadedData={(e) => { try { e.currentTarget.currentTime = 0.01; } catch (_) {} }}
        style={{ background: "#0F1115", ...style }}
      />
    );
  }
  return <img src={src} alt={alt || ""} onClick={onClick} onError={onError} style={style} />;
}
