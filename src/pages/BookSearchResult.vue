<template>
    <div>
        <v-container fluid class="pa-4">

            <!-- 검색 키워드 + 정렬 버튼 -->
            <v-row class="align-center mb-4">
                <v-col cols="12" sm="6">
                    <h2 class="text-h6 font-weight-medium">
                        "{{ decodedQuery }}" 검색 결과
                    </h2>
                </v-col>

                <v-col cols="12" sm="6" class="text-end">
                    <v-btn :color="sort === 'accuracy' ? 'primary' : 'default'" variant="tonal" class="mx-1"
                        @click="changeSort('accuracy')">
                        정확도순
                    </v-btn>
                    <v-btn :color="sort === 'pubdate' ? 'primary' : 'default'" variant="tonal" class="mx-1"
                        @click="changeSort('pubdate')">
                        출판일순
                    </v-btn>
                </v-col>
            </v-row>

            <!-- 로딩 중 스켈레톤 -->
            <v-row v-if="loading">
                <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
                    <v-skeleton-loader type="card" />
                </v-col>
            </v-row>

            <!-- 에러 메시지 -->
            <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
                {{ error }}
            </v-alert>

            <!-- 결과 없음 -->
            <v-alert v-else-if="!loading && books.length === 0" type="info" variant="outlined" class="mb-4">
                검색 결과가 없습니다.
            </v-alert>

            <!-- 검색 결과 목록 -->
            <SearchResult v-else :books="books" />

            <!-- 페이지네이션 -->
            <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
                <!-- 이전 세트 버튼 -->
                <v-btn 
                    variant="text" 
                    :disabled="page <= paginationVisible || loading"
                    @click="moveToPageSet('prev')"
                    class="me-2"
                >
                    <v-icon>mdi-chevron-double-left</v-icon>
                    이전 세트
                </v-btn>
                
                <!-- 페이지네이션 -->
                <v-pagination
                    v-model="localPage"
                    :length="totalPages"
                    :total-visible="paginationVisible"
                    :disabled="loading"
                ></v-pagination>
                
                <!-- 다음 세트 버튼 -->
                <v-btn 
                    variant="text" 
                    :disabled="page > totalPages - paginationVisible || loading"
                    @click="moveToPageSet('next')"
                    class="ms-2"
                >
                    다음 세트
                    <v-icon>mdi-chevron-double-right</v-icon>
                </v-btn>
            </div>

            <!-- 페이지 로딩 인디케이터 -->
            <v-overlay
                v-model="pageChanging"
                :opacity="0.1"
                class="align-center justify-center"
            >
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-overlay>
        </v-container>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { bookService } from '@/services/bookService';
import SearchResult from '@/components/book/SearchResult.vue';

/* --------------------- 상수 --------------------- */
const DEFAULT_SORT = 'accuracy';
const DEFAULT_LIMIT = 20;
const PAGINATION_VISIBLE = 10; // 한 번에 보이는 페이지 버튼 수

/* --------------------- 라우터 및 상태 --------------------- */
const route = useRoute();
const router = useRouter();

const sort = ref(route.query.sort || DEFAULT_SORT);
const page = ref(Number(route.query.page) || 1);
const localPage = ref(Number(route.query.page) || 1); // 로컬 페이지 상태
const decodedQuery = computed(() => decodeURIComponent(route.query.query || ''));
const paginationVisible = ref(PAGINATION_VISIBLE);

const books = ref([]);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / DEFAULT_LIMIT) || 1);

const loading = ref(false);
const pageChanging = ref(false);  // 페이지 변경 중 상태 (부분 로딩)
const error = ref(null);

/* --------------------- 정렬 변경 --------------------- */
function changeSort(newSort) {
    if (sort.value === newSort) return;
    router.replace({
        query: { ...route.query, sort: newSort, page: 1 }
    });
}

/* --------------------- 페이지 이동 --------------------- */
function onPageChange(newPage) {
    if (newPage === page.value) return;
    pageChanging.value = true;
    router.replace({
        query: { ...route.query, page: newPage }
    });
}

/* --------------------- 페이지 세트 이동 --------------------- */
function moveToPageSet(direction) {
    let newPage;
    
    if (direction === 'prev') {
        // 이전 세트로 이동 (현재 표시되는 가장 왼쪽 페이지의 이전 세트의 첫 페이지로)
        const currentSetStart = Math.floor((page.value - 1) / paginationVisible.value) * paginationVisible.value + 1;
        newPage = Math.max(currentSetStart - paginationVisible.value, 1);
    } else {
        // 다음 세트로 이동 (현재 세트 다음의 첫 페이지로)
        const currentSetStart = Math.floor((page.value - 1) / paginationVisible.value) * paginationVisible.value + 1;
        newPage = Math.min(currentSetStart + paginationVisible.value, totalPages.value);
    }
    
    onPageChange(newPage);
}

/* --------------------- 도서 검색 --------------------- */
async function fetchBooks() {
    const query = decodedQuery.value.trim();
    if (!query) {
        books.value = [];
        total.value = 0;
        return;
    }

    if (pageChanging.value) {
        // 페이지 변경 중일 때는 전체 로딩 대신 부분 로딩 표시
        pageChanging.value = true;
    } else {
        loading.value = true;
    }
    
    error.value = null;

    try {
        const { data } = await bookService.searchBooks({
            query,
            page: page.value,
            limit: DEFAULT_LIMIT,
            sort: sort.value,
        });

        books.value = data.books;
        total.value = data.total;
        
        // 요청한 페이지가 총 페이지 수를 초과하면 마지막 페이지로 이동
        if (page.value > totalPages.value && totalPages.value > 0) {
            router.replace({
                query: { ...route.query, page: totalPages.value }
            });
            return;
        }
    } catch (e) {
        console.error('도서 검색 오류:', e);
        error.value = '검색 결과를 가져오지 못했습니다.';
    } finally {
        loading.value = false;
        pageChanging.value = false;
        
        // 스크롤 최상단으로 이동
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* --------------------- 쿼리 변경 감지 --------------------- */
watch(
    () => route.query,
    () => {
        page.value = Number(route.query.page) || 1;
        localPage.value = Number(route.query.page) || 1; // 로컬 페이지도 함께 업데이트
        sort.value = route.query.sort || DEFAULT_SORT;
        fetchBooks();
    },
    { immediate: true }
);

// localPage 변경 감지 및 페이지 이동 처리
watch(localPage, (newPage) => {
    if (newPage !== page.value) {
        onPageChange(newPage);
    }
});

onMounted(fetchBooks);
</script>

<style scoped>
.v-pagination {
    max-width: 100%;
    overflow-x: auto;
}

@media (max-width: 600px) {
    .v-pagination :deep(.v-pagination__item) {
        min-width: 32px;
        width: 32px;
        height: 32px;
    }
    
    /* 모바일에서 '이전 세트'/'다음 세트' 버튼 간소화 */
    .v-btn .v-btn__content span {
        display: none;
    }
    
    .v-btn {
        min-width: 36px;
    }
}
</style>