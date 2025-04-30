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
import { ref, computed, watch, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SearchResult from '@/components/book/SearchResult.vue'  // 카드 그리드 컴포넌트

// 백엔드 api 엔드포인트
const axios = inject('axios')

/* --------------------------- 상태 --------------------------- */
const route = useRoute()
const router = useRouter()

const sort = ref(route.query.sort || 'accuracy') // 정렬 상태
const books = ref([])              // 도서 결과
const loading = ref(false)           // 로딩 플래그
const error = ref(null)            // 에러 메시지

const page = ref(Number(route.query.page) || 1)   // 현재 페이지
const limit = 20                                   // 페이지당 항목 수

const decodedQuery = computed(() =>
    decodeURIComponent(route.query.query || '')
)

const total = ref(0)                          // 총 건수
const totalPages = computed(() =>
    Math.ceil(total.value / limit) || 1
)

/* -------------------- 정렬 상태 변경 함수 --------------------- */
function changeSort(newSort) {
  if (sort.value === newSort) return
  router.replace({
    query: {
      ...route.query,
      sort: newSort,
      page: 1
    }
  })
}

/* ---------------------- API 호출 함수 ----------------------- */
async function fetchBooks() {
    const query = decodedQuery.value.trim()
    if (!query) { books.value = []; return }

    loading.value = true
    error.value = null

    try {
        const { data, headers } = await axios.get('/api/books/search', {
            params: {
                query, 
                page: page.value, 
                limit, 
                sort: sort.value
            }
        })

        books.value = data
        // 총 건수를 헤더(예: X-Total-Count)로 내려준다는 가정
        total.value = Number(headers['x-total-count'] || data.length)

    } catch (e) {
        console.error(e)
        error.value = '검색 결과를 가져오지 못했습니다.'
    } finally {
        loading.value = false
        // 스크롤 맨 위로
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

/* ------------------------- 라우터 --------------------------- */
function onPageChange(newPage) {
    router.replace({
        query: { ...route.query, page: newPage }
    })
}

/* URL 쿼리(query·page) 변경 시 새로 fetch */
watch(
    () => [route.query.query, route.query.page],
    ([,]) => {
        page.value = Number(route.query.page) || 1
        sort.value = route.query.sort || 'accuracy'
        fetchBooks()
    },
    { immediate: true }
)

onMounted(fetchBooks)
</script>

<style scoped>
/* 필요 시 스타일 추가 */
</style>