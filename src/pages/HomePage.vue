<template>
    <v-container>
        <!-- 헤더와 페이지네이션을 포함한 상단 영역 -->
        <div class="d-flex justify-space-between align-center mb-6">
            <h1 class="text-h4">리뷰 작성 도서 목록</h1>
            <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" rounded
                @update:model-value="handlePageChange"></v-pagination>
        </div>

        <!-- 필터링 옵션 -->
        <div class="mb-4">
            <v-select v-model="sortOption" :items="sortOptions" label="정렬 기준" variant="outlined" density="compact"
                hide-details class="max-width-300" @update:model-value="sortBooks"></v-select>
        </div>

        <!-- 도서 목록 -->
        <v-row v-if="!loading && paginatedBooks.length > 0">
            <v-col v-for="book in paginatedBooks" :key="book.bookId" cols="12" sm="6" md="4" lg="3">
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
        <v-card v-else-if="!loading && paginatedBooks.length === 0" class="mt-5 pa-5">
            <div class="text-center">표시할 도서가 없습니다.</div>
        </v-card>

        <!-- 로딩 인디케이터 -->
        <div v-else class="d-flex justify-center align-center my-12">
            <v-progress-circular indeterminate color="primary" size="64" />
        </div>

        <!-- 하단 페이지네이션 (모바일 화면에서 더 나은 UX 제공) -->
        <div class="d-flex justify-center mt-6">
            <v-pagination v-if="!loading && totalPages > 1" v-model="currentPage" :length="totalPages"
                :total-visible="5" rounded @update:model-value="handlePageChange"></v-pagination>
        </div>

    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { bookService } from '@/services/bookService';

const loading = ref(true);
const books = ref([]);
const sortOption = ref('평점 높은순');
const sortOptions = ['평점 높은순', '리뷰 많은순'];
const router = useRouter();

// 페이지네이션 관련 상태
const currentPage = ref(1);
const itemsPerPage = ref(8); // 한 페이지당 표시할 도서 수

const fetchBooks = async () => {
    try {
        const { data } = await bookService.getBooksWithReview();
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

// 현재 페이지에 표시할 도서 목록
const paginatedBooks = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return sortedBooks.value.slice(startIndex, endIndex);
});

// 전체 페이지 수 계산
const totalPages = computed(() => {
    return Math.ceil(sortedBooks.value.length / itemsPerPage.value);
});

// 페이지 변경 처리
const handlePageChange = (page) => {
    currentPage.value = page;
    // 페이지 맨 위로 스크롤 (선택적)
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 정렬 옵션이 변경되면 첫 페이지로 이동
const sortBooks = () => {
    currentPage.value = 1;
};

// 도서 정보가 변경되면 페이지 재설정
watch(books, () => {
    currentPage.value = 1;
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

/* 미디어 쿼리로 반응형 레이아웃 조정 */
@media (max-width: 600px) {

    /* 모바일에서는 상단 헤더와 페이지네이션 세로 배치 */
    .d-flex.justify-space-between.align-center.mb-6 {
        flex-direction: column;
        align-items: center;
    }

    h1.text-h4 {
        margin-bottom: 20px;
    }
}
</style>