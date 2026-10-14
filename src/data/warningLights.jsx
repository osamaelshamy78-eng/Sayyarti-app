/* ---------------------------------------------------------------
   Dashboard warning-light icons
   Hand-drawn to resemble the actual symbols cars show on the
   instrument cluster, not generic icons.
--------------------------------------------------------------- */
const iconProps = (size, color, strokeWidth) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export function EngineLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <rect x="4" y="10" width="12" height="7" rx="1" />
      <rect x="6.5" y="6.5" width="2.5" height="3.5" />
      <rect x="10" y="6.5" width="2.5" height="3.5" />
      <path d="M16 12.5h2.5l1.5 2v2.5h-4" />
      <line x1="2" y1="13.5" x2="4" y2="13.5" />
    </svg>
  );
}

export function BatteryLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <rect x="4" y="9" width="16" height="10" rx="1" />
      <rect x="8" y="6.3" width="2.4" height="3" fill={color} stroke="none" />
      <rect x="13.6" y="6.3" width="2.4" height="3" fill={color} stroke="none" />
      <line x1="7.5" y1="14" x2="10.5" y2="14" />
      <line x1="9" y1="12.5" x2="9" y2="15.5" />
      <line x1="13.5" y1="14" x2="16.5" y2="14" />
    </svg>
  );
}

export function OilLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <path d="M6 11c0-1.1.9-2 2-2h5l3.5-2.4v2.4H17a2 2 0 012 2v4.5a2 2 0 01-2 2H9.5A3.5 3.5 0 016 14V11z" />
      <circle cx="9.5" cy="18.3" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

export function BrakeLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.3 7.5c-1.7 1.6-1.7 7.4 0 9" />
      <path d="M14.7 7.5c1.7 1.6 1.7 7.4 0 9" />
      <line x1="12" y1="8.5" x2="12" y2="13" />
      <circle cx="12" cy="15.5" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

export function TempLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <rect x="10.5" y="3.5" width="3" height="10" rx="1.5" />
      <circle cx="12" cy="17" r="3" />
      <line x1="12" y1="7" x2="12" y2="15" />
      <path d="M3.5 20c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0" />
    </svg>
  );
}

export function TireLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <path d="M4.5 11a7.5 4.5 0 0115 0" />
      <path d="M4.5 11c0 3 1.7 4.8 1.7 7.5h2c0-2.7-1-4.5-1-7.5" />
      <path d="M19.5 11c0 3-1.7 4.8-1.7 7.5h-2c0-2.7 1-4.5 1-7.5" />
      <line x1="12" y1="10" x2="12" y2="14.5" />
      <circle cx="12" cy="16.8" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}

export function TransmissionLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 5.5v2M12 16.5v2M5.5 12h2M16.5 12h2M7.3 7.3l1.4 1.4M15.3 15.3l1.4 1.4M7.3 16.7l1.4-1.4M15.3 8.7l1.4-1.4" />
    </svg>
  );
}

export function SteeringLightIcon({ size = 24, color = "currentColor", strokeWidth = 1.6 }) {
  return (
    <svg {...iconProps(size, color, strokeWidth)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="2.3" />
      <path d="M12 5.5v4.2M6.3 15.2l3.6-2.1M17.7 15.2l-3.6-2.1" />
      <line x1="19" y1="5" x2="19" y2="8" />
      <circle cx="19" cy="10.3" r="0.6" fill={color} stroke="none" />
    </svg>
  );
}
