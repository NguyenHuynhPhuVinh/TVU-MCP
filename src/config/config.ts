/**
 * Cấu hình ứng dụng
 */
import dotenv from 'dotenv';

// Tải biến môi trường từ file .env
dotenv.config();

/**
 * Cấu hình môi trường
 */
export const ENV = {
  // Môi trường thực thi (development, production, test)
  NODE_ENV: process.env.NODE_ENV || "development",

  // Cổng máy chủ (nếu cần)
  PORT: process.env.PORT || 3000,

  // Cờ gỡ lỗi
  DEBUG: process.env.DEBUG === "true",

  // Thông tin đăng nhập TTSV TVU
  MSSV: process.env.MSSV || "",
  PASSWORD: process.env.PASSWORD || "",
};

/**
 * Cấu hình ứng dụng
 */
export const APP_CONFIG = {
  // Tên ứng dụng
  NAME: "TVU-MCP",

  // Phiên bản
  VERSION: "1.0.0",

  // Thời gian chờ mặc định (ms)
  DEFAULT_TIMEOUT: 5000,

  // Số lần thử lại tối đa
  MAX_RETRIES: 3,
};

/**
 * Cấu hình API TVU
 */
export const TVU_API_CONFIG = {
  // URL cơ sở của API
  BASE_URL: "https://ttsv.tvu.edu.vn",
  
  // Thời gian chờ (ms)
  TIMEOUT: 10000,
  
  // Thời gian hết hạn token (ms) - 2 giờ
  TOKEN_EXPIRATION: 2 * 60 * 60 * 1000,
};

/**
 * Cấu hình ghi log
 */
export const LOG_CONFIG = {
  // Cấp độ ghi log (debug, info, warn, error)
  LEVEL: process.env.LOG_LEVEL || "info",

  // Có ghi log vào tệp không
  FILE_LOGGING: process.env.FILE_LOGGING === "true",

  // Đường dẫn tệp ghi log
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || "./logs/app.log",
};
