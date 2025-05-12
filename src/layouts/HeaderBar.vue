<template>
    <v-app-bar app height="72" elevation="3" class="header-gradient">
        <v-container fluid>
            <v-row align="center" justify="space-between" no-gutters>

                <!-- 좌측: 메뉴 + 로고 -->
                <v-col class="d-flex align-center" cols="auto">
                    <v-btn icon @click="$emit('toggle-drawer')">
                        <v-icon>mdi-menu</v-icon>
                    </v-btn>
                </v-col>

                <!-- 중앙: 검색창 -->
                <v-col class="d-flex justify-center px-4">
                    <v-text-field v-model="keyword" placeholder="도서명, 저자명으로 검색" variant="solo-filled"
                        density="comfortable" append-inner-icon="mdi-magnify" rounded="pill" hide-details
                        class="search-input" @keydown.enter="onSearch" />
                </v-col>

                <!-- 우측: 프로필 드롭다운 -->
                <v-col cols="auto" class="d-flex justify-end align-center"
                    v-if="authStore.isAuthenticated && authStore.user">
                    <v-menu offset-y>
                        <template #activator="{ props }">
                            <v-btn icon v-bind="props">
                                <v-icon color="white">mdi-account-circle</v-icon>
                            </v-btn>
                        </template>

                        <v-list>
                            <v-list-item>
                                <v-list-item-title class="font-weight-medium">
                                    {{ authStore.user.nickname }} 님
                                </v-list-item-title>
                                <v-list-item-subtitle>{{ authStore.user.email }}</v-list-item-subtitle>
                            </v-list-item>

                            <v-divider />

                            <v-list-item @click="handleLogout">
                                <v-list-item-title>로그아웃</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-col>
                <v-col cols="auto" class="d-flex justify-end align-center" v-else>
                    <v-btn to="/" variant="outlined" color="white">로그인</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-app-bar>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
//import logo from '@/assets/logo.png';

const keyword = ref('');
const router = useRouter();
const authStore = useAuthStore();

function onSearch() {
    const query = keyword.value.trim();
    if (!query) return;
    router.push({ name: 'Search', query: { query } });
    keyword.value = '';
}

const handleLogout = async () => {
    await authStore.logout();
    router.push('/');
};
</script>

<style scoped>
.header-gradient {
    background: linear-gradient(90deg, #667eea, #764ba2);
    color: white;
}

.logo-btn:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
}

.search-input {
    max-width: 640px;
    width: 100%;
    backdrop-filter: blur(4px);
}
</style>