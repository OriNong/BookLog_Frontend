<!-- src/layouts/HeaderBar.vue -->
<template>
    <!-- 상단 헤더 -->
    <v-app-bar height="72" elevation="3" class="header-gradient">
        <v-container fluid class="d-flex align-center">

            <!-- 좌측 로고 -->
            <v-btn to="/" variant="text" class="logo-btn" height="56" width="56">
                <!-- 로고 이미지 경로 교체 -->
                <v-img :src="logo" alt="BOOKLOG 로고" height="56" width="56" cover />
            </v-btn>

            <v-spacer />

            <!-- 가운데 pill-형 검색창 -->
            <v-text-field v-model="keyword" placeholder="도서명, 저자명으로 검색" variant="solo-filled" density="comfortable"
                append-inner-icon="mdi-magnify" rounded="pill" single-line hide-details class="search-input"
                @keydown.enter="onSearch" />

            <v-spacer />
        </v-container>
    </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo.png'   // 로고 파일 경로

const keyword = ref('')
const router = useRouter()

function onSearch() {
    const q = keyword.value.trim()
    if (!q) return
    router.push({ name: 'Search', query: { q } })
}
</script>

<style scoped>
/* 헤더에 보라-파랑 그라데이션 */
.header-gradient {
    background: linear-gradient(90deg, #667eea, #764ba2);
    color: #fff;
}

/* 로고 hover 부드럽게 확대 */
.logo-btn:hover {
    transform: scale(1.05);
    transition: transform .2s;
}

/* pill-형 검색창 폭 & blur 효과 */
.search-input {
    max-width: 640px;
    width: 100%;
    backdrop-filter: blur(4px);
}
</style>