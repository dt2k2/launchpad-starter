/**
 * Companion lines — era-scoped per perspective.
 * Each line may be locked to a specific eraId; if no eraId is set, it's generic.
 * Picker filters by perspective + trigger + (optionally) era.
 */
import type { PerspectiveId } from "@/data/historicalSim";
import type { EraId } from "@/data/eras";
import type { MemoryTagId } from "@/data/memory";
import type { PathOutcome } from "@/data/transition/outcomes";

export type CompanionTrigger =
  | { kind: "stage_start" }
  | { kind: "high_pressure" }
  | { kind: "rupture" }
  | { kind: "outcome"; outcome: PathOutcome }
  | { kind: "memory"; tag: MemoryTagId };

export interface CompanionLine {
  id: string;
  perspective: PerspectiveId;
  trigger: CompanionTrigger["kind"];
  eraId?: EraId; // if set, only fires in this era
  match?: (ctx: { outcome?: PathOutcome; tag?: MemoryTagId }) => boolean;
  text: string;
  speaker: string;
}

export const COMPANION_SPEAKER: Record<PerspectiveId, { name: string; role: string; emoji: string }> = {
  ruler:     { name: "Cận thần", role: "Người cố vấn", emoji: "✒" },
  worker:    { name: "Đồng chí", role: "Người cùng tổ", emoji: "✊" },
  historian: { name: "Trợ lý lưu trữ", role: "Văn thư", emoji: "📜" },
};

/* ───────── RULER speaker names by era ───────── */
const R = {
  primitive: "Già làng",
  slave: "Quan chấp pháp",
  feudal: "Cận thần",
  capitalist: "Cố vấn nội các",
  socialist: "Thư ký Đảng uỷ",
} satisfies Record<EraId, string>;

/* ───────── WORKER speaker names by era ───────── */
const W = {
  primitive: "Người cùng săn",
  slave: "Bạn nô lệ",
  feudal: "Người cùng làng",
  capitalist: "Đồng nghiệp ca",
  socialist: "Đồng chí cùng tổ",
} satisfies Record<EraId, string>;

/* ───────── HISTORIAN speaker (cố định) ───────── */
const H = "Trợ lý lưu trữ";

export const COMPANION_LINES: CompanionLine[] = [
  /* ══════════════════ PRIMITIVE — Cộng sản nguyên thuỷ ══════════════════ */
  // ── ruler (già làng/thủ lĩnh bộ lạc)
  { id: "r-prim-s1", perspective: "ruler", trigger: "stage_start", eraId: "primitive", speaker: R.primitive,
    text: "Mùa săn năm nay ít thú. Hội đồng các già muốn nghe ý của anh trước khi chia phần." },
  { id: "r-prim-s2", perspective: "ruler", trigger: "stage_start", eraId: "primitive", speaker: R.primitive,
    text: "Có nhà giấu hạt giống mùa trước. Lần đầu trong ký ức bộ lạc." },
  { id: "r-prim-p1", perspective: "ruler", trigger: "high_pressure", eraId: "primitive", speaker: R.primitive,
    text: "Cánh thanh niên đòi tách nhóm riêng. Họ nói săn chung chia đều là không công bằng." },
  { id: "r-prim-r",  perspective: "ruler", trigger: "rupture", eraId: "primitive", speaker: R.primitive,
    text: "Khi một người có dư, người khác bắt đầu thiếu. Đây là điều cha ông chưa từng thấy." },

  // ── worker (người cùng săn)
  { id: "w-prim-s1", perspective: "worker", trigger: "stage_start", eraId: "primitive", speaker: W.primitive,
    text: "Hôm qua chia thịt, phần của trẻ nhỏ ít hơn. Chưa ai nói ra, nhưng ai cũng thấy." },
  { id: "w-prim-s2", perspective: "worker", trigger: "stage_start", eraId: "primitive", speaker: W.primitive,
    text: "Hạt giống bắt đầu nảy mầm trên đất ta xới. Ta sẽ không phải đi xa nữa." },
  { id: "w-prim-p1", perspective: "worker", trigger: "high_pressure", eraId: "primitive", speaker: W.primitive,
    text: "Già làng giữ kho riêng. Mày có thấy lạ không?" },
  { id: "w-prim-r",  perspective: "worker", trigger: "rupture", eraId: "primitive", speaker: W.primitive,
    text: "Từ nay đất này là của nhà ai, không còn là của cả bộ lạc nữa." },

  // ── historian
  { id: "h-prim-s1", perspective: "historian", trigger: "stage_start", eraId: "primitive", speaker: H,
    text: "Giai đoạn này chưa có giai cấp. Nhưng đã có dấu vết phân công lao động theo giới." },
  { id: "h-prim-p1", perspective: "historian", trigger: "high_pressure", eraId: "primitive", speaker: H,
    text: "Sản phẩm thặng dư đầu tiên xuất hiện. Lịch sử ghi đây là mầm của tư hữu." },
  { id: "h-prim-r",  perspective: "historian", trigger: "rupture", eraId: "primitive", speaker: H,
    text: "Cuộc phân công lớn lần thứ nhất: chăn nuôi tách khỏi trồng trọt. Đánh dấu cho cả ngàn năm sau." },

  /* ══════════════════ SLAVE — Chiếm hữu nô lệ ══════════════════ */
  // ── ruler (quan chấp pháp / chủ nô)
  { id: "r-slav-s1", perspective: "ruler", trigger: "stage_start", eraId: "slave", speaker: R.slave,
    text: "Bẩm chủ, lô nô lệ mới từ miền Nam đã đến. Cần ngài định giá trước phiên chợ." },
  { id: "r-slav-s2", perspective: "ruler", trigger: "stage_start", eraId: "slave", speaker: R.slave,
    text: "Đấu trường tuần này thiếu người. Dân chúng đang chán." },
  { id: "r-slav-p1", perspective: "ruler", trigger: "high_pressure", eraId: "slave", speaker: R.slave,
    text: "Bẩm, có tin nô lệ ở vùng đồi đang truyền nhau tên một người. Spartacus." },
  { id: "r-slav-r",  perspective: "ruler", trigger: "rupture", eraId: "slave", speaker: R.slave,
    text: "Bẩm… La Mã không sụp vì man di ngoài biên. Nó sụp vì trong thành không còn ai chịu làm." },

  // ── worker (bạn nô lệ)
  { id: "w-slav-s1", perspective: "worker", trigger: "stage_start", eraId: "slave", speaker: W.slave,
    text: "Đêm qua hai đứa trong xà lim không dậy nữa. Chủ chưa biết." },
  { id: "w-slav-s2", perspective: "worker", trigger: "stage_start", eraId: "slave", speaker: W.slave,
    text: "Họ nói ta không phải người. Nhưng cái lưỡi cày này — chính tay ta rèn." },
  { id: "w-slav-p1", perspective: "worker", trigger: "high_pressure", eraId: "slave", speaker: W.slave,
    text: "Có người dạy cầm gươm trong rừng. Mày muốn theo không?" },
  { id: "w-slav-r",  perspective: "worker", trigger: "rupture", eraId: "slave", speaker: W.slave,
    text: "Hôm nay ta bẻ xiềng. Không phải để chạy — để đứng." },

  // ── historian
  { id: "h-slav-s1", perspective: "historian", trigger: "stage_start", eraId: "slave", speaker: H,
    text: "Nô lệ là công cụ biết nói — Aristotle viết vậy. Đó là quan hệ sản xuất chính." },
  { id: "h-slav-p1", perspective: "historian", trigger: "high_pressure", eraId: "slave", speaker: H,
    text: "Khi nô lệ chiếm 1/3 dân số, hệ thống không còn tự tái sản xuất được nữa. Đây là điểm tới hạn." },
  { id: "h-slav-r",  perspective: "historian", trigger: "rupture", eraId: "slave", speaker: H,
    text: "Khởi nghĩa Spartacus thất bại về quân sự, nhưng thành công về lịch sử — nó báo hiệu phương thức cũ đã hết khả năng." },

  /* ══════════════════ FEUDAL — Phong kiến ══════════════════ */
  // ── ruler (cận thần)
  { id: "r-feud-s1", perspective: "ruler", trigger: "stage_start", eraId: "feudal", speaker: R.feudal,
    text: "Bẩm, các lãnh chúa đất xa đang chậm nộp tô. Họ chờ xem ngài có cứng tay không." },
  { id: "r-feud-s2", perspective: "ruler", trigger: "stage_start", eraId: "feudal", speaker: R.feudal,
    text: "Tăng lữ tâu rằng nông dân ba làng phía Tây đã bỏ ruộng theo một thầy tu lạ." },
  { id: "r-feud-p1", perspective: "ruler", trigger: "high_pressure", eraId: "feudal", speaker: R.feudal,
    text: "Bẩm, thương nhân trong phố đang lập hội riêng. Họ giàu hơn nửa số quý tộc trong triều." },
  { id: "r-feud-r",  perspective: "ruler", trigger: "rupture", eraId: "feudal", speaker: R.feudal,
    text: "Ngài… ngọn cờ ba màu đã treo trên cổng Bastille." },

  // ── worker (người cùng làng / nông nô)
  { id: "w-feud-s1", perspective: "worker", trigger: "stage_start", eraId: "feudal", speaker: W.feudal,
    text: "Năm nay tô tăng nữa. Nửa số lúa sẽ về dinh quan." },
  { id: "w-feud-s2", perspective: "worker", trigger: "stage_start", eraId: "feudal", speaker: W.feudal,
    text: "Cha tao đi lính cho lãnh chúa, không về. Mẹ tao vẫn phải nộp đủ tô." },
  { id: "w-feud-p1", perspective: "worker", trigger: "high_pressure", eraId: "feudal", speaker: W.feudal,
    text: "Trong phố người ta nói: ai cũng là công dân, không còn chủ nữa. Mày tin không?" },
  { id: "w-feud-r",  perspective: "worker", trigger: "rupture", eraId: "feudal", speaker: W.feudal,
    text: "Đốt sổ tô! Đốt cả gia phả lãnh chúa! Đêm nay ta không còn là nông nô." },

  // ── historian
  { id: "h-feud-s1", perspective: "historian", trigger: "stage_start", eraId: "feudal", speaker: H,
    text: "Phong kiến: đất là quyền lực, tô là quan hệ chính. Giáo hội duy trì tính chính danh." },
  { id: "h-feud-p1", perspective: "historian", trigger: "high_pressure", eraId: "feudal", speaker: H,
    text: "Tư sản đô thị tích luỹ vốn từ thương mại đường biển. Phong kiến không có công cụ kìm hãm họ." },
  { id: "h-feud-r",  perspective: "historian", trigger: "rupture", eraId: "feudal", speaker: H,
    text: "1789 — tư sản gọi quần chúng làm cách mạng. Quần chúng thắng, nhưng chính tư sản nắm chính quyền." },

  /* ══════════════════ CAPITALIST — Tư bản chủ nghĩa ══════════════════ */
  // ── ruler (cố vấn nội các / chủ tư bản)
  { id: "r-cap-s1", perspective: "ruler", trigger: "stage_start", eraId: "capitalist", speaker: R.capitalist,
    text: "Thưa ngài, báo cáo quý III: lợi nhuận tăng 12%, nhưng tỷ lệ đình công cũng tăng theo." },
  { id: "r-cap-s2", perspective: "ruler", trigger: "stage_start", eraId: "capitalist", speaker: R.capitalist,
    text: "Truyền thông sáng nay đăng vụ tai nạn nhà máy. Cần một bài phản công trước trưa." },
  { id: "r-cap-p1", perspective: "ruler", trigger: "high_pressure", eraId: "capitalist", speaker: R.capitalist,
    text: "Thưa ngài, công đoàn ba ngành đã liên kết. Chưa từng có trong nhiệm kỳ này." },
  { id: "r-cap-r",  perspective: "ruler", trigger: "rupture", eraId: "capitalist", speaker: R.capitalist,
    text: "Thưa ngài… cổ đông đang rút. Lực lượng vũ trang đã từ chối nổ súng." },

  // ── worker (đồng nghiệp ca)
  { id: "w-cap-s1", perspective: "worker", trigger: "stage_start", eraId: "capitalist", speaker: W.capitalist,
    text: "Ca này tăng định mức nữa. Nhưng lương vẫn vậy. Mày tính sao?" },
  { id: "w-cap-s2", perspective: "worker", trigger: "stage_start", eraId: "capitalist", speaker: W.capitalist,
    text: "Maria không ra ca ba ngày rồi. Quản đốc bảo: thay người khác là xong." },
  { id: "w-cap-p1", perspective: "worker", trigger: "high_pressure", eraId: "capitalist", speaker: W.capitalist,
    text: "Đêm qua phát truyền đơn ngoài cổng nhà máy. Bọn cai đang đếm số người ra ca từng giờ." },
  { id: "w-cap-r",  perspective: "worker", trigger: "rupture", eraId: "capitalist", speaker: W.capitalist,
    text: "Hôm nay ta ký tên — không phải để xin việc. Là để tuyên bố ta là chủ nhà máy này." },

  // ── historian
  { id: "h-cap-s1", perspective: "historian", trigger: "stage_start", eraId: "capitalist", speaker: H,
    text: "Lao động được tự do — tự do bán sức lao động. Quan hệ giá trị thặng dư là cốt lõi." },
  { id: "h-cap-p1", perspective: "historian", trigger: "high_pressure", eraId: "capitalist", speaker: H,
    text: "Mâu thuẫn cơ bản: sản xuất ngày càng xã hội hoá, chiếm hữu vẫn tư nhân. Khủng hoảng chu kỳ là biểu hiện." },
  { id: "h-cap-r",  perspective: "historian", trigger: "rupture", eraId: "capitalist", speaker: H,
    text: "Khi giai cấp công nhân tự giác về sứ mệnh lịch sử, hình thái mới mới có thể xuất hiện." },

  /* ══════════════════ SOCIALIST — Cộng sản chủ nghĩa ══════════════════ */
  // ── ruler (thư ký Đảng uỷ / cán bộ lãnh đạo)
  { id: "r-soc-s1", perspective: "ruler", trigger: "stage_start", eraId: "socialist", speaker: R.socialist,
    text: "Báo cáo đồng chí, kế hoạch quý đạt 104%. Nhưng tổ kỹ thuật nói máy mới đang nằm chờ linh kiện." },
  { id: "r-soc-s2", perspective: "ruler", trigger: "stage_start", eraId: "socialist", speaker: R.socialist,
    text: "Có ý kiến nhân dân về việc khoán hộ. Cần đồng chí cho hướng trước hội nghị." },
  { id: "r-soc-p1", perspective: "ruler", trigger: "high_pressure", eraId: "socialist", speaker: R.socialist,
    text: "Đồng chí, một số nơi quan liêu hoá. Cán bộ nói thay dân, không hỏi dân." },
  { id: "r-soc-r",  perspective: "ruler", trigger: "rupture", eraId: "socialist", speaker: R.socialist,
    text: "Hình thái mới không phải sắc lệnh. Nó là tổ chức từng ngày, trong từng quan hệ." },

  // ── worker (đồng chí cùng tổ)
  { id: "w-soc-s1", perspective: "worker", trigger: "stage_start", eraId: "socialist", speaker: W.socialist,
    text: "Tổ ta đề xuất cải tiến dây chuyền. Lần đầu kỹ sư ngồi xuống nghe ta nói." },
  { id: "w-soc-s2", perspective: "worker", trigger: "stage_start", eraId: "socialist", speaker: W.socialist,
    text: "Nhà trẻ trong nhà máy mở rồi. Vợ tao đi học bổ túc buổi tối." },
  { id: "w-soc-p1", perspective: "worker", trigger: "high_pressure", eraId: "socialist", speaker: W.socialist,
    text: "Có ông cán bộ mới về, nói ta nghe nhiều hơn hỏi ta. Coi chừng quan liêu." },
  { id: "w-soc-r",  perspective: "worker", trigger: "rupture", eraId: "socialist", speaker: W.socialist,
    text: "Máy móc làm thay ta nhiều việc rồi. Câu hỏi là: của ai, vì ai?" },

  // ── historian
  { id: "h-soc-s1", perspective: "historian", trigger: "stage_start", eraId: "socialist", speaker: H,
    text: "Sở hữu công cộng về tư liệu sản xuất chủ yếu — đặc trưng phân biệt với hình thái trước." },
  { id: "h-soc-p1", perspective: "historian", trigger: "high_pressure", eraId: "socialist", speaker: H,
    text: "Quan liêu, chủ nghĩa hình thức là nguy cơ nội tại. Lê-nin đã cảnh báo từ rất sớm." },
  { id: "h-soc-r",  perspective: "historian", trigger: "rupture", eraId: "socialist", speaker: H,
    text: "Tự động hoá không tự nó giải phóng. Quyền sở hữu mới quyết định ý nghĩa của nó." },

  /* ══════════════════ Outcome lines — dùng chung mọi era ══════════════════ */
  { id: "r-out-supp", perspective: "ruler", trigger: "outcome", match: ({outcome})=>outcome==="suppress",
    speaker: "Cố vấn", text: "Họ im. Nhưng cái im này không giống cái im của trật tự." },
  { id: "r-out-fail", perspective: "ruler", trigger: "outcome", match: ({outcome})=>outcome==="failed_uprising",
    speaker: "Cố vấn", text: "Đã giải tán. Đã treo cờ. Chuyện này nên ghi vào sổ ngắn gọn thôi." },
  { id: "r-out-coll", perspective: "ruler", trigger: "outcome", match: ({outcome})=>outcome==="collapse",
    speaker: "Cố vấn", text: "Trật tự không còn chỉ nứt nữa. Sổ thuế, kho lương và mệnh lệnh đều mất người thi hành." },
  { id: "r-out-frez", perspective: "ruler", trigger: "outcome", match: ({outcome})=>outcome==="freeze",
    speaker: "Cố vấn", text: "Ta giữ được ngai, nhưng không giữ được đà lịch sử. Bộ máy đang tự lặp lại chính nó." },
  { id: "w-out-fail", perspective: "worker", trigger: "outcome", match: ({outcome})=>outcome==="failed_uprising",
    speaker: "Đồng chí", text: "Đừng nói tên cô ấy ngoài đường nữa. Đừng." },
  { id: "w-out-supp", perspective: "worker", trigger: "outcome", match: ({outcome})=>outcome==="suppress",
    speaker: "Đồng chí", text: "Có người mất tích đêm qua. Không phải lần đầu. Đừng tin ai cười với mày." },
  { id: "w-out-coll", perspective: "worker", trigger: "outcome", match: ({outcome})=>outcome==="collapse",
    speaker: "Đồng chí", text: "Chợ đóng, xưởng tắt, tem phiếu không đổi được gì. Khi hệ thống gãy, người nghèo nghe tiếng gãy trước." },
  { id: "w-out-frez", perspective: "worker", trigger: "outcome", match: ({outcome})=>outcome==="freeze",
    speaker: "Đồng chí", text: "Ngày mai vẫn làm như hôm nay, chỉ ít hy vọng hơn. Đôi khi trì trệ cũng là một hình thức mất mát." },
  { id: "h-out-coll", perspective: "historian", trigger: "outcome", match: ({outcome})=>outcome==="collapse",
    speaker: H, text: "Chúng ta sẽ mất một thế hệ dữ liệu sau biến cố này." },
  { id: "h-out-frez", perspective: "historian", trigger: "outcome", match: ({outcome})=>outcome==="freeze",
    speaker: H, text: "Không có gì để ghi. Bản thân điều đó cũng là một dữ liệu." },
  { id: "h-out-supp", perspective: "historian", trigger: "outcome", match: ({outcome})=>outcome==="suppress",
    speaker: H, text: "Đàn áp có thể chặn sự kiện, nhưng thường làm rõ hơn quan hệ quyền lực mà nó muốn che." },
  { id: "h-out-fail", perspective: "historian", trigger: "outcome", match: ({outcome})=>outcome==="failed_uprising",
    speaker: H, text: "Một khởi nghĩa thất bại vẫn là tư liệu: nó cho thấy lực lượng mới đã xuất hiện nhưng chưa đủ tổ chức." },
];

export function pickCompanionLine(
  perspective: PerspectiveId,
  trigger: CompanionTrigger,
  said: Set<string>,
  eraId?: EraId,
): CompanionLine | null {
  const ctx = { outcome: (trigger as { outcome?: PathOutcome }).outcome, tag: (trigger as { tag?: MemoryTagId }).tag };
  // First, prefer era-specific lines; fall back to generic (no eraId) if none match.
  const matchTrigger = (l: CompanionLine) =>
    l.perspective === perspective && l.trigger === trigger.kind && (!l.match || l.match(ctx));

  const eraScoped = COMPANION_LINES.filter((l) => matchTrigger(l) && l.eraId === eraId);
  const generic = COMPANION_LINES.filter((l) => matchTrigger(l) && !l.eraId);

  const pool = eraScoped.length > 0 ? eraScoped : generic;
  if (pool.length === 0) return null;

  const unsaid = pool.filter((l) => !said.has(l.id));
  const choices = unsaid.length > 0 ? unsaid : pool;
  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}
