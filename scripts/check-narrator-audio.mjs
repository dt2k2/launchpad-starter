import fs from "node:fs";
import path from "node:path";

const ROOTS = ["src/assets/audio/narrator", "src/assets/audio/narrator/role"];
const ROLES = ["ruler", "worker", "historian"];
const MOMENTS = ["enter", "tension", "revolution"];

const expected = [];
for (let era = 1; era <= 5; era += 1) {
  for (const role of ROLES) {
    for (const moment of MOMENTS) expected.push(`era${era}-${role}-${moment}.mp3`);
  }
}

function walkMp3(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMp3(fullPath);
    return entry.isFile() && entry.name.endsWith(".mp3") ? [fullPath] : [];
  });
}

function readSyncSafeSize(buffer, offset) {
  return (
    ((buffer[offset] & 0x7f) << 21) |
    ((buffer[offset + 1] & 0x7f) << 14) |
    ((buffer[offset + 2] & 0x7f) << 7) |
    (buffer[offset + 3] & 0x7f)
  );
}

function mp3DurationSeconds(filePath) {
  const buffer = fs.readFileSync(filePath);
  let offset = 0;
  if (buffer.subarray(0, 3).toString("ascii") === "ID3" && buffer.length >= 10) {
    offset = 10 + readSyncSafeSize(buffer, 6);
  }

  let duration = 0;
  let frames = 0;
  const bitrateTables = {
    v1l1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
    v1l2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
    v1l3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    v2l1: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
    v2l23: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  };
  const sampleRates = {
    3: [44100, 48000, 32000],
    2: [22050, 24000, 16000],
    0: [11025, 12000, 8000],
  };

  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff || (buffer[offset + 1] & 0xe0) !== 0xe0) {
      offset += 1;
      continue;
    }

    const header = buffer.readUInt32BE(offset);
    const version = (header >> 19) & 0x3;
    const layer = (header >> 17) & 0x3;
    const bitrateIndex = (header >> 12) & 0xf;
    const sampleRateIndex = (header >> 10) & 0x3;
    const padding = (header >> 9) & 0x1;

    if (version === 1 || layer === 0 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
      offset += 1;
      continue;
    }

    const sampleRate = sampleRates[version]?.[sampleRateIndex];
    if (!sampleRate) {
      offset += 1;
      continue;
    }

    const isMpeg1 = version === 3;
    const bitrateTable =
      layer === 3
        ? isMpeg1
          ? bitrateTables.v1l1
          : bitrateTables.v2l1
        : layer === 2
          ? isMpeg1
            ? bitrateTables.v1l2
            : bitrateTables.v2l23
          : isMpeg1
            ? bitrateTables.v1l3
            : bitrateTables.v2l23;
    const bitrate = bitrateTable[bitrateIndex] * 1000;
    const samplesPerFrame = layer === 3 ? 384 : layer === 2 || isMpeg1 ? 1152 : 576;
    const frameLength =
      layer === 3
        ? Math.floor((12 * bitrate) / sampleRate + padding) * 4
        : Math.floor(((layer === 1 && !isMpeg1 ? 72 : 144) * bitrate) / sampleRate + padding);

    if (frameLength <= 4) {
      offset += 1;
      continue;
    }

    duration += samplesPerFrame / sampleRate;
    frames += 1;
    offset += frameLength;
  }

  return frames > 0 ? duration : undefined;
}

const files = ROOTS.flatMap(walkMp3);
const byName = new Map(files.map((file) => [path.basename(file), file]));
const missing = expected.filter((name) => !byName.has(name));
const roleFiles = expected.filter((name) => byName.has(name));
const durations = roleFiles
  .map((name) => ({ name, seconds: mp3DurationSeconds(byName.get(name)) }))
  .filter((item) => typeof item.seconds === "number");

console.log(`role narrator files: ${roleFiles.length}/${expected.length}`);
console.log(`missing: ${missing.length ? missing.join(", ") : "none"}`);

if (durations.length > 0) {
  const sorted = [...durations].sort((a, b) => a.seconds - b.seconds);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const avg = durations.reduce((sum, item) => sum + item.seconds, 0) / durations.length;
  console.log(`duration min: ${min.seconds.toFixed(2)}s (${min.name})`);
  console.log(`duration max: ${max.seconds.toFixed(2)}s (${max.name})`);
  console.log(`duration avg: ${avg.toFixed(2)}s`);
}

if (missing.length > 0) process.exitCode = 1;
