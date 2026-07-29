<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import WhatsAppButton from '../components/WhatsAppButton.vue'

const router = useRouter()

const chargement = ref(true)
const client = ref(null) // { id, nom_complet, code_adresse }
const colis = ref([])    // liste des colis du client
const demandeEnCours = ref(false)
const messageConsolidation = ref('')

const libellesStatut = {
  en_attente: { texte: 'En attente', classe: 'badge--pending' },
  recu: { texte: 'Reçu', classe: 'badge--received' },
  consolide: { texte: 'Consolidé', classe: 'badge--consolidated' },
}

const aDesColisReceptionnes = computed(() =>
  colis.value.some((c) => c.statut === 'recu')
)

// Une demande en attente empêche d'en soumettre une nouvelle en double
const demandeDejaEnAttente = ref(false)

onMounted(async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const utilisateur = sessionData.session?.user
  if (!utilisateur) {
    router.push('/connexion')
    return
  }

  // Récupère le profil client (nom + code d'adresse unique en Chine)
  const { data: profil } = await supabase
    .from('clients')
    .select('id, nom_complet, code_adresse')
    .eq('id', utilisateur.id)
    .single()

  client.value = profil

  // Récupère la liste des colis associés à ce client
  const { data: colisData } = await supabase
    .from('colis')
    .select('id, description, statut, photo_url, cree_le')
    .eq('client_id', utilisateur.id)
    .order('cree_le', { ascending: false })

  colis.value = colisData || []

  // Vérifie s'il existe déjà une demande de consolidation non traitée
  const { data: demandeExistante } = await supabase
    .from('demandes_consolidation')
    .select('id')
    .eq('client_id', utilisateur.id)
    .eq('statut', 'en_attente')
    .maybeSingle()

  demandeDejaEnAttente.value = !!demandeExistante
  chargement.value = false
})

// Le clic sur "Demander la consolidation" crée une demande consultée ensuite
// par l'admin (Section 3 du Dashboard Admin) : le statut des colis n'est
// changé en "Consolidé" qu'une fois la box réellement préparée côté admin.
async function demanderConsolidation() {
  demandeEnCours.value = true
  messageConsolidation.value = ''

  const { error } = await supabase.from('demandes_consolidation').insert({
    client_id: client.value.id,
  })

  demandeEnCours.value = false

  if (error) {
    if (error.code === '23505') {
      demandeDejaEnAttente.value = true
      messageConsolidation.value = 'Une demande de consolidation est déjà en attente.'
      return
    }

    messageConsolidation.value = "Une erreur est survenue. Réessayez ou contactez le support."
    return
  }

  demandeDejaEnAttente.value = true
  messageConsolidation.value = 'Votre demande de consolidation a été transmise à notre équipe.'
}

async function seDeconnecter() {
  await supabase.auth.signOut()
  router.push('/')
}
</script>

<template>
  <section class="dashboard">
    <div class="container">
      <div v-if="chargement" class="dashboard__loading">Chargement de votre espace…</div>

      <template v-else>
        <div class="dashboard__header">
          <div>
            <h1>Bonjour {{ client?.nom_complet || '' }}</h1>
            <p class="dashboard__sub">Voici votre espace de suivi Simba Logistics.</p>
          </div>
          <button class="btn btn--outline-navy" @click="seDeconnecter">Se déconnecter</button>
        </div>

        <!-- Adresse unique en Chine -->
        <div class="address-card card">
          <span class="address-card__label">Votre adresse unique en Chine</span>
          <div class="address-card__code">{{ client?.code_adresse || '—' }}</div>
          <p class="address-card__hint">
            Indiquez ce code dans le champ "adresse / complément" lors de vos achats en ligne
            pour que vos colis soient identifiés à leur arrivée dans notre entrepôt.
          </p>
        </div>

        <!-- Action de consolidation -->
        <div class="action-card card">
          <div>
            <h3>Demander la consolidation</h3>
            <p>Regroupez tous vos colis reçus en un seul envoi vers le Togo.</p>
          </div>
          <button
            class="btn btn--gold btn--lg"
            :disabled="!aDesColisReceptionnes || demandeEnCours || demandeDejaEnAttente"
            @click="demanderConsolidation"
          >
            {{ demandeDejaEnAttente ? 'Demande déjà envoyée' : (demandeEnCours ? 'Envoi de la demande…' : 'Demander la consolidation') }}
          </button>
        </div>
        <p v-if="messageConsolidation" class="form-success">{{ messageConsolidation }}</p>

        <!-- Galerie de colis -->
        <h2 class="section-heading">Mes colis</h2>

        <div v-if="colis.length === 0" class="empty-state card">
          Aucun colis pour le moment. Utilisez votre adresse Simba Box lors de votre prochain
          achat en ligne : il apparaîtra ici dès sa réception.
        </div>

        <div v-else class="colis-grid">
          <article v-for="c in colis" :key="c.id" class="colis-card">
            <div class="colis-card__photo">
              <img v-if="c.photo_url" :src="c.photo_url" :alt="c.description || 'Photo du colis'" />
              <span v-else class="colis-card__placeholder">Photo à venir</span>
            </div>
            <div class="colis-card__body">
              <span class="badge" :class="libellesStatut[c.statut]?.classe">
                {{ libellesStatut[c.statut]?.texte || c.statut }}
              </span>
              <p class="colis-card__desc">{{ c.description || 'Colis sans description' }}</p>
            </div>
          </article>
        </div>
      </template>
    </div>

    <WhatsAppButton :client-id="client?.code_adresse || ''" />
  </section>
</template>

<style scoped>
.dashboard { padding: 3rem 0 5rem; min-height: 60vh; }
.dashboard__loading { text-align: center; padding: 4rem 0; color: var(--color-ink-soft); }

.dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}
.dashboard__sub { margin: 0; }

.address-card {
  background: linear-gradient(160deg, var(--color-navy), var(--color-navy-light));
  color: var(--color-white);
  margin-bottom: 1.5rem;
}
.address-card__label { font-size: 0.82rem; color: rgba(255,255,255,0.7); }
.address-card__code {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-gold-light);
  margin: 0.4rem 0 0.7rem;
}
.address-card__hint { color: rgba(255,255,255,0.75); font-size: 0.9rem; margin: 0; }

.action-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}
.action-card p { margin: 0; }

.section-heading { margin-top: 2.5rem; font-size: 1.4rem; }

.empty-state { text-align: center; color: var(--color-ink-soft); }

.colis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.colis-card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}
.colis-card__photo {
  aspect-ratio: 4 / 3;
  background: var(--color-mist-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}
.colis-card__photo img { width: 100%; height: 100%; object-fit: cover; }
.colis-card__placeholder { font-size: 0.82rem; color: var(--color-ink-soft); }
.colis-card__body { padding: 1rem; }
.colis-card__desc { margin: 0.6rem 0 0; font-size: 0.9rem; }

@media (max-width: 600px) {
  .action-card { flex-direction: column; align-items: stretch; }
  .action-card .btn { width: 100%; }
}
</style>
