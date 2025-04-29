<!-- src/App.vue -->
<template>
  <!-- Vuetify는 v-app을 최상위에서 한 번만 두면 됩니다 -->
  <v-app>
    <router-view /> <!-- 페이지 컴포넌트 -->
  </v-app>
</template>

<script setup>
// 특별한 코드 없음 (v-app 안에 router-view만 두면 OK)
</script>
