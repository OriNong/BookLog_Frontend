<template>
    <v-container class="py-6">
        <h2 class="text-h5 font-weight-bold mb-4">내가 작성한 리뷰</h2>

        <v-row v-if="reviews.length > 0" dense>
            <v-col v-for="review in reviews" :key="review.reviewId" cols="12" md="6">
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
                                <div class="text-caption text-grey mb-2">평점: {{ review.rating }}점 ｜ 좋아요: {{
                                    review.likeCount }}</div>
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

        <ReviewDetailModal :review-id="selectedReviewId" :open="showModal" @close="showModal = false"
            @refresh="fetchMyReviews" />
    </v-container>
</template>



<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { reviewService } from '@/services/reviewService';
import ReviewDetailModal from '@/components/review/ReviewDetailModal.vue';

const route = useRoute();
const reviews = ref([]);
const showModal = ref(false);
const selectedReviewId = ref(null);

const fetchMyReviews = async () => {
    try {
        const res = await reviewService.getMyReview();
        reviews.value = res.data;
    } catch (err) {
        console.error('리뷰 목록 조회 실패:', err);
    }
};

const openReviewDetail = (id) => {
    selectedReviewId.value = id;
    showModal.value = true;
};

const truncate = (text, length) => {
    return text.length > length ? text.slice(0, length) + '...' : text;
};

watch(() => route.fullPath, () => {
    fetchMyReviews();
});

onMounted(fetchMyReviews);
</script>
