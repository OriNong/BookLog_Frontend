<template>
    <!-- v-app-bar는 Vuetify의 고정 헤더 컴포넌트 -->
    <v-app-bar
      elevation="1"
      density="comfortable"
      class="bg-grey-lighten-4"
    >
      <!-- 좌측 로고 (router-link 버튼) -->
      <RouterLink to="/" class="d-flex">
        <v-btn
          variant="text"
          class="pa-0"
        >
          <!-- 로고 이미지 경로만 알맞게 교체하세요 -->
          <v-img
            src="@/assets/logo.svg"
            alt="BOOKLOG 로고"
            height="48"
            width="48"
            cover
          />
        </v-btn>
      </RouterLink>
  
      <!-- 가운데 검색창 -->
      <v-spacer /> <!-- 로고와 검색창 사이 여백 확보 -->
  
      <v-form
        @submit.prevent="onSearch"
        class="mx-auto"
        style="max-width: 600px; width: 100%"
      >
        <v-text-field
          v-model="keyword"
          variant="outlined"
          placeholder="Hinted search text"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-magnify"
          single-line
        />
      </v-form>
  
      <v-spacer /> <!-- 우측 확장용 여백 -->
    </v-app-bar>
  </template>
  