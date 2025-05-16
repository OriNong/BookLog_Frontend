<template>
    <v-btn @click="$router.back()" variant="text">
        <v-icon start>mdi-arrow-left</v-icon>
        {{ props.label }}
    </v-btn>
</template>

<script setup>
const props = defineProps({
    label: {
        type: String,
        default: '뒤로가기',
    },
});
</script>
