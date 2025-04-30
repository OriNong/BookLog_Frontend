<template>
    <div>
      <h3>도서 상세 페이지입니다 (ISBN: {{ isbn }})</h3>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  const route = useRoute()
  const isbn = route.params.isbn
  </script>
  