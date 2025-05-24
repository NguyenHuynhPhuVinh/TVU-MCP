/**
 * Định nghĩa các kiểu dữ liệu cho API TVU
 */

/**
 * Thông tin đăng nhập
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Thông tin thời khóa biểu
 */
export interface Schedule {
  data: {
    ds_tuan_tkb: TuanTKB[];
  };
}

/**
 * Thông tin tuần học
 */
export interface TuanTKB {
  id: string;
  ma_tuan: string;
  ten_tuan: string;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  ds_thoi_khoa_bieu: MonHoc[];
}

/**
 * Thông tin môn học
 */
export interface MonHoc {
  id: string;
  ma_mon: string;
  ten_mon: string;
  ma_giang_vien: string;
  ten_giang_vien: string;
  ma_phong: string;
  tiet_bat_dau: number;
  so_tiet: number;
  ngay_hoc: string;
  tuan_hoc: string;
}

/**
 * Thông tin điểm
 */
export interface Grades {
  data: {
    ds_diem: DiemMonHoc[];
  };
}

/**
 * Thông tin điểm môn học
 */
export interface DiemMonHoc {
  id: string;
  ma_mon: string;
  ten_mon: string;
  so_tin_chi: number;
  diem_tk: number;
  diem_thi: number;
  diem_tong_ket: number;
  diem_chu: string;
  ket_qua: string;
}

/**
 * Thông tin sinh viên
 */
export interface StudentInfo {
  data: {
    sinh_vien: {
      id: string;
      ma_sv: string;
      ho_ten: string;
      ngay_sinh: string;
      gioi_tinh: string;
      lop: string;
      nganh: string;
      khoa: string;
      he_dao_tao: string;
      khoa_hoc: string;
    };
  };
}

/**
 * Thông tin lịch thi
 */
export interface ExamSchedule {
  data: {
    ds_lich_thi: LichThi[];
  };
}

/**
 * Thông tin lịch thi môn học
 */
export interface LichThi {
  id: string;
  ma_mon: string;
  ten_mon: string;
  ngay_thi: string;
  gio_bat_dau: string;
  so_phut: number;
  ma_phong: string;
  hinh_thuc_thi: string;
}
