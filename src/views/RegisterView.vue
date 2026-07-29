<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

const nomComplet = ref('')
const telephone = ref('')
const email = ref('')
const motDePasse = ref('')
const chargement = ref(false)
const erreur = ref('')

// Génère un code d'adresse unique lisible, ex : SB-TG-4F82K
function genererCodeAdresse() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sans caractères ambigus (0/O, 1/I)
  let suffixe = ''
  for (let i = 0; i < 5; i++) {
    suffixe += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return `SB-TG-${suffixe}`
}

async function creerCompte() {
  erreur.value = ''
  chargement.value = true

  // 1. Création du compte via Supabase Auth
  const { data, error: erreurAuth } = await supabase.auth.signUp({
    email: email.value,
    password: motDePasse.value,
    options: {
      data: { nom_complet: nomComplet.value,
               telephone: telephone.value,
               },
    },
  })

  if (erreurAuth) {
    erreur.value = erreurAuth.message.includes('already registered')
      ? 'Cet email est déjà associé à un compte. Essayez de vous connecter.'
      : "Impossible de créer le compte. Vérifiez vos informations."
    chargement.value = false
    return
  }

  // 2. Création du profil client avec le code d'adresse unique
  //    (table "clients" attendue dans Supabase, voir README pour le schéma SQL)
  if (data.user) {
    const codeAdresse = genererCodeAdresse()
    const { error: erreurProfil } = await supabase.from('clients').insert({
      id: data.user.id,
      nom_complet: nomComplet.value,
      telephone: telephone.value,
      code_adresse: codeAdresse,
    })

    if (erreurProfil) {
      console.error('Erreur lors de la création du profil client :', erreurProfil.message)
    }
  }

  chargement.value = false

  // Selon la configuration Supabase, une confirmation par email peut être requise.
  if (!data.session) {
    router.push({
      name: 'login',
      query: { message: 'compte-cree' },
    })
    return
  }

  router.push('/dashboard')
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card card">
      <h1>Créer mon compte</h1>
      <p class="auth-sub">Obtenez votre adresse unique en Chine en quelques secondes.</p>

      <p v-if="erreur" class="form-error">{{ erreur }}</p>

      <form @submit.prevent="creerCompte">
        <div class="field">
          <label for="nom">Nom complet</label>
          <input id="nom" v-model="nomComplet" type="text" required autocomplete="name" placeholder="Ex. Ama Koffi" />
        </div>
        <div class="field">
  <label for="telephone">Téléphone</label>
  <input
    id="telephone"
    v-model="telephone"
    type="tel"
    required
    autocomplete="tel"
    placeholder="Ex. +228 90 00 00 00"
  />
</div>
        <div class="field">
          <label for="email">Adresse email</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" placeholder="vous@exemple.com" />
        </div>
        <div class="field">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="motDePasse" type="password" required minlength="6" autocomplete="new-password" placeholder="6 caractères minimum" />
        </div>

        <button type="submit" class="btn btn--gold btn--block btn--lg" :disabled="chargement">
          {{ chargement ? 'Création en cours…' : 'Obtenir mon adresse en Chine' }}
        </button>
      </form>

      <p class="auth-footer">
        Déjà client ?
        <RouterLink to="/connexion">Se connecter</RouterLink>
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
.auth-card { width: 100%; max-width: 440px; }
.auth-sub { margin-bottom: 1.5rem; }
.auth-footer { text-align: center; margin-top: 1rem; font-size: 0.92rem; }
.auth-footer a { color: var(--color-navy); font-weight: 600; text-decoration: underline; }
</style>
