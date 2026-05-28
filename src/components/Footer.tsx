export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-stone-950 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl leading-tight">
              Lịch sử không phải chuỗi sự kiện ngẫu nhiên — mà là một cấu trúc
              vận động.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
              Tài liệu tham khảo
            </p>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Karl Marx — Tư bản, Quyển I</li>
              <li>Marx & Engels — Hệ tư tưởng Đức</li>
              <li>Friedrich Engels — Nguồn gốc gia đình, sở hữu tư nhân và nhà nước</li>
              <li>Eric Hobsbawm — The Age of Revolution</li>
              <li>Giáo trình Triết học Mác — Lênin (NXB CTQG)</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-amber-200/70">
              Lưu ý
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Trang này trình bày học thuyết duy vật lịch sử trên tinh thần giáo
              dục, trung lập học thuật. Cách phân kỳ năm hình thái chỉ mang tính
              khái quát, không bao trùm toàn bộ đa dạng lịch sử cụ thể.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.3em] text-white/40 md:flex-row md:items-center">
          <span>The Historical Materialism Timeline</span>
          <span>Một bản đồ lịch sử cuộn dọc · 2026</span>
        </div>
      </div>
    </footer>
  );
}