import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { cssMarkNodeTransform, cssMarkPreset } from './vite-plugins/css-mark'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // 添加源码定位标记插件
    cssMarkPreset(),
    // 修改vue插件配置，添加节点转换器
    vue({
      template: {
        compilerOptions: {
          nodeTransforms: [
            cssMarkNodeTransform,
          ],
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})