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

  /**
   * Lấy điểm học tập
   * @param showByRegSemester Hiển thị môn theo học kỳ đăng ký (mặc định: false)
   * @returns Dữ liệu điểm học tập
   */
  async getGrades(showByRegSemester: boolean = false): Promise<any> {
    await this.ensureToken();

    try {
      const response = await this.axiosInstance.post(
        ENDPOINTS.GET_GRADES,
        null,
        {
          headers: {
            "Content-Type": "text/plain",
            "hien_thi_mon_theo_hkdk": String(showByRegSemester)
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy điểm học tập:`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin học phí
   * @returns Dữ liệu học phí
   */
  async getTuition(): Promise<any> {
    await this.ensureToken();

    try {
      const response = await this.axiosInstance.post(
        ENDPOINTS.GET_TUITION,
        null,
        {
          headers: {
            "Content-Type": "text/plain"
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin học phí:`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin chương trình đào tạo
   * @param programType Loại chương trình đào tạo (mặc định: 2)
   * @returns Dữ liệu chương trình đào tạo
   */
  async getCurriculum(programType: number = 2): Promise<any> {
    await this.ensureToken();

    try {
      const data = {
        filter: {
          loai_chuong_trinh_dao_tao: programType
        },
        additional: {
          paging: {
            limit: 500,
            page: 1
          },
          ordering: [
            {
              name: null,
              order_type: null
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(
        ENDPOINTS.GET_CURRICULUM,
        data,
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin chương trình đào tạo:`, error);
      throw error;
    }
  }

  /**
   * Lấy thông tin sinh viên
   * @returns Dữ liệu thông tin sinh viên
   */
  async getStudentInfo(): Promise<any> {
    await this.ensureToken();

    try {
      const response = await this.axiosInstance.post(
        ENDPOINTS.GET_STUDENT_INFO,
        null,
        {
          headers: {
            "Content-Type": "text/plain"
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin sinh viên:`, error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bài đăng (thông báo, hướng dẫn, biểu mẫu)
   * @param postType Loại bài đăng (tb: thông báo, hd: hướng dẫn, bm: biểu mẫu)
   * @param limit Số lượng bài đăng tối đa muốn lấy (mặc định: 200)
   * @returns Dữ liệu danh sách bài đăng
   */
  async getPosts(postType?: string, limit: number = 200): Promise<any> {
    await this.ensureToken();

    try {
      const data = {
        filter: {
          ky_hieu: postType || "",
          is_hien_thi: true,
          is_hinh_dai_dien: true,
          is_quyen_xem: true
        },
        additional: {
          paging: {
            limit: limit,
            page: 1
          },
          ordering: [
            {
              name: "do_uu_tien",
              order_type: 1
            },
            {
              name: "ngay_dang_tin",
              order_type: 1
            }
          ]
        }
      };

      const response = await this.axiosInstance.post(
        ENDPOINTS.GET_POSTS,
        data,
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách bài đăng:`, error);
      throw error;
    }
  }
}
