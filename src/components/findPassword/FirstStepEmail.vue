<template>
    <v-card flat>
        <v-card-title class="text-h6">비밀번호 재설정 - 1단계: 이메일 입력</v-card-title>
        <v-card-text>
            <v-text-field v-model="email" label="이메일 주소" :rules="emailRules" :error-messages="emailError"
                :disabled="loading" type="email" required />

            <v-alert v-if="message" type="info" class="mt-2">{{ message }}</v-alert>
            <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>

            <v-btn :loading="loading" :disabled="!isEmailValid || loading" color="primary" class="mt-4" block
                @click="sendCode">
                인증 코드 전송
            </v-btn>

            <v-row justify="space-between" class="mt-6">
                <v-btn color="error" variant="text" @click="$router.push('/')">로그인으로 돌아가기</v-btn>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { defineEmits } from 'vue-router';

const email = ref('');
const message = ref('');
const error = ref('');
const emailError = ref('');
const loading = ref(false);
const emit = defineEmits(['next']);

const emailRules = [
    v => !!v || '이메일을 입력해주세요.',
    v => /.+@.+\..+/.test(v) || '유효한 이메일 형식이 아닙니다.'
];

const isEmailValid = computed(() => {
    return emailRules.every(rule => rule(email.value) === true);
});

const sendCode = async () => {
    if (!isEmailValid.value) {
        emailError.value = emailRules.map(rule => rule(email.value)).find(msg => msg !== true);
        return;
    }

    loading.value = true;
    message.value = '';
    error.value = '';
    emailError.value = '';
    try {
        emit('notify', '인증 코드 전송 중입니다...');
        await authService.sendResetCode(email.value);
        message.value = '이메일로 인증 코드가 전송되었습니다';
        emit('notify', '인증 코드가 전송되었습니다', 'success');
        emit('next', email.value);
        message.value = '';
    } catch (err) {
        error.value = err.response?.data?.message || '오류가 발생했습니다';
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.v-card {
    max-width: 500px;
    margin: auto;
}
</style>