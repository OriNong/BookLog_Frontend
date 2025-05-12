<template>
  <v-app>
    <HeaderBar v-if="showHeader" @toggle-drawer="layout.toggleDrawer"/>

    <v-navigation-drawer
      app
      v-model="layout.drawer"
      clipped
      class="pt-0"
    >
      <v-list dense>
        <v-list-item to="/main" prepend-icon="mdi-home" title="홈" />
        <v-list-item to="/reviews/my" prepend-icon="mdi-note-text-outline" title="나의 리뷰" />
        <v-list-item to="/bookcase" prepend-icon="mdi-bookshelf" title="내 서재" />
      </v-list>
    </v-navigation-drawer>

    <v-main :class="{ 'with-header': showHeader }">
      <router-view />
    </v-main>

  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import HeaderBar from '@/layouts/HeaderBar.vue'
import { useLayoutStore } from './stores/layout'

const layout = useLayoutStore();
const route = useRoute()

// 경로에 따라 헤더 표시 여부 결정
const showHeader = computed(() => {
  return route.name !== 'Login' && route.name !== 'Register'
})
</script>

<style scoped>

</style>
