<template>
    <v-card flat>
        <v-card-title class="text-h6">비밀번호 재설정 - 3단계: 새 비밀번호 입력</v-card-title>
        <v-card-text>
            <v-text-field v-model="password" label="새 비밀번호" type="password" :rules="passwordRules" :disabled="loading"
                required />
            <v-text-field v-model="confirm" label="비밀번호 확인" type="password" :error="confirm && password !== confirm"
                :disabled="loading" required />

            <v-alert v-if="message" type="success" class="mt-2">{{ message }}</v-alert>
            <v-alert v-if="error" type="error" class="mt-2">{{ error }}</v-alert>

            <v-btn :loading="loading" :disabled="!isFormValid || loading" color="primary" class="mt-4" block
                @click="resetPassword">
                비밀번호 재설정
            </v-btn>
            <v-row justify="space-between" class="mt-6">
                <v-btn color="error" variant="text" @click="goToLogin">로그인으로 돌아가기</v-btn>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, defineProps } from 'vue-router';
import { authService } from '@/services/authService';

const props = defineProps({ email: String });
const password = ref('');
const confirm = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

const passwordRules = [
    v => !!v || '비밀번호를 입력해주세요.',
    v => v.length >= 8 || '비밀번호는 최소 8자 이상이어야 합니다.',
    v => v.length <= 20 || '비밀번호는 최대 20자까지 입력할 수 있습니다.',
    v => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(v) || '문자와 숫자를 조합하여 입력해주세요.'
];

const isFormValid = computed(() => {
    return (
        password.value &&
        confirm.value &&
        password.value === confirm.value &&
        passwordRules.every(rule => rule(password.value) === true)
    );
});

const resetPassword = async () => {
    loading.value = true;
    message.value = '';
    error.value = '';
    try {
        await authService.resetPassword(props.email, password.value);
        message.value = '비밀번호가 성공적으로 변경되었습니다';
        setTimeout(() => router.push('/'), 1500);
    } catch (err) {
        error.value = err.response?.data?.message || '비밀번호 재설정에 실패했습니다';
    } finally {
        loading.value = false;
    }
};

const goToLogin = () => {
    router.push('/');
};
</script>

<style scoped>
.v-card {
    max-width: 500px;
    margin: auto;
}
</style>
