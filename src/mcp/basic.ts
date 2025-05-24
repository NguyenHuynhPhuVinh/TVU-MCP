/**
 * Module đăng ký công cụ MCP cơ bản
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ENV } from "../config/config.js";

/**
 * Đăng ký các công cụ MCP cơ bản
 * @param server Server MCP
 */
export function registerBasicTools(server: McpServer) {
  // Đăng ký công cụ hello
  server.tool("hello", "Trả về lời chào đơn giản", {}, async () => {
    return {
      content: [
        {
          type: "text",
          text: "Xin chào từ TVU-MCP Server!",
        },
      ],
    };
  });

  // Đăng ký công cụ giới thiệu
  server.tool("introduction", "Giới thiệu về TVU-MCP Server", {}, async () => {
    return {
      content: [
        {
          type: "text",
          text: `# TVU-MCP Server

TVU-MCP là một Model Context Protocol (MCP) server hỗ trợ tra cứu lịch học và điểm của sinh viên Trường Đại học Trà Vinh (TVU).

## Các công cụ có sẵn

### Công cụ cơ bản
- **hello**: Trả về lời chào đơn giản
- **introduction**: Giới thiệu về TVU-MCP Server
- **getCredentials**: Kiểm tra thông tin đăng nhập hiện tại

### Công cụ tra cứu thông tin
- **getSchedule**: Xem thời khóa biểu
- **getTodaySchedule**: Xem thời khóa biểu hôm nay
- **getTomorrowSchedule**: Xem thời khóa biểu ngày mai
- **getGrades**: Xem điểm
- **getStudentInfo**: Xem thông tin sinh viên
- **getExamSchedule**: Xem lịch thi

## Cách sử dụng
Để sử dụng TVU-MCP, bạn cần cấu hình thông tin đăng nhập MSSV và mật khẩu trong file .env`,
        },
      ],
    };
  });

  // Đăng ký công cụ kiểm tra thông tin đăng nhập
  server.tool("getCredentials", "Kiểm tra thông tin đăng nhập hiện tại", {}, async () => {
    const mssv = ENV.MSSV;
    const password = ENV.PASSWORD ? "*****" : ""; // Ẩn mật khẩu

    if (!mssv || !ENV.PASSWORD) {
      return {
        content: [
          {
            type: "text",
            text: `# Thông tin đăng nhập chưa được cấu hình

Vui lòng cấu hình thông tin đăng nhập trong file .env:

\`\`\`
MSSV=mã_số_sinh_viên
PASSWORD=mật_khẩu
\`\`\``,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `# Thông tin đăng nhập hiện tại

- **MSSV**: ${mssv}
- **Mật khẩu**: ${password}

Nếu muốn thay đổi thông tin đăng nhập, vui lòng cập nhật file .env`,
        },
      ],
    };
  });
}
