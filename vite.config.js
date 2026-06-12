import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages 프로젝트 사이트는 /sayo/ 하위에서 서빙됨. 로컬 dev는 / 유지.
  base: command === 'build' ? '/sayo/' : '/',
  server: {
    allowedHosts: ['.loca.lt'],
  },
}));
