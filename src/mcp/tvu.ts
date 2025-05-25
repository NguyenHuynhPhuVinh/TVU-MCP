/**
 * Module đăng ký công cụ MCP cho TVU
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TvuApiClient } from "../api/api.js";
import { API_CONFIG } from "../api/constants.js";
import { ENV } from "../config/config.js";
import { registerGradesTools } from "./grades.js";
import { registerTuitionTools } from "./tuition.js";
import { registerCurriculumTools } from "./curriculum.js";
import { registerStudentInfoTools } from "./student-info.js";
import { registerPostsTools } from "./posts.js";

/**
 * Đăng ký các công cụ MCP cho TVU
 * @param server Server MCP
 */
export function registerTvuTools(server: McpServer) {
  // Khởi tạo API client
  const apiClient = new TvuApiClient();
  
  // Đăng ký công cụ xem điểm học tập
  registerGradesTools(server, apiClient);
  
  // Đăng ký công cụ xem học phí
  registerTuitionTools(server, apiClient);
  
  // Đăng ký công cụ xem chương trình đào tạo
  registerCurriculumTools(server, apiClient);
  
  // Đăng ký công cụ xem thông tin sinh viên
  registerStudentInfoTools(server, apiClient);
  
  // Đăng ký công cụ xem bài đăng (thông báo, hướng dẫn, biểu mẫu)
  registerPostsTools(server, apiClient);

  // Đăng ký công cụ xem thời khóa biểu
  server.tool(
    "getSchedule",
    "Xem thời khóa biểu theo học kỳ",
    {
      semester: z
        .string()
        .optional()
        .describe("Mã học kỳ (mặc định là học kỳ hiện tại)"),
      date: z
        .string()
        .optional()
        .describe("Ngày cụ thể muốn xem (dạng YYYY-MM-DD)"),
    },
    async ({ semester, date }) => {
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

        const scheduleData = await apiClient.getSchedule(
          semester || API_CONFIG.CURRENT_SEMESTER
        );

        // Tạo nội dung hiển thị
        let scheduleText = "";

        // Nếu có tham số ngày cụ thể, chỉ hiển thị thời khóa biểu của ngày đó
        if (date) {
          const targetDate = new Date(date);
          const targetDateString = `${targetDate.getFullYear()}-${String(
            targetDate.getMonth() + 1
          ).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}`;

          scheduleText = `# Thời khóa biểu ngày ${targetDate.toLocaleDateString(
            "vi-VN",
            { weekday: "long", year: "numeric", month: "long", day: "numeric" }
          )}\n\n`;

          let foundSchedule = false;

          for (const tuan of scheduleData.data.ds_tuan_tkb) {
            if (!tuan.ds_thoi_khoa_bieu) continue;

            // Tìm kiếm môn học có ngày học trùng với ngày được chỉ định
            const lichHocNgay = tuan.ds_thoi_khoa_bieu.filter((monHoc: any) => {
              // Cách 1: So sánh chuỗi trực tiếp
              const ketQua1 = monHoc.ngay_hoc === targetDateString;

              // Cách 2: So sánh ngày tháng năm
              const ngayHoc = new Date(monHoc.ngay_hoc);
              const ketQua2 =
                ngayHoc.getDate() === targetDate.getDate() &&
                ngayHoc.getMonth() === targetDate.getMonth() &&
                ngayHoc.getFullYear() === targetDate.getFullYear();

              return ketQua1 || ketQua2;
            });

            if (lichHocNgay.length > 0) {
              foundSchedule = true;

              // Sắp xếp theo tiết học
              lichHocNgay.sort(
                (a: any, b: any) => a.tiet_bat_dau - b.tiet_bat_dau
              );

              for (const monHoc of lichHocNgay as any[]) {
                scheduleText += `- **${monHoc.ten_mon}**\n`;
                scheduleText += `  - 👨‍🏫 GV: ${monHoc.ten_giang_vien}\n`;
                scheduleText += `  - 🏢 Phòng: ${monHoc.ma_phong}\n`;
                scheduleText += `  - ⏰ Tiết ${monHoc.tiet_bat_dau}-${
                  monHoc.tiet_bat_dau + monHoc.so_tiet - 1
                }\n\n`;
              }
            }
          }

          if (!foundSchedule) {
            scheduleText += "Không có lịch học trong ngày này.";
          }

          return {
            content: [
              {
                type: "text",
                text: scheduleText,
              },
            ],
          };
        }

        // Nếu không có tham số ngày cụ thể, hiển thị toàn bộ thời khóa biểu của học kỳ
        scheduleText = `# Thời khóa biểu ${
          semester || API_CONFIG.CURRENT_SEMESTER
        }\n\n`;

        if (
          !scheduleData.data ||
          !scheduleData.data.ds_tuan_tkb ||
          scheduleData.data.ds_tuan_tkb.length === 0
        ) {
          scheduleText += "Không có dữ liệu thời khóa biểu cho học kỳ này.";
        } else {
          // Sắp xếp theo tuần
          for (const tuan of scheduleData.data.ds_tuan_tkb) {
            scheduleText += `## ${tuan.ten_tuan} (${tuan.ngay_bat_dau} đến ${tuan.ngay_ket_thuc})\n\n`;

            if (
              !tuan.ds_thoi_khoa_bieu ||
              tuan.ds_thoi_khoa_bieu.length === 0
            ) {
              scheduleText += "Không có lịch học trong tuần này.\n\n";
              continue;
            }

            // Sắp xếp theo ngày học
            const monHocTheoNgay = new Map<string, any[]>();

            for (const monHoc of tuan.ds_thoi_khoa_bieu) {
              if (!monHocTheoNgay.has(monHoc.ngay_hoc)) {
                monHocTheoNgay.set(monHoc.ngay_hoc, []);
              }
              monHocTheoNgay.get(monHoc.ngay_hoc)?.push(monHoc);
            }

            // Hiển thị theo ngày học
            for (const [ngayHoc, danhSachMon] of monHocTheoNgay.entries()) {
              // Định dạng ngày
              const date = new Date(ngayHoc);
              const ngay = date.toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });

              scheduleText += `### ${ngay}\n\n`;

              // Sắp xếp theo tiết học
              danhSachMon.sort(
                (a: any, b: any) => a.tiet_bat_dau - b.tiet_bat_dau
              );

              for (const monHoc of danhSachMon as any[]) {
                scheduleText += `- **${monHoc.ten_mon}**\n`;
                scheduleText += `  - 👨‍🏫 GV: ${monHoc.ten_giang_vien}\n`;
                scheduleText += `  - 🏢 Phòng: ${monHoc.ma_phong}\n`;
                scheduleText += `  - ⏰ Tiết ${monHoc.tiet_bat_dau}-${
                  monHoc.tiet_bat_dau + monHoc.so_tiet - 1
                }\n\n`;
              }
            }
          }
        }

        return {
          content: [
            {
              type: "text",
              text: scheduleText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy thời khóa biểu:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy thời khóa biểu: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Đăng ký công cụ xem thời khóa biểu hôm nay
  server.tool(
    "getTodaySchedule",
    "Xem thời khóa biểu hôm nay",
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

        const scheduleData = await apiClient.getSchedule();

        // Lấy ngày hôm nay
        const today = new Date();


        // Định dạng YYYY-MM-DD với múi giờ địa phương
        const todayString = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;


        // Tạo nội dung hiển thị
        let scheduleText = `# Thời khóa biểu hôm nay (${today.toLocaleDateString(
          "vi-VN",
          { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        )})\n\n`;

        if (
          !scheduleData.data ||
          !scheduleData.data.ds_tuan_tkb ||
          scheduleData.data.ds_tuan_tkb.length === 0
        ) {
          scheduleText += "Không có dữ liệu thời khóa biểu.";
        } else {
          let foundSchedule = false;

          // Tìm lịch học hôm nay
          for (const tuan of scheduleData.data.ds_tuan_tkb) {
            if (!tuan.ds_thoi_khoa_bieu) continue;



            // Tìm kiếm môn học có ngày học trùng với ngày hôm nay
            // Thử cả hai cách: so sánh chuỗi và so sánh ngày tháng năm
            const lichHocHomNay = tuan.ds_thoi_khoa_bieu.filter(
              (monHoc: any) => {
                // Cách 1: So sánh chuỗi trực tiếp
                const ketQua1 = monHoc.ngay_hoc === todayString;

                // Cách 2: So sánh ngày tháng năm
                const ngayHoc = new Date(monHoc.ngay_hoc);
                const ketQua2 =
                  ngayHoc.getDate() === today.getDate() &&
                  ngayHoc.getMonth() === today.getMonth() &&
                  ngayHoc.getFullYear() === today.getFullYear();


                // Sử dụng cả hai cách để đảm bảo tìm được môn học
                return ketQua1 || ketQua2;
              }
            );


            if (lichHocHomNay.length > 0) {
              foundSchedule = true;

              // Sắp xếp theo tiết học
              lichHocHomNay.sort(
                (a: any, b: any) => a.tiet_bat_dau - b.tiet_bat_dau
              );

              for (const monHoc of lichHocHomNay as any[]) {
                scheduleText += `- **${monHoc.ten_mon}**\n`;
                scheduleText += `  - 👨‍🏫 GV: ${monHoc.ten_giang_vien}\n`;
                scheduleText += `  - 🏢 Phòng: ${monHoc.ma_phong}\n`;
                scheduleText += `  - ⏰ Tiết ${monHoc.tiet_bat_dau}-${
                  monHoc.tiet_bat_dau + monHoc.so_tiet - 1
                }\n\n`;
              }
            }
          }

          if (!foundSchedule) {
            scheduleText += "Hôm nay không có lịch học.";
          }
        }

        return {
          content: [
            {
              type: "text",
              text: scheduleText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy thời khóa biểu hôm nay:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy thời khóa biểu hôm nay: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Đăng ký công cụ xem thời khóa biểu ngày mai
  server.tool(
    "getTomorrowSchedule",
    "Xem thời khóa biểu ngày mai",
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

        const scheduleData = await apiClient.getSchedule();

        // Lấy ngày mai
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);


        // Định dạng YYYY-MM-DD với múi giờ địa phương
        const tomorrowString = `${tomorrow.getFullYear()}-${String(
          tomorrow.getMonth() + 1
        ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;


        // Tạo nội dung hiển thị
        let scheduleText = `# Thời khóa biểu ngày mai (${tomorrow.toLocaleDateString(
          "vi-VN",
          { weekday: "long", year: "numeric", month: "long", day: "numeric" }
        )})\n\n`;

        if (
          !scheduleData.data ||
          !scheduleData.data.ds_tuan_tkb ||
          scheduleData.data.ds_tuan_tkb.length === 0
        ) {
          scheduleText += "Không có dữ liệu thời khóa biểu.";
        } else {
          let foundSchedule = false;

          // Tìm lịch học ngày mai
          for (const tuan of scheduleData.data.ds_tuan_tkb) {
            if (!tuan.ds_thoi_khoa_bieu) continue;

            // Tìm kiếm môn học có ngày học trùng với ngày mai
            // Thử cả hai cách: so sánh chuỗi và so sánh ngày tháng năm
            const lichHocNgayMai = tuan.ds_thoi_khoa_bieu.filter(
              (monHoc: any) => {
                // Cách 1: So sánh chuỗi trực tiếp
                const ketQua1 = monHoc.ngay_hoc === tomorrowString;

                // Cách 2: So sánh ngày tháng năm
                const ngayHoc = new Date(monHoc.ngay_hoc);
                const ketQua2 =
                  ngayHoc.getDate() === tomorrow.getDate() &&
                  ngayHoc.getMonth() === tomorrow.getMonth() &&
                  ngayHoc.getFullYear() === tomorrow.getFullYear();


                // Sử dụng cả hai cách để đảm bảo tìm được môn học
                return ketQua1 || ketQua2;
              }
            );


            if (lichHocNgayMai.length > 0) {
              foundSchedule = true;

              // Sắp xếp theo tiết học
              lichHocNgayMai.sort(
                (a: any, b: any) => a.tiet_bat_dau - b.tiet_bat_dau
              );

              for (const monHoc of lichHocNgayMai as any[]) {
                scheduleText += `- **${monHoc.ten_mon}**\n`;
                scheduleText += `  - 👨‍🏫 GV: ${monHoc.ten_giang_vien}\n`;
                scheduleText += `  - 🏢 Phòng: ${monHoc.ma_phong}\n`;
                scheduleText += `  - ⏰ Tiết ${monHoc.tiet_bat_dau}-${
                  monHoc.tiet_bat_dau + monHoc.so_tiet - 1
                }\n\n`;
              }
            }
          }

          if (!foundSchedule) {
            scheduleText += "Ngày mai không có lịch học.";
          }
        }

        return {
          content: [
            {
              type: "text",
              text: scheduleText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy thời khóa biểu ngày mai:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy thời khóa biểu ngày mai: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
