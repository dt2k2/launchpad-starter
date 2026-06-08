export type EraId = "primitive" | "slave" | "feudal" | "capitalist" | "socialist";

export interface Era {
  id: EraId;
  index: number;
  title: string;
  subtitle: string;
  timeRange: string;
  tagline: string;
  description: string;
  productionForces: string[];
  relationsOfProduction: string[];
  dominantClass: { rulers: string; workers: string; ownership: string };
  keyInventions: { name: string; era: string }[];
  contradictions: string[];
  crisisDrivers: string[];
  transition: string;
  takeaway: string;
  contradictionLevel: number; // 0-100 at peak
  scene: string; // background hint
  glyph: string; // 1-char or short symbol
}

export const ERAS: Era[] = [
  {
    id: "primitive",
    index: 0,
    title: "Cộng sản nguyên thuỷ",
    subtitle: "Bầy đàn, thị tộc, bộ lạc",
    timeRange: "~2.5 triệu năm TCN — ~10.000 năm TCN",
    tagline: "Của chung. Săn chung. Đói chung.",
    description:
      "Hình thái sơ khai nhất của xã hội loài người. Công cụ lao động thô sơ, năng suất thấp, con người buộc phải sống thành cộng đồng và chia đều sản phẩm để cùng tồn tại.",
    productionForces: [
      "Công cụ đá thô, đá mài, cung tên, lửa",
      "Săn bắt, hái lượm; cuối kỳ xuất hiện trồng trọt và chăn nuôi",
      "Năng suất rất thấp, gần như không có thặng dư",
      "Phân công lao động tự nhiên theo giới và tuổi",
    ],
    relationsOfProduction: [
      "Sở hữu công cộng về tư liệu sản xuất",
      "Lao động tập thể, sản phẩm chia đều",
      "Chưa có giai cấp, chưa có nhà nước",
      "Quan hệ huyết thống chi phối tổ chức xã hội",
    ],
    dominantClass: {
      rulers: "Hội đồng thị tộc / trưởng lão",
      workers: "Toàn bộ thành viên",
      ownership: "Sở hữu chung của cộng đồng",
    },
    keyInventions: [
      { name: "Đá ghè", era: "~2.5M TCN" },
      { name: "Lửa", era: "~1M TCN" },
      { name: "Cung tên", era: "~30k TCN" },
      { name: "Nông nghiệp sơ khai", era: "~10k TCN" },
    ],
    contradictions: [
      "Năng suất tăng dần khi xuất hiện nông nghiệp và chăn nuôi",
      "Bắt đầu có sản phẩm dư thừa — mầm mống của tư hữu",
      "Sự phân hoá giàu nghèo trong thị tộc",
    ],
    crisisDrivers: [
      "Công cụ kim loại làm thay đổi căn bản năng suất",
      "Chiến tranh giữa các bộ lạc tạo tù binh — nguồn nô lệ đầu tiên",
    ],
    transition:
      "Khi sản phẩm thặng dư đủ lớn, một số người chiếm hữu nó. Tù binh chiến tranh không bị giết mà bị bắt làm nô lệ. Xã hội có giai cấp ra đời.",
    takeaway:
      "Không có bóc lột vì không có gì để bóc lột. Bình đẳng là kết quả của khan hiếm, không phải của lựa chọn.",
    contradictionLevel: 25,
    scene: "Hang động, lửa trại, đồng cỏ nguyên sinh",
    glyph: "△",
  },
  {
    id: "slave",
    index: 1,
    title: "Chiếm hữu nô lệ",
    subtitle: "Chủ nô và nô lệ",
    timeRange: "~3.000 năm TCN — ~thế kỷ V",
    tagline: "Người là công cụ biết nói.",
    description:
      "Hình thái có giai cấp đầu tiên. Chủ nô sở hữu cả tư liệu sản xuất và bản thân người lao động. Văn minh đô thị, nhà nước, luật pháp và chữ viết xuất hiện trên nền lao động cưỡng bức.",
    productionForces: [
      "Công cụ đồng và sắt thay thế đá",
      "Cày, bừa, thuỷ lợi quy mô lớn",
      "Thủ công nghiệp tách khỏi nông nghiệp",
      "Thương mại và tiền tệ phát triển",
    ],
    relationsOfProduction: [
      "Chủ nô sở hữu tư liệu sản xuất và nô lệ",
      "Nô lệ không được coi là con người, không có quyền sở hữu",
      "Toàn bộ sản phẩm thuộc về chủ nô",
      "Nhà nước ra đời để bảo vệ quyền của chủ nô",
    ],
    dominantClass: {
      rulers: "Chủ nô, quý tộc, tăng lữ",
      workers: "Nô lệ, nông dân tự do nghèo",
      ownership: "Chủ nô sở hữu tuyệt đối",
    },
    keyInventions: [
      { name: "Đồ đồng", era: "~3000 TCN" },
      { name: "Chữ viết", era: "~3200 TCN" },
      { name: "Cày sắt", era: "~1200 TCN" },
      { name: "Tiền kim loại", era: "~600 TCN" },
    ],
    contradictions: [
      "Nô lệ không có động lực lao động — phá hoại công cụ",
      "Sản xuất đình trệ khi không còn nguồn nô lệ mới",
      "Khởi nghĩa nô lệ liên tiếp (Spartacus, …)",
    ],
    crisisDrivers: [
      "Chiến tranh xâm lược giảm hiệu quả",
      "Lao động nô lệ không đáp ứng được yêu cầu kỹ thuật cao hơn",
      "Tầng lớp tá điền (colonus) xuất hiện thay thế nô lệ",
    ],
    transition:
      "Lãnh chúa dần biến nô lệ và nông dân tự do thành nông nô gắn với ruộng đất. Quan hệ phong kiến hình thành trên đổ nát của đế chế nô lệ.",
    takeaway:
      "Bóc lột công khai và trực tiếp. Người bị biến thành tài sản — nhưng cũng vì thế, hệ thống tự huỷ.",
    contradictionLevel: 75,
    scene: "Đấu trường, cảng biển Địa Trung Hải, kim tự tháp",
    glyph: "⊠",
  },
  {
    id: "feudal",
    index: 2,
    title: "Phong kiến",
    subtitle: "Lãnh chúa và nông nô",
    timeRange: "~Thế kỷ V — XVIII",
    tagline: "Đất là quyền lực. Máu là số phận.",
    description:
      "Ruộng đất là tư liệu sản xuất chủ đạo. Lãnh chúa sở hữu đất, nông nô gắn chặt với mảnh đất ấy và phải nộp tô, lao dịch. Quan hệ thứ bậc, tôn giáo và quân sự đan xen.",
    productionForces: [
      "Cày sắt nặng, cối xay nước và gió",
      "Luân canh ba vụ, kỹ thuật nông nghiệp tiến bộ",
      "Phường hội thủ công ở đô thị",
      "Thương mại đường dài, hội chợ, ngân hàng sơ khai",
    ],
    relationsOfProduction: [
      "Lãnh chúa sở hữu ruộng đất",
      "Nông nô có công cụ riêng nhưng gắn với đất của chúa",
      "Nộp tô bằng hiện vật, lao dịch và sau là tiền",
      "Hệ thống đẳng cấp được tôn giáo hợp thức hoá",
    ],
    dominantClass: {
      rulers: "Vua, quý tộc, lãnh chúa, giáo hội",
      workers: "Nông nô, thợ thủ công, thương nhân",
      ownership: "Sở hữu phân tầng theo đẳng cấp",
    },
    keyInventions: [
      { name: "Cối xay nước", era: "~Thế kỷ VI" },
      { name: "Cày nặng", era: "~Thế kỷ IX" },
      { name: "La bàn / thuốc súng", era: "~Thế kỷ XII" },
      { name: "Máy in", era: "~1450" },
    ],
    contradictions: [
      "Đô thị và thương nhân (giai cấp tư sản sơ khai) lớn mạnh",
      "Quan hệ phong kiến trói buộc lao động và thị trường",
      "Tích luỹ tư bản nguyên thuỷ từ thương mại và thuộc địa",
    ],
    crisisDrivers: [
      "Phát kiến địa lý mở rộng thị trường thế giới",
      "Cách mạng tư sản (Hà Lan, Anh, Pháp, Mỹ)",
      "Công trường thủ công và máy móc đầu tiên",
    ],
    transition:
      "Tư sản liên minh với quần chúng lật đổ chế độ phong kiến. Lao động được “giải phóng” khỏi ruộng đất — và bị hút vào nhà máy.",
    takeaway:
      "Quyền sở hữu được thiêng hoá bằng tôn giáo và truyền thống. Nhưng thị trường, khi đủ lớn, sẽ phá vỡ mọi vành đai đẳng cấp.",
    contradictionLevel: 80,
    scene: "Lâu đài đá, cánh đồng lúa mì, tháp nhà thờ",
    glyph: "♜",
  },
  {
    id: "capitalist",
    index: 3,
    title: "Tư bản chủ nghĩa",
    subtitle: "Tư bản và lao động làm thuê",
    timeRange: "~Thế kỷ XVIII — nay",
    tagline: "Tự do bán sức lao động.",
    description:
      "Tư liệu sản xuất tập trung trong tay nhà tư bản. Người lao động về mặt pháp lý là tự do nhưng buộc phải bán sức lao động để sống. Giá trị thặng dư là động lực và nghịch lý của hệ thống.",
    productionForces: [
      "Máy hơi nước, điện, dây chuyền, tự động hoá",
      "Khoa học trở thành lực lượng sản xuất trực tiếp",
      "Sản xuất quy mô toàn cầu, chuỗi cung ứng phức tạp",
      "Tài chính hoá, dữ liệu, AI là tư liệu sản xuất mới",
    ],
    relationsOfProduction: [
      "Nhà tư bản sở hữu tư liệu sản xuất",
      "Người lao động tự do về thân thể, sở hữu sức lao động",
      "Lao động được trao đổi như hàng hoá trên thị trường",
      "Giá trị thặng dư là nguồn gốc của lợi nhuận",
    ],
    dominantClass: {
      rulers: "Giai cấp tư sản (công nghiệp, tài chính, công nghệ)",
      workers: "Giai cấp công nhân, lao động dịch vụ, lao động tri thức",
      ownership: "Sở hữu tư nhân về tư liệu sản xuất",
    },
    keyInventions: [
      { name: "Máy hơi nước", era: "1769" },
      { name: "Điện", era: "~1880" },
      { name: "Dây chuyền Ford", era: "1913" },
      { name: "Internet", era: "1990s" },
      { name: "AI tổng quát", era: "2020s" },
    ],
    contradictions: [
      "Sản xuất xã hội hoá — chiếm hữu tư nhân",
      "Khủng hoảng thừa định kỳ",
      "Bất bình đẳng tăng cùng năng suất",
      "Tự động hoá đe doạ chính khái niệm việc làm",
    ],
    crisisDrivers: [
      "Khủng hoảng tài chính và sinh thái toàn cầu",
      "AI và robot làm vỡ quan hệ tiền lương",
      "Phong trào đòi tái phân phối, công lý khí hậu",
    ],
    transition:
      "Mâu thuẫn giữa năng suất khổng lồ và phân phối bất công đặt ra yêu cầu một hình thức tổ chức mới — nơi tư liệu sản xuất phục vụ số đông.",
    takeaway:
      "Bóc lột được che bằng hợp đồng tự nguyện. Chính sự tự do hình thức đã khiến hệ thống vận hành — và cũng khiến nó dễ tổn thương.",
    contradictionLevel: 90,
    scene: "Nhà máy thép, phố tài chính, trung tâm dữ liệu",
    glyph: "⚙",
  },
  {
    id: "socialist",
    index: 4,
    title: "Cộng sản chủ nghĩa",
    subtitle: "Sở hữu chung trên nền sản xuất hiện đại",
    timeRange: "Thế kỷ XX — tương lai",
    tagline: "Mỗi người làm theo năng lực, hưởng theo lao động.",
    description:
      "Theo học thuyết Mác, hình thái cao hơn tư bản: tư liệu sản xuất chủ yếu thuộc sở hữu xã hội, sản xuất có kế hoạch hướng tới nhu cầu của số đông, từng bước xoá bỏ bóc lột và bất bình đẳng giai cấp.",
    productionForces: [
      "Kế thừa toàn bộ thành tựu khoa học — công nghệ của tư bản",
      "Tự động hoá, năng lượng tái tạo, AI phục vụ cộng đồng",
      "Sản xuất có kế hoạch kết hợp thị trường được điều tiết",
      "Hợp tác xuyên biên giới về tri thức và tài nguyên",
    ],
    relationsOfProduction: [
      "Sở hữu công cộng / xã hội về tư liệu sản xuất chủ yếu",
      "Lao động được tổ chức trên nguyên tắc hợp tác",
      "Phân phối theo lao động ở giai đoạn đầu",
      "Nhà nước phục vụ lợi ích của đa số lao động",
    ],
    dominantClass: {
      rulers: "Cộng đồng lao động có tổ chức",
      workers: "Người lao động — đồng thời là chủ sở hữu",
      ownership: "Sở hữu xã hội về tư liệu sản xuất chủ yếu",
    },
    keyInventions: [
      { name: "Năng lượng tái tạo", era: "2000s" },
      { name: "AI hợp tác", era: "2020s" },
      { name: "Mạng lưới sản xuất phân tán", era: "tương lai gần" },
    ],
    contradictions: [
      "Cân bằng giữa kế hoạch và thị trường",
      "Duy trì động lực sáng tạo khi giảm bất bình đẳng",
      "Quản trị quyền lực để tránh tha hoá bộ máy",
    ],
    crisisDrivers: [
      "Áp lực toàn cầu hoá tư bản",
      "Thách thức về hiệu quả và đổi mới",
    ],
    transition:
      "Khi năng suất đủ cao và con người phát triển toàn diện, xã hội có thể tiến tới giai đoạn cao hơn — mỗi người làm theo năng lực, hưởng theo nhu cầu.",
    takeaway:
      "Không phải điểm cuối, mà là một hướng đi: đặt sản xuất phục vụ con người, thay vì ngược lại.",
    contradictionLevel: 40,
    scene: "Thành phố xanh, lưới điện thông minh, không gian cộng đồng",
    glyph: "✦",
  },
];

export const GLOSSARY = [
  {
    term: "Lực lượng sản xuất",
    def: "Tổng hợp các yếu tố con người (người lao động với kỹ năng) và vật chất (công cụ, đối tượng lao động, công nghệ) mà xã hội sử dụng để tạo ra của cải.",
  },
  {
    term: "Quan hệ sản xuất",
    def: "Quan hệ giữa người với người trong quá trình sản xuất: quan hệ sở hữu tư liệu sản xuất, tổ chức lao động và phân phối sản phẩm.",
  },
  {
    term: "Tư liệu sản xuất",
    def: "Bao gồm đối tượng lao động (đất, nguyên liệu) và tư liệu lao động (công cụ, máy móc, nhà xưởng).",
  },
  {
    term: "Phương thức sản xuất",
    def: "Sự thống nhất giữa lực lượng sản xuất và quan hệ sản xuất ở một trình độ nhất định — đặc trưng cho mỗi hình thái kinh tế — xã hội.",
  },
  {
    term: "Giá trị thặng dư",
    def: "Phần giá trị do người lao động tạo ra vượt quá giá trị sức lao động của họ, bị nhà tư bản chiếm đoạt.",
  },
  {
    term: "Mâu thuẫn cơ bản",
    def: "Mâu thuẫn giữa trình độ phát triển của lực lượng sản xuất và tính chất của quan hệ sản xuất — động lực của lịch sử.",
  },
  {
    term: "Cách mạng xã hội",
    def: "Bước nhảy chất khi mâu thuẫn cơ bản được giải quyết bằng việc thay thế quan hệ sản xuất cũ bằng quan hệ sản xuất mới phù hợp hơn.",
  },
];

export const QUIZ = [
  {
    q: "Yếu tố nào là động lực căn bản của lịch sử theo chủ nghĩa duy vật lịch sử?",
    options: [
      "Ý chí của các vĩ nhân",
      "Mâu thuẫn giữa lực lượng sản xuất và quan hệ sản xuất",
      "Khí hậu và địa lý",
      "Tôn giáo và đạo đức",
    ],
    answer: 1,
  },
  {
    q: "Trong xã hội chiếm hữu nô lệ, ai là người sở hữu nô lệ?",
    options: ["Nhà nước", "Lãnh chúa", "Chủ nô", "Cộng đồng thị tộc"],
    answer: 2,
  },
  {
    q: "Đặc trưng của quan hệ sản xuất phong kiến là gì?",
    options: [
      "Lao động làm thuê tự do",
      "Sở hữu công cộng tư liệu sản xuất",
      "Nông nô gắn với ruộng đất của lãnh chúa",
      "Sở hữu nô lệ tuyệt đối",
    ],
    answer: 2,
  },
  {
    q: "Mâu thuẫn cơ bản của chủ nghĩa tư bản là gì?",
    options: [
      "Giữa thành thị và nông thôn",
      "Giữa sản xuất xã hội hoá và chiếm hữu tư nhân",
      "Giữa công nghiệp và nông nghiệp",
      "Giữa khoa học và tôn giáo",
    ],
    answer: 1,
  },
  {
    q: "Nguyên tắc phân phối ở giai đoạn đầu của cộng sản chủ nghĩa là gì?",
    options: [
      "Làm theo năng lực, hưởng theo nhu cầu",
      "Phân phối đều tuyệt đối",
      "Làm theo năng lực, hưởng theo lao động",
      "Tự do thị trường quyết định",
    ],
    answer: 2,
  },
];