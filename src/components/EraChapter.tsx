import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { Era } from "@/data/eras";
import { ContradictionMeter } from "./ContradictionMeter";
import { ArrowRight, Hammer, Users, Zap } from "lucide-react";
import { ERA_BG } from "@/assets/stageMedia";

export function EraChapter({
  era,
  isLast,
  onOpen,
}: {
  era: Era;
  isLast: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.3]);

  return (
    <section
      ref={ref}
      data-era={era.id}
      className="relative min-h-screen w-full overflow-hidden grain"
      style={{ color: "var(--era-fg)" }}
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ background: "var(--era-bg)" }} />
        <img
          src={ERA_BG[era.id]}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/55 via-stone-950/40 to-stone-950/80" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, var(--era-glow), transparent 60%), radial-gradient(ellipse at 80% 80%, var(--era-glow), transparent 65%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-12 md:py-32">

        {/* Left: era marker */}
        <motion.div style={{ y, opacity }} className="md:col-span-5">
          <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.35em] opacity-70">
            <span className="font-mono">0{era.index + 1} / 05</span>
            <span className="h-px w-12 bg-current opacity-30" />
            <span>chương</span>
          </div>
          <div className="mb-6 text-7xl leading-none era-accent-text font-display">
            {era.glyph}
          </div>
          <h2 className="font-display text-5xl leading-tight text-balance sm:text-6xl md:text-7xl">
            {era.title}
          </h2>
          <p className="mt-4 text-base italic opacity-70">{era.subtitle}</p>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] opacity-50">
            {era.timeRange}
          </p>
          <p className="mt-8 max-w-md text-lg leading-relaxed opacity-90">
            "{era.tagline}"
          </p>
        </motion.div>

        {/* Right: card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-7"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10">
            <p className="text-base leading-relaxed opacity-85 md:text-lg">
              {era.description}
            </p>

            <div className="my-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Mini icon={<Hammer className="h-3.5 w-3.5" />} title="Lực lượng sản xuất">
                {era.productionForces[0]}
              </Mini>
              <Mini icon={<Users className="h-3.5 w-3.5" />} title="Quan hệ sản xuất">
                {era.relationsOfProduction[0]}
              </Mini>
              <Mini icon={<Zap className="h-3.5 w-3.5" />} title="Phát kiến tiêu biểu">
                {era.keyInventions.map((k) => k.name).join(" · ")}
              </Mini>
              <Mini icon={<span className="text-[10px]">⚠</span>} title="Mâu thuẫn cốt lõi">
                {era.contradictions[0]}
              </Mini>
            </div>

            <ContradictionMeter value={era.contradictionLevel} />

            <button
              onClick={onOpen}
              className="mt-8 inline-flex items-center gap-2 rounded-full era-accent-bg px-6 py-3 text-sm font-medium text-stone-950 transition-transform hover:translate-x-1"
            >
              Mở chương đầy đủ
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {!isLast && <RevolutionTransition era={era} />}
    </section>
  );
}

function Mini({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] opacity-60">
        <span className="era-accent-text">{icon}</span>
        {title}
      </div>
      <p className="text-sm leading-relaxed opacity-90">{children}</p>
    </div>
  );
}

function RevolutionTransition({ era }: { era: Era }) {
  return (
    <div className="relative -mb-1 h-32 w-full overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="h-px w-full origin-left bg-gradient-to-r from-transparent via-current to-transparent opacity-30"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-current/20 bg-black/40 px-5 py-2 text-[10px] uppercase tracking-[0.4em] backdrop-blur"
      >
        ⟡ mâu thuẫn tích tụ — cách mạng 0{era.index + 1} → 0{era.index + 2} ⟡
      </motion.div>
    </div>
  );
}