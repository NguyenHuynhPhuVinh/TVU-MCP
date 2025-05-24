/**
 * Các hằng số API TVU
 */
import { TVU_API_CONFIG } from "../config/config.js";

// URL cơ sở của API
export const API_BASE_URL = TVU_API_CONFIG.BASE_URL;

// Các endpoint
export const ENDPOINTS = {
  // Đăng nhập
  LOGIN: '/api/auth/login',
  
  // Thời khóa biểu
  GET_SCHEDULE: '/api/sch/w-locdstkbtuanusertheohocky',
};

// Cấu hình API
export const API_CONFIG = {
  TIMEOUT: TVU_API_CONFIG.TIMEOUT,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
  TOKEN_EXPIRATION: TVU_API_CONFIG.TOKEN_EXPIRATION,
  
  // Học kỳ hiện tại (2024-2025 học kỳ 2)
  CURRENT_SEMESTER: '20242',
};
