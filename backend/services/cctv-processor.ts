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
  photosCount?: number;
  videoDurationSeconds?: number;
  durationLabel?: string;
  frames?: ExtractedFrame[];
  metadata?: VideoMetadata;
  error?: string;
  createdAt: string;
  firstFrameExtractedAt?: string;
  completedAt?: string;
  extractionDurationMs?: number;
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

// Debounced persistence to disk so rapid progressive updates never freeze the event loop
let persistTimer: NodeJS.Timeout | null = null;
function persistJobsToDisk(immediate = false) {
  const doSave = () => {
    try {
      const dir = path.dirname(JOBS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const arr = Array.from(jobsMap.values()).slice(-100);
      fs.writeFileSync(JOBS_FILE, JSON.stringify(arr, null, 2));
    } catch (err) {
      console.warn("Failed to persist CCTV jobs to disk:", err);
    }
  };

  if (immediate) {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = null;
    doSave();
    return;
  }

  if (!persistTimer) {
    persistTimer = setTimeout(() => {
      persistTimer = null;
      doSave();
    }, 800);
  }
}

export const CctvJobQueue = {
  createJob(jobData: Omit<CctvJob, "createdAt" | "progressPct">): CctvJob {
    const job: CctvJob = {
      ...jobData,
      progressPct: 0,
      createdAt: new Date().toISOString(),
      frames: jobData.frames || [],
      photosCount: jobData.frames?.length || 0,
    };
    jobsMap.set(job.jobId, job);
    persistJobsToDisk(true);
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
      photosCount: updates.frames ? updates.frames.length : (updates.photosCount ?? existing.photosCount ?? 0),
    };
    if (updates.status === "COMPLETED" || updates.status === "FAILED") {
      updated.completedAt = new Date().toISOString();
      persistJobsToDisk(true); // immediate on terminal state
    } else {
      persistJobsToDisk(false); // debounced during live progressive extraction
    }
    jobsMap.set(jobId, updated);
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
/**
 * Calculates dynamic timestamps for frame extraction tailored to the video's actual duration.
 * Supports configurable interval extraction (default 30 seconds, user configurable) or adaptive duration scheduling.
 * Supports videos from 10 seconds up to 10+ hours without extracting outside duration.
 */
export function calculateExtractionTimestamps(
  durationSeconds: number,
  options?: { minFrames?: number; maxFrames?: number; intervalSeconds?: number }
): { seconds: number; formatted: string }[] {
  // Default interval is 30 seconds per user requirement
  const interval = (options?.intervalSeconds && options.intervalSeconds > 0)
    ? options.intervalSeconds
    : 30;

  const startMargin = Math.min(0.5, Math.max(0.1, durationSeconds * 0.05));
  const endMargin = Math.min(0.5, Math.max(0.1, durationSeconds * 0.05));
  const effectiveEnd = Math.max(startMargin, durationSeconds - endMargin);
  const maxAllowed = options?.maxFrames || 35; // Sensible ceiling to protect resources on 10h videos

  const timestamps: { seconds: number; formatted: string }[] = [];

  // Short videos (e.g. 10s to 29s): extract start and end frames
  if (durationSeconds <= interval) {
    const firstSec = Number(startMargin.toFixed(2));
    const lastSec = Number(Math.max(firstSec + 0.5, effectiveEnd).toFixed(2));
    timestamps.push({ seconds: firstSec, formatted: formatTimestamp(firstSec) });
    if (lastSec > firstSec && durationSeconds >= 2) {
      timestamps.push({ seconds: lastSec, formatted: formatTimestamp(lastSec) });
    }
    return timestamps;
  }

  // Interval-based sampling: Step by interval (default 30s)
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

  // Ensure end frame is captured if margin left room and limit not exceeded
  const finalSec = Number(effectiveEnd.toFixed(2));
  if (
    timestamps.length < maxAllowed &&
    timestamps.length > 0 &&
    finalSec - timestamps[timestamps.length - 1].seconds >= Math.min(10, interval / 2)
  ) {
    timestamps.push({ seconds: finalSec, formatted: formatTimestamp(finalSec) });
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
 * Executes single frame extraction using ultra-optimized FFmpeg seeking flags.
 * Bypasses audio, subtitle, and data decoding (-an -sn -dn), disables autorotate metadata parsing,
 * scales directly during decode pass (-vf scale), and applies lightweight JPEG compression (-q:v 3).
 */
async function extractSingleFfmpegFrame(
  videoPath: string,
  seconds: number,
  outputPath: string
): Promise<void> {
  await execFileAsync("ffmpeg", [
    "-ss",
    String(seconds),
    "-noautorotate",
    "-i",
    videoPath,
    "-an",
    "-sn",
    "-dn",
    "-threads",
    "2",
    "-vf",
    "scale='min(1280,iw)':-2",
    "-vframes",
    "1",
    "-q:v",
    "3",
    "-f",
    "image2",
    outputPath,
    "-y",
  ]);

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`Frame extraction failed for timestamp ${seconds}s.`);
  }
}

/**
 * Extracts authentic video frames progressively using FFmpeg.
 *
 * PROGRESSIVE ARCHITECTURE:
 * 1. Immediate Phase: Extracts the first timestamped photo (< 250ms).
 * 2. Emits the first photo immediately via onFrameExtracted callback so frontend displays it right away.
 * 3. Concurrent Phase: Extracts remaining sampled photos in parallel (concurrency: 2) in background.
 * 4. As each photo becomes available, immediately emits it to the live stream.
 *
 * Supports videos from 10 seconds up to 10+ hours.
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
  onFrameExtracted?: (newFrame: ExtractedFrame, allFrames: ExtractedFrame[], currentCount: number, totalExpected: number) => void;
}): Promise<{
  metadata: VideoMetadata;
  frames: ExtractedFrame[];
  isCached?: boolean;
}> {
  const {
    videoPath,
    sourceVideoName,
    storeId,
    cctvId,
    framesOutputDir,
    intervalSeconds,
    maxFrames,
    onProgress,
    onFrameExtracted,
  } = params;

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
      const clonedFrames: ExtractedFrame[] = cached.frames.map((f) => ({
        ...f,
        cctvId,
        storeId,
        sourceVideoName,
        status: "Unreviewed" as const,
      }));

      // Progressively stream cached frames in rapid sequence so UI immediately populates
      for (let i = 0; i < clonedFrames.length; i++) {
        const partial = clonedFrames.slice(0, i + 1);
        onFrameExtracted?.(clonedFrames[i], partial, i + 1, clonedFrames.length);
      }

      onProgress?.(100, clonedFrames.length, clonedFrames.length, "Loaded authentic frames instantly from verified video cache.");

      return {
        metadata: cached.metadata,
        frames: clonedFrames,
        isCached: true,
      };
    }
  }

  // 2. Read metadata & validate video
  onProgress?.(5, 0, 0, "Inspecting video stream, codec, and authentic duration...");
  const metadata = await getVideoMetadata(videoPath);

  // 3. Ensure output directory exists
  if (!fs.existsSync(framesOutputDir)) {
    fs.mkdirSync(framesOutputDir, { recursive: true });
  }

  // 4. Compute dynamic timestamps (default 30s interval, or user-selected)
  const timestamps = calculateExtractionTimestamps(metadata.durationSeconds, {
    intervalSeconds: intervalSeconds || 30,
    maxFrames,
  });

  if (timestamps.length === 0) {
    throw new Error("Unable to determine valid extraction timestamps for the provided video.");
  }

  const frames: ExtractedFrame[] = [];
  const totalExpected = timestamps.length;

  // Helper to create ExtractedFrame object with async buffer read
  const createFrameObject = async (
    photoIdx: number,
    seconds: number,
    formatted: string,
    outputPath: string,
    frameFilename: string
  ): Promise<ExtractedFrame> => {
    const photoNumber = String(photoIdx + 1).padStart(2, "0");
    const frameBuffer = await fs.promises.readFile(outputPath);
    const dataUrl = `data:image/jpeg;base64,${frameBuffer.toString("base64")}`;
    const imageUrl = `/uploads/cctv/frames/${frameFilename}`;
    const zone = DEFAULT_ZONES[photoIdx % DEFAULT_ZONES.length];

    return {
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
    };
  };

  // =========================================================================
  // PHASE 1: INSTANT FIRST FRAME EXTRACTION (Target Time: < 250ms)
  // =========================================================================
  const firstItem = timestamps[0];
  const firstFilename = `frame_${cctvId}_01_${Math.round(firstItem.seconds)}s.jpg`;
  const firstOutputPath = path.join(framesOutputDir, firstFilename);

  onProgress?.(15, 0, totalExpected, `Extracting first timestamped photo at ${firstItem.formatted}...`);

  try {
    await extractSingleFfmpegFrame(videoPath, firstItem.seconds, firstOutputPath);
    const firstFrame = await createFrameObject(0, firstItem.seconds, firstItem.formatted, firstOutputPath, firstFilename);
    frames.push(firstFrame);

    // IMMEDIATELY EMIT FIRST PHOTO SO FRONTEND RENDERS IT WITHOUT WAITING!
    onFrameExtracted?.(firstFrame, [...frames], 1, totalExpected);
    onProgress?.(
      20,
      1,
      totalExpected,
      `Photo 1 of ${totalExpected} ready (${firstItem.formatted}). Extracting remaining frames in background...`
    );
  } catch (err: any) {
    console.warn(`Warning: Phase 1 extraction failed at ${firstItem.formatted}:`, err);
  }

  // =========================================================================
  // PHASE 2: CONCURRENT BACKGROUND EXTRACTION (Concurrency: 2)
  // =========================================================================
  const remainingTimestamps = timestamps.slice(1);

  if (remainingTimestamps.length > 0) {
    const CONCURRENCY = 2; // Controlled parallelism: speeds up extraction 2x without overloading CPU/memory
    let nextIdx = 0;

    const worker = async () => {
      while (nextIdx < remainingTimestamps.length) {
        const itemIdx = nextIdx++;
        const item = remainingTimestamps[itemIdx];
        const globalIdx = itemIdx + 1; // 1-based index in timestamps array
        const photoNumber = String(globalIdx + 1).padStart(2, "0");
        const frameFilename = `frame_${cctvId}_${photoNumber}_${Math.round(item.seconds)}s.jpg`;
        const outputPath = path.join(framesOutputDir, frameFilename);

        try {
          await extractSingleFfmpegFrame(videoPath, item.seconds, outputPath);
          const frame = await createFrameObject(globalIdx, item.seconds, item.formatted, outputPath, frameFilename);

          frames.push(frame);
          // Keep chronological order by timestamp offset
          frames.sort((a, b) => a.offsetSeconds - b.offsetSeconds);

          // PROGRESSIVE NOTIFICATION: Emit frame immediately upon completion!
          onFrameExtracted?.(frame, [...frames], frames.length, totalExpected);

          const progressPct = 20 + Math.round((frames.length / totalExpected) * 75);
          onProgress?.(
            progressPct,
            frames.length,
            totalExpected,
            `Extracted authentic photo ${frames.length} of ${totalExpected} at ${item.formatted}...`
          );
        } catch (frameErr: any) {
          console.error(`Failed to extract frame at ${item.formatted}:`, frameErr);
        }
      }
    };

    // Run concurrency pool
    const workers = Array.from({ length: Math.min(CONCURRENCY, remainingTimestamps.length) }, () => worker());
    await Promise.all(workers);
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

  onProgress?.(100, frames.length, totalExpected, `Extraction complete: ${frames.length} authentic photos verified.`);

  return {
    metadata,
    frames,
    isCached: false,
  };
}
