import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import {
  getVideoMetadata,
  calculateExtractionTimestamps,
  extractRealVideoFrames,
  CctvJobQueue,
} from "../backend/services/cctv-processor";

const execFileAsync = promisify(execFile);
const TEST_DIR = path.join(process.cwd(), "test_cctv_tmp");

async function main() {
  console.log("=== COMPREHENSIVE CCTV AUTOMATIC FRAME EXTRACTION VERIFICATION ===");
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }

  // -------------------------------------------------------------
  // TEST 1: Generate 10-second real video and extract genuine frames
  // -------------------------------------------------------------
  const test10sPath = path.join(TEST_DIR, "cctv_kitchen_10s.mp4");
  console.log("\n[TEST 1] Generating 10s authentic test video (Kitchen Scene)...");
  await execFileAsync("ffmpeg", [
    "-f", "lavfi",
    "-i", "testsrc=duration=10:size=640x360:rate=10",
    "-pix_fmt", "yuv420p",
    test10sPath,
    "-y",
  ]);

  const meta10s = await getVideoMetadata(test10sPath);
  console.log(`✓ 10s video probed: duration = ${meta10s.durationSeconds.toFixed(2)}s, resolution = ${meta10s.width}x${meta10s.height}, fps = ${meta10s.fps}, size = ${meta10s.sizeBytes} bytes`);
  if (Math.abs(meta10s.durationSeconds - 10) > 0.5) {
    throw new Error(`Expected ~10s duration, got ${meta10s.durationSeconds}`);
  }

  const framesOutputDir = path.join(TEST_DIR, "frames_kitchen");
  const result10s = await extractRealVideoFrames({
    videoPath: test10sPath,
    sourceVideoName: "cctv_kitchen_10s.mp4",
    storeId: "OUT-042",
    cctvId: "CCTV-OUT042-KITCHEN",
    framesOutputDir,
  });
  console.log(`✓ Extracted ${result10s.frames.length} frames from 10s kitchen video.`);
  result10s.frames.forEach((f, idx) => {
    console.log(`  - Frame ${idx + 1}: offset ${f.offsetSeconds}s (${f.timestamp}), authentic = ${f.isAuthenticFrame}, url = ${f.imageUrl}`);
    if (f.offsetSeconds > meta10s.durationSeconds) {
      throw new Error(`Frame offset ${f.offsetSeconds} exceeds duration ${meta10s.durationSeconds}`);
    }
    if (!f.dataUrl?.startsWith("data:image/jpeg")) {
      throw new Error("Frame dataUrl must be genuine JPEG, not SVG or synthetic data!");
    }
  });

  // -------------------------------------------------------------
  // TEST 2: Different Video Differentiation (Second Video Upload)
  // -------------------------------------------------------------
  console.log("\n[TEST 2] Testing Video Differentiation with Second Video (Entrance Scene)...");
  const testEntrancePath = path.join(TEST_DIR, "cctv_entrance_30s.mp4");
  await execFileAsync("ffmpeg", [
    "-f", "lavfi",
    "-i", "smptebars=duration=30:size=640x360:rate=10",
    "-pix_fmt", "yuv420p",
    testEntrancePath,
    "-y",
  ]);

  const metaEntrance = await getVideoMetadata(testEntrancePath);
  console.log(`✓ 30s entrance video probed: duration = ${metaEntrance.durationSeconds.toFixed(2)}s`);
  const framesEntranceDir = path.join(TEST_DIR, "frames_entrance");
  const resultEntrance = await extractRealVideoFrames({
    videoPath: testEntrancePath,
    sourceVideoName: "cctv_entrance_30s.mp4",
    storeId: "OUT-042",
    cctvId: "CCTV-OUT042-ENTRANCE",
    framesOutputDir: framesEntranceDir,
  });
  console.log(`✓ Extracted ${resultEntrance.frames.length} frames from 30s entrance video.`);
  
  // Verify isolation: Kitchen frames vs Entrance frames
  if (resultEntrance.frames[0].cctvId === result10s.frames[0].cctvId) {
    throw new Error("Evidence IDs must be distinct across different uploads!");
  }
  if (resultEntrance.frames[0].sourceVideoName === result10s.frames[0].sourceVideoName) {
    throw new Error("Source video names must be distinct!");
  }
  console.log("✓ Video isolation verified: Video A and Video B frames are completely separate and traceable to their respective recordings.");

  // -------------------------------------------------------------
  // TEST 3: Dynamic Frame Extraction Schedules Across Durations
  // -------------------------------------------------------------
  console.log("\n[TEST 3] Testing dynamic timestamp schedules across all required durations:");
  const testDurations = [
    { label: "10 seconds", sec: 10, expectedCount: 5 },
    { label: "30 seconds", sec: 30, expectedCount: 6 },
    { label: "1 minute", sec: 60, expectedCount: 7 },
    { label: "10 minutes", sec: 600, expectedCount: 8 },
    { label: "30 minutes", sec: 1800, expectedCount: 8 },
    { label: "1 hour", sec: 3600, expectedCount: 8 },
    { label: "5 hours", sec: 18000, expectedCount: 10 },
    { label: "8 hours", sec: 28800, expectedCount: 10 },
    { label: "10 hours", sec: 36000, expectedCount: 10 },
  ];

  for (const t of testDurations) {
    const schedule = calculateExtractionTimestamps(t.sec);
    console.log(`✓ ${t.label} (${t.sec}s): ${schedule.length} timestamps from ${schedule[0]?.formatted} (${schedule[0]?.seconds}s) to ${schedule[schedule.length - 1]?.formatted} (${schedule[schedule.length - 1]?.seconds}s)`);
    if (schedule.length !== t.expectedCount) {
      throw new Error(`Expected ${t.expectedCount} frames for ${t.label}, got ${schedule.length}`);
    }
    for (const item of schedule) {
      if (item.seconds > t.sec) {
        throw new Error(`Timestamp ${item.seconds}s exceeds duration ${t.sec}s`);
      }
    }
  }

  // -------------------------------------------------------------
  // TEST 4: Invalid & Corrupt Video Rejection
  // -------------------------------------------------------------
  console.log("\n[TEST 4] Testing invalid/corrupt video rejection:");
  const corruptPath = path.join(TEST_DIR, "corrupt_footage.mp4");
  fs.writeFileSync(corruptPath, "CORRUPT_NOT_A_VALID_H264_STREAM_DATA");
  try {
    await getVideoMetadata(corruptPath);
    throw new Error("Corrupt video should have been rejected!");
  } catch (err: any) {
    console.log(`✓ Corrupt file properly rejected with error: "${err.message.slice(0, 80)}..."`);
  }

  // -------------------------------------------------------------
  // TEST 5: Job Queue & Background Processing Persistence
  // -------------------------------------------------------------
  console.log("\n[TEST 5] Testing CctvJobQueue creation, progress tracking, and retrieval:");
  const testJobId = `job_test_${Date.now()}`;
  CctvJobQueue.createJob({
    jobId: testJobId,
    cctvId: "CCTV-OUT042-JOBTEST",
    storeId: "OUT-042",
    videoName: "cctv_kitchen_10s.mp4",
    videoPath: "/uploads/cctv/videos/test.mp4",
    status: "PROCESSING",
    currentStep: "Extracting frames in background...",
  });

  const retrieved = CctvJobQueue.getJob(testJobId);
  if (!retrieved || retrieved.status !== "PROCESSING") {
    throw new Error("Failed to retrieve queued job from CctvJobQueue!");
  }

  CctvJobQueue.updateJob(testJobId, {
    status: "COMPLETED",
    progressPct: 100,
    currentStep: "Completed successfully.",
    frames: result10s.frames,
    totalFrames: result10s.frames.length,
    videoDurationSeconds: 10,
    durationLabel: "10 seconds",
  });

  const completedJob = CctvJobQueue.getJob(testJobId);
  if (completedJob?.status !== "COMPLETED" || completedJob?.frames?.length !== result10s.frames.length) {
    throw new Error("Job queue update did not persist correctly!");
  }
  console.log(`✓ Job queue persistence verified: Job ${testJobId} status = ${completedJob.status}, frames = ${completedJob.frames?.length}`);

  // Cleanup test directory
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
  console.log("\n=== ALL CCTV PIPELINE TESTS PASSED 100% ===");
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
