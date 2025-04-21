<template>
    <div class="register-container">
        <h2>회원가입</h2>
        <form @submit.prevent="register">
            <!-- 이메일 입력 -->
            <InputValidation v-model="email" id="email" label="이메일" type="email" :validate="validators.email"
                :showCheckButton="true" :isChecked="isEmailVerified" @check="checkEmailDuplicate" required />

            <!-- 인증코드 입력 영역 -->
            <div v-if="verificationSent && !isEmailVerified">
                <label for="code">인증 코드</label>
                <input id="code" v-model="verificationCode" type="text" />
                <button type="button" @click="verifyCode">인증 확인</button>
                <p v-if="codeMessage" :class="{ error: !isEmailVerified, success: isEmailVerified }">
                    {{ codeMessage }}
                </p>
            </div>

            <!-- 비밀번호 입력 -->
            <InputValidation v-model="password" id="password" label="비밀번호" type="password"
                :validate="validators.password" required />

            <!-- 비밀번호 확인 -->
            <InputValidation v-model="confirmPassword" id="confirmPassword" label="비밀번호 확인" type="password"
                :validate="validators.confirmPassword" required />

            <!-- 닉네임 입력 -->
            <InputValidation v-model="nickname" id="nickname" label="닉네임" :validate="validators.nickname"
                :showCheckButton="true" :isChecked="isNicknameChecked" @check="checkNicknameDuplicate" required />

            <button type="submit">회원가입</button>
        </form>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import InputValidation from '@/components/auth/InputValidation.vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const verificationCode = ref('')
const isEmailVerified = ref(false)
const verificationSent = ref(false)
const isNicknameChecked = ref(false)
const codeMessage = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

// 유효성 검사 함수들
const validators = {
    email: (value) => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!value) {
            return { isValid: false, message: '' }
        } else if (emailPattern.test(value)) {
            return { isValid: true, message: '유효한 이메일 형식입니다.' }
        } else {
            return { isValid: false, message: '올바르지 않은 이메일 형식입니다.' }
        }
    },
    password: (value) => {
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,25}$/
        if (!value) {
            return { isValid: false, message: '' }
        } else if (passwordPattern.test(value)) {
            return { isValid: true, message: '안전한 비밀번호입니다.' }
        } else {
            return { isValid: false, message: '8~25자리이며, 숫자, 문자, 특수문자를 모두 포함해야 합니다.' }
        }
    },
    confirmPassword: (value) => {
        if (!value) {
            return { isValid: false, message: '' }
        } else if (password.value === value) {
            return { isValid: true, message: '비밀번호가 일치합니다.' }
        } else {
            return { isValid: false, message: '비밀번호가 일치하지 않습니다.' }
        }
    },
    nickname: (value) => {
        const nicknamePattern = /^[가-힣a-zA-Z][가-힣a-zA-Z0-9]*$/
        if (!value) {
            return { isValid: false, message: '' }
        } else if (nicknamePattern.test(value)) {
            return { isValid: true, message: '사용 가능한 닉네임 형식입니다.' }
        } else {
            return { isValid: false, message: '숫자로 시작 불가, 2~12자의 한글, 영문, 숫자 조합이 가능합니다' }
        }
    }
}

// 이메일 중복 체크
const checkEmailDuplicate = async () => {
    try {
        const response = await axios.post('/api/auth/check-email', { email: email.value })
        if (response.data.available) {
            await sendVerificationCode()
        }
    } catch (err) {
        errorMessage.value = '이미 사용 중인 이메일입니다.'
    }
}

// 닉네임 중복 체크
const checkNicknameDuplicate = async () => {
    try {
        const response = await axios.post('/api/auth/check-nickname', { nickname: nickname.value })
        if (response.data.available) {
            isNicknameChecked.value = true
        }
    } catch (err) {
        errorMessage.value = '이미 사용 중인 닉네임입니다.'
    }
}

// 인증 코드 발송
const sendVerificationCode = async () => {
    try {
        await axios.post('/api/auth/send-code', { email: email.value })
        verificationSent.value = true
        codeMessage.value = '인증 코드가 발송되었습니다.'
    } catch (err) {
        errorMessage.value = '인증 코드 발송에 실패했습니다.'
    }
}

// 인증 코드 확인
const verifyCode = async () => {
    try {
        await axios.post('/api/auth/verify-code', {
            email: email.value,
            code: verificationCode.value
        })
        isEmailVerified.value = true
        codeMessage.value = '이메일 인증이 완료되었습니다.'
    } catch (err) {
        codeMessage.value = '인증 코드가 올바르지 않거나 만료되었습니다.'
    }
}

// 회원가입
const register = async () => {
    errorMessage.value = ''
    successMessage.value = ''

    // 이메일 유효성 검사사
    if (!isEmailVerified.value) {
        errorMessage.value = '이메일 인증을 완료해주세요.'
        return
    }
    // 비밀번호 유효성 검사사
    if (!validators.password(password.value).isValid || !validators.confirmPassword(confirmPassword.value).isValid) {
        errorMessage.value = '비밀번호가 올바르지 않습니다.'
        return
    }
    // 닉네임 유효성 검사
    if (!isNicknameChecked.value) {
        errorMessage.value = '닉네임 중복 확인을 해주세요.'
        return
    }

    try {
        await axios.post('/api/auth/register', {
            email: email.value,
            password: password.value,
            nickname: nickname.value
        })

        successMessage.value = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'
        setTimeout(() => {
            router.push('/login')
        }, 1500)
    } catch (err) {
        errorMessage.value = '회원가입에 실패했습니다.'
    }
}
</script>

<style scoped>
.register-container {
    max-width: 450px;
    margin: 50px auto;
    padding: 1.5rem;
    border: 1px solid #ccc;
    border-radius: 8px;
}

h2 {
    text-align: center;
    margin-bottom: 2rem;
}

button[type="submit"] {
    width: 100%;
    padding: 10px;
    margin-top: 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button[type="submit"]:hover {
    background-color: #45a049;
}

.error {
    color: red;
    text-align: center;
    margin-top: 1rem;
}

.success {
    color: green;
    text-align: center;
    margin-top: 1rem;
}
</style>