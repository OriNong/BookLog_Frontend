<template>
    <div>
        <v-btn to="/bookcase" variant="text" class="logo-btn" height="56" width="56">
            <v-img :src="logo" alt="BOOKLOG 로고" height="56" width="56" cover />
        </v-btn>
    </div>
</template>

<script setup>
import logo from '@/assets/logo.png'
</script>