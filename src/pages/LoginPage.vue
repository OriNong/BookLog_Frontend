<template>
    <!-- 화면 가운데 카드 형태로 배치 -->
    <v-container class="fill-height d-flex align-center justify-center">
        <v-card width="420" elevation="8" rounded="lg">
            <!-- 로고 / 타이틀 -->
            <v-card-title class="text-h4 text-center py-6">BookLog</v-card-title>
            <v-card-subtitle class="text-center pb-4">로그인</v-card-subtitle>

            <v-card-text>
                <!-- 오류 메시지 -->
                <v-alert v-if="error" type="error" variant="outlined" class="mb-4" density="comfortable">
                    {{ error }}
                </v-alert>

                <!-- 로그인 폼 -->
                <v-form @submit.prevent="handleLogin">
                    <v-text-field v-model="email" label="이메일" type="email" prepend-inner-icon="mdi-email"
                        autocomplete="username" density="comfortable" required />

                    <v-text-field v-model="password" label="비밀번호" type="password" prepend-inner-icon="mdi-lock"
                        autocomplete="current-password" density="comfortable" required class="mt-3" />

                    <v-btn block class="mt-6" color="primary" type="submit" :loading="loading" :disabled="loading">
                        로그인
                    </v-btn>
                </v-form>

                <!-- 링크 영역 -->
                <div class="d-flex justify-space-between mt-6">
                    <RouterLink to="/findPassword" class="text-subtitle-2">
                        비밀번호 찾기
                    </RouterLink>
                    <RouterLink to="/register" class="text-subtitle-2">
                        회원가입
                    </RouterLink>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
    error.value = '';
    loading.value = true;

    try {
        await authStore.login(email.value, password.value);
        router.push('/');
    } catch (err) {
        error.value = err.response?.data?.message || '로그인에 실패했습니다.';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    width: 100%;
    padding: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background-color: #cccccc;
}

.error-message {
    color: red;
    margin-bottom: 15px;
}

.register-link {
    margin-top: 15px;
    text-align: center;
}

.findPassword-link {
    margin-top: 15px;
    text-align: center;
}
</style>