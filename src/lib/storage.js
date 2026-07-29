import { supabase } from './supabase'

const BUCKET_COLIS = 'colis-photos'
const TAILLE_MAX = 5 * 1024 * 1024
const TYPES_AUTORISES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function extensionDepuisType(type) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return extensions[type]
}

export async function uploaderPhotoColis(fichier) {
  if (!fichier) return null

  if (!TYPES_AUTORISES.has(fichier.type)) {
    throw new Error('Format non autorisé. Utilisez une image JPG, PNG ou WebP.')
  }

  if (fichier.size > TAILLE_MAX) {
    throw new Error('La photo ne doit pas dépasser 5 Mo.')
  }

  const extension = extensionDepuisType(fichier.type)
  const chemin = `colis/${crypto.randomUUID()}.${extension}`

  const { error: erreurUpload } = await supabase.storage
    .from(BUCKET_COLIS)
    .upload(chemin, fichier, {
      cacheControl: '3600',
      contentType: fichier.type,
      upsert: false,
    })

  if (erreurUpload) {
    throw new Error(`Échec de l’envoi de la photo : ${erreurUpload.message}`)
  }

  const { data } = supabase.storage.from(BUCKET_COLIS).getPublicUrl(chemin)

  if (!data?.publicUrl) {
    await supabase.storage.from(BUCKET_COLIS).remove([chemin])
    throw new Error("Impossible de récupérer l’URL publique de la photo.")
  }

  return { url: data.publicUrl, chemin }
}

export async function supprimerPhotoColis(chemin) {
  if (!chemin) return
  const { error } = await supabase.storage.from(BUCKET_COLIS).remove([chemin])
  if (error) console.error('Suppression de la photo impossible :', error.message)
}
