# TVU-MCP

## Giới thiệu

MCP hỗ trợ tra cứu lịch học TVU và xem điểm!

## Cấu hình với Model Context Protocol (MCP)

### Claude Desktop

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
        "MSSV": "",
        "PASSWORD": ""
      }
    }
  }
}
```
