import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    return {
      base: '/color-dropper/',
    };
  }
  return {};
});
