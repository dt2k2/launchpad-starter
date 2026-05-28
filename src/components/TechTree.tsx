import { ERAS } from "@/data/eras";
import { motion } from "framer-motion";

export function TechTree() {
  const all = ERAS.flatMap((e) =>
    e.keyInventions.map((k) => ({ ...k, eraId: e.id, eraTitle: e.title })),
  );

  return (
    <section className="relative border-t border-white/10 bg-stone-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
          Tech Tree of Production
        </p>
        <h2 className="font-display text-4xl md:text-5xl">
          Một đường thẳng từ <span className="italic">đá ghè</span> đến{" "}
          <span className="italic">AI tổng quát</span>.
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-white/60">
          Mỗi bước nhảy công cụ kéo theo một bước nhảy của quan hệ sản xuất.
        </p>

        <div className="relative mt-16 overflow-x-auto pb-6">
          <div className="relative flex min-w-[860px] items-center gap-3">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            {all.map((k, i) => (
              <motion.div
                key={k.name + i}
                data-era={k.eraId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="relative z-10 flex flex-1 flex-col items-center text-center"
              >
                <div
                  className="mb-3 h-3 w-3 rounded-full era-accent-bg"
                  style={{ boxShadow: "0 0 16px var(--era-glow)" }}
                />
                <p className="max-w-[110px] text-xs font-medium">{k.name}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-wider opacity-50">
                  {k.era}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}