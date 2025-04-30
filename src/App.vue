<template>
  <v-app>
    <HeaderBar v-if="showHeader" />
    <div :class="{ 'with-header': showHeader }">
      <router-view />
    </div>

  </v-app>
</template>

<script setup>
import HeaderBar from '@/layouts/HeaderBar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 경로에 따라 헤더 표시 여부 결정
const showHeader = computed(() => {
  return route.name !== 'Login' && route.name !== 'Register' && route.name !== 'BookDetail'
})
</script>

<style scoped>
.with-header {
  margin-top: 72px;
  /* HeaderBar.vue의 v-app-bar height 값과 동일하게 */
}
</style>
