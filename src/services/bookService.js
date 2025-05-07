// src/services/bookService.js
import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export const bookService = {
  // 도서 검색
  searchBooks: (params) => {
    return api.get(API_ENDPOINTS.BOOK.SEARCH, { params });
  },

  // 도서 상세 정보 (ISBN 기반)
  getBookDetail: (isbn) => {
    return api.get(API_ENDPOINTS.BOOK.DETAIL(isbn));
  },

  // 읽는 중인지 여부 확인 (bookId 기반)
  getReadingStatus: (bookId) => {
    return api.get(`${API_ENDPOINTS.BOOK.READING_STATUS}?bookId=${bookId}`);
  },
};
