
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente (incluindo as da Vercel)
  // O terceiro parâmetro '' permite carregar variáveis sem o prefixo VITE_
  // Fix: Cast process to any to resolve "Property 'cwd' does not exist on type 'Process'" error due to missing Node types in config scope
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Substitui 'process.env.API_KEY' pelo valor real da string durante o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    },
    server: {
      port: 3000,
    },
  };
});
