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
import {
  STAGES,
  TECH_TREE,
  type Decision,
  type DecisionOption,
  type Insight,
  type MetricKey,
  type OptionTag,
  type PerspectiveId,
} from "../historicalSim";
import type {
  Pressures,
  TierId,
} from "@/data/contradiction";
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
  "p-d1": {
    ruler: {
      decisionPrompt: "Lửa làm đêm bớt lạnh và làm uy quyền có hình. Nếu ai cũng giữ lửa, trưởng lão còn gì để ràng buộc bộ lạc?",
    },
    worker: {
      decisionPrompt: "Lửa là hơi ấm của cả nhóm. Nếu một nhà giữ riêng, những người còn lại sẽ đói lạnh trước khi kịp săn.",
    },
    historian: {
      decisionPrompt: "Quan sát bước đầu của phân phối công cụ chung: lửa vừa tăng năng suất, vừa có thể trở thành dấu hiệu quyền lực.",
    },
  },
  "p-d2": {
    ruler: {
      decisionPrompt: "Mùa săn cạn. Định cư bên sông giúp tích trữ, nhưng kho lương cũng cần người canh và luật chia phần.",
    },
    worker: {
      decisionPrompt: "Đàn thú đi xa, trẻ nhỏ đói. Gieo hạt có thể cứu mùa sau, nhưng ai sẽ được giữ phần thặng dư đầu tiên?",
    },
    historian: {
      decisionPrompt: "Đây là ngưỡng vật chất của thặng dư: nông nghiệp làm lịch sử chuyển từ sinh tồn tức thời sang tích lũy.",
    },
  },
  "p-d3": {
    ruler: {
      decisionPrompt: "Sổ tù binh: 5 mạng. Giết họ thì hết chuyện; giữ họ lại thì kho lương lớn hơn và quyền lực có người gánh.",
    },
    worker: {
      decisionPrompt: "Hôm nay là họ, ngày mai có thể là anh em ta. Thặng dư tăng lên, nhưng một sợi xích mới cũng được rèn.",
    },
    historian: {
      decisionPrompt: "Bước ngoặt có thể ghi được: thặng dư + chiến tranh + tù binh tạo điều kiện vật chất cho giai cấp.",
    },
  },
  "s-d1": {
    ruler: {
      decisionPrompt: "Mỏ và ruộng cần thêm nô lệ. Chiến tranh mở rộng sản xuất, nhưng mỗi quân đoàn cũng mở thêm một khoản nợ chính danh.",
    },
    worker: {
      decisionPrompt: "Đế chế gọi đó là mở rộng. Với người bị bắt, đó là thêm xiềng, thêm roi, thêm người mất tên.",
    },
    historian: {
      decisionPrompt: "Chế độ nô lệ tái sản xuất bằng chiến tranh: sản lượng tăng khi con người bị biến thành tư liệu sản xuất.",
    },
  },
  "s-d2": {
    ruler: {
      decisionPrompt: "Báo cáo: nô lệ tổ chức khởi nghĩa. Đàn áp giữ trật tự trước mắt, nhượng bộ giữ sản xuất, nhưng cả hai đều thú nhận hệ thống đang nứt.",
    },
    worker: {
      decisionPrompt: "Anh em đã đứng lên. Theo họ là đánh cược mạng sống; quay đầu là tiếp tục sống như công cụ biết nói.",
    },
    historian: {
      decisionPrompt: "Khủng hoảng tái sản xuất sức lao động trong chế độ nô lệ: bạo lực duy trì trật tự nhưng làm chi phí cai trị tăng.",
    },
  },
  "s-d3": {
    ruler: {
      decisionPrompt: "Máy hơi nước thô sơ hứa thay sức người. Nhưng nếu máy làm việc, giá trị của nô lệ và quyền sở hữu nô lệ sẽ lung lay.",
    },
    worker: {
      decisionPrompt: "Một quả cầu quay bằng hơi nước. Nó có thể giảm lao dịch, nhưng chủ nô sẽ chỉ dùng nó nếu quyền của họ không bị đụng tới.",
    },
    historian: {
      decisionPrompt: "Phát minh xuất hiện trước điều kiện xã hội của nó. Lao động nô lệ rẻ làm kỹ thuật không trở thành lực lượng sản xuất chủ đạo.",
    },
  },
  "f-d1": {
    ruler: {
      decisionPrompt: "Phường hội xin đặc quyền để giữ trật tự nghề. Thương nhân muốn thị trường tự do; triều đình cần thuế và sự yên ổn.",
    },
    worker: {
      decisionPrompt: "Thợ thủ công muốn giữ miếng ăn, thương nhân muốn phá rào. Người làm thuê bị kẹt giữa luật cũ và chợ mới.",
    },
    historian: {
      decisionPrompt: "Mâu thuẫn giữa phường hội phong kiến và thị trường đang mở: lực lượng sản xuất đô thị bắt đầu vượt khung đặc quyền.",
    },
  },
  "f-d2": {
    ruler: {
      decisionPrompt: "Tài trợ thám hiểm có thể mở bạc vàng và thuộc địa. Nhưng đường biển mới cũng làm các lãnh chúa đất liền mất vai trò.",
    },
    worker: {
      decisionPrompt: "Tàu rời cảng, thuế và lính cũng rời làng. Thị trường thế giới mở ra, còn nông dân trả giá bằng tô và đất.",
    },
    historian: {
      decisionPrompt: "Phát kiến địa lý là tích lũy tư bản nguyên thủy: thương mại xa, cướp đoạt và thị trường thế giới làm phong kiến lỗi thời.",
    },
  },
  "f-d3": {
    ruler: {
      decisionPrompt: "Thị dân, nông dân và quý tộc tiến bộ đòi xóa đặc quyền. Đàn áp có thể thắng một ngày; hiến pháp có thể cứu một phần quyền lực.",
    },
    worker: {
      decisionPrompt: "Sổ tô, đặc quyền và cổng thành cùng chắn đường sống. Nếu quần chúng không tự tổ chức, cách mạng sẽ đổi chủ chứ chưa chắc đổi đời.",
    },
    historian: {
      decisionPrompt: "Tình thế cách mạng tư sản: quan hệ phong kiến không còn chứa nổi thị trường và sản xuất hàng hóa đang lớn lên.",
    },
  },
  "c-d1": {
    ruler: {
      decisionPrompt: "Hội đồng quản trị họp khẩn. Kho đầy, sức mua cạn; cứu lợi nhuận hôm nay có thể chuyển khủng hoảng sang xã hội ngày mai.",
    },
    worker: {
      decisionPrompt: "Của cải ngập kho mà bữa cơm thiếu. Khủng hoảng không phải vì thiếu hàng, mà vì người làm ra hàng không đủ tiền mua.",
    },
    historian: {
      decisionPrompt: "Khủng hoảng thừa phơi bày nghịch lý CNTB: sản xuất xã hội hóa nhưng chiếm hữu vẫn tư nhân.",
    },
  },
  "c-d2": {
    ruler: {
      decisionPrompt: "Bảng cân đối: tự động hóa x5 sản lượng, /5 lao động. Lợi nhuận tăng, nhưng đội quân thất nghiệp cũng tăng.",
    },
    worker: {
      decisionPrompt: "Máy thay người. Nếu máy thuộc về tư bản, ta mất việc; nếu máy thuộc về xã hội, ta có thời gian sống.",
    },
    historian: {
      decisionPrompt: "LLSX tự động hóa vượt khả năng dung nạp của QHSX tư nhân: câu hỏi không còn là sản xuất thế nào, mà của ai.",
    },
  },
  "c-d3": {
    ruler: {
      decisionPrompt: "Khí hậu và AI cùng ép bảng cân đối. Thị trường hứa tự sửa, nhưng thời gian sinh thái không chờ lợi nhuận quý sau.",
    },
    worker: {
      decisionPrompt: "Nắng nóng, thất nghiệp và thuật toán cùng rơi xuống đời sống. Không có kế hoạch chung, mỗi người tự chịu thảm họa riêng.",
    },
    historian: {
      decisionPrompt: "Khủng hoảng kép cho thấy giới hạn lịch sử của CNTB: công nghệ đủ mạnh, nhưng quan hệ sở hữu kéo nó về lợi nhuận.",
    },
  },
  "x-d1": {
    ruler: {
      decisionPrompt: "Máy làm 70% công việc. Phân phối sai sẽ làm kế hoạch mất chính danh; cào bằng máy móc sẽ giết động lực sáng tạo.",
    },
    worker: {
      decisionPrompt: "Máy làm thay phần nặng nhất. Vấn đề là ai được nghỉ, ai được học, ai vẫn bị buộc chứng minh mình có ích.",
    },
    historian: {
      decisionPrompt: "Giai đoạn đầu XHCN phải giải quyết phân phối: nhu cầu cơ bản, đóng góp lao động và động lực phát triển cùng tồn tại.",
    },
  },
  "x-d2": {
    ruler: {
      decisionPrompt: "Dữ liệu và AI là tư liệu sản xuất mới. Tập trung để điều phối dễ hơn, nhưng độc quyền số có thể tái sinh giai cấp mới.",
    },
    worker: {
      decisionPrompt: "Dữ liệu của mọi người huấn luyện máy. Nếu lợi ích rơi vào vài tập đoàn, lao động số lại bị tước đoạt lần nữa.",
    },
    historian: {
      decisionPrompt: "Sở hữu dữ liệu quyết định QHSX số: AI mở có thể là hợp tác xã tri thức, AI độc quyền có thể là tư bản mới.",
    },
  },
  "x-d3": {
    ruler: {
      decisionPrompt: "Bộ máy kế hoạch cần quyền lực để điều phối. Nhưng nếu không bị kiểm soát, nó có thể tự tha hóa thành đặc quyền.",
    },
    worker: {
      decisionPrompt: "Ta đã đổi chủ sở hữu, nhưng chưa xong. Nếu đại biểu không thể bị bãi nhiệm, tiếng nói cơ sở sẽ lại bị nói thay.",
    },
    historian: {
      decisionPrompt: "Mâu thuẫn nội tại của xây dựng XHCN: tổ chức quyền lực chung mà không để bộ máy chung biến thành lợi ích riêng.",
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
  pressuresWatched: (keyof Pressures)[];
  /** 0..100 — perspective-specific score, recomputed every state change */
  score: (s: SimState) => number;
  /** Contextual HUD warning, null if all clear */
  warning: (s: SimState) => string | null;
}

const TOTAL_INSIGHTS = Math.max(
  1,
  new Set(STAGES.flatMap((stage) => stage.insights.map((insight) => insight.id))).size,
);
const TOTAL_TECH = Math.max(1, TECH_TREE.length);

export const PERSPECTIVE_OBJECTIVES: Record<PerspectiveId, PerspectiveObjective> = {
  ruler: {
    primary: "Giữ trật tự, đè nén cách mạng",
    hint: "Stability ≥ 60 · Revolution ≤ 40 · tránh để contradiction bùng",
    metricsWatched: ["stability", "revolution", "contradiction"],
    pressuresWatched: ["repression", "legitimacyLoss", "ruptureRisk"],
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
    pressuresWatched: ["classTension", "organization", "repression"],
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
    pressuresWatched: ["classTension", "productionInstability", "ruptureRisk"],
    score: (s) => {
      const raw =
        (s.insights.length / TOTAL_INSIGHTS) * 65 +
        (s.unlockedTech.length / TOTAL_TECH) * 35;
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
  crush: { visibleTo: ["ruler", "historian"], emphasizeFor: ["ruler"] },
  concede: { emphasizeFor: ["historian"] },
  ignore: { emphasizeFor: ["ruler"] },
  invest: { emphasizeFor: ["historian"] },
  grant: { emphasizeFor: ["ruler"] },
  fund: { emphasizeFor: ["ruler"] },
  refuse: { emphasizeFor: ["ruler"] },
  repress: { visibleTo: ["ruler", "historian"], emphasizeFor: ["ruler"] },
  constitution: { emphasizeFor: ["historian"] },
  layoff: { visibleTo: ["ruler", "historian"], emphasizeFor: ["ruler"] },
  welfare: { emphasizeFor: ["historian"] },
  "automate-private": { visibleTo: ["ruler", "historian"], emphasizeFor: ["ruler"] },
  "automate-share": { emphasizeFor: ["worker"] },
  "techno-fix": { emphasizeFor: ["ruler"] },
  "social-plan": { emphasizeFor: ["worker"] },
  ubi: { emphasizeFor: ["historian"] },
  equal: { emphasizeFor: ["worker"] },
  "data-common": { emphasizeFor: ["worker"] },
  "data-private": { emphasizeFor: ["ruler"] },
  transparent: { emphasizeFor: ["worker"] },
  topdown: { visibleTo: ["ruler", "historian"], emphasizeFor: ["ruler"] },
};

/**
 * Extra options injected per (decisionId, perspective).
 * These are perspective-only — only that perspective sees them.
 */
type OptionCopyOverride = Partial<Pick<DecisionOption, "label" | "flavor" | "causeChain">>;

/**
 * Role-specific rendering for shared historical options.
 *
 * Effects/tags stay unchanged so the same material event remains comparable
 * across perspectives. Only the spoken position changes: command from above,
 * lived response from below, or analytic record from outside.
 */
export const OPTION_COPY_OVERRIDES: Record<
  string,
  Partial<Record<PerspectiveId, Record<string, OptionCopyOverride>>>
> = {
  "p-d1": {
    ruler: {
      share: {
        label: "Ban lệ dùng lửa chung dưới quyền trưởng lão",
        flavor: "Lửa được chia, nhưng nghi thức chia phần bắt đầu đặt cộng đồng dưới một trung tâm điều phối.",
      },
      hoard: {
        label: "Giữ lửa trong tay nhóm mạnh",
        flavor: "Quyền sống sót qua đêm lạnh trở thành quyền bắt người khác phục tùng.",
      },
    },
    worker: {
      share: {
        label: "Chuyền lửa qua từng bếp",
        flavor: "Không nhà nào bị bỏ lại ngoài vòng ấm; công cụ sống còn vẫn thuộc về cả nhóm.",
      },
      hoard: {
        label: "Để một nhà giữ lửa riêng",
        flavor: "Đêm nay họ hứa chia than. Ngày mai họ có thể bắt người khác đổi công lấy hơi ấm.",
      },
    },
    historian: {
      share: { label: "mẫu phân phối công cụ chung" },
      hoard: { label: "mầm độc quyền công cụ sống còn" },
    },
  },
  "p-d2": {
    ruler: {
      farm: {
        label: "Dựng kho hạt giống và cử người canh",
        flavor: "Định cư cứu đói mùa sau, đồng thời tạo kho thặng dư cần luật lệ và người giữ kho.",
      },
      migrate: {
        label: "Giữ lối du cư theo đàn thú",
        flavor: "Không kho, không người giữ kho; trật tự cũ còn nhẹ, nhưng năng suất vẫn thấp.",
      },
    },
    worker: {
      farm: {
        label: "Cùng gieo hạt bên bờ sông",
        flavor: "Gieo hạt là hy vọng, nhưng phần dư đầu tiên cũng có thể bị tách khỏi tay người gieo.",
      },
      migrate: {
        label: "Gùi trẻ nhỏ đi theo đàn thú",
        flavor: "Không ai tích trữ riêng, nhưng cái đói vẫn đuổi sát sau lưng cả nhóm.",
      },
    },
    historian: {
      farm: { label: "ngưỡng thặng dư nông nghiệp" },
      migrate: { label: "tái sản xuất săn bắt - hái lượm" },
    },
  },
  "p-d3": {
    ruler: {
      enslave: {
        label: "Giữ tù binh làm lao dịch",
        flavor: "Tha chết cho họ bằng cách biến thân thể họ thành sức sản xuất lệ thuộc.",
      },
      free: {
        label: "Thả tù binh để giữ lệ cũ",
        flavor: "Bình đẳng cộng đồng được giữ lại, nhưng thặng dư và quyền lực riêng chưa có chỗ bám.",
      },
    },
    worker: {
      enslave: {
        label: "Chấp nhận xiềng xích đầu tiên",
        flavor: "Thặng dư nhiều hơn, nhưng một ranh giới mới xuất hiện giữa người ra lệnh và người bị lệnh.",
      },
      free: {
        label: "Đòi thả người bị bắt",
        flavor: "Giữ ký ức rằng người thua trận vẫn là người, không phải công cụ biết nói.",
      },
    },
    historian: {
      enslave: { label: "sự hình thành lao động cưỡng bức" },
      free: { label: "sự kéo dài quan hệ cộng đồng cũ" },
    },
  },
  "s-d1": {
    ruler: {
      war: {
        label: "Mở chiến dịch bắt nô lệ",
        flavor: "Mỏ, ruộng và công trình cần thêm thân người; quân đoàn biến chiến tranh thành nguồn lao động.",
      },
      reform: {
        label: "Chuyển một phần nô lệ thành tá điền lệ thuộc",
        flavor: "Nới xiềng để giữ sản xuất, nhưng quyền sở hữu ruộng đất vẫn nằm ở trên.",
      },
    },
    worker: {
      war: {
        label: "Tan rã trước đoàn quân bắt người",
        flavor: "Khi các làng bị cô lập, đế chế biến từng người thành chiến lợi phẩm lao động.",
        causeChain: [
          "Không chặn được chiến dịch bắt người",
          "→ Thêm thân người bị biến thành công cụ sản xuất",
          "→ Sản xuất tăng bằng cưỡng bức, mâu thuẫn sâu hơn",
        ],
      },
      reform: {
        label: "Ép chủ nô nới xiềng thành tá điền",
        flavor: "Đời sống bớt roi trực tiếp, nhưng đất và luật vẫn nằm trong tay người sở hữu.",
        causeChain: [
          "Đấu tranh đòi giảm cưỡng bức trực tiếp",
          "→ Một phần lao động chuyển sang lệ thuộc mềm hơn",
          "→ Mâu thuẫn hạ nhiệt nhưng chưa biến mất",
        ],
      },
    },
    historian: {
      war: { label: "chiến tranh như cơ chế tái sản xuất nô lệ" },
      reform: { label: "hình thức lệ thuộc chuyển tiếp sang colonus" },
    },
  },
  "s-d2": {
    worker: {
      concede: {
        label: "Đòi khẩu phần và ngày nghỉ để sống tiếp",
        flavor: "Nhượng bộ nhỏ có thể cứu mạng hôm nay, nhưng không phá được quyền sở hữu con người.",
        causeChain: [
          "Yêu sách sinh tồn",
          "→ Chủ nô nhượng bộ để giữ lao động",
          "→ Mâu thuẫn hạ nhiệt nhưng xiềng vẫn còn",
        ],
      },
    },
    historian: {
      crush: { label: "bạo lực đàn áp khởi nghĩa nô lệ" },
      concede: { label: "nhượng bộ nhằm tái ổn định lao động cưỡng bức" },
    },
  },
  "s-d3": {
    ruler: {
      ignore: {
        label: "Xếp máy hơi nước vào trò biểu diễn",
        flavor: "Khi người rẻ hơn máy, phát minh bị để ngoài sản xuất.",
      },
      invest: {
        label: "Thử dùng máy để thay một phần lao dịch",
        flavor: "Đầu tư kỹ thuật có thể tăng năng suất, nhưng làm lung lay giá trị sở hữu nô lệ.",
      },
    },
    worker: {
      ignore: {
        label: "Tiếp tục kéo đá bằng tay",
        flavor: "Phát minh nằm trong sân quý tộc; ngoài mỏ, lưng người vẫn là động cơ rẻ nhất.",
        causeChain: [
          "Máy bị bỏ qua",
          "→ Lao dịch cưỡng bức tiếp tục rẻ hơn cải tiến",
          "→ LLSX bị QHSX nô lệ kìm lại",
        ],
      },
      invest: {
        label: "Đòi dùng máy để giảm lao dịch",
        flavor: "Kỹ thuật có thể bớt đau thân người, nhưng chủ nô chỉ chấp nhận nếu quyền của họ còn nguyên.",
      },
    },
    historian: {
      ignore: { label: "phát minh bị quan hệ nô lệ làm vô dụng" },
      invest: { label: "mầm kỹ thuật vượt trước điều kiện xã hội" },
    },
  },
  "f-d1": {
    worker: {
      grant: {
        label: "Bám vào phường hội để giữ miếng ăn",
        flavor: "Đặc quyền nghề bảo vệ thợ cũ, nhưng cũng chặn người nghèo bước vào sản xuất đô thị.",
      },
      free: {
        label: "Phá rào nghề, nhận rủi ro chợ mới",
        flavor: "Thị trường mở đường cho sản xuất lớn hơn, đồng thời đẩy người làm thuê vào cạnh tranh khắc nghiệt.",
      },
    },
    historian: {
      grant: { label: "đặc quyền phường hội bảo vệ trật tự cũ" },
      free: { label: "thị trường đô thị phá khung phong kiến" },
    },
  },
  "f-d2": {
    ruler: {
      fund: {
        label: "Cấp ngân khố cho hải trình và thuộc địa",
        flavor: "Đường biển mới hứa vàng bạc, thị trường và quyền lực trung ương vượt khỏi lãnh địa cũ.",
      },
      refuse: {
        label: "Khóa ngân khố, giữ trật tự đất liền",
        flavor: "Bảo vệ quý tộc ruộng đất, nhưng để thương nghiệp mới trôi sang tay thế lực khác.",
      },
    },
    worker: {
      fund: {
        label: "Bị huy động thuế cho hải trình",
        flavor: "Tàu đi tìm bạc vàng; làng ở lại với sưu thuế, lính bắt và ruộng bị rào.",
        causeChain: [
          "Thuế và lao dịch nuôi hải trình",
          "→ Tích lũy tư bản nguyên thủy tăng tốc",
          "→ Nông dân trả giá bằng đất và thân phận",
        ],
      },
      refuse: {
        label: "Chống thêm sưu thuế, giữ ruộng làng",
        flavor: "Giữ được một phần đời sống cũ, nhưng cũng giữ nguyên vòng khép kín của lãnh địa.",
      },
    },
    historian: {
      fund: { label: "tích lũy nguyên thủy qua thương mại và thuộc địa" },
      refuse: { label: "phong kiến tự bảo tồn trước thị trường thế giới" },
    },
  },
  "f-d3": {
    worker: {
      constitution: {
        label: "Ủng hộ hiến pháp để phá đặc quyền",
        flavor: "Đập vỡ cổng phong kiến trước đã; sau đó mới đến câu hỏi ai sở hữu xưởng và đất.",
      },
    },
    historian: {
      repress: { label: "đàn áp tình thế cách mạng tư sản" },
      constitution: { label: "thỏa hiệp hiến pháp của trật tự mới" },
    },
  },
  "c-d1": {
    worker: {
      welfare: {
        label: "Đòi việc làm công và phúc lợi khẩn cấp",
        flavor: "Người lao động buộc nhà nước cứu sức mua, dù quan hệ sở hữu vẫn chưa đổi.",
      },
    },
    historian: {
      layoff: { label: "chuyển chi phí khủng hoảng sang lao động" },
      welfare: { label: "điều tiết Keynes để trì hoãn mâu thuẫn" },
    },
  },
  "c-d2": {
    ruler: {
      "automate-share": {
        label: "Nhượng cổ phần và giờ làm để giữ hòa bình công nghiệp",
        flavor: "Chia một phần lợi ích tự động hóa để hệ thống tiếp tục vận hành.",
      },
    },
    worker: {
      "automate-share": {
        label: "Đòi máy móc giảm giờ làm, không giảm đời sống",
        flavor: "Nếu máy do tập thể vận hành, năng suất mới có thể thành thời gian tự do.",
      },
    },
    historian: {
      "automate-private": { label: "tự động hóa tư nhân hóa lợi nhuận" },
      "automate-share": { label: "xã hội hóa một phần lợi ích máy móc" },
    },
  },
  "c-d3": {
    ruler: {
      "techno-fix": {
        label: "Đặt cược vào thị trường carbon và công nghệ",
        flavor: "Giữ quyền sở hữu hiện tại, hy vọng đổi mới kỹ thuật kịp sửa khủng hoảng.",
      },
      "social-plan": {
        label: "Quốc hữu hóa ngành chiến lược để chuyển đổi xanh",
        flavor: "Kế hoạch từ trên có thể giảm hỗn loạn, nhưng sẽ bị thử thách bởi lợi ích tư bản cũ.",
      },
    },
    worker: {
      "techno-fix": {
        label: "Tin lời hứa thị trường tự sửa",
        flavor: "Ca làm nóng hơn, thuật toán gắt hơn; lời hứa lợi nhuận xanh vẫn nằm ngoài tay người lao động.",
        causeChain: [
          "Chấp nhận giải pháp thị trường",
          "→ Công nghệ phục vụ lợi nhuận trước nhu cầu",
          "→ Khủng hoảng sinh thái và giai cấp cùng tăng",
        ],
      },
      "social-plan": {
        label: "Đòi kế hoạch xanh dưới kiểm soát xã hội",
        flavor: "Chuyển đổi sinh thái chỉ có nghĩa giải phóng nếu người chịu hậu quả được tham gia quyết định.",
      },
    },
    historian: {
      "techno-fix": { label: "ảo tưởng kỹ trị trong quan hệ sở hữu cũ" },
      "social-plan": { label: "kế hoạch hóa xanh như cải biến QHSX" },
    },
  },
  "x-d1": {
    ruler: {
      ubi: {
        label: "Bảo đảm nhu cầu cơ bản, thưởng theo đóng góp",
        flavor: "Giữ động lực lao động trong giai đoạn đầu, nhưng không để ai rơi khỏi đời sống xã hội.",
      },
      equal: {
        label: "Áp chia đều máy móc từ trung tâm",
        flavor: "Bình đẳng hình thức có thể làm mờ khác biệt nhu cầu, kỹ năng và trách nhiệm thực tế.",
      },
    },
    worker: {
      ubi: {
        label: "Bảo đảm đời sống và rút ngắn ngày làm",
        flavor: "Tự động hóa chỉ có nghĩa tiến bộ nếu nó trả thời gian sống về cho người lao động.",
      },
      equal: {
        label: "Đòi chia đều tuyệt đối mọi phần",
        flavor: "Công bằng trực giác rất mạnh, nhưng nếu bỏ qua đóng góp và nhu cầu khác nhau, sản xuất chung có thể yếu đi.",
      },
    },
    historian: {
      ubi: { label: "phân phối giai đoạn đầu theo nhu cầu cơ bản và đóng góp" },
      equal: { label: "cào bằng hình thức làm nghèo động lực sản xuất" },
    },
  },
  "x-d2": {
    ruler: {
      "data-common": {
        label: "Đặt dữ liệu và AI vào hạ tầng công",
        flavor: "Điều phối dễ hơn khi tư liệu sản xuất số thuộc về xã hội và có kiểm toán.",
      },
      "data-private": {
        label: "Cho nhóm kỹ trị độc quyền mô hình AI",
        flavor: "Tập trung quyền tính toán có vẻ hiệu quả, nhưng có thể sinh đặc quyền số mới.",
      },
    },
    worker: {
      "data-common": {
        label: "Đưa dữ liệu lao động vào commons",
        flavor: "Dữ liệu do xã hội tạo ra phải quay lại phục vụ xã hội, không thành địa tô số.",
      },
      "data-private": {
        label: "Để nền tảng giữ dữ liệu của mọi người",
        flavor: "Máy học từ đời sống chung, nhưng lợi ích lại bị khóa sau quyền sở hữu riêng.",
      },
    },
    historian: {
      "data-common": { label: "AI commons như QHSX số mới" },
      "data-private": { label: "tái sinh độc quyền tư bản trong dữ liệu" },
    },
  },
  "x-d3": {
    ruler: {
      transparent: {
        label: "Mở sổ kế hoạch và kênh giám sát bắt buộc",
        flavor: "Bộ máy còn điều phối, nhưng mọi quyền lực phải để lại dấu vết cho xã hội kiểm tra.",
      },
      topdown: {
        label: "Tập trung kế hoạch trong bộ máy chuyên trách",
        flavor: "Tốc độ ra lệnh tăng, nhưng khoảng cách giữa cơ sở và người quyết định cũng tăng.",
      },
    },
    worker: {
      transparent: {
        label: "Buộc mọi kế hoạch mở cho cơ sở kiểm tra",
        flavor: "Minh bạch không phải trang trí; nó là điều kiện để người lao động còn kiểm soát cái mình sở hữu chung.",
      },
    },
    historian: {
      transparent: { label: "cơ chế kiểm soát quan liêu bằng dân chủ trực tiếp" },
      topdown: { label: "nguy cơ bộ máy chung thành lợi ích riêng" },
    },
  },
};

function applyOptionCopyOverride(
  decisionId: string,
  perspective: PerspectiveId,
  option: DecisionOption,
): DecisionOption {
  const override = OPTION_COPY_OVERRIDES[decisionId]?.[perspective]?.[option.id];
  return override ? { ...option, ...override } : option;
}

type ExtraOptionValue = DecisionOption | DecisionOption[];

export const EXTRA_OPTIONS: Record<
  string,
  Partial<Record<PerspectiveId, ExtraOptionValue>>
> = {
  "p-d1": {
    ruler: {
      id: "p-d1-r-firekeepers",
      label: "Lập nhóm canh lửa riêng cho trưởng lão",
      flavor: "Lửa vẫn sưởi ấm bộ lạc, nhưng quyền chạm vào lửa bắt đầu có chủ.",
      effect: { production: 5, stability: 8, contradiction: 7, tech: 2 },
      causeChain: [
        "Tập trung quyền giữ lửa",
        "→ Uy tín trưởng lão tăng",
        "→ Dấu vết quyền lực riêng xuất hiện trong cộng đồng",
      ],
      tag: "reactionary",
    },
  },
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
      tag: "uprising",
      progressive: true,
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
      tag: "document",
    },
  },
  "s-d1": {
    worker: {
      id: "s-d1-w-warn-villages",
      label: "Báo động các làng trước đoàn bắt nô lệ",
      flavor: "Không thắng được quân đoàn bằng tay không, nhưng có thể nối tín hiệu, giấu đường, cứu người khỏi bị biến thành tài sản.",
      effect: { revolution: 8, contradiction: 6, stability: -4, production: -3 },
      causeChain: [
        "Mạng lưới báo động giữa các làng",
        "→ Một phần lao động thoát khỏi bắt giữ",
        "→ Ý thức đoàn kết của người bị săn bắt tăng",
      ],
      progressive: true,
      tag: "uprising",
    },
  },
  "s-d2": {
    ruler: {
      id: "s-d2-r-deploy",
      label: "Điều quân đoàn — đàn áp triệt để",
      flavor: "Mượn 6 quân đoàn tinh nhuệ. Cái giá: thuế quý sau tăng gấp đôi.",
      effect: { stability: 14, revolution: -10, contradiction: 8, production: -6 },
      causeChain: ["Đàn áp quy mô", "→ Im lặng cưỡng bức", "→ Tài chính cạn"],
      tag: "repression",
    },
    worker: {
      id: "s-d2-w-join",
      label: "Bỏ chạy gia nhập Spartacus",
      flavor: "Đêm nay — hoặc không bao giờ.",
      effect: { revolution: 18, contradiction: 12, stability: -10 },
      causeChain: ["Tham gia khởi nghĩa", "→ Mở rộng phong trào", "→ Áp lực CM tăng vọt"],
      progressive: true,
      tag: "uprising",
    },
  },
  "s-d3": {
    historian: {
      id: "s-d3-h-aeolipile",
      label: "Ghi chú vì sao máy hơi nước bị bỏ quên",
      flavor: "Không thiếu phát minh; vấn đề là quan hệ nô lệ làm phát minh không có đất sống.",
      effect: { tech: 6, contradiction: 2 },
      causeChain: [
        "Đối chiếu aeolipile với lao động nô lệ",
        "→ Thấy QHSX kìm hãm LLSX",
        "→ Giải thích sự trì trệ kỹ thuật cổ đại",
      ],
      insight: "i-techstall",
      tag: "document",
    },
  },
  "f-d1": {
    ruler: {
      id: "f-d1-r-tax-charter",
      label: "Đổi đặc quyền phường hội lấy thuế cố định",
      flavor: "Triều đình mua sự yên ổn ngắn hạn bằng việc đóng khung thị trường đang lớn.",
      effect: { stability: 10, production: 2, contradiction: 9, revolution: 4 },
      causeChain: [
        "Hợp thức hoá đặc quyền",
        "→ Ngân khố ổn hơn",
        "→ Tầng lớp thị dân tự do bị chặn đường",
      ],
      tag: "reactionary",
    },
  },
  "f-d2": {
    worker: {
      id: "f-d2-w-commons",
      label: "Giữ đất công, chống sưu thuế hải trình",
      flavor: "Nông dân và thợ nghèo bảo vệ phần sống còn trước khi thị trường xa biến đất làng thành vốn khởi đầu cho kẻ khác.",
      effect: { revolution: 9, contradiction: 7, stability: -6, production: -2 },
      causeChain: [
        "Chống rào đất và sưu thuế",
        "→ Tích lũy nguyên thủy gặp kháng cự từ cơ sở",
        "→ Mâu thuẫn giữa thị trường mới và đời sống làng bộc lộ",
      ],
      progressive: true,
      tag: "uprising",
    },
  },
  "f-d3": {
    worker: {
      id: "f-d3-w-commune",
      label: "Lập hội đồng thị dân và nông dân",
      flavor: "Liên minh những người bị trị tự tổ chức thay vì chờ sắc lệnh từ trên.",
      effect: { revolution: 16, contradiction: 10, stability: -8, production: 4 },
      causeChain: [
        "Liên minh thị dân - nông dân",
        "→ Tổ chức chính trị mới",
        "→ Quyền lực phong kiến bị thách thức trực tiếp",
      ],
      insight: "i-revolution",
      progressive: true,
      tag: "uprising",
    },
    historian: {
      id: "f-d3-h-archive",
      label: "Ghi lại yêu sách xoá đặc quyền",
      flavor: "Biến lời kêu ca rời rạc thành hồ sơ về mâu thuẫn pháp quyền phong kiến.",
      effect: { tech: 5, contradiction: 1 },
      causeChain: [
        "Lưu trữ yêu sách",
        "→ Nhìn rõ mâu thuẫn pháp quyền phong kiến",
        "→ Đối chiếu với cách mạng tư sản",
      ],
      insight: "i-revolution",
      tag: "document",
    },
  },
  "c-d1": {
    ruler: {
      id: "c-d1-r-bailout",
      label: "Cứu ngân hàng, xã hội hoá khoản lỗ",
      flavor: "Giữ hệ thống tín dụng khỏi đổ vỡ, nhưng chi phí được đẩy xuống xã hội.",
      effect: { stability: 9, production: 3, contradiction: 11, revolution: 6 },
      causeChain: [
        "Cứu khu vực tài chính",
        "→ Tư bản lớn sống sót",
        "→ Bất bình đẳng và mất chính danh tăng",
      ],
      tag: "reactionary",
    },
    worker: {
      id: "c-d1-w-strike",
      label: "Tổ chức tổng đình công",
      flavor: "Đặt máy ngừng — buộc tư bản đàm phán.",
      effect: { revolution: 14, contradiction: 10, stability: -10, production: -6 },
      causeChain: ["Tổng đình công", "→ Đòn bẩy giai cấp", "→ Áp lực CM tăng"],
      progressive: true,
      tag: "uprising",
    },
    historian: {
      id: "c-d1-h-analyze",
      label: "Phân tích chu kỳ khủng hoảng",
      flavor: "So sánh 1873 · 1929 · 2008 · 2024 — mẫu lặp.",
      effect: { tech: 6, contradiction: 2 },
      causeChain: ["Phân tích chu kỳ", "→ Hiểu tính tất yếu của khủng hoảng"],
      insight: "i-overproduction",
      tag: "document",
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
      tag: "uprising",
    },
  },
  "c-d3": {
    worker: {
      id: "c-d3-w-climate-councils",
      label: "Lập hội đồng lao động - khí hậu",
      flavor: "Người chịu ca nóng, thất nghiệp và ô nhiễm tự tổ chức để buộc chuyển đổi xanh đi kèm quyền sống.",
      effect: { production: 4, tech: 6, contradiction: 6, revolution: 12, stability: -8 },
      causeChain: [
        "Liên minh lao động - khí hậu",
        "→ Khủng hoảng sinh thái được nối với quan hệ sở hữu",
        "→ Áp lực chuyển đổi từ dưới lên tăng mạnh",
      ],
      insight: "i-contradiction",
      progressive: true,
      tag: "uprising",
    },
  },
  "x-d2": {
    worker: {
      id: "x-d2-w-data-union",
      label: "Lập công đoàn dữ liệu và kiểm toán thuật toán",
      flavor: "Nếu dữ liệu là tư liệu sản xuất mới, người tạo ra nó phải có quyền xem, sửa và phủ quyết cách nó được dùng.",
      effect: { tech: 8, stability: 6, contradiction: -6, production: 3 },
      causeChain: [
        "Công đoàn dữ liệu",
        "→ Người lao động kiểm soát thuật toán ảnh hưởng đời sống",
        "→ Sở hữu xã hội có hình thức vận hành cụ thể",
      ],
      insight: "i-newrelations",
      progressive: true,
      tag: "reform",
    },
    historian: {
      id: "x-d2-h-meta",
      label: "So sánh các mô hình sở hữu AI",
      flavor: "Wikipedia · Linux · Mondragon · các cooperative platform.",
      effect: { tech: 8 },
      causeChain: ["Phân tích so sánh", "→ Khung lý thuyết QHSX số"],
      insight: "i-newrelations",
      tag: "document",
    },
  },
  "x-d3": {
    ruler: {
      id: "x-d3-r-audit",
      label: "Thiết lập kiểm toán quyền lực bắt buộc",
      flavor: "Bộ máy vẫn điều phối, nhưng mọi quyết định lớn phải có dấu vết kiểm chứng.",
      effect: { stability: 11, contradiction: -6, tech: 4 },
      causeChain: [
        "Kiểm toán quyền lực định kỳ",
        "→ Giảm đặc quyền quan liêu",
        "→ Chính danh của kế hoạch hoá tăng",
      ],
      progressive: true,
      tag: "reform",
    },
    worker: {
      id: "x-d3-w-recall",
      label: "Bầu và bãi nhiệm đại biểu theo thời gian thực",
      flavor: "Hội đồng lao động giữ quyền sửa bộ máy khi nó bắt đầu xa rời cơ sở.",
      effect: { stability: 10, contradiction: -7, tech: 3, revolution: -2 },
      causeChain: [
        "Dân chủ trực tiếp trong nơi làm việc",
        "→ Đại biểu chịu kiểm soát từ cơ sở",
        "→ Nguy cơ hình thành tầng lớp mới giảm",
      ],
      insight: "i-newrelations",
      progressive: true,
      tag: "reform",
    },
  },
};

function asArray(extra: ExtraOptionValue | undefined): DecisionOption[] {
  if (!extra) return [];
  return Array.isArray(extra) ? extra : [extra];
}

const HISTORIAN_CONFLICT_TAGS: OptionTag[] = [
  "repression",
  "uprising",
  "reactionary",
  "emergency",
];

function roleHasRuptureOption(options: DecisionOption[], perspective: PerspectiveId): boolean {
  if (perspective === "ruler") return options.some((o) => o.tag === "repression" || o.tag === "emergency");
  if (perspective === "worker") return options.some((o) => o.tag === "uprising");
  return options.some((o) => o.tag === "document");
}

function ruptureFallbackOption(decision: Decision, perspective: PerspectiveId): DecisionOption {
  if (perspective === "ruler") {
    return {
      id: `rupture:${decision.id}:ruler`,
      label: "Ban tình trạng khẩn cấp",
      flavor: "Khi mọi lối thoả hiệp đóng lại, nhà nước dùng quyền lực cưỡng chế để giữ trật tự.",
      effect: { stability: 10, contradiction: 10, revolution: -6, production: -4 },
      causeChain: [
        "Tình trạng khẩn cấp",
        "→ Trật tự được cưỡng bức tạm thời",
        "→ Chính danh dài hạn bị đốt thêm",
      ],
      tag: "emergency",
    };
  }
  if (perspective === "worker") {
    return {
      id: `rupture:${decision.id}:worker`,
      label: "Lập uỷ ban hành động",
      flavor: "Khi hệ thống vỡ, quần chúng cần tổ chức tức thì để không bị đè bẹp hoặc bị nói thay.",
      effect: { revolution: 12, contradiction: 8, stability: -8, production: -3 },
      causeChain: [
        "Uỷ ban hành động",
        "→ Tự tổ chức ngoài thiết chế cũ",
        "→ Cách mạng có hình thức chính trị cụ thể",
      ],
      progressive: true,
      tag: "uprising",
    };
  }
  return {
    id: `rupture:${decision.id}:historian`,
    label: "Ghi biên bản vỡ trận",
    flavor: "Không còn trung lập giả tạo; chỉ còn ghi đúng ai mất gì, ai giành gì, và vì sao.",
    effect: { tech: 4, contradiction: 1 },
    causeChain: [
      "Ghi lại giờ phút vỡ trận",
      "→ Bảo toàn chứng cứ về mâu thuẫn",
      "→ Để thế hệ sau đọc được quy luật phía sau biến cố",
    ],
    tag: "document",
  };
}

function historianObservationEffect(option: DecisionOption): DecisionOption["effect"] {
  const tag = option.tag ?? "neutral";
  const rawTech = Math.abs(option.effect.tech ?? 0);
  const tech = Math.max(option.insight ? 3 : 1, Math.min(4, Math.ceil(rawTech * 0.35)));
  const effect: DecisionOption["effect"] = { tech };
  if (HISTORIAN_CONFLICT_TAGS.includes(tag)) effect.contradiction = 1;
  return effect;
}

function toHistorianRecordOption(decision: Decision, option: DecisionOption): DecisionOption {
  return {
    ...option,
    id: `record:${decision.id}:${option.id}`,
    label: `Ghi chép: ${option.label}`,
    flavor: "Không can thiệp thay xã hội; chỉ ghi lại vì sao phương án này xuất hiện.",
    effect: historianObservationEffect(option),
    causeChain: [
      `Quan sát phương án: ${option.label}`,
      "→ Tách mô tả lịch sử khỏi hành động trực tiếp",
      option.insight ? "→ Mở thêm bằng chứng lý luận" : "→ Bổ sung dữ liệu so sánh",
    ],
    unlocks: undefined,
    progressive: false,
    tag: "document",
  };
}

/**
 * Resolve final options list for a (decision, perspective).
 * - Filter: hide options whose visibleTo excludes this perspective.
 * - Append: extra perspective-only options for this decision.
 */
export function resolveOptions(
  decision: Decision,
  perspective: PerspectiveId,
  tierId?: TierId,
): DecisionOption[] {
  const base = decision.options.filter((o) => {
    const gate = OPTION_GATES[o.id];
    if (gate?.visibleTo && !gate.visibleTo.includes(perspective)) return false;
    return true;
  }).map((o) => applyOptionCopyOverride(decision.id, perspective, o));
  const extra = asArray(EXTRA_OPTIONS[decision.id]?.[perspective]).map((o) =>
    applyOptionCopyOverride(decision.id, perspective, o),
  );
  const resolved =
    perspective === "historian"
      ? [...base.map((o) => toHistorianRecordOption(decision, o)), ...extra]
      : [...base, ...extra];

  if (tierId === "rupture" && !roleHasRuptureOption(resolved, perspective)) {
    return [...resolved, ruptureFallbackOption(decision, perspective)];
  }
  return resolved;
}

export function isOptionEmphasized(
  optionId: string,
  perspective: PerspectiveId,
): boolean {
  if (perspective === "historian" && optionId.startsWith("record:")) return true;
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
