// CCTV Evidence & Automatic Photo Generation Store

export interface GeneratedPhoto {
  id: string; // e.g. "Photo 01"
  cctvId: string;
  storeId: string;
  timestamp: string; // e.g. "09:14 AM"
  timeMinutes: number; // for chronological sorting
  status: "Unreviewed" | "Correct" | "Incorrect" | "Needs Review";
  officerComment?: string;
  imageUrl: string;
  zone: string;
}

export interface CctvSubmission {
  id: string;
  storeId: string;
  storeName: string;
  videoName: string;
  durationLabel: string;
  durationHours: number;
  uploadDate: string;
  status: "Processing" | "Pending Review" | "Verified";
  photosCount: number;
  finalRating?: number;
  officerComment?: string;
  inspectionDate?: string;
  officerName?: string;
}

// Generate realistic CCTV frame SVG/data URL with timestamps & camera HUD (16:9 aspect ratio)
export function generateCctvPhotoDataUrl(
  timestamp: string,
  zone: string,
  storeId: string,
  index: number
): string {
  // Pre-calibrated high-contrast surveillance palettes (never pure black voids)
  const palettes = [
    { bg: "#0d1b2a", accent: "#38bdf8", floor: "#1b263b", equipment: "#243447", border: "#415a77" },
    { bg: "#13213a", accent: "#06b6d4", floor: "#1a2c4e", equipment: "#223a63", border: "#3b82f6" },
    { bg: "#11261d", accent: "#10b981", floor: "#1b3b2f", equipment: "#234d3d", border: "#34d399" },
    { bg: "#1a1a2e", accent: "#818cf8", floor: "#262642", equipment: "#333357", border: "#a5b4fc" },
    { bg: "#251c22", accent: "#f59e0b", floor: "#352630", equipment: "#473440", border: "#fbbf24" },
  ];
  const p = palettes[index % palettes.length];
  const camNumber = String((index % 4) + 1).padStart(2, "0");

  // Zone specific scene elements
  let zoneGraphics = "";
  const lowerZone = zone.toLowerCase();

  if (lowerZone.includes("prep") || lowerZone.includes("kitchen")) {
    zoneGraphics = `
      <!-- Kitchen Prep Counter & Stations -->
      <rect x="70" y="160" width="180" height="90" rx="4" fill="${p.equipment}" stroke="${p.border}" stroke-width="1.5" />
      <rect x="80" y="170" width="70" height="40" rx="2" fill="#334155" stroke="${p.accent}" stroke-width="1" />
      <text x="85" y="195" fill="#94a3b8" font-family="monospace" font-size="9">PREP TRAY 1</text>
      <rect x="160" y="170" width="70" height="40" rx="2" fill="#334155" stroke="${p.accent}" stroke-width="1" />
      <text x="165" y="195" fill="#94a3b8" font-family="monospace" font-size="9">PREP TRAY 2</text>
      <rect x="290" y="150" width="280" height="100" rx="4" fill="${p.equipment}" stroke="${p.border}" stroke-width="1.5" />
      <circle cx="360" cy="180" r="16" fill="#475569" stroke="${p.accent}" stroke-width="1" />
      <rect x="410" y="170" width="130" height="25" rx="3" fill="#1e293b" stroke="${p.border}" stroke-width="1" />
      <text x="420" y="187" fill="#38bdf8" font-family="monospace" font-size="10">SAN-STATION [ACTIVE]</text>
      <!-- Personnel Silhouette with Hairnet & Mask -->
      <circle cx="230" cy="115" r="18" fill="#cbd5e1" />
      <path d="M 215 110 A 15 14 0 0 1 245 110" stroke="#ffffff" stroke-width="3" fill="none" />
      <path d="M 210 135 C 210 128 250 128 250 135 L 255 220 L 205 220 Z" fill="#475569" />
      <rect x="216" y="145" width="28" height="45" rx="2" fill="#f8fafc" opacity="0.9" />
    `;
  } else if (lowerZone.includes("handwash")) {
    zoneGraphics = `
      <!-- Handwash Station -->
      <rect x="160" y="140" width="320" height="120" rx="6" fill="${p.equipment}" stroke="${p.border}" stroke-width="1.5" />
      <rect x="220" y="160" width="200" height="60" rx="20" fill="#0f172a" stroke="${p.accent}" stroke-width="2" />
      <!-- Chrome Faucet -->
      <path d="M 320 130 L 320 165 M 315 130 L 325 130" stroke="#e2e8f0" stroke-width="5" stroke-linecap="round" />
      <!-- Water flow stream -->
      <line x1="320" y1="165" x2="320" y2="185" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3,2" />
      <!-- Wall Compliance Chart -->
      <rect x="80" y="80" width="90" height="60" rx="3" fill="#1e293b" stroke="#22c55e" stroke-width="1.5" />
      <text x="90" y="100" fill="#22c55e" font-family="monospace" font-size="9" font-weight="bold">HYGIENE SOP</text>
      <text x="90" y="115" fill="#94a3b8" font-family="monospace" font-size="8">7-STEP WASH</text>
      <text x="90" y="128" fill="#38bdf8" font-family="monospace" font-size="8">AUDIT PASS ✓</text>
      <!-- Soap Dispenser -->
      <rect x="440" y="110" width="30" height="50" rx="4" fill="#334155" stroke="${p.border}" stroke-width="1" />
      <circle cx="455" cy="150" r="5" fill="#38bdf8" />
    `;
  } else if (lowerZone.includes("entrance")) {
    zoneGraphics = `
      <!-- Store Entrance Glass Doors -->
      <rect x="180" y="70" width="130" height="210" fill="#1e293b" opacity="0.6" stroke="${p.accent}" stroke-width="2" />
      <rect x="330" y="70" width="130" height="210" fill="#1e293b" opacity="0.6" stroke="${p.accent}" stroke-width="2" />
      <!-- Door Handles -->
      <line x1="295" y1="140" x2="295" y2="200" stroke="#f8fafc" stroke-width="4" stroke-linecap="round" />
      <line x1="345" y1="140" x2="345" y2="200" stroke="#f8fafc" stroke-width="4" stroke-linecap="round" />
      <!-- Welcome Foot Mat -->
      <polygon points="170,270 470,270 510,320 130,320" fill="#0f172a" stroke="${p.border}" stroke-width="1.5" />
      <text x="250" y="300" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">WELCOME</text>
      <!-- Overhead Sensor -->
      <rect x="280" y="60" width="80" height="14" rx="3" fill="#0f172a" stroke="#22c55e" stroke-width="1" />
      <circle cx="320" cy="67" r="3" fill="#22c55e" />
    `;
  } else if (lowerZone.includes("inventory") || lowerZone.includes("shelves")) {
    zoneGraphics = `
      <!-- Multi-tier Warehouse Racks -->
      <line x1="80" y1="80" x2="80" y2="280" stroke="${p.accent}" stroke-width="4" />
      <line x1="560" y1="80" x2="560" y2="280" stroke="${p.accent}" stroke-width="4" />
      <line x1="320" y1="80" x2="320" y2="280" stroke="${p.accent}" stroke-width="3" />
      <!-- Tier Shelves -->
      <line x1="80" y1="140" x2="560" y2="140" stroke="${p.border}" stroke-width="3" />
      <line x1="80" y1="200" x2="560" y2="200" stroke="${p.border}" stroke-width="3" />
      <line x1="80" y1="260" x2="560" y2="260" stroke="${p.border}" stroke-width="3" />
      <!-- Inventory Boxes with Barcodes -->
      <rect x="100" y="100" width="80" height="38" rx="2" fill="#78350f" stroke="#b45309" stroke-width="1" />
      <rect x="190" y="95" width="110" height="43" rx="2" fill="#854d0e" stroke="#ca8a04" stroke-width="1" />
      <rect x="340" y="160" width="90" height="38" rx="2" fill="#1e3a8a" stroke="#3b82f6" stroke-width="1" />
      <rect x="440" y="155" width="100" height="43" rx="2" fill="#14532d" stroke="#22c55e" stroke-width="1" />
      <text x="110" y="125" fill="#fef3c7" font-family="monospace" font-size="9">SKU-A42</text>
      <text x="350" y="185" fill="#dbeafe" font-family="monospace" font-size="9">LOT-901</text>
    `;
  } else if (lowerZone.includes("cold") || lowerZone.includes("chiller")) {
    zoneGraphics = `
      <!-- Walk-in Cold Storage Chiller -->
      <rect x="100" y="80" width="440" height="190" rx="8" fill="#082f49" stroke="#38bdf8" stroke-width="2" />
      <!-- Digital Temp Gauge -->
      <rect x="240" y="100" width="160" height="40" rx="4" fill="#030712" stroke="#38bdf8" stroke-width="1.5" />
      <text x="255" y="125" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="bold">-18.4°C</text>
      <text x="340" y="123" fill="#22c55e" font-family="monospace" font-size="9">[OPTIMAL]</text>
      <!-- Frosted Wire Shelving -->
      <line x1="120" y1="160" x2="520" y2="160" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="6,4" />
      <line x1="120" y1="210" x2="520" y2="210" stroke="#7dd3fc" stroke-width="2" stroke-dasharray="6,4" />
      <!-- Insulated Storage Totes -->
      <rect x="140" y="170" width="70" height="38" rx="3" fill="#0284c7" opacity="0.8" />
      <rect x="230" y="170" width="80" height="38" rx="3" fill="#0284c7" opacity="0.8" />
      <rect x="330" y="170" width="80" height="38" rx="3" fill="#0284c7" opacity="0.8" />
      <rect x="430" y="170" width="70" height="38" rx="3" fill="#0284c7" opacity="0.8" />
    `;
  } else {
    // General Operational / Handover / Griddle area
    zoneGraphics = `
      <!-- Workspace Assembly & Equipment Station -->
      <rect x="80" y="150" width="200" height="100" rx="4" fill="${p.equipment}" stroke="${p.border}" stroke-width="1.5" />
      <rect x="310" y="150" width="250" height="100" rx="4" fill="${p.equipment}" stroke="${p.border}" stroke-width="1.5" />
      <!-- POS or Equipment Screen -->
      <rect x="340" y="110" width="80" height="50" rx="3" fill="#0f172a" stroke="${p.accent}" stroke-width="2" />
      <line x1="380" y1="160" x2="380" y2="175" stroke="#64748b" stroke-width="6" />
      <text x="350" y="138" fill="#38bdf8" font-family="monospace" font-size="9">ORDER #104</text>
      <!-- Takeaway Handover Packaging / Containers -->
      <rect x="440" y="165" width="45" height="40" rx="2" fill="#78350f" stroke="#b45309" stroke-width="1" />
      <rect x="495" y="165" width="45" height="40" rx="2" fill="#78350f" stroke="#b45309" stroke-width="1" />
      <line x1="100" y1="170" x2="260" y2="170" stroke="${p.accent}" stroke-width="2" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
    <defs>
      <linearGradient id="bgGrad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg}" />
        <stop offset="100%" stop-color="${p.floor}" />
      </linearGradient>
      <pattern id="camGrid${index}" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Base Frame Background -->
    <rect width="640" height="360" fill="url(#bgGrad${index})" />
    <rect width="640" height="360" fill="url(#camGrid${index})" />

    <!-- Isometric Floor Perspective Grid -->
    <polygon points="40,210 600,210 640,360 0,360" fill="${p.floor}" opacity="0.9" />
    <line x1="40" y1="210" x2="600" y2="210" stroke="${p.accent}" stroke-width="2" opacity="0.7" />

    <!-- Specific Zone Graphics -->
    ${zoneGraphics}

    <!-- CCTV Camera HUD Overlay (Top Banner) -->
    <rect x="0" y="0" width="640" height="40" fill="rgba(3,7,18,0.85)" stroke="rgba(255,255,255,0.1)" stroke-width="1" />
    <circle cx="22" cy="20" r="5" fill="#ef4444" />
    <text x="34" y="24" fill="#22c55e" font-family="'Courier New', monospace" font-size="12" font-weight="bold">● REC</text>
    <text x="88" y="24" fill="#38bdf8" font-family="'Courier New', monospace" font-size="11" font-weight="bold">CAM-${camNumber} [1080P HD]</text>
    <text x="250" y="24" fill="#cbd5e1" font-family="'Courier New', monospace" font-size="11">${storeId} · ${zone.toUpperCase()}</text>
    <text x="530" y="24" fill="#22c55e" font-family="'Courier New', monospace" font-size="12" font-weight="bold">${timestamp}</text>

    <!-- Corner Surveillance Brackets -->
    <path d="M 16 54 L 16 46 L 24 46 M 616 46 L 624 46 L 624 54 M 16 320 L 16 328 L 24 328 M 616 328 L 624 328 L 624 320" stroke="rgba(255,255,255,0.4)" stroke-width="2" fill="none" />

    <!-- Center Reticle / Target Focus -->
    <path d="M 310 170 L 330 170 M 320 160 L 320 180" stroke="rgba(56,189,248,0.7)" stroke-width="1.5" />
    <circle cx="320" cy="170" r="14" fill="none" stroke="rgba(56,189,248,0.3)" stroke-width="1" stroke-dasharray="3,3" />

    <!-- Lower Surveillance Telemetry Footer -->
    <rect x="16" y="318" width="220" height="28" rx="6" fill="rgba(3,7,18,0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <text x="26" y="337" fill="#f8fafc" font-family="'Courier New', monospace" font-size="11" font-weight="bold">TIMESTAMP: ${timestamp}</text>
    <rect x="470" y="318" width="154" height="28" rx="6" fill="rgba(3,7,18,0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <text x="480" y="337" fill="#94a3b8" font-family="'Courier New', monospace" font-size="10">FPS: 30 · ISO: 400</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Convert minutes from 9:00 AM (start of standard business day) into formatted 12-hour AM/PM string
export function formatMinutesToTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const ampm = hours24 >= 12 ? "PM" : "AM";
  const displayHours = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const displayMins = String(mins).padStart(2, "0");
  return `${String(displayHours).padStart(2, "0")}:${displayMins} ${ampm}`;
}

// Automatically generate random timestamps throughout the recording duration
// Rule:
// 30 min - 1 hr: 3 photos
// 4 - 5 hrs: 5 photos
// 8 hrs: 8-10 photos
export function generateRandomTimestamps(durationHours: number): { timeFormatted: string; minutes: number }[] {
  let photoCount = 5;
  if (durationHours <= 1.5) {
    photoCount = 3;
  } else if (durationHours <= 5.5) {
    photoCount = 5;
  } else {
    // 8 hours: 8 to 10 photos
    photoCount = 8;
  }

  const startHour = 9; // Store opening at 09:00 AM
  const totalDurationMinutes = Math.max(45, Math.round(durationHours * 60));

  // Divide the duration into equal intervals and randomly jitter each timestamp within its interval
  // This guarantees representation across morning, noon, afternoon, evening without clumping at the beginning
  const interval = totalDurationMinutes / photoCount;
  const results: { timeFormatted: string; minutes: number }[] = [];

  for (let i = 0; i < photoCount; i++) {
    const minMinute = Math.round(i * interval + 5);
    const maxMinute = Math.round((i + 1) * interval - 5);
    // Random jitter within the interval
    const jitter = Math.floor(Math.random() * Math.max(1, maxMinute - minMinute + 1));
    const chosenMinute = Math.min(totalDurationMinutes - 2, minMinute + jitter);

    const actualAbsoluteMinute = startHour * 60 + chosenMinute;
    results.push({
      timeFormatted: formatMinutesToTime(actualAbsoluteMinute),
      minutes: actualAbsoluteMinute,
    });
  }

  // Sort chronologically
  results.sort((a, b) => a.minutes - b.minutes);
  return results;
}

// Initial seed stores for the Officer Dashboard - complete 10-store network
export const INITIAL_CCTV_SUBMISSIONS: CctvSubmission[] = [
  {
    id: "CCTV-OUT042-20261004",
    storeId: "OUT-042",
    storeName: "Lucknow Central",
    videoName: "CCTV_STORE_DAILY_CAM_ALL_04OCT2026.mp4",
    durationLabel: "8 hours",
    durationHours: 8,
    uploadDate: "04 Oct 2026",
    status: "Pending Review",
    photosCount: 8,
  },
  {
    id: "CCTV-OUT089-20261004",
    storeId: "OUT-089",
    storeName: "Sector 18 Market",
    videoName: "CCTV_SURVEILLANCE_SHIFT1_04OCT2026.mp4",
    durationLabel: "4 hours",
    durationHours: 4,
    uploadDate: "04 Oct 2026",
    status: "Verified",
    photosCount: 5,
    finalRating: 9,
    officerComment: "Kitchen hygiene and double-bag packaging standards fully compliant.",
    inspectionDate: "04 Oct 2026",
    officerName: "Officer Yuvraj Buddha",
  },
  {
    id: "CCTV-OUT114-20261003",
    storeId: "OUT-114",
    storeName: "Koramangala 5th Block",
    videoName: "CCTV_FULL_RUSH_03OCT2026.mp4",
    durationLabel: "5 hours",
    durationHours: 5,
    uploadDate: "03 Oct 2026",
    status: "Pending Review",
    photosCount: 5,
  },
  {
    id: "CCTV-OUT019-20261003",
    storeId: "OUT-019",
    storeName: "Connaught Place Inner",
    videoName: "CCTV_STORE_MORNING_03OCT2026.mp4",
    durationLabel: "1 hour",
    durationHours: 1,
    uploadDate: "03 Oct 2026",
    status: "Verified",
    photosCount: 3,
    finalRating: 8,
    officerComment: "Acceptable storage compliance. Cold probe reading logged within limits.",
    inspectionDate: "03 Oct 2026",
    officerName: "Officer Yuvraj Buddha",
  },
  {
    id: "CCTV-OUT055-20261004",
    storeId: "OUT-055",
    storeName: "FC Road Corner",
    videoName: "CCTV_PUNE_SHIFT_ALL_04OCT2026.mp4",
    durationLabel: "6 hours",
    durationHours: 6,
    uploadDate: "04 Oct 2026",
    status: "Pending Review",
    photosCount: 6,
  },
  {
    id: "CCTV-OUT073-20261004",
    storeId: "OUT-073",
    storeName: "MI Road Heritage",
    videoName: "CCTV_JAIPUR_EVENING_04OCT2026.mp4",
    durationLabel: "4 hours",
    durationHours: 4,
    uploadDate: "04 Oct 2026",
    status: "Pending Review",
    photosCount: 5,
  },
  {
    id: "CCTV-OUT128-20261003",
    storeId: "OUT-128",
    storeName: "Bandra West Linking Road",
    videoName: "CCTV_MUMBAI_DAILY_03OCT2026.mp4",
    durationLabel: "8 hours",
    durationHours: 8,
    uploadDate: "03 Oct 2026",
    status: "Pending Review",
    photosCount: 8,
  },
  {
    id: "CCTV-OUT142-20261004",
    storeId: "OUT-142",
    storeName: "Cyber Hub Galleria",
    videoName: "CCTV_GURGAON_PEAK_04OCT2026.mp4",
    durationLabel: "7 hours",
    durationHours: 7,
    uploadDate: "04 Oct 2026",
    status: "Pending Review",
    photosCount: 7,
  },
  {
    id: "CCTV-OUT061-20261003",
    storeId: "OUT-061",
    storeName: "Civil Lines Cantt",
    videoName: "CCTV_KANPUR_DISPATCH_03OCT2026.mp4",
    durationLabel: "3 hours",
    durationHours: 3,
    uploadDate: "03 Oct 2026",
    status: "Verified",
    photosCount: 4,
    finalRating: 9,
    officerComment: "Excellent waste segregation and cold probe logs.",
    inspectionDate: "03 Oct 2026",
    officerName: "Officer Yuvraj Buddha",
  },
  {
    id: "CCTV-OUT097-20261004",
    storeId: "OUT-097",
    storeName: "Assi Ghat Promenade",
    videoName: "CCTV_VARANASI_RUSH_04OCT2026.mp4",
    durationLabel: "5 hours",
    durationHours: 5,
    uploadDate: "04 Oct 2026",
    status: "Pending Review",
    photosCount: 6,
  },
];

// Helper: Zones for generated photos
const ZONES = [
  "Kitchen Prep Counter",
  "Handwash Station",
  "Store Entrance",
  "Inventory Shelves",
  "Cold Storage Chiller",
  "Customer Handover Staging",
  "Staff Dining & Locker Area",
  "Fryer & Griddle Assembly",
];

// Generate Initial Photos for a CCTV submission
export function createGeneratedPhotosForSubmission(
  cctvId: string,
  storeId: string,
  durationHours: number
): GeneratedPhoto[] {
  const timestamps = generateRandomTimestamps(durationHours);

  return timestamps.map((ts, idx) => {
    const photoNumber = String(idx + 1).padStart(2, "0");
    const zone = ZONES[idx % ZONES.length];
    return {
      id: `Photo ${photoNumber}`,
      cctvId,
      storeId,
      timestamp: ts.timeFormatted,
      timeMinutes: ts.minutes,
      status: "Unreviewed",
      zone,
      imageUrl: generateCctvPhotoDataUrl(ts.timeFormatted, zone, storeId, idx),
    };
  });
}

// Storage helpers
export function loadCctvSubmissions(): CctvSubmission[] {
  try {
    const raw = localStorage.getItem("cctv_submissions_v4") || localStorage.getItem("cctv_submissions_v2");
    if (raw) {
      const stored = JSON.parse(raw) as CctvSubmission[];
      // Guarantee ALL 10 network stores are present in the list
      const existingIds = new Set(stored.map((s) => s.storeId));
      const missing = INITIAL_CCTV_SUBMISSIONS.filter((init) => !existingIds.has(init.storeId));
      const merged = missing.length > 0 ? [...stored, ...missing] : stored;
      saveCctvSubmissions(merged);
      return merged;
    }
  } catch {}
  saveCctvSubmissions(INITIAL_CCTV_SUBMISSIONS);
  return INITIAL_CCTV_SUBMISSIONS;
}

export function saveCctvSubmissions(submissions: CctvSubmission[]) {
  try {
    localStorage.setItem("cctv_submissions_v4", JSON.stringify(submissions));
    localStorage.setItem("cctv_submissions_v2", JSON.stringify(submissions));
  } catch {}
}

export function loadPhotosForStore(storeId: string): GeneratedPhoto[] {
  try {
    const data = localStorage.getItem(`cctv_photos_${storeId}`);
    if (data) {
      const parsed: GeneratedPhoto[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let hasRepaired = false;
        const healed = parsed.map((photo, idx) => {
          // If imageUrl is missing, broken, empty, uses obsolete ;utf8, or has black floor
          const isInvalid =
            !photo.imageUrl ||
            !photo.imageUrl.startsWith("data:image/svg+xml") ||
            photo.imageUrl.includes(";utf8,") ||
            photo.imageUrl.includes("viewBox=%220%200%20640%20400%22") ||
            photo.imageUrl.includes("fill=%22%23000000%22");

          if (isInvalid) {
            hasRepaired = true;
            return {
              ...photo,
              imageUrl: generateCctvPhotoDataUrl(
                photo.timestamp || "09:15 AM",
                photo.zone || ZONES[idx % ZONES.length],
                storeId,
                idx
              ),
            };
          }
          return photo;
        });

        if (hasRepaired) {
          savePhotosForStore(storeId, healed);
        }
        return healed;
      }
    }
  } catch {}

  // If not found, create initial photos based on submission
  const submissions = loadCctvSubmissions();
  const sub = submissions.find((s) => s.storeId === storeId) || {
    id: `CCTV-${storeId}-INIT`,
    storeId,
    durationHours: 8,
  };
  const newPhotos = createGeneratedPhotosForSubmission(
    sub.id,
    storeId,
    sub.durationHours || 8
  );
  savePhotosForStore(storeId, newPhotos);
  return newPhotos;
}

export function savePhotosForStore(storeId: string, photos: GeneratedPhoto[]) {
  try {
    localStorage.setItem(`cctv_photos_${storeId}`, JSON.stringify(photos));
  } catch {}
}

