/**
 * Sérialise des données structurées pour un <script type="application/ld+json">.
 * JSON.stringify n'échappe pas « < » : un nom ou une description contenant
 * « </script> » fermerait la balise et permettrait d'injecter du HTML.
 * Les séparateurs U+2028 / U+2029 sont aussi échappés.
 */
const UNSAFE = new RegExp(`[<>&${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]`, "g");

const BACKSLASH = String.fromCharCode(92);

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(
    UNSAFE,
    (c) => `${BACKSLASH}u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}
