<script setup>
import { RouterLink } from 'vue-router'

// Les 5 étapes du parcours d'un colis, dans l'ordre chronologique réel
const etapes = [
  {
    numero: '01',
    titre: "S'inscrire",
    texte: "Créez votre compte et recevez instantanément votre adresse unique Simba Box en Chine.",
  },
  {
    numero: '02',
    titre: 'Acheter en ligne',
    texte: "Utilisez votre adresse Simba Box comme adresse de livraison sur toutes vos plateformes préférées.",
  },
  {
    numero: '03',
    titre: 'Réceptionner',
    texte: "Chaque colis est réceptionné dans notre entrepôt, photographié, et vous recevez une notification.",
  },
  {
    numero: '04',
    titre: 'Regrouper',
    texte: "Vos colis sont consolidés en un seul envoi solide, expédié avec un numéro de suivi unique.",
  },
  {
    numero: '05',
    titre: 'Livraison',
    texte: "Votre colis est livré à votre domicile. Dédouanement inclus selon votre pays de destination.",
  },
]

const avantages = [
  { titre: 'Regroupement de colis', texte: "Tous vos achats réunis en un seul envoi, pour un seul coût d'expédition." },
  { titre: 'Stockage sécurisé', texte: '15 jours de stockage gratuit dans notre entrepôt en Chine, sous surveillance.' },
  { titre: 'Expédition unique', texte: 'Un seul colis, un seul suivi, jusqu\u2019à votre porte au Burkina Faso, en Côte d\Ivoire, au Bénin et au Togo.' },
]
</script>

<template>
  <div class="home">
    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__content">
          <span class="eyebrow">Chine → Togo · Consolidation de colis</span>
          <h1 class="hero__title">
            Une adresse en Chine.<br />
            <span class="hero__title-accent">Un seul colis</span> à la livraison.
          </h1>
          <p class="hero__lead">
            Simba Logistics regroupe vos achats en ligne en un envoi unique, stocké
            gratuitement 15 jours et livré chez vous au Burkina Faso, en Côte d'Ivoire, au Bénin et au Togo. Simplifiez-vous la vie.
          </p>
          <div class="hero__actions">
            <RouterLink to="/inscription" class="btn btn--gold btn--lg">
              Obtenir mon adresse en Chine
            </RouterLink>
            <a href="https://wa.me/8613016089281" class="btn btn--outline-navy btn--lg">☎️ +86 130 1608 9281</a>
          </div>
        </div>

        <!-- Signature visuelle : la route Chine → Togo -->
        <div class="hero__route" aria-hidden="true">
          <svg viewBox="0 0 420 260" width="100%" height="100%">
            <path id="route-path" d="M40 60 C 140 20, 220 220, 380 190" fill="none"
                  stroke="var(--color-gold)" stroke-width="2.5" stroke-dasharray="2 10" stroke-linecap="round"/>
            <circle cx="40" cy="60" r="7" fill="#ffffff"/>
            <text x="40" y="38" text-anchor="middle" font-family="Sora, sans-serif" font-size="13" font-weight="700" fill="#ffffff">Chine</text>
            <circle cx="380" cy="190" r="7" fill="var(--color-gold)"/>
            <text x="280" y="216" text-anchor="middle" font-family="Sora, sans-serif" font-size="13" font-weight="700" fill="#2E7D5B">Togo-Burkina Faso-Côte d'Ivoire-Bénin</text>
            <g class="route-plane">
              <circle r="5.5" fill="var(--color-white)" stroke="var(--color-gold)" stroke-width="2"/>
            </g>
          </svg>
        </div>
      </div>
    </section>

    <!-- ===================== 5 ÉTAPES ===================== -->
    <section id="etapes" class="steps">
      <div class="container">
        <h2 class="section-title">Comment ça marche</h2>
        <p class="section-lead">Cinq étapes, du clic d'achat à la livraison chez vous.</p>

        <div class="steps__track">
          <div class="steps__line" aria-hidden="true"></div>
          <article v-for="etape in etapes" :key="etape.numero" class="step-card">
            <span class="step-card__number">{{ etape.numero }}</span>
            <h3>{{ etape.titre }}</h3>
            <p>{{ etape.texte }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ===================== SIMBA BOX PREMIUM ===================== -->
    <section class="premium">
      <div class="container premium__inner">
        <div class="premium__text">
          <span class="eyebrow eyebrow--light">Simba Box Premium</span>
          <h2>Votre service de consolidation.<br />Simplifiez-vous la vie.</h2>
          <ul class="premium__list">
            <li v-for="a in avantages" :key="a.titre">
              <strong>{{ a.titre }}</strong>
              <span>{{ a.texte }}</span>
            </li>
          </ul>
          <RouterLink to="/inscription" class="btn btn--gold btn--lg">
            Je crée mon compte
          </RouterLink>
        </div>

        <div class="premium__price-card">
          <span class="premium__price-label">Tarif unique, par box consolidée</span>
          <div class="premium__price">
            <span class="premium__price-amount"> 5 </span>
            <span class="premium__price-currency">$</span>
          </div>
          <p class="premium__price-note">Aucun frais caché.</p>
          <div class="premium__price-storage">
            <strong>15 jours</strong>
            <span>de stockage gratuit en entrepôt</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.eyebrow {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: 1rem;
}
.eyebrow--light { color: var(--color-gold-light); }

/* ---------- Hero ---------- */
.hero {
  background: linear-gradient(160deg, var(--color-navy) 0%, var(--color-navy-light) 65%, var(--color-navy-soft) 100%);
  padding: 5rem 0 4rem;
}
.hero__inner {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 2.5rem;
  align-items: center;
}
.hero__title {
  color: var(--color-white);
  font-size: clamp(2.1rem, 4vw, 3.1rem);
  font-weight: 700;
  margin-bottom: 1.1rem;
}
.hero__title-accent { color: var(--color-gold-light); }
.hero__lead { color: rgba(255,255,255,0.78); font-size: 1.08rem; max-width: 46ch; }
.hero__actions { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.6rem; }

.hero__route { width: 100%; }
.route-plane {
  offset-path: path('M40 60 C 140 20, 220 220, 380 190');
  animation: fly 7s linear infinite;
}
@keyframes fly {
  0% { offset-distance: 0%; }
  100% { offset-distance: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .route-plane { animation: none; offset-distance: 50%; }
}

@media (max-width: 900px) {
  .hero__inner { grid-template-columns: 1fr; }
  .hero__route { max-width: 320px; margin: 0 auto; }
}

/* ---------- Étapes ---------- */
.steps { padding: 5rem 0; }
.section-title { font-size: 2rem; text-align: center; }
.section-lead { text-align: center; max-width: 48ch; margin: 0 auto 3rem; }

.steps__track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
}
.steps__line {
  position: absolute;
  top: 28px;
  left: 5%;
  right: 5%;
  height: 2px;
  background-image: linear-gradient(90deg, var(--color-gold) 50%, transparent 50%);
  background-size: 14px 2px;
  z-index: 0;
}
.step-card {
  position: relative;
  z-index: 1;
  background: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 1.5rem 1.25rem;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.step-card:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-3px); }
.step-card__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--color-navy);
  color: var(--color-gold-light);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.9rem;
}
.step-card h3 { font-size: 1.05rem; margin-bottom: 0.4rem; }
.step-card p { font-size: 0.9rem; margin: 0; }

@media (max-width: 960px) {
  .steps__track { grid-template-columns: 1fr; }
  .steps__line { display: none; }
}

/* ---------- Simba Box Premium ---------- */
.premium { background: var(--color-white); padding: 5rem 0; }
.premium__inner {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 3rem;
  align-items: center;
}
.premium__text h2 { font-size: 1.9rem; max-width: 18ch; }
.premium__list { list-style: none; padding: 0; margin: 1.5rem 0 2rem; display: flex; flex-direction: column; gap: 1rem; }
.premium__list li { display: flex; flex-direction: column; gap: 0.15rem; }
.premium__list strong { color: var(--color-navy); }
.premium__list span { color: var(--color-ink-soft); font-size: 0.92rem; }

.premium__price-card {
  background: linear-gradient(160deg, var(--color-navy), var(--color-navy-light));
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  color: var(--color-white);
  text-align: center;
}
.premium__price-label { font-size: 0.85rem; color: rgba(255,255,255,0.7); }
.premium__price { margin: 0.6rem 0; }
.premium__price-amount { font-family: var(--font-display); font-size: 3rem; font-weight: 800; color: var(--color-gold-light); }
.premium__price-currency { font-size: 1.1rem; margin-left: 0.35rem; color: rgba(255,255,255,0.8); }
.premium__price-note { font-size: 0.85rem; color: rgba(255,255,255,0.6); }
.premium__price-storage {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.15);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.premium__price-storage strong { color: var(--color-gold-light); font-size: 1.1rem; }
.premium__price-storage span { font-size: 0.85rem; color: rgba(255,255,255,0.7); }

@media (max-width: 860px) {
  .premium__inner { grid-template-columns: 1fr; }
}
</style>
