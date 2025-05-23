import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export const reviewService = {
  // 리뷰 작성 시 초기 도서 정보 로드
  getReviewReqestBook: (bookId) =>
    api.get(API_ENDPOINTS.REVIEW.LOAD_REVIEW_REQUESTED_BOOK(bookId)),

  // 리뷰 등록
  submitReview: (reviewData) =>
    api.post(API_ENDPOINTS.REVIEW.REGISTER_REVIEW, reviewData),

  // 리뷰 수정
  updateReview: (reviewId, payload) =>
    api.put(API_ENDPOINTS.REVIEW.UPDATE_REVIEW(reviewId), payload),

  // 리뷰 삭제
  deleteReview: (reviewId) =>
    api.delete(API_ENDPOINTS.REVIEW.DELETE_REVIEW(reviewId)),

  // 도서에 등록된 리뷰 목록 조회
  getReviewsByBookId: (bookId) =>
    api.get(API_ENDPOINTS.REVIEW.REVIEWS_IN_BOOK(bookId)),

  // 리뷰 좋아요 토글
  toggleLike: (reviewId) =>
    api.post(API_ENDPOINTS.REVIEW.LIKE_REVIEW(reviewId)),

  // 리뷰 상세 조회
  getReviewDetailByReviewId: (reviewId) =>
    api.get(API_ENDPOINTS.REVIEW.GET_REVIEW_DETAIL(reviewId)),
  // 사용자가 자신의 리뷰 목록 조회
  getMyReview: () => api.get(API_ENDPOINTS.REVIEW.MY_REVIEW),
  // 사용자가 관리자가 삭제한 자신의 리뷰 목록 조회
  getMyReviewDeletedByAdmin: () =>
    api.get(API_ENDPOINTS.REVIEW.MY_REVIEW_DELETED_BY_ADMIN),
};
