/**
 * Module công cụ xem chương trình đào tạo
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TvuApiClient } from "../api/api.js";
import { ENV } from "../config/config.js";

/**
 * Đăng ký công cụ xem chương trình đào tạo
 * @param server Server MCP
 * @param apiClient Client API TVU
 */
export function registerCurriculumTools(server: McpServer, apiClient: TvuApiClient) {
  // Đăng ký công cụ xem chương trình đào tạo
  server.tool(
    "getCurriculum",
    "Xem chương trình đào tạo",
    {
      programType: z
        .number()
        .optional()
        .describe("Loại chương trình đào tạo (mặc định: 2)"),
      semester: z
        .string()
        .optional()
        .describe("Mã học kỳ cụ thể muốn xem (ví dụ: 20242)"),
    },
    async ({ programType, semester }) => {
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

        const curriculumData = await apiClient.getCurriculum(programType || 2);

        // Tạo nội dung hiển thị
        let curriculumText = "# Chương trình đào tạo\n\n";

        if (
          !curriculumData.data ||
          !curriculumData.data.ds_CTDT_hocky ||
          curriculumData.data.ds_CTDT_hocky.length === 0
        ) {
          curriculumText += "Không có dữ liệu chương trình đào tạo.";
        } else {
          // Thông tin ngành học
          if (curriculumData.data.ds_nganh_sinh_vien && curriculumData.data.ds_nganh_sinh_vien.length > 0) {
            curriculumText += "## Thông tin ngành học\n\n";
            for (const nganh of curriculumData.data.ds_nganh_sinh_vien) {
              curriculumText += `- Ngành: **${nganh.ten_nganh}** (${nganh.ma_nganh})\n`;
            }
            curriculumText += "\n";
          }

          // Lọc học kỳ nếu có tham số semester
          const dsHocKy = semester 
            ? curriculumData.data.ds_CTDT_hocky.filter((hk: any) => hk.hoc_ky === semester)
            : curriculumData.data.ds_CTDT_hocky;

          // Hiển thị theo từng học kỳ
          for (const hocKy of dsHocKy) {
            curriculumText += `## ${hocKy.ten_hoc_ky}\n\n`;

            if (!hocKy.ds_CTDT_mon_hoc || hocKy.ds_CTDT_mon_hoc.length === 0) {
              curriculumText += "Không có môn học trong học kỳ này.\n\n";
              continue;
            }

            // Bảng môn học
            curriculumText += "| STT | Mã môn | Tên môn | Số TC | Bắt buộc | Đã học | Đã đạt | Lý thuyết | Thực hành | Tổng tiết |\n";
            curriculumText += "|-----|--------|---------|-------|----------|--------|--------|-----------|-----------|------------|\n";

            let stt = 1;
            for (const monHoc of hocKy.ds_CTDT_mon_hoc) {
              const batBuoc = monHoc.mon_bat_buoc === "x" ? "✅" : "";
              const daHoc = monHoc.mon_da_hoc === "x" ? "✅" : "";
              const daDat = monHoc.mon_da_dat === "x" ? "✅" : "";

              curriculumText += `| ${stt} | ${monHoc.ma_mon} | ${monHoc.ten_mon} | ${monHoc.so_tin_chi} | ${batBuoc} | ${daHoc} | ${daDat} | ${monHoc.ly_thuyet || 0} | ${monHoc.thuc_hanh || 0} | ${monHoc.tong_tiet || 0} |\n`;
              stt++;
            }
            curriculumText += "\n";
          }
        }

        return {
          content: [
            {
              type: "text",
              text: curriculumText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy thông tin chương trình đào tạo:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy thông tin chương trình đào tạo: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
