import { describe, expect, it } from "vitest";
import { buildOrderMessage } from "./order-message";

describe("buildOrderMessage", () => {
  it("produit un message complet sans divulguer une adresse absente", () => {
    const message = buildOrderMessage({
      items: [{ name: "Oud", volume: "50 ml", price: 12000, quantity: 2 }],
      total: 24000,
      name: "Awa",
      phone: "01 61 88 89 87",
      zone: "Cotonou",
    });

    expect(message).toContain("Oud (50 ml) × 2");
    expect(message).toContain("24 000 FCFA");
    expect(message).toContain("Nom : Awa");
    expect(message).not.toContain("Adresse / point de repère");
  });

  it("normalise l'adresse avant de l'ajouter au message", () => {
    const message = buildOrderMessage({
      items: [{ name: "Brume", volume: "", price: 5000, quantity: 1 }],
      total: 5000,
      name: "Koffi",
      phone: "01 00 00 00 00",
      zone: "Porto-Novo",
      address: "  Carrefour central  ",
    });

    expect(message).toContain("Adresse / point de repère : Carrefour central");
  });
});
