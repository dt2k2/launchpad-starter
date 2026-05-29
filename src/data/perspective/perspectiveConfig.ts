/**
 * Perspective System — single source of truth.
 *
 * 3 góc nhìn = 3 lăng kính lịch sử khác biệt thật sự:
 *   - themes (CSS tokens + class presets)
 *   - voices (default narrator persona per VoiceEvent, + per-decision overrides)
 *   - objectives (success rule + HUD warning)
 *   - ending narrations (per ending vibe × perspective)
 *   - insight tags + visibility (class blindness)
 *   - option gates + extra perspective-only options
 */
import type {
  Decision,
  DecisionOption,
  Insight,
  MetricKey,
  PerspectiveId,
} from "@/data/historicalSim";
import type { SimState } from "@/components/minigame/sim/simStore";
import type { Ending } from "@/data/historicalSim";

/* =========================================================
   THEMES
   ========================================================= */

export interface PerspectiveTheme {
  id: PerspectiveId;
  emblem: string;
  label: string;
  shortLabel: string;
  /** CSS custom properties injected on a wrapper element */
  tokens: Record<string, string>;
  /** Tailwind preset classes for various surfaces */
  classes: {
    surface: string;
    surfaceSoft: string;
    border: string;
    accentText: string;
    accentBg: string;
    button: string;
    buttonGhost: string;
    narrator: string;
    chip: string;
    progressTrack: string;
    progressFill: string;
    grain: string; // utility class on top-level wrapper
  };
}

/** A tiny SVG data-URI grain — different motif per perspective. */
const grainSeal = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><g fill='none' stroke='%23d4af37' stroke-opacity='.08'><circle cx='110' cy='110' r='90'/><circle cx='110' cy='110' r='70'/><circle cx='110' cy='110' r='50'/><path d='M110 20 L120 110 L110 200 L100 110 Z'/></g></svg>`,
)}")`;

const grainRust = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' seed='4'/><feColorMatrix values='0 0 0 0 .55  0 0 0 0 .18  0 0 0 0 .12  0 0 0 .35 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>`,
)}")`;

const grainPaper = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='p'><feTurbulence baseFrequency='0.6' numOctaves='2'/><feColorMatrix values='0 0 0 0 .25  0 0 0 0 .22  0 0 0 0 .18  0 0 0 .12 0'/></filter><rect width='200' height='200' filter='url(%23p)'/></svg>`,
)}")`;

export const PERSPECTIVE_THEMES: Record<PerspectiveId, PerspectiveTheme> = {
  ruler: {
    id: "ruler",
    emblem: "♛",
    label: "Giai cấp thống trị",
    shortLabel: "Triều đình",
    tokens: {
      "--p-accent": "oklch(0.82 0.14 85)",
      "--p-accent-soft": "oklch(0.82 0.14 85 / 0.18)",
      "--p-bg": "oklch(0.13 0.02 60)",
      "--p-surface": "oklch(0.17 0.02 60 / 0.85)",
      "--p-border": "oklch(0.82 0.14 85 / 0.35)",
      "--p-text": "oklch(0.96 0.02 85)",
      "--p-muted": "oklch(0.75 0.04 85 / 0.7)",
      "--p-danger": "oklch(0.65 0.2 25)",
      "--p-radius": "2px",
      "--p-shadow": "0 1px 0 oklch(0.82 0.14 85 / 0.4), 0 18px 40px -20px oklch(0 0 0 / 0.8)",
      "--p-grain": grainSeal,
    },
    classes: {
      surface: "bg-[var(--p-surface)] border-[var(--p-border)] shadow-[var(--p-shadow)]",
      surfaceSoft: "bg-black/40 border-[var(--p-border)]",
      border: "border-[var(--p-border)]",
      accentText: "text-[var(--p-accent)]",
      accentBg: "bg-[var(--p-accent-soft)]",
      button:
        "rounded-[var(--p-radius)] border border-[var(--p-accent)] bg-[var(--p-accent-soft)] text-[var(--p-accent)] uppercase tracking-[0.3em] font-medium hover:bg-[var(--p-accent)] hover:text-black transition",
      buttonGhost:
        "rounded-[var(--p-radius)] border border-[var(--p-border)] text-[var(--p-text)] hover:border-[var(--p-accent)] transition",
      narrator: "font-display tracking-wider italic text-[var(--p-accent)]",
      chip:
        "rounded-[var(--p-radius)] border border-[var(--p-accent)]/40 bg-[var(--p-accent-soft)] text-[var(--p-accent)]",
      progressTrack: "bg-black/50",
      progressFill: "bg-gradient-to-r from-amber-500 to-yellow-300",
      grain: "perspective-grain",
    },
  },
  worker: {
    id: "worker",
    emblem: "✊",
    label: "Giai cấp lao động",
    shortLabel: "Công xưởng",
    tokens: {
      "--p-accent": "oklch(0.68 0.2 30)",
      "--p-accent-soft": "oklch(0.68 0.2 30 / 0.2)",
      "--p-bg": "oklch(0.14 0.03 30)",
      "--p-surface": "oklch(0.18 0.03 30 / 0.85)",
      "--p-border": "oklch(0.68 0.2 30 / 0.45)",
      "--p-text": "oklch(0.96 0.02 30)",
      "--p-muted": "oklch(0.78 0.05 30 / 0.7)",
      "--p-danger": "oklch(0.72 0.22 25)",
      "--p-radius": "0px",
      "--p-shadow": "0 0 0 1px oklch(0.68 0.2 30 / 0.4), 0 22px 40px -18px oklch(0 0 0 / 0.85)",
      "--p-grain": grainRust,
    },
    classes: {
      surface: "bg-[var(--p-surface)] border-[var(--p-border)] shadow-[var(--p-shadow)]",
      surfaceSoft: "bg-black/40 border-[var(--p-border)] border-dashed",
      border: "border-[var(--p-border)] border-dashed",
      accentText: "text-[var(--p-accent)]",
      accentBg: "bg-[var(--p-accent-soft)]",
      button:
        "rounded-none border-2 border-[var(--p-accent)] bg-[var(--p-accent-soft)] text-[var(--p-accent)] uppercase tracking-[0.2em] font-bold hover:bg-[var(--p-accent)] hover:text-black transition",
      buttonGhost:
        "rounded-none border-2 border-dashed border-[var(--p-border)] text-[var(--p-text)] hover:border-[var(--p-accent)] transition",
      narrator: "font-display uppercase tracking-wide text-[var(--p-accent)]",
      chip:
        "rounded-none border-2 border-[var(--p-accent)]/50 bg-[var(--p-accent-soft)] text-[var(--p-accent)]",
      progressTrack: "bg-black/60",
      progressFill: "bg-gradient-to-r from-red-700 via-orange-600 to-amber-500",
      grain: "perspective-grain perspective-grain-heavy",
    },
  },
  historian: {
    id: "historian",
    emblem: "✎",
    label: "Nhà sử học",
    shortLabel: "Văn khố",
    tokens: {
      "--p-accent": "oklch(0.55 0.04 250)",
      "--p-accent-soft": "oklch(0.55 0.04 250 / 0.15)",
      "--p-bg": "oklch(0.93 0.02 90)",
      "--p-surface": "oklch(0.97 0.02 90 / 0.9)",
      "--p-border": "oklch(0.4 0.02 250 / 0.35)",
      "--p-text": "oklch(0.22 0.02 250)",
      "--p-muted": "oklch(0.42 0.02 250 / 0.75)",
      "--p-danger": "oklch(0.5 0.18 25)",
      "--p-radius": "6px",
      "--p-shadow": "0 1px 0 oklch(0.4 0.02 250 / 0.15), 0 18px 30px -22px oklch(0.4 0.02 250 / 0.45)",
      "--p-grain": grainPaper,
    },
    classes: {
      surface:
        "bg-[var(--p-surface)] border border-[var(--p-border)] text-[var(--p-text)] shadow-[var(--p-shadow)]",
      surfaceSoft: "bg-white/70 border border-[var(--p-border)] text-[var(--p-text)]",
      border: "border-[var(--p-border)]",
      accentText: "text-[var(--p-accent)]",
      accentBg: "bg-[var(--p-accent-soft)]",
      button:
        "rounded-md border border-[var(--p-accent)] bg-[var(--p-accent-soft)] text-[var(--p-accent)] tracking-wide font-medium hover:bg-[var(--p-accent)] hover:text-white transition",
      buttonGhost:
        "rounded-md border border-[var(--p-border)] text-[var(--p-text)] hover:border-[var(--p-accent)] transition",
      narrator: "font-serif italic text-[var(--p-text)]",
      chip:
        "rounded-md border border-[var(--p-accent)]/40 bg-[var(--p-accent-soft)] text-[var(--p-accent)]",
      progressTrack: "bg-black/10",
      progressFill: "bg-gradient-to-r from-slate-500 to-slate-700",
    grain: "perspective-grain perspective-grain-paper",
    },
  },
};

/* =========================================================
   VOICES
   ========================================================= */

export type VoiceEvent =
  | "decisionPrompt"
  | "consequence"
  | "stageEnter"
  | "stageTension"
  | "revolution"
  | "warning";

export interface VoiceCtx {
  decision?: Decision;
  option?: DecisionOption;
  stageTitle?: string;
  fallback?: string;
}

type VoiceFn = (ctx: VoiceCtx) => string;

/** Default persona — produces a tonal wrapping around the base text. */
export const DEFAULT_VOICE: Record<PerspectiveId, Record<VoiceEvent, VoiceFn>> = {
  ruler: {
    decisionPrompt: ({ fallback, decision }) =>
      `Chiếu chỉ cần ban — ${fallback ?? decision?.prompt ?? ""}`,
    consequence: ({ option }) =>
      `Lệnh đã thi hành: ${option?.label ?? ""}. Trật tự được tái lập — tạm thời.`,
    stageEnter: ({ fallback }) => `Triều ta tiếp nhận thời cuộc: ${fallback ?? ""}`,
    stageTension: ({ fallback }) =>
      `⚠ Bẩm: trật tự đang lung lay. ${fallback ?? ""}`,
    revolution: ({ fallback }) =>
      `Ngai vàng lung lay. Sử thần sẽ ghi cách trẫm sụp đổ. ${fallback ?? ""}`,
    warning: ({ fallback }) => `⚠ ${fallback ?? "Có biến."}`,
  },
  worker: {
    decisionPrompt: ({ fallback, decision }) =>
      `Anh em hỏi: ${fallback ?? decision?.prompt ?? ""}`,
    consequence: ({ option }) =>
      `Ta đã làm: ${option?.label ?? ""}. Ngày mai vẫn phải sống.`,
    stageEnter: ({ fallback }) => `Mồ hôi đổ trên đất này — ${fallback ?? ""}`,
    stageTension: ({ fallback }) =>
      `⚠ Bóc lột tăng cao. ${fallback ?? ""}`,
    revolution: ({ fallback }) =>
      `Đường phố thuộc về chúng ta. ${fallback ?? ""}`,
    warning: ({ fallback }) => `⚠ ${fallback ?? "Không thể chịu thêm."}`,
  },
  historian: {
    decisionPrompt: ({ fallback, decision }) =>
      `Quan sát: ${fallback ?? decision?.prompt ?? ""}`,
    consequence: ({ option }) =>
      `Ghi nhận chuỗi nhân quả: ${option?.label ?? ""}.`,
    stageEnter: ({ fallback }) => `Chương sử mở: ${fallback ?? ""}`,
    stageTension: ({ fallback }) =>
      `Mâu thuẫn kết cấu đang nén. ${fallback ?? ""}`,
    revolution: ({ fallback }) =>
      `Bước nhảy được dự báo bởi quy luật vận động xã hội. ${fallback ?? ""}`,
    warning: ({ fallback }) => `※ ${fallback ?? "Biến số đáng chú ý."}`,
  },
};

/**
 * Decision-level overrides. Keyed by decision.id.
 * Author only writes overrides for moments worth customising — default voice handles the rest.
 */
export const DECISION_VOICE_OVERRIDES: Partial<
  Record<string, Partial<Record<PerspectiveId, Partial<Record<VoiceEvent, string>>>>>
> = {
  "p-d3": {
    ruler: {
      decisionPrompt: "Sổ tù binh: 5 mạng. Họ có thể làm việc cho ta.",
      consequence: "Lệnh đã ban. Lao dịch của họ làm giàu kho lẫm ta.",
    },
    worker: {
      decisionPrompt: "Hôm nay là họ. Ngày mai có thể là anh em ta.",
      consequence: "Một sợi xích nữa được rèn. Sớm muộn sẽ tới lượt chúng ta.",
    },
    historian: {
      decisionPrompt: "Bước ngoặt: thặng dư + tù binh = giai cấp.",
      consequence: "Tù binh được giữ lại vì 'có giá trị kinh tế' — điểm xuất phát của xã hội có giai cấp.",
    },
  },
  "s-d2": {
    ruler: {
      decisionPrompt: "Báo cáo: nô lệ tổ chức khởi nghĩa. Quân đoàn ở xa. Trẫm quyết.",
      consequence: "Trật tự được khôi phục — bằng máu.",
    },
    worker: {
      decisionPrompt: "Anh em đã đứng lên. Ta theo họ, hay quay đầu?",
      consequence: "Hôm nay roi vọt. Đêm nay một bài hát mới ra đời.",
    },
    historian: {
      decisionPrompt: "Khủng hoảng tái sản xuất sức lao động trong chế độ nô lệ.",
      consequence: "Hệ thống lệ thuộc bạo lực để duy trì — chi phí tăng đều.",
    },
  },
  "c-d1": {
    ruler: {
      decisionPrompt: "Hội đồng quản trị họp khẩn. Kho đầy. Sức mua cạn.",
      consequence: "Cổ phiếu được cứu. Bất ổn xã hội ai đó khác chịu.",
    },
    worker: {
      decisionPrompt: "Của cải ngập đầu — sao chúng tôi vẫn đói?",
      consequence: "Phiếu sa thải trên bàn. Bữa tối hôm nay ăn gì?",
    },
    historian: {
      decisionPrompt: "Khủng hoảng thừa: nghịch lý nội tại của phương thức tư bản.",
      consequence: "Mâu thuẫn sản xuất xã hội × chiếm hữu tư nhân hiển hiện.",
    },
  },
  "c-d2": {
    ruler: {
      decisionPrompt: "Bảng cân đối: tự động hoá x5 sản lượng, /5 lao động. Ký?",
      consequence: "Lợi nhuận quý này phá kỷ lục. Hậu quả là vấn đề chính phủ.",
    },
    worker: {
      decisionPrompt: "Máy thay người. Người làm gì để sống?",
      consequence: "Hàng triệu đồng nghiệp ra đường. Câu hỏi 'của ai vì ai' lớn dần.",
    },
    historian: {
      decisionPrompt: "LLSX vượt khả năng dung nạp của QHSX tư nhân — thời điểm kinh điển.",
      consequence: "Mâu thuẫn cơ bản leo thang đúng như mô tả trong Tư Bản, Q.1, ch.32.",
    },
  },
};

/* =========================================================
   OBJECTIVES
   ========================================================= */

export interface PerspectiveObjective {
  primary: string;
  hint: string;
  metricsWatched: MetricKey[];
  /** 0..100 — perspective-specific score, recomputed every state change */
  score: (s: SimState) => number;
  /** Contextual HUD warning, null if all clear */
  warning: (s: SimState) => string | null;
}

export const PERSPECTIVE_OBJECTIVES: Record<PerspectiveId, PerspectiveObjective> = {
  ruler: {
    primary: "Giữ trật tự, đè nén cách mạng",
    hint: "Stability ≥ 60 · Revolution ≤ 40 · tránh để contradiction bùng",
    metricsWatched: ["stability", "revolution", "contradiction"],
    score: (s) => {
      const m = s.metrics;
      const raw =
        0.45 * m.stability +
        0.3 * (100 - m.revolution) +
        0.15 * m.production -
        s.revolutionsBurned * 18;
      return Math.max(0, Math.min(100, raw));
    },
    warning: (s) => {
      if (s.metrics.stability < 35) return "Trật tự đang lung lay";
      if (s.metrics.revolution > 60) return "Khởi nghĩa đang chín";
      if (s.metrics.contradiction > 75) return "Triều đình mất chính danh";
      return null;
    },
  },
  worker: {
    primary: "Nâng ý thức giai cấp, lật trật tự",
    hint: "Contradiction cao · Revolution chín · chọn lựa tiến bộ",
    metricsWatched: ["contradiction", "revolution", "production"],
    score: (s) => {
      const m = s.metrics;
      const raw =
        s.revolutionsBurned * 28 +
        s.progressiveCount * 10 +
        0.25 * m.contradiction -
        0.2 * m.stability +
        0.1 * m.production;
      return Math.max(0, Math.min(100, raw));
    },
    warning: (s) => {
      if (s.metrics.contradiction > 60 && s.metrics.stability > 60)
        return "Bóc lột tăng — quần chúng chưa thức tỉnh";
      if (s.metrics.stability > 75) return "Trật tự cũ vẫn vững — cần đẩy mâu thuẫn";
      return null;
    },
  },
  historian: {
    primary: "Hiểu mọi mắt xích nhân quả",
    hint: "Mở khoá insight & tech — phân tích chuỗi cause→effect",
    metricsWatched: ["tech", "contradiction", "production"],
    score: (s) => {
      const totalInsights = 11; // approx — recomputed elsewhere if needed
      const totalTech = 20;
      const raw =
        (s.insights.length / totalInsights) * 65 +
        (s.unlockedTech.length / totalTech) * 35;
      return Math.max(0, Math.min(100, raw));
    },
    warning: (s) => {
      if (s.metrics.contradiction > 70) return "Mâu thuẫn kết cấu sâu — ghi chép kỹ";
      return null;
    },
  },
};

/* =========================================================
   ENDING NARRATIONS — per vibe × perspective
   ========================================================= */

export type EndingVibe = Ending["vibe"];

export interface EndingNarration {
  title: string;
  body: string;
  epitaph: string;
}

export const ENDING_NARRATIONS: Record<EndingVibe, Record<PerspectiveId, EndingNarration>> = {
  linear: {
    ruler: {
      title: "Triều đại trường tồn — tạm thời",
      body: "Ngươi đã cải cách đúng lúc, nhượng bộ đủ liều để không phải mất tất cả. Ngai vàng còn đó. Nhưng quyền lực đã loãng đi qua mỗi lần ký tên.",
      epitaph: "Sử sách sẽ nói: một vị vua khôn ngoan — và một trật tự đang chết dần.",
    },
    worker: {
      title: "Cải cách thay vì cách mạng",
      body: "Anh em được tăng lương, giảm giờ, có bảo hiểm. Nhưng máy móc vẫn không thuộc về ta. Cuộc đấu tranh bị hoãn — chưa bị dập tắt.",
      epitaph: "Mỗi thế hệ phải tự đặt lại câu hỏi: cải cách đến đâu là đủ?",
    },
    historian: {
      title: "Quá độ tuần tự — đúng theo mô hình",
      body: "Năm hình thái nối tiếp nhau qua cải cách, không qua đứt gãy. Quan hệ sản xuất biến đổi đủ nhanh để chứa lực lượng sản xuất mới.",
      epitaph: "Ghi chú phương pháp: trường hợp mẫu cho luận đề 'quá độ hoà bình'. Cần đối chiếu phản ví dụ.",
    },
  },
  rupture: {
    ruler: {
      title: "Triều đại sụp trong ba tuần",
      body: "Lời cảnh báo bị bỏ ngoài tai. Dinh thự ngươi cháy. Sổ sách bị đốt. Lịch sử không hỏi ngươi có đồng ý.",
      epitaph: "Ai từ chối cải cách thì gọi cách mạng đến cửa.",
    },
    worker: {
      title: "Cờ bay trên nóc xưởng",
      body: "Lần đầu trong đời, anh em ký tên mình — không phải để xin việc, mà để biểu quyết. Có máu. Có nước mắt. Có tự do.",
      epitaph: "Đêm nay anh em ngủ trong căn phòng của chính mình.",
    },
    historian: {
      title: "Bước nhảy đúng dự báo",
      body: "Mâu thuẫn cơ bản tích luỹ vượt ngưỡng. Quan hệ sản xuất cũ vỡ vụn, một quan hệ mới tự tổ chức trong đống đổ nát.",
      epitaph: "Thời gian từ khủng hoảng tới chuyển hoá ngắn hơn dự báo Marx 1867 khoảng 11 năm. Xét lại biến số tổ chức.",
    },
  },
  future: {
    ruler: {
      title: "Quyền lực chuyển tay êm dịu",
      body: "Ngươi đã ký vào văn bản cuối cùng — bàn giao cổ phần chiến lược cho hợp tác xã. Không vinh quang, không nhục nhã. Chỉ là kết thúc của một logic đã hết hạn.",
      epitaph: "Lịch sử ghi: một giai cấp biết tự rút lui — hiếm.",
    },
    worker: {
      title: "Của chúng ta, vì chúng ta",
      body: "Máy móc làm phần lớn việc. Anh em quyết định làm gì với thời gian còn lại. Lần đầu tiên, lao động không còn là gánh nặng để sống — mà là cách sống.",
      epitaph: "'Vương quốc tự do' không phải khẩu hiệu nữa. Nó là thời khoá biểu sáng thứ Hai.",
    },
    historian: {
      title: "Hình thái mới được tổ chức",
      body: "Tự động hoá + sở hữu xã hội về dữ liệu và AI mở ra một quan hệ sản xuất chưa từng có. Lý thuyết hậu-tư bản chuyển từ tiên tri sang mô tả.",
      epitaph: "Cần khung phân loại mới: 'XHCN số' không vừa với danh mục 1917.",
    },
  },
  stagnation: {
    ruler: {
      title: "Trật tự được bảo toàn — và đóng băng",
      body: "Ngươi đã đè nén mọi mầm mống biến đổi. Triều đại không sụp. Nhưng nó cũng không còn sinh ra điều gì mới.",
      epitaph: "Lịch sử trượt qua ngươi — và sẽ không quay lại.",
    },
    worker: {
      title: "Một thế hệ nữa bị bỏ lỡ",
      body: "Anh em đã sợ hãi, đã chia rẽ, đã chấp nhận. Xích vẫn còn — cũ hơn, nặng hơn.",
      epitaph: "Sự cam chịu cũng là một lựa chọn. Và nó có giá.",
    },
    historian: {
      title: "Không đủ áp lực để chuyển hoá",
      body: "LLSX dừng lại trong vỏ QHSX cũ. Không phải mọi xã hội đều tiến hoá — duy vật lịch sử không hứa điều đó.",
      epitaph: "Phản ví dụ giá trị: chứng minh tiến hoá không tự động, cần điều kiện chủ quan.",
    },
  },
};

/* =========================================================
   INSIGHT TAGS + VISIBILITY
   ========================================================= */

export type InsightTag =
  | "labor"
  | "exploitation"
  | "solidarity"
  | "classStruggle"
  | "governance"
  | "order"
  | "legitimacy"
  | "structural"
  | "causal";

/** Map từ insight.id → tags (vì Insight chưa có field tags). */
export const INSIGHT_TAGS: Record<string, InsightTag[]> = {
  "i-surplus": ["structural", "causal"],
  "i-firstclass": ["classStruggle", "exploitation", "structural"],
  "i-colonus": ["labor", "structural"],
  "i-techstall": ["structural", "causal"],
  "i-primaccum": ["exploitation", "structural"],
  "i-revolution": ["classStruggle", "causal"],
  "i-overproduction": ["exploitation", "structural"],
  "i-contradiction": ["structural", "classStruggle"],
  "i-distribution": ["governance", "labor"],
  "i-newrelations": ["governance", "solidarity"],
};

export const INSIGHT_VISIBILITY: Record<
  PerspectiveId,
  { hidden: InsightTag[] }
> = {
  ruler: { hidden: ["solidarity", "classStruggle"] }, // cannot see worker consciousness
  worker: { hidden: ["governance", "legitimacy"] }, // cannot see ruler logic
  historian: { hidden: [] },
};

export function isInsightVisible(insight: Insight, p: PerspectiveId): boolean {
  const tags = INSIGHT_TAGS[insight.id] ?? [];
  const hidden = INSIGHT_VISIBILITY[p].hidden;
  return !tags.some((t) => hidden.includes(t));
}

/* =========================================================
   OPTION GATES + EXTRA PERSPECTIVE-ONLY OPTIONS
   ========================================================= */

/**
 * Hard gate existing options: only render if perspective matches.
 * Soft emphasize: highlight border (option still visible to all).
 */
export const OPTION_GATES: Record<
  string /* optionId */,
  { visibleTo?: PerspectiveId[]; emphasizeFor?: PerspectiveId[] }
> = {
  // Sharing fire: progressive — emphasized for worker
  share: { emphasizeFor: ["worker"] },
  hoard: { emphasizeFor: ["ruler"] },
  enslave: { emphasizeFor: ["ruler"] },
  free: { emphasizeFor: ["worker"] },
  war: { emphasizeFor: ["ruler"] },
  reform: { emphasizeFor: ["historian"] },
  crush: { emphasizeFor: ["ruler"] },
  concede: { emphasizeFor: ["historian"] },
  ignore: { emphasizeFor: ["ruler"] },
  invest: { emphasizeFor: ["historian"] },
  grant: { emphasizeFor: ["ruler"] },
  fund: { emphasizeFor: ["ruler"] },
  refuse: { emphasizeFor: ["ruler"] },
  repress: { emphasizeFor: ["ruler"] },
  constitution: { emphasizeFor: ["historian"] },
  layoff: { emphasizeFor: ["ruler"] },
  welfare: { emphasizeFor: ["historian"] },
  "automate-private": { emphasizeFor: ["ruler"] },
  "automate-share": { emphasizeFor: ["worker"] },
  "techno-fix": { emphasizeFor: ["ruler"] },
  "social-plan": { emphasizeFor: ["worker"] },
  ubi: { emphasizeFor: ["historian"] },
  equal: { emphasizeFor: ["worker"] },
  "data-common": { emphasizeFor: ["worker"] },
  "data-private": { emphasizeFor: ["ruler"] },
  transparent: { emphasizeFor: ["worker"] },
  topdown: { emphasizeFor: ["ruler"] },
};

/**
 * Extra options injected per (decisionId, perspective).
 * These are perspective-only — only that perspective sees them.
 */
export const EXTRA_OPTIONS: Record<
  string,
  Partial<Record<PerspectiveId, DecisionOption>>
> = {
  "p-d3": {
    worker: {
      id: "p-d3-w-flee",
      label: "Tổ chức mạng lưới giúp tù binh trốn",
      flavor: "Đặt nền móng cho tình đoàn kết xuyên bộ lạc.",
      effect: { contradiction: 4, revolution: 6, stability: -4 },
      causeChain: [
        "Đoàn kết với người bị bắt",
        "→ Ý thức 'họ giống ta'",
        "→ Mầm mống đấu tranh giai cấp",
      ],
    },
    historian: {
      id: "p-d3-h-doc",
      label: "Ghi chép tần suất bắt tù binh",
      flavor: "Dữ liệu cho thế hệ sau hiểu thời khắc giai cấp ra đời.",
      effect: { tech: 4 },
      causeChain: [
        "Tư liệu hoá",
        "→ Bằng chứng cho lý thuyết giai cấp",
      ],
      insight: "i-firstclass",
    },
  },
  "s-d2": {
    ruler: {
      id: "s-d2-r-deploy",
      label: "Điều quân đoàn — đàn áp triệt để",
      flavor: "Mượn 6 quân đoàn tinh nhuệ. Cái giá: thuế quý sau tăng gấp đôi.",
      effect: { stability: 14, revolution: -10, contradiction: 8, production: -6 },
      causeChain: ["Đàn áp quy mô", "→ Im lặng cưỡng bức", "→ Tài chính cạn"],
    },
    worker: {
      id: "s-d2-w-join",
      label: "Bỏ chạy gia nhập Spartacus",
      flavor: "Đêm nay — hoặc không bao giờ.",
      effect: { revolution: 18, contradiction: 12, stability: -10 },
      causeChain: ["Tham gia khởi nghĩa", "→ Mở rộng phong trào", "→ Áp lực CM tăng vọt"],
      progressive: true,
    },
  },
  "c-d1": {
    worker: {
      id: "c-d1-w-strike",
      label: "Tổ chức tổng đình công",
      flavor: "Đặt máy ngừng — buộc tư bản đàm phán.",
      effect: { revolution: 14, contradiction: 10, stability: -10, production: -6 },
      causeChain: ["Tổng đình công", "→ Đòn bẩy giai cấp", "→ Áp lực CM tăng"],
      progressive: true,
    },
    historian: {
      id: "c-d1-h-analyze",
      label: "Phân tích chu kỳ khủng hoảng",
      flavor: "So sánh 1873 · 1929 · 2008 · 2024 — mẫu lặp.",
      effect: { tech: 6, contradiction: 2 },
      causeChain: ["Phân tích chu kỳ", "→ Hiểu tính tất yếu của khủng hoảng"],
      insight: "i-overproduction",
    },
  },
  "c-d2": {
    worker: {
      id: "c-d2-w-occupy",
      label: "Chiếm xưởng — tự quản máy móc",
      flavor: "Argentina 2001. Mondragon. Lucas Aerospace.",
      effect: { revolution: 16, contradiction: 8, stability: -10, production: 4 },
      causeChain: ["Tự quản công nghiệp", "→ QHSX mới trong vỏ cũ"],
      insight: "i-contradiction",
      progressive: true,
    },
  },
  "x-d2": {
    historian: {
      id: "x-d2-h-meta",
      label: "So sánh các mô hình sở hữu AI",
      flavor: "Wikipedia · Linux · Mondragon · các cooperative platform.",
      effect: { tech: 8 },
      causeChain: ["Phân tích so sánh", "→ Khung lý thuyết QHSX số"],
      insight: "i-newrelations",
    },
  },
};

/**
 * Resolve final options list for a (decision, perspective).
 * - Filter: hide options whose visibleTo excludes this perspective.
 * - Append: extra perspective-only options for this decision.
 */
export function resolveOptions(
  decision: Decision,
  perspective: PerspectiveId,
): DecisionOption[] {
  const base = decision.options.filter((o) => {
    const gate = OPTION_GATES[o.id];
    if (gate?.visibleTo && !gate.visibleTo.includes(perspective)) return false;
    return true;
  });
  const extra = EXTRA_OPTIONS[decision.id]?.[perspective];
  return extra ? [...base, extra] : base;
}

export function isOptionEmphasized(
  optionId: string,
  perspective: PerspectiveId,
): boolean {
  return OPTION_GATES[optionId]?.emphasizeFor?.includes(perspective) ?? false;
}

/* =========================================================
   VOICE RESOLVER
   ========================================================= */

export function resolveVoice(
  perspective: PerspectiveId,
  event: VoiceEvent,
  ctx: VoiceCtx,
): string {
  const override = ctx.decision?.id
    ? DECISION_VOICE_OVERRIDES[ctx.decision.id]?.[perspective]?.[event]
    : undefined;
  if (override) return override;
  // also honour legacy `decision.voice[perspective]` as decisionPrompt override
  if (event === "decisionPrompt" && ctx.decision?.voice?.[perspective]) {
    return ctx.decision.voice[perspective]!;
  }
  return DEFAULT_VOICE[perspective][event]({ ...ctx });
}
