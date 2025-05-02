<template>
  <v-container>
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
        <v-btn class="me-2" color="primary">읽을 목록에 추가</v-btn>
        <v-btn color="success">독서 시작</v-btn>
      </v-col>
    </v-row>

    <!-- 리뷰 정렬 -->
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

    <!-- 리뷰 목록 -->
    <v-row>
      <v-col v-for="review in reviews" :key="review.id" cols="12" md="6">
        <v-card class="pa-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <div>
              <strong>{{ review.title }}</strong>
              <div class="text-caption">by {{ review.author }}</div>
            </div>
            <v-rating :model-value="review.rating" readonly size="small" color="amber" half-increments />
          </div>
          <div class="text-body-2 mb-2">❤️ {{ review.likes }} 좋아요</div>
          <div class="text-caption text-grey">작성일: {{ review.date }}</div>
          <div class="text-end mt-2">
            <v-btn size="small" variant="outlined" class="me-2">상세보기</v-btn>
            <v-btn size="small" color="pink" variant="tonal">좋아요</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'

const axios = inject('axios')

const route = useRoute()
const isbn = route.params.isbn

const book = ref({})
const reviewSort = ref('date')

// 도서 정보 조회
onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/books/${isbn}`)
    book.value = data
  } catch (e) {
    console.error('도서 정보를 불러오지 못했습니다', e)
  }
})

// 더미 리뷰 목록
const reviews = ref([
  {
    id: 1,
    title: '좋은 책입니다',
    author: 'minsoo',
    rating: 5,
    likes: 8,
    date: '2024-10-22'
  },
  {
    id: 2,
    title: '조금 지루했어요',
    author: 'reader92',
    rating: 3,
    likes: 3,
    date: '2024-09-19'
  }
])
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