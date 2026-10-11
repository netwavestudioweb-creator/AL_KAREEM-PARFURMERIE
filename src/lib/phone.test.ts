import { describe, expect, it } from "vitest";
import { formatBeninPhone, formatPhoneForCountry, normalizeBeninPhone } from "./phone";

describe("normalizeBeninPhone", () => {
  it("garde un numéro au nouveau format", () => {
    expect(normalizeBeninPhone("01 61 88 89 87")).toBe("0161888987");
  });

  it("retire l'indicatif +229 ou 00229", () => {
    expect(normalizeBeninPhone("+229 01 61 88 89 87")).toBe("0161888987");
    expect(normalizeBeninPhone("00229 0161888987")).toBe("0161888987");
  });

  it("convertit l'ancien format à 8 chiffres", () => {
    expect(normalizeBeninPhone("61 88 89 87")).toBe("0161888987");
    expect(normalizeBeninPhone("+229 61888987")).toBe("0161888987");
  });

  it("refuse un numéro trop court", () => {
    expect(normalizeBeninPhone("1234")).toBeNull();
    expect(normalizeBeninPhone("")).toBeNull();
  });
});

describe("formatBeninPhone", () => {
  it("groupe les chiffres par deux", () => {
    expect(formatBeninPhone("0161888987")).toBe("01 61 88 89 87");
  });
});

describe("formatPhoneForCountry", () => {
  it("garde le format béninois pour le Bénin", () => {
    expect(formatPhoneForCountry("229", "61 88 89 87")).toBe("01 61 88 89 87");
  });

  it("préfixe l'indicatif d'un pays voisin", () => {
    expect(formatPhoneForCountry("228", "90 12 34 56")).toBe("+228 90 12 34 56");
  });

  it("ne double pas l'indicatif déjà saisi", () => {
    expect(formatPhoneForCountry("228", "+228 90 12 34 56")).toBe("+228 90 12 34 56");
  });

  it("refuse un numéro trop court", () => {
    expect(formatPhoneForCountry("234", "123")).toBeNull();
  });
});
