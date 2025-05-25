/**
 * Module công cụ xem thông tin sinh viên
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TvuApiClient } from "../api/api.js";
import { ENV } from "../config/config.js";

/**
 * Đăng ký công cụ xem thông tin sinh viên
 * @param server Server MCP
 * @param apiClient Client API TVU
 */
export function registerStudentInfoTools(server: McpServer, apiClient: TvuApiClient) {
  // Đăng ký công cụ xem thông tin sinh viên
  server.tool(
    "getStudentInfo",
    "Xem thông tin sinh viên",
    {},
    async () => {
      try {
        // Kiểm tra thông tin đăng nhập
        if (!ENV.MSSV || !ENV.PASSWORD) {
          return {
            content: [
              {
                type: "text",
                text: "⚠️ Chưa cấu hình thông tin đăng nhập. Vui lòng cập nhật file .env với MSSV và PASSWORD.",
              },
            ],
          };
        }

        const studentData = await apiClient.getStudentInfo();

        // Kiểm tra dữ liệu
        if (!studentData.data) {
          return {
            content: [
              {
                type: "text",
                text: "❌ Không thể lấy thông tin sinh viên. Vui lòng thử lại sau.",
              },
            ],
          };
        }

        const data = studentData.data;
        
        // Tạo nội dung hiển thị
        let infoText = "# Thông tin sinh viên\n\n";
        
        // Thông tin cá nhân
        infoText += "## Thông tin cá nhân\n\n";
        infoText += `- **Họ và tên:** ${data.ten_day_du}\n`;
        infoText += `- **Mã sinh viên:** ${data.ma_sv}\n`;
        infoText += `- **Giới tính:** ${data.gioi_tinh}\n`;
        infoText += `- **Ngày sinh:** ${data.ngay_sinh}\n`;
        infoText += `- **Nơi sinh:** ${data.noi_sinh}\n`;
        infoText += `- **Dân tộc:** ${data.dan_toc}\n`;
        infoText += `- **Tôn giáo:** ${data.ton_giao}\n`;
        infoText += `- **Quốc tịch:** ${data.quoc_tich}\n`;
        infoText += `- **Số CMND/CCCD:** ${data.so_cmnd}\n`;
        infoText += `- **Email:** ${data.email}\n`;
        if (data.email2) {
          infoText += `- **Email phụ:** ${data.email2}\n`;
        }
        infoText += "\n";
        
        // Thông tin hộ khẩu
        infoText += "## Thông tin hộ khẩu\n\n";
        infoText += `- **Địa chỉ:** ${data.ho_khau_thuong_tru_gd}\n`;
        infoText += `- **Quận/Huyện:** ${data.ho_khau_quan_huyen}\n`;
        infoText += `- **Tỉnh/Thành phố:** ${data.ho_khau_tinh_thanh}\n\n`;
        
        // Thông tin học tập
        infoText += "## Thông tin học tập\n\n";
        infoText += `- **Lớp:** ${data.lop}\n`;
        infoText += `- **Khối:** ${data.khoi}\n`;
        infoText += `- **Ngành:** ${data.nganh}\n`;
        if (data.chuyen_nganh) {
          infoText += `- **Chuyên ngành:** ${data.chuyen_nganh}\n`;
        }
        infoText += `- **Khoa:** ${data.khoa}\n`;
        infoText += `- **Bậc đào tạo:** ${data.bac_he_dao_tao}\n`;
        infoText += `- **Niên khóa:** ${data.nien_khoa}\n`;
        infoText += `- **Thời gian vào:** ${data.str_nhhk_vao}\n`;
        infoText += `- **Thời gian ra (dự kiến):** ${data.str_nhhk_ra}\n`;
        infoText += `- **Trạng thái:** ${data.hien_dien_sv}\n\n`;
        
        // Thông tin CVHT
        if (data.ho_ten_cvht) {
          infoText += "## Thông tin cố vấn học tập\n\n";
          infoText += `- **Mã CVHT:** ${data.ma_cvht}\n`;
          infoText += `- **Họ tên CVHT:** ${data.ho_ten_cvht}\n`;
          if (data.email_cvht) {
            infoText += `- **Email CVHT:** ${data.email_cvht}\n`;
          }
          if (data.dien_thoai_cvht) {
            infoText += `- **Điện thoại CVHT:** ${data.dien_thoai_cvht}\n`;
          }
          infoText += "\n";
        }
        
        // Thông tin trường
        infoText += "## Thông tin trường\n\n";
        infoText += `- **Mã trường:** ${data.ma_truong}\n`;
        infoText += `- **Tên trường:** ${data.ten_truong}\n`;
        
        // Thời gian cập nhật
        infoText += `\n\n*Dữ liệu được cập nhật lúc: ${data.thoi_gian_get_data}*`;

        return {
          content: [
            {
              type: "text",
              text: infoText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy thông tin sinh viên:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy thông tin sinh viên: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
