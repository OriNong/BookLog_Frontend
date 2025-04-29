<template>
    <div class="login-container">
        <h1>BookLog</h1>
        <h2>로그인</h2>
        <div v-if="error" class="error-message">{{ error }}</div>

        <form @submit.prevent="handleLogin">
            <div class="form-group">
                <label for="email">이메일</label>
                <input type="text" id="email" v-model="email" required />
            </div>

            <div class="form-group">
                <label for="password">비밀번호</label>
                <input type="password" id="password" v-model="password" required />
            </div>

            <button type="submit" :disabled="loading">
                {{ loading ? '로그인 중...' : '로그인' }}
            </button>

            <div class="findPassword-link">
                <router-link to="/findPassword">비밀번호 찾기</router-link>
            </div>

            <div class="register-link">
                계정이 없으신가요? <router-link to="/register">회원가입</router-link>
            </div>

        </form>
    </div>
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