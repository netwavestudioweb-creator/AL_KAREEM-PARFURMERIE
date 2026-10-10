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
