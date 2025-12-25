import { describe, it, expect } from "vitest";
import { calculateFu } from "../fu-calculator";
import type { Meld, Head, Tile, NumberTile } from "../mahjong-types";
import * as t from "@/data/tiles";

// ヘルパー関数
function shuntsu(
  tiles: [NumberTile, NumberTile, NumberTile],
  state: "closed" | "open" = "closed",
): Meld {
  return { type: "shuntsu", tiles, state };
}

function koutsu(tile: Tile, state: "closed" | "open" = "closed"): Meld {
  return { type: "koutsu", tiles: [tile, tile, tile], state };
}

function kantsu(tile: Tile, state: "closed" | "open" = "closed"): Meld {
  return { type: "kantsu", tiles: [tile, tile, tile, tile], state };
}

function head(tile: Tile): Head {
  return { tiles: [tile, tile] };
}

describe("calculateFu - 副底（基本符）", () => {
  const baseMelds: Meld[] = [
    shuntsu([t.man_1, t.man_2, t.man_3]),
    shuntsu([t.pin_4, t.pin_5, t.pin_6]),
    shuntsu([t.sou_7, t.sou_8, t.sou_9]),
    shuntsu([t.man_4, t.man_5, t.man_6]),
  ];
  const baseHead = head(t.pin_2);

  it("門前ロンは30符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: baseHead,
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    // ピンフ門前ロンは30符（切り上げなし）
    expect(result.total).toBe(30);
    expect(result.breakdown[0].fu).toBe(30);
    expect(result.breakdown[0].description).toBe("門前ロン");
  });

  it("門前ツモは20符（ピンフツモ）", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: baseHead,
      waitType: "ryanmen",
      winType: "tsumo",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    // ピンフツモは20符
    expect(result.total).toBe(20);
  });

  it("副露ありは20符", () => {
    const openMelds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3], "open"),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      shuntsu([t.man_4, t.man_5, t.man_6]),
    ];
    const result = calculateFu({
      melds: openMelds,
      head: baseHead,
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: false,
    });
    expect(result.breakdown[0].fu).toBe(20);
    expect(result.breakdown[0].description).toBe("基本符");
  });
});

describe("calculateFu - ツモ符", () => {
  it("ツモは+2符（ピンフ以外）", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu(t.man_5),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "tsumo",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const tsumoItem = result.breakdown.find((b) => b.name === "ツモ");
    expect(tsumoItem).toBeDefined();
    expect(tsumoItem?.fu).toBe(2);
  });

  it("ピンフツモはツモ符なし", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      shuntsu([t.man_4, t.man_5, t.man_6]),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "tsumo",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const tsumoItem = result.breakdown.find((b) => b.name === "ツモ");
    expect(tsumoItem).toBeUndefined();
    expect(result.total).toBe(20);
  });
});

describe("calculateFu - 待ち符", () => {
  const baseMelds: Meld[] = [
    shuntsu([t.man_1, t.man_2, t.man_3]),
    shuntsu([t.pin_4, t.pin_5, t.pin_6]),
    shuntsu([t.sou_7, t.sou_8, t.sou_9]),
    koutsu(t.man_5),
  ];
  const baseHead = head(t.pin_2);

  it("両面待ちは0符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: baseHead,
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const waitItem = result.breakdown.find((b) => b.name.includes("待ち"));
    expect(waitItem).toBeUndefined();
  });

  it("嵌張待ちは2符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: baseHead,
      waitType: "kanchan",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const waitItem = result.breakdown.find((b) => b.name === "嵌張待ち");
    expect(waitItem).toBeDefined();
    expect(waitItem?.fu).toBe(2);
  });

  it("辺張待ちは2符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: baseHead,
      waitType: "penchan",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const waitItem = result.breakdown.find((b) => b.name === "辺張待ち");
    expect(waitItem).toBeDefined();
    expect(waitItem?.fu).toBe(2);
  });

  it("双碰待ちは0符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: baseHead,
      waitType: "shanpon",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const waitItem = result.breakdown.find((b) => b.name.includes("待ち"));
    expect(waitItem).toBeUndefined();
  });

  it("単騎待ちは2符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: baseHead,
      waitType: "tanki",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const waitItem = result.breakdown.find((b) => b.name === "単騎待ち");
    expect(waitItem).toBeDefined();
    expect(waitItem?.fu).toBe(2);
  });
});

describe("calculateFu - 雀頭符", () => {
  const baseMelds: Meld[] = [
    shuntsu([t.man_1, t.man_2, t.man_3]),
    shuntsu([t.pin_4, t.pin_5, t.pin_6]),
    shuntsu([t.sou_7, t.sou_8, t.sou_9]),
    koutsu(t.man_5),
  ];

  it("数牌の雀頭は0符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const headItem = result.breakdown.find((b) => b.name === "雀頭");
    expect(headItem).toBeUndefined();
  });

  it("オタ風の雀頭は0符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: head(t.honor_west),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const headItem = result.breakdown.find((b) => b.name === "雀頭");
    expect(headItem).toBeUndefined();
  });

  it("三元牌の雀頭は2符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: head(t.honor_white),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const headItem = result.breakdown.find((b) => b.name === "雀頭");
    expect(headItem).toBeDefined();
    expect(headItem?.fu).toBe(2);
    expect(headItem?.description).toBe("役牌");
  });

  it("場風牌の雀頭は2符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: head(t.honor_east),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const headItem = result.breakdown.find((b) => b.name === "雀頭");
    expect(headItem).toBeDefined();
    expect(headItem?.fu).toBe(2);
  });

  it("自風牌の雀頭は2符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: head(t.honor_south),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const headItem = result.breakdown.find((b) => b.name === "雀頭");
    expect(headItem).toBeDefined();
    expect(headItem?.fu).toBe(2);
  });

  it("連風牌（ダブ東など）の雀頭は4符", () => {
    const result = calculateFu({
      melds: baseMelds,
      head: head(t.honor_east),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "east",
      isMenzen: true,
    });
    const headItem = result.breakdown.find((b) => b.name === "雀頭");
    expect(headItem).toBeDefined();
    expect(headItem?.fu).toBe(4);
    expect(headItem?.description).toBe("ダブル役牌");
  });
});

describe("calculateFu - 面子符（刻子）", () => {
  it("中張牌暗刻は4符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu(t.man_5, "closed"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const meldItem = result.breakdown.find((b) => b.name === "中張牌暗刻");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(4);
  });

  it("中張牌明刻は2符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu(t.man_5, "open"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: false,
    });
    const meldItem = result.breakdown.find((b) => b.name === "中張牌明刻");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(2);
  });

  it("幺九牌暗刻は8符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu(t.man_1, "closed"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const meldItem = result.breakdown.find((b) => b.name === "幺九牌暗刻");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(8);
  });

  it("幺九牌明刻は4符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu(t.honor_east, "open"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: false,
    });
    const meldItem = result.breakdown.find((b) => b.name === "幺九牌明刻");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(4);
  });
});

describe("calculateFu - 面子符（槓子）", () => {
  it("中張牌暗槓は16符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      kantsu(t.man_5, "closed"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const meldItem = result.breakdown.find((b) => b.name === "中張牌暗槓");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(16);
  });

  it("中張牌明槓は8符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      kantsu(t.man_5, "open"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: false,
    });
    const meldItem = result.breakdown.find((b) => b.name === "中張牌明槓");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(8);
  });

  it("幺九牌暗槓は32符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      kantsu(t.man_9, "closed"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    const meldItem = result.breakdown.find((b) => b.name === "幺九牌暗槓");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(32);
  });

  it("幺九牌明槓は16符", () => {
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      kantsu(t.honor_red, "open"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "ryanmen",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: false,
    });
    const meldItem = result.breakdown.find((b) => b.name === "幺九牌明槓");
    expect(meldItem).toBeDefined();
    expect(meldItem?.fu).toBe(16);
  });
});

describe("calculateFu - 10符単位切り上げ", () => {
  it("32符は40符に切り上げ", () => {
    // 20符 + 4符(暗刻) + 4符(暗刻) + 2符(ツモ) + 2符(単騎) = 32符 → 40符
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      koutsu(t.sou_5, "closed"),
      koutsu(t.man_5, "closed"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "tanki",
      winType: "tsumo",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    expect(result.total).toBe(40);
  });

  it("40符ちょうどは切り上げなし", () => {
    // 30符 + 8符(幺九暗刻) + 2符(単騎) = 40符
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu(t.man_1, "closed"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "tanki",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    expect(result.total).toBe(40);
  });
});

describe("calculateFu - 複合ケース", () => {
  it("ロン双碰待ちで和了牌刻子は明刻扱い", () => {
    // ロンで双碰待ちの場合、和了牌で完成する刻子は明刻（中張牌なら2符）
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      koutsu(t.sou_5, "closed"), // 暗刻
      koutsu(t.man_5, "open"), // ロンで明刻になった
    ];
    const result = calculateFu({
      melds,
      head: head(t.pin_2),
      waitType: "shanpon",
      winType: "ron",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    // 30符(門前ロン) + 4符(暗刻) + 2符(明刻) = 36符 → 40符
    expect(result.total).toBe(40);
    const openKoutsu = result.breakdown.find((b) => b.name === "中張牌明刻");
    const closedKoutsu = result.breakdown.find((b) => b.name === "中張牌暗刻");
    expect(openKoutsu?.fu).toBe(2);
    expect(closedKoutsu?.fu).toBe(4);
  });

  it("複数の符要素が正しく合計される", () => {
    // 20符 + 2符(ツモ) + 2符(嵌張) + 2符(役牌雀頭) + 8符(幺九暗刻) + 4符(中張暗刻) = 38符 → 40符
    const melds: Meld[] = [
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      koutsu(t.sou_1, "closed"),
      koutsu(t.man_5, "closed"),
    ];
    const result = calculateFu({
      melds,
      head: head(t.honor_red),
      waitType: "kanchan",
      winType: "tsumo",
      roundWind: "east",
      seatWind: "south",
      isMenzen: true,
    });
    expect(result.total).toBe(40);
  });
});
