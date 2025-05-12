<template>
    <v-container>
        <h1 class="text-h4 mb-6">리뷰 작성 도서 목록</h1>

        <!-- 필터링 옵션 -->
        <div class="mb-4">
            <v-select v-model="sortOption" :items="sortOptions" label="정렬 기준" variant="outlined" density="compact"
                hide-details class="max-width-300" @update:model-value="sortBooks"></v-select>
        </div>

        <!-- 도서 목록 -->
        <v-row v-if="!loading && sortedBooks.length > 0">
            <v-col v-for="book in sortedBooks" :key="book.bookId" cols="12" sm="6" md="4" lg="3">
                <v-card height="100%" class="d-flex flex-column book-card" @click="navigateToBookDetail(book.isbn)"
                    elevation="3" hover>
                    <v-img :src="book.bookImg" height="200" cover class="rounded-t img-scale-down" loading="lazy">
                        <template #placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                                <v-progress-circular indeterminate color="grey-lighten-5" />
                            </v-row>
                        </template>
                    </v-img>

                    <v-card-item>
                        <v-card-title class="text-subtitle-1 font-weight-bold">
                            {{ book.title }}
                        </v-card-title>
                        <v-card-subtitle>{{ book.author }}</v-card-subtitle>
                    </v-card-item>

                    <v-card-text class="pt-0">
                        <div class="d-flex align-center mb-1">
                            <v-rating :model-value="book.rating" color="amber" density="compact" half-increments
                                readonly size="small" />
                            <span class="ml-2 text-body-2">
                                {{ book.rating.toFixed(1) }}
                            </span>
                        </div>
                        <div class="text-body-2">리뷰 {{ book.reviewCount }}개</div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- 데이터가 없을 경우 -->
        <v-card v-else-if="!loading && sortedBooks.length === 0" class="mt-5 pa-5">
            <div class="text-center">표시할 도서가 없습니다.</div>
        </v-card>

        <!-- 로딩 인디케이터 -->
        <div v-else class="d-flex justify-center align-center my-12">
            <v-progress-circular indeterminate color="primary" size="64" />
        </div>

    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { bookService } from '@/services/bookService';

const loading = ref(true);
const books = ref([]);
const sortOption = ref('평점 높은순');
const sortOptions = ['평점 높은순', '리뷰 많은순'];
const router = useRouter();

const fetchBooks = async () => {
    try {
        const { data } = await bookService.getBooksWithReview(); // ✅ 함수 호출 형식 수정
        books.value = data;
    } catch (err) {
        console.error('도서 정보를 불러오는 데 실패했습니다:', err);
    } finally {
        loading.value = false;
    }
};

const sortedBooks = computed(() => {
    const sorted = [...books.value];
    if (sortOption.value === '평점 높은순') {
        return sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortOption.value === '리뷰 많은순') {
        return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return sorted;
});


const navigateToBookDetail = (isbn) => {
    router.push({ name: 'BookDetail', params: { isbn } });
};

onMounted(fetchBooks);
</script>



<style scoped>
.book-card {
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
}

.book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
}

.max-width-300 {
    max-width: 300px;
}

.img-scale-down>>>.v-img__img {
    object-fit: scale-down !important;
}
</style>