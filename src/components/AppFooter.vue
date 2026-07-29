<script setup>
const annee = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <div class="site-footer__col">
        <h3 class="site-footer__title">Simba Logistics</h3>
        <p class="site-footer__desc">
          Consolidation, importation et exportation de colis entre la Chine, le Burkina Faso, la Côte d'Ivoire, le Bénin et le Togo.
          Une adresse, un tarif, une livraison simple.
        </p>
      </div>

      <div class="site-footer__col">
        <h4>Contacts</h4>
        <ul class="contact-list">
          <li>
            <span class="contact-list__label">Togo</span>
            <a href="tel:+22897973737">+228 97 97 37 37</a>
          </li>
          <li>
            <span class="contact-list__label">WhatsApp Chine</span>
            <a href="https://wa.me/8613016089281" target="_blank" rel="noopener">+86 130 1608 9281</a>
          </li>
        </ul>
      </div>

      <div class="site-footer__col">
        <h4>Liens rapides</h4>
        <ul class="contact-list">
          <li><router-link to="/inscription">Créer un compte</router-link></li>
          <li><router-link to="/connexion">Se connecter</router-link></li>
          <li><router-link to="/dashboard">Espace client</router-link></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__bottom">
      <span>© {{ annee }} Simba Logistics — Tous droits réservés.</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-navy);
  color: rgba(255,255,255,0.75);
  padding-top: 3.5rem;
  border-top: 1px solid rgba(201,162,39,0.2);
}
.site-footer__inner {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 2.5rem;
  padding-bottom: 2.5rem;
}
.site-footer__title {
  font-family: var(--font-display);
  color: var(--color-gold);
  font-size: 1.2rem;
  margin: 0 0 0.75rem;
}
.site-footer__desc { max-width: 34ch; line-height: 1.6; font-size: 0.92rem; }
.site-footer h4 {
  color: var(--color-white);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 1rem;
}
.contact-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.7rem; }
.contact-list__label { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.5); }
.contact-list a { color: rgba(255,255,255,0.85); text-decoration: none; font-size: 0.95rem; }
.contact-list a:hover { color: var(--color-gold-light); }

.site-footer__bottom {
  border-top: 1px solid rgba(255,255,255,0.08);
  text-align: center;
  padding: 1.2rem 0;
  font-size: 0.82rem;
}

@media (max-width: 760px) {
  .site-footer__inner { grid-template-columns: 1fr; gap: 2rem; }
}
</style>
