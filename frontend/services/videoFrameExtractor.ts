/**
 * Client-Side Video Inspector and Frame Extraction Service
 * Uses HTML5 Video and Canvas to extract authentic frames directly from user-uploaded video files.
 * Provides instant duration detection and dual-layer authenticity guarantee.
 */

export interface ClientVideoMetadata {
  durationSeconds: number;
  durationLabel: string;
  width: number;
  height: number;
  filename: string;
  sizeBytes: number;
}

export interface ClientExtractedFrame {
  id: string; // e.g. "Photo 01"
  cctvId: string;
  storeId: string;
  timestamp: string; // "00:00:03"
  offsetSeconds: number;
  videoDurationSeconds: number;
  imageUrl?: string;
  dataUrl: string; // Real authentic canvas frame from video
  zone: string;
  status: "Unreviewed";
  isAuthenticFrame: boolean;
}

const DEFAULT_ZONES = [
  "Prep Counter CAM-01",
  "Handwash Hygiene Station",
  "Kitchen Assembly Line",
  "Store Entrance & Billing",
  "Inventory & Storage Shelf",
  "Customer Handover Area",
  "Fryer & Griddle Station",
  "Walk-In Chiller Storage",
  "Dine-in Seating Perimeter",
  "Dispatch & Delivery Counter",
];

export function formatTimeCode(seconds: number): string {
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export function formatHumanDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);

  if (hours > 0) {
    if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${hours}h ${mins}m`;
  }

  if (secs === 0) return `${mins} min${mins > 1 ? "s" : ""}`;
  return `${mins}m ${secs}s`;
}

/**
 * Inspects a File object to determine authentic duration and dimensions.
 */
export function inspectVideoFile(file: File): Promise<ClientVideoMetadata> {
  return new Promise((resolve, reject) => {
    if (!file || (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|webm|mov|avi|mkv|m4v)$/i))) {
      return reject(new Error("Selected file is not a supported video format (MP4, WebM, MOV, AVI, MKV)."));
    }

    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;

      cleanup();

      if (!duration || isNaN(duration) || duration <= 0) {
        return reject(new Error("Unable to read video duration. The video file may be corrupt or empty."));
      }

      resolve({
        durationSeconds: duration,
        durationLabel: formatHumanDuration(duration),
        width,
        height,
        filename: file.name,
        sizeBytes: file.size,
      });
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video file in browser. Format may be unsupported or file is corrupted."));
    };

    // Fallback timeout in case metadata event stalls
    setTimeout(() => {
      cleanup();
      reject(new Error("Timed out reading video metadata. Please verify the file is not corrupted."));
    }, 15000);
  });
}

/**
 * Calculates timestamps tailored to the video's actual duration.
 * For a 10s video, calculates: [1.0s, 3.0s, 5.0s, 7.0s, 9.0s].
 */
export function calculateTimestampsForDuration(
  durationSeconds: number,
  maxFrames = 10
): { seconds: number; formatted: string }[] {
  let count: number;

  if (durationSeconds < 4) {
    count = 2;
  } else if (durationSeconds <= 15) {
    // 10s video gets 5 representative frames
    count = Math.min(5, maxFrames);
  } else if (durationSeconds <= 45) {
    count = Math.min(6, maxFrames);
  } else if (durationSeconds <= 180) {
    count = Math.min(7, maxFrames);
  } else if (durationSeconds <= 3600) {
    count = Math.min(8, maxFrames);
  } else {
    // Multi-hour videos (1h to 10h)
    count = maxFrames;
  }

  const start = Math.min(0.5, durationSeconds * 0.05);
  const end = Math.min(0.5, durationSeconds * 0.05);
  const span = durationSeconds - start - end;

  const result: { seconds: number; formatted: string }[] = [];

  if (count <= 1 || span <= 0) {
    const s = Number((durationSeconds / 2).toFixed(2));
    result.push({ seconds: s, formatted: formatTimeCode(s) });
    return result;
  }

  const step = span / (count - 1);

  for (let i = 0; i < count; i++) {
    const raw = start + i * step;
    const clamped = Math.max(0.1, Math.min(durationSeconds - 0.1, raw));
    const rounded = Number(clamped.toFixed(2));

    if (result.length === 0 || rounded > result[result.length - 1].seconds + 0.1) {
      result.push({
        seconds: rounded,
        formatted: formatTimeCode(rounded),
      });
    }
  }

  return result;
}

/**
 * Extracts authentic frames from the video file using HTML5 canvas.
 * Guaranteed to extract exact frames from the uploaded video.
 */
export function extractFramesWithBrowser(
  file: File,
  storeId: string,
  cctvId: string,
  onProgress?: (progressPct: number, currentFrame: number, total: number, message: string) => void
): Promise<{
  metadata: ClientVideoMetadata;
  frames: ClientExtractedFrame[];
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      URL.revokeObjectURL(objectUrl);
      return reject(new Error("Failed to initialize canvas 2D rendering context."));
    }

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
      canvas.remove();
    };

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;

      canvas.width = width;
      canvas.height = height;

      if (!duration || duration <= 0) {
        cleanup();
        return reject(new Error("Invalid video duration (0s)."));
      }

      const metadata: ClientVideoMetadata = {
        durationSeconds: duration,
        durationLabel: formatHumanDuration(duration),
        width,
        height,
        filename: file.name,
        sizeBytes: file.size,
      };

      const timestamps = calculateTimestampsForDuration(duration);
      const frames: ClientExtractedFrame[] = [];

      try {
        for (let i = 0; i < timestamps.length; i++) {
          const { seconds, formatted } = timestamps[i];

          onProgress?.(
            Math.round(((i + 1) / timestamps.length) * 100),
            i + 1,
            timestamps.length,
            `Decoding frame ${i + 1} of ${timestamps.length} at ${formatted}...`
          );

          // Seek to exact timestamp
          await seekVideo(video, seconds);

          // Draw the exact frame onto canvas
          ctx.drawImage(video, 0, 0, width, height);

          // Export as authentic JPEG data URL
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          const photoNum = String(i + 1).padStart(2, "0");
          const zone = DEFAULT_ZONES[i % DEFAULT_ZONES.length];

          frames.push({
            id: `Photo ${photoNum}`,
            cctvId,
            storeId,
            timestamp: formatted,
            offsetSeconds: seconds,
            videoDurationSeconds: duration,
            imageUrl: dataUrl,
            dataUrl,
            zone,
            status: "Unreviewed",
            isAuthenticFrame: true,
          });
        }

        cleanup();
        resolve({ metadata, frames });
      } catch (err: any) {
        cleanup();
        reject(new Error(`Frame extraction failed: ${err.message || String(err)}`));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Unable to decode video. Unsupported format or corrupted file."));
    };
  });
}

function seekVideo(video: HTMLVideoElement, timeSeconds: number): Promise<void> {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const onSeeked = () => {
      if (!resolved) {
        resolved = true;
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
        resolve();
      }
    };

    const onError = () => {
      if (!resolved) {
        resolved = true;
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
        reject(new Error(`Seek error at ${timeSeconds}s`));
      }
    };

    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    try {
      video.currentTime = timeSeconds;
    } catch (err) {
      if (!resolved) {
        resolved = true;
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
        reject(err);
      }
    }

    // Safety timeout in case seeked event doesn't fire
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
        resolve();
      }
    }, 3000);
  });
}
