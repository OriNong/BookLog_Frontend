// src/services/apiEndpoints.js
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
    CHECK_EMAIL: "/auth/check-email",
    SEND_VERIFICATION: "/auth/send-email",
    VERIFY_EMAIL: "/auth/verify-email",
    CHECK_NICKNAME: "/auth/check-nickname",
    USER_INFO: "/auth/user",
  },
  BOOK: {
    SEARCH: "/books/search",
    READING_STATUS: "/books/readingStatus",
    DETAIL: (isbn) => `/books/${isbn}`,
  },
  BOOKCASE: {
    USER: "/bookcase/user",
    REGISTER_TO_READ: "/bookcase/register",
    START_READING: "/bookcase/startReading",
    FINISH_READING: "/bookcase/readingComplete",
  },
};
