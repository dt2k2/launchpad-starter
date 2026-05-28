/**
 * Centralized cinematic config — keyed by era.
 * Audio params, narrator quotes, revolution choreography, ending tone.
 */
import type { EraId } from "@/data/eras";

export interface AudioProfile {
  /** master gain target (0..1) */
  gain: number;
  /** drone fundamental frequencies (Hz) — layered */
  drones: number[];
  /** noise color: 0 = brown/rumble, 1 = white/bright */
  noiseColor: number;
  /** noise gain */
  noiseGain: number;
  /** lowpass cutoff in Hz */
  filterHz: number;
  /** subtle LFO speed for shimmer (Hz), 0 disables */
  shimmerHz: number;
}

export const AUDIO_PROFILES: Record<EraId, AudioProfile> = {
  primitive: {
    gain: 0.18,
    drones: [55, 82.5], // wind low + soft fifth
    noiseColor: 0.55, // wind-ish
    noiseGain: 0.12,
    filterHz: 900,
    shimmerHz: 0.07,
  },
  slave: {
    gain: 0.2,
    drones: [49, 73.4, 110], // heavier, chains
    noiseColor: 0.25,
    noiseGain: 0.08,
    filterHz: 700,
    shimmerHz: 0.05,
  },
  feudal: {
    gain: 0.18,
    drones: [65.4, 98, 130.8], // village/bell-like ratios
    noiseColor: 0.4,
    noiseGain: 0.06,
    filterHz: 1100,
    shimmerHz: 0.12,
  },
  capitalist: {
    gain: 0.22,
    drones: [58, 87, 116, 174], // industrial drone cluster
    noiseColor: 0.7,
    noiseGain: 0.14,
    filterHz: 1600,
    shimmerHz: 0.18,
  },
  socialist: {
    gain: 0.18,
    drones: [110, 165, 220, 329.6], // clean synth pad
    noiseColor: 0.85,
    noiseGain: 0.04,
    filterHz: 2400,
    shimmerHz: 0.25,
  },
};

/* ---------- Narrator quotes ---------- */
export interface NarratorLine {
  text: string;
  attribution?: string;
}

export const NARRATOR_LINES: Record<
  EraId,
  { enter: NarratorLine; tension: NarratorLine; revolution: NarratorLine }
> = {
  primitive: {
    enter: {
      text:
        "Trước khi có lịch sử, có khan hiếm. Trước khi có giai cấp, có bộ lạc.",
    },
    tension: {
      text: "Hạt giống đầu tiên đã nảy mầm. Cùng với nó, mầm mống của tư hữu.",
    },
    revolution: {
      text:
        "Khi một người làm ra nhiều hơn nhu cầu, một người khác có thể sống bằng lao động của họ.",
    },
  },
  slave: {
    enter: {
      text: "Đế chế được dựng trên lưng những người không được coi là người.",
    },
    tension: { text: "Lưỡi cày han gỉ trong tay nô lệ kiệt sức." },
    revolution: {
      text:
        "Đế chế không sụp vì kẻ thù bên ngoài. Nó sụp vì hệ thống bên trong đã ngừng tự tái sản xuất.",
    },
  },
  feudal: {
    enter: {
      text:
        "Đất đai là quyền lực. Máu thống là số phận. Tôn giáo là trật tự.",
    },
    tension: {
      text:
        "Tàu rời cảng mang theo hàng hoá — và mang về một thế giới khác.",
    },
    revolution: {
      text:
        "Tư sản gọi quần chúng làm cách mạng. Quần chúng nhận ra mình đã đổi chủ.",
    },
  },
  capitalist: {
    enter: {
      text: "Lao động được tự do — tự do bán chính nó.",
    },
    tension: {
      text:
        "Sản xuất ngày càng mang tính xã hội. Chiếm hữu vẫn mang tính tư nhân.",
    },
    revolution: {
      text:
        "Trật tự cũ không thể chứa nổi lực lượng sản xuất mới mà nó đã sinh ra.",
    },
  },
  socialist: {
    enter: {
      text:
        "Máy móc có thể làm thay con người. Câu hỏi còn lại là: của ai, vì ai?",
    },
    tension: {
      text:
        "Tự động hoá không tự nó giải phóng. Quyền sở hữu mới quyết định ý nghĩa của nó.",
    },
    revolution: {
      text:
        "Một hình thái mới không được công bố. Nó được tổ chức, ngày qua ngày, trong từng quan hệ.",
    },
  },
};

/* ---------- Revolution motifs ---------- */
export interface RevolutionMotif {
  /** symbols that crumble/dissolve */
  destruction: string[];
  /** symbols that emerge */
  rebirth: string[];
  /** short label appearing as a chip */
  ruptureLabel: string;
  /** accent CSS color (oklch / hex) */
  sparkColor: string;
}

export const REVOLUTION_MOTIFS: Record<EraId, RevolutionMotif> = {
  primitive: {
    destruction: ["△", "🜂", "✶"],
    rebirth: ["🌾", "⌂", "⛓"],
    ruptureLabel: "Cách mạng nông nghiệp",
    sparkColor: "oklch(0.78 0.16 60)",
  },
  slave: {
    destruction: ["⛓", "⚔", "✠"],
    rebirth: ["♜", "✟", "▦"],
    ruptureLabel: "Đế chế đổ — phong kiến lên",
    sparkColor: "oklch(0.72 0.2 35)",
  },
  feudal: {
    destruction: ["♜", "✟", "♛"],
    rebirth: ["⚙", "♨", "▤"],
    ruptureLabel: "Cách mạng tư sản",
    sparkColor: "oklch(0.72 0.2 25)",
  },
  capitalist: {
    destruction: ["⚙", "$", "▣"],
    rebirth: ["◈", "✺", "☀"],
    ruptureLabel: "Cách mạng xã hội chủ nghĩa",
    sparkColor: "oklch(0.78 0.14 70)",
  },
  socialist: {
    destruction: ["◈", "✺"],
    rebirth: ["∞", "✦"],
    ruptureLabel: "Chân trời mở",
    sparkColor: "oklch(0.78 0.18 250)",
  },
};

/* ---------- Stress thresholds ---------- */
export const STRESS = {
  calm: 40,
  unease: 70,
  crisis: 90,
} as const;
