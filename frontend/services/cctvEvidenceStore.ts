// CCTV Evidence Store
// Manages real, authentic CCTV evidence submissions and extracted photos.
// Strictly NO artificial illustrations, NO mock SVG drawings, NO fabricated timestamps.

export interface GeneratedPhoto {
  id: string; // e.g. "Photo 01"
  cctvId: string;
  storeId: string;
  timestamp: string; // Real video timecode, e.g. "00:00:05", "00:09:59"
  timeMinutes?: number; // for chronological sorting
  offsetSeconds?: number; // exact seconds offset within video
  videoDurationSeconds?: number;
  sourceVideoName?: string;
  status: "Unreviewed" | "Correct" | "Incorrect" | "Needs Review";
  officerComment?: string;
  imageUrl: string;
  dataUrl?: string;
  zone: string;
  isAuthenticFrame?: boolean;
}

export interface CctvSubmission {
  id: string;
  storeId: string;
  storeName: string;
  videoName: string;
  videoPath?: string;
  videoDurationSeconds?: number;
  durationLabel: string;
  durationHours?: number;
  uploadDate: string;
  status: "Processing" | "Pending Review" | "Verified";
  photosCount: number;
  finalRating?: number;
  officerComment?: string;
  inspectionDate?: string;
  officerName?: string;
}

// Initial seed store submissions for the Officer Dashboard compliance queue
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
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
    photosCount: 0,
  },
];

export function loadCctvSubmissions(): CctvSubmission[] {
  try {
    const raw =
      localStorage.getItem("cctv_submissions_v5") ||
      localStorage.getItem("cctv_submissions_v4");
    if (raw) {
      const stored = JSON.parse(raw) as CctvSubmission[];
      const existingIds = new Set(stored.map((s) => s.storeId));
      const missing = INITIAL_CCTV_SUBMISSIONS.filter(
        (init) => !existingIds.has(init.storeId)
      );
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
    localStorage.setItem("cctv_submissions_v5", JSON.stringify(submissions));
    localStorage.setItem("cctv_submissions_v4", JSON.stringify(submissions));
  } catch {}
}

/**
 * Loads authentic photos extracted for a given store.
 * Filters out any legacy SVG illustrations, artificial drawings, or invalid entries.
 * Returns an empty array if no genuine photos have been extracted yet.
 * NEVER creates synthetic or dummy images.
 */
export function loadPhotosForStore(storeId: string): GeneratedPhoto[] {
  try {
    const data = localStorage.getItem(`cctv_photos_${storeId}`);
    if (data) {
      const parsed: GeneratedPhoto[] = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Discard any legacy SVG illustrations or non-authentic data
        const authenticOnly = parsed.filter(
          (p) =>
            p &&
            !p.imageUrl?.includes("svg") &&
            !p.dataUrl?.includes("svg") &&
            (p.dataUrl?.startsWith("data:image/") ||
              p.imageUrl?.includes("/uploads/cctv/frames/") ||
              p.imageUrl?.startsWith("data:image/"))
        );
        return authenticOnly;
      }
    }
  } catch {}

  // If no authentic photos have been extracted for this store, return empty array.
  // Never generate fake SVG illustrations or dummy photos.
  return [];
}

export function savePhotosForStore(storeId: string, photos: GeneratedPhoto[]) {
  try {
    // Only save genuine photos (not SVGs)
    const authenticPhotos = photos.filter(
      (p) =>
        p &&
        !p.imageUrl?.includes("svg") &&
        !p.dataUrl?.includes("svg")
    );
    localStorage.setItem(`cctv_photos_${storeId}`, JSON.stringify(authenticPhotos));
  } catch {}
}

export function clearPhotosForStore(storeId: string) {
  try {
    localStorage.removeItem(`cctv_photos_${storeId}`);
  } catch {}
}
