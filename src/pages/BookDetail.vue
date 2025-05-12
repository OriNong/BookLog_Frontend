<template>
  <v-container>
    <v-btn @click="goBack" variant="text" class="mb-4">
      <v-icon start>mdi-arrow-left</v-icon>
      뒤로가기
    </v-btn>
    <!-- 도서 정보 -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-img :src="book.bookImg" height="300" class="rounded" contain />
      </v-col>
      <v-col cols="12" md="8">
        <h2 class="text-h5 font-weight-bold mb-2">{{ book.bookTitle }}</h2>
        <p class="mb-1"><strong>저자:</strong> {{ book.bookAuthor }}</p>
        <p class="mb-1"><strong>출판사:</strong> {{ book.bookPublisher }}</p>
        <p class="mb-4 line-clamp-6">
          <strong>소개:</strong> {{ book.bookDescription }}
        </p>

        <v-btn v-if="book.bookLink" :href="book.bookLink" target="_blank" rel="noopener noreferrer" variant="tonal"
          color="info" class="mb-4">
          네이버 도서에서 상세 보기
        </v-btn>

        <!-- 상태 카운트 -->
        <v-row dense class="mb-4">
          <v-col cols="12" sm="4">📚 {{ book.stats?.shelf || 0 }}명 서재에 등록</v-col>
          <v-col cols="12" sm="4">📖 {{ book.stats?.reading || 0 }}명 읽는 중</v-col>
          <v-col cols="12" sm="4">✅ {{ book.stats?.done || 0 }}명 독서 완료</v-col>
        </v-row>

        <!-- 액션 버튼 -->
        <!-- 상태에 따라 버튼 1개만 표시 -->
        <v-btn v-if="bookcaseStatus === null" class="me-2" color="primary" @click="registerToBookcase">
          읽을 목록에 추가
        </v-btn>

        <v-btn v-else-if="bookcaseStatus === 'TO_READ'" color="success" @click="startReading">
          독서 시작
        </v-btn>

        <v-btn v-else-if="bookcaseStatus === 'READING'" color="warning" @click="finishReading">
          독서 완료
        </v-btn>

        <!-- ✅ 내 서재로 이동 버튼 (항상 보임 + 왼쪽 간격) -->
        <v-btn class="ms-4" color="warning" @click="$router.push('/bookcase')">
          내 서재로 이동
        </v-btn>

      </v-col>
    </v-row>

    <!-- 리뷰 정렬 영역 -->
    <v-row align="center" class="mb-3">
      <v-col cols="12" sm="6">
        <h3 class="text-h6 font-weight-medium">유저 리뷰</h3>
      </v-col>
      <v-col cols="12" sm="6" class="text-end">
        <v-btn-toggle v-model="reviewSort" divided variant="outlined" density="comfortable">
          <v-btn value="date">작성일자순</v-btn>
          <v-btn value="rating">평점순</v-btn>
          <v-btn value="likes">좋아요순</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- 🔽 리뷰가 없을 경우 -->
    <v-alert v-if="reviews.length === 0" type="info" text class="mb-6">
      아직 작성된 리뷰가 없습니다.
    </v-alert>

    <!-- 리뷰 목록 -->
    <v-row v-else>
      <v-col v-for="review in sortedReviews" :key="review.id" cols="12" md="6">
        <v-card class="pa-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <div>
              <strong>{{ review.title }}</strong>
              <div class="text-caption">by {{ review.author }}</div>
            </div>
            <v-rating :model-value="review.rating" readonly size="small" color="amber" half-increments />
          </div>
          <div class="text-body-2 mb-2">❤️ {{ review.likes }} 좋아요</div>
          <div class="text-caption text-grey">작성일: {{ review.crtDate }}</div>
          <div class="text-end mt-2">
            <v-btn size="small" variant="outlined" class="me-2" @click="openReviewDetail(review.id)">상세보기</v-btn>
            <v-btn size="small" :color="review.likedByUser ? 'pink' : 'grey'"
              :variant="review.likedByUser ? 'elevated' : 'tonal'" @click="toggleLike(review.id)">
              {{ review.likedByUser ? '좋아요 완료' : '좋아요' }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <ReviewDetailModal :review-id="selectedReviewId" :open="showModal" @close="showModal = false" />

  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { bookService } from '@/services/bookService';
import { bookcaseService } from '@/services/bookcaseService';
import { reviewService } from '@/services/reviewService';
import ReviewDetailModal from '@/components/review/ReviewDetailModal.vue';

/* --- 라우트 및 기본 상태 --- */
const router = useRouter();
const route = useRoute();
const isbn = route.params.isbn;

//뒤로 가기
const goBack = () => router.back();

const book = ref({});
const bookcaseStatus = ref(null); // TO_READ, READING, COMPLETE, null

/* --- 리뷰 관련 상태 --- */
const reviews = ref([]);
const reviewSort = ref('date');
// 리뷰 정렬 기준에 따라 정렬
const sortedReviews = computed(() => {
  const sorted = [...reviews.value];
  if (reviewSort.value === 'rating') {
    return sorted.sort((a, b) => b.rating - a.rating);
  } else if (reviewSort.value === 'likes') {
    return sorted.sort((a, b) => b.likes - a.likes);
  } else {
    // 기본: 작성일자 (리뷰 ID가 높은 순 or 날짜 역순)
    return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
});

/* --- 리뷰 상세보기 관련 상태 --- */
const showModal = ref(false);
const selectedReviewId = ref(null);


/* --- 도서 상세 및 상태 조회 --- */
const fetchBookDetail = async () => {
  try {
    const { data } = await bookService.getBookDetail(isbn);
    book.value = data;

    if (book.value.bookId) {
      await fetchReadingStatus();
    }
  } catch (e) {
    console.error('도서 정보를 불러오지 못했습니다', e);
  }
};

// 해당 도서의 사용자 서재 읽기 상태 조회
const fetchReadingStatus = async () => {
  if (!book.value.bookId) return;

  try {
    const { data } = await bookService.getReadingStatus(book.value.bookId);
    bookcaseStatus.value = data;
  } catch (err) {
    console.warn("읽기 상태 조회 실패");
    bookcaseStatus.value = null;
  }
};

/* --- 책장 상태 변경 --- */
// 읽을 목록에 추가가
const registerToBookcase = async () => {
  try {
    await bookcaseService.registerToRead(book.value);
    bookcaseStatus.value = 'TO_READ';
    alert("읽을 목록에 추가되었습니다!");
  } catch (err) {
    console.error("등록 실패", err);
    alert("등록 중 오류 발생");
  }
};
// 독서 시작
const startReading = async () => {
  try {
    await bookcaseService.startReading(book.value.bookId);
    bookcaseStatus.value = 'READING';
    alert("독서를 시작했습니다!");
  } catch (err) {
    console.error("독서 시작 실패", err);
    alert("상태 변경 중 오류 발생");
  }
};
// 독서 완료
const finishReading = async () => {
  try {
    await bookcaseService.finishReading(book.value.bookId);
    bookcaseStatus.value = 'COMPLETE';
    alert("독서를 완료했습니다!");
  } catch (err) {
    console.error("독서 완료 실패", err);
    alert("상태 변경 중 오류 발생");
  }
};

/* --- 리뷰 목록 호출 --- */
const fetchReviews = async () => {
  try {
    const { data } = await reviewService.getReviewsByBookId(book.value.bookId);
    reviews.value = data.map((review) => ({
      id: review.reviewId,
      title: review.reviewTitle,
      content: review.reviewContent,
      author: review.nickname,
      rating: review.rating,
      likes: review.likeCount,
      crtDate: dayjs(review.createdAt).format('YYYY.MM.DD'),
      updDate: dayjs(review.updatedAt).format('YYYY.MM.DD'),
      likedByUser: review.likedByUser,
    }));
  } catch (err) {
    console.error('리뷰 목록 불러오기 실패:', err);
  }
};

/* --- 리뷰 좋아요 처리 api 호출 --- */
const toggleLike = async (reviewId) => {
  try {
    const { data } = await reviewService.toggleLike(reviewId);
    const review = reviews.value.find(r => r.id === reviewId);
    if (review) {
      review.likes = data.likeCount;
      review.likedByUser = data.liked;
    }
  } catch (err) {
    console.error('좋아요 토글 실패:', err);
    alert('로그인 후 좋아요를 눌러주세요.');
  }
};

/* --- 리뷰 상세보기 --- */
const openReviewDetail = (reviewId) => {
  selectedReviewId.value = reviewId;
  showModal.value = true;
};



/* --- 초기 실행 --- */
onMounted(async () => {
  await fetchBookDetail(); // 먼저 도서 정보 가져오기
  await fetchReviews();     // 그 다음 리뷰 목록 불러오기
});
</script>

<style scoped>
.line-clamp-6 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>