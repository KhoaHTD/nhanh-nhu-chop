// ====== CẤU HÌNH GAME ======
window.GAME_CONFIG = {
  timePerQuestion: 10,   // số giây cho mỗi câu
  autoStartTimer: false  // true = tự chạy đồng hồ khi hiện câu hỏi
};

// ====== DANH SÁCH 10 CÂU HỎI ======
// Thay nội dung bên dưới bằng câu hỏi thật.
// Mỗi câu: { question: "...", answer: "...", image: "duong-dan-anh.jpg" (không bắt buộc) }
window.QUESTIONS = [
  { question: "Thủ đô của Việt Nam là gì?", answer: "Hà Nội" },
  { question: "1 giờ có bao nhiêu phút?", answer: "60 phút" },
  { question: "Con vật nào được gọi là \"chúa sơn lâm\"?", answer: "Con hổ" },
  { question: "Hành tinh nào gần Mặt Trời nhất?", answer: "Sao Thủy" },
  { question: "Nước sôi ở bao nhiêu độ C (ở áp suất thường)?", answer: "100 độ C" },
  { question: "Truyện Kiều do ai sáng tác?", answer: "Nguyễn Du" },
  { question: "Một tuần có mấy ngày?", answer: "7 ngày" },
  { question: "Đại dương lớn nhất thế giới là?", answer: "Thái Bình Dương" },
  { question: "5 x 8 bằng bao nhiêu?", answer: "40" },
  { question: "Màu chủ đạo của game này là gì?", answer: "Xanh lá và đen" }
];
