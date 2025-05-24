#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { APP_CONFIG } from "./config/config.js";

// Import các module đăng ký công cụ
//import { registerBasicTools } from "./mcp/basic.js";
import { registerTvuTools } from "./mcp/tvu.js";

// Tạo server instance
const server = new McpServer({
  name: APP_CONFIG.NAME,
  version: APP_CONFIG.VERSION,
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Đăng ký các công cụ
//registerBasicTools(server);
registerTvuTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} đang chạy trên stdio`
  );
  console.error("Hỗ trợ tra cứu lịch học TVU và xem điểm!");
}

main().catch((error) => {
  console.error("Lỗi nghiêm trọng trong main():", error);
  process.exit(1);
});
