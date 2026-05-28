import { GLOSSARY } from "@/data/eras";
import { motion } from "framer-motion";

export function Glossary() {
  return (
    <section id="glossary" className="relative border-t border-white/10 bg-stone-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
          Bảng thuật ngữ
        </p>
        <h2 className="font-display text-4xl md:text-5xl">
          Bảy khái niệm để đọc lịch sử.
        </h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/5 md:grid-cols-2">
          {GLOSSARY.map((g, i) => (
            <motion.div
              key={g.term}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-stone-950 p-8 transition-colors hover:bg-stone-900"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
                Term {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-2xl">{g.term}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{g.def}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}