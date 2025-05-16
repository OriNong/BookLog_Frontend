<template>
    <v-container>
        <v-row class="mb-4" align="center" justify="space-between">
            <v-col cols="auto">
                <h2  class="text-h4 font-weight-bold mb-6">{{ auth.user?.nickname }}님의 서재</h2>
            </v-col>
            <v-col cols="auto">
                <BackButton />
            </v-col>
        </v-row>
        <!-- 통계 및 필터링 -->
        <v-card class="mb-6" elevation="2">
            <v-card-text>
                <v-row align="center"> <!-- row 자체도 중앙 정렬 -->
                    <!-- 차트 + 칩 -->
                    <v-col cols="12" md="8" class="d-flex align-center justify-center">
                        <v-sheet class="mr-4" height="100px" width="100px">
                            <v-chart :option="chartOption" autoresize />
                        </v-sheet>

                        <div class="text-align">
                            <div class="text-subtitle-1 font-weight-bold mb-1">독서 현황</div>
                            <div class="d-flex flex-wrap justify-center gap-3">
                                <v-chip :color="activeFilter === 'ALL' ? 'primary' : 'grey'" variant="outlined"
                                    class="mr-2 cursor-pointer" @click="activeFilter = 'ALL'">
                                    <v-icon start>mdi-book-outline</v-icon>
                                    전체: {{ bookcase.length }}권
                                </v-chip>

                                <v-chip :color="activeFilter === 'TO_READ' ? 'primary' : 'blue-grey'" variant="outlined"
                                    class="mr-2 cursor-pointer" @click="activeFilter = 'TO_READ'">
                                    <v-icon start>mdi-bookmark-outline</v-icon>
                                    읽을 예정: {{ statusBooks.TO_READ.length }}권
                                </v-chip>

                                <v-chip :color="activeFilter === 'READING' ? 'primary' : 'blue'" variant="outlined"
                                    class="mr-2 cursor-pointer" @click="activeFilter = 'READING'">
                                    <v-icon start>mdi-book-open-variant</v-icon>
                                    독서 중: {{ statusBooks.READING.length }}권
                                </v-chip>

                                <v-chip :color="activeFilter === 'COMPLETED' ? 'primary' : 'green'" variant="outlined"
                                    class="cursor-pointer" @click="activeFilter = 'COMPLETED'">
                                    <v-icon start>mdi-book-check</v-icon>
                                    완료: {{ statusBooks.COMPLETED.length }}권
                                </v-chip>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>


        <!-- 책 없음 메시지 -->
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
    }
};

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