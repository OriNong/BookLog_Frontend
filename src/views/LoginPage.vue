<template>
    <div class="login-container">
        <h2>로그인</h2>
        <form @submit.prevent="login">
            <div>
                <label for="email">이메일</label>
                <input id="email" v-model="email" type="email" required />
            </div>
            <div>
                <label for="password">비밀번호</label>
                <input id="password" v-model="password" type="password" required />
            </div>
            <button type="submit">로그인</button>
        </form>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

const login = async () => {
    try {
        const response = await axios.post('/api/auth/login', {
            email: email.value,
            password: password.value
        })

        const token = response.data.token
        localStorage.setItem('jwtToken', token)

        // 로그인 성공 후 페이지 이동
        router.push('/')
    } catch (err) {
        errorMessage.value = '로그인 실패. 이메일 또는 비밀번호를 확인해주세요.'
    }
}
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
}

label {
    display: block;
    margin-bottom: 4px;
}

input {
    width: 100%;
    padding: 8px;
    margin-bottom: 1rem;
}

button {
    width: 100%;
    padding: 10px;
}

.error {
    color: red;
    margin-top: 10px;
}
</style>