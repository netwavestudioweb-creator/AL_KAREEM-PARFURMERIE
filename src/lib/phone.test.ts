import { describe, expect, it } from "vitest";
import { formatBeninPhone, normalizeBeninPhone } from "./phone";

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
