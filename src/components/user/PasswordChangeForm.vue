<template>
    <v-card elevation="1">
        <v-card-title class="text-h6 font-weight-bold">비밀번호 변경</v-card-title>
        <v-card-text>
            <v-form ref="form" v-model="formValid">
                <v-text-field v-model="currentPassword" label="현재 비밀번호" type="password"
                    :rules="[v => !!v || '현재 비밀번호를 입력해주세요']" required />

                <v-text-field v-model="newPassword" label="새 비밀번호" type="password" :rules="passwordRules" required />

                <v-text-field v-model="confirmPassword" label="새 비밀번호 확인" type="password"
                    :rules="[v => v === newPassword || '비밀번호가 일치하지 않습니다']" required />
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="submit" :disabled="!formValid">
                비밀번호 변경
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref } from 'vue';
import { userService } from '@/services/userService';
import router from '@/router';

const formValid = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const componentKey = ref(0);
const refreshComponent = () => {
  componentKey.value += 1;
};

// 비밀번호 유효성 검사
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
const passwordRules = [
    v => !!v || '비밀번호를 입력해주세요',
    v => passwordRegex.test(v) || '비밀번호는 8~20자의 문자와 숫자 조합이어야 합니다'
];

const submit = async () => {
    try {
        await userService.updatePassword({
            currentPassword: currentPassword.value,
            newPassword: newPassword.value
        });
        alert('비밀번호가 변경되었습니다.');
        router.push("/");
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
        refreshComponent
    } catch (err) {
        alert(err.response.data.message);
    }
};
</script>
