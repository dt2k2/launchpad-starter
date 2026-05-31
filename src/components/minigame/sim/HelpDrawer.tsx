/**
 * HelpDrawer — in-game tutorial / glossary explaining metrics, pressures,
 * contradiction tiers, and the cause→effect loop. Theme-aware via tokens.
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle } from "lucide-react";
import { METRIC_META, type MetricKey } from "@/data/historicalSim";
import { PRESSURE_META, type Pressures } from "@/data/contradiction";
import { useEffect } from "react";

const METRIC_GUIDE: Record<MetricKey, { what: string; effect: string }> = {
  production: {
    what: "Năng suất xã hội — công cụ, kỹ thuật, tổ chức lao động.",
    effect: "Tăng → mở khoá công nghệ & dồn áp lực lên quan hệ sản xuất cũ.",
  },
  stability: {
    what: "Mức xã hội tự nguyện chấp nhận trật tự hiện hành.",
    effect: "Thấp → mâu thuẫn dễ bùng. Cao → cách mạng khó nổ, nhưng có thể đang bị đè nén bằng bạo lực.",
  },
  tech: {
    what: "Tri thức kỹ thuật tích luỹ — đầu vào của Cây công nghệ.",
    effect: "Mỗi mốc mở khoá công cụ mới → đẩy production & contradiction.",
  },
  contradiction: {
    what: "Khoảng cách giữa Lực lượng sản xuất và Quan hệ sản xuất.",
    effect: "Cao → cảnh báo dồn dập, sự kiện khủng hoảng xuất hiện, áp lực cách mạng tăng nhanh.",
  },
  revolution: {
    what: "Tích luỹ áp lực cách mạng. Khi vượt ngưỡng → bước nhảy hình thái.",
    effect: "Đè nén có thể đẩy ngược (failed_uprising) hoặc gây collapse. Tổ chức tốt → cách mạng thành công.",
  },
};

const PRESSURE_GUIDE: Record<
  keyof Pressures,
  { effect: string }
> = {
  classTension: {
    effect: "Sinh ra từ contradiction + bất ổn. Là nguồn của khởi nghĩa.",
  },
  repression: {
    effect: "Dùng bạo lực giữ trật tự. Tạm thời giảm rupture nhưng đốt chính danh.",
  },
  legitimacyLoss: {
    effect: "Trật tự cũ không còn được thừa nhận tự nguyện → rupture dễ xảy ra.",
  },
  organization: {
    effect: "Khả năng tự tổ chức của giai cấp bị trị. Cao → cách mạng có lãnh đạo, thành công.",
  },
  productionInstability: {
    effect: "Đình công, đứt gãy cung ứng. Đẩy contradiction lên.",
  },
  ruptureRisk: {
    effect: "Tổng hợp xác suất bước vào điểm vỡ. Là chỉ báo tổng.",
  },
};

const TIERS = [
  { range: "0–29", name: "Êm", desc: "Trật tự ổn. Quyết định cải cách rẻ." },
  { range: "30–49", name: "Căng", desc: "Cảnh báo đầu tiên. Sự kiện nhỏ nổ." },
  { range: "50–69", name: "Bất ổn", desc: "Sự kiện khủng hoảng. Lựa chọn co lại." },
  { range: "70–84", name: "Khẩn cấp", desc: "Banner đỏ. Rất khó kéo lùi." },
  { range: "85+", name: "Rạn", desc: "Bước nhảy gần kề — cách mạng hoặc sụp đổ." },
];

export function HelpDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-stone-950/70 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[56] flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-[var(--p-border)] bg-[var(--p-surface)] text-[var(--p-text)] shadow-2xl backdrop-blur-2xl"
            aria-label="Hướng dẫn"
            role="dialog"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--p-border)] bg-[var(--p-surface)] px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[var(--p-accent)]" />
                <h2 className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--p-accent)]">
                  Hướng dẫn
                </h2>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={onClose}
                className="rounded-full border border-[var(--p-border)] p-1.5 hover:bg-[var(--p-accent-soft)]"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="space-y-7 px-5 py-6 text-sm leading-relaxed">
              <Section title="Bạn đang làm gì?">
                <p>
                  Mỗi <em>Ải</em> là một hình thái kinh tế–xã hội. Quyết định
                  của bạn dịch chuyển 5 chỉ số. Khi <strong>Mâu thuẫn</strong>{" "}
                  giữa <em>lực lượng sản xuất</em> và <em>quan hệ sản xuất</em>{" "}
                  đủ lớn, <strong>Cách mạng</strong> đẩy bạn sang hình thái kế tiếp
                  — hoặc làm cả hệ thống sụp đổ.
                </p>
                <p className="mt-2 text-[var(--p-muted)]">
                  Không có "đúng/sai" tuyệt đối: mỗi góc nhìn (Triều đình · Lao
                  động · Sử học) có thước điểm riêng.
                </p>
              </Section>

              <Section title="5 chỉ số xã hội">
                <ul className="space-y-3">
                  {(Object.keys(METRIC_GUIDE) as MetricKey[]).map((k) => (
                    <li key={k} className="rounded-md border border-[var(--p-border)] bg-[var(--p-accent-soft)] p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--p-accent)]">
                        {METRIC_META[k].label}
                      </p>
                      <p className="mt-1">{METRIC_GUIDE[k].what}</p>
                      <p className="mt-1 text-[var(--p-muted)]">
                        <span className="font-medium">Ảnh hưởng: </span>
                        {METRIC_GUIDE[k].effect}
                      </p>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="Mâu thuẫn — 5 mức">
                <ul className="space-y-2">
                  {TIERS.map((t) => (
                    <li
                      key={t.range}
                      className="flex gap-3 rounded-md border border-[var(--p-border)] p-2"
                    >
                      <span className="w-16 shrink-0 font-mono text-xs text-[var(--p-accent)]">
                        {t.range}
                      </span>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.25em]">
                          {t.name}
                        </p>
                        <p className="text-[var(--p-muted)]">{t.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title="6 áp lực hệ thống">
                <p className="text-[var(--p-muted)]">
                  Suy ra từ chỉ số + lịch sử quyết định. Hiện ở thanh nhỏ dưới
                  HUD.
                </p>
                <ul className="mt-3 space-y-2">
                  {(Object.keys(PRESSURE_GUIDE) as (keyof Pressures)[]).map(
                    (k) => (
                      <li
                        key={k}
                        className="rounded-md border border-[var(--p-border)] bg-[var(--p-accent-soft)] p-3"
                      >
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--p-accent)]">
                          {PRESSURE_META[k].label}
                        </p>
                        <p className="mt-1">{PRESSURE_META[k].description}</p>
                        <p className="mt-1 text-[var(--p-muted)]">
                          <span className="font-medium">Ảnh hưởng: </span>
                          {PRESSURE_GUIDE[k].effect}
                        </p>
                      </li>
                    ),
                  )}
                </ul>
              </Section>

              <Section title="Mẹo">
                <ul className="list-inside list-disc space-y-1.5 text-[var(--p-muted)]">
                  <li>Đè nén nhiều → giảm rupture tức thì, nhưng đốt chính danh — về sau khó cứu.</li>
                  <li>Nhượng bộ giữ ổn định nhưng làm chậm cách mạng.</li>
                  <li>Tổ chức cao + mâu thuẫn cao → cách mạng thắng lợi (không phải sụp đổ).</li>
                  <li>Đọc <em>Báo cáo hệ quả</em> sau mỗi quyết định để hiểu chuỗi nhân quả.</li>
                </ul>
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-medium uppercase tracking-[0.35em] text-[var(--p-accent)]">
        {title}
      </h3>
      <div className="text-sm">{children}</div>
    </section>
  );
}
