import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist' // ✅ matches outputDirectory in vercel.json
  },
  server: {
    port: 5173 // optional, helps local dev consistency
  }
});
