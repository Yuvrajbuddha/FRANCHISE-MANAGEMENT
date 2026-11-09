import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import util from "util";

const execFileAsync = util.promisify(execFile);

export interface VideoMetadata {
  durationSeconds: number;
  width: number;
  height: number;
  codec: string;
  fps: number;
  bitrate?: number;
  formatName?: string;
  sizeBytes?: number;
}

export interface ExtractedFrame {
  id: string; // e.g. "Photo 01"
  cctvId: string;
  storeId: string;
  sourceVideoName: string;
  timestamp: string; // e.g. "00:00:03"
  offsetSeconds: number;
  videoDurationSeconds: number;
  imageUrl: string; // Web-accessible URL
  dataUrl?: string; // Embedded base64 data URL for offline & persistent rendering
  status: "Unreviewed" | "Correct" | "Incorrect" | "Needs Review";
  zone: string;
  isAuthenticFrame: boolean;
}

export interface CctvJob {
  jobId: string;
  cctvId: string;
  storeId: string;
  videoName: string;
  videoPath?: string;
  status: "QUEUED" | "UPLOADING" | "PROCESSING" | "GENERATING_PHOTOS" | "COMPLETED" | "FAILED";
  progressPct: number;
  currentStep: string;
  currentFrame?: number;
  totalFrames?: number;
  videoDurationSeconds?: number;
  durationLabel?: string;
  frames?: ExtractedFrame[];
  metadata?: VideoMetadata;
  error?: string;
  createdAt: string;
  completedAt?: string;
  officerDecision?: string;
  officerNotes?: string;
  finalRating?: number;
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

// Persistent Job Storage directory
const JOBS_FILE = path.resolve(process.cwd(), "uploads", "cctv", "jobs.json");
const jobsMap = new Map<string, CctvJob>();

// Initialize persistent jobs from disk if available
try {
  if (fs.existsSync(JOBS_FILE)) {
    const raw = fs.readFileSync(JOBS_FILE, "utf-8");
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      for (const j of arr) {
        jobsMap.set(j.jobId, j);
      }
    }
  }
} catch (e) {
  console.warn("Could not load persistent jobs file:", e);
}

function persistJobsToDisk() {
  try {
    const dir = path.dirname(JOBS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const arr = Array.from(jobsMap.values()).slice(-100); // keep latest 100
    fs.writeFileSync(JOBS_FILE, JSON.stringify(arr, null, 2));
  } catch (err) {
    console.warn("Failed to persist CCTV jobs to disk:", err);
  }
}

export const CctvJobQueue = {
  createJob(jobData: Omit<CctvJob, "createdAt" | "progressPct">): CctvJob {
    const job: CctvJob = {
      ...jobData,
      progressPct: 0,
      createdAt: new Date().toISOString(),
    };
    jobsMap.set(job.jobId, job);
    persistJobsToDisk();
    return job;
  },

  getJob(jobId: string): CctvJob | undefined {
    return jobsMap.get(jobId);
  },

  getLatestJobForStore(storeId: string): CctvJob | undefined {
    const storeJobs = Array.from(jobsMap.values()).filter(
      (j) => j.storeId.toUpperCase() === storeId.toUpperCase()
    );
    return storeJobs[storeJobs.length - 1];
  },

  getLatestCompletedJobForStore(storeId: string): CctvJob | undefined {
    const storeJobs = Array.from(jobsMap.values()).filter(
      (j) => j.storeId.toUpperCase() === storeId.toUpperCase() && j.status === "COMPLETED"
    );
    return storeJobs[storeJobs.length - 1];
  },

  updateJob(jobId: string, updates: Partial<CctvJob>): CctvJob | undefined {
    const existing = jobsMap.get(jobId);
    if (!existing) return undefined;

    const updated: CctvJob = {
      ...existing,
      ...updates,
    };
    if (updates.status === "COMPLETED" || updates.status === "FAILED") {
      updated.completedAt = new Date().toISOString();
    }
    jobsMap.set(jobId, updated);
    persistJobsToDisk();
    return updated;
  },

  getAllJobs(): CctvJob[] {
    return Array.from(jobsMap.values());
  },
};

/**
 * Probes a video file using ffprobe to obtain authentic duration and stream metadata.
 */
export async function getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found at path: ${videoPath}`);
  }

  const stat = fs.statSync(videoPath);
  if (stat.size === 0) {
    throw new Error("Uploaded video file is empty (0 bytes).");
  }

  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=width,height,duration,r_frame_rate,codec_name",
      "-show_entries",
      "format=duration,bit_rate,format_name,size",
      "-of",
      "json",
      videoPath,
    ]);

    const data = JSON.parse(stdout);
    const stream = data.streams?.[0];
    const format = data.format;

    // Determine duration: format duration is usually most reliable, fallback to stream duration
    let durationSeconds = 0;
    if (format?.duration && !isNaN(parseFloat(format.duration))) {
      durationSeconds = parseFloat(format.duration);
    } else if (stream?.duration && !isNaN(parseFloat(stream.duration))) {
      durationSeconds = parseFloat(stream.duration);
    }

    if (durationSeconds <= 0) {
      throw new Error("Could not determine valid video duration. The file may be corrupt or not a playable video.");
    }

    const width = stream?.width || 0;
    const height = stream?.height || 0;
    const codec = stream?.codec_name || "unknown";

    let fps = 30;
    if (stream?.r_frame_rate) {
      const parts = stream.r_frame_rate.split("/");
      if (parts.length === 2 && parseFloat(parts[1]) > 0) {
        fps = Math.round(parseFloat(parts[0]) / parseFloat(parts[1]));
      }
    }

    return {
      durationSeconds,
      width,
      height,
      codec,
      fps,
      bitrate: format?.bit_rate ? parseInt(format.bit_rate, 10) : undefined,
      formatName: format?.format_name,
      sizeBytes: stat.size,
    };
  } catch (err: any) {
    throw new Error(`Failed to decode video metadata: ${err.message || String(err)}`);
  }
}

import crypto from "crypto";

const CACHE_FILE = path.resolve(process.cwd(), "uploads", "cctv", "video_cache.json");
const videoCache = new Map<string, { metadata: VideoMetadata; frames: ExtractedFrame[] }>();

try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    for (const [k, v] of Object.entries(parsed)) {
      videoCache.set(k, v as any);
    }
  }
} catch (e) {
  console.warn("Could not load video cache:", e);
}

function persistVideoCache() {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const entries = Array.from(videoCache.entries()).slice(-100);
    const obj = Object.fromEntries(entries);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2));
  } catch (e) {
    console.warn("Failed to persist video cache:", e);
  }
}

/**
 * Computes a fast cryptographic fingerprint of a video file using its size and edge chunks.
 */
export function generateVideoFingerprint(videoPath: string): string {
  try {
    const stat = fs.statSync(videoPath);
    const size = stat.size;
    const fd = fs.openSync(videoPath, "r");
    const chunkSize = Math.min(65536, size);
    const headBuf = Buffer.alloc(chunkSize);
    fs.readSync(fd, headBuf, 0, chunkSize, 0);

    const tailBuf = Buffer.alloc(chunkSize);
    const tailOffset = Math.max(0, size - chunkSize);
    fs.readSync(fd, tailBuf, 0, chunkSize, tailOffset);
    fs.closeSync(fd);

    const hash = crypto.createHash("sha256");
    hash.update(String(size));
    hash.update(headBuf);
    hash.update(tailBuf);
    return hash.digest("hex");
  } catch (e) {
    return `fp_${Date.now()}`;
  }
}

/**
 * Calculates dynamic timestamps for frame extraction tailored to the video's actual duration.
 * Supports configurable interval extraction (e.g. every 15s, 30s, 60s, 300s) or adaptive duration scheduling.
 * Supports videos from 1 second up to 10+ hours without extracting outside duration.
 */
export function calculateExtractionTimestamps(
  durationSeconds: number,
  options?: { minFrames?: number; maxFrames?: number; intervalSeconds?: number }
): { seconds: number; formatted: string }[] {
  // If a specific extraction interval is configured (e.g. 15s, 30s, 60s, 300s)
  if (options?.intervalSeconds && options.intervalSeconds > 0) {
    const interval = options.intervalSeconds;
    const startMargin = Math.min(0.5, durationSeconds * 0.05);
    const endMargin = Math.min(0.5, durationSeconds * 0.05);
    const effectiveEnd = durationSeconds - endMargin;
    const maxAllowed = options.maxFrames || 25; // Sensible ceiling to protect resources on 10h videos

    const timestamps: { seconds: number; formatted: string }[] = [];

    for (let sec = startMargin; sec <= effectiveEnd; sec += interval) {
      const rounded = Number(sec.toFixed(2));
      timestamps.push({
        seconds: rounded,
        formatted: formatTimestamp(rounded),
      });
      if (timestamps.length >= maxAllowed) {
        break;
      }
    }

    // Ensure at least 2 frames if video duration allows
    if (timestamps.length < 2 && durationSeconds >= 2) {
      const endSec = Number(Math.max(0.2, durationSeconds - endMargin).toFixed(2));
      if (!timestamps.some((t) => Math.abs(t.seconds - endSec) < 0.5)) {
        timestamps.push({ seconds: endSec, formatted: formatTimestamp(endSec) });
      }
    }

    return timestamps;
  }

  // Default Adaptive Scheduling (tested and calibrated for all standard durations)
  let frameCount: number;

  if (durationSeconds < 4) {
    frameCount = 2;
  } else if (durationSeconds <= 15) {
    frameCount = 5;
  } else if (durationSeconds <= 45) {
    frameCount = 6;
  } else if (durationSeconds <= 180) {
    frameCount = 7;
  } else if (durationSeconds <= 3600) {
    frameCount = 8;
  } else if (durationSeconds <= 18000) {
    frameCount = 10;
  } else {
    frameCount = 10;
  }

  if (options?.maxFrames) {
    frameCount = Math.min(frameCount, options.maxFrames);
  }
  if (options?.minFrames) {
    frameCount = Math.max(frameCount, options.minFrames);
  }

  const startMargin = Math.min(0.5, durationSeconds * 0.05);
  const endMargin = Math.min(0.5, durationSeconds * 0.05);
  const effectiveSpan = durationSeconds - startMargin - endMargin;

  const timestamps: { seconds: number; formatted: string }[] = [];

  if (frameCount <= 1 || effectiveSpan <= 0) {
    const sec = Number((durationSeconds / 2).toFixed(2));
    timestamps.push({ seconds: sec, formatted: formatTimestamp(sec) });
    return timestamps;
  }

  const step = effectiveSpan / (frameCount - 1);

  for (let i = 0; i < frameCount; i++) {
    const rawSeconds = startMargin + i * step;
    const clampedSeconds = Math.max(0.1, Math.min(durationSeconds - 0.1, rawSeconds));
    const rounded = Number(clampedSeconds.toFixed(2));

    if (timestamps.length === 0 || rounded > timestamps[timestamps.length - 1].seconds + 0.1) {
      timestamps.push({
        seconds: rounded,
        formatted: formatTimestamp(rounded),
      });
    }
  }

  return timestamps;
}

/**
 * Formats a timestamp in seconds to HH:MM:SS format
 */
export function formatTimestamp(seconds: number): string {
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const remainingSecs = totalSecs % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSecs)}`;
}

/**
 * Formats duration into a human-friendly label (e.g. "10 seconds", "1 minute 15 seconds", "8 hours")
 */
export function formatDurationLabel(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} seconds`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSecs = Math.round(seconds % 60);

  if (hours > 0) {
    if (minutes === 0) {
      return `${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `${hours}h ${minutes}m`;
  }

  if (remainingSecs === 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  return `${minutes}m ${remainingSecs}s`;
}

/**
 * Extracts real authentic frames from the uploaded video file using FFmpeg.
 * Guaranteed: Every frame is extracted directly from the uploaded video.
 * Supports configurable intervalSeconds (e.g. 15, 30, 60, 300), video duplicate caching, and high-quality image scaling.
 */
export async function extractRealVideoFrames(params: {
  videoPath: string;
  sourceVideoName: string;
  storeId: string;
  cctvId: string;
  framesOutputDir: string;
  intervalSeconds?: number;
  maxFrames?: number;
  onProgress?: (progressPct: number, currentFrame: number, totalFrames: number, message: string) => void;
}): Promise<{
  metadata: VideoMetadata;
  frames: ExtractedFrame[];
  isCached?: boolean;
}> {
  const { videoPath, sourceVideoName, storeId, cctvId, framesOutputDir, intervalSeconds, maxFrames, onProgress } = params;

  // 1. Check duplicate video cache to avoid redundant heavy FFmpeg processing
  const fingerprint = generateVideoFingerprint(videoPath);
  const cached = videoCache.get(fingerprint);

  if (cached && cached.frames.length > 0) {
    // Verify that cached frame files still exist on disk
    const allFilesExist = cached.frames.every((f) => {
      const filename = path.basename(f.imageUrl);
      return fs.existsSync(path.join(framesOutputDir, filename));
    });

    if (allFilesExist) {
      onProgress?.(100, cached.frames.length, cached.frames.length, "Loaded authentic frames instantly from verified video cache.");
      const clonedFrames: ExtractedFrame[] = cached.frames.map((f, i) => ({
        ...f,
        cctvId,
        storeId,
        sourceVideoName,
        status: "Unreviewed" as const,
      }));

      return {
        metadata: cached.metadata,
        frames: clonedFrames,
        isCached: true,
      };
    }
  }

  // 2. Read metadata & validate video
  onProgress?.(10, 0, 0, "Inspecting video stream, codec, and authentic duration...");
  const metadata = await getVideoMetadata(videoPath);

  // 3. Ensure output directory exists
  if (!fs.existsSync(framesOutputDir)) {
    fs.mkdirSync(framesOutputDir, { recursive: true });
  }

  // 4. Compute dynamic timestamps (interval-based or adaptive schedule)
  const timestamps = calculateExtractionTimestamps(metadata.durationSeconds, {
    intervalSeconds,
    maxFrames,
  });

  if (timestamps.length === 0) {
    throw new Error("Unable to determine valid extraction timestamps for the provided video.");
  }

  const frames: ExtractedFrame[] = [];

  // 5. Extract each frame with FFmpeg with fast seek, resolution scaling, and crisp compression
  for (let i = 0; i < timestamps.length; i++) {
    const { seconds, formatted } = timestamps[i];
    const photoNumber = String(i + 1).padStart(2, "0");
    const frameFilename = `frame_${cctvId}_${photoNumber}_${Math.round(seconds)}s.jpg`;
    const outputPath = path.join(framesOutputDir, frameFilename);

    const currentPct = 15 + Math.round(((i + 1) / timestamps.length) * 75);
    onProgress?.(
      currentPct,
      i + 1,
      timestamps.length,
      `Extracting authentic frame ${i + 1} of ${timestamps.length} at ${formatted} (${seconds}s)...`
    );

    try {
      // Fast accurate seek using -ss before -i, scaling to max 1280px width (-vf scale='min(1280,iw)':-2)
      // and high quality JPEG compression (-q:v 3) for crisp, lightweight forensic frames.
      await execFileAsync("ffmpeg", [
        "-ss",
        String(seconds),
        "-i",
        videoPath,
        "-vf",
        "scale='min(1280,iw)':-2",
        "-vframes",
        "1",
        "-q:v",
        "3",
        outputPath,
        "-y",
      ]);

      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error(`Frame file ${frameFilename} was not created or is empty.`);
      }

      // Read extracted frame buffer for inline base64 fallback
      const frameBuffer = fs.readFileSync(outputPath);
      const dataUrl = `data:image/jpeg;base64,${frameBuffer.toString("base64")}`;
      const imageUrl = `/uploads/cctv/frames/${frameFilename}`;
      const zone = DEFAULT_ZONES[i % DEFAULT_ZONES.length];

      frames.push({
        id: `Photo ${photoNumber}`,
        cctvId,
        storeId,
        sourceVideoName,
        timestamp: formatted,
        offsetSeconds: seconds,
        videoDurationSeconds: metadata.durationSeconds,
        imageUrl,
        dataUrl,
        status: "Unreviewed",
        zone,
        isAuthenticFrame: true,
      });
    } catch (frameErr: any) {
      console.error(`Failed to extract frame at ${formatted} (${seconds}s):`, frameErr);
    }
  }

  if (frames.length === 0) {
    throw new Error(`FFmpeg failed to extract any authentic frames from video "${sourceVideoName}".`);
  }

  // 6. Cache successfully processed video results
  videoCache.set(fingerprint, {
    metadata,
    frames,
  });
  persistVideoCache();

  onProgress?.(95, frames.length, timestamps.length, "Finalizing photo metadata and evidence records...");

  return {
    metadata,
    frames,
    isCached: false,
  };
}
