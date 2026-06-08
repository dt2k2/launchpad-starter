export function TeamCredits() {
  return (
    <div className="pointer-events-none fixed left-3 top-3 z-50 hidden select-none rounded-lg border border-white/10 bg-stone-950/60 px-4 py-3 font-sans text-sm leading-tight text-white/80 backdrop-blur-md sm:block">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-amber-200/80">
        Team
      </p>
      <ul className="space-y-1 text-base font-medium">
        <li>SE192802 — Lưu Ngọc Ngân Giang</li>
        <li>SE161931 — Bùi Đức Thắng</li>
        <li>SE170105 — Nguyễn Lê Đăng Khoa</li>
      </ul>
      <p className="mb-1.5 mt-3 text-[10px] font-medium uppercase tracking-[0.25em] text-amber-200/80">
        AI Bots
      </p>
      <ul className="space-y-1 text-sm text-white/70">
        <li>Lovable</li>
        <li>Claude</li>
      </ul>
    </div>
  );
}
