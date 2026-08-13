import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
const MAX_DIM = 900;
const QUALITY = 0.78;
// Cache agressif 1 an
const CACHE_CONTROL = "31536000, public, immutable";
// Taille maximale acceptée pour le fichier source (avant compression).
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Vérifie la signature binaire du fichier : un script renommé en .jpg est rejeté. */
async function assertRealImage(file: File): Promise<void> {
  if (file.size === 0) throw new Error("Fichier vide.");
  if (file.size > MAX_FILE_BYTES) throw new Error("Image trop lourde (15 Mo maximum).");
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Format non supporté. Utilisez JPG, PNG, WebP, GIF ou AVIF.");
  }

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (start: number, len: number) =>
    String.fromCharCode(...head.slice(start, start + len));

  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isPng =
    head[0] === 0x89 && ascii(1, 3) === "PNG" && head[4] === 0x0d && head[5] === 0x0a;
  const isGif = ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a";
  const isRiffWebp = ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP";
  const isAvif = ascii(4, 4) === "ftyp";

  if (!(isJpeg || isPng || isGif || isRiffWebp || isAvif)) {
    throw new Error("Ce fichier n'est pas une image valide.");
  }
}

function supportsWebp(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

async function compressImage(file: File): Promise<{ blob: Blob; ext: string; type: string }> {
  // createImageBitmap échoue si le contenu n'est pas réellement décodable.
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non disponible");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const useWebp = supportsWebp();
  const type = useWebp ? "image/webp" : "image/jpeg";
  const ext = useWebp ? "webp" : "jpg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression échouée"))),
      type,
      QUALITY,
    );
  });
  return { blob, ext, type };
}

export async function uploadImage(file: File, prefix = ""): Promise<string> {
  await assertRealImage(file);
  // Le fichier est ré-encodé côté navigateur en WebP optimisé
  const { blob, ext, type } = await compressImage(file);
  const path = `${prefix}${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: type,
    cacheControl: CACHE_CONTROL,
    upsert: false,
  });
  if (error) throw error;

  // Récupération de l'URL publique directe avec cache HTTP instantané
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (data?.publicUrl) return data.publicUrl;

  // Fallback signed URL
  const { data: signData, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (signErr || !signData?.signedUrl) throw signErr ?? new Error("URL non générée");
  return signData.signedUrl;
}

export function uploadProductImage(file: File): Promise<string> {
  return uploadImage(file, "products/");
}

export function uploadCategoryImage(file: File): Promise<string> {
  return uploadImage(file, "categories/");
}
