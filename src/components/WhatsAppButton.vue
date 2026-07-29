<script setup>
import { computed } from 'vue'

// clientId : identifiant du client à insérer dans le message pré-rempli.
// Optionnel : si absent, on envoie un message générique.
const props = defineProps({
  clientId: { type: String, default: '' },
})

const lienWhatsApp = computed(() => {
  const base = 'Bonjour le support Simba'
  const message = props.clientId
    ? `${base}, voici mon ID Client ${props.clientId}, j'ai besoin d'instructions pour ma livraison.`
    : `${base}, j'ai besoin d'informations sur mon envoi.`

  return `https://wa.me/8613016089281?text=${encodeURIComponent(message)}`
})
</script>

<template>
  <a
    :href="lienWhatsApp"
    target="_blank"
    rel="noopener"
    class="whatsapp-fab"
    aria-label="Contacter le support via WhatsApp"
  >
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
      <path d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.07-1.33A9.94 9.94 0 0 0 12.02 22C17.55 22 22 17.52 22 12S17.55 2 12.02 2Zm0 18.06c-1.62 0-3.13-.44-4.43-1.2l-.32-.19-3.01.79.8-2.93-.2-.3a8.06 8.06 0 0 1-1.24-4.23c0-4.46 3.63-8.08 8.4-8.08 4.46 0 8.08 3.62 8.08 8.08 0 4.46-3.62 8.06-8.08 8.06Zm4.42-6.05c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.44-1.34-1.68-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.71 2.61 4.15 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.15.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28Z"/>
    </svg>
  </a>
</template>

<style scoped>
.whatsapp-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #25D366;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(0,0,0,0.25);
  z-index: 60;
  transition: transform 0.15s ease;
}
.whatsapp-fab:hover { transform: scale(1.06); }

@media (prefers-reduced-motion: reduce) {
  .whatsapp-fab { transition: none; }
}
</style>
