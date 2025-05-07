<template>
    <v-card elevation="2" class="book-card h-100">
        <!-- 책 표지 이미지 -->
        <v-img :src="book.bookImg" height="180px" cover class="book-image" loading="lazy">
            <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-progress-circular indeterminate color="grey-lighten-3"></v-progress-circular>
                </v-row>
            </template>
            <div class="status-badge" :class="statusClass">
                {{ statusText }}
            </div>
        </v-img>

        <v-card-title class="text-truncate pt-3 pb-1">{{ book.bookTitle }}</v-card-title>
        <v-card-subtitle class="text-truncate pb-1">{{ book.bookAuthor }}</v-card-subtitle>

        <v-card-text class="px-3 py-2">
            <span :class="statusTextClass">{{ book.statusText }}</span>
        </v-card-text>

        <!-- 액션 버튼 -->
        <v-card-actions class="pt-0 px-3 pb-3">
            <template v-if="status === 'TO_READ'">
                <v-btn color="primary" variant="elevated" block @click="$emit('start-reading', book.bookId)">
                    <v-icon start>mdi-book-open-page-variant</v-icon>
                    독서 시작
                </v-btn>
            </template>

            <template v-else-if="status === 'READING'">
                <v-btn color="success" variant="elevated" block @click="$emit('finish-reading', book.bookId)">
                    <v-icon start>mdi-book-check</v-icon>
                    독서 완료
                </v-btn>
            </template>

            <template v-else-if="status === 'COMPLETED'">
                <v-btn color="blue-grey" variant="text" block to="/reviews" disabled>
                    <v-icon start>mdi-comment-text-outline</v-icon>
                    리뷰 작성
                </v-btn>
            </template>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    book: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: 'TO_READ',
        validator: (value) => ['TO_READ', 'READING', 'COMPLETED'].includes(value)
    }
});

// 상태에 따른 스타일 클래스
const statusClass = computed(() => {
    switch (props.status) {
        case 'TO_READ': return 'to-read-badge';
        case 'READING': return 'reading-badge';
        case 'COMPLETED': return 'completed-badge';
        default: return '';
    }
});

// 상태에 따른 텍스트 클래스
const statusTextClass = computed(() => {
    switch (props.status) {
        case 'TO_READ': return 'text-grey-darken-1';
        case 'READING': return 'text-blue-darken-2 font-weight-medium';
        case 'COMPLETED': return 'text-success-darken-2 font-weight-medium';
        default: return '';
    }
});

// 상태 표시 텍스트
const statusText = computed(() => {
    switch (props.status) {
        case 'TO_READ': return '읽을 예정';
        case 'READING': return '독서 중';
        case 'COMPLETED': return '완료';
        default: return '';
    }
});

defineEmits(['start-reading', 'finish-reading']);
</script>

<style scoped>
.book-card {
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
    border-radius: 12px;
}

.book-image {
    position: relative;
    background-color: #f5f5f5;
}

.book-image :deep(.v-img__img) {
    object-fit: scale-down !important;
}

.status-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.to-read-badge {
    background-color: #78909C;
}

.reading-badge {
    background-color: #2196F3;
}

.completed-badge {
    background-color: #4CAF50;
}
</style>