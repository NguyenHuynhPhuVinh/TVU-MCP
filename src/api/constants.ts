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
  
  // Điểm học tập
  GET_GRADES: '/public/api/srm/w-locdsdiemsinhvien',
  
  // Học phí
  GET_TUITION: '/public/api/rms/w-locdstonghophocphisv',
  
  // Chương trình đào tạo
  GET_CURRICULUM: '/public/api/sch/w-locdsctdtsinhvien',
  
  // Thông tin sinh viên
  GET_STUDENT_INFO: '/public/api/dkmh/w-locsinhvieninfo',
  
  // Danh sách bài đăng (thông báo, hướng dẫn, biểu mẫu)
  GET_POSTS: '/public/api/web/w-locdsbaidang',
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
