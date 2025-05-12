import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    drawer: false, // true: 펼침, false: 접힘
  }),
  actions: {
    toggleDrawer() {
      this.drawer = !this.drawer;
    },
    openDrawer() {
      this.drawer = true;
    },
    closeDrawer() {
      this.drawer = false;
    },
  },
});