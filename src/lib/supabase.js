// src/lib/supabase.js
// ------------------------------------------------------------------
// Configuration du client Supabase.
// Les clés sont lues depuis les variables d'environnement Vite
// (jamais codées en dur dans le code front-end).
//
// IMPORTANT SÉCURITÉ :
// - On utilise ici UNIQUEMENT la clé publique "anon" (VITE_SUPABASE_ANON_KEY).
// - Cette clé est publique par nature et peut être exposée côté client :
//   la sécurité réelle des données est assurée par les règles RLS
//   (Row Level Security) configurées sur les tables Supabase.
// - Le mot de passe de la base de données (service_role / DB password)
//   ne doit JAMAIS apparaître dans ce fichier ni dans aucun fichier front-end.
// ------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Aide au débogage si le fichier .env n'est pas correctement configuré
  console.error(
    "Erreur de configuration Supabase : vérifiez que VITE_SUPABASE_URL et " +
    "VITE_SUPABASE_ANON_KEY sont bien définis dans votre fichier .env"
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
