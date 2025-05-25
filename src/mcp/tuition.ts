/**
 * Module công cụ xem học phí
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TvuApiClient } from "../api/api.js";
import { ENV } from "../config/config.js";

/**
 * Đăng ký công cụ xem học phí
 * @param server Server MCP
 * @param apiClient Client API TVU
 */
export function registerTuitionTools(server: McpServer, apiClient: TvuApiClient) {
  // Đăng ký công cụ xem học phí
  server.tool(
    "getTuition",
    "Xem thông tin học phí",
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

        const tuitionData = await apiClient.getTuition();

        // Tạo nội dung hiển thị
        let tuitionText = "# Thông tin học phí\n\n";

        if (
          !tuitionData.data ||
          !tuitionData.data.ds_hoc_phi_hoc_ky ||
          tuitionData.data.ds_hoc_phi_hoc_ky.length === 0
        ) {
          tuitionText += "Không có dữ liệu học phí.";
        } else {
          // Bảng học phí
          tuitionText += "| Học kỳ | Học phí | Miễn giảm | Phải thu | Đã thu | Còn nợ |\n";
          tuitionText += "|--------|---------|-----------|----------|--------|--------|\n";

          let tongHocPhi = 0;
          let tongDaThu = 0;
          let tongConNo = 0;

          for (const hocPhi of tuitionData.data.ds_hoc_phi_hoc_ky) {
            const hocPhiValue = parseInt(hocPhi.hoc_phi) || 0;
            const mienGiamValue = parseInt(hocPhi.mien_giam) || 0;
            const phaiThuValue = parseInt(hocPhi.phai_thu) || 0;
            const daThuValue = parseInt(hocPhi.da_thu) || 0;
            const conNoValue = parseInt(hocPhi.con_no) || 0;

            tongHocPhi += hocPhiValue;
            tongDaThu += daThuValue;
            tongConNo += conNoValue;

            // Định dạng số tiền
            const hocPhiFormat = new Intl.NumberFormat('vi-VN').format(hocPhiValue);
            const mienGiamFormat = new Intl.NumberFormat('vi-VN').format(mienGiamValue);
            const phaiThuFormat = new Intl.NumberFormat('vi-VN').format(phaiThuValue);
            const daThuFormat = new Intl.NumberFormat('vi-VN').format(daThuValue);
            const conNoFormat = new Intl.NumberFormat('vi-VN').format(conNoValue);

            tuitionText += `| ${hocPhi.ten_hoc_ky} | ${hocPhiFormat} | ${mienGiamFormat} | ${phaiThuFormat} | ${daThuFormat} | ${conNoFormat} |\n`;
          }

          // Tổng cộng
          const tongHocPhiFormat = new Intl.NumberFormat('vi-VN').format(tongHocPhi);
          const tongDaThuFormat = new Intl.NumberFormat('vi-VN').format(tongDaThu);
          const tongConNoFormat = new Intl.NumberFormat('vi-VN').format(tongConNo);

          tuitionText += `| **Tổng cộng** | **${tongHocPhiFormat}** | | | **${tongDaThuFormat}** | **${tongConNoFormat}** |\n\n`;

          // Thông tin chi tiết
          tuitionText += "## Chi tiết học phí\n\n";

          for (const hocPhi of tuitionData.data.ds_hoc_phi_hoc_ky) {
            tuitionText += `### ${hocPhi.ten_hoc_ky}\n\n`;
            tuitionText += `- Học phí: **${new Intl.NumberFormat('vi-VN').format(parseInt(hocPhi.hoc_phi) || 0)} VNĐ**\n`;
            
            if (parseInt(hocPhi.mien_giam) > 0) {
              tuitionText += `- Miễn giảm: **${new Intl.NumberFormat('vi-VN').format(parseInt(hocPhi.mien_giam) || 0)} VNĐ**\n`;
            }
            
            if (parseInt(hocPhi.duoc_ho_tro) > 0) {
              tuitionText += `- Được hỗ trợ: **${new Intl.NumberFormat('vi-VN').format(parseInt(hocPhi.duoc_ho_tro) || 0)} VNĐ**\n`;
            }
            
            tuitionText += `- Phải thu: **${new Intl.NumberFormat('vi-VN').format(parseInt(hocPhi.phai_thu) || 0)} VNĐ**\n`;
            tuitionText += `- Đã thu: **${new Intl.NumberFormat('vi-VN').format(parseInt(hocPhi.da_thu) || 0)} VNĐ**\n`;
            
            if (parseInt(hocPhi.con_no) > 0) {
              tuitionText += `- Còn nợ: **${new Intl.NumberFormat('vi-VN').format(parseInt(hocPhi.con_no) || 0)} VNĐ**\n`;
            }
            
            tuitionText += `- Đơn giá: **${new Intl.NumberFormat('vi-VN').format(parseInt(hocPhi.don_gia) || 0)} VNĐ/tín chỉ**\n\n`;
          }
        }

        return {
          content: [
            {
              type: "text",
              text: tuitionText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy thông tin học phí:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy thông tin học phí: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
