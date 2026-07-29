import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

// On utilise createWebHashHistory() : les URLs ressemblent à
// "https://mon-site.github.io/simba-logistics/#/dashboard"
// Ce mode fonctionne parfaitement sur GitHub Pages sans configuration serveur,
// contrairement au mode "history" classique qui nécessite des règles de réécriture.

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/connexion',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/inscription',
    name: 'register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminDashboardView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Garde de navigation : protège les routes qui exigent une session active
// et, pour /admin, vérifie en plus le rôle administrateur (is_admin) en base.
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { data } = await supabase.auth.getSession()
  const utilisateur = data.session?.user

  if (!utilisateur) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin) {
    // Le rôle est vérifié côté base à chaque navigation : on ne fait jamais
    // confiance à une donnée mise en cache côté client pour cette décision.
    const { data: profil, error } = await supabase
      .from('clients')
      .select('is_admin')
      .eq('id', utilisateur.id)
      .single()

    if (error || !profil?.is_admin) {
      return { name: 'dashboard' }
    }
  }

  return true
})

export default router
