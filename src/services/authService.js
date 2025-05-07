import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export const authService = {
  // 로그인 요청
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  // 회원가입 요청
  register: async (email, password, nickname) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
      email,
      password,
      nickname,
    });
    return response.data;
  },

  // 이메일 중복 확인
  checkEmail: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.CHECK_EMAIL, null, {
      params: { email },
    });
    return response.data;
  },

  // 이메일 인증 코드 전송
  sendVerificationCode: async (email) => {
    const response = await api.post(API_ENDPOINTS.AUTH.SEND_VERIFICATION, {
      email,
    });
    return response.data;
  },

  // 이메일 인증 확인
  verifyEmail: async (email, code) => {
    const response = await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      email,
      code,
    });
    return response.data;
  },

  // 닉네임 중복 확인
  checkNickname: async (nickname) => {
    const response = await api.post(API_ENDPOINTS.AUTH.CHECK_NICKNAME, null, {
      params: { nickname },
    });
    return response.data;
  },

  // 사용자 정보 조회
  getUserInfo: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH.USER_INFO);
    return response.data;
  },

  // 로그아웃 요청
  logout: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
};
