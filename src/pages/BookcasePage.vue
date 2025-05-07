<template>
    <v-container>
        <h2 class="text-h4 font-weight-bold mb-6">나의 서재</h2>

        <!-- 통계 및 필터링 섹션 -->
        <v-card class="mb-6" elevation="2">
            <v-card-text>
                <v-row align="center">
                    <!-- 통계 요약 -->
                    <v-col cols="12" md="7" class="d-flex align-center">
                        <v-sheet class="mr-4" height="100px" width="100px">
                            <v-chart :option="chartOption" autoresize />
                        </v-sheet>
                        <div>
                            <div class="text-subtitle-1 font-weight-bold mb-1">독서 현황</div>
                            <div class="d-flex flex-wrap gap-3">
                                <v-chip color="grey" variant="outlined" class="mr-2">
                                    <v-icon start>mdi-book-outline</v-icon>
                                    전체: {{ bookcase.length }}권
                                </v-chip>
                                <v-chip color="blue-grey" variant="outlined" class="mr-2">
                                    <v-icon start>mdi-bookmark-outline</v-icon>
                                    읽을 예정: {{ toReadBooks.length }}권
                                </v-chip>
                                <v-chip color="blue" variant="outlined" class="mr-2">
                                    <v-icon start>mdi-book-open-variant</v-icon>
                                    독서 중: {{ readingBooks.length }}권
                                </v-chip>
                                <v-chip color="green" variant="outlined">
                                    <v-icon start>mdi-book-check</v-icon>
                                    완료: {{ completeBooks.length }}권
                                </v-chip>
                            </div>
                        </div>
                    </v-col>

                    <!-- 필터링 옵션 -->
                    <v-col cols="12" md="5">
                        <v-btn-toggle v-model="activeFilter" color="primary" mandatory density="comfortable"
                            class="w-100">
                            <v-btn value="ALL" :text="'전체 (' + bookcase.length + ')'" rounded="lg"
                                class="flex-grow-1"></v-btn>
                            <v-btn value="TO_READ" :text="'읽을 예정 (' + toReadBooks.length + ')'" rounded="lg"
                                class="flex-grow-1"></v-btn>
                            <v-btn value="READING" :text="'독서 중 (' + readingBooks.length + ')'" rounded="lg"
                                class="flex-grow-1"></v-btn>
                            <v-btn value="COMPLETED" :text="'완료 (' + completeBooks.length + ')'" rounded="lg"
                                class="flex-grow-1"></v-btn>
                        </v-btn-toggle>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- 책이 없을 때 메시지 -->
        <v-card v-if="filteredBooks.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" icon="mdi-book-search-outline"></v-icon>
            <div class="text-h6 mt-4 mb-2">책이 없습니다</div>
            <div class="text-body-1 text-grey">
                {{ activeFilter === 'ALL' ? '서재에 책을 추가해보세요!' :
                    activeFilter === 'TO_READ' ? '읽을 예정인 책을 추가해보세요!' :
                        activeFilter === 'READING' ? '독서를 시작해보세요!' : '독서를 완료해보세요!' }}
            </div>
        </v-card>

        <!-- 책 그리드 -->
        <v-row v-else>
            <v-col v-for="book in filteredBooks" :key="book.bookId" cols="12" sm="6" md="4" lg="3" class="book-column">
                <bookcase-card :book="book" :status="book.readingStatus" @start-reading="startReading"
                    @finish-reading="finishReading" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { bookcaseService } from '@/services/bookcaseService';
import BookcaseCard from '@/components/book/BookcaseCard.vue';

// ECharts 라이브러리 사용을 위한 설정
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([
    CanvasRenderer,
    PieChart,
    TooltipComponent,
    LegendComponent
]);

const bookcase = ref([]);
const activeFilter = ref('ALL');
const isLoading = ref(false);

// 필터링된 책 목록
const filteredBooks = computed(() => {
    if (activeFilter.value === 'ALL') {
        return bookcase.value;
    }
    return bookcase.value.filter(book => book.readingStatus === activeFilter.value);
});

// 상태별 책 목록 (통계용)
const toReadBooks = computed(() =>
    bookcase.value.filter(book => book.readingStatus === 'TO_READ')
);
const readingBooks = computed(() =>
    bookcase.value.filter(book => book.readingStatus === 'READING')
);
const completeBooks = computed(() =>
    bookcase.value.filter(book => book.readingStatus === 'COMPLETED')
);

// 차트 옵션
const chartOption = computed(() => {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}권 ({d}%)'
        },
        series: [
            {
                type: 'pie',
                radius: ['50%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false
                },
                data: [
                    { value: toReadBooks.value.length, name: '읽을 예정', itemStyle: { color: '#78909C' } },
                    { value: readingBooks.value.length, name: '독서 중', itemStyle: { color: '#2196F3' } },
                    { value: completeBooks.value.length, name: '완료', itemStyle: { color: '#4CAF50' } }
                ]
            }
        ]
    };
});

/* --- 서재 목록 조회 --- */
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

/* --- 독서 시작 --- */
const startReading = async (bookId) => {
    try {
        await bookcaseService.startReading(bookId);
        await fetchBookcase();
    } catch (err) {
        console.error('독서 시작 실패:', err);
    }
};

/* --- 독서 완료 --- */
const finishReading = async (bookId) => {
    try {
        await bookcaseService.finishReading(bookId);
        await fetchBookcase();
    } catch (err) {
        console.error('독서 완료 실패:', err);
    }
};

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