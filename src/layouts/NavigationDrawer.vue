<template>
    <v-navigation-drawer :model-value="props.drawer" @update:model-value="$emit('update:drawer', $event)" app clipped
        class="pt-0" @mouseenter="$emit('mouse-enter')" @mouseleave="$emit('mouse-leave')">
        <v-list dense>
            <v-list-item v-for="item in menuItems" :key="item.to" :to="item.to" :prepend-icon="item.icon"
                :title="item.title" />
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
const props = defineProps({
    drawer: {
        type: Boolean,
        required: true,
    },
});

const menuItems = [
    { to: '/main', icon: 'mdi-home', title: '홈' },
    { to: '/reviews/my', icon: 'mdi-note-text-outline', title: '나의 리뷰' },
    { to: '/bookcase', icon: 'mdi-bookshelf', title: '내 서재' },
    { to: '/myInfo', icon: 'mdi-account-circle', title: '나의 정보'}
];
</script>
