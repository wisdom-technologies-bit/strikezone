import { describe, expect, it } from "vitest";
import { MOBILE_TAB_ITEMS, NAV_ITEMS, isActivePath } from "./routes";

describe("navigation labels", () => {
  it("calls the mobile tab Events and the rail Tournaments", () => {
    const tournaments = NAV_ITEMS.find((item) => item.href === "/tournaments");
    expect(tournaments?.label).toBe("Tournaments");

    const tab = MOBILE_TAB_ITEMS.find((item) => item.href === "/tournaments");
    expect(tab?.tabLabel).toBe("Events");
  });

  it("matches a nested route to its section", () => {
    expect(isActivePath("/wallet", "/wallet")).toBe(true);
    expect(isActivePath("/wallet/withdraw", "/wallet")).toBe(true);
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/live", "/")).toBe(false);
  });
});
