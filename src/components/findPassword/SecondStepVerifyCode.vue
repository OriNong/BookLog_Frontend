<template>
    <v-card flat>
        <v-card-title class="text-h6">비밀번호 재설정 - 2단계: 인증 코드 입력</v-card-title>
        <v-card-text>
            <v-text-field v-model="code" label="인증 코드" maxlength="6" counter required :disabled="loading"
                class="mb-2" />

            <div class="text-right text-caption mb-4">
                남은 시간: {{ formattedTimer }}
            </div>

            <v-alert v-if="message" type="info" class="mt-2">{{ message }}</v-alert>
            <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>

            <v-btn :loading="loading" :disabled="!code || loading || timer === 0" color="primary" class="mt-2" block
                @click="verifyCode">
                인증 확인
            </v-btn>

            <v-row justify="space-between" class="mt-6">
                <v-btn color="error" variant="text" @click="$router.push('/')">로그인으로 돌아가기</v-btn>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onActivated, onDeactivated, computed } from 'vue';
import { authService } from '@/services/authService';

const props = defineProps({
    email: String
});
const emit = defineEmits(['next', 'back', 'notify']);

const code = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);
const timer = ref(300); // 5분 = 300초
let intervalId = null;

const formattedTimer = computed(() => {
    const min = String(Math.floor(timer.value / 60)).padStart(2, '0');
    const sec = String(timer.value % 60).padStart(2, '0');
    return `${min}:${sec}`;
});

// v-window 환경에서의 타이머 시작 함수
const startTimer = () => {
    // 기존 타이머 정리
    clearTimer();

    // 타이머 재설정 (v-window 전환 시마다 타이머 초기화)
    timer.value = 300;

    intervalId = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        } else {
            clearTimer();
        }
    }, 1000);
};

// 타이머 정리 함수
const clearTimer = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
};

// 초기 마운트 시
onMounted(() => {
    startTimer();
});

// v-window에서 다시 활성화될 때 (중요)
onActivated(() => {
    // v-window 전환 시 호출됨
    startTimer();
});

// v-window에서 비활성화될 때 (중요)
onDeactivated(() => {
    // 다른 스텝으로 이동할 때 호출됨
    clearTimer();
});

// 컴포넌트 언마운트 시 (전체 페이지 이탈 시)
onBeforeUnmount(() => {
    clearTimer();
});

const verifyCode = async () => {
    loading.value = true;
    message.value = '';
    error.value = '';
    try {
        emit('notify', '인증 확인 중입니다...');
        await authService.verifyResetCode(props.email, code.value);
        emit('notify', '인증이 완료되었습니다', 'success');
        emit('next');
    } catch (err) {
        error.value = err.response?.data?.message || '인증에 실패했습니다';
        emit('notify', error.value, 'error');
    } finally {
        loading.value = false;
    }
};
</script>