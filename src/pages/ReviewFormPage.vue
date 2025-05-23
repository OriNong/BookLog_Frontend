<template>
    <v-container class="py-8" style="max-width: 800px;">
        <v-btn @click="goBack" variant="text" class="mb-4">
            <v-icon start>mdi-arrow-left</v-icon>
            뒤로가기
        </v-btn>
        <h2 class="text-h5 mb-4">
            {{ isEditMode ? '✏️ 리뷰 수정' : '📖 리뷰 작성' }}
        </h2>

        <!-- 로딩 상태 -->
        <v-skeleton-loader v-if="loading" type="card" height="180" class="mb-6" />

        <!-- 책 정보 카드 -->
        <v-card v-else-if="book" class="mb-6">
            <v-row no-gutters>
                <v-col cols="4">
                    <v-img :src="book.bookImg" height="180px" cover class="book-image" loading="lazy" />
                </v-col>
                <v-col cols="8" class="pa-3">
                    <div class="text-h6 font-weight-bold">{{ book.bookTitle }}</div>
                    <div class="text-subtitle-2">{{ book.bookAuthor }}</div>
                    <div class="text-caption grey--text">{{ book.bookPublisher }}</div>
                </v-col>
            </v-row>
        </v-card>

        <!-- 리뷰 입력 폼 -->
        <v-form ref="form" v-model="isValid" lazy-validation>
            <v-text-field label="리뷰 제목" v-model="reviewTitle" :rules="[rules.required, rules.max255]" required />

            <v-textarea label="리뷰 본문" v-model="reviewBody" rows="6" class="review-textarea" />

            <v-rating v-model="rating" :length="5" color="yellow" background-color="grey-lighten-1" large class="mb-4"
                :rules="[rules.required]" />
            <div class="text-subtitle-2 mb-4">선택한 평점: {{ rating || 0 }}점</div>

            <v-btn color="primary" @click="submitReview" :disabled="!isValid">
                {{ isEditMode ? '수정 완료' : '작성 완료' }}
            </v-btn>
        </v-form>

    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router';
import { reviewService } from '@/services/reviewService'

const route = useRoute()
const router = useRouter();

const bookId = route.params.bookId // 파라미터로 전달받은 도서 id
const reviewId = route.params.reviewId; // 파라미터로 전달받은 리뷰 id
const book = ref(null); // 도서 상태
const loading = ref(true); // 로딩 상태

const isEditMode = !!reviewId; // 수정 모드 여부

// 뒤로 가기
const goBack = () => router.back();

// 리뷰 입력값
const form = ref(null);
const reviewTitle = ref('')
const reviewBody = ref('')
const rating = ref(0)
const isValid = ref(false)

const rules = {
    required: (v) => !!v || '필수 입력 항목입니다.',
    max255: (v) => (v && v.length <= 255) || '255자 이하로 입력해주세요.'
}

// 리뷰를 작성하려는 도서의 정보 조회
const fetchReviewRequestBook = async (targetBookId) => {
    try {
        const { data } = await reviewService.getReviewReqestBook(targetBookId);
        book.value = data;
    } catch (e) {
        console.error('도서 정보 조회 실패:', e);
    }
};

// 리뷰 등록 및 삭제 분기 처리
const submitReview = async () => {
    const isFormValid = await form.value.validate();
    if (!isFormValid.valid) return;

    const payload = {
        reviewTitle: reviewTitle.value,
        reviewContent: reviewBody.value,
        rating: rating.value,
    };

    try {
        if (isEditMode) {
            await reviewService.updateReview(reviewId, payload);
            alert("리뷰가 성공적으로 수정되었습니다!");
            router.push("/reviews/my");
        } else {
            await reviewService.submitReview({
                ...payload,
                bookId: book.value.bookId,
            });
            alert("리뷰가 성공적으로 등록되었습니다!");
            router.push("/bookcase");
        }
    } catch (err) {
        console.error("리뷰 저장 실패:", err);
        alert(err.response.data.message);
    }
};

onMounted(async () => {
    if (isEditMode) {
        try {
            const { data } = await reviewService.getReviewDetailByReviewId(reviewId);
            reviewTitle.value = data.reviewTitle;
            reviewBody.value = data.reviewContent;
            rating.value = data.rating;
            const fetchedBookId = data.bookId;

            await fetchReviewRequestBook(fetchedBookId); // 리뷰에 연결된 책 정보 로딩
        } catch (err) {
            console.error("리뷰 수정 모드 데이터 불러오기 실패", err);
            alert(err.response.data.message);
        } finally {
            loading.value = false;
        }
    } else {
        await fetchReviewRequestBook(bookId);
        loading.value = false;
    }
});
</script>

<style scoped>
.book-image {
    position: relative;
    background-color: #f5f5f5;
}

.book-image :deep(.v-img__img) {
    object-fit: scale-down !important;
}

.review-textarea .v-input__control {
    max-height: 400px;
    overflow-y: auto;
}
</style>