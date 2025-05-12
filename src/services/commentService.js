import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export const commentService = {
  // 댓글 목록 조회
  getReviewComments: (reviewId) =>
    api.get(API_ENDPOINTS.COMMENTS.GET_COMMENT(reviewId)),

  // 댓글 등록
  postReviewComment: (reviewId, { content, parentCommentId = null }) =>
    api.post(API_ENDPOINTS.COMMENTS.POST_COMMENT(reviewId), {
      content,
      parentCommentId,
    }),
  updateReviewComment: (commentId, { content }) =>
    api.put(API_ENDPOINTS.COMMENTS.UPDATE_COMMENT(commentId), {
      content,
    }),
  deleteReviewComment: (commentId) =>
    api.delete(API_ENDPOINTS.COMMENTS.DELETE_COMMENT(commentId)),
};
