const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,

  pluginOptions: {
    vuetify: {
      // 이 블록 전체 삭제
    }
  },

  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        ws: false // WebSocket 요청은 프록시하지 않음
      }
    }
  }
});
