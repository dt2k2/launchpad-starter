// Data-driven schema cho mini game "Hành trình Tiến hoá"
import type { EraId } from "./eras";

export type QuestionType =
  | "mcq"
  | "truefalse"
  | "match"
  | "order"
  | "scenario";

export interface BaseQuestion {
  id: string;
  stageId: EraId;
  type: QuestionType;
  prompt: string;
  explanation: string;
  points: number;
  hint?: string;
  /** Câu sai/duy trì lạc hậu sẽ cộng vào contradiction */
  contradictionOnWrong?: number;
  /** Câu đúng then chốt cộng vào "historical progress" */
  progressOnCorrect?: number;
}

export interface MCQQuestion extends BaseQuestion {
  type: "mcq" | "truefalse" | "scenario";
  options: string[];
  correctIndex: number;
}

export interface MatchQuestion extends BaseQuestion {
  type: "match";
  left: string[];
  right: string[];
  /** index của right tương ứng với mỗi left */
  correctMap: number[];
}

export interface OrderQuestion extends BaseQuestion {
  type: "order";
  items: string[];
  correctOrder: number[]; // indices vào items theo thứ tự đúng
}

export type Question = MCQQuestion | MatchQuestion | OrderQuestion;

export interface StageReward {
  badge: string;
  loreTitle: string;
  loreBody: string;
  techUnlocked: string[];
}

export interface MiniStage {
  id: EraId;
  order: number;
  title: string;
  subtitle: string;
  shortDescription: string;
  eraTag: string;
  palette: {
    bg: string; // tailwind gradient classes
    accent: string; // text color
    ring: string; // border color
    glow: string; // box-shadow color
  };
  glyph: string;
  productionForces: string[];
  relationsOfProduction: string[];
  dominantClasses: { rulers: string; workers: string };
  keyTools: string[];
  keyContradiction: string;
  transitionLabel: string; // tên cuộc cách mạng
  questions: Question[];
  rewards: StageReward;
  learningSummary: string;
  funFact: string;
  passScore: number; // điểm tối thiểu để qua ải
}

// ====================== STAGES ======================

export const STAGES: MiniStage[] = [
  {
    id: "primitive",
    order: 1,
    title: "Cộng sản nguyên thuỷ",
    subtitle: "Của chung. Săn chung. Đói chung.",
    shortDescription:
      "Công cụ thô sơ, năng suất thấp, cộng đồng buộc phải sở hữu chung để cùng sống sót.",
    eraTag: "~2.5M TCN – ~10k TCN",
    palette: {
      bg: "from-stone-900 via-amber-950/40 to-stone-950",
      accent: "text-amber-200",
      ring: "border-amber-200/30",
      glow: "shadow-[0_0_80px_-10px_oklch(0.72_0.16_55/0.4)]",
    },
    glyph: "✶",
    productionForces: ["Đá ghè, cung tên, lửa", "Săn bắt – hái lượm"],
    relationsOfProduction: ["Sở hữu công cộng", "Phân phối đều"],
    dominantClasses: { rulers: "Hội đồng trưởng lão", workers: "Mọi thành viên" },
    keyTools: ["Đá", "Cung tên", "Lửa"],
    keyContradiction:
      "Năng suất tăng dần khi nông nghiệp xuất hiện → mầm mống tư hữu.",
    transitionLabel: "Khám phá kim loại & nông nghiệp",
    passScore: 6,
    questions: [
      {
        id: "p1",
        stageId: "primitive",
        type: "mcq",
        prompt:
          "Trong xã hội cộng sản nguyên thuỷ, ai là người sở hữu tư liệu sản xuất?",
        options: [
          "Tù trưởng nắm toàn bộ",
          "Cộng đồng / thị tộc",
          "Người mạnh nhất bộ lạc",
          "Tầng lớp tăng lữ",
        ],
        correctIndex: 1,
        explanation:
          "Tư liệu sản xuất thuộc sở hữu chung — chưa có giai cấp, chưa có nhà nước.",
        points: 3,
        progressOnCorrect: 25,
        contradictionOnWrong: 10,
        hint: "Năng suất quá thấp, không ai có thể tồn tại một mình.",
      },
      {
        id: "p2",
        stageId: "primitive",
        type: "order",
        prompt: "Hãy xếp các công cụ theo trình tự xuất hiện trong lịch sử.",
        items: ["Cung tên", "Đá ghè thô", "Lửa được sử dụng", "Nông nghiệp sơ khai"],
        correctOrder: [1, 2, 0, 3],
        explanation:
          "Đá ghè → Lửa → Cung tên → Nông nghiệp. Mỗi bước nâng năng suất, đẩy xã hội tới ngưỡng có thặng dư.",
        points: 4,
        progressOnCorrect: 35,
        contradictionOnWrong: 15,
        hint: "Hỏi: cái nào đòi hỏi kỹ thuật cao hơn?",
      },
      {
        id: "p3",
        stageId: "primitive",
        type: "truefalse",
        prompt:
          "Đúng hay sai: Mâu thuẫn giai cấp là động lực phát triển của xã hội nguyên thuỷ.",
        options: ["Đúng", "Sai"],
        correctIndex: 1,
        explanation:
          "Sai. Chưa có giai cấp thì chưa có mâu thuẫn giai cấp. Động lực ở đây là cuộc đấu tranh với tự nhiên.",
        points: 3,
        progressOnCorrect: 20,
        contradictionOnWrong: 10,
      },
    ],
    rewards: {
      badge: "Người Giữ Lửa",
      loreTitle: "Tia lửa đầu tiên",
      loreBody:
        "Khi cộng đồng học cách kiểm soát lửa và nông nghiệp, sản phẩm dư thừa lần đầu xuất hiện. Hạt mầm của tư hữu đã được gieo.",
      techUnlocked: ["Đồ đá", "Lửa", "Cung tên", "Trồng trọt"],
    },
    learningSummary:
      "Sở hữu chung tồn tại vì năng suất quá thấp, không phải vì 'lý tưởng cao đẹp'.",
    funFact:
      "Người Homo sapiens dùng lửa nấu chín thức ăn — bộ não tiêu thụ ~20% năng lượng cơ thể.",
  },

  {
    id: "slave",
    order: 2,
    title: "Chiếm hữu nô lệ",
    subtitle: "Của riêng. Lao động cưỡng bức. Nhà nước sơ khai.",
    shortDescription:
      "Thặng dư cho phép một nhóm sống bằng lao động của người khác. Nô lệ trở thành 'công cụ biết nói'.",
    eraTag: "~3000 TCN – ~500",
    palette: {
      bg: "from-amber-950 via-red-950/60 to-stone-950",
      accent: "text-orange-300",
      ring: "border-orange-400/30",
      glow: "shadow-[0_0_80px_-10px_oklch(0.55_0.18_30/0.5)]",
    },
    glyph: "⛓",
    productionForces: ["Đồ đồng, đồ sắt", "Thuỷ lợi quy mô lớn"],
    relationsOfProduction: ["Sở hữu tư nhân", "Chủ nô sở hữu cả nô lệ"],
    dominantClasses: { rulers: "Chủ nô", workers: "Nô lệ" },
    keyTools: ["Đồ đồng", "Đồ sắt", "Cày sắt", "Thuỷ lợi"],
    keyContradiction:
      "Nô lệ không có động lực sản xuất → kìm hãm phát triển kỹ thuật.",
    transitionLabel: "Khởi nghĩa phá bỏ gông xiềng",
    passScore: 8,
    questions: [
      {
        id: "s1",
        stageId: "slave",
        type: "mcq",
        prompt: "Điều gì khiến chế độ chiếm hữu nô lệ trở nên khả thi?",
        options: [
          "Sự tử tế của các chủ nô",
          "Năng suất lao động đủ tạo ra sản phẩm thặng dư",
          "Phát minh ra tiền giấy",
          "Sự chia đều ruộng đất",
        ],
        correctIndex: 1,
        explanation:
          "Chỉ khi một người làm ra nhiều hơn nhu cầu của mình, người khác mới có thể sống bằng lao động của họ.",
        points: 3,
        progressOnCorrect: 25,
        contradictionOnWrong: 10,
      },
      {
        id: "s2",
        stageId: "slave",
        type: "match",
        prompt: "Ghép cặp khái niệm với mô tả đúng.",
        left: ["Chủ nô", "Nô lệ", "Tư liệu sản xuất", "Nhà nước sơ khai"],
        right: [
          "Bị coi như công cụ biết nói",
          "Sở hữu đất, công cụ và cả người lao động",
          "Bộ máy bảo vệ quyền lợi giai cấp thống trị",
          "Đất, công cụ, thuỷ lợi",
        ],
        correctMap: [1, 0, 3, 2],
        explanation:
          "Nhà nước xuất hiện không phải 'tự nhiên', mà là công cụ duy trì trật tự sở hữu của chủ nô.",
        points: 5,
        progressOnCorrect: 40,
        contradictionOnWrong: 20,
        hint: "Ai sở hữu ai? Ai bảo vệ ai?",
      },
      {
        id: "s3",
        stageId: "slave",
        type: "scenario",
        prompt:
          "Một chủ nô muốn tăng sản lượng. Lựa chọn nào sẽ KÌM HÃM phát triển kỹ thuật về lâu dài?",
        options: [
          "Đầu tư máy móc mới",
          "Bắt thêm nhiều nô lệ và đánh đập nặng hơn",
          "Cải tiến hệ thống thuỷ lợi",
          "Học hỏi kỹ thuật từ nơi khác",
        ],
        correctIndex: 1,
        explanation:
          "Lao động cưỡng bức rẻ → không có động lực cải tiến công cụ → kỹ thuật trì trệ. Đây là mâu thuẫn nội tại của chế độ nô lệ.",
        points: 4,
        progressOnCorrect: 35,
        contradictionOnWrong: 25,
      },
    ],
    rewards: {
      badge: "Người Phá Xiềng",
      loreTitle: "Spartacus thì thầm",
      loreBody:
        "Khi nô lệ không còn động lực, đất đai bạc màu và nổi loạn lan rộng. Một quan hệ sản xuất mới phải ra đời.",
      techUnlocked: ["Đồ đồng", "Đồ sắt", "Cày sắt", "Thuỷ lợi"],
    },
    learningSummary:
      "Sở hữu tư nhân + lao động cưỡng bức tạo ra thặng dư, nhưng cũng tạo ra mâu thuẫn không thể giải quyết.",
    funFact:
      "Đế chế La Mã có lúc 30–40% dân số là nô lệ. Họ dựng nên Colosseum nhưng không được ghi tên.",
  },

  {
    id: "feudal",
    order: 3,
    title: "Phong kiến",
    subtitle: "Đất là tất cả. Tô thuế là cương thường.",
    shortDescription:
      "Nông nô gắn với ruộng đất của lãnh chúa, nộp tô bằng hiện vật, lao dịch và sau là tiền.",
    eraTag: "~500 – ~1800",
    palette: {
      bg: "from-amber-900 via-yellow-900/40 to-stone-950",
      accent: "text-yellow-200",
      ring: "border-yellow-300/30",
      glow: "shadow-[0_0_80px_-10px_oklch(0.7_0.13_85/0.45)]",
    },
    glyph: "🜨",
    productionForces: ["Cày sắt, khung cửi, cối xay nước", "Nông nghiệp định canh"],
    relationsOfProduction: [
      "Lãnh chúa sở hữu đất",
      "Nông nô gắn với đất, nộp tô",
    ],
    dominantClasses: { rulers: "Lãnh chúa / Vua / Tăng lữ", workers: "Nông nô" },
    keyTools: ["Cày sắt", "Khung cửi", "Cối xay nước", "Thương nghiệp sơ khai"],
    keyContradiction:
      "Quan hệ sở hữu đất đai gò bó thương nghiệp và thị dân đang lớn lên.",
    transitionLabel: "Mầm mống thương nghiệp & cách mạng tư sản",
    passScore: 9,
    questions: [
      {
        id: "f1",
        stageId: "feudal",
        type: "mcq",
        prompt: "Nông nô khác nô lệ ở điểm cốt lõi nào?",
        options: [
          "Nông nô được trả lương",
          "Nông nô có công cụ riêng và một phần sản phẩm",
          "Nông nô được học chữ",
          "Nông nô có quyền bầu cử",
        ],
        correctIndex: 1,
        explanation:
          "Nông nô có chút động lực sản xuất nhờ giữ lại một phần sản phẩm → kỹ thuật nông nghiệp nhích lên.",
        points: 3,
        progressOnCorrect: 25,
        contradictionOnWrong: 10,
      },
      {
        id: "f2",
        stageId: "feudal",
        type: "order",
        prompt: "Xếp các hình thức tô từ cũ → mới trong xã hội phong kiến.",
        items: ["Tô tiền", "Tô lao dịch", "Tô hiện vật"],
        correctOrder: [1, 2, 0],
        explanation:
          "Lao dịch → hiện vật → tiền. Sự xuất hiện của tô tiền báo hiệu kinh tế hàng hoá đã len vào nông thôn.",
        points: 4,
        progressOnCorrect: 30,
        contradictionOnWrong: 15,
        hint: "Cái nào cần thị trường để chuyển đổi sản phẩm thành tiền?",
      },
      {
        id: "f3",
        stageId: "feudal",
        type: "scenario",
        prompt:
          "Thị dân và thương nhân đô thị giàu lên nhanh chóng. Vì sao họ xung đột với lãnh chúa?",
        options: [
          "Vì lãnh chúa cấm họ ăn mặc đẹp",
          "Vì đặc quyền phong kiến và rào cản phường hội cản trở thị trường tự do",
          "Vì họ muốn quay về nô lệ",
          "Vì họ ghét nông dân",
        ],
        correctIndex: 1,
        explanation:
          "Lực lượng sản xuất mới (công nghiệp, thương nghiệp) đụng phải quan hệ sản xuất cũ (đặc quyền lãnh chúa). Cách mạng tư sản nổ ra.",
        points: 4,
        progressOnCorrect: 40,
        contradictionOnWrong: 25,
      },
    ],
    rewards: {
      badge: "Người Mở Cửa Thành",
      loreTitle: "Tiếng chuông thị dân",
      loreBody:
        "Thành thị lớn lên, thương nghiệp bùng nổ. Tầng lớp tư sản mới gõ cửa lâu đài.",
      techUnlocked: ["Cày sắt", "Khung cửi", "Cối xay nước", "La bàn"],
    },
    learningSummary:
      "Quan hệ sở hữu đất đai phong kiến trở thành xiềng xích khi thương nghiệp và công nghiệp lớn lên.",
    funFact:
      "Hiệp ước Magna Carta (1215) không bảo vệ nông nô — nó bảo vệ quý tộc trước nhà vua.",
  },

  {
    id: "capitalist",
    order: 4,
    title: "Tư bản chủ nghĩa",
    subtitle: "Máy chạy. Lao động làm thuê. Giá trị thặng dư.",
    shortDescription:
      "Công nghiệp hoá giải phóng lực lượng sản xuất khổng lồ, đồng thời tạo ra mâu thuẫn lao động – tư bản.",
    eraTag: "~1800 – nay",
    palette: {
      bg: "from-slate-900 via-zinc-900 to-stone-950",
      accent: "text-sky-300",
      ring: "border-sky-400/30",
      glow: "shadow-[0_0_80px_-10px_oklch(0.7_0.13_230/0.5)]",
    },
    glyph: "⚙",
    productionForces: ["Máy hơi nước, điện, dây chuyền", "Công nghiệp hiện đại"],
    relationsOfProduction: [
      "Tư bản sở hữu tư liệu sản xuất",
      "Công nhân bán sức lao động",
    ],
    dominantClasses: { rulers: "Giai cấp tư sản", workers: "Giai cấp công nhân" },
    keyTools: ["Máy hơi nước", "Điện", "Dây chuyền", "Máy tính"],
    keyContradiction:
      "Sản xuất xã hội hoá ngày càng cao >< chiếm hữu tư nhân về tư liệu sản xuất.",
    transitionLabel: "Mâu thuẫn lao động – tư bản",
    passScore: 11,
    questions: [
      {
        id: "c1",
        stageId: "capitalist",
        type: "mcq",
        prompt: "Giá trị thặng dư trong CNTB chủ yếu sinh ra từ đâu?",
        options: [
          "Từ may mắn của nhà tư bản",
          "Từ phần lao động không công của công nhân",
          "Từ giá nguyên liệu rẻ",
          "Từ quảng cáo hiệu quả",
        ],
        correctIndex: 1,
        explanation:
          "Công nhân tạo ra giá trị nhiều hơn tiền lương nhận về. Phần chênh lệch ấy là giá trị thặng dư.",
        points: 4,
        progressOnCorrect: 30,
        contradictionOnWrong: 15,
      },
      {
        id: "c2",
        stageId: "capitalist",
        type: "match",
        prompt: "Ghép cặp công nghệ với tác động xã hội chính của nó.",
        left: ["Máy hơi nước", "Dây chuyền lắp ráp", "Điện", "Máy tính / Internet"],
        right: [
          "Đô thị hoá lao động, nhà máy tập trung",
          "Phân mảnh kỹ năng, tăng cường kiểm soát công nhân",
          "Ca đêm, ca kíp 24/7",
          "Toàn cầu hoá chuỗi cung ứng & lao động số",
        ],
        correctMap: [0, 1, 2, 3],
        explanation:
          "Mỗi bước nhảy công nghệ đều thay đổi cả tổ chức lao động lẫn quyền lực giữa tư bản và công nhân.",
        points: 5,
        progressOnCorrect: 40,
        contradictionOnWrong: 20,
      },
      {
        id: "c3",
        stageId: "capitalist",
        type: "scenario",
        prompt:
          "Một tập đoàn tự động hoá toàn bộ nhà máy. Sản lượng tăng gấp 5 lần nhưng sa thải 80% công nhân. Đâu là mâu thuẫn cốt lõi xuất hiện?",
        options: [
          "Robot quá đắt",
          "Sản xuất ngày càng có tính xã hội nhưng lợi nhuận vẫn chảy về tư nhân",
          "Người dân lười biếng",
          "Không còn ai mua hàng vì hết mốt",
        ],
        correctIndex: 1,
        explanation:
          "Lực lượng sản xuất đã xã hội hoá cao; nhưng quan hệ chiếm hữu vẫn tư nhân → bất bình đẳng và khủng hoảng cầu.",
        points: 5,
        progressOnCorrect: 45,
        contradictionOnWrong: 30,
        hint: "Ai làm ra, ai hưởng?",
      },
    ],
    rewards: {
      badge: "Người Đọc Vị Hệ Thống",
      loreTitle: "Khói nhà máy & cổ tức",
      loreBody:
        "Của cải tăng vọt, nhưng phân hoá cũng vậy. Câu hỏi không còn là 'làm sao có nhiều hơn' mà là 'của ai, vì ai'.",
      techUnlocked: ["Máy hơi nước", "Điện", "Dây chuyền", "Máy tính"],
    },
    learningSummary:
      "CNTB là động cơ lịch sử mạnh nhất từng có — và là động cơ tạo ra phủ định của chính nó.",
    funFact:
      "Năm 2023, 1% giàu nhất nắm gần 46% tài sản toàn cầu (Credit Suisse / UBS).",
  },

  {
    id: "socialist",
    order: 5,
    title: "Xã hội chủ nghĩa",
    subtitle: "Sản xuất xã hội hoá. Phân phối hợp lý. Con người là mục đích.",
    shortDescription:
      "Định hướng cải biến quan hệ sản xuất theo trình độ lực lượng sản xuất ở thời tự động hoá – AI.",
    eraTag: "~1917 – tương lai",
    palette: {
      bg: "from-emerald-950 via-teal-950/50 to-stone-950",
      accent: "text-emerald-200",
      ring: "border-emerald-300/30",
      glow: "shadow-[0_0_80px_-10px_oklch(0.78_0.16_160/0.5)]",
    },
    glyph: "✺",
    productionForces: ["Tự động hoá, AI, năng lượng tái tạo", "Dữ liệu lớn"],
    relationsOfProduction: [
      "Sở hữu xã hội với tư liệu sản xuất chiến lược",
      "Phân phối theo lao động & nhu cầu cơ bản",
    ],
    dominantClasses: { rulers: "—", workers: "Người lao động liên kết tự do" },
    keyTools: ["Tự động hoá", "AI", "Năng lượng tái tạo", "Mạng lưới hợp tác"],
    keyContradiction:
      "Khi máy móc làm thay con người, xã hội phải trả lời: thời gian giải phóng dùng để làm gì?",
    transitionLabel: "Tổ chức sản xuất kiểu mới",
    passScore: 10,
    questions: [
      {
        id: "x1",
        stageId: "socialist",
        type: "mcq",
        prompt:
          "Theo logic duy vật lịch sử, điều kiện vật chất để bước sang XHCN là gì?",
        options: [
          "Mong muốn của một vài lãnh tụ",
          "Lực lượng sản xuất phát triển vượt sức chứa của quan hệ sản xuất TBCN",
          "Dân số đông",
          "Tài nguyên thiên nhiên dồi dào",
        ],
        correctIndex: 1,
        explanation:
          "Không có lực lượng sản xuất đủ chín, mọi tuyên ngôn đều rỗng. Nền tảng vật chất luôn phải đi trước.",
        points: 4,
        progressOnCorrect: 30,
        contradictionOnWrong: 15,
      },
      {
        id: "x2",
        stageId: "socialist",
        type: "scenario",
        prompt:
          "Một xã hội đạt mức tự động hoá rất cao. Cách phân phối nào phù hợp nhất với tinh thần XHCN?",
        options: [
          "Ai có vốn người đó hưởng tất cả",
          "Đảm bảo nhu cầu cơ bản cho tất cả; phần còn lại theo đóng góp lao động",
          "Chia đều tuyệt đối bất kể đóng góp",
          "Giao toàn bộ cho AI quyết định",
        ],
        correctIndex: 1,
        explanation:
          "Giai đoạn đầu XHCN: 'làm theo năng lực, hưởng theo lao động', kết hợp đảm bảo nhu cầu cơ bản.",
        points: 4,
        progressOnCorrect: 35,
        contradictionOnWrong: 15,
      },
      {
        id: "x3",
        stageId: "socialist",
        type: "match",
        prompt: "Ghép yếu tố hiện đại với vai trò của nó trong tổ chức sản xuất mới.",
        left: ["AI", "Năng lượng tái tạo", "Dữ liệu công", "Hợp tác xã số"],
        right: [
          "Hạ tầng năng lượng bền vững, không phụ thuộc hoá thạch",
          "Thay thế lao động lặp lại, giải phóng thời gian",
          "Tổ chức người lao động trên nền tảng mở",
          "Tài sản chung cho lập kế hoạch & minh bạch",
        ],
        correctMap: [1, 0, 3, 2],
        explanation:
          "Không có công nghệ nào 'tự nhiên' là XHCN — cách sở hữu và sử dụng mới quyết định bản chất xã hội của nó.",
        points: 5,
        progressOnCorrect: 40,
        contradictionOnWrong: 20,
      },
    ],
    rewards: {
      badge: "Người Kiến Tạo",
      loreTitle: "Bình minh sau cách mạng",
      loreBody:
        "Khi máy móc làm phần lớn việc nặng, câu hỏi cuối cùng còn lại là: chúng ta muốn trở thành ai?",
      techUnlocked: ["Tự động hoá", "AI", "Năng lượng tái tạo", "Hợp tác xã số"],
    },
    learningSummary:
      "XHCN không phải khẩu hiệu — là câu trả lời cho mâu thuẫn giữa sản xuất xã hội hoá và sở hữu tư nhân.",
    funFact:
      "Năm 2024, hơn 30% điện ở EU đến từ năng lượng tái tạo — tiền đề vật chất đang lớn lên rất nhanh.",
  },
];

export const TOTAL_STAGES = STAGES.length;

export function rankFromPercent(pct: number): "Bronze" | "Silver" | "Gold" | "Master" {
  if (pct >= 0.95) return "Master";
  if (pct >= 0.85) return "Gold";
  if (pct >= 0.7) return "Silver";
  return "Bronze";
}
