<template>
  <v-container class="mt-10" style="max-width: 500px">
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right" timeout="2000">
      {{ snackbar.message }}
    </v-snackbar>
    <v-window v-model="step" class="transition-window" touchless>
      <v-window-item :value="1">
        <FirstStepEmail @next="goToStep(2, $event)" @notify="showSnackbar" />
      </v-window-item>
      <v-window-item :value="2">
        <SecondStepVerifyCode :email="email" @next="goToStep(3)" @back="goToStep(1)" @notify="showSnackbar"/>
      </v-window-item>
      <v-window-item :value="3">
        <ThirdStepResetPassword :email="email" @back="goToStep(2)" @notify="showSnackbar"/>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import FirstStepEmail from '@/components/findPassword/FirstStepEmail.vue';
import SecondStepVerifyCode from '@/components/findPassword/SecondStepVerifyCode.vue';
import ThirdStepResetPassword from '@/components/findPassword/ThirdStepResetPassword.vue';
const step = ref(1);
const email = ref('');

const snackbar = ref({
    show: false,
    message: '',
    color: 'info'
});
function goToStep(n, value = null) {
  if (value) email.value = value;
  step.value = n;
}
function showSnackbar(message, color = 'info') {
    snackbar.value.message = message;
    snackbar.value.color = color;
    snackbar.value.show = true;
}
</script>

<style scoped>
.transition-window {
  overflow-x: hidden;
}
</style>