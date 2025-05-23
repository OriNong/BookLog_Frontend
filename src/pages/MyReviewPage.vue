<template>
    <v-container class="py-6">
        <v-row class="mb-4" align="center" justify="space-between">
            <v-col cols="auto">
                <h2 class="text-h5 font-weight-bold">내가 작성한 리뷰</h2>
            </v-col>
            <v-col cols="auto">
                <BackButton />
            </v-col>
        </v-row>

        <!-- 탭 메뉴 -->
        <v-tabs v-model="activeTab" color="primary" class="mb-4">
            <v-tab value="active">
                <v-icon start>mdi-check-circle</v-icon>
                활성 리뷰 ({{ activeReviews.length }})
            </v-tab>
            <v-tab value="deleted">
                <v-icon start>mdi-delete</v-icon>
                삭제된 리뷰 ({{ deletedReviews.length }})
            </v-tab>
        </v-tabs>

        <!-- 탭 컨텐츠 -->
        <v-window v-model="activeTab">
            <!-- 활성 리뷰 탭 -->
            <v-window-item value="active">
                <v-row v-if="activeReviews.length > 0" dense>
                    <v-col v-for="review in activeReviews" :key="review.reviewId" cols="12" md="6">
                        <v-card class="h-100" height="180">
                            <v-row no-gutters class="h-100">
                                <!-- 왼쪽: 도서 이미지 -->
                                <v-col cols="4" class="overflow-hidden">
                                    <v-img :src="review.bookImg" alt="도서 이미지" height="180" contain class="rounded-l" />
                                </v-col>
                                
                                <!-- 오른쪽: 리뷰 정보 -->
                                <v-col cols="8" class="pa-3 d-flex flex-column justify-space-between">
                                    <div>
                                        <div class="text-h6 font-weight-bold mb-1">{{ review.reviewTitle }}</div>
                                        <div class="text-body-2 mb-1">{{ review.bookTitle }}</div>
                                        <div class="text-caption text-grey mb-2">평점: {{ review.rating }}점 ｜ 좋아요: {{ review.likeCount }}</div>
                                        <div class="text-body-2">{{ truncate(review.reviewContent, 100) }}</div>
                                    </div>
                                    
                                    <v-card-actions class="pa-0 mt-3">
                                        <v-spacer />
                                        <v-btn color="primary" variant="tonal" size="small"
                                            @click="openReviewDetail(review.reviewId)">
                                            상세보기
                                        </v-btn>
                                    </v-card-actions>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
                
                <v-alert v-else type="info" class="mt-6" border="start" color="primary" variant="tonal">
                    작성한 리뷰가 없습니다.
                </v-alert>
            </v-window-item>

            <!-- 삭제된 리뷰 탭 -->
            <v-window-item value="deleted">
                <v-row v-if="deletedReviews.length > 0" dense>
                    <v-col v-for="review in deletedReviews" :key="review.reviewId" cols="12" md="6">
                        <v-card class="h-100" height="220" color="grey-lighten-5">
                            <!-- 삭제 표시 오버레이 -->
                            <div class="position-absolute" style="top: 8px; right: 8px; z-index: 2;">
                                <v-chip color="error" size="small" variant="elevated">
                                    <v-icon start size="16">mdi-delete</v-icon>
                                    삭제됨
                                </v-chip>
                            </div>
                            
                            <v-row no-gutters class="h-100">
                                <!-- 왼쪽: 도서 이미지 (흐림 처리) -->
                                <v-col cols="4" class="overflow-hidden position-relative">
                                    <v-img :src="review.bookImg" alt="도서 이미지" height="220" contain class="rounded-l opacity-60" />
                                </v-col>
                                
                                <!-- 오른쪽: 리뷰 정보 -->
                                <v-col cols="8" class="pa-3 d-flex flex-column justify-space-between">
                                    <div>
                                        <div class="text-h6 font-weight-bold mb-1 text-grey-darken-1">{{ review.reviewTitle }}</div>
                                        <div class="text-body-2 mb-1 text-grey">{{ review.bookTitle }}</div>
                                        <div class="text-caption text-grey mb-2">
                                            평점: {{ review.rating }}점 ｜ 좋아요: {{ review.likeCount }}
                                        </div>
                                        <div class="text-body-2 text-grey mb-2">{{ truncate(review.reviewContent, 70) }}</div>
                                        
                                        <!-- 작성일과 삭제 처리일 -->
                                        <div class="text-caption text-grey-darken-1 mb-2">
                                            <div>작성일: {{ formatDate(review.createdAt) }}</div>
                                            <div>삭제일: {{ review.processedAt }}</div>
                                        </div>
                                        
                                        <!-- 신고 사유 표시 -->
                                        <v-alert v-if="review.reportReason" density="compact" type="warning" 
                                            variant="tonal" class="mt-2" border="start">
                                            <div class="text-caption">
                                                <strong>신고 사유:</strong> {{ review.reportReason }}
                                            </div>
                                        </v-alert>
                                    </div>
                                    
                                    <v-card-actions class="pa-0 mt-3">
                                        <v-spacer />
                                        <v-btn color="grey" variant="outlined" size="small" disabled>
                                            삭제된 리뷰
                                        </v-btn>
                                    </v-card-actions>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
                
                <v-alert v-else type="info" class="mt-6" border="start" color="info" variant="tonal">
                    삭제된 리뷰가 없습니다.
                </v-alert>
            </v-window-item>
        </v-window>

        <ReviewDetailModal :review-id="selectedReviewId" :open="showModal" @close="showModal = false"
            @refresh="fetchMyReviews" />
    </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { reviewService } from '@/services/reviewService';
import ReviewDetailModal from '@/components/review/ReviewDetailModal.vue';
import BackButton from '@/components/common/BackButton.vue';

const route = useRoute();
const activeReviews = ref([]);
const deletedReviews = ref([]);
const showModal = ref(false);
const selectedReviewId = ref(null);
const activeTab = ref('active');

// 활성 리뷰 조회
const fetchMyReviews = async () => {
    try {
        const res = await reviewService.getMyReview();
        activeReviews.value = res.data;
    } catch (err) {
        console.error('활성 리뷰 목록 조회 실패:', err);
    }
};

// 삭제된 리뷰 조회
const fetchMyDeletedReviews = async () => {
    try {
        const res = await reviewService.getMyReviewDeletedByAdmin();
        deletedReviews.value = res.data;
    } catch (err) {
        console.error('삭제된 리뷰 목록 조회 실패:', err);
    }
};

// 모든 리뷰 데이터 조회
const fetchAllReviews = async () => {
    await Promise.all([
        fetchMyReviews(),
        fetchMyDeletedReviews()
    ]);
};

const openReviewDetail = (id) => {
    selectedReviewId.value = id;
    showModal.value = true;
};

const truncate = (text, length) => {
    return text && text.length > length ? text.slice(0, length) + '...' : text;
};

// 날짜 포맷팅 함수
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

watch(() => route.fullPath, () => {
    fetchAllReviews();
});

onMounted(fetchAllReviews);
</script>