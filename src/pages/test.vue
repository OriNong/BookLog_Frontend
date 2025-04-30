<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-6 text-center">도서 검색</h1>

        <!-- 검색 입력 폼 -->
        <div class="mb-6">
            <div class="flex gap-2">
                <input v-model="searchQuery" @keyup.enter="searchBooks" type="text" placeholder="검색어를 입력하세요"
                    class="flex-1 p-2 border border-gray-300 rounded" />
                <button @click="searchBooks" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    검색
                </button>
            </div>
        </div>

        <!-- 정렬 옵션 -->
        <div class="mb-4" v-if="books.length > 0">
            <div class="flex gap-2 items-center">
                <span class="font-medium">정렬:</span>
                <button @click="sortBy('sim')" class="px-3 py-1 rounded"
                    :class="sortOption === 'sim' ? 'bg-blue-500 text-white' : 'bg-gray-200'">
                    정확도순
                </button>
                <button @click="sortBy('date')" class="px-3 py-1 rounded"
                    :class="sortOption === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-200'">
                    출간일순
                </button>
            </div>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading" class="text-center my-8">
            <p class="text-gray-600">검색 중...</p>
        </div>

        <!-- 검색 결과 없음 -->
        <div v-else-if="searchPerformed && books.length === 0" class="text-center my-8">
            <p class="text-gray-600">검색 결과가 없습니다.</p>
        </div>

        <!-- 검색 결과 목록 -->
        <div v-else-if="books.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(book, index) in books" :key="index"
                class="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div class="flex p-4">
                    <!-- 책 이미지 -->
                    <div class="w-1/4 flex-shrink-0">
                        <img :src="book.image" :alt="book.title" class="w-full object-contain h-40"
                            @error="handleImageError($event)" />
                    </div>

                    <!-- 책 정보 -->
                    <div class="w-3/4 pl-4">
                        <h2 class="text-lg font-bold mb-2" v-html="book.title"></h2>
                        <p class="text-sm mb-1">
                            <span class="font-medium">저자:</span> <span v-html="book.author"></span>
                        </p>
                        <p class="text-sm mb-1">
                            <span class="font-medium">출판사:</span> <span v-html="book.publisher"></span>
                        </p>
                        <p class="text-sm mb-1">
                            <span class="font-medium">출간일:</span> {{ formatDate(book.pubDate || book.pubdate) }}
                        </p>
                        <p class="text-sm mb-3 line-clamp-3" v-html="book.description"></p>

                        <a :href="book.link" target="_blank"
                            class="inline-block bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                            도서 상세 보기
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="books.length > 0" class="mt-6 flex justify-center gap-2">
            <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border rounded"
                :class="currentPage === 1 ? 'text-gray-400 border-gray-200' : 'border-gray-300 hover:bg-gray-100'">
                이전
            </button>

            <span class="px-3 py-1">{{ currentPage }} / {{ totalPages }}</span>

            <button @click="nextPage" :disabled="currentPage >= totalPages" class="px-3 py-1 border rounded"
                :class="currentPage >= totalPages ? 'text-gray-400 border-gray-200' : 'border-gray-300 hover:bg-gray-100'">
                다음
            </button>
        </div>
    </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
    setup() {
        const searchQuery = ref('');
        const books = ref([]);
        const loading = ref(false);
        const searchPerformed = ref(false);
        const currentPage = ref(1);
        const totalResults = ref(0);
        const sortOption = ref('sim'); // 'sim': 정확도순, 'date': 출간일순

        // 페이지당 결과 수
        const itemsPerPage = 10;

        // 총 페이지 수 계산
        const totalPages = computed(() => {
            return Math.ceil(totalResults.value / itemsPerPage);
        });

        // 도서 검색 함수
        const searchBooks = async () => {
            if (!searchQuery.value.trim()) return;

            loading.value = true;
            books.value = [];

            try {
                // Spring Boot 백엔드 API 호출
                const response = await fetch(`/search?query=${encodeURIComponent(searchQuery.value)}&sort=${getSortParam()}&page=${currentPage.value}&limit=${itemsPerPage}`);

                if (!response.ok) {
                    throw new Error(`API 요청 실패: ${response.status}`);
                }

                const data = await response.json();
                books.value = data; // 백엔드에서 BookVO 리스트 반환

                // 총 결과 수는 헤더에서 가져오거나 추가 API 호출로 얻을 수 있습니다
                // 현재는 간단히 결과 크기로 설정합니다
                totalResults.value = data.length > 0 ? data.length + (currentPage.value - 1) * itemsPerPage : 0;
                searchPerformed.value = true;
            } catch (error) {
                console.error('도서 검색 중 오류가 발생했습니다:', error);
                alert('검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                loading.value = false;
            }
        };

        // 이전 페이지로 이동
        const prevPage = () => {
            if (currentPage.value > 1) {
                currentPage.value--;
                searchBooks();
            }
        };

        // 다음 페이지로 이동
        const nextPage = () => {
            if (currentPage.value < totalPages.value) {
                currentPage.value++;
                searchBooks();
            }
        };

        // 정렬 옵션 변경
        const sortBy = (option) => {
            if (sortOption.value !== option) {
                sortOption.value = option;
                currentPage.value = 1; // 정렬 변경 시 첫 페이지로 이동
                searchBooks();
            }
        };

        // 백엔드 API에 맞는 정렬 파라미터 반환
        const getSortParam = () => {
            // 'sim': 정확도순, 'date': 출간일순
            return sortOption.value === 'sim' ? 'accuracy' : 'date';
        };

        // 날짜 포맷 함수
        const formatDate = (dateString) => {
            if (!dateString) return '';

            // YYYYMMDD 형식을 YYYY-MM-DD 형식으로 변환
            return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
        };

        // 이미지 로드 오류 처리
        const handleImageError = (event) => {
            event.target.src = 'https://via.placeholder.com/100x150?text=No+Image';
        };

        // 예시 데이터 생성 함수 (실제 구현에서는 제거)
        const generateMockData = (query, page, sort) => {
            const mockBooks = [];
            const startIndex = (page - 1) * itemsPerPage;

            for (let i = 0; i < itemsPerPage; i++) {
                const index = startIndex + i;
                if (index >= 100) break; // 최대 100개 결과로 제한

                mockBooks.push({
                    title: `${query}에 관한 책 ${index + 1}`,
                    link: `https://book.naver.com/bookdb/book_detail.nhn?bid=${100000 + index}`,
                    image: index % 3 === 0 ? 'invalid-url' : `https://via.placeholder.com/100x150?text=Book+${index + 1}`,
                    author: `저자 ${(index % 5) + 1}`,
                    publisher: `출판사 ${(index % 7) + 1}`,
                    pubdate: sort === 'date'
                        ? `202${4 - Math.floor(index / 25)}${String(12 - (index % 12)).padStart(2, '0')}${String((index % 28) + 1).padStart(2, '0')}`
                        : `20200${String((index % 9) + 1).padStart(2, '0')}${String((index % 28) + 1).padStart(2, '0')}`,
                    description: `이 책은 ${query}에 관한 내용을 다루고 있습니다. 이 책의 주요 내용은 ${query}의 기본 개념과 응용 방법에 대해 설명합니다. 독자들은 이 책을 통해 ${query}에 대한 이해도를 높일 수 있습니다.`
                });
            }

            // 정렬 옵션에 따라 정렬
            if (sort === 'date') {
                mockBooks.sort((a, b) => b.pubdate.localeCompare(a.pubdate));
            }

            return {
                total: 87, // 총 결과 수
                items: mockBooks
            };
        };

        return {
            searchQuery,
            books,
            loading,
            currentPage,
            totalPages,
            sortOption,
            searchPerformed,
            searchBooks,
            prevPage,
            nextPage,
            sortBy,
            formatDate,
            handleImageError,
            getSortParam
        };
    }
}
</script>