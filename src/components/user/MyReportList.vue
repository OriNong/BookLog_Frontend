<template>
    <v-card elevation="1">
        <v-card-text>
            <v-alert v-if="reports.length === 0" type="info" border="start" color="primary" variant="tonal">
                신고한 리뷰가 없습니다.
            </v-alert>

            <v-row v-else dense>
                <v-col cols="12" v-for="report in reports" :key="report.reportId">
                    <v-card outlined class="pa-3">
                        <div class="d-flex justify-space-between align-center">
                            <div>
                                <div class="text-subtitle-1 font-weight-medium">{{ report.reviewTitle }}</div>
                                <div class="text-caption mt-1">
                                    사유: {{ report.reason }} ｜ 상태: {{ formatStatus(report) }}
                                </div>
                            </div>
                            <div class="d-flex">
                                <v-btn v-if="!report.processedAt" size="small" variant="text" color="primary"
                                    class="me-2" @click="editReport(report)">
                                    수정
                                </v-btn>
                                <v-btn v-if="!report.processedAt" size="small" variant="text" color="error"
                                    @click="deleteReport(report.reportId)">
                                    삭제
                                </v-btn>
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>

    <!-- 신고 수정 다이얼로그 -->
    <ReviewReportDialog v-if="editingReport" :review-id="editingReport.reviewId" :report-id="editingReport.reportId"
        :reason-code="editingReport.reasonCode" :reason="editingReport.reason" :open="true"
        @close="editingReport = null" @submitted="handleUpdated" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { reportService } from '@/services/reportService';
import ReviewReportDialog from '../review/ReviewReportDialog.vue';

const reports = ref([]);
const editingReport = ref(null);

const fetchReports = async () => {
    try {
        const res = await reportService.getMyReports();
        reports.value = res.data;
    } catch (err) {
        console.error('신고 목록 조회 실패:', err);
        alert(err.response.data.message);
    }
};

const formatStatus = (r) => {
    if (!r.processedAt) return '처리 대기중';
    if (r.status === 'APPROVED') return '승인';
    if (r.status === 'REJECTED') return '반려';
    return r.status;
};

const editReport = (report) => {
    editingReport.value = { ...report };
};

const deleteReport = async (reportId) => {
    const confirmed = window.confirm('정말로 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
        await reportService.deleteReport(reportId);
        await fetchReports();
    } catch (err) {
        alert(err.response.data.message);
    }
};

const handleUpdated = () => {
    editingReport.value = null;
    fetchReports();
};

onMounted(fetchReports);
</script>
