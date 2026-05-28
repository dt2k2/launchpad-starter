import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Era } from "@/data/eras";
import { ContradictionMeter } from "./ContradictionMeter";
import { useEffect } from "react";

export function EraDetailSheet({
  era,
  onClose,
}: {
  era: Era | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (era) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [era, onClose]);

  return (
    <AnimatePresence>
      {era && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết ${era.title}`}
        >
          <motion.aside
            data-era={era.id}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="era-surface relative h-full w-full max-w-2xl overflow-y-auto grain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[color:var(--era-bg)]/90 px-8 py-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="era-accent-text font-display text-3xl">{era.glyph}</span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-50">
                    Chương 0{era.index + 1}
                  </p>
                  <h3 className="font-display text-xl">{era.title}</h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng chi tiết"
                className="rounded-full border border-white/15 p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-10 px-8 py-10">
              <Section title="Tổng quan">
                <p className="text-base leading-relaxed opacity-90">{era.description}</p>
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] opacity-50">
                  {era.timeRange}
                </p>
              </Section>

              <Section title="Lực lượng sản xuất">
                <Bullets items={era.productionForces} />
              </Section>

              <Section title="Quan hệ sản xuất">
                <Bullets items={era.relationsOfProduction} />
              </Section>

              <Section title="Cấu trúc giai cấp">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="Tầng lớp thống trị" value={era.dominantClass.rulers} />
                  <Stat label="Người lao động" value={era.dominantClass.workers} />
                  <Stat label="Hình thức sở hữu" value={era.dominantClass.ownership} />
                </div>
              </Section>

              <Section title="Dòng chảy phát kiến">
                <ol className="relative space-y-4 border-l border-white/15 pl-6">
                  {era.keyInventions.map((k) => (
                    <li key={k.name} className="relative">
                      <span className="absolute -left-[27px] top-1.5 h-2 w-2 rounded-full era-accent-bg" />
                      <p className="text-sm font-medium">{k.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50">
                        {k.era}
                      </p>
                    </li>
                  ))}
                </ol>
              </Section>

              <Section title="Mâu thuẫn cốt lõi">
                <Bullets items={era.contradictions} />
                <div className="mt-6">
                  <ContradictionMeter value={era.contradictionLevel} />
                </div>
              </Section>

              <Section title="Vì sao tiến tới khủng hoảng">
                <Bullets items={era.crisisDrivers} />
              </Section>

              <Section title="Chuyển hoá sang hình thái mới">
                <p className="text-base leading-relaxed opacity-90">{era.transition}</p>
              </Section>

              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-6">
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] era-accent-text">
                  Takeaway
                </p>
                <p className="font-display text-2xl leading-snug">{era.takeaway}</p>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-4 text-[10px] uppercase tracking-[0.3em] opacity-60">{title}</h4>
      {children}
    </section>
  );
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-sm leading-relaxed opacity-90">
          <span className="era-accent-text mt-1.5 h-1 w-1 flex-shrink-0 rounded-full era-accent-bg" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="mb-1.5 text-[10px] uppercase tracking-[0.25em] opacity-50">{label}</p>
      <p className="text-sm leading-snug">{value}</p>
    </div>
  );
}