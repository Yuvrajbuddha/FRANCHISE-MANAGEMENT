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

// Generate realistic CCTV frame SVG/data URL with timestamps & camera HUD
export function generateCctvPhotoDataUrl(
  timestamp: string,
  zone: string,
  storeId: string,
  index: number
): string {
  // Pre-calibrated palette based on store zones
  const palettes = [
    { bg: "#0d1b2a", accent: "#415a77", floor: "#1b263b", object: "#e0e1dd" },
    { bg: "#14213d", accent: "#fca311", floor: "#000000", object: "#ffffff" },
    { bg: "#1f2421", accent: "#499167", floor: "#212529", object: "#dce1de" },
    { bg: "#1a1a24", accent: "#3a86ff", floor: "#0f0f17", object: "#f8f9fa" },
    { bg: "#231942", accent: "#5e548e", floor: "#150d2a", object: "#e0b1cb" },
  ];
  const p = palettes[index % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
    <defs>
      <linearGradient id="g${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg}" />
        <stop offset="100%" stop-color="${p.floor}" />
      </linearGradient>
      <pattern id="grid${index}" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <!-- Background Frame -->
    <rect width="640" height="400" fill="url(#g${index})" />
    <rect width="640" height="400" fill="url(#grid${index})" />

    <!-- Floor Perspective / Prep Counter Layout -->
    <polygon points="40,240 600,240 640,400 0,400" fill="${p.floor}" opacity="0.85" />
    <line x1="40" y1="240" x2="600" y2="240" stroke="${p.accent}" stroke-width="2" opacity="0.6" />

    <!-- Equipment / Workspace Outlines -->
    <rect x="80" y="190" width="160" height="90" rx="6" fill="#1b2838" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
    <rect x="280" y="180" width="280" height="100" rx="6" fill="#1b2838" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />

    <!-- Counter Trays & Items -->
    <rect x="300" y="200" width="60" height="35" rx="3" fill="#2d3748" stroke="${p.accent}" stroke-width="1" />
    <rect x="380" y="200" width="60" height="35" rx="3" fill="#2d3748" stroke="${p.accent}" stroke-width="1" />
    <rect x="460" y="200" width="60" height="35" rx="3" fill="#2d3748" stroke="${p.accent}" stroke-width="1" />

    <!-- Associate Silhouette / PPE Gear -->
    <circle cx="200" cy="140" r="22" fill="#94a3b8" />
    <path d="M 180 135 A 20 18 0 0 1 220 135" stroke="#ffffff" stroke-width="4" fill="none" />
    <path d="M 175 165 C 175 155 225 155 225 165 L 230 250 L 170 250 Z" fill="#334155" />
    <rect x="182" y="175" width="36" height="50" rx="3" fill="#f8fafc" opacity="0.9" />

    <!-- Camera HUD Header -->
    <rect x="0" y="0" width="640" height="42" fill="rgba(0,0,0,0.65)" />
    <circle cx="24" cy="21" r="5" fill="#ef4444" />
    <text x="36" y="25" fill="#22c55e" font-family="'Courier New', monospace" font-size="12" font-weight="bold">REC ● CCTV CAM-0${(index % 4) + 1}</text>
    <text x="220" y="25" fill="#94a3b8" font-family="'Courier New', monospace" font-size="12">${storeId} · ${zone.toUpperCase()}</text>
    <text x="510" y="25" fill="#22c55e" font-family="'Courier New', monospace" font-size="13" font-weight="bold">${timestamp}</text>

    <!-- Timestamp Large Lower HUD Badge -->
    <rect x="20" y="345" width="160" height="36" rx="8" fill="rgba(5,11,26,0.85)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
    <text x="32" y="368" fill="#ffffff" font-family="'Courier New', monospace" font-size="14" font-weight="bold">TIME: ${timestamp}</text>

    <!-- Crosshair Target -->
    <path d="M 310 200 L 330 200 M 320 190 L 320 210" stroke="rgba(34,197,94,0.5)" stroke-width="1.5" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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

// Initial seed stores for the Officer Dashboard
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
    const data = localStorage.getItem("cctv_submissions_v2");
    if (data) {
      return JSON.parse(data);
    }
  } catch {}
  saveCctvSubmissions(INITIAL_CCTV_SUBMISSIONS);
  return INITIAL_CCTV_SUBMISSIONS;
}

export function saveCctvSubmissions(submissions: CctvSubmission[]) {
  try {
    localStorage.setItem("cctv_submissions_v2", JSON.stringify(submissions));
  } catch {}
}

export function loadPhotosForStore(storeId: string): GeneratedPhoto[] {
  try {
    const data = localStorage.getItem(`cctv_photos_${storeId}`);
    if (data) {
      return JSON.parse(data);
    }
  } catch {}

  // If not found, create initial photos based on submission
  const submissions = loadCctvSubmissions();
  const sub = submissions.find((s) => s.storeId === storeId) || submissions[0];
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
