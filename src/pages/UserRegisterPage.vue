<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
                <v-card class="pa-4">
                    <v-card-title class="text-center">회원가입</v-card-title>

                    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitForm">
                        <!-- 이메일 입력 -->
                        <v-text-field v-model="email" label="이메일" :rules="emailRules" variant="outlined" required
                            @input="resetEmailVerification"></v-text-field>

                        <v-btn color="primary" :disabled="!isEmailValid || isEmailChecking" :loading="isEmailChecking"
                            @click="checkEmailAvailability" class="mb-4" block>
                            이메일 중복 확인
                        </v-btn>

                        <!-- 이메일 검증 코드 영역 -->
                        <div v-if="showVerificationCode">
                            <v-text-field v-model="verificationCode" label="인증 코드" variant="outlined"
                                :rules="[v => !!v || '인증 코드를 입력해주세요']" required></v-text-field>

                            <v-btn color="success" :disabled="!verificationCode || isVerifying" :loading="isVerifying"
                                @click="verifyEmail" class="mb-4" block>
                                인증 코드 확인
                            </v-btn>
                        </div>

                        <!-- 닉네임 입력 -->
                        <v-text-field v-model="nickname" label="닉네임" :rules="nicknameRules" variant="outlined" required
                            @input="resetNicknameCheck"></v-text-field>

                        <v-btn color="primary" :disabled="!isNicknameValid || isNicknameChecking"
                            :loading="isNicknameChecking" @click="checkNicknameAvailability" class="mb-4" block>
                            닉네임 중복 확인
                        </v-btn>

                        <!-- 비밀번호 입력 -->
                        <v-text-field v-model="password" label="비밀번호" :rules="passwordRules" variant="outlined"
                            type="password" required></v-text-field>

                        <!-- 비밀번호 확인 -->
                        <v-text-field v-model="confirmPassword" label="비밀번호 확인" :rules="confirmPasswordRules"
                            variant="outlined" type="password" required></v-text-field>

                        <!-- 제출 버튼 -->
                        <v-btn color="success" type="submit" :disabled="!canSubmit" :loading="isSubmitting" block
                            class="mt-4">
                            회원가입
                        </v-btn>
                    </v-form>

                    <!-- 알림 메시지 -->
                    <v-snackbar v-model="snackbar" :color="snackbarColor">
                        {{ snackbarText }}
                        <template v-slot:actions>
                            <v-btn variant="text" @click="snackbar = false">닫기</v-btn>
                        </template>
                    </v-snackbar>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, inject } from 'vue';
import { useRouter } from 'vue-router';

// axios 인스턴스 주입
const axios = inject('axios');
const router = useRouter();

// 폼 상태
const form = ref(null);
const isFormValid = ref(false);
const isSubmitting = ref(false);

// 입력 필드
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const nickname = ref('');
const verificationCode = ref('');

// 검증 상태
const isEmailValid = computed(() => {
    return email.value && emailRegex.test(email.value);
});
const isNicknameValid = computed(() => {
    return nickname.value && nicknameRegex.test(nickname.value);
});
const isPasswordValid = computed(() => {
    return password.value && passwordRegex.test(password.value);
});

// 이메일 검증 상태
const isEmailChecked = ref(false);
const isEmailChecking = ref(false);
const showVerificationCode = ref(false);
const isEmailVerified = ref(false);
const isVerifying = ref(false);

// 닉네임 검증 상태
const isNicknameChecked = ref(false);
const isNicknameChecking = ref(false);

// 알림 메시지
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('');

// 정규식 패턴
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
const nicknameRegex = /^[^0-9][가-힣a-zA-Z0-9]{1,9}$/;

// 유효성 검사 규칙
const emailRules = [
    v => !!v || '이메일을 입력해주세요',
    v => emailRegex.test(v) || '유효한 이메일 형식이 아닙니다',
];

const passwordRules = [
    v => !!v || '비밀번호를 입력해주세요',
    v => passwordRegex.test(v) || '비밀번호는 8~20자의 문자와 숫자 조합이어야 합니다',
];

const confirmPasswordRules = [
    v => !!v || '비밀번호 확인을 입력해주세요',
    v => v === password.value || '비밀번호가 일치하지 않습니다',
];

const nicknameRules = [
    v => !!v || '닉네임을 입력해주세요',
    v => nicknameRegex.test(v) || '닉네임은 숫자로 시작할 수 없으며, 한글/영문/숫자 조합으로 2~10자이어야 합니다',
];

// 제출 가능 여부 계산
const canSubmit = computed(() => {
    return isFormValid.value && isEmailChecked.value && isEmailVerified.value &&
        isNicknameChecked.value && isPasswordValid.value;
});

// 이메일 중복 확인
async function checkEmailAvailability() {
    if (!isEmailValid.value) return;

    isEmailChecking.value = true;
    try {
        const response = await axios.post('/api/auth/check-email', null, {
            params: { email: email.value }
        });

        if (response.data.success === true) {
            // 이메일 사용 가능
            isEmailChecked.value = true;
            showNotification('사용 가능한 이메일입니다. 인증을 진행해주세요.', 'success');
            // 인증 코드 전송 및 인증 코드 입력 영역 표시
            sendVerificationCode();
        } else {
            // 이메일 이미 사용 중
            isEmailChecked.value = false;
            showNotification('이미 사용 중인 이메일입니다.', 'error');
        }
    } catch (error) {
        console.error('이메일 중복 확인 오류:', error);
        showNotification('이메일 확인 중 오류가 발생했습니다.', 'error');
    } finally {
        isEmailChecking.value = false;
    }
}

// 인증 코드 전송
async function sendVerificationCode() {
    try {
        await axios.post('/api/auth/send-email', { email: email.value });
        showVerificationCode.value = true;
        showNotification('인증 코드가 이메일로 전송되었습니다.', 'info');
    } catch (error) {
        console.error('인증 코드 전송 오류:', error);
        showNotification('인증 코드 전송 중 오류가 발생했습니다.', 'error');
    }
}

// 이메일 인증 코드 확인
async function verifyEmail() {
    if (!verificationCode.value) return;

    isVerifying.value = true;
    try {
        const response = await axios.post('/api/auth/verify-email', {
            email: email.value,
            code: verificationCode.value
        });

        if (response.data && response.data.verified === true) {
            isEmailVerified.value = true;
            showVerificationCode.value = false;
            showNotification('이메일 인증이 완료되었습니다.', 'success');
        } else {
            isEmailVerified.value = false;
            showNotification('인증 코드가 일치하지 않습니다.', 'error');
        }
    } catch (error) {
        console.error('이메일 인증 오류:', error);
        showNotification('이메일 인증 중 오류가 발생했습니다.', 'error');
    } finally {
        isVerifying.value = false;
    }
}

// 닉네임 중복 확인
async function checkNicknameAvailability() {
    if (!isNicknameValid.value) return;

    isNicknameChecking.value = true;
    try {
        const response = await axios.post('/api/auth/check-nickname', null, {
            params: { nickname: nickname.value }
        });

        if (response.data.success === true) {
            // 닉네임 사용 가능
            isNicknameChecked.value = true;
            showNotification('사용 가능한 닉네임입니다.', 'success');
        } else {
            // 닉네임 이미 사용 중
            isNicknameChecked.value = false;
            showNotification('이미 사용 중인 닉네임입니다.', 'error');
        }
    } catch (error) {
        console.error('닉네임 중복 확인 오류:', error);
        showNotification('닉네임 확인 중 오류가 발생했습니다.', 'error');
    } finally {
        isNicknameChecking.value = false;
    }
}

// 이메일 검증 초기화
function resetEmailVerification() {
    isEmailChecked.value = false;
    isEmailVerified.value = false;
    showVerificationCode.value = false;
    verificationCode.value = '';
}

// 닉네임 중복 확인 초기화
function resetNicknameCheck() {
    isNicknameChecked.value = false;
}

// 폼 제출
async function submitForm() {
    if (!canSubmit.value) return;

    isSubmitting.value = true;
    try {
        // 회원가입 API 호출 - UserVO 형식에 맞게 데이터 전송
        const response = await axios.post('/api/auth/register', {
            email: email.value,
            password: password.value,
            nickname: nickname.value
        });

        if (response.status === 200) {
            showNotification('회원가입이 완료되었습니다!', 'success');
            router.push('/login');

            // 폼 초기화
            resetForm();
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        const errorMessage = error.response?.data || '회원가입 중 오류가 발생했습니다.';
        showNotification(errorMessage, 'error');
    } finally {
        isSubmitting.value = false;
    }
}

// 알림 메시지 표시
function showNotification(text, color) {
    snackbarText.value = text;
    snackbarColor.value = color;
    snackbar.value = true;
}

// 폼 리셋
function resetForm() {
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    nickname.value = '';
    verificationCode.value = '';

    resetEmailVerification();
    resetNicknameCheck();

    if (form.value) {
        form.value.resetValidation();
    }
}
</script>