<template>
  <v-container class="py-6">
    <h2 class="text-h5 font-weight-bold mb-4">나의 정보 관리</h2>

    <!-- 비밀번호 검증 다이얼로그 (초기 진입 시) -->
    <VerifyPasswordDialog v-if="!isVerified" :open="!isVerified" @verified="isVerified = true" />

    <!-- 본인 인증 완료 후에만 렌더링 -->
    <div v-if="isVerified">
      <v-row>
        <!-- 왼쪽: 닉네임 + 비밀번호 -->
        <v-col cols="12" md="6" class="d-flex flex-column justify-space-between">
          <v-card class="mb-4">
            <v-card-title>
              <v-icon start>mdi-account-edit</v-icon>
              닉네임 변경
            </v-card-title>
            <v-card-text>
              <NicknameChangeForm />
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>
              <v-icon start>mdi-lock-reset</v-icon>
              비밀번호 변경
            </v-card-title>
            <v-card-text>
              <PasswordChangeForm />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 오른쪽: 내가 신고한 리뷰 -->
        <v-col cols="12" md="6">
          <v-card class="h-100">
            <v-card-title>
              <v-icon start>mdi-alert-circle-outline</v-icon>
              내가 신고한 리뷰
            </v-card-title>
            <v-card-text>
              <MyReportList />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import VerifyPasswordDialog from '@/components/user/VerifyPasswordDialog.vue';
import NicknameChangeForm from '@/components/user/NicknameChangeForm.vue';
import PasswordChangeForm from '@/components/user/PasswordChangeForm.vue';
import MyReportList from '@/components/user/MyReportList.vue';
const isVerified = ref(false);
</script>

<style scoped>
.mt-6 {
  margin-top: 24px;
}

.mt-8 {
  margin-top: 32px;
}
</style>
