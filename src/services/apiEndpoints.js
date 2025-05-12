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
    BOOKS_WITH_REVIEW: "/books/reviewed",
  },
  BOOKCASE: {
    USER: "/bookcase/user",
    REGISTER_TO_READ: "/bookcase/register",
    START_READING: "/bookcase/startReading",
    FINISH_READING: "/bookcase/readingComplete",
  },
  REVIEW: {
    LOAD_REVIEW_REQUESTED_BOOK: (bookId) => `/reviews/book/${bookId}`,
    REGISTER_REVIEW: "/reviews/register",
    UPDATE_REVIEW: (reviewId) => `/reviews/update/${reviewId}`,
    DELETE_REVIEW: (reviewId) => `/reviews/delete/${reviewId}`,
    REVIEWS_IN_BOOK: (bookId) => `/reviews/list/${bookId}`,
    LIKE_REVIEW: (reviewId) => `/reviews/like/${reviewId}`,
    GET_REVIEW_DETAIL: (reviewId) => `/reviews/${reviewId}`, // 리뷰 상세 조회
    MY_REVIEW: "/reviews/my",
  },
  COMMENTS: {
    GET_COMMENT: (reviewId) => `/review/comments/${reviewId}/select`, // 댓글 목록
    POST_COMMENT: (reviewId) => `/review/comments/${reviewId}/insert`, // 댓글 등록
    UPDATE_COMMENT: (commentId) => `/review/comments/${commentId}/update`, // 댓글 수정
    DELETE_COMMENT: (commentId) => `/review/comments/${commentId}/delete`, // 댓글 삭제
  },
};
