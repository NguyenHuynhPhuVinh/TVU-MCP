/**
 * Module API TVU sử dụng Axios
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL, API_CONFIG, ENDPOINTS } from "./constants.js";
import { ENV } from "../config/config.js";

/**
 * Interface cho dữ liệu đăng nhập
 */
interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Lớp API TVU sử dụng Axios
 */
export class TvuApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;
  private credentials: { mssv: string; password: string };

  constructor(mssv: string = ENV.MSSV, password: string = ENV.PASSWORD) {
    this.credentials = { mssv, password };

    // Khởi tạo Axios instance với cấu hình cơ bản
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Thêm interceptor xử lý lỗi
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: any) => {
        if (error.response) {
          // Nếu token hết hạn (401), thử làm mới token và gọi lại
          if (
            error.response.status === 401 &&
            error.config &&
            !error.config.__isRetryRequest
          ) {
            try {
              await this.refreshToken();
              error.config.__isRetryRequest = true;
              error.config.headers.Authorization = `Bearer ${this.token}`;
              return this.axiosInstance(error.config);
            } catch (refreshError) {
              console.error("Lỗi khi làm mới token:", refreshError);
              return Promise.reject(refreshError);
            }
          }
          console.error(
            `Lỗi API: ${error.response.status} ${error.response.statusText}`
          );
        } else if (error.request) {
          console.error("Lỗi kết nối: Không nhận được phản hồi");
        } else {
          console.error(`Lỗi: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Đăng nhập và lấy token
   * @returns Token đăng nhập
   */
  async login(): Promise<string> {
    try {
      const formData = new URLSearchParams();
      formData.append("username", this.credentials.mssv);
      formData.append("password", this.credentials.password);
      formData.append("grant_type", "password");

      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}${ENDPOINTS.LOGIN}`,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
        }
      );

      this.token = response.data.access_token;
      // Tính thời gian hết hạn (2 giờ)
      this.tokenExpiration = new Date(Date.now() + API_CONFIG.TOKEN_EXPIRATION);

      // Cập nhật Authorization header cho các request tiếp theo
      this.axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${this.token}`;

      return this.token;
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      throw error;
    }
  }

  /**
   * Làm mới token
   * @returns Token mới
   */
  async refreshToken(): Promise<string> {
    return this.login(); // Đăng nhập lại để lấy token mới
  }

  /**
   * Kiểm tra và đảm bảo token hợp lệ
   */
  private async ensureToken(): Promise<void> {
    // Nếu chưa có token hoặc token đã hết hạn
    if (
      !this.token ||
      !this.tokenExpiration ||
      new Date() >= this.tokenExpiration
    ) {
      await this.login();
    }
  }

  /**
   * Lấy thời khóa biểu theo học kỳ
   * @param semester Học kỳ (mặc định là học kỳ hiện tại)
   * @returns Dữ liệu thời khóa biểu
   */
  async getSchedule(
    semester: string = API_CONFIG.CURRENT_SEMESTER
  ): Promise<any> {
    await this.ensureToken();

    try {
      const formData = new URLSearchParams();
      formData.append("filter[hoc_ky]", semester);
      formData.append("filter[ten_hoc_ky]", "");
      formData.append("additional[paging][limit]", "100");
      formData.append("additional[paging][page]", "1");

      const response = await this.axiosInstance.post(
        ENDPOINTS.GET_SCHEDULE,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thời khóa biểu:`, error);
      throw error;
    }
  }
}
