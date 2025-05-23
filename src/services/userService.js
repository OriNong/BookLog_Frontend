import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export const userService = {
  // 비밀번호 일치여부 확인
  verifyPassword: (passwordData) =>
    api.post(API_ENDPOINTS.USER.VERIFY_PW, passwordData),
  // 비밀번호 변경
  updatePassword: (newPasswordData) =>
    api.put(API_ENDPOINTS.USER.CHANGE_PW, newPasswordData),
  // 닉네임 변경
  updateNickname: (newNicknameData) =>
    api.put(API_ENDPOINTS.USER.CHANGE_NICKNAME, newNicknameData),
};
