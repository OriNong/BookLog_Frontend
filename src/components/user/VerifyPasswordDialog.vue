<template>
    <v-dialog v-model="open" persistent max-width="400">
        <v-card>
            <v-card-title class="text-h6 font-weight-bold">
                비밀번호 확인
            </v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="isValid" @submit.prevent="verify">
                    <v-text-field v-model="password" label="비밀번호" type="password" :rules="passwordRules" required />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" variant="tonal" :to="'/main'">
                    홈으로 가기
                </v-btn>
                <v-spacer />
                <v-btn color="primary" :disabled="!isValid || loading" @click="verify">
                    확인
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import { userService } from '@/services/userService';

const props = defineProps({
    open: Boolean
});
const emit = defineEmits(['verified']);

const open = ref(props.open);
watch(() => props.open, (val) => open.value = val);

const password = ref('');
const isValid = ref(false);
const loading = ref(false);

const passwordRules = [v => !!v || '비밀번호를 입력해주세요'];

const verify = async () => {
    const trimmed = password.value.trim();
    if (!trimmed) return;

    loading.value = true;
    try {
        await userService.verifyPassword({ password: trimmed });
        emit('verified');
    } catch (err) {
        alert(err.response.data.message);
    } finally {
        loading.value = false;
    }
};
</script>
