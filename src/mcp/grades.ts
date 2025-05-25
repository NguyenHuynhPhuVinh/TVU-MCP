/**
 * Module công cụ xem điểm học tập
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TvuApiClient } from "../api/api.js";
import { ENV } from "../config/config.js";

/**
 * Đăng ký công cụ xem điểm học tập
 * @param server Server MCP
 * @param apiClient Client API TVU
 */
export function registerGradesTools(server: McpServer, apiClient: TvuApiClient) {
  // Đăng ký công cụ xem điểm học tập
  server.tool(
    "getGrades",
    "Xem điểm học tập",
    {
      showByRegSemester: z
        .boolean()
        .optional()
        .describe("Hiển thị môn theo học kỳ đăng ký (mặc định: false)"),
    },
    async ({ showByRegSemester }) => {
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

        const gradesData = await apiClient.getGrades(showByRegSemester || false);

        // Tạo nội dung hiển thị
        let gradesText = "# Bảng điểm học tập\n\n";

        if (
          !gradesData.data ||
          !gradesData.data.ds_diem_hocky ||
          gradesData.data.ds_diem_hocky.length === 0
        ) {
          gradesText += "Không có dữ liệu điểm học tập.";
        } else {
          // Thông tin điểm tích lũy
          gradesText += `## Thông tin chung\n\n`;
          gradesText += `- Điểm trung bình tích lũy (hệ 10): **${gradesData.data.ds_diem_hocky[0].dtb_tich_luy_he_10}**\n`;
          gradesText += `- Điểm trung bình tích lũy (hệ 4): **${gradesData.data.ds_diem_hocky[0].dtb_tich_luy_he_4}**\n`;
          gradesText += `- Số tín chỉ tích lũy: **${gradesData.data.ds_diem_hocky[0].so_tin_chi_dat_tich_luy}**\n\n`;

          // Hiển thị điểm theo từng học kỳ
          for (const hocKy of gradesData.data.ds_diem_hocky) {
            gradesText += `## ${hocKy.ten_hoc_ky}\n\n`;
            
            // Thông tin học kỳ
            if (hocKy.dtb_hk_he10) {
              gradesText += `- Điểm trung bình học kỳ (hệ 10): **${hocKy.dtb_hk_he10}**\n`;
              gradesText += `- Điểm trung bình học kỳ (hệ 4): **${hocKy.dtb_hk_he4}**\n`;
              gradesText += `- Số tín chỉ đạt: **${hocKy.so_tin_chi_dat_hk}**\n`;
              gradesText += `- Xếp loại: **${hocKy.xep_loai_tkb_hk}**\n\n`;
            }

            // Bảng điểm chi tiết
            gradesText += "| STT | Mã môn | Tên môn | Số TC | Điểm thi | Điểm TK | Điểm chữ | Kết quả |\n";
            gradesText += "|-----|--------|---------|-------|----------|---------|----------|---------|\n";

            let stt = 1;
            for (const monHoc of hocKy.ds_diem_mon_hoc) {
              const ketQua = monHoc.ket_qua === 1 ? "✅ Đạt" : "❌ Không đạt";
              gradesText += `| ${stt} | ${monHoc.ma_mon} | ${monHoc.ten_mon} | ${monHoc.so_tin_chi} | ${monHoc.diem_thi || ""} | ${monHoc.diem_tk || ""} | ${monHoc.diem_tk_chu || ""} | ${ketQua} |\n`;
              stt++;
            }
            gradesText += "\n";
          }
        }

        return {
          content: [
            {
              type: "text",
              text: gradesText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy điểm học tập:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy điểm học tập: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
