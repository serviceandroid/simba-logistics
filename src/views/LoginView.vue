<script setup>
import { ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const route = useRoute()

const email = ref('')
const motDePasse = ref('')
const erreur = ref('')
const chargement = ref(false)

async function seConnecter() {
  erreur.value = ''
  chargement.value = true

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value.trim().toLowerCase(),
      password: motDePasse.value,
    })

    if (error) {
      console.error('Erreur Supabase Auth :', {
        code: error.code,
        message: error.message,
        status: error.status,
      })

      erreur.value = `${error.code || 'auth_error'} : ${error.message}`
      return
    }

    if (!data.user) {
      erreur.value = 'Connexion réussie, mais aucun utilisateur n’a été trouvé.'
      return
    }

    const { data: profil, error: erreurProfil } = await supabase
      .from('clients')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (erreurProfil) {
      console.error('Erreur lors de la lecture du profil :', erreurProfil)
      erreur.value =
        'Connexion réussie, mais le profil utilisateur est inaccessible.'
      return
    }

    const redirection =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : null

    if (redirection) {
      await router.push(redirection)
      return
    }

    await router.push(profil?.is_admin ? '/admin' : '/dashboard')
  } catch (exception) {
    console.error('Erreur inattendue pendant la connexion :', exception)
    erreur.value = 'Une erreur inattendue est survenue. Veuillez réessayer.'
  } finally {
    chargement.value = false
  }
}
</script>
<template>
  <section class="auth-page">
    <div class="auth-card card">
      <h1>Connexion</h1>
      <p class="auth-sub">Accédez à votre espace client Simba Logistics.</p>

      <p v-if="erreur" class="form-error">{{ erreur }}</p>

      <form @submit.prevent="seConnecter">
        <div class="field">
          <label for="email">Adresse email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" placeholder="vous@exemple.com" />
        </div>
        <div class="field">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="motDePasse" type="password" required autocomplete="current-password" placeholder="••••••••" />
        </div>

        <button type="submit" class="btn btn--gold btn--block btn--lg" :disabled="chargement">
          {{ chargement ? 'Connexion en cours…' : 'Se connecter' }}
        </button>
      </form>

      <p class="auth-footer">
        Pas encore de compte ?
        <RouterLink to="/inscription">Créer mon adresse en Chine</RouterLink>
      </p>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 72px - 260px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  background: var(--color-mist);
}
.auth-card { width: 100%; max-width: 420px; }
.auth-sub { margin-bottom: 1.5rem; }
.auth-footer { text-align: center; margin-top: 1rem; font-size: 0.92rem; }
.auth-footer a { color: var(--color-navy); font-weight: 600; text-decoration: underline; }
</style>
