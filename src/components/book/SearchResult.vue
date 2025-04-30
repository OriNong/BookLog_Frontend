<template>
    <v-row dense>
        <v-col v-for="book in books" :key="book.isbn || book.link" cols="12" sm="6" md="4" lg="3">
            <!-- 개별 도서 카드 -->
            <BookCard :book="book" />
        </v-col>
    </v-row>
</template>

<script setup>
import { defineProps } from 'vue'
import BookCard from './BookCard.vue';

defineProps({
    /** 백엔드에서 받아온 도서 배열 */
    books: {
        type: Array,
        required: true,
        default: () => []
    }
})
</script>