<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'
import logoSimba from '../assets/logo3.jpg'

const menuOuvert = ref(false)
const estConnecte = ref(false)
const estAdmin = ref(false)
let abonnementAuth = null

async function actualiserEtat(session) {
  estConnecte.value = Boolean(session?.user)
  estAdmin.value = false

  if (!session?.user) return

  const { data: profil, error } = await supabase
    .from('clients')
    .select('is_admin')
    .eq('id', session.user.id)
    .single()

  if (!error) estAdmin.value = Boolean(profil?.is_admin)
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  await actualiserEtat(data.session)

  const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
    // Diffère la requête de profil pour éviter d'effectuer un appel Supabase
    // asynchrone directement dans le callback d'authentification.
    window.setTimeout(() => {
      void actualiserEtat(session)
    }, 0)
  })

  abonnementAuth = authListener.subscription
})

onUnmounted(() => {
  abonnementAuth?.unsubscribe()
})
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner container">
      <RouterLink
    to="/"
    class="brand"
    aria-label="Accueil Simba Logistics"
    @click="menuOuvert = false"
  >
    <img
      :src="logoSimba"
      alt="Simba Logistics"
      class="brand__logo"
    />
  </RouterLink>

      <button class="burger" :aria-expanded="menuOuvert" aria-label="Ouvrir le menu" @click="menuOuvert = !menuOuvert">
        <span></span><span></span><span></span>
      </button>

      <nav class="main-nav" :class="{ 'main-nav--open': menuOuvert }">
        <RouterLink to="/" @click="menuOuvert = false">Accueil</RouterLink>
        <RouterLink v-if="estConnecte" to="/dashboard" @click="menuOuvert = false">Mon espace</RouterLink>
        <RouterLink v-if="estAdmin" to="/admin" @click="menuOuvert = false">Admin</RouterLink>

        <template v-if="!estConnecte">
          <RouterLink to="/connexion" class="btn btn--ghost" @click="menuOuvert = false">Connexion</RouterLink>
          <RouterLink to="/inscription" class="btn btn--gold" @click="menuOuvert = false">Obtenir mon adresse</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(11, 37, 69, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(201, 162, 39, 0.25);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  height: 72px;
}

/* Logo */
.brand {
  display: flex;
  flex: 0 1 auto;
  align-items: center;
  min-width: 0;
  color: var(--color-white);
  text-decoration: none;
  font-family: var(--font-display);
}

.brand__logo {
  display: block;
  width: clamp(550px, 30vw, 330px);
  max-width: 100%;
  height: auto;
  max-height: 60px;
  object-fit: contain;
  object-position: left center;
}

/* Anciennes classes conservées */
.brand__mark {
  color: var(--color-gold);
  display: flex;
}

.brand__text {
  font-size: 1.15rem;
  letter-spacing: 0.01em;
}

.brand__text strong {
  color: var(--color-gold);
  font-weight: 700;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  flex-shrink: 0;
}

.main-nav a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
}

.main-nav a:hover {
  color: var(--color-gold-light);
}

.main-nav a.router-link-exact-active {
  color: var(--color-gold);
}

.burger {
  display: none;
  flex-direction: column;
  flex-shrink: 0;
  gap: 5px;
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
 
}

.burger span {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--color-white);
}

@media (max-width: 860px) {
  .site-header__inner {
    gap: 1rem;
  }

  .brand {
    max-width: calc(100% - 82px);
  }

  .brand__logo {
    width: clamp(135px, 42vw, 190px);
    max-height: 46px;
  }

  .burger {
    display: flex;
  }

  .main-nav {
    position: fixed;
    inset: 72px 0 0 0;
    background: var(--color-navy);
    flex-direction: column;
    justify-content: flex-start;
    padding: 2rem 1.5rem;
    gap: 1.4rem;
    transform: translateY(-8px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
     height:fit-content;
  }

  .main-nav--open {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  .main-nav a {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .brand__logo {
    width: clamp(120px, 48vw, 165px);
    max-height: 42px;
  }
}
</style>
