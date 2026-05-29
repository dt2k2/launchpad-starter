/**
 * Contradiction Events — emergent crises that the threshold engine may inject
 * between decisions when systemic pressure crosses a tier.
 *
 * Each event applies metric + pressure deltas immediately on trigger and
 * surfaces a narrator line in the active perspective's voice.
 */
import type { MetricDelta, PerspectiveId } from "../historicalSim";
import type { Pressures } from "./pressures";
import type { TierId } from "./thresholds";

export interface ContradictionEvent {
  id: string;
  title: string;
  minTier: TierId;
  weight: number;
  cooldown: number;
  /** Optional gate beyond the tier check. */
  condition?: (ctx: EventCondCtx) => boolean;
  narrator: Partial<Record<PerspectiveId, string>>;
  effect: MetricDelta;
  pressureImpact?: Partial<Pressures>;
  /** Visual accent — purely cosmetic for the banner. */
  accent?: "rose" | "amber" | "violet" | "sky";
}

export interface EventCondCtx {
  metrics: { production: number; stability: number; contradiction: number; revolution: number; tech: number };
  pressures: Pressures;
  perspective: PerspectiveId;
}

export const CONTRADICTION_EVENTS: ContradictionEvent[] = [
  {
    id: "strike_wave",
    title: "Làn sóng bãi công",
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
    id: "propaganda_surge",
    title: "Làn sóng tuyên truyền",
    minTier: "tension",
    weight: 2,
    cooldown: 3,
    accent: "amber",
    narrator: {
      ruler: "Sai sử quan viết lại biên niên. Lòng dân, nếu không thể uốn, sẽ được kể lại.",
      worker: "Loa phường nói chúng ta đang sống tốt. Bụng ta nói khác.",
      historian: "Ý thức hệ tăng cường tỷ lệ thuận với việc cơ sở hạ tầng mất tính thuyết phục.",
    },
    effect: { stability: 4, contradiction: 3 },
    pressureImpact: { legitimacyLoss: 6, classTension: 4 },
  },
  {
    id: "food_shortage",
    title: "Khan hiếm lương thực",
    minTier: "tension",
    weight: 2,
    cooldown: 3,
    accent: "amber",
    narrator: {
      ruler: "Kho lương ba quận cạn. Giá bánh mì tăng gấp đôi — quân vệ binh đã được điều đến chợ.",
      worker: "Mẹ chia khẩu phần làm ba. Em út khóc, ta giả vờ no.",
      historian: "Khủng hoảng tái sản xuất sức lao động — tiền đề kinh điển của bất ổn chính trị.",
    },
    effect: { production: -6, stability: -8, contradiction: 5 },
    pressureImpact: { productionInstability: 14, classTension: 6 },
  },
  {
    id: "elite_fracture",
    title: "Rạn nứt trong giới cầm quyền",
    minTier: "unstable",
    weight: 2,
    cooldown: 4,
    accent: "violet",
    condition: ({ pressures }) => pressures.legitimacyLoss > 55,
    narrator: {
      ruler: "Phe cánh tranh nhau giải pháp. Mỗi bên có một bản đồ — không bên nào trùng nhau.",
      worker: "Họ cãi nhau trong cung. Ta nghe loáng thoáng: 'phải nhượng bộ' — 'phải dùng quân'.",
      historian: "Khi khối thống trị mất đồng thuận nội bộ, khoảng trống mở ra cho lực lượng dưới.",
    },
    effect: { stability: -10, contradiction: 6 },
    pressureImpact: { legitimacyLoss: 14, repression: -6 },
  },
  {
    id: "military_unrest",
    title: "Quân đội bất tuân",
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
    id: "treasury_collapse",
    title: "Ngân khố cạn",
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
  {
    id: "general_strike",
    title: "Tổng bãi công",
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
    id: "panic_riot",
    title: "Hoảng loạn — bạo động",
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
