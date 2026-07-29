import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Configuration Vite
// IMPORTANT : la propriété "base" doit correspondre au nom de votre dépôt GitHub
// Exemple : si votre dépôt est "github.com/mon-compte/simba-logistics"
// alors base doit être '/simba-logistics/'
// Si vous déployez sur un domaine personnalisé ou un site "user.github.io", mettez base: '/'
export default defineConfig({
  plugins: [vue()],
  base: '/simba-logistics/',
})
