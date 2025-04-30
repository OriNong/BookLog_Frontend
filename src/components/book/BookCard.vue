<template>
  <v-card class="h-100 d-flex flex-column">
    <!-- 도서 썸네일 -->
    <v-img :src="book.bookImg || placeholder" height="200" cover class="rounded-t img-scale-down" />

    <!-- 제목 -->
    <v-card-title class="text-body-1 line-clamp-2">
      {{ book.bookTitle }}
    </v-card-title>

    <!-- 저자 & 출간일 -->
    <v-card-subtitle class="text-caption mb-2">
      {{ book.bookAuthor }} · {{ formattedDate }}
    </v-card-subtitle>

    <!-- 네이버 도서 책 소개 -->
    <v-card-text class="text-body-2 line-clamp-3">
      {{ book.bookDescription }}
    </v-card-text>

    <v-spacer></v-spacer>

    <!-- 버튼 -->
    <v-card-actions>
      <v-btn :to="{ name: 'BookDetail', params: { isbn: book.isbn } }" color="primary" variant="elevated" block>
        상세 보기
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

// YYYYMMDD → YYYY.MM.DD 변환
const formattedDate = computed(() => {
  const raw = props.book.bookPubDate || ''
  return raw.length === 8
    ? `${raw.slice(0, 4)}.${raw.slice(4, 6)}.${raw.slice(6)}`
    : raw
})

const placeholder =
  'https://via.placeholder.com/128x200.png?text=No+Image'
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 최대 3줄 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.img-scale-down>>>.v-img__img {
  object-fit: scale-down !important;
}
</style>