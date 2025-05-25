/**
 * Module công cụ xem danh sách bài đăng
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TvuApiClient } from "../api/api.js";
import { ENV } from "../config/config.js";

/**
 * Đăng ký công cụ xem danh sách bài đăng
 * @param server Server MCP
 * @param apiClient Client API TVU
 */
export function registerPostsTools(server: McpServer, apiClient: TvuApiClient) {
  // Đăng ký công cụ xem danh sách thông báo
  server.tool(
    "getNotifications",
    "Xem thông báo",
    {
      limit: z
        .number()
        .optional()
        .describe("Số lượng thông báo tối đa muốn xem (mặc định: 10)"),
    },
    async ({ limit }) => {
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

        const postsData = await apiClient.getPosts("tb", limit || 10);

        // Kiểm tra dữ liệu
        if (!postsData.data || !postsData.data.ds_bai_viet || postsData.data.ds_bai_viet.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "❌ Không có thông báo nào.",
              },
            ],
          };
        }

        // Tạo nội dung hiển thị
        let notificationsText = "# Thông báo\n\n";
        
        const tbCategory = postsData.data.ds_bai_viet.find((cat: any) => cat.ky_hieu === "tb");
        
        if (tbCategory && tbCategory.ds_baiviet && tbCategory.ds_baiviet.length > 0) {
          notificationsText += "| STT | Tiêu đề | Ngày đăng |\n";
          notificationsText += "|-----|---------|----------|\n";
          
          let stt = 1;
          for (const post of tbCategory.ds_baiviet) {
            const postDate = new Date(post.ngay_dang_tin);
            const formattedDate = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
            
            notificationsText += `| ${stt} | [${post.tieu_de}](${post.url_bai_viet}) | ${formattedDate} |\n`;
            stt++;
          }
        } else {
          notificationsText += "Không có thông báo nào.\n";
        }

        return {
          content: [
            {
              type: "text",
              text: notificationsText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách thông báo:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy danh sách thông báo: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Đăng ký công cụ xem danh sách hướng dẫn
  server.tool(
    "getGuides",
    "Xem hướng dẫn",
    {
      limit: z
        .number()
        .optional()
        .describe("Số lượng hướng dẫn tối đa muốn xem (mặc định: 10)"),
    },
    async ({ limit }) => {
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

        const postsData = await apiClient.getPosts("hd", limit || 10);

        // Kiểm tra dữ liệu
        if (!postsData.data || !postsData.data.ds_bai_viet || postsData.data.ds_bai_viet.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "❌ Không có hướng dẫn nào.",
              },
            ],
          };
        }

        // Tạo nội dung hiển thị
        let guidesText = "# Hướng dẫn\n\n";
        
        const hdCategory = postsData.data.ds_bai_viet.find((cat: any) => cat.ky_hieu === "hd");
        
        if (hdCategory && hdCategory.ds_baiviet && hdCategory.ds_baiviet.length > 0) {
          guidesText += "| STT | Tiêu đề | Ngày đăng |\n";
          guidesText += "|-----|---------|----------|\n";
          
          let stt = 1;
          for (const post of hdCategory.ds_baiviet) {
            const postDate = new Date(post.ngay_dang_tin);
            const formattedDate = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
            
            guidesText += `| ${stt} | [${post.tieu_de}](${post.url_bai_viet}) | ${formattedDate} |\n`;
            stt++;
          }
        } else {
          guidesText += "Không có hướng dẫn nào.\n";
        }

        return {
          content: [
            {
              type: "text",
              text: guidesText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách hướng dẫn:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy danh sách hướng dẫn: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Đăng ký công cụ xem danh sách biểu mẫu
  server.tool(
    "getForms",
    "Xem biểu mẫu",
    {
      limit: z
        .number()
        .optional()
        .describe("Số lượng biểu mẫu tối đa muốn xem (mặc định: 10)"),
    },
    async ({ limit }) => {
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

        const postsData = await apiClient.getPosts("bm", limit || 10);

        // Kiểm tra dữ liệu
        if (!postsData.data || !postsData.data.ds_bai_viet || postsData.data.ds_bai_viet.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "❌ Không có biểu mẫu nào.",
              },
            ],
          };
        }

        // Tạo nội dung hiển thị
        let formsText = "# Biểu mẫu\n\n";
        
        const bmCategory = postsData.data.ds_bai_viet.find((cat: any) => cat.ky_hieu === "bm");
        
        if (bmCategory && bmCategory.ds_baiviet && bmCategory.ds_baiviet.length > 0) {
          formsText += "| STT | Tiêu đề | Ngày đăng |\n";
          formsText += "|-----|---------|----------|\n";
          
          let stt = 1;
          for (const post of bmCategory.ds_baiviet) {
            const postDate = new Date(post.ngay_dang_tin);
            const formattedDate = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
            
            formsText += `| ${stt} | [${post.tieu_de}](${post.url_bai_viet}) | ${formattedDate} |\n`;
            stt++;
          }
        } else {
          formsText += "Không có biểu mẫu nào.\n";
        }

        return {
          content: [
            {
              type: "text",
              text: formsText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách biểu mẫu:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy danh sách biểu mẫu: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Đăng ký công cụ xem tất cả bài đăng
  server.tool(
    "getAllPosts",
    "Xem tất cả bài đăng",
    {
      limit: z
        .number()
        .optional()
        .describe("Số lượng bài đăng tối đa muốn xem cho mỗi loại (mặc định: 5)"),
    },
    async ({ limit }) => {
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

        const postsData = await apiClient.getPosts("", limit ? limit * 3 : 15);

        // Kiểm tra dữ liệu
        if (!postsData.data || !postsData.data.ds_bai_viet || postsData.data.ds_bai_viet.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "❌ Không có bài đăng nào.",
              },
            ],
          };
        }

        // Tạo nội dung hiển thị
        let postsText = "# Bài đăng\n\n";
        
        // Thông báo
        postsText += "## Thông báo\n\n";
        const tbCategory = postsData.data.ds_bai_viet.find((cat: any) => cat.ky_hieu === "tb");
        
        if (tbCategory && tbCategory.ds_baiviet && tbCategory.ds_baiviet.length > 0) {
          postsText += "| STT | Tiêu đề | Ngày đăng |\n";
          postsText += "|-----|---------|----------|\n";
          
          const maxItems = limit || 5;
          const items = tbCategory.ds_baiviet.slice(0, maxItems);
          
          let stt = 1;
          for (const post of items) {
            const postDate = new Date(post.ngay_dang_tin);
            const formattedDate = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
            
            postsText += `| ${stt} | [${post.tieu_de}](${post.url_bai_viet}) | ${formattedDate} |\n`;
            stt++;
          }
          
          if (tbCategory.ds_baiviet.length > maxItems) {
            postsText += `\n*Còn ${tbCategory.ds_baiviet.length - maxItems} thông báo khác. Sử dụng lệnh \`getNotifications\` để xem thêm.*\n`;
          }
        } else {
          postsText += "Không có thông báo nào.\n";
        }
        
        // Hướng dẫn
        postsText += "\n## Hướng dẫn\n\n";
        const hdCategory = postsData.data.ds_bai_viet.find((cat: any) => cat.ky_hieu === "hd");
        
        if (hdCategory && hdCategory.ds_baiviet && hdCategory.ds_baiviet.length > 0) {
          postsText += "| STT | Tiêu đề | Ngày đăng |\n";
          postsText += "|-----|---------|----------|\n";
          
          const maxItems = limit || 5;
          const items = hdCategory.ds_baiviet.slice(0, maxItems);
          
          let stt = 1;
          for (const post of items) {
            const postDate = new Date(post.ngay_dang_tin);
            const formattedDate = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
            
            postsText += `| ${stt} | [${post.tieu_de}](${post.url_bai_viet}) | ${formattedDate} |\n`;
            stt++;
          }
          
          if (hdCategory.ds_baiviet.length > maxItems) {
            postsText += `\n*Còn ${hdCategory.ds_baiviet.length - maxItems} hướng dẫn khác. Sử dụng lệnh \`getGuides\` để xem thêm.*\n`;
          }
        } else {
          postsText += "Không có hướng dẫn nào.\n";
        }
        
        // Biểu mẫu
        postsText += "\n## Biểu mẫu\n\n";
        const bmCategory = postsData.data.ds_bai_viet.find((cat: any) => cat.ky_hieu === "bm");
        
        if (bmCategory && bmCategory.ds_baiviet && bmCategory.ds_baiviet.length > 0) {
          postsText += "| STT | Tiêu đề | Ngày đăng |\n";
          postsText += "|-----|---------|----------|\n";
          
          const maxItems = limit || 5;
          const items = bmCategory.ds_baiviet.slice(0, maxItems);
          
          let stt = 1;
          for (const post of items) {
            const postDate = new Date(post.ngay_dang_tin);
            const formattedDate = `${postDate.getDate()}/${postDate.getMonth() + 1}/${postDate.getFullYear()}`;
            
            postsText += `| ${stt} | [${post.tieu_de}](${post.url_bai_viet}) | ${formattedDate} |\n`;
            stt++;
          }
          
          if (bmCategory.ds_baiviet.length > maxItems) {
            postsText += `\n*Còn ${bmCategory.ds_baiviet.length - maxItems} biểu mẫu khác. Sử dụng lệnh \`getForms\` để xem thêm.*\n`;
          }
        } else {
          postsText += "Không có biểu mẫu nào.\n";
        }

        return {
          content: [
            {
              type: "text",
              text: postsText,
            },
          ],
        };
      } catch (error: any) {
        console.error("Lỗi khi lấy danh sách bài đăng:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Lỗi khi lấy danh sách bài đăng: ${error.message}`,
            },
          ],
        };
      }
    }
  );
}
