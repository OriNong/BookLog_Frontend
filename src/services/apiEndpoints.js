// src/services/apiEndpoints.js
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login", // 로그인
    LOGOUT: "/auth/logout", // 로그 아웃
    REFRESH: "/auth/refresh", // 토큰 refresh
    REGISTER: "/auth/register", // 회원 가입
    CHECK_EMAIL: "/auth/check-email", // 이메일 중복 확인
    SEND_VERIFICATION: "/auth/send-email", // 이메일 인증 코드 발송
    VERIFY_EMAIL: "/auth/verify-email", // 이메일 인증 코드 확인
    CHECK_NICKNAME: "/auth/check-nickname", // 닉네임 중복 확인
    USER_INFO: "/auth/user", // 로그인 사용자 정보 조회
  },
  BOOK: {
    SEARCH: "/books/search", // 키워드로 도서 검색
    BOOKCASE_STATS: (bookId) => `/books/bookcase/stats/${bookId}`, // 서재 통계 조회
    READING_STATUS: (bookId) => `/books/readingStatus/${bookId}`, // 사용자의 도서 읽기 상태 조회
    DETAIL: (isbn) => `/books/${isbn}`, // 도서 상세정보 조회(isbn)
    BOOKS_WITH_REVIEW: "/books/reviewed", // 리뷰가 1건 이상 등록된 도서 목록 조회
  },
  BOOKCASE: {
    USER: "/bookcase/user", // 사용자 서재 정보 조회회
    REGISTER_TO_READ: "/bookcase/register", // 읽을 목록에 추가
    START_READING: "/bookcase/startReading", // 독서 시작
    FINISH_READING: "/bookcase/readingComplete", // 독서 완료
  },
  REVIEW: {
    LOAD_REVIEW_REQUESTED_BOOK: (bookId) => `/reviews/book/${bookId}`, // 리뷰 작성하려는 도서 정보 조회
    REGISTER_REVIEW: "/reviews/register", // 리뷰 등록
    UPDATE_REVIEW: (reviewId) => `/reviews/update/${reviewId}`, // 리뷰 수정
    DELETE_REVIEW: (reviewId) => `/reviews/delete/${reviewId}`, // 리뷰 삭제
    REVIEWS_IN_BOOK: (bookId) => `/reviews/list/${bookId}`, // 도서에 등록된 리뷰 목록 조회
    LIKE_REVIEW: (reviewId) => `/reviews/like/${reviewId}`, // 리뷰에 좋아요 처리
    GET_REVIEW_DETAIL: (reviewId) => `/reviews/${reviewId}`, // 리뷰 상세 조회
    MY_REVIEW: "/reviews/my", // 내가 작성한 리뷰 목록 조회
  },
  COMMENTS: {
    GET_COMMENT: (reviewId) => `/review/comments/${reviewId}/select`, // 댓글 목록
    POST_COMMENT: (reviewId) => `/review/comments/${reviewId}/insert`, // 댓글 등록
    UPDATE_COMMENT: (commentId) => `/review/comments/${commentId}/update`, // 댓글 수정
    DELETE_COMMENT: (commentId) => `/review/comments/${commentId}/delete`, // 댓글 삭제
  },
};
