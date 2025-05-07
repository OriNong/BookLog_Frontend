<template>
    <div>
        <v-container fluid class="pa-4">

            <!-- 검색 키워드 + 정렬 버튼 -->
            <v-row class="align-center mb-4">
                <v-col cols="12" sm="6">
                    <h2 class="text-h6 font-weight-medium">
                        “{{ decodedQuery }}” 검색 결과
                    </h2>
                </v-col>

                <v-col cols="12" sm="6" class="text-end">
                    <v-btn :color="sort.value === 'accuracy' ? 'primary' : 'default'" variant="tonal" class="mx-1"
                        @click="changeSort('accuracy')">
                        정확도순
                    </v-btn>
                    <v-btn :color="sort.value === 'pubdate' ? 'primary' : 'default'" variant="tonal" class="mx-1"
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
            <v-pagination v-if="totalPages > 1" v-model="page" :length="totalPages" class="mt-6"
                @update:modelValue="onPageChange" />
        </v-container>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { bookService } from '@/services/bookService';  // API 분리
import SearchResult from '@/components/book/SearchResult.vue';

/* --------------------- 상수 --------------------- */
const DEFAULT_SORT = 'accuracy';
const PAGE_LIMIT = 20;

/* --------------------- 라우터 및 상태 --------------------- */
const route = useRoute();
const router = useRouter();

const sort = ref(route.query.sort || DEFAULT_SORT);
const page = ref(Number(route.query.page) || 1);
const decodedQuery = computed(() => decodeURIComponent(route.query.query || ''));

const books = ref([]);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / PAGE_LIMIT) || 1);

const loading = ref(false);
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
    router.replace({
        query: { ...route.query, page: newPage }
    });
}

/* --------------------- 도서 검색 --------------------- */
async function fetchBooks() {
    const query = decodedQuery.value.trim();
    if (!query) {
        books.value = [];
        total.value = 0;
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const { data } = await bookService.searchBooks({
            query,
            page: page.value,
            limit: PAGE_LIMIT,
            sort: sort.value,
        });

        books.value = data.books;
        total.value = data.total;
    } catch (e) {
        console.error('도서 검색 오류:', e);
        error.value = '검색 결과를 가져오지 못했습니다.';
    } finally {
        loading.value = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/* --------------------- 쿼리 변경 감지 --------------------- */
watch(
    () => route.query,
    () => {
        page.value = Number(route.query.page) || 1;
        sort.value = route.query.sort || DEFAULT_SORT;
        fetchBooks();
    },
    { immediate: true }
);

onMounted(fetchBooks);
</script>


<style scoped>
/* 필요 시 스타일 추가 */
</style>