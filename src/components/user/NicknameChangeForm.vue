<template>
    <v-card elevation="1">
        <v-card-title class="text-h6 font-weight-bold">닉네임 변경</v-card-title>
        <v-card-text>
            <v-form ref="form" v-model="formValid">
                <v-text-field v-model="nickname" label="새 닉네임" :rules="nicknameRules" @input="isChecked = false"
                    required />
                <v-btn size="small" @click="checkNickname" :disabled="!nickname.trim() || !regexValid">
                    중복 확인
                </v-btn>
                <v-icon v-if="isChecked" color="green" class="ml-2">mdi-check-circle</v-icon>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="submitNickname" :disabled="!formValid || !isChecked">
                닉네임 변경
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

const nickname = ref('');
const isChecked = ref(false);
const formValid = ref(false);

const nicknameRegex = /^[^0-9][\w가-힣]{1,9}$/;
const regexValid = computed(() => nicknameRegex.test(nickname.value));

const nicknameRules = [
    v => !!v || '닉네임을 입력해주세요',
    v => nicknameRegex.test(v) || '닉네임은 숫자로 시작할 수 없으며, 한글/영문/숫자 조합으로 2~10자여야 합니다'
];

const checkNickname = async () => {
    try {
        await authService.checkNickname(nickname.value);
        isChecked.value = true;
        alert('사용 가능한 닉네임입니다.');
    } catch (err) {
       alert(err.response.data.message);
        isChecked.value = false;
    }
};

const submitNickname = async () => {
    try {
        await userService.updateNickname({ nickname: nickname.value });
        alert('닉네임이 변경되었습니다.');
        isChecked.value = false;
    } catch (err) {
        alert(err.response.data.message);
    }
};
</script>
