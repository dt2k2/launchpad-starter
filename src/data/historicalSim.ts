/**
 * Historical Simulation — Data layer
 *
 * Mô phỏng tiến trình xã hội theo Duy vật lịch sử.
 * Người chơi không "trả lời quiz" — họ ra QUYẾT ĐỊNH ảnh hưởng đến 5 metric
 * của một xã hội đang vận động. Mâu thuẫn tích tụ → cách mạng → hình thái mới.
 */

import type { EraId } from "./eras";

/* =========================================================
   Society metrics — 0..100
   ========================================================= */

export type MetricKey =
  | "production" // Lực lượng sản xuất
  | "stability" // Ổn định xã hội (ngược với class conflict)
  | "tech" // Trình độ công nghệ
  | "contradiction" // Mâu thuẫn LLSX vs QHSX
  | "revolution"; // Áp lực cách mạng (tích luỹ → trigger)

export interface MetricDelta {
  production?: number;
  stability?: number;
  tech?: number;
  contradiction?: number;
  revolution?: number;
}

export const METRIC_META: Record<
  MetricKey,
  { label: string; short: string; hueClass: string; description: string }
> = {
  production: {
    label: "Lực lượng sản xuất",
    short: "Sản xuất",
    hueClass: "from-amber-400 to-orange-500",
    description: "Năng suất lao động, công cụ, kỹ thuật của xã hội.",
  },
  stability: {
    label: "Ổn định giai cấp",
    short: "Ổn định",
    hueClass: "from-emerald-400 to-teal-500",
    description: "Mức độ chấp nhận trật tự sản xuất hiện hành.",
  },
  tech: {
    label: "Công nghệ",
    short: "Công nghệ",
    hueClass: "from-sky-400 to-indigo-500",
    description: "Tri thức kỹ thuật tích luỹ — mở khoá cây công nghệ.",
  },
  contradiction: {
    label: "Mâu thuẫn",
    short: "Mâu thuẫn",
    hueClass: "from-rose-400 to-red-600",
    description: "Khoảng cách giữa lực lượng sản xuất và quan hệ sản xuất.",
  },
  revolution: {
    label: "Áp lực cách mạng",
    short: "Cách mạng",
    hueClass: "from-fuchsia-500 to-rose-500",
    description: "Khi vượt ngưỡng → cách mạng xã hội nổ ra.",
  },
};

/* =========================================================
   Class perspectives
   ========================================================= */

export type PerspectiveId =
  | "ruler" // Tầng lớp thống trị (chủ nô, lãnh chúa, tư sản…)
  | "worker" // Tầng lớp bị trị (nô lệ, nông nô, công nhân…)
  | "historian"; // Quan sát viên trung lập

export interface Perspective {
  id: PerspectiveId;
  label: string;
  tagline: string;
  description: string;
  glyph: string;
  /** Modifier nhân vào delta khi tính hệ quả */
  bias: Partial<Record<MetricKey, number>>;
}

export const PERSPECTIVES: Perspective[] = [
  {
    id: "ruler",
    label: "Giai cấp thống trị",
    tagline: "Giữ trật tự. Tích luỹ. Đè nén.",
    description:
      "Bạn nhìn lịch sử từ trên xuống. Mục tiêu: duy trì quyền sở hữu và đẩy năng suất, kể cả khi mâu thuẫn căng lên.",
    glyph: "♛",
    bias: { stability: 1.15, contradiction: 1.1, revolution: 0.95 },
  },
  {
    id: "worker",
    label: "Giai cấp lao động",
    tagline: "Tạo ra của cải. Mất nó. Đòi lại nó.",
    description:
      "Bạn nhìn lịch sử từ dưới lên. Mỗi quyết định mang sức nặng đói khổ, phản kháng và hy vọng giải phóng.",
    glyph: "✊",
    bias: { production: 1.1, contradiction: 1.2, revolution: 1.2, stability: 0.9 },
  },
  {
    id: "historian",
    label: "Nhà sử học",
    tagline: "Quan sát. Phân tích. Ghi chép.",
    description:
      "Bạn đứng ngoài, đọc các quy luật. Cân bằng mọi chỉ số, ưu tiên hiểu hơn là thắng.",
    glyph: "✎",
    bias: {},
  },
];

/* =========================================================
   Tech tree
   ========================================================= */

export interface TechNode {
  id: string;
  label: string;
  icon: string;
  era: EraId;
  description: string;
  effect: MetricDelta;
}

export const TECH_TREE: TechNode[] = [
  // primitive
  { id: "stone", label: "Đồ đá", icon: "⛏", era: "primitive", description: "Công cụ ghè đẽo — nâng năng suất săn bắt hái lượm.", effect: { production: 6, tech: 4 } },
  { id: "fire", label: "Lửa", icon: "🜂", era: "primitive", description: "Nấu chín thức ăn — bộ não phát triển, sinh tồn cải thiện.", effect: { production: 8, tech: 6, stability: 4 } },
  { id: "bow", label: "Cung tên", icon: "➳", era: "primitive", description: "Săn ở xa, hiệu quả hơn — thặng dư bắt đầu xuất hiện.", effect: { production: 10, tech: 6 } },
  { id: "farming", label: "Trồng trọt", icon: "🌾", era: "primitive", description: "Định cư, dư thừa lương thực — mầm mống tư hữu.", effect: { production: 14, tech: 8, contradiction: 8 } },
  // slave
  { id: "bronze", label: "Đồ đồng", icon: "⚒", era: "slave", description: "Vũ khí và công cụ bền — đế chế mở rộng.", effect: { production: 10, tech: 8 } },
  { id: "iron", label: "Đồ sắt", icon: "⚔", era: "slave", description: "Cày sắt + vũ khí sắt — chinh phục và canh tác quy mô lớn.", effect: { production: 14, tech: 10, contradiction: 6 } },
  { id: "irrigation", label: "Thuỷ lợi", icon: "🜄", era: "slave", description: "Quản lý nước → nhà nước sơ khai → tập trung quyền lực.", effect: { production: 12, stability: 6, contradiction: 4 } },
  { id: "writing", label: "Chữ viết", icon: "𓂀", era: "slave", description: "Luật pháp, kế toán, tôn giáo — bảo vệ quyền sở hữu.", effect: { tech: 12, stability: 8 } },
  // feudal
  { id: "plough", label: "Cày nặng", icon: "🜨", era: "feudal", description: "Khai phá đất nặng — năng suất nông nghiệp tăng vọt.", effect: { production: 12, tech: 6 } },
  { id: "watermill", label: "Cối xay nước", icon: "✺", era: "feudal", description: "Cơ giới hoá xay xát — mầm mống công nghiệp.", effect: { production: 10, tech: 10 } },
  { id: "loom", label: "Khung cửi", icon: "▤", era: "feudal", description: "Dệt may quy mô lớn → phường hội đô thị lớn lên.", effect: { production: 10, tech: 8, contradiction: 6 } },
  { id: "compass", label: "La bàn", icon: "❉", era: "feudal", description: "Phát kiến địa lý → thị trường thế giới → tư bản nguyên thuỷ.", effect: { tech: 12, contradiction: 10 } },
  // capitalist
  { id: "steam", label: "Máy hơi nước", icon: "♨", era: "capitalist", description: "Cách mạng công nghiệp — đô thị hoá hàng triệu nông dân.", effect: { production: 18, tech: 14, contradiction: 12, stability: -6 } },
  { id: "electricity", label: "Điện", icon: "⚡", era: "capitalist", description: "Ca kíp 24/7, dây chuyền — sản xuất xã hội hoá cao độ.", effect: { production: 16, tech: 14, contradiction: 10 } },
  { id: "assembly", label: "Dây chuyền", icon: "▣", era: "capitalist", description: "Phân mảnh kỹ năng, tăng kiểm soát công nhân.", effect: { production: 14, contradiction: 12, stability: -8 } },
  { id: "computer", label: "Máy tính & Internet", icon: "◰", era: "capitalist", description: "Toàn cầu hoá chuỗi cung ứng và lao động số.", effect: { production: 12, tech: 18, contradiction: 8 } },
  // socialist / future
  { id: "renewables", label: "Năng lượng tái tạo", icon: "☀", era: "socialist", description: "Hạ tầng bền vững, không phụ thuộc hoá thạch.", effect: { production: 14, tech: 12, stability: 8 } },
  { id: "automation", label: "Tự động hoá", icon: "⚙", era: "socialist", description: "Máy làm thay lao động lặp lại — câu hỏi: phân phối thế nào?", effect: { production: 20, tech: 16, contradiction: 14 } },
  { id: "ai", label: "AI hợp tác", icon: "✺", era: "socialist", description: "Trí tuệ máy hỗ trợ tổ chức sản xuất theo kế hoạch.", effect: { production: 18, tech: 20, contradiction: 8 } },
  { id: "coop_net", label: "Hợp tác xã số", icon: "◈", era: "socialist", description: "Người lao động đồng sở hữu nền tảng — hình thức QHSX mới.", effect: { production: 10, stability: 14, contradiction: -10 } },
];

/* =========================================================
   Decisions & Events
   ========================================================= */

export type OptionTag =
  | "reform"
  | "concession"
  | "repression"
  | "uprising"
  | "reactionary"
  | "emergency"
  | "document"
  | "neutral";

export interface DecisionOption {
  id: string;
  label: string;
  /** Câu mô tả ngắn về hành động */
  flavor: string;
  effect: MetricDelta;
  /** Chuỗi cause→effect hiển thị sau khi chọn */
  causeChain: string[];
  /** Unlock tech ids (optional) */
  unlocks?: string[];
  /** Insight key đi kèm (optional) */
  insight?: string;
  /** Nếu true → đây là lựa chọn "tiến bộ" theo logic lịch sử */
  progressive?: boolean;
  /** Phân loại để contradiction engine lock/unlock theo tier */
  tag?: OptionTag;
}

export interface Decision {
  id: string;
  kind: "decision" | "event"; // event = ngữ cảnh tự xảy ra
  title: string;
  prompt: string;
  /** Giọng kể theo perspective */
  voice?: Partial<Record<PerspectiveId, string>>;
  options: DecisionOption[];
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  era: EraId;
}

/* =========================================================
   Stage
   ========================================================= */

export interface SimStage {
  id: EraId;
  order: number;
  title: string;
  subtitle: string;
  era: string;
  intro: string;
  productionForces: string[];
  relationsOfProduction: string[];
  keyContradiction: string;
  transitionTitle: string;
  transitionLine: string; // câu documentary khi chuyển hình thái
  /** Điều kiện kích hoạt cách mạng */
  revolutionThreshold: number; // metric revolution >= ngưỡng
  contradictionTrigger: number; // contradiction >= ngưỡng để bắt đầu nạp revolution
  /** Visual theme */
  theme: {
    bg: string; // tailwind gradient classes
    accent: string;
    ring: string;
    glyph: string;
  };
  /** Khởi tạo metric khi vừa vào stage */
  baseMetrics: Partial<Record<MetricKey, number>>;
  decisions: Decision[];
  insights: Insight[];
  /** Tech có thể nhặt được trong stage này */
  techPool: string[];
}

/* =========================================================
   STAGES
   ========================================================= */

export const STAGES: SimStage[] = [
  {
    id: "primitive",
    order: 1,
    title: "Cộng sản nguyên thuỷ",
    subtitle: "Bộ lạc, lửa trại, đá ghè.",
    era: "~2.5M TCN – 10k TCN",
    intro:
      "Năng suất quá thấp để ai có thể tồn tại một mình. Tư liệu sản xuất thuộc về cộng đồng — không phải vì lý tưởng, mà vì khan hiếm.",
    productionForces: ["Đá, lửa, cung tên", "Săn bắt – hái lượm"],
    relationsOfProduction: ["Sở hữu công cộng", "Phân phối đều"],
    keyContradiction:
      "Khi nông nghiệp xuất hiện, thặng dư đầu tiên ra đời — mầm mống tư hữu.",
    transitionTitle: "Cuộc cách mạng nông nghiệp",
    transitionLine:
      "Hạt giống đầu tiên nảy mầm trong tay người. Cùng nó, mầm mống tư hữu cũng nảy mầm trong xã hội.",
    revolutionThreshold: 80,
    contradictionTrigger: 55,
    theme: {
      bg: "from-stone-900 via-amber-950/40 to-stone-950",
      accent: "text-amber-200",
      ring: "border-amber-200/30",
      glyph: "✶",
    },
    baseMetrics: { production: 10, stability: 70, tech: 8, contradiction: 5, revolution: 0 },
    techPool: ["stone", "fire", "bow", "farming"],
    decisions: [
      {
        id: "p-d1",
        kind: "decision",
        title: "Đêm đầu tiên có lửa",
        prompt:
          "Một thành viên bộ lạc khám phá cách giữ lửa. Bạn quyết định gì?",
        voice: {
          ruler: "Lửa là quyền lực. Ai giữ lửa, người đó là trưởng lão.",
          worker: "Lửa là sự sống. Tất cả phải có quyền sưởi ấm.",
        },
        options: [
          {
            id: "share",
            label: "Chia sẻ lửa cho cả bộ lạc",
            flavor: "Mọi người cùng nấu chín, cùng sống sót qua mùa đông.",
            effect: { production: 8, tech: 6, stability: 6 },
            causeChain: [
              "Chia sẻ lửa",
              "→ Cộng đồng cùng sống sót",
              "→ Bộ lạc lớn lên",
              "→ Năng suất hái lượm tăng",
            ],
            unlocks: ["fire"],
            progressive: true,
          },
          {
            id: "hoard",
            label: "Một nhóm độc quyền giữ lửa",
            flavor: "Chỉ trưởng lão và người mạnh được dùng — đổi lấy phục tùng.",
            effect: { production: 3, contradiction: 12, stability: -8 },
            causeChain: [
              "Độc quyền lửa",
              "→ Phân tầng quyền lực sớm",
              "→ Mâu thuẫn trong bộ lạc",
            ],
          },
        ],
      },
      {
        id: "p-d2",
        kind: "event",
        title: "Mùa săn kém — đói",
        prompt:
          "Đàn thú di cư khỏi vùng. Có người đề nghị thử gieo hạt cỏ dại bên bờ sông.",
        options: [
          {
            id: "farm",
            label: "Thử trồng trọt",
            flavor: "Định cư bên sông, đợi mùa thu hoạch đầu tiên.",
            effect: { production: 14, tech: 10, contradiction: 10 },
            causeChain: [
              "Trồng trọt",
              "→ Định cư + dư thừa",
              "→ Một số người tích trữ nhiều hơn",
              "→ Mầm mống tư hữu",
            ],
            unlocks: ["farming"],
            insight: "i-surplus",
            progressive: true,
          },
          {
            id: "migrate",
            label: "Di cư theo đàn thú",
            flavor: "Giữ lối sống du mục, không thay đổi gì.",
            effect: { production: 4, stability: 4, tech: 1 },
            causeChain: [
              "Du mục tiếp tục",
              "→ Không có thặng dư",
              "→ Không có giai cấp",
              "→ Lịch sử đứng yên",
            ],
          },
        ],
      },
      {
        id: "p-d3",
        kind: "decision",
        title: "Tù binh đầu tiên",
        prompt:
          "Bộ lạc thắng một trận. Có 5 tù binh. Trước đây, tù binh bị giết. Giờ thì sao?",
        voice: {
          ruler: "Họ có thể làm việc cho ta.",
          worker: "Hôm nay là họ, ngày mai có thể là ta.",
        },
        options: [
          {
            id: "enslave",
            label: "Bắt làm nô lệ",
            flavor: "Họ sẽ canh tác cho bộ lạc. Thặng dư tăng vọt.",
            effect: { production: 12, contradiction: 18, revolution: 8, stability: -4 },
            causeChain: [
              "Bắt nô lệ",
              "→ Lao động cưỡng bức",
              "→ Giai cấp ra đời",
              "→ Áp lực chuyển hình thái tăng nhanh",
            ],
            insight: "i-firstclass",
            progressive: true,
          },
          {
            id: "free",
            label: "Thả tự do",
            flavor: "Giữ logic bình đẳng cũ — nhưng thặng dư không tăng.",
            effect: { stability: 6, production: -2, contradiction: -4 },
            causeChain: ["Thả tù binh", "→ Cộng đồng giữ tính nguyên thuỷ"],
          },
        ],
      },
    ],
    insights: [
      {
        id: "i-surplus",
        era: "primitive",
        title: "Thặng dư — bước ngoặt đầu tiên",
        body: "Khi một người làm ra nhiều hơn nhu cầu, người khác có thể sống bằng lao động của họ. Đó là điều kiện vật chất của mọi xã hội có giai cấp.",
      },
      {
        id: "i-firstclass",
        era: "primitive",
        title: "Giai cấp xuất hiện từ đâu?",
        body: "Không phải từ ác ý, mà từ điều kiện vật chất: thặng dư + chiến tranh + công cụ kim loại làm tù binh trở thành 'có giá trị kinh tế' để giữ lại.",
      },
    ],
  },

  {
    id: "slave",
    order: 2,
    title: "Chiếm hữu nô lệ",
    subtitle: "Của riêng. Đế chế. Đấu trường.",
    era: "~3000 TCN – ~500",
    intro:
      "Chủ nô sở hữu cả tư liệu sản xuất và bản thân người lao động. Đô thị, luật pháp, chữ viết — tất cả dựng trên lưng nô lệ.",
    productionForces: ["Đồ đồng → đồ sắt", "Thuỷ lợi quy mô lớn"],
    relationsOfProduction: ["Chủ nô sở hữu nô lệ", "Nhà nước bảo vệ trật tự"],
    keyContradiction:
      "Nô lệ không có động lực sản xuất → kỹ thuật trì trệ → đế chế sụp đổ.",
    transitionTitle: "Đế chế đổ — phong kiến lên",
    transitionLine:
      "Lưỡi cày han gỉ trong tay nô lệ kiệt sức. Lãnh chúa nhặt nó lên — và buộc nông nô vào ruộng đất.",
    revolutionThreshold: 85,
    contradictionTrigger: 60,
    theme: {
      bg: "from-amber-950 via-red-950/60 to-stone-950",
      accent: "text-orange-300",
      ring: "border-orange-400/30",
      glyph: "⛓",
    },
    baseMetrics: { production: 28, stability: 50, tech: 22, contradiction: 25, revolution: 5 },
    techPool: ["bronze", "iron", "irrigation", "writing"],
    decisions: [
      {
        id: "s-d1",
        kind: "decision",
        title: "Mở rộng đế chế",
        prompt: "Hội đồng đề nghị xâm lược láng giềng để bắt thêm nô lệ.",
        voice: {
          ruler: "Không có nô lệ mới, các mỏ và đồng ruộng sẽ ngưng hoạt động.",
          worker: "Chiến tranh nuôi chiến tranh — và xương nuôi đá.",
        },
        options: [
          {
            id: "war",
            label: "Phát động chiến tranh",
            flavor: "Hàng nghìn tù binh mới — đế chế phình to.",
            effect: { production: 16, contradiction: 14, revolution: 10, stability: -6 },
            causeChain: [
              "Chiến tranh xâm lược",
              "→ Thêm nô lệ",
              "→ Đế chế phình to",
              "→ Chi phí quân sự và bất mãn tăng",
            ],
            unlocks: ["iron"],
            progressive: true,
          },
          {
            id: "reform",
            label: "Cải cách: cho nô lệ giữ một phần sản phẩm",
            flavor: "Mô hình 'colonus' — tiền thân nông nô.",
            effect: { production: 8, stability: 10, contradiction: -6, tech: 6 },
            causeChain: [
              "Cải cách phân phối",
              "→ Nô lệ có chút động lực",
              "→ Kỹ thuật nhích lên",
              "→ Tiến gần hơn tới quan hệ phong kiến",
            ],
            insight: "i-colonus",
            progressive: true,
          },
        ],
      },
      {
        id: "s-d2",
        kind: "event",
        title: "Spartacus thì thầm",
        prompt:
          "Một thủ lĩnh nô lệ tổ chức khởi nghĩa. Quân đoàn của ngươi đang ở xa.",
        options: [
          {
            id: "crush",
            label: "Đàn áp tàn bạo",
            flavor: "Đóng đinh dọc đường Appian — gửi thông điệp.",
            effect: { stability: 8, contradiction: 18, revolution: 15 },
            causeChain: [
              "Đàn áp",
              "→ Sợ hãi ngắn hạn",
              "→ Căm thù tích tụ",
              "→ Áp lực cách mạng âm ỉ",
            ],
          },
          {
            id: "concede",
            label: "Thoả hiệp: giải phóng một phần",
            flavor: "Một số được tự do; số còn lại thành tá điền.",
            effect: { stability: 12, contradiction: -8, production: 4 },
            causeChain: [
              "Nhượng bộ một phần",
              "→ Tá điền xuất hiện",
              "→ Mầm phong kiến lớn lên trong lòng đế chế",
            ],
            insight: "i-colonus",
            progressive: true,
          },
        ],
      },
      {
        id: "s-d3",
        kind: "decision",
        title: "Một kỹ sư trẻ trình bày máy hơi nước thô sơ",
        prompt:
          "Hero of Alexandria mang đến aeolipile — quả cầu xoay nhờ hơi nước. 'Có thể thay sức người', anh nói.",
        voice: {
          ruler: "Nếu máy thay nô lệ, ai mua nô lệ của ta?",
        },
        options: [
          {
            id: "ignore",
            label: "Coi như đồ chơi",
            flavor: "Nô lệ rẻ hơn máy. Không ai đầu tư.",
            effect: { tech: 0, contradiction: 10, revolution: 6 },
            causeChain: [
              "Bác bỏ kỹ thuật mới",
              "→ Lao động cưỡng bức rẻ chặn đổi mới",
              "→ Đế chế tụt hậu kỹ thuật",
              "→ Sụp đổ từ bên trong",
            ],
            insight: "i-techstall",
          },
          {
            id: "invest",
            label: "Đầu tư phát triển",
            flavor: "Đi ngược logic kinh tế nô lệ — nhưng mở ra tương lai.",
            effect: { tech: 14, production: 6, contradiction: 8 },
            causeChain: [
              "Đầu tư máy móc",
              "→ Mâu thuẫn với chế độ nô lệ tăng nhanh",
              "→ Yêu cầu lao động có kỹ năng",
            ],
            unlocks: ["writing"],
            progressive: true,
          },
        ],
      },
    ],
    insights: [
      {
        id: "i-colonus",
        era: "slave",
        title: "Vì sao chế độ nô lệ tự huỷ?",
        body: "Khi không thể bắt thêm nô lệ, chủ nô phải cho họ giữ một phần sản phẩm để có động lực. Đó chính là tiền thân của nông nô — quan hệ phong kiến nảy sinh trong lòng chế độ nô lệ.",
      },
      {
        id: "i-techstall",
        era: "slave",
        title: "Lao động rẻ giết chết đổi mới",
        body: "Khi sức người rẻ hơn máy móc, không ai đầu tư công nghệ. Đây là lý do nhiều phát minh thời cổ đại bị bỏ quên — và lý do một QHSX có thể kìm hãm LLSX.",
      },
    ],
  },

  {
    id: "feudal",
    order: 3,
    title: "Phong kiến",
    subtitle: "Đất là tất cả. Tô thuế là cương thường.",
    era: "~500 – ~1800",
    intro:
      "Nông nô gắn với ruộng đất của lãnh chúa, nộp tô lao dịch / hiện vật / tiền. Thị dân và thương nhân âm thầm lớn lên trong các đô thị.",
    productionForces: ["Cày sắt, cối xay nước, khung cửi", "Nông nghiệp định canh"],
    relationsOfProduction: ["Lãnh chúa sở hữu đất", "Nông nô nộp tô"],
    keyContradiction:
      "Đặc quyền phong kiến và rào cản phường hội cản trở thị trường tự do đang lớn lên.",
    transitionTitle: "Cách mạng tư sản",
    transitionLine:
      "Tiếng chuông thị dân vang lên trên các lâu đài đá. Một giai cấp mới đòi thị trường, đòi tự do — và lật đổ trật tự cũ.",
    revolutionThreshold: 80,
    contradictionTrigger: 60,
    theme: {
      bg: "from-amber-900 via-yellow-900/40 to-stone-950",
      accent: "text-yellow-200",
      ring: "border-yellow-300/30",
      glyph: "🜨",
    },
    baseMetrics: { production: 42, stability: 55, tech: 38, contradiction: 22, revolution: 5 },
    techPool: ["plough", "watermill", "loom", "compass"],
    decisions: [
      {
        id: "f-d1",
        kind: "decision",
        title: "Phường hội đòi độc quyền nghề",
        prompt: "Các phường hội thợ thủ công yêu cầu nhà vua cấm xưởng tự do ngoài thành.",
        options: [
          {
            id: "grant",
            label: "Ban đặc quyền cho phường hội",
            flavor: "Giữ trật tự cũ — thương nhân tự do bị bóp nghẹt.",
            effect: { stability: 8, production: -4, contradiction: 12 },
            causeChain: [
              "Đặc quyền phường hội",
              "→ Rào cản đổi mới",
              "→ Thương nhân nổi giận",
              "→ Mâu thuẫn với QHSX cũ",
            ],
          },
          {
            id: "open-market",
            label: "Mở thị trường tự do",
            flavor: "Công trường thủ công bùng nổ — tiền tư bản nguyên thuỷ.",
            effect: { production: 12, tech: 10, contradiction: 10, revolution: 6 },
            causeChain: [
              "Tự do thị trường",
              "→ Tích luỹ tư bản nguyên thuỷ",
              "→ Giai cấp tư sản lớn nhanh",
            ],
            unlocks: ["loom"],
            progressive: true,
          },
        ],
      },
      {
        id: "f-d2",
        kind: "event",
        title: "Phát kiến địa lý",
        prompt:
          "Các thương nhân yêu cầu tài trợ chuyến đi tìm đường biển sang phương Đông.",
        options: [
          {
            id: "fund",
            label: "Tài trợ thám hiểm",
            flavor: "Mở thuộc địa, dòng vàng bạc đổ về.",
            effect: { production: 14, tech: 14, contradiction: 14, revolution: 10 },
            causeChain: [
              "Phát kiến địa lý",
              "→ Thị trường thế giới",
              "→ Tư bản nguyên thuỷ",
              "→ Phong kiến không còn vừa với nền kinh tế mới",
            ],
            unlocks: ["compass"],
            insight: "i-primaccum",
            progressive: true,
          },
          {
            id: "refuse",
            label: "Từ chối — giữ trật tự đất đai",
            flavor: "Đóng cửa với thế giới.",
            effect: { stability: 6, production: -4, contradiction: -2 },
            causeChain: ["Đóng cửa", "→ Lịch sử trượt qua bạn"],
          },
        ],
      },
      {
        id: "f-d3",
        kind: "decision",
        title: "Cách mạng đang gõ cửa",
        prompt:
          "Thị dân, nông dân và một số quý tộc tiến bộ liên minh đòi xoá đặc quyền phong kiến.",
        options: [
          {
            id: "repress",
            label: "Đàn áp bằng quân đội",
            flavor: "Giam giữ lãnh đạo phong trào.",
            effect: { stability: 6, contradiction: 18, revolution: 20 },
            causeChain: [
              "Đàn áp",
              "→ Hợp pháp hoá phản kháng",
              "→ Cách mạng tư sản chín muồi",
            ],
          },
          {
            id: "constitution",
            label: "Ban hành hiến pháp tư sản",
            flavor: "Quý tộc nhường một phần quyền lực — thị trường thắng.",
            effect: { stability: 14, contradiction: -6, production: 10, revolution: -4 },
            causeChain: [
              "Cải cách hiến pháp",
              "→ Quá độ êm sang CNTB",
              "→ Tư bản tự do phát triển",
            ],
            insight: "i-revolution",
            progressive: true,
          },
        ],
      },
    ],
    insights: [
      {
        id: "i-primaccum",
        era: "feudal",
        title: "Tích luỹ tư bản nguyên thuỷ",
        body: "Thương mại thuộc địa, cướp bóc và tước đoạt đất công tạo ra khối tư bản ban đầu — điều kiện vật chất cho cách mạng công nghiệp.",
      },
      {
        id: "i-revolution",
        era: "feudal",
        title: "Cách mạng xã hội là gì?",
        body: "Là bước nhảy khi QHSX cũ không còn vừa với LLSX mới. Có thể bạo lực, có thể cải cách — nhưng luôn là thay đổi quan hệ sở hữu.",
      },
    ],
  },

  {
    id: "capitalist",
    order: 4,
    title: "Tư bản chủ nghĩa",
    subtitle: "Máy chạy. Lao động làm thuê. Giá trị thặng dư.",
    era: "~1800 – nay",
    intro:
      "Tư bản sở hữu máy móc; công nhân bán sức lao động. Sản xuất xã hội hoá tột độ — nhưng lợi nhuận vẫn chảy về tư nhân.",
    productionForces: ["Máy hơi nước → điện → dây chuyền → AI", "Khoa học là LLSX trực tiếp"],
    relationsOfProduction: ["Tư bản sở hữu TLSX", "Công nhân bán sức lao động"],
    keyContradiction:
      "Sản xuất xã hội hoá >< chiếm hữu tư nhân về tư liệu sản xuất.",
    transitionTitle: "Tự động hoá đặt câu hỏi",
    transitionLine:
      "Khi máy làm phần lớn việc, câu hỏi không còn là 'sản xuất thế nào' mà là 'của ai, vì ai'.",
    revolutionThreshold: 90,
    contradictionTrigger: 65,
    theme: {
      bg: "from-slate-900 via-zinc-900 to-stone-950",
      accent: "text-sky-300",
      ring: "border-sky-400/30",
      glyph: "⚙",
    },
    baseMetrics: { production: 60, stability: 50, tech: 60, contradiction: 30, revolution: 8 },
    techPool: ["steam", "electricity", "assembly", "computer"],
    decisions: [
      {
        id: "c-d1",
        kind: "event",
        title: "Khủng hoảng thừa",
        prompt:
          "Hàng tồn kho đầy kho. Hàng triệu người không đủ tiền mua — nhưng máy vẫn chạy.",
        voice: {
          ruler: "Cắt giảm sản xuất, sa thải để giữ giá.",
          worker: "Của cải ngập đầu — sao chúng tôi vẫn đói?",
        },
        options: [
          {
            id: "layoff",
            label: "Sa thải hàng loạt",
            flavor: "Đẩy chi phí sang xã hội.",
            effect: { stability: -14, contradiction: 16, revolution: 14, production: -6 },
            causeChain: [
              "Sa thải",
              "→ Sức mua giảm thêm",
              "→ Khủng hoảng sâu hơn",
              "→ Bất mãn xã hội bùng phát",
            ],
            insight: "i-overproduction",
          },
          {
            id: "welfare",
            label: "Mở rộng phúc lợi & việc làm công",
            flavor: "Nhà nước can thiệp kiểu Keynes.",
            effect: { stability: 12, contradiction: -4, production: 6 },
            causeChain: [
              "Phúc lợi mở rộng",
              "→ Tái phân phối một phần",
              "→ Hạ nhiệt mâu thuẫn — nhưng không xoá được",
            ],
            progressive: true,
          },
        ],
      },
      {
        id: "c-d2",
        kind: "decision",
        title: "Tự động hoá nhà máy",
        prompt:
          "Tập đoàn của bạn có thể tự động hoá 80% nhà máy. Sản lượng x5, lao động /5.",
        options: [
          {
            id: "automate-private",
            label: "Tự động hoá, sa thải, giữ lợi nhuận",
            flavor: "Cổ phiếu tăng vọt. Hàng triệu mất việc.",
            effect: { production: 18, tech: 16, contradiction: 22, revolution: 16, stability: -16 },
            causeChain: [
              "Tự động hoá tư nhân hoá lợi nhuận",
              "→ Bất bình đẳng cực đại",
              "→ LLSX xã hội hoá >< QHSX tư nhân tăng vọt",
            ],
            unlocks: ["assembly", "computer"],
            insight: "i-overproduction",
          },
          {
            id: "automate-share",
            label: "Tự động hoá + chia sẻ lợi nhuận với người lao động",
            flavor: "Cổ phần cho công nhân, giảm giờ làm.",
            effect: { production: 14, tech: 14, contradiction: 4, stability: 12 },
            causeChain: [
              "Sở hữu xã hội hoá một phần",
              "→ Giảm bất bình đẳng",
              "→ Mở đường cho QHSX mới",
            ],
            progressive: true,
          },
        ],
      },
      {
        id: "c-d3",
        kind: "decision",
        title: "Khủng hoảng khí hậu + AI",
        prompt:
          "AI tổng quát + biến đổi khí hậu cùng lúc đặt CNTB trước câu hỏi sống còn.",
        options: [
          {
            id: "techno-fix",
            label: "Tin vào thị trường + công nghệ",
            flavor: "Để thị trường tự điều chỉnh.",
            effect: { tech: 12, contradiction: 14, revolution: 12, stability: -8 },
            causeChain: [
              "Phụ thuộc thị trường",
              "→ Bất bình đẳng + khủng hoảng sinh thái leo thang",
              "→ Mâu thuẫn tới ngưỡng",
            ],
          },
          {
            id: "social-plan",
            label: "Kế hoạch hoá sản xuất xanh + sở hữu chung",
            flavor: "Chuyển dần TLSX chiến lược sang sở hữu xã hội.",
            effect: { production: 8, tech: 10, stability: 14, contradiction: -10, revolution: -6 },
            causeChain: [
              "Cải biến QHSX có kế hoạch",
              "→ LLSX hiện đại + QHSX mới khớp nhau",
              "→ Chuyển hình thái êm dịu",
            ],
            unlocks: ["automation", "ai"],
            insight: "i-contradiction",
            progressive: true,
          },
        ],
      },
    ],
    insights: [
      {
        id: "i-overproduction",
        era: "capitalist",
        title: "Khủng hoảng thừa — nghịch lý CNTB",
        body: "Của cải dư thừa cùng lúc với đói nghèo. Vì sản phẩm thuộc về tư bản, không phải về nhu cầu xã hội.",
      },
      {
        id: "i-contradiction",
        era: "capitalist",
        title: "Mâu thuẫn cơ bản của CNTB",
        body: "Sản xuất ngày càng có tính xã hội hoá; nhưng chiếm hữu vẫn tư nhân. Mâu thuẫn này là động lực — và là giới hạn — của hình thái tư bản.",
      },
    ],
  },

  {
    id: "socialist",
    order: 5,
    title: "Xã hội chủ nghĩa",
    subtitle: "Sản xuất xã hội hoá. Phân phối hợp lý. Con người là mục đích.",
    era: "~1917 – tương lai",
    intro:
      "Câu hỏi không còn là 'sản xuất ra sao' mà là 'tổ chức sở hữu thế nào' cho thời tự động hoá – AI.",
    productionForces: ["Tự động hoá, AI, năng lượng tái tạo", "Dữ liệu là TLSX mới"],
    relationsOfProduction: ["Sở hữu xã hội về TLSX chiến lược", "Hợp tác xuyên biên giới"],
    keyContradiction:
      "Giữ động lực sáng tạo + tránh tha hoá bộ máy + cân bằng kế hoạch & thị trường.",
    transitionTitle: "Bình minh sau cách mạng",
    transitionLine:
      "Lực lượng sản xuất đã vượt khỏi quan hệ sản xuất cũ. Một hình thái mới đang được tổ chức.",
    revolutionThreshold: 100, // không trigger revolution thêm — đây là ending stage
    contradictionTrigger: 100,
    theme: {
      bg: "from-emerald-950 via-teal-950/50 to-stone-950",
      accent: "text-emerald-200",
      ring: "border-emerald-300/30",
      glyph: "✺",
    },
    baseMetrics: { production: 75, stability: 60, tech: 80, contradiction: 20, revolution: 0 },
    techPool: ["renewables", "automation", "ai", "coop_net"],
    decisions: [
      {
        id: "x-d1",
        kind: "decision",
        title: "Phân phối thời tự động hoá",
        prompt: "Máy làm 70% công việc. Người dân cần phân phối thế nào?",
        options: [
          {
            id: "ubi",
            label: "Đảm bảo nhu cầu cơ bản + thưởng theo đóng góp",
            flavor: "Giai đoạn đầu XHCN: 'làm theo năng lực, hưởng theo lao động'.",
            effect: { stability: 16, contradiction: -10, production: 8 },
            causeChain: [
              "Phân phối hỗn hợp",
              "→ Giảm bất an",
              "→ Giải phóng sáng tạo",
            ],
            unlocks: ["automation"],
            insight: "i-distribution",
            progressive: true,
          },
          {
            id: "equal",
            label: "Chia đều tuyệt đối",
            flavor: "Bỏ qua đóng góp khác nhau.",
            effect: { stability: -6, contradiction: 8, production: -4 },
            causeChain: ["Cào bằng", "→ Mất động lực", "→ Khủng hoảng năng suất"],
          },
        ],
      },
      {
        id: "x-d2",
        kind: "decision",
        title: "Quyền sở hữu dữ liệu & AI",
        prompt: "AI khổng lồ huấn luyện trên dữ liệu của tất cả mọi người.",
        options: [
          {
            id: "data-common",
            label: "Dữ liệu là tài sản chung, AI mở",
            flavor: "Hợp tác xã số quản lý mô hình lớn.",
            effect: { tech: 16, stability: 12, contradiction: -8, production: 10 },
            causeChain: [
              "Sở hữu xã hội về AI",
              "→ Lợi ích phân phối rộng",
              "→ QHSX kiểu mới hình thành",
            ],
            unlocks: ["ai", "coop_net"],
            insight: "i-newrelations",
            progressive: true,
          },
          {
            id: "data-private",
            label: "Vài tập đoàn độc quyền AI",
            flavor: "Tư nhân hoá lực lượng sản xuất mới nhất.",
            effect: { tech: 8, contradiction: 18, stability: -10 },
            causeChain: [
              "Độc quyền AI",
              "→ Tái lập mâu thuẫn cũ ở quy mô mới",
              "→ Lịch sử lặp lại",
            ],
          },
        ],
      },
      {
        id: "x-d3",
        kind: "decision",
        title: "Quản trị quyền lực",
        prompt: "Làm sao tránh bộ máy quan liêu tự tha hoá thành 'giai cấp mới'?",
        options: [
          {
            id: "transparent",
            label: "Dữ liệu công + minh bạch + dân chủ trực tiếp",
            flavor: "Mạng lưới giám sát ngược, hợp tác xã số bỏ phiếu.",
            effect: { stability: 18, contradiction: -12, tech: 10 },
            causeChain: [
              "Minh bạch + dân chủ số",
              "→ Bộ máy bị kiểm soát thường xuyên",
              "→ XHCN không tha hoá",
            ],
            unlocks: ["coop_net"],
            insight: "i-newrelations",
            progressive: true,
          },
          {
            id: "topdown",
            label: "Kế hoạch tập trung, ít minh bạch",
            flavor: "Tin vào bộ máy.",
            effect: { stability: -4, contradiction: 10 },
            causeChain: ["Tập trung quyền lực", "→ Nguy cơ tha hoá", "→ Mất chính danh"],
          },
        ],
      },
    ],
    insights: [
      {
        id: "i-distribution",
        era: "socialist",
        title: "Phân phối ở giai đoạn đầu XHCN",
        body: "'Làm theo năng lực, hưởng theo lao động' — chưa phải cộng sản, nhưng đã xoá được sở hữu tư nhân về TLSX chiến lược.",
      },
      {
        id: "i-newrelations",
        era: "socialist",
        title: "QHSX kiểu mới của thời AI",
        body: "Hợp tác xã số, dữ liệu công, AI sở hữu chung — những hình thức QHSX đang được thử nghiệm để khớp với LLSX hiện đại.",
      },
    ],
  },
];

const STANDARD_OPTION_TAGS: Record<string, OptionTag> = {
  "p-d1:share": "reform",
  "p-d1:hoard": "reactionary",
  "p-d2:farm": "emergency",
  "p-d2:migrate": "neutral",
  "p-d3:enslave": "repression",
  "p-d3:free": "concession",

  "s-d1:war": "repression",
  "s-d1:reform": "reform",
  "s-d2:crush": "repression",
  "s-d2:concede": "concession",
  "s-d3:ignore": "reactionary",
  "s-d3:invest": "emergency",

  "f-d1:grant": "reactionary",
  "f-d1:free": "reform",
  "f-d2:fund": "emergency",
  "f-d2:refuse": "reactionary",
  "f-d3:repress": "repression",
  "f-d3:constitution": "reform",

  "c-d1:layoff": "repression",
  "c-d1:welfare": "concession",
  "c-d2:automate-private": "reactionary",
  "c-d2:automate-share": "reform",
  "c-d3:techno-fix": "reactionary",
  "c-d3:social-plan": "reform",

  "x-d1:ubi": "reform",
  "x-d1:equal": "reactionary",
  "x-d2:data-common": "reform",
  "x-d2:data-private": "reactionary",
  "x-d3:transparent": "reform",
  "x-d3:topdown": "reactionary",
};

for (const stage of STAGES) {
  for (const decision of stage.decisions) {
    for (const option of decision.options) {
      option.tag ??= STANDARD_OPTION_TAGS[`${decision.id}:${option.id}`] ?? "neutral";
    }
  }
}

/* =========================================================
   Endings
   ========================================================= */

export interface Ending {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  reflection: string;
  vibe: "linear" | "rupture" | "future" | "stagnation";
}

export const ENDINGS: Record<Ending["vibe"], Ending> = {
  linear: {
    id: "linear",
    vibe: "linear",
    title: "Lịch sử tuyến tính",
    subtitle: "Bạn đã đi qua đủ 5 hình thái — không vội, không sụp đổ.",
    body: "Mỗi cuộc cách mạng được giải quyết bằng cải cách trước khi mâu thuẫn bùng nổ. Xã hội tiến lên từng nấc, đúng theo logic Mác đã mô tả.",
    reflection:
      "Lịch sử không hứa ai cũng đi qua êm dịu thế này. Nhưng nó cho thấy: khi LLSX và QHSX khớp nhau, xã hội ổn định.",
  },
  rupture: {
    id: "rupture",
    vibe: "rupture",
    title: "Cách mạng bùng nổ sớm",
    subtitle: "Mâu thuẫn đã không được giải quyết — cách mạng đến bằng đứt gãy.",
    body: "Bạn đã chọn đè nén, độc quyền, đàn áp. Mâu thuẫn tích tụ vượt ngưỡng và giai cấp bị trị buộc phải làm lại trật tự bằng bạo lực.",
    reflection:
      "Cách mạng không phải là tai nạn — nó là cách lịch sử trả lời khi cải cách bị từ chối quá lâu.",
  },
  future: {
    id: "future",
    vibe: "future",
    title: "Bình minh tự động hoá",
    subtitle: "Bạn đẩy LLSX tới mức máy có thể làm phần lớn việc.",
    body: "Bây giờ câu hỏi không còn là 'sản xuất ra sao' mà là 'của ai, vì ai'. Hợp tác xã số, AI mở, dữ liệu công — QHSX mới đang được tổ chức.",
    reflection:
      "Tương lai không có sẵn. Nó được kiến tạo từ những quyết định về quyền sở hữu mà chúng ta đưa ra hôm nay.",
  },
  stagnation: {
    id: "stagnation",
    vibe: "stagnation",
    title: "Lịch sử đứng yên",
    subtitle: "Bạn từ chối thay đổi quan hệ sản xuất.",
    body: "Trồng trọt bị bác. Tự động hoá bị độc quyền. Mỗi lần lịch sử gõ cửa, bạn đóng nó lại. Xã hội tồn tại — nhưng không tiến.",
    reflection:
      "Duy vật lịch sử không nói lịch sử PHẢI tiến. Nó nói: nếu LLSX không vượt QHSX, không có hình thái mới.",
  },
};

/* =========================================================
   Ending classifier
   ========================================================= */

export interface FinalMetrics {
  production: number;
  stability: number;
  tech: number;
  contradiction: number;
  revolution: number;
  /** số stage hoàn thành (5 = đủ) */
  stagesCompleted: number;
  /** số cách mạng nổ ra do contradiction (>= 1 ⇒ rupture path) */
  revolutionsBurned: number;
  /** Số lựa chọn "progressive" */
  progressiveCount: number;
}

export function classifyEnding(m: FinalMetrics): Ending {
  if (m.stagesCompleted < 5 && m.revolutionsBurned === 0 && m.progressiveCount <= 2) {
    return ENDINGS.stagnation;
  }
  if (m.revolutionsBurned >= 2) return ENDINGS.rupture;
  if (m.tech >= 80 && m.production >= 75) return ENDINGS.future;
  return ENDINGS.linear;
}
