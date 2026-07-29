<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { uploaderPhotoColis, supprimerPhotoColis } from '../lib/storage'

const ongletActif = ref('clients') // 'clients' | 'colis' | 'demandes'
const chargement = ref(true)
const erreurGlobale = ref('')

const libellesStatut = {
  en_attente: 'En attente',
  recu: 'Reçu',
  consolide: 'Consolidé',
}

/* ---------------------- Section Clients ---------------------- */
const clients = ref([])

async function chargerClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('id, nom_complet, telephone, code_adresse, cree_le, is_admin')
    .eq('is_admin', false)
    .order('cree_le', { ascending: false })

  if (error) throw error
  clients.value = data || []
}

/* ---------------------- Section Colis ---------------------- */
const tousLesColis = ref([])
const nouveauColis = ref({ clientId: '', description: '', fichier: null })
const envoiEnCours = ref(false)
const erreurColis = ref('')
const succesColis = ref('')

async function chargerColis() {
  const { data, error } = await supabase
    .from('colis')
    .select('id, description, statut, photo_url, cree_le, client_id, clients(nom_complet, code_adresse)')
    .order('cree_le', { ascending: false })

  if (error) throw error
  tousLesColis.value = data || []
}

function surChangementFichier(evenement) {
  nouveauColis.value.fichier = evenement.target.files?.[0] || null
}

async function ajouterColis() {
  erreurColis.value = ''
  succesColis.value = ''

  if (!nouveauColis.value.clientId) {
    erreurColis.value = 'Sélectionnez un client.'
    return
  }

  envoiEnCours.value = true
  try {
    let photo = null
    if (nouveauColis.value.fichier) {
      photo = await uploaderPhotoColis(nouveauColis.value.fichier)
    }

    const { error } = await supabase.from('colis').insert({
      client_id: nouveauColis.value.clientId,
      description: nouveauColis.value.description.trim() || null,
      photo_url: photo?.url || null,
      statut: 'en_attente',
    })

    if (error) {
      await supprimerPhotoColis(photo?.chemin)
      throw error
    }

    succesColis.value = 'Colis ajouté avec succès.'
    nouveauColis.value = { clientId: '', description: '', fichier: null }
    document.getElementById('champ-photo-colis').value = ''
    await chargerColis()
  } catch (e) {
    erreurColis.value = e.message || "Impossible d'ajouter ce colis."
  } finally {
    envoiEnCours.value = false
  }
}

async function changerStatutColis(colisItem, nouveauStatut) {
  erreurGlobale.value = ''
  const ancienStatut = colisItem.statut
  colisItem.statut = nouveauStatut

  const { error } = await supabase
    .from('colis')
    .update({ statut: nouveauStatut })
    .eq('id', colisItem.id)

  if (error) {
    colisItem.statut = ancienStatut
    erreurGlobale.value = `Le statut n’a pas été modifié : ${error.message}`
  }
}

/* ---------------------- Section Demandes de consolidation ---------------------- */
const demandes = ref([])
const traitementEnCours = ref(null) // id de la demande en cours de traitement

async function chargerDemandes() {
  const { data, error } = await supabase
    .from('demandes_consolidation')
    .select('id, statut, cree_le, client_id, clients(nom_complet, code_adresse, telephone)')
    .order('cree_le', { ascending: true })

  if (error) throw error
  demandes.value = data || []
}

async function traiterDemande(demande) {
  traitementEnCours.value = demande.id
  erreurGlobale.value = ''

  const { error } = await supabase.rpc('traiter_demande_consolidation', {
    p_demande_id: demande.id,
  })

  traitementEnCours.value = null

  if (error) {
    erreurGlobale.value = `La demande n’a pas pu être traitée : ${error.message}`
    return
  }

  demande.statut = 'traitee'
  await chargerColis()
}

onMounted(async () => {
  try {
    await Promise.all([chargerClients(), chargerColis(), chargerDemandes()])
  } catch (error) {
    erreurGlobale.value = `Impossible de charger le dashboard : ${error.message}`
  } finally {
    chargement.value = false
  }
})
</script>

<template>
  <section class="admin">
    <div class="container">
      <h1>Dashboard Administrateur</h1>
      <p class="admin__sub">Gérez les clients, les colis et les demandes de consolidation.</p>
      <p v-if="erreurGlobale" class="form-error" role="alert">{{ erreurGlobale }}</p>

      <nav class="tabs">
        <button :class="{ 'tabs__btn--active': ongletActif === 'clients' }" class="tabs__btn" @click="ongletActif = 'clients'">
          Clients
        </button>
        <button :class="{ 'tabs__btn--active': ongletActif === 'colis' }" class="tabs__btn" @click="ongletActif = 'colis'">
          Gestion des colis
        </button>
        <button :class="{ 'tabs__btn--active': ongletActif === 'demandes' }" class="tabs__btn" @click="ongletActif = 'demandes'">
          Demandes de consolidation
          <span v-if="demandes.filter(d => d.statut === 'en_attente').length" class="tabs__count">
            {{ demandes.filter(d => d.statut === 'en_attente').length }}
          </span>
        </button>
      </nav>

      <div v-if="chargement" class="admin__loading">Chargement des données…</div>

      <!-- ===================== ONGLET CLIENTS ===================== -->
      <div v-else-if="ongletActif === 'clients'" class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Code adresse Chine</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in clients" :key="c.id">
                <td>{{ c.nom_complet }}</td>
                <td>{{ c.telephone || '—' }}</td>
                <td><span class="code">{{ c.code_adresse }}</span></td>
                <td>{{ new Date(c.cree_le).toLocaleDateString('fr-FR') }}</td>
              </tr>
              <tr v-if="clients.length === 0">
                <td colspan="4" class="empty-cell">Aucun client inscrit pour le moment.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===================== ONGLET COLIS ===================== -->
      <div v-else-if="ongletActif === 'colis'" class="panel">
        <div class="card add-colis-card">
          <h3>Ajouter un colis</h3>
          <p v-if="erreurColis" class="form-error">{{ erreurColis }}</p>
          <p v-if="succesColis" class="form-success">{{ succesColis }}</p>

          <form class="add-colis-form" @submit.prevent="ajouterColis">
            <div class="field">
              <label for="client-select">Client</label>
              <select id="client-select" v-model="nouveauColis.clientId" required>
                <option value="" disabled>Sélectionner un client…</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">
                  {{ c.nom_complet }} — {{ c.code_adresse }}
                </option>
              </select>
            </div>
            <div class="field">
              <label for="description-colis">Description du contenu</label>
              <input id="description-colis" v-model="nouveauColis.description" type="text" placeholder="Ex. Chaussures, x2 cartons" />
            </div>
            <div class="field">
              <label for="champ-photo-colis">Photo du colis</label>
              <input id="champ-photo-colis" type="file" accept="image/*" @change="surChangementFichier" />
            </div>
            <button type="submit" class="btn btn--gold" :disabled="envoiEnCours">
              {{ envoiEnCours ? 'Envoi en cours…' : 'Ajouter le colis' }}
            </button>
          </form>
        </div>

        <h3 class="section-heading">Tous les colis</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Client</th>
                <th>Description</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in tousLesColis" :key="item.id">
                <td>
                  <img v-if="item.photo_url" :src="item.photo_url" class="thumb" :alt="`Photo du colis de ${item.clients?.nom_complet || 'client'}`" />
                  <span v-else class="empty-cell">—</span>
                </td>
                <td>
                  {{ item.clients?.nom_complet || '—' }}
                  <div class="code code--sm">{{ item.clients?.code_adresse }}</div>
                </td>
                <td>{{ item.description || '—' }}</td>
                <td>
                  <select :value="item.statut" @change="changerStatutColis(item, $event.target.value)">
                    <option value="en_attente">{{ libellesStatut.en_attente }}</option>
                    <option value="recu">{{ libellesStatut.recu }}</option>
                    <option value="consolide">{{ libellesStatut.consolide }}</option>
                  </select>
                </td>
              </tr>
              <tr v-if="tousLesColis.length === 0">
                <td colspan="4" class="empty-cell">Aucun colis enregistré.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===================== ONGLET DEMANDES ===================== -->
      <div v-else class="panel">
        <div v-if="demandes.length === 0" class="empty-state card">
          Aucune demande de consolidation pour le moment.
        </div>
        <div v-else class="demandes-grid">
          <article v-for="d in demandes" :key="d.id" class="demande-card card">
            <div>
              <span class="badge" :class="d.statut === 'en_attente' ? 'badge--pending' : 'badge--consolidated'">
                {{ d.statut === 'en_attente' ? 'À préparer' : 'Traitée' }}
              </span>
              <h4>{{ d.clients?.nom_complet }}</h4>
              <p class="demande-card__meta">
                {{ d.clients?.code_adresse }} · {{ d.clients?.telephone || 'Téléphone non renseigné' }}
              </p>
              <p class="demande-card__date">
                Demandé le {{ new Date(d.cree_le).toLocaleDateString('fr-FR') }}
              </p>
            </div>
            <button
              v-if="d.statut === 'en_attente'"
              class="btn btn--navy"
              :disabled="traitementEnCours === d.id"
              @click="traiterDemande(d)"
            >
              {{ traitementEnCours === d.id ? 'Traitement…' : 'Marquer comme préparée' }}
            </button>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin { padding: 3rem 0 5rem; }
.admin__sub { margin-bottom: 2rem; }
.admin__loading { padding: 3rem 0; text-align: center; color: var(--color-ink-soft); }

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--color-mist-dark);
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.tabs__btn {
  background: none;
  border: none;
  padding: 0.85rem 1.1rem;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--color-ink-soft);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.tabs__btn--active { color: var(--color-navy); border-bottom-color: var(--color-gold); }
.tabs__count {
  background: var(--color-gold);
  color: var(--color-navy);
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
}

.section-heading { margin-top: 2.5rem; font-size: 1.2rem; }

.table-wrap { overflow-x: auto; background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-card); }
table { width: 100%; border-collapse: collapse; min-width: 560px; }
th, td { text-align: left; padding: 0.9rem 1.1rem; font-size: 0.92rem; border-bottom: 1px solid var(--color-mist-dark); }
th { color: var(--color-navy); font-family: var(--font-display); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
tr:last-child td { border-bottom: none; }
.empty-cell { color: var(--color-ink-soft); text-align: center; }

.code { font-family: var(--font-mono); font-weight: 600; color: var(--color-navy); }
.code--sm { font-size: 0.78rem; color: var(--color-ink-soft); font-weight: 500; }

.thumb { width: 52px; height: 52px; object-fit: cover; border-radius: var(--radius-sm); }

select {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-mist-dark);
  font-family: var(--font-body);
  background: var(--color-white);
}

.add-colis-card { margin-bottom: 2.5rem; }
.add-colis-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.25rem; align-items: end; }
.add-colis-form .field:nth-child(2) { grid-column: 1 / -1; }
.add-colis-form .field:nth-child(3) { grid-column: 1 / -1; }
.add-colis-form button { grid-column: 1 / -1; justify-self: start; }

@media (max-width: 640px) {
  .add-colis-form { grid-template-columns: 1fr; }
}

.demandes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}
.demande-card { display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; }
.demande-card h4 { margin: 0.6rem 0 0.2rem; }
.demande-card__meta { margin: 0; font-size: 0.85rem; }
.demande-card__date { margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--color-ink-soft); }
</style>
