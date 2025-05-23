<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8" lg="6">
                <v-card class="pa-4">

                    <v-row align="center" justify="space-between" class="mb-4">

                        <!-- 좌측: 제목 -->
                        <v-col cols="auto" class="d-flex align-center">
                            <h2 class="text-h5 font-weight-bold mb-0">회원가입</h2>
                        </v-col>

                        <!-- 우측: 뒤로가기 버튼 -->
                        <v-col cols="auto">
                            <BackButton />
                        </v-col>
                    </v-row>

                    <v-form ref="form" v-model="isFormValid" @submit.prevent="submitForm">

                        <!-- 이메일 -->
                        <v-text-field v-model="email" label="이메일" :rules="emailRules" variant="outlined" required
                            class="mb-3" @input="resetEmailVerification" />

                        <v-btn color="primary" :disabled="!isEmailValid || isEmailChecking" :loading="isEmailChecking"
                            @click="checkEmailAvailability" block class="mb-4">
                            이메일 중복 확인
                        </v-btn>

                        <!-- 인증 코드 입력 -->
                        <v-expand-transition>
                            <div v-show="showVerificationCode" class="mb-4">
                                <!-- 인증 코드 입력 -->
                                <v-text-field v-model="verificationCode" label="인증 코드"
                                    :rules="[v => !!v || '인증 코드를 입력해주세요']" variant="outlined" required class="mb-2" />

                                <!-- 남은 시간 + 재전송 버튼 -->
                                <div class="d-flex justify-space-between align-center mb-2">
                                    <div class="text-caption text-grey">
                                        남은 시간: {{ remainingTime }}
                                    </div>
                                    <v-btn variant="text" color="primary" class="text-caption" size="small"
                                        :disabled="isSendingCode" @click="resendVerificationCode">
                                        인증 코드 재전송
                                    </v-btn>
                                </div>

                                <!-- 인증 버튼 -->
                                <v-btn color="success" :disabled="!verificationCode || isVerifying"
                                    :loading="isVerifying" @click="verifyEmail" block>
                                    인증 코드 확인
                                </v-btn>
                            </div>
                        </v-expand-transition>

                        <!-- 닉네임 -->
                        <v-text-field v-model="nickname" label="닉네임" :rules="nicknameRules" variant="outlined" required
                            class="mb-3" @input="resetNicknameCheck" />

                        <v-btn color="primary" :disabled="!isNicknameValid || isNicknameChecking"
                            :loading="isNicknameChecking" @click="checkNicknameAvailability" block class="mb-4">
                            닉네임 중복 확인
                        </v-btn>

                        <!-- 비밀번호 -->
                        <v-text-field v-model="password" label="비밀번호" :rules="passwordRules" variant="outlined"
                            type="password" required class="mb-3" />

                        <!-- 비밀번호 확인 -->
                        <v-text-field v-model="confirmPassword" label="비밀번호 확인" :rules="confirmPasswordRules"
                            variant="outlined" type="password" required class="mb-3" />

                        <!-- 제출 버튼 -->
                        <v-btn color="success" type="submit" :disabled="!canSubmit" :loading="isSubmitting" block
                            class="mt-4">
                            회원가입
                        </v-btn>
                    </v-form>

                    <!-- 알림 메시지 -->
                    <v-snackbar v-model="snackbar" :color="snackbarColor" location="bottom center">
                        {{ snackbarText }}
                        <template #actions>
                            <v-btn variant="text" @click="snackbar = false">닫기</v-btn>
                        </template>
                    </v-snackbar>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';
import BackButton from '@/components/common/BackButton.vue';

const router = useRouter();
const form = ref(null);
const isSendingCode = ref(false);
const isFormValid = ref(false);
const isSubmitting = ref(false);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const nickname = ref('');
const verificationCode = ref('');

// 이메일 검증
const isEmailChecked = ref(false);
const isEmailChecking = ref(false);
const showVerificationCode = ref(false);
const isEmailVerified = ref(false);
const isVerifying = ref(false);

// 닉네임 검증
const isNicknameChecked = ref(false);
const isNicknameChecking = ref(false);

// 알림
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('');

// 타이머
const remainingTime = ref('');
let countdown = null;

function startVerificationTimer() {
    let timeLeft = 5 * 60; // 5분
    updateRemainingTime(timeLeft);

    countdown = setInterval(() => {
        timeLeft--;
        updateRemainingTime(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(countdown);
            showVerificationCode.value = false;
            showNotification('인증 시간이 만료되었습니다. 다시 요청해주세요.', 'error');
        }
    }, 1000);
}

function updateRemainingTime(seconds) {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    remainingTime.value = `${min}:${sec}`;
}

function stopTimer() {
    clearInterval(countdown);
}

// 정규식 & 유효성
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
const nicknameRegex = /^[^0-9][가-힣a-zA-Z0-9]{1,9}$/;

const isEmailValid = computed(() => email.value && emailRegex.test(email.value));
const isNicknameValid = computed(() => nickname.value && nicknameRegex.test(nickname.value));
const isPasswordValid = computed(() => password.value && passwordRegex.test(password.value));

const emailRules = [v => !!v || '이메일을 입력해주세요', v => emailRegex.test(v) || '유효한 이메일 형식이 아닙니다'];
const passwordRules = [v => !!v || '비밀번호를 입력해주세요', v => passwordRegex.test(v) || '비밀번호는 8~20자의 문자와 숫자 조합이어야 합니다'];
const confirmPasswordRules = [v => !!v || '비밀번호 확인을 입력해주세요', v => v === password.value || '비밀번호가 일치하지 않습니다'];
const nicknameRules = [v => !!v || '닉네임을 입력해주세요', v => nicknameRegex.test(v) || '닉네임은 숫자로 시작할 수 없으며, 한글/영문/숫자 조합으로 2~10자이어야 합니다'];

const canSubmit = computed(() =>
    isFormValid.value && isEmailChecked.value && isEmailVerified.value &&
    isNicknameChecked.value && isPasswordValid.value
);

// 이메일 중복 확인 / 인증 처리 로직
async function checkEmailAvailability() {
    if (!isEmailValid.value) return;

    isEmailChecking.value = true;
    try {
        const res = await authService.checkEmail(email.value);
        if (res.success) {
            isEmailChecked.value = true;
            await sendVerificationCode();
        } else {
            isEmailChecked.value = false;
            showNotification('이미 사용 중인 이메일입니다.', 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification(err.response.data.message
        );
    } finally {
        isEmailChecking.value = false;
    }
}

// 이메일 인증 코드 발송 
async function sendVerificationCode() {
    try {
        await authService.sendVerificationCode(email.value);
        showVerificationCode.value = true;
        showNotification('인증 코드가 이메일로 전송되었습니다.', 'info');
        startVerificationTimer();
    } catch (err) {
        console.error(err);
        showNotification('인증 코드 전송 중 오류가 발생했습니다.', 'error');
    }
}

// 이메일 인증 코드 재발송
async function resendVerificationCode() {
    isSendingCode.value = true;
    try {
        await authService.sendVerificationCode(email.value);
        showNotification('인증 코드가 재전송되었습니다.', 'info');
        stopTimer(); // 이전 타이머 중지
        startVerificationTimer(); // 새 타이머 시작
    } catch (err) {
        console.error(err);
        showNotification('인증 코드 재전송 중 오류가 발생했습니다.', 'error');
    } finally {
        isSendingCode.value = false;
    }
}

// 이메일 인증
async function verifyEmail() {
    if (!verificationCode.value) return;
    isVerifying.value = true;
    try {
        const res = await authService.verifyEmail(email.value, verificationCode.value);
        if (res.verified === true) {
            isEmailVerified.value = true;
            showVerificationCode.value = false;
            stopTimer();
            showNotification('이메일 인증이 완료되었습니다.', 'success');
        } else {
            showNotification('인증 코드가 일치하지 않습니다.', 'error');
        }
    } catch (err) {
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
        const res = await authService.checkNickname(nickname.value);
        if (res.success) {
            isNicknameChecked.value = true;
            showNotification('사용 가능한 닉네임입니다.', 'success');
        } else {
            showNotification('이미 사용 중인 닉네임입니다.', 'error');
        }
    } catch (err) {
        showNotification('닉네임 확인 중 오류가 발생했습니다.', 'error');
    } finally {
        isNicknameChecking.value = false;
    }
}

// 회원가입 제출
async function submitForm() {
    if (!canSubmit.value) return;
    isSubmitting.value = true;
    try {
        await authService.register(email.value, password.value, nickname.value);
        showNotification('회원가입이 완료되었습니다!', 'success');
        alert("회원가입이 완료되었습니다");
        router.push('/');
        resetForm();
    } catch (error) {
        console.error('회원가입 오류:', error);
        showNotification(error.response?.data || '회원가입 중 오류가 발생했습니다.', 'error');
    } finally {
        isSubmitting.value = false;
    }
}

// 기타 유틸
function showNotification(text, color) {
    snackbarText.value = text;
    snackbarColor.value = color;
    snackbar.value = true;
}

function resetForm() {
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    nickname.value = '';
    verificationCode.value = '';
    resetEmailVerification();
    resetNicknameCheck();
    if (form.value) form.value.resetValidation();
}

function resetEmailVerification() {
    stopTimer();
    isEmailChecked.value = false;
    isEmailVerified.value = false;
    showVerificationCode.value = false;
    verificationCode.value = '';
}

function resetNicknameCheck() {
    isNicknameChecked.value = false;
}
</script>
