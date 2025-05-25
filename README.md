# TVU-MCP

![Version](https://img.shields.io/badge/version-1.0.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📚 Giới thiệu

TVU-MCP là một công cụ Model Context Protocol (MCP) giúp sinh viên Đại học Trà Vinh (TVU) tra cứu thông tin học tập như điểm số, lịch học, học phí và nhiều thông tin khác một cách nhanh chóng và tiện lợi thông qua Claude Desktop.

## ✨ Tính năng

- **Xem điểm học tập**: Hiển thị bảng điểm chi tiết theo từng học kỳ, điểm trung bình tích lũy, số tín chỉ đạt được
- **Xem thông tin học phí**: Hiển thị chi tiết học phí theo từng học kỳ, số tiền đã đóng, còn nợ
- **Xem chương trình đào tạo**: Hiển thị toàn bộ chương trình học theo từng học kỳ, các môn đã học và chưa học
- **Xem thông tin sinh viên**: Hiển thị thông tin cá nhân, thông tin học tập của sinh viên
- **Xem thời khóa biểu**: Hiển thị lịch học theo ngày hoặc học kỳ
- **Xem thông báo, hướng dẫn, biểu mẫu**: Hiển thị các thông báo và tài liệu từ trường

## 🚀 Cài đặt

### Cài đặt thông qua NPM

```bash
npm install -g @tomisakae/tvu-mcp
```

### Cấu hình với Model Context Protocol (MCP)

#### Claude Desktop

1. Mở Claude Desktop và vào Settings
2. Chọn mục Developer và bật Developer Mode
3. Tìm file cấu hình tại:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
4. Thêm cấu hình MCP vào file:

```json
{
  "mcpServers": {
    "TVU-MCP": {
      "command": "npx",
      "args": ["-y", "@tomisakae/tvu-mcp"],
      "env": {
        "MSSV": "YOUR_STUDENT_ID",
        "PASSWORD": "YOUR_PASSWORD"
      }
    }
  }
}
```

> **Lưu ý**: Thay `YOUR_STUDENT_ID` và `YOUR_PASSWORD` bằng thông tin đăng nhập của bạn vào hệ thống TVU.

## 🔧 Sử dụng

Sau khi cấu hình xong, bạn có thể sử dụng các công cụ sau trong Claude Desktop:

- `getGrades` - Xem điểm học tập
- `getTuition` - Xem thông tin học phí
- `getCurriculum` - Xem chương trình đào tạo
- `getStudentInfo` - Xem thông tin sinh viên
- `getSchedule` - Xem thời khóa biểu theo học kỳ
- `getTodaySchedule` - Xem thời khóa biểu hôm nay
- `getTomorrowSchedule` - Xem thời khóa biểu ngày mai
- `getNotifications` - Xem thông báo
- `getGuides` - Xem hướng dẫn
- `getForms` - Xem biểu mẫu
- `getAllPosts` - Xem tất cả bài đăng

## 🛠️ Phát triển

### Yêu cầu

- Node.js (>= 16.x)
- npm hoặc yarn

### Cài đặt môi trường phát triển

```bash
# Clone repository
git clone https://github.com/TomiSakae/TVU-MCP.git
cd TVU-MCP

# Cài đặt dependencies
npm install

# Build project
npm run build

# Chạy ở chế độ development
npm run dev
```

## 📄 Giấy phép

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👨‍💻 Tác giả

- **TomiSakae** - [GitHub](https://github.com/TomiSakae)

## 🙏 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng tạo issue hoặc pull request nếu bạn muốn cải thiện dự án.
