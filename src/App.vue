<template>
  <v-app>
    <HeaderBar v-if="showHeader" @mouse-enter="handleMouseEnter" @mouse-leave="handleMouseLeave" />
    <NavigationDrawer :drawer="layout.drawer" @mouse-enter="handleMouseEnter" @mouse-leave="handleMouseLeave" />

    <v-main :class="{ 'with-header': showHeader }">
      <router-view />
    </v-main>

  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import HeaderBar from '@/layouts/HeaderBar.vue'
import { useLayoutStore } from './stores/layout'
import NavigationDrawer from './layouts/NavigationDrawer.vue';

const route = useRoute()

const layout = useLayoutStore();
const isHovering = ref(false); // 마우스가 메뉴 or drawer 위에 있는지 여부

let closeTimeout; // 닫힘 예약

const handleMouseEnter = () => {
  isHovering.value = true;
  layout.openDrawer();
  clearTimeout(closeTimeout); // 닫힘 예약 제거
};

const handleMouseLeave = () => {
  isHovering.value = false;
  closeTimeout = setTimeout(() => {
    if (!isHovering.value) layout.closeDrawer();
  }, 200); // 약간의 딜레이로 안정성 향상
};

// 경로에 따라 헤더 표시 여부 결정
const showHeader = computed(() => {
  return route.name !== 'Login' && route.name !== 'Register' && route.name !== 'ResetPassword'
})
</script>

<style scoped></style>
