import { useEffect, useState } from "react";
import { ERAS } from "@/data/eras";
import { motion } from "framer-motion";

export function StickyLegend({ currentEra }: { currentEra: string | null }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      aria-label="Mục lục các hình thái"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -20 }}
      transition={{ duration: 0.4 }}
      className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
    >
      {ERAS.map((era) => {
        const active = currentEra === era.id;
        return (
          <a
            key={era.id}
            href={`#era-${era.id}`}
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]"
          >
            <span
              className={`h-px transition-all duration-500 ${
                active ? "w-12 bg-white" : "w-5 bg-white/30 group-hover:w-8 group-hover:bg-white/60"
              }`}
            />
            <span
              className={`transition-opacity ${
                active ? "text-white opacity-100" : "text-white/40 opacity-0 group-hover:opacity-100"
              }`}
            >
              0{era.index + 1} · {era.title}
            </span>
          </a>
        );
      })}
    </motion.nav>
  );
}