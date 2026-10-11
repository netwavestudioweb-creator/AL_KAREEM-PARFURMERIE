/**
 * Numéros béninois : 10 chiffres commençant par 01 depuis la réforme de 2024,
 * l'ancien format à 8 chiffres reste accepté et converti.
 */
export function normalizeBeninPhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");

  if (digits.startsWith("00229")) digits = digits.slice(5);
  else if (digits.startsWith("229") && digits.length > 10) digits = digits.slice(3);

  // Nouveau format officiel : 10 chiffres commençant par 01
  if (digits.length === 10 && digits.startsWith("01")) return digits;
  // Ancien format local : 8 chiffres -> préfixe 01
  if (digits.length === 8) return `01${digits}`;
  // Saisi avec un seul 0 (ex : 061888987)
  if (digits.length === 9 && digits.startsWith("0")) return `01${digits.slice(1)}`;
  // Autres numéros (international, autres préfixes) : 8 à 15 chiffres
  if (digits.length >= 8 && digits.length <= 15) return digits;

  return null;
}

export function formatBeninPhone(digits: string): string {
  if (digits.length === 10) return digits.replace(/(\d{2})(?=\d)/g, "$1 ");
  if (digits.length === 8) return digits.replace(/(\d{2})(?=\d)/g, "$1 ");
  return digits;
}

/** Indicatifs proposés au panier : Bénin et pays de la sous-région. */
export const PHONE_COUNTRIES = [
  { code: "229", label: "Bénin" },
  { code: "228", label: "Togo" },
  { code: "234", label: "Nigeria" },
  { code: "227", label: "Niger" },
  { code: "226", label: "Burkina Faso" },
  { code: "225", label: "Côte d'Ivoire" },
  { code: "233", label: "Ghana" },
  { code: "221", label: "Sénégal" },
  { code: "223", label: "Mali" },
  { code: "237", label: "Cameroun" },
  { code: "241", label: "Gabon" },
  { code: "33", label: "France" },
] as const;

/**
 * Normalise un numéro selon le pays choisi et le renvoie formaté pour la commande
 * (« 01 61 88 89 87 » pour le Bénin, « +228 90 12 34 56 » ailleurs), ou null s'il est invalide.
 */
export function formatPhoneForCountry(countryCode: string, input: string): string | null {
  if (countryCode === "229") {
    const n = normalizeBeninPhone(input);
    return n ? formatBeninPhone(n) : null;
  }
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(countryCode) && digits.length > countryCode.length + 6) {
    digits = digits.slice(countryCode.length);
  }
  if (digits.startsWith("0") && countryCode !== "225") digits = digits.slice(1);
  if (digits.length < 6 || digits.length > 12) return null;
  return `+${countryCode} ${digits.replace(/(\d{2})(?=\d)/g, "$1 ")}`;
}
