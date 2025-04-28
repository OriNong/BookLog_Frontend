<template>
    <div class="register-container">
        <h2>회원가입</h2>
        <form @submit.prevent="register">
            <!-- 이메일 입력 -->
            <InputValidation v-model="email" id="email" label="이메일" type="email" :validate="validators.email"
                :showCheckButton="true" :isChecked="isEmailVerified" @check="checkEmailDuplicate"
                @input="handleEmailChange" required />

            <!-- 인증코드 입력 영역 - 인증 완료 시 숨김 처리 -->
            <div v-if="verificationSent && !isEmailVerified">
                <div class="verification-field">
                    <label for="code">인증 코드</label>
                    <div class="code-input-group">
                        <input id="code" v-model="verificationCode" type="text" />
                        <button type="button" @click="verifyCode" :disabled="!verificationCode">
                            인증 확인
                        </button>
                        <button type="button" @click="sendVerificationCode">
                            재발송
                        </button>
                    </div>
                </div>
                <p v-if="codeMessage" :class="{ 'error': codeError, 'success': !codeError }">
                    {{ codeMessage }}
                </p>
            </div>

            <!-- 인증 완료 메시지 표시 - 인증 완료시에만 표시 -->
            <div v-if="isEmailVerified" class="verified-message">
                <p class="success">이메일 인증이 완료되었습니다.</p>
            </div>

            <!-- 비밀번호 입력 -->
            <InputValidation v-model="password" id="password" label="비밀번호" type="password"
                :validate="validators.password" @input="checkConfirmPassword" required />

            <!-- 비밀번호 확인 -->
            <InputValidation v-model="confirmPassword" id="confirmPassword" label="비밀번호 확인" type="password"
                :validate="validators.confirmPassword" required />

            <!-- 닉네임 입력 -->
            <InputValidation v-model="nickname" id="nickname" label="닉네임" :validate="validators.nickname"
                :showCheckButton="true" :isChecked="isNicknameChecked" @check="checkNicknameDuplicate"
                @input="handleNicknameChange" required />

            <button type="submit" :disabled="!isFormValid">회원가입</button>
        </form>
        <p v-if="statusMessage" :class="{ 'error': statusError, 'success': !statusError }">
            {{ statusMessage }}
        </p>
    </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import InputValidation from '@/components/auth/InputValidation.vue'

const axios = inject('axios');

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const verificationCode = ref('')
const isEmailVerified = ref(false)
const verificationSent = ref(false)
const isNicknameChecked = ref(false)
const codeMessage = ref('')
const codeError = ref(false)
const statusMessage = ref('')
const statusError = ref(false)
const router = useRouter()

// 폼 유효성 검사
const isFormValid = computed(() => {
    return isEmailVerified.value &&
        validators.password(password.value).isValid &&
        validators.confirmPassword(confirmPassword.value).isValid &&
        validators.nickname(nickname.value).isValid &&
        isNicknameChecked.value
})

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
        const nicknamePattern = /^[가-힣a-zA-Z][가-힣a-zA-Z0-9]{1,11}$/
        if (!value) {
            return { isValid: false, message: '' }
        } else if (nicknamePattern.test(value)) {
            return { isValid: true, message: '사용 가능한 닉네임 형식입니다.' }
        } else {
            return { isValid: false, message: '숫자로 시작 불가, 2~12자의 한글, 영문, 숫자 조합이 가능합니다' }
        }
    }
}

// 이메일 변경 처리
const handleEmailChange = () => {
    // 이메일이 변경되면 인증 상태 초기화
    if (isEmailVerified.value) {
        isEmailVerified.value = false
        verificationSent.value = false
        verificationCode.value = ''
        codeMessage.value = ''
    }
}

// 닉네임 변경 처리
const handleNicknameChange = () => {
    // 닉네임이 변경되면 중복 확인 상태 초기화
    if (isNicknameChecked.value) {
        isNicknameChecked.value = false
    }
}

// 비밀번호 변경 시 확인 비밀번호 유효성 재검사
const checkConfirmPassword = () => {
    if (confirmPassword.value) {
        validators.confirmPassword(confirmPassword.value)
    }
}

// 상태 메시지 설정 함수
const setStatusMessage = (message, isError = false) => {
    statusMessage.value = message
    statusError.value = isError
    // 5초 후 메시지 자동 삭제
    if (message) {
        setTimeout(() => {
            statusMessage.value = ''
        }, 5000)
    }
}

// 이메일 중복 체크
const checkEmailDuplicate = async () => {
    // 이메일 형식 검증
    if (!validators.email(email.value).isValid) {
        setStatusMessage('유효한 이메일 형식을 입력해주세요.', true)
        return
    }

    try {
        const res = await axios.post(
            '/api/auth/check-email',
            null,
            { params: { email: email.value } }
        )

        if (res.data && res.data.success) {
            setStatusMessage('사용 가능한 이메일입니다.', false)
            await sendVerificationCode()
        } else {
            setStatusMessage(res.data.message || '이미 사용 중인 이메일입니다.', true)
            isEmailVerified.value = false
        }
    } catch (e) {
        setStatusMessage('중복 확인 과정에서 오류가 발생했습니다.', true)
    }
}

// 닉네임 중복 체크
const checkNicknameDuplicate = async () => {
    // 닉네임 형식 검증
    if (!validators.nickname(nickname.value).isValid) {
        setStatusMessage('유효한 닉네임 형식을 입력해주세요.', true)
        return
    }

    try {
        const res = await axios.post(
            '/api/auth/check-nickname',
            null,
            { params: { nickname: nickname.value } }
        )

        if (res.data && res.data.success) {
            setStatusMessage('사용 가능한 닉네임입니다.', false)
            isNicknameChecked.value = true
        } else {
            setStatusMessage(res.data.message || '이미 사용 중인 닉네임입니다.', true)
            isNicknameChecked.value = false
        }
    } catch (e) {
        setStatusMessage('닉네임 중복 확인 중 오류 발생', true)
        isNicknameChecked.value = false
    }
}

// 인증 코드 발송
const sendVerificationCode = async () => {
    try {
        const res = await axios.post(
            '/api/auth/send-email', {
            email: email.value
        }
        )

        if (res.data && res.data.success) {
            verificationSent.value = true
            codeMessage.value = '인증 코드가 발송되었습니다. 이메일을 확인해주세요.'
            codeError.value = false
        } else {
            codeMessage.value = res.data.message || '인증 코드 발송에 실패했습니다.'
            codeError.value = true
        }
    } catch (err) {
        codeMessage.value = '인증 코드 발송에 실패했습니다.'
        codeError.value = true
    }
}

// 인증 코드 확인
const verifyCode = async () => {
    if (!verificationCode.value) {
        codeMessage.value = '인증 코드를 입력해주세요.'
        codeError.value = true
        return
    }

    try {
        const res = await axios.post(
            '/api/auth/verify-email', {
            email: email.value,
            code: verificationCode.value
        }
        )

        if (res.data && res.data.success) {
            isEmailVerified.value = true
            // 인증 완료 시 인증 코드 입력 영역이 자동으로 숨겨짐 (v-if 조건 때문에)
            setStatusMessage('이메일 인증이 완료되었습니다.', false)
        } else {
            codeMessage.value = res.data.message || '인증 코드가 올바르지 않거나 만료되었습니다.'
            codeError.value = true
        }
    } catch (err) {
        codeMessage.value = '인증 코드가 올바르지 않거나 만료되었습니다.'
        codeError.value = true
    }
}

// 회원가입
const register = async () => {
    // 이메일 검증
    if (!isEmailVerified.value) {
        setStatusMessage('이메일 인증을 완료해주세요.', true)
        return
    }

    // 비밀번호 검증
    if (!validators.password(password.value).isValid) {
        setStatusMessage('비밀번호 형식이 올바르지 않습니다.', true)
        return
    }

    // 비밀번호 확인 검증
    if (!validators.confirmPassword(confirmPassword.value).isValid) {
        setStatusMessage('비밀번호가 일치하지 않습니다.', true)
        return
    }

    // 닉네임 검증
    if (!validators.nickname(nickname.value).isValid) {
        setStatusMessage('닉네임 형식이 올바르지 않습니다.', true)
        return
    }

    // 닉네임 중복 확인 검증
    if (!isNicknameChecked.value) {
        setStatusMessage('닉네임 중복 확인을 해주세요.', true)
        return
    }

    try {
        const res = await axios.post('/api/auth/register', {
            email: email.value,
            password: password.value,
            nickname: nickname.value
        })

        if (res.data && res.data.success) {
            setStatusMessage('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', false)
            setTimeout(() => {
                router.push('/login')
            }, 1500)
        } else {
            setStatusMessage(res.data.message || '회원가입에 실패했습니다.', true)
        }
    } catch (err) {
        setStatusMessage('회원가입에 실패했습니다.', true)
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #333;
}

.verification-field {
    margin-bottom: 1rem;
}

.code-input-group {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.code-input-group input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 8px 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover:not(:disabled) {
    background-color: #45a049;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

button[type="submit"] {
    width: 100%;
    padding: 10px;
    margin-top: 1rem;
    font-size: 1rem;
}

.error {
    color: #d32f2f;
    text-align: center;
    margin-top: 0.5rem;
    font-size: 0.9rem;
}

.success {
    color: #388e3c;
    text-align: center;
    margin-top: 0.5rem;
    font-size: 0.9rem;
}

.verified-message {
    margin: 0.5rem 0;
    padding: 0.5rem;
    background-color: #e8f5e9;
    border-radius: 4px;
    border-left: 4px solid #388e3c;
}
</style>