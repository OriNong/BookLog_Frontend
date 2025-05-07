<template>
    <v-app-bar height="72" elevation="3" class="header-gradient">
        <v-container fluid class="d-flex align-center">
            <!-- 좌측 로고 -->
            <v-btn to="/main" variant="text" class="logo-btn" height="56" width="56">
                <v-img :src="logo" alt="BOOKLOG 로고" height="56" width="56" cover />
            </v-btn>

            <v-spacer />

            <!-- 가운데 검색창 -->
            <v-text-field v-model="keyword" placeholder="도서명, 저자명으로 검색" variant="solo-filled" density="comfortable"
                append-inner-icon="mdi-magnify" rounded="pill" single-line hide-details class="search-input"
                @keydown.enter="onSearch" />

            <v-spacer />

            <!-- 로그인 상태에 따라 버튼/닉네임 출력 -->
            <div class="d-flex align-center">
                <span v-if="authStore.isAuthenticated && authStore.user" class="mr-2 text-white font-weight-medium">
                    {{ authStore.user.nickname }} 님
                </span>

                <v-btn v-if="!authStore.isAuthenticated" to="/" variant="outlined" class="ml-2" color="white">
                    로그인
                </v-btn>

                <v-btn v-else @click="handleLogout" variant="outlined" class="ml-2" color="white">
                    로그아웃
                </v-btn>
            </div>
        </v-container>
    </v-app-bar>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import logo from '@/assets/logo.png'

const keyword = ref('')
const router = useRouter()
const authStore = useAuthStore()

function onSearch() {
    const query = keyword.value.trim()
    if (!query) return
    router.push({ name: 'Search', query: { query } })
    // 검색 실행 후 검색창 입력값 초기화
    keyword.value = ''
}

const handleLogout = async () => {
    await authStore.logout()
    router.push('/')
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