/**
 * Centralized cinematic config — keyed by era.
 * Audio params, narrator quotes, revolution choreography, ending tone.
 */
import type { EraId } from "@/data/eras";
import type { PerspectiveId } from "@/data/historicalSim";

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

export type NarratorMoment = "enter" | "tension" | "revolution";
type NarratorLineSet = Record<NarratorMoment, NarratorLine>;

export const NARRATOR_LINES: Record<
  EraId,
  NarratorLineSet
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

export const ROLE_NARRATOR_LINES: Record<EraId, Record<PerspectiveId, NarratorLineSet>> = {
  primitive: {
    ruler: {
      enter: { text: "Bộ lạc còn sống nhờ chia phần, nhưng người giữ kho và giữ lửa bắt đầu được nghe nhiều hơn." },
      tension: { text: "Thặng dư đầu tiên không chỉ cứu đói. Nó đặt câu hỏi: Ai, được quyền giữ phần dư?" },
      revolution: { text: "Quyền lực sinh ra không phải từ ý muốn, mà từ vật có thể tích trữ và người có thể sai khiến." },
    },
    worker: {
      enter: { text: "Ta săn cùng nhau, ăn cùng nhau, sống nhờ nhau. Không một ai tự sống nổi ngoài cộng đồng." },
      tension: { text: "Khi hạt giống cho mùa sau nằm trong một kho riêng, cái đói bắt đầu có chủ." },
      revolution: { text: "Ngày đất và tù binh bị tính thành của cải, cộng đồng cũ không còn nguyên vẹn nữa." },
    },
    historian: {
      enter: { text: "Chưa có giai cấp. Chưa có nhà nước. Nhưng năng suất thấp buộc sở hữu chung phải tồn tại." },
      tension: { text: "Nông nghiệp tạo thặng dư; thặng dư tạo khả năng tư hữu; và tư hữu mở cửa cho phân tầng." },
      revolution: { text: "Cuộc cách mạng nông nghiệp chính là nền vật chất làm xã hội có giai cấp trở nên khả thi." },
    },
  },
  slave: {
    ruler: {
      enter: { text: "Đế chế cần ruộng, cần mỏ và thân xác người lao động. Luật pháp được viết ra là để bảo vệ quyền sở hữu ấy." },
      tension: { text: "Khi nô lệ chỉ làm vì roi vọt, sản xuất phải mua thêm bạo lực để tự tiếp tục." },
      revolution: { text: "Một trật tự sống bằng cưỡng bức sẽ sụp khi cái giá của cưỡng bức đắt hơn sản phẩm nó lấy được." },
    },
    worker: {
      enter: { text: "Ta không được gọi là người, nhưng chính tay ta cày ruộng, xây thành và rèn nên vũ khí." },
      tension: { text: "Mỗi đòn roi giữ yên một ngày, rồi để lại trong đêm một lời thề bỏ trốn." },
      revolution: { text: "Xiềng xích bị bẻ không chỉ để bỏ chạy. Nó bị bẻ để nói rằng công cụ biết nói nay đã thành người." },
    },
    historian: {
      enter: { text: "Chế độ nô lệ biến con người thành tư liệu sản xuất và nó cần nhà nước để bảo vệ quan hệ tàn bạo đó." },
      tension: { text: "Lao động cưỡng bức kìm hãm kỹ thuật: khi mạng người còn rẻ hơn máy, mọi phát minh đều bị bỏ quên." },
      revolution: { text: "Sự tan rã của chế độ nô lệ mở đường cho nông nô: một quan hệ lệ thuộc mềm mỏng hơn nhưng bản chất vẫn là bóc lột." },
    },
  },
  feudal: {
    ruler: {
      enter: { text: "Đất đai nuôi triều đình. Tô thuế nuôi lãnh chúa. Còn chính danh giữ chân nông nô ở lại với ruộng đồng." },
      tension: { text: "Thị dân và thương nhân mang tiền bạc vào thành, còn những đặc quyền cũ lại không biết phải chứa họ ở đâu." },
      revolution: { text: "Khi thị trường lớn hơn lãnh địa, ngai vàng chỉ còn chọn hai lựa chọn:cải cách hoặc bị lật đổ qua cổng thành." },
    },
    worker: {
      enter: { text: "Ta sinh trên đất của lãnh chúa, nộp tô trên mảnh  đất ấy, và bị gọi là kẻ mang ơn." },
      tension: { text: "Trong phố, người ta kháo nhau về tự do. Ngoài ruộng, sổ tô vẫn ghi tên từng nhà." },
      revolution: { text: "Đốt sổ tô là không đủ. Phải xóa sạch cả quyền nói rằng đời ta thuộc về đất của kẻ khác." },
    },
    historian: {
      enter: { text: "Phong kiến đặt quyền lực lên sở hữu đất đai và ràng buộc cá nhân qua tô thuế, thân phận cùng giáo hội." },
      tension: { text: "Thị trường mang hàng hóa và tích lũy tư bản nguyên thủy đã biến các quan hệ phong kiến thành một vách ngăn cản trở." },
      revolution: { text: "Cách mạng tư sản đập tan đặc quyền phong kiến, nhưng quyền lực mới lại chuyển dịch vào tay sở hữu tư bản." },
    },
  },
  capitalist: {
    ruler: {
      enter: { text: "Nhà máy chạy vì lợi nhuận. Lao động được tự do ký hợp đồng, nhưng tuyệt nhiên không sở hữu thứ mình đang vận hành." },
      tension: { text: "Kho hàng đầy ắp cũng không cứu được thị trường. Nhất là khi chính người sản xuất ra hàng hóa lại không đủ sức mua lại hàng hóa." },
      revolution: { text: "Tư bản tạo ra công nhân tập thể, rồi bàng hoàng kinh ngạc khi tập thể ấy đúng lên đòi quyền sở hữu." },
    },
    worker: {
      enter: { text: "Ta được tự do bán sức lao động, và cũng tự do chết đói nếu không một ai mua nó." },
      tension: { text: "Máy chạy nhanh hơn, định mức cao hơn, nhưng đồng lương vẫn đứng yên. Mâu thuẫn đã bước vào từng ca làm việc." },
      revolution: { text: "Khi ta hiểu ra rằng nhà máy sống nhờ bàn tay mình, câu hỏi lúc này không còn là \"xin thêm\" nữa, mà là giành lại." },
    },
    historian: {
      enter: { text: "CNTB giải phóng người lao động khỏi tay lãnh chúa chỉ để buộc họ phải tự bán mình trên thị trường." },
      tension: { text: "Sản xuất mang tính xã hội hóa đói lập với chiếm hữu tư nhân. Đó là mâu thuẫn cốt lõi của phương thức tư bản." },
      revolution: { text: "Tự động hóa đẩy mâu thuẫn tới mức cực hạn: lực lượng sản xuất giờ đây đòi hỏi một quan hệ sở hữu hoàn toàn mới." },
    },
  },
  socialist: {
    ruler: {
      enter: { text: "Sở hữu xã hội mở ra khả năng kế hoạch hóa, nhưng quyền lực chung bắt buộc phải được kiểm soát chung." },
      tension: { text: "Quan liêu không phải một tàn dư nhỏ. Nó là một hiểm họa, nguy cơ biến bộ máy đại diện thành công cụ trục lợi riêng." },
      revolution: { text: "Hình thái mới không thắng bằng những lời tuyên bố; nó chỉ thắng khi quan hệ hằng ngày không còn dung túng cho đặc quyền tái sinh." },
    },
    worker: {
      enter: { text: "Máy móc, đã gánh bớt phần việc nặng nhọc. Lần đầu tiên trong lịch sử thời gian tự do thực sự có thể thuộc về người lao động." },
      tension: { text: "Nếu dữ liệu chung bị khóa chặt trong tay một nhóm nhỏ, thì hình thức mới này lại sẽ dung dưỡng cho những bất bình đẳng cũ." },
      revolution: { text: "Tự quản không phải là một khẩu hiệu suông. Nó là quyền bầu, quyền bãi nhiệm và quyền kiểm soát những thứ mà chúng ta cùng sở hữu." },
    },
    historian: {
      enter: { text: "XHCN bắt đầu khi tư liệu sản xuất chủ yếu không còn là tài sản tư nhân của giai cấp bóc lột." },
      tension: { text: "Tự động hóa không thể tự nó giải phóng con người. Chính quan hệ sở hữu mới là thứ quyết định xem công nghệ sẽ phục vụ ai." },
      revolution: { text: "Một hình thái hậu tư bản phải được đo lường bằng những quan hệ thực tế, chứ không chỉ bằng danh xưng của một nhà nước." },
    },
  },
};

export function resolveNarratorLine(
  eraId: EraId,
  perspective: PerspectiveId,
  moment: NarratorMoment,
): NarratorLine {
  return ROLE_NARRATOR_LINES[eraId]?.[perspective]?.[moment] ?? NARRATOR_LINES[eraId][moment];
}

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
