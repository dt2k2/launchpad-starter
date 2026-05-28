import { motion } from "framer-motion";
import { ArrowDown, Compass, Gamepad2 } from "lucide-react";
import { Link } from "@tanstack/react-router";


export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-screen overflow-hidden grain" data-era="primitive">
      {/* animated timeline lines */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.22_0.03_55)_0%,oklch(0.1_0.01_60)_70%)]" />
        <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.line
              key={i}
              x1="0"
              y1={`${(i + 1) * 7}%`}
              x2="100%"
              y2={`${(i + 1) * 7 + 2}%`}
              stroke="oklch(0.72 0.14 50)"
              strokeWidth="0.4"
              strokeDasharray="6 14"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 3 + i * 0.15, delay: i * 0.05, ease: "easeOut" }}
            />
          ))}
        </svg>
        {/* dust particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-amber-200/40"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 6 + (i % 5), repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-amber-200/80 backdrop-blur"
        >
          <Compass className="h-3.5 w-3.5" /> An Interactive Essay
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.2 }}
          className="font-display text-5xl leading-[0.95] text-balance text-white sm:text-7xl md:text-8xl"
        >
          Bản đồ lịch sử của
          <span className="block italic text-amber-200/90">các hình thái</span>
          <span className="block">kinh tế — xã hội</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.9 }}
          className="mt-8 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
        >
          Một hành trình cuộn dọc qua năm phương thức sản xuất đã định hình loài người —
          từ những hòn đá ghè đầu tiên đến các trung tâm dữ liệu của ngày mai.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-12 flex flex-col items-center gap-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-amber-200 px-8 py-4 text-sm font-medium uppercase tracking-[0.25em] text-stone-950 transition-transform hover:scale-[1.02]"
            >
              <span>Bắt đầu hành trình</span>
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </button>
            <Link
              to="/minigame"
              className="inline-flex items-center gap-2 rounded-full border border-amber-200/40 bg-white/5 px-6 py-4 text-sm uppercase tracking-[0.25em] text-amber-100 backdrop-blur transition hover:bg-white/10"
            >
              <Gamepad2 className="h-4 w-4" /> Chơi mini game
            </Link>
          </div>

          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-[10px] uppercase tracking-[0.4em]">scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="h-8 w-px bg-gradient-to-b from-white/40 to-transparent"
            />
          </div>
        </motion.div>
      </div>

      {/* bottom era tags */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 gap-3 text-[10px] uppercase tracking-[0.3em] text-white/40 md:flex">
        <span>Nguyên thuỷ</span>
        <span>·</span>
        <span>Nô lệ</span>
        <span>·</span>
        <span>Phong kiến</span>
        <span>·</span>
        <span>Tư bản</span>
        <span>·</span>
        <span>Xã hội chủ nghĩa</span>
      </div>
    </section>
  );
}