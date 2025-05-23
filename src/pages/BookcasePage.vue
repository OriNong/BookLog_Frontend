<template>
    <v-container>
        <v-row class="mb-4" align="center" justify="space-between">
            <v-col cols="auto">
                <h2 class="text-h4 font-weight-bold mb-6">{{ auth.user?.nickname }}님의 서재</h2>
            </v-col>
            <v-col cols="auto">
                <BackButton />
            </v-col>
        </v-row>

        <!-- 통계 및 필터링 + 페이지네이션 -->
        <v-card class="mb-6" elevation="2">
            <v-card-text>
                <v-row align="center" justify="space-between">
                    <!-- 왼쪽 화살표 -->
                    <v-col cols="auto" class="d-flex align-center">
                        <v-btn icon variant="text" size="large" :disabled="currentPage === 1" @click="previousPage"
                            color="primary">
                            <v-icon size="28">mdi-chevron-left</v-icon>
                        </v-btn>
                    </v-col>

                    <!-- 중앙: 차트 + 칩 + 페이지 정보 -->
                    <v-col class="d-flex align-center justify-center">
                        <v-sheet class="mr-4" height="100px" width="100px">
                            <v-chart :option="chartOption" autoresize />
                        </v-sheet>

                        <div class="text-center">
                            <div class="text-subtitle-1 font-weight-bold mb-1">독서 현황</div>
                            <div class="d-flex flex-wrap justify-center gap-3 mb-2">
                                <v-chip :color="activeFilter === 'ALL' ? 'primary' : 'grey'" variant="outlined"
                                    class="mr-2 cursor-pointer" @click="changeFilter('ALL')">
                                    <v-icon start>mdi-book-outline</v-icon>
                                    전체: {{ bookcase.length }}권
                                </v-chip>

                                <v-chip :color="activeFilter === 'TO_READ' ? 'primary' : 'blue-grey'" variant="outlined"
                                    class="mr-2 cursor-pointer" @click="changeFilter('TO_READ')">
                                    <v-icon start>mdi-bookmark-outline</v-icon>
                                    읽을 예정: {{ statusBooks.TO_READ.length }}권
                                </v-chip>

                                <v-chip :color="activeFilter === 'READING' ? 'primary' : 'blue'" variant="outlined"
                                    class="mr-2 cursor-pointer" @click="changeFilter('READING')">
                                    <v-icon start>mdi-book-open-variant</v-icon>
                                    독서 중: {{ statusBooks.READING.length }}권
                                </v-chip>

                                <v-chip :color="activeFilter === 'COMPLETED' ? 'primary' : 'green'" variant="outlined"
                                    class="cursor-pointer" @click="changeFilter('COMPLETED')">
                                    <v-icon start>mdi-book-check</v-icon>
                                    완료: {{ statusBooks.COMPLETED.length }}권
                                </v-chip>
                            </div>

                            <!-- 페이지 정보 -->
                            <div class="text-caption text-grey-darken-1" v-if="filteredBooks.length > 0">
                                {{ currentPage }} / {{ totalPages }} 페이지
                                ({{ ((currentPage - 1) * itemsPerPage + 1) }}-{{ Math.min(currentPage * itemsPerPage,
                                    filteredBooks.length) }} / {{ filteredBooks.length }}권)
                            </div>
                        </div>
                    </v-col>

                    <!-- 오른쪽 화살표 -->
                    <v-col cols="auto" class="d-flex align-center">
                        <v-btn icon variant="text" size="large"
                            :disabled="currentPage === totalPages || totalPages === 0" @click="nextPage"
                            color="primary">
                            <v-icon size="28">mdi-chevron-right</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- 책 없음 메시지 -->
        <v-card v-if="paginatedBooks.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" icon="mdi-book-search-outline"></v-icon>
            <div class="text-h6 mt-4 mb-2">책이 없습니다</div>
            <div class="text-body-1 text-grey">
                {{ activeFilter === 'ALL' ? '서재에 책을 추가해보세요!' :
                    activeFilter === 'TO_READ' ? '읽을 예정인 책을 추가해보세요!' :
                        activeFilter === 'READING' ? '독서를 시작해보세요!' : '독서를 완료해보세요!' }}
            </div>
        </v-card>

        <!-- 책 그리드 (페이지네이션 적용) -->
        <v-row v-else>
            <v-col v-for="book in paginatedBooks" :key="book.bookId" cols="12" sm="6" md="4" lg="3" class="book-column">
                <bookcase-card :book="book" :status="book.readingStatus" @start-reading="startReading"
                    @finish-reading="finishReading" @rollback="rollbackReading" @delete="deleteBook" />
            </v-col>
        </v-row>

        <!-- 하단 페이지네이션 (선택사항) -->
        <v-row v-if="totalPages > 1" class="mt-6" justify="center">
            <v-col cols="auto">
                <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" color="primary"
                    rounded="circle" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { bookcaseService } from '@/services/bookcaseService';
import BookcaseCard from '@/components/book/BookcaseCard.vue';

// ECharts 설정
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import BackButton from '@/components/common/BackButton.vue';

use([
    CanvasRenderer,
    PieChart,
    TooltipComponent,
    LegendComponent
]);

const auth = useAuthStore();
const bookcase = ref([]);
const activeFilter = ref('ALL');
const isLoading = ref(false);

// 페이지네이션 관련
const currentPage = ref(1);
const itemsPerPage = 8;

// 상태별 분류
const statusBooks = computed(() => {
    return {
        TO_READ: bookcase.value.filter(book => book.readingStatus === 'TO_READ'),
        READING: bookcase.value.filter(book => book.readingStatus === 'READING'),
        COMPLETED: bookcase.value.filter(book => book.readingStatus === 'COMPLETED')
    };
});

// 필터링된 목록
const filteredBooks = computed(() => {
    if (activeFilter.value === 'ALL') return bookcase.value;
    return statusBooks.value[activeFilter.value] || [];
});

// 페이지네이션 적용된 목록
const paginatedBooks = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredBooks.value.slice(start, end);
});

// 총 페이지 수
const totalPages = computed(() => {
    return Math.ceil(filteredBooks.value.length / itemsPerPage);
});

// 페이지네이션 함수들
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const previousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

// 필터 변경 시 첫 페이지로 이동
const changeFilter = (filter) => {
    activeFilter.value = filter;
    currentPage.value = 1;
};

// 차트 옵션
const chartOption = computed(() => ({
    tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}권 ({d}%)'
    },
    series: [
        {
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: { show: false },
            data: [
                { value: statusBooks.value.TO_READ.length, name: '읽을 예정', itemStyle: { color: '#78909C' } },
                { value: statusBooks.value.READING.length, name: '독서 중', itemStyle: { color: '#2196F3' } },
                { value: statusBooks.value.COMPLETED.length, name: '완료', itemStyle: { color: '#4CAF50' } }
            ]
        }
    ]
}));

// 서재 목록
const fetchBookcase = async () => {
    isLoading.value = true;
    try {
        const { data } = await bookcaseService.getBookcase();
        bookcase.value = data;
    } catch (err) {
        console.error('서재 불러오기 실패:', err);
    } finally {
        isLoading.value = false;
    }
};

// 독서 상태 변경
const startReading = async (bookId) => {
    try {
        await bookcaseService.startReading(bookId);
        await fetchBookcase();
    } catch (err) {
        console.error('독서 시작 실패:', err);
        alert(err.response.data.message);
    }
};

const finishReading = async (bookId) => {
    try {
        await bookcaseService.finishReading(bookId);
        await fetchBookcase();
    } catch (err) {
        console.error('독서 완료 실패:', err);
        alert(err.response.data.message);
    }
};

// 독서 상태 되돌리기
const rollbackReading = async (bookcaseId) => {
    try {
        await bookcaseService.rollbackReading(bookcaseId);
        await fetchBookcase(); // 최신화
    } catch (error) {
        alert(error.response?.data?.message || "상태 변경에 실패했습니다.");
    }
}

// 서재에서 도서 삭제
const deleteBook = async (bookcaseId) => {
    try {
        if (confirm("정말 삭제하시겠습니까?")) {
            await bookcaseService.deleteBook(bookcaseId);
            await fetchBookcase();

            // 현재 페이지에 책이 없으면 이전 페이지로 이동
            if (paginatedBooks.value.length === 0 && currentPage.value > 1) {
                currentPage.value--;
            }
        }
    } catch (error) {
        alert(error.response?.data?.message || "삭제가 정상적으로 처리되지 않았습니다");
    }
}

onMounted(fetchBookcase);
</script>

<style scoped>
.book-column {
    transition: transform 0.2s;
}

.book-column:hover {
    transform: translateY(-5px);
}

.w-100 {
    width: 100%;
}

.cursor-pointer {
    cursor: pointer;
}

/* 반응형 필터링 버튼 */
@media (max-width: 600px) {
    .v-btn-toggle {
        flex-wrap: wrap;
    }

    .v-btn-toggle .v-btn {
        margin: 2px;
        border-radius: 8px !important;
    }
}
</style>