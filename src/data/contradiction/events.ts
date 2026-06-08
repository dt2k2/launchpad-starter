/**
 * Contradiction Events — emergent crises that the threshold engine may inject
 * between decisions when systemic pressure crosses a tier.
 *
 * Each event is gated by era (`eras`) so anachronistic crises (e.g. strikes in
 * a tribal society, financial panics under primitive accumulation) never fire
 * outside their historical context.
 */
import type { EraId } from "../eras";
import type { MetricDelta, PerspectiveId } from "../historicalSim";
import type { Pressures } from "./pressures";
import type { TierId } from "./thresholds";

export interface ContradictionEvent {
  id: string;
  title: string;
  /** Eras in which this event may fire. Omit = all eras. */
  eras?: EraId[];
  minTier: TierId;
  weight: number;
  cooldown: number;
  /** Optional gate beyond tier + era. */
  condition?: (ctx: EventCondCtx) => boolean;
  narrator: Partial<Record<PerspectiveId, string>>;
  effect: MetricDelta;
  pressureImpact?: Partial<Pressures>;
  accent?: "rose" | "amber" | "violet" | "sky";
}

export interface EventCondCtx {
  metrics: { production: number; stability: number; contradiction: number; revolution: number; tech: number };
  pressures: Pressures;
  perspective: PerspectiveId;
}

export const CONTRADICTION_EVENTS: ContradictionEvent[] = [
  /* ============== PRIMITIVE (cộng sản nguyên thuỷ) ============== */
  {
    id: "harvest_failure_primitive",
    title: "Mùa săn thất bát",
    eras: ["primitive"],
    minTier: "tension",
    weight: 3,
    cooldown: 3,
    accent: "amber",
    narrator: {
      ruler: "Già làng chia lại phần thịt — phần ai cũng vơi đi một nửa.",
      worker: "Cả bộ lạc nhịn đói cùng nhau. Đứa nhỏ khóc, mẹ đưa nó bú không.",
      historian: "Khan hiếm nguyên thuỷ — chưa có thặng dư, nên chưa có ai bóc lột ai.",
    },
    effect: { production: -6, stability: -5, contradiction: 3 },
    pressureImpact: { productionInstability: 12 },
  },
  {
    id: "surplus_emerges",
    title: "Hạt giống thặng dư",
    eras: ["primitive"],
    minTier: "tension",
    weight: 3,
    cooldown: 4,
    accent: "sky",
    narrator: {
      ruler: "Một gia tộc cất riêng kho hạt. Lần đầu, 'của tôi' khác 'của chung'.",
      worker: "Có người tích trữ. Có người nhường phần. Ta chưa biết gọi đó là gì.",
      historian: "Khoảnh khắc tư hữu nảy mầm — bước ngoặt sẽ định hình mọi xã hội tiếp theo.",
    },
    effect: { production: 6, contradiction: 8 },
    pressureImpact: { classTension: 14 },
  },
  {
    id: "clan_dispute",
    title: "Tranh chấp giữa các thị tộc",
    eras: ["primitive"],
    minTier: "unstable",
    weight: 2,
    cooldown: 4,
    accent: "rose",
    narrator: {
      ruler: "Hai thị tộc tranh nhau bãi săn. Máu đổ lần đầu vì *đất*, không vì thú.",
      worker: "Anh em họ giờ là kẻ thù. Vũ khí trước đây để săn, nay chĩa vào người.",
      historian: "Xung đột lãnh thổ — mầm mống của chiến tranh giai cấp sau này.",
    },
    effect: { stability: -8, contradiction: 5 },
    pressureImpact: { classTension: 10 },
  },

  /* ============== SLAVE (chiếm hữu nô lệ) ============== */
  {
    id: "slave_flight",
    title: "Nô lệ bỏ trốn hàng loạt",
    eras: ["slave"],
    minTier: "tension",
    weight: 3,
    cooldown: 3,
    accent: "rose",
    narrator: {
      ruler: "Ba mươi nô lệ trốn khỏi đồn điền đêm qua. Quân tuần đuổi theo về tay không.",
      worker: "Đêm rằm, người ta tháo xích. Có người sẽ chết — nhưng tự do mới là sống.",
      historian: "Khi chi phí cưỡng bức vượt giá trị bóc lột, hệ thống bắt đầu rạn từ bên trong.",
    },
    effect: { production: -10, stability: -6, contradiction: 6 },
    pressureImpact: { repression: 8, classTension: 10 },
  },
  {
    id: "plague_ancient",
    title: "Đại dịch trong nô lệ",
    eras: ["slave"],
    minTier: "tension",
    weight: 2,
    cooldown: 4,
    accent: "amber",
    narrator: {
      ruler: "Bệnh dịch quét trại nô. Một phần ba tài sản lao động chết trong tuần.",
      worker: "Người chết chất đống. Cai không cho chôn — sợ chậm việc.",
      historian: "Dịch bệnh phơi bày: con người bị quy đổi thành tài sản, mất một nửa là khủng hoảng kinh tế.",
    },
    effect: { production: -14, stability: -8, contradiction: 5 },
    pressureImpact: { productionInstability: 18 },
  },
  {
    id: "gladiator_uprising",
    title: "Khởi nghĩa nô lệ vũ trang",
    eras: ["slave"],
    minTier: "unstable",
    weight: 2,
    cooldown: 5,
    accent: "rose",
    condition: ({ pressures }) => pressures.classTension > 50,
    narrator: {
      ruler: "Đấu sĩ giật giáo từ tay lính. Đám đông nô lệ theo sau — đường về La Mã đỏ máu.",
      worker: "Chúng ta là binh khí biết suy nghĩ. Đêm nay, binh khí quay lại chủ.",
      historian: "Spartacus là minh chứng: ngay cả công cụ sống cũng có giới hạn chịu đựng.",
    },
    effect: { stability: -14, revolution: 10, contradiction: 6 },
    pressureImpact: { organization: 14, repression: 10 },
  },
  {
    id: "barbarian_raid",
    title: "Man tộc tràn biên",
    eras: ["slave"],
    minTier: "emergency",
    weight: 2,
    cooldown: 5,
    accent: "violet",
    narrator: {
      ruler: "Biên giới vỡ. Quân đoàn rút về thủ đô — bỏ lại các tỉnh cho man tộc.",
      worker: "Họ đến không phải để giải phóng — nhưng chủ cũ đã chạy mất.",
      historian: "Đế chế nô lệ không sụp bởi kẻ thù; nó sụp vì không còn tự tái sản xuất nổi.",
    },
    effect: { stability: -16, production: -10, contradiction: 8 },
    pressureImpact: { legitimacyLoss: 18, productionInstability: 14 },
  },

  /* ============== FEUDAL (phong kiến) ============== */
  {
    id: "famine_medieval",
    title: "Mất mùa — đói kém",
    eras: ["feudal"],
    minTier: "tension",
    weight: 3,
    cooldown: 3,
    accent: "amber",
    narrator: {
      ruler: "Kho lãnh chúa đầy, làng dưới chết đói. Cha xứ giảng về 'thử thách của Chúa'.",
      worker: "Mẹ chia khẩu phần làm ba. Em út khóc, ta giả vờ no.",
      historian: "Tô hiện vật cứng nhắc — khi mùa thất bát, gánh nặng đổ trọn lên nông nô.",
    },
    effect: { production: -8, stability: -8, contradiction: 5 },
    pressureImpact: { productionInstability: 14, classTension: 8 },
  },
  {
    id: "peasant_revolt",
    title: "Khởi nghĩa nông dân",
    eras: ["feudal"],
    minTier: "unstable",
    weight: 3,
    cooldown: 4,
    accent: "rose",
    condition: ({ pressures }) => pressures.classTension > 45,
    narrator: {
      ruler: "Nông dân ba huyện vác liềm lên đồi. Lâu đài đóng cổng — ba ngày không ai mở.",
      worker: "Liềm gặt lúa cũng gặt được cổ lãnh chúa. Tối nay, ta đốt sổ tô.",
      historian: "Khởi nghĩa nông dân — đặc trưng và giới hạn của đấu tranh giai cấp tiền tư bản.",
    },
    effect: { stability: -14, revolution: 8, contradiction: 6 },
    pressureImpact: { organization: 12, classTension: 14 },
  },
  {
    id: "heresy_wave",
    title: "Làn sóng dị giáo",
    eras: ["feudal"],
    minTier: "tension",
    weight: 2,
    cooldown: 4,
    accent: "violet",
    narrator: {
      ruler: "Giảng đường vắng — dân theo nhà truyền giáo lưu vong. Toà án giáo hội xử không xuể.",
      worker: "Cha xứ mới giảng: 'Mọi người sinh ra đều bình đẳng trước Chúa.' Lần đầu, ta tin Chúa.",
      historian: "Khủng hoảng ý thức hệ phong kiến — báo trước Cải cách Tin Lành và cách mạng tư sản.",
    },
    effect: { stability: -6, contradiction: 6 },
    pressureImpact: { legitimacyLoss: 14 },
  },
  {
    id: "merchant_rise",
    title: "Thị dân và thương nhân trỗi dậy",
    eras: ["feudal"],
    minTier: "unstable",
    weight: 2,
    cooldown: 4,
    accent: "sky",
    narrator: {
      ruler: "Phường hội thị thành đòi miễn thuế. Họ giàu hơn ta — và biết điều đó.",
      worker: "Thợ thủ công thành phố thuê ta làm công nhật. Lần đầu, ta được trả bằng tiền.",
      historian: "Quan hệ tư bản chủ nghĩa nảy nở trong vỏ phong kiến — Marx gọi là 'mầm mống trong lòng cũ'.",
    },
    effect: { production: 6, tech: 3, contradiction: 5 },
    pressureImpact: { legitimacyLoss: 10 },
  },

  /* ============== CAPITALIST (tư bản chủ nghĩa) ============== */
  {
    id: "strike_wave",
    title: "Làn sóng bãi công",
    eras: ["capitalist"],
    minTier: "tension",
    weight: 3,
    cooldown: 2,
    accent: "rose",
    narrator: {
      ruler: "Các xưởng im tiếng máy. Báo cáo gọi đó là 'tạm dừng kỹ thuật' — ta biết là dối trá.",
      worker: "Anh em buông búa cùng lúc. Lần đầu, nhà máy im vì *chúng ta* im.",
      historian: "Khi giá trị thặng dư bị từ chối tạo ra, nền sản xuất lộ rõ ai thực sự vận hành nó.",
    },
    effect: { production: -8, contradiction: 4, stability: -5 },
    pressureImpact: { organization: 12, classTension: 8 },
  },
  {
    id: "factory_fire",
    title: "Hoả hoạn xưởng máy",
    eras: ["capitalist"],
    minTier: "tension",
    weight: 2,
    cooldown: 4,
    accent: "amber",
    narrator: {
      ruler: "Cửa thoát hiểm bị khoá để 'chống trộm'. Một trăm bốn mươi sáu nữ công nhân chết.",
      worker: "Triangle. Tên xưởng giờ là tên bia mộ. Ngày mai, chúng ta xuống đường.",
      historian: "Tai nạn công nghiệp không phải ngẫu nhiên — chúng là sản phẩm của logic tối đa hoá lợi nhuận.",
    },
    effect: { stability: -8, contradiction: 6 },
    pressureImpact: { classTension: 12, legitimacyLoss: 8 },
  },
  {
    id: "propaganda_surge",
    title: "Làn sóng tuyên truyền",
    eras: ["capitalist", "socialist"],
    minTier: "tension",
    weight: 2,
    cooldown: 3,
    accent: "amber",
    narrator: {
      ruler: "Báo chí đồng loạt đưa tin theo định hướng. Lòng dân, nếu không thể uốn, sẽ được kể lại.",
      worker: "Loa phường nói chúng ta đang sống tốt. Bụng ta nói khác.",
      historian: "Ý thức hệ tăng cường tỷ lệ thuận với việc cơ sở hạ tầng mất tính thuyết phục.",
    },
    effect: { stability: 4, contradiction: 3 },
    pressureImpact: { legitimacyLoss: 6, classTension: 4 },
  },
  {
    id: "financial_panic",
    title: "Hoảng loạn tài chính",
    eras: ["capitalist"],
    minTier: "unstable",
    weight: 3,
    cooldown: 4,
    accent: "amber",
    condition: ({ metrics }) => metrics.production < 60,
    narrator: {
      ruler: "Sàn chứng khoán đỏ rực. Ngân hàng đóng cửa quầy — đám đông xếp hàng đến tận đêm.",
      worker: "Hôm qua có lương. Hôm nay, đồng tiền trong túi không mua nổi bánh mì.",
      historian: "Khủng hoảng quá sản — đặc trưng chu kỳ của chủ nghĩa tư bản, Marx phân tích từ 1857.",
    },
    effect: { production: -12, stability: -10, contradiction: 7 },
    pressureImpact: { productionInstability: 22, legitimacyLoss: 14 },
  },
  {
    id: "elite_fracture",
    title: "Rạn nứt trong giới cầm quyền",
    eras: ["slave", "feudal", "capitalist", "socialist"],
    minTier: "unstable",
    weight: 2,
    cooldown: 4,
    accent: "violet",
    condition: ({ pressures }) => pressures.legitimacyLoss > 55,
    narrator: {
      ruler: "Phe cánh tranh nhau giải pháp. Mỗi bên có một bản đồ — không bên nào trùng nhau.",
      worker: "Họ cãi nhau trên thượng tầng. Ta nghe loáng thoáng: 'phải nhượng bộ' — 'phải dùng quân'.",
      historian: "Khi khối thống trị mất đồng thuận nội bộ, khoảng trống mở ra cho lực lượng dưới.",
    },
    effect: { stability: -10, contradiction: 6 },
    pressureImpact: { legitimacyLoss: 14, repression: -6 },
  },
  {
    id: "military_unrest",
    title: "Quân đội bất tuân",
    eras: ["feudal", "capitalist", "socialist"],
    minTier: "unstable",
    weight: 2,
    cooldown: 4,
    accent: "rose",
    condition: ({ pressures }) => pressures.repression > 40,
    narrator: {
      ruler: "Một đại đội từ chối nổ súng vào dân. Sĩ quan của họ giờ là tù binh của chính mình.",
      worker: "Người lính cùng quê đặt súng xuống. Anh ấy là *chúng ta*, mặc áo của *họ*.",
      historian: "Công cụ bạo lực của nhà nước rạn khi binh sĩ nhận ra mình thuộc giai cấp bị đàn áp.",
    },
    effect: { stability: -12, revolution: 8, contradiction: 4 },
    pressureImpact: { organization: 15, repression: -10 },
  },
  {
    id: "underground_org",
    title: "Tổ chức ngầm bành trướng",
    eras: ["feudal", "capitalist", "socialist"],
    minTier: "unstable",
    weight: 2,
    cooldown: 3,
    accent: "sky",
    narrator: {
      ruler: "Mật thám báo: hội kín mới mọc ở ngoại ô. Bắt người đứng đầu — ngày mai có người mới thay.",
      worker: "Đêm nay họp ở nhà kho. Mười hai người. Tuần trước chỉ năm.",
      historian: "Tổ chức ngầm là phôi thai của xã hội mới trong vỏ xã hội cũ.",
    },
    effect: { contradiction: 5, revolution: 6 },
    pressureImpact: { organization: 18, legitimacyLoss: 8 },
  },
  {
    id: "general_strike",
    title: "Tổng bãi công",
    eras: ["capitalist"],
    minTier: "emergency",
    weight: 3,
    cooldown: 6,
    accent: "rose",
    condition: ({ pressures }) => pressures.organization > 55,
    narrator: {
      ruler: "Cả thành phố ngừng thở. Không tàu, không điện, không báo. Chỉ có tiếng vang của khẩu hiệu.",
      worker: "Mọi ngành đồng loạt. Ta đã từng là 'lực lượng lao động' — đêm nay ta là *giai cấp*.",
      historian: "Tổng bãi công bộc lộ rõ: ai thực sự cần ai trong cấu trúc sản xuất.",
    },
    effect: { production: -18, stability: -15, revolution: 14, contradiction: 6 },
    pressureImpact: { organization: 20, classTension: 18, productionInstability: 25 },
  },
  {
    id: "treasury_collapse",
    title: "Ngân khố cạn",
    eras: ["slave", "feudal", "capitalist"],
    minTier: "emergency",
    weight: 2,
    cooldown: 5,
    accent: "amber",
    condition: ({ metrics }) => metrics.production < 55,
    narrator: {
      ruler: "Két sắt rỗng. Lính đánh thuê đòi lương bằng bạc, không bằng lời hứa.",
      worker: "Họ tăng thuế lần ba quý này. Bánh mì đắt gấp đôi.",
      historian: "Khủng hoảng tài khoá luôn báo trước khủng hoảng chính trị — Marx, 1857.",
    },
    effect: { production: -10, stability: -12, contradiction: 6 },
    pressureImpact: { legitimacyLoss: 15, productionInstability: 20 },
  },

  /* ============== SOCIALIST (cộng sản chủ nghĩa) ============== */
  {
    id: "bureaucratic_inertia",
    title: "Bộ máy trì trệ",
    eras: ["socialist"],
    minTier: "tension",
    weight: 3,
    cooldown: 3,
    accent: "amber",
    narrator: {
      ruler: "Báo cáo đẹp, thực tế xấu. Mỗi tầng nấc lọc lại sự thật một lần nữa.",
      worker: "Đơn thư ba năm chưa hồi âm. Người ký giấy đã nghỉ hưu — người mới chưa nhận hồ sơ.",
      historian: "Tha hoá quan liêu — nguy cơ nội tại Lenin cảnh báo từ những ngày đầu Cộng hoà Xô viết.",
    },
    effect: { production: -6, stability: -4, contradiction: 5 },
    pressureImpact: { legitimacyLoss: 12, productionInstability: 8 },
  },
  {
    id: "automation_displacement",
    title: "Tự động hoá đẩy người ra khỏi việc",
    eras: ["socialist"],
    minTier: "tension",
    weight: 2,
    cooldown: 4,
    accent: "sky",
    narrator: {
      ruler: "Năng suất tăng vọt. Câu hỏi mới: phân phối thời gian rảnh thế nào cho công bằng?",
      worker: "Máy làm việc của ta. Lương ta vẫn nhận — nhưng ta là ai, nếu không còn lao động?",
      historian: "Khi LLSX vượt khỏi lao động sống, QHSX phải định nghĩa lại 'giá trị' và 'phân phối'.",
    },
    effect: { tech: 6, production: 8, contradiction: 5 },
    pressureImpact: { classTension: 10 },
  },
  {
    id: "info_monopoly",
    title: "Độc quyền thông tin",
    eras: ["socialist"],
    minTier: "unstable",
    weight: 2,
    cooldown: 4,
    accent: "violet",
    narrator: {
      ruler: "Một nền tảng nắm toàn bộ luồng dữ liệu. 'Công hữu hoá' nó — hay để nó công hữu hoá ta?",
      worker: "Thuật toán quyết định ta đọc gì, gặp ai, được trả bao nhiêu.",
      historian: "Tư liệu sản xuất thời số là dữ liệu và thuật toán — câu hỏi sở hữu được đặt lại.",
    },
    effect: { tech: 4, stability: -8, contradiction: 6 },
    pressureImpact: { legitimacyLoss: 12, organization: 8 },
  },
  {
    id: "ecological_crisis",
    title: "Khủng hoảng sinh thái",
    eras: ["capitalist", "socialist"],
    minTier: "unstable",
    weight: 2,
    cooldown: 5,
    accent: "amber",
    narrator: {
      ruler: "Mùa lũ đến sớm ba tháng. Bản đồ kinh tế phải vẽ lại — không kịp.",
      worker: "Làng ven biển di dời lần thứ hai. Lần này không có nơi mới để đến.",
      historian: "Mâu thuẫn giữa xã hội và tự nhiên — chiều thứ tư của mâu thuẫn LLSX/QHSX.",
    },
    effect: { production: -10, stability: -8, contradiction: 6 },
    pressureImpact: { productionInstability: 16, legitimacyLoss: 8 },
  },

  /* ============== UNIVERSAL — vỡ trận ============== */
  {
    id: "panic_riot",
    title: "Hoảng loạn — bạo động",
    /* universal: any era at rupture */
    minTier: "rupture",
    weight: 3,
    cooldown: 0,
    accent: "rose",
    narrator: {
      ruler: "Đám đông không còn nghe ai. Cờ hiệu của ta giờ là củi đốt.",
      worker: "Không ai chỉ huy nữa. Mỗi con phố tự quyết. Đây là lịch sử đang mở miệng.",
      historian: "Vỡ trận — trật tự cũ không còn vận hành được, trật tự mới chưa định hình.",
    },
    effect: { stability: -20, revolution: 20, contradiction: 4 },
    pressureImpact: { ruptureRisk: 20, organization: 12 },
  },
];

/** Quick lookup map. */
export const EVENTS_BY_ID: Record<string, ContradictionEvent> = Object.fromEntries(
  CONTRADICTION_EVENTS.map((e) => [e.id, e]),
);
