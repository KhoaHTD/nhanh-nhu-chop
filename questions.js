// ====== CẤU HÌNH GAME ======
window.GAME_CONFIG = {
  subtitle: 'Khám phá sự biến đổi xã hội nông thôn',
  timePerQuestion: 15,   // số giây cho mỗi câu
  autoStartTimer: false  // true = tự chạy đồng hồ khi hiện câu hỏi
};

// ====== DANH SÁCH 10 CÂU HỎI ======
// Mỗi câu: { level, question, options: [A, B, C, D], correct: chỉ số đáp án đúng (0 = A, 1 = B, 2 = C, 3 = D) }
// Có thể thêm image: "duong-dan-anh.jpg" nếu muốn hiện ảnh.
window.QUESTIONS = [
  {
    level: 'Dễ',
    question: 'Biến đổi xã hội là gì?',
    options: [
      'Sự thay đổi của tự nhiên theo thời gian.',
      'Sự thay đổi đáng kể của cấu trúc, thiết chế, văn hóa và hành vi xã hội.',
      'Sự thay đổi về dân số mà thôi.',
      'Sự phát triển kinh tế của một quốc gia.'
    ],
    correct: 1
  },
  {
    level: 'Dễ',
    question: 'Đặc điểm nào cho thấy mọi xã hội đều luôn vận động và thay đổi?',
    options: ['Tính phổ quát.', 'Tính ổn định.', 'Tính đồng nhất.', 'Tính khép kín.'],
    correct: 0
  },
  {
    level: 'Trung bình',
    question: 'Chương trình chuyển đổi số quốc gia là ví dụ của dạng biến đổi nào?',
    options: ['Biến đổi không có kế hoạch.', 'Biến đổi ngoại xã hội.', 'Biến đổi có hoạch định.', 'Biến đổi tự phát.'],
    correct: 2
  },
  {
    level: 'Trung bình',
    question: 'Yếu tố nào sau đây có thể thúc đẩy biến đổi xã hội?',
    options: [
      'Chỉ có yếu tố kinh tế.',
      'Chỉ có yếu tố dân số.',
      'Chỉ có môi trường tự nhiên.',
      'Văn hóa, dân số, môi trường tự nhiên và khoa học – công nghệ.'
    ],
    correct: 3
  },
  {
    level: 'Trung bình',
    question: 'Công nghiệp hóa – hiện đại hóa làm cơ cấu nghề nghiệp nông thôn thay đổi theo hướng nào?',
    options: [
      'Chỉ tập trung vào sản xuất nông nghiệp.',
      'Đa dạng hơn, tăng các hoạt động công nghiệp và dịch vụ.',
      'Xóa bỏ hoàn toàn hoạt động nông nghiệp.',
      'Giảm các cơ hội việc làm phi nông nghiệp.'
    ],
    correct: 1
  },
  {
    level: 'Trung bình',
    question: 'Chuyển đổi số giúp người nông dân thay đổi điều gì?',
    options: [
      'Chỉ sản xuất và bán hàng trong phạm vi địa phương.',
      'Không còn phụ thuộc vào thị trường.',
      'Tiếp cận thông tin, quảng bá và tiêu thụ nông sản qua nền tảng số.',
      'Không cần kiến thức và kinh nghiệm sản xuất.'
    ],
    correct: 2
  },
  {
    level: 'Khó',
    question: 'Tại Đồng Tháp, mô hình Hội quán nông dân hoạt động theo nguyên tắc nào?',
    options: [
      '3 Không – 3 Tự – 3 Cùng.',
      '3 Có – 3 Chung – 3 Đều.',
      '3 Tập trung – 3 Quản lý – 3 Phát triển.',
      '3 Hỗ trợ – 3 Liên kết – 3 Chia sẻ.'
    ],
    correct: 0
  },
  {
    level: 'Khó',
    question: 'Sự thay đổi nào thể hiện rõ nhất quá trình biến đổi thiết chế kinh tế ở Đồng Tháp?',
    options: [
      'Từ liên kết sản xuất sang sản xuất hoàn toàn độc lập.',
      'Từ sản xuất nông nghiệp sang ngừng sản xuất nông nghiệp.',
      'Từ quan hệ kinh tế đa chủ thể sang chỉ còn quan hệ giữa nông dân với thương lái.',
      'Từ giao dịch riêng lẻ sang liên kết giữa nông hộ, HTX, doanh nghiệp và thị trường.'
    ],
    correct: 3
  },
  {
    level: 'Khó',
    question: 'Việc cha mẹ đi làm xa, con ở lại quê do ông bà chăm sóc phản ánh sự biến đổi nào?',
    options: [
      'Biến đổi phương thức tiêu thụ nông sản.',
      'Biến đổi cấu trúc và cách thức tổ chức gia đình.',
      'Biến đổi cơ sở hạ tầng giáo dục.',
      'Biến đổi phương thức sản xuất nông nghiệp.'
    ],
    correct: 1
  },
  {
    level: 'Khó',
    question: 'Thách thức xã hội nào có thể phát sinh từ quá trình chuyển đổi số ở nông thôn?',
    options: [
      'Tất cả người dân đều có khả năng tiếp cận công nghệ như nhau.',
      'Công nghệ làm mất hoàn toàn các quan hệ xã hội trực tiếp.',
      'Chênh lệch giữa các nhóm dân cư về khả năng tiếp cận và sử dụng công nghệ.',
      'Người dân không còn cần học hỏi kỹ năng mới.'
    ],
    correct: 2
  }
];
