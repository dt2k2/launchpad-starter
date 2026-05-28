import { useState } from "react";
import { QUIZ } from "@/data/eras";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw } from "lucide-react";

export function Quiz() {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = QUIZ[idx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
    setTimeout(() => {
      if (idx + 1 < QUIZ.length) {
        setIdx(idx + 1);
        setPicked(null);
      } else {
        setDone(true);
      }
    }, 1100);
  };

  const reset = () => {
    setIdx(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  return (
    <section id="quiz" className="relative border-t border-white/10 bg-stone-950 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
          Kiểm tra nhanh
        </p>
        <h2 className="font-display text-4xl md:text-5xl">5 câu để chắc chắn bạn đã hiểu.</h2>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          {!done ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/40">
                  <span className="font-mono">
                    {String(idx + 1).padStart(2, "0")} / {String(QUIZ.length).padStart(2, "0")}
                  </span>
                  <span>điểm {score}</span>
                </div>
                <h3 className="font-display text-2xl leading-snug md:text-3xl">{q.q}</h3>
                <div className="mt-8 space-y-3">
                  {q.options.map((opt, i) => {
                    const isAnswer = i === q.answer;
                    const isPicked = picked === i;
                    const state =
                      picked === null
                        ? "idle"
                        : isAnswer
                          ? "correct"
                          : isPicked
                            ? "wrong"
                            : "muted";
                    return (
                      <button
                        key={i}
                        onClick={() => pick(i)}
                        disabled={picked !== null}
                        className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm transition-colors ${
                          state === "idle"
                            ? "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.05]"
                            : state === "correct"
                              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100"
                              : state === "wrong"
                                ? "border-red-400/50 bg-red-400/10 text-red-100"
                                : "border-white/5 bg-white/[0.01] opacity-40"
                        }`}
                      >
                        <span>{opt}</span>
                        {state === "correct" && <Check className="h-4 w-4" />}
                        {state === "wrong" && <X className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-10 text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-amber-200/70">Kết quả</p>
              <p className="mt-4 font-display text-6xl">
                {score}/{QUIZ.length}
              </p>
              <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
                {score === QUIZ.length
                  ? "Bạn đã nắm trọn năm chương lịch sử."
                  : score >= 3
                    ? "Nền tảng vững. Còn vài chỗ đáng đọc lại."
                    : "Hãy cuộn lại các chương — lịch sử đáng được đọc kỹ."}
              </p>
              <button
                onClick={reset}
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-[0.3em] transition-colors hover:bg-white/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Làm lại
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}