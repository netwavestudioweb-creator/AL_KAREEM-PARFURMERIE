import { describe, expect, it } from "vitest";
import { jsonLd } from "./json-ld";

describe("jsonLd", () => {
  it("neutralise une balise </script> injectée dans les données", () => {
    const out = jsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
  });

  it("reste du JSON valide et réversible", () => {
    const data = { name: "Rose & Oud <édition>", price: 30000 };
    expect(JSON.parse(jsonLd(data))).toEqual(data);
  });
});
