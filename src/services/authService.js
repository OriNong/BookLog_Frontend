import api from "./api";

export const authService = {
  // 로그인 요청
  login: async (email, password) => {
    const response = await api.post("/auth/login", {
        email: email,
        password: password
    });
    return response.data;
  },

  // 회원가입 요청
  register: async (email, password, nickname) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      nickname,
    });
    return response.data;
  },

  // 사용자 정보 요청
  getUserInfo: async () => {
    const response = await api.get("/auth/user");
    return response.data;
  },

  // 로그아웃 요청
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};
