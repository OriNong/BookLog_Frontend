import api from "./api";
import { API_ENDPOINTS } from "./apiEndpoints";

export const reportService = {
  // 리뷰 신고 제출
  submitReport: (reportData) =>
    api.post(API_ENDPOINTS.REPORTS.SUBMIT_REPORT, reportData),
  // 신고 내역 조회
  getMyReports: () => api.get(API_ENDPOINTS.REPORTS.MY_REPORT),
  // 신고 내역 수정
  updateReport: (reportId, reportUptData) =>
    api.put(API_ENDPOINTS.REPORTS.UPDATE_REPORT(reportId), reportUptData),
  // 신고 내역 삭제
  cancelReport: (reportId) =>
    api.delete(API_ENDPOINTS.REPORTS.CANCEL_REPORT(reportId)),
};
