import { describe, it, expect } from "vitest";
import { resolveYakuFromHand, determineWaitType } from "../yaku-resolver";
import { parseHand } from "../hand-parser";
import * as t from "@/data/tiles";
import type { Meld, RegularHand } from "../mahjong-types";
import { assertNonNull, createClosedTiles } from "./util";

// ========================================
// 待ち判定のテスト
// ========================================

describe("determineWaitType", () => {
  it("両面待ちを判定", () => {
    // 123m 456m 789m 456p 11s + 23s → 両面待ち（1s or 4s）
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_4, t.pin_5, t.pin_6],
      [t.sou_1],
    );
    const winTile = t.sou_1;

    const result = parseHand({ closedTiles, openMelds: [], winTile });
    expect(result.isWinning).toBe(true);

    const regularHand = result.hands.find(
      (h) => h.pattern === "regular",
    ) as RegularHand;
    expect(regularHand).toBeDefined();

    // 単騎待ちになる
    const waitType = determineWaitType(regularHand, winTile);
    expect(waitType).toBe("tanki");
  });

  it("単騎待ちを判定", () => {
    // 123m 456m 789m 123p + 1s（単騎）
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_1],
    );
    const winTile = t.sou_1;

    const result = parseHand({ closedTiles, openMelds: [], winTile });
    const regularHand = result.hands.find(
      (h) => h.pattern === "regular",
    ) as RegularHand;

    if (regularHand) {
      const waitType = determineWaitType(regularHand, winTile);
      expect(waitType).toBe("tanki");
    }
  });

  it("ノベタン待ち（1234形）を単騎として判定 - 1で和了", () => {
    // 123p 456s 789s + 1234m → 1mで和了 = 123p 456s 789s 234m順子 + 11m雀頭
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_4], // ノベタン形
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_4, t.sou_5, t.sou_6, t.sou_7, t.sou_8, t.sou_9],
    );
    const winTile = t.man_1; // 1mで和了 → 234m順子 + 11m雀頭

    const result = parseHand({ closedTiles, openMelds: [], winTile });
    expect(result.isWinning).toBe(true);

    const regularHand = result.hands.find(
      (h) => h.pattern === "regular",
    ) as RegularHand;
    expect(regularHand).toBeDefined();

    const waitType = determineWaitType(regularHand, winTile);
    // ノベタンの端で和了る場合は単騎待ち
    expect(waitType).toBe("tanki");
  });

  it("ノベタン待ち（1234形）を単騎として判定 - 4で和了", () => {
    // 123p 456s 789s + 1234m → 4mで和了 = 123p 456s 789s 123m順子 + 44m雀頭
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_4], // ノベタン形
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_4, t.sou_5, t.sou_6, t.sou_7, t.sou_8, t.sou_9],
    );
    const winTile = t.man_4; // 4mで和了 → 123m順子 + 44m雀頭

    const result = parseHand({ closedTiles, openMelds: [], winTile });
    expect(result.isWinning).toBe(true);

    const regularHand = result.hands.find(
      (h) => h.pattern === "regular",
    ) as RegularHand;
    expect(regularHand).toBeDefined();

    const waitType = determineWaitType(regularHand, winTile);
    // ノベタンの端で和了る場合は単騎待ち
    expect(waitType).toBe("tanki");
  });

  it("ノベタン待ち（6789形）を単騎として判定", () => {
    // 123m 456p 789p + 6789s → 6sで和了 = 123m 456p 789p 789s順子 + 66s雀頭
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3],
      [t.pin_4, t.pin_5, t.pin_6, t.pin_7, t.pin_8, t.pin_9],
      [t.sou_6, t.sou_7, t.sou_8, t.sou_9], // ノベタン形
    );
    const winTile = t.sou_6; // 6sで和了 → 789s順子 + 66s雀頭

    const result = parseHand({ closedTiles, openMelds: [], winTile });
    expect(result.isWinning).toBe(true);

    const regularHand = result.hands.find(
      (h) => h.pattern === "regular",
    ) as RegularHand;
    expect(regularHand).toBeDefined();

    const waitType = determineWaitType(regularHand, winTile);
    expect(waitType).toBe("tanki");
  });
});

// ========================================
// 役判定のテスト
// ========================================

describe("resolveYakuFromHand - 1翻役", () => {
  it("門前清自摸和 + 断幺九", () => {
    // 234m 567m 234p 567s 55p ツモ
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "門前清自摸和", han: 1 }),
        expect.objectContaining({ name: "断幺九", han: 1 }),
      ]),
      fu: 30,
      han: 2,
      score: 500,
      scoreDealer: 1000,
      waitType: "tanki",
    });
  });

  it("断幺九（タンヤオ）", () => {
    // 234m 567m 234p 567s 55p
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "断幺九", han: 1 })],
      fu: 40,
      han: 1,
      score: 1300,
      waitType: "tanki",
    });
  });

  it("一気通貫（単騎待ち）", () => {
    // 123m 456m 789m 234p 55s（単騎待ち）
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_2, t.pin_3, t.pin_4],
      [t.sou_5],
    );
    const winTile = t.sou_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    // 単騎待ちなのでピンフにはならないが、一気通貫は成立
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "一気通貫", han: 2 })],
      fu: 40,
      han: 2,
      score: 2600,
      waitType: "tanki",
    });
  });

  it("役牌（白）+ 一気通貫", () => {
    // 123m 456m 789m 白白白 11p
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1],
      [t.honor_white, t.honor_white, t.honor_white],
    );
    const winTile = t.pin_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "役牌:白", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      fu: 40,
      han: 3,
      score: 5200,
      waitType: "tanki",
    });
  });
});

describe("resolveYakuFromHand - 2翻役", () => {
  it("対々和 + 三暗刻", () => {
    // 副露で明刻を含む対々和（四暗刻にならない）
    // 111m（明刻）222p 333s 555m 北北
    const openMelds: Meld[] = [
      { type: "koutsu", tiles: [t.man_1, t.man_1, t.man_1], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.man_5, t.man_5, t.man_5],
      [t.pin_2, t.pin_2, t.pin_2],
      [t.sou_3, t.sou_3, t.sou_3],
      [t.honor_north],
    );
    const winTile = t.honor_north;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "対々和", han: 2 }),
        expect.objectContaining({ name: "三暗刻", han: 2 }),
      ]),
      han: 4,
      waitType: "tanki",
    });
  });

  it("三色同順", () => {
    // 123m 123p 123s 456m 11s
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_4, t.man_5, t.man_6],
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_1, t.sou_1, t.sou_2, t.sou_3],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "三色同順", han: 2 })],
      fu: 40,
      han: 2,
      score: 2600,
      waitType: "tanki",
    });
  });
});

describe("resolveYakuFromHand - 特殊形", () => {
  it("七対子", () => {
    // 11m 22m 33p 44p 55s 66s 東東
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_2, t.man_2],
      [t.pin_3, t.pin_3, t.pin_4, t.pin_4],
      [t.sou_5, t.sou_5, t.sou_6, t.sou_6],
      [t.honor_east],
    );
    const winTile = t.honor_east;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "七対子", han: 2 })],
      fu: 25,
      han: 2,
      score: 1600,
      waitType: "tanki",
    });
  });

  it("国士無双", () => {
    // 1m9m1p9p1s9s東南西北白發中 + 1m待ち
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_9],
      [t.pin_1, t.pin_9],
      [t.sou_1, t.sou_9],
      [
        t.honor_east,
        t.honor_south,
        t.honor_west,
        t.honor_north,
        t.honor_white,
        t.honor_green,
        t.honor_red,
      ],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "国士無双", han: 13 })],
      han: 13,
      score: 32000,
      waitType: "tanki",
      label: "役満",
    });
  });

  it("国士無双十三面（役満）", () => {
    // 対子が既にある状態で別の幺九牌を待つ
    // 日本プロ麻雀連盟ルール：国士無双十三面はダブル役満ではなく役満
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_9], // 対子
      [t.pin_1, t.pin_9],
      [t.sou_1, t.sou_9],
      [
        t.honor_east,
        t.honor_south,
        t.honor_west,
        t.honor_north,
        t.honor_white,
        t.honor_green,
      ],
    );
    const winTile = t.honor_red; // 中待ち（十三面）

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "国士無双", han: 13 })],
      han: 13,
      score: 32000,
      waitType: "tanki",
      label: "役満",
    });
  });
});

describe("resolveYakuFromHand - 特殊条件", () => {
  it("立直 + 一気通貫", () => {
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_1],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { isRiichi: true },
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "立直", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      fu: 40,
      han: 3,
      score: 5200,
    });
  });

  it("立直 + 一発 + 一気通貫", () => {
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_1],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { isRiichi: true, isIppatsu: true },
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "立直", han: 1 }),
        expect.objectContaining({ name: "一発", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      fu: 40,
      han: 4,
      score: 8000,
      label: "満貫",
    });
  });
});

describe("resolveYakuFromHand - 点数計算", () => {
  it("子ロン40符1翻 = 1300点", () => {
    // 234m 567m 234p 567s 55p ロン（タンヤオのみ、単騎待ち）
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "断幺九", han: 1 })],
      fu: 40,
      han: 1,
      score: 1300,
    });
  });

  it("子ツモ30符4翻 = 2000/4000点", () => {
    // タンヤオ + 立直 + 一発 + 門前清自摸和 = 4翻
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
      { isRiichi: true, isIppatsu: true },
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "立直", han: 1 }),
        expect.objectContaining({ name: "一発", han: 1 }),
        expect.objectContaining({ name: "門前清自摸和", han: 1 }),
        expect.objectContaining({ name: "断幺九", han: 1 }),
      ]),
      fu: 30,
      han: 4,
      score: 2000,
      scoreDealer: 4000,
    });
  });
});

describe("resolveYakuFromHand - 複数役の組み合わせ", () => {
  it("門前清自摸和 + 一気通貫", () => {
    // 123m 456m 789m 123p 11s ツモ
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_1],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "門前清自摸和", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      han: 3,
      score: 1000,
      scoreDealer: 2000,
    });
  });

  it("三色同順 + 断幺九", () => {
    // 234m 234p 234s 567m 55p
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_2, t.sou_3, t.sou_4],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "三色同順", han: 2 }),
        expect.objectContaining({ name: "断幺九", han: 1 }),
      ]),
      han: 3,
    });
  });

  it("立直 + 一発 + 門前清自摸和 + 断幺九", () => {
    // 234m 567m 234p 567s 55p
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
      { isRiichi: true, isIppatsu: true },
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "立直", han: 1 }),
        expect.objectContaining({ name: "一発", han: 1 }),
        expect.objectContaining({ name: "門前清自摸和", han: 1 }),
        expect.objectContaining({ name: "断幺九", han: 1 }),
      ]),
      han: 4,
    });
  });

  it("役牌（白）+ 対々和 + 三暗刻", () => {
    // 白白白（明刻）+ 222m 333p 444s 55s
    const openMelds: Meld[] = [
      {
        type: "koutsu",
        tiles: [t.honor_white, t.honor_white, t.honor_white],
        state: "open",
      },
    ];
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_2, t.man_2],
      [t.pin_3, t.pin_3, t.pin_3],
      [t.sou_4, t.sou_4, t.sou_4, t.sou_5],
    );
    const winTile = t.sou_5;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "役牌:白", han: 1 }),
        expect.objectContaining({ name: "対々和", han: 2 }),
        expect.objectContaining({ name: "三暗刻", han: 2 }),
      ]),
      han: 5,
    });
  });

  it("七対子 + 断幺九（タンヤオ七対子）", () => {
    // 22m 33m 44p 55p 66s 77s 88s
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_2, t.man_3, t.man_3],
      [t.pin_4, t.pin_4, t.pin_5, t.pin_5],
      [t.sou_6, t.sou_6, t.sou_7, t.sou_7, t.sou_8],
    );
    const winTile = t.sou_8;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "七対子", han: 2 }),
        expect.objectContaining({ name: "断幺九", han: 1 }),
      ]),
      fu: 25,
      han: 3,
    });
  });
});

describe("resolveYakuFromHand - メジャーな役の検出", () => {
  it("混一色 + 一気通貫 + 役牌", () => {
    // 123m 456m 789m 東東東 白白
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.honor_east, t.honor_east, t.honor_east, t.honor_white],
    );
    const winTile = t.honor_white;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    // 白は雀頭なので役牌:白にはならない
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "混一色", han: 3 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
        expect.objectContaining({ name: "役牌:場風東", han: 1 }),
      ]),
      han: 6,
    });
  });

  it("清一色", () => {
    // 123m 234m 345m 567m 99m（九蓮宝燈ではない清一色）
    const closedTiles = createClosedTiles([
      t.man_1,
      t.man_2,
      t.man_3,
      t.man_2,
      t.man_3,
      t.man_4,
      t.man_3,
      t.man_4,
      t.man_5,
      t.man_5,
      t.man_6,
      t.man_7,
      t.man_9,
    ]);
    const winTile = t.man_9;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "清一色", han: 6 })],
      han: 6,
    });
  });

  it("一盃口", () => {
    // 112233m 456p 789s 55p
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_2, t.man_2, t.man_3, t.man_3],
      [t.pin_4, t.pin_5, t.pin_5, t.pin_6],
      [t.sou_7, t.sou_8, t.sou_9],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "一盃口", han: 1 })],
      han: 1,
    });
  });

  it("三暗刻", () => {
    // 111m 222p 333s 456m 11s（暗刻3つ）
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_1, t.man_4, t.man_5, t.man_6],
      [t.pin_2, t.pin_2, t.pin_2],
      [t.sou_1, t.sou_3, t.sou_3, t.sou_3],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "三暗刻", han: 2 })],
      han: 2,
    });
  });

  it("混全帯幺九（チャンタ）+ 役牌", () => {
    // 123m 789m 123p 東東東 99s
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_7, t.man_8, t.man_9],
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_9],
      [t.honor_east, t.honor_east, t.honor_east],
    );
    const winTile = t.sou_9;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "混全帯幺九", han: 2 }),
      ]),
    });
  });

  it("純全帯幺九（ジュンチャン）", () => {
    // 123m 789m 123p 789p 11s
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_7, t.man_8, t.man_9],
      [t.pin_1, t.pin_2, t.pin_3, t.pin_7, t.pin_8, t.pin_9],
      [t.sou_1],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "純全帯幺九", han: 3 })],
      han: 3,
    });
  });

  it("役牌（發）+ 一気通貫", () => {
    // 123m 456m 789m 發發發 11p
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1],
      [t.honor_green, t.honor_green, t.honor_green],
    );
    const winTile = t.pin_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "役牌:發", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      han: 3,
    });
  });

  it("役牌（中）+ 一気通貫", () => {
    // 123m 456m 789m 中中中 11p
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1],
      [t.honor_red, t.honor_red, t.honor_red],
    );
    const winTile = t.pin_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "役牌:中", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      han: 3,
    });
  });

  it("役牌（場風:東）+ 一気通貫", () => {
    // 123m 456m 789m 東東東 11p（場風が東）
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1],
      [t.honor_east, t.honor_east, t.honor_east],
    );
    const winTile = t.pin_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east", // 場風
      "south", // 自風
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "役牌:場風東", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      han: 3,
    });
  });

  it("役牌（自風:南）+ 一気通貫", () => {
    // 123m 456m 789m 南南南 11p（自風が南）
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.pin_1],
      [t.honor_south, t.honor_south, t.honor_south],
    );
    const winTile = t.pin_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east", // 場風
      "south", // 自風
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "役牌:自風南", han: 1 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
      ]),
      han: 3,
    });
  });
});

describe("resolveYakuFromHand - 役満", () => {
  it("四暗刻（ツモ）", () => {
    // 111m 222p 333s 444m 55s（すべて暗刻でツモ）
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_1, t.man_4, t.man_4, t.man_4],
      [t.pin_2, t.pin_2, t.pin_2],
      [t.sou_3, t.sou_3, t.sou_3, t.sou_5],
    );
    const winTile = t.sou_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "四暗刻", han: 13 })],
      han: 13,
      score: 8000,
      scoreDealer: 16000,
      label: "役満",
    });
  });

  it("大三元", () => {
    // 白白白 發發發 中中中 123m 11p
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3],
      [t.pin_1],
      [
        t.honor_white,
        t.honor_white,
        t.honor_white,
        t.honor_green,
        t.honor_green,
        t.honor_green,
        t.honor_red,
        t.honor_red,
        t.honor_red,
      ],
    );
    const winTile = t.pin_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "大三元", han: 13 })],
      han: 13,
      score: 32000,
      label: "役満",
    });
  });

  it("字一色 + 大四喜 + 四暗刻（トリプル役満）", () => {
    // 東東東 南南南 西西西 北北北 白白
    const closedTiles = createClosedTiles(
      [t.honor_east, t.honor_east, t.honor_east],
      [t.honor_south, t.honor_south, t.honor_south],
      [t.honor_west, t.honor_west, t.honor_west],
      [t.honor_north, t.honor_north, t.honor_north],
      [t.honor_white],
    );
    const winTile = t.honor_white;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "字一色", han: 13 }),
        expect.objectContaining({ name: "大四喜", han: 13 }),
        expect.objectContaining({ name: "四暗刻", han: 13 }),
      ]),
      han: 39,
      label: "3倍役満",
    });
  });

  it("緑一色（副露あり）", () => {
    // 副露ありで四暗刻を回避
    // 副露: 222s
    // 手牌: 333s 444s 666s 發發
    const openMelds: Meld[] = [
      { type: "koutsu", tiles: [t.sou_2, t.sou_2, t.sou_2], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [
        t.sou_3,
        t.sou_3,
        t.sou_3,
        t.sou_4,
        t.sou_4,
        t.sou_4,
        t.sou_6,
        t.sou_6,
        t.sou_6,
      ],
      [t.honor_green],
    );
    const winTile = t.honor_green;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "緑一色", han: 13 }),
      ]),
      han: 13,
      label: "役満",
    });
  });

  it("清老頭（副露あり）", () => {
    // 副露ありで四暗刻を回避
    // 副露: 111m
    // 手牌: 999m 111p 999p 11s
    const openMelds: Meld[] = [
      { type: "koutsu", tiles: [t.man_1, t.man_1, t.man_1], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.man_9, t.man_9, t.man_9],
      [t.pin_1, t.pin_1, t.pin_1, t.pin_9, t.pin_9, t.pin_9],
      [t.sou_1],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "清老頭", han: 13 }),
      ]),
      han: 13,
      label: "役満",
    });
  });

  it("小四喜", () => {
    // 東東東 南南南 西西西 北北 123m
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2],
      [t.honor_east, t.honor_east, t.honor_east],
      [t.honor_south, t.honor_south, t.honor_south],
      [t.honor_west, t.honor_west, t.honor_west],
      [t.honor_north, t.honor_north],
    );
    const winTile = t.man_3;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "小四喜", han: 13 })],
      han: 13,
      score: 32000,
      label: "役満",
    });
  });

  it("大四喜 + 四暗刻（ダブル役満）", () => {
    // 東東東 南南南 西西西 北北北 11m
    // 日本プロ麻雀連盟ルール：大四喜自体は役満、四暗刻との複合
    const closedTiles = createClosedTiles(
      [t.man_1],
      [t.honor_east, t.honor_east, t.honor_east],
      [t.honor_south, t.honor_south, t.honor_south],
      [t.honor_west, t.honor_west, t.honor_west],
      [t.honor_north, t.honor_north, t.honor_north],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "大四喜", han: 13 }),
        expect.objectContaining({ name: "四暗刻", han: 13 }),
      ]),
      han: 26,
      label: "2倍役満",
    });
  });

  it("四暗刻単騎（役満）", () => {
    // 111m 222p 333s 444m 5s単騎待ち
    // 日本プロ麻雀連盟ルール：四暗刻単騎はダブル役満ではなく役満
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_1, t.man_4, t.man_4, t.man_4],
      [t.pin_2, t.pin_2, t.pin_2],
      [t.sou_3, t.sou_3, t.sou_3, t.sou_5],
    );
    const winTile = t.sou_5;

    // ロンで単騎待ちの場合も四暗刻成立
    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "四暗刻", han: 13 })],
      han: 13,
      score: 32000,
      label: "役満",
    });
  });
});

describe("resolveYakuFromHand - 役満複合", () => {
  it("大三元 + 四暗刻（ダブル役満）", () => {
    // 白白白 發發發 中中中 111m 99m（すべて暗刻でツモ）
    // 日本プロ麻雀連盟ルール：異なる役満の複合が認められる
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_1, t.man_9],
      [
        t.honor_white,
        t.honor_white,
        t.honor_white,
        t.honor_green,
        t.honor_green,
        t.honor_green,
        t.honor_red,
        t.honor_red,
        t.honor_red,
      ],
    );
    const winTile = t.man_9;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "大三元", han: 13 }),
        expect.objectContaining({ name: "四暗刻", han: 13 }),
      ]),
      han: 26,
      score: 16000,
      scoreDealer: 32000,
      label: "2倍役満",
    });
  });

  it("字一色 + 大四喜 + 四暗刻（トリプル役満）", () => {
    // 東東東 南南南 西西西 北北北 白白（すべて字牌で暗刻）
    // 日本プロ麻雀連盟ルール：複数の役満が成立した場合は複合を認める
    const closedTiles = createClosedTiles(
      [t.honor_east, t.honor_east, t.honor_east],
      [t.honor_south, t.honor_south, t.honor_south],
      [t.honor_west, t.honor_west, t.honor_west],
      [t.honor_north, t.honor_north, t.honor_north],
      [t.honor_white],
    );
    const winTile = t.honor_white;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "字一色", han: 13 }),
        expect.objectContaining({ name: "大四喜", han: 13 }),
        expect.objectContaining({ name: "四暗刻", han: 13 }),
      ]),
      han: 39,
      label: "3倍役満",
    });
  });
});

describe("resolveYakuFromHand - 副露", () => {
  it("副露ありでタンヤオ", () => {
    // 副露: 234m（チー）
    const openMelds: Meld[] = [
      { type: "shuntsu", tiles: [t.man_2, t.man_3, t.man_4], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "断幺九", han: 1 })],
      fu: 30,
      han: 1,
      score: 1000,
      waitType: "tanki",
    });
  });

  it("副露ありでピンフは成立しない", () => {
    // 副露: 123m（チー）
    const openMelds: Meld[] = [
      { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.man_4, t.man_5, t.man_6],
      [t.pin_1, t.pin_2, t.pin_3],
      [t.sou_1, t.sou_4, t.sou_5, t.sou_6],
    );
    const winTile = t.sou_1;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    // 副露ありでは役なしになる（ピンフ以外の役がない）
    expect(result).toBeNull();
  });

  it("副露ありで一盃口は成立しない", () => {
    // 一盃口の形: 123m 123m だが副露あり
    // 副露: 123m（チー）
    const openMelds: Meld[] = [
      { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
    ];
    // 手牌: 123m(副露) 123m 456p 白白白 55s (14枚)
    // closedTiles: 123m + 456p + 白白 + 55s = 10枚
    // winTile: 白 (白白白で刻子完成)
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3],
      [t.pin_4, t.pin_5, t.pin_6],
      [t.sou_5, t.sou_5],
      [t.honor_white, t.honor_white],
    );
    const winTile = t.honor_white;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    // 副露ありでは一盃口は成立しないが、役牌（白）があるので和了は成立
    assertNonNull(result);
    // 一盃口が含まれていないことを確認
    expect(result.yaku.some((y) => y.name === "一盃口")).toBe(false);
    // 役牌（白）は成立
    expect(result.yaku.some((y) => y.name === "役牌:白")).toBe(true);
  });

  it("副露ありで二盃口は成立しない", () => {
    // 二盃口の形: 123m 123m 456p 456p だが副露あり
    // 副露: 123m（チー）
    const openMelds: Meld[] = [
      { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
    ];
    // 手牌: 123m(副露) 123m 456p 456p 55s (14枚)
    // closedTiles: 123m + 456p + 456p + 5s = 10枚
    // winTile: 5s
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3],
      [t.pin_4, t.pin_5, t.pin_6, t.pin_4, t.pin_5, t.pin_6],
      [t.sou_5],
    );
    const winTile = t.sou_5;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    // 副露ありでは二盃口は成立しない、他に役もないので役なし
    expect(result).toBeNull();
  });
});

// ========================================
// ドラ計算のテスト
// ========================================

describe("resolveYakuFromHand - ドラ", () => {
  it("表ドラ1枚", () => {
    // タンヤオ + ドラ1
    // ドラ表示牌: 2萬 → ドラ: 3萬
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { doraIndicators: [t.man_2] }, // ドラ表示牌: 2萬 → ドラ: 3萬
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "断幺九", han: 1 }),
        expect.objectContaining({ name: "ドラ", han: 1 }),
      ]),
      han: 2,
    });
  });

  it("表ドラ複数枚", () => {
    // タンヤオ + ドラ3（3萬が3枚）
    const closedTiles = createClosedTiles(
      [t.man_3, t.man_3, t.man_3, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { doraIndicators: [t.man_2] }, // ドラ表示牌: 2萬 → ドラ: 3萬
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "断幺九", han: 1 }),
        expect.objectContaining({ name: "ドラ", han: 3 }),
      ]),
      han: 4,
    });
  });

  it("表ドラ + 裏ドラ（リーチ時）", () => {
    // 立直 + タンヤオ + ドラ1 + 裏ドラ2（5筒が2枚あるため）
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      {
        isRiichi: true,
        doraIndicators: [t.man_2], // ドラ表示牌: 2萬 → ドラ: 3萬
        uraDoraIndicators: [t.pin_4], // 裏ドラ表示牌: 4筒 → 裏ドラ: 5筒 (2枚)
      },
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "立直", han: 1 }),
        expect.objectContaining({ name: "断幺九", han: 1 }),
        expect.objectContaining({ name: "ドラ", han: 1 }),
        expect.objectContaining({ name: "裏ドラ", han: 2 }),
      ]),
      han: 5,
    });
  });

  it("裏ドラはリーチなしでは加算されない", () => {
    // タンヤオ + ドラ1（裏ドラはカウントされない）
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_7],
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      {
        doraIndicators: [t.man_2], // ドラ表示牌: 2萬 → ドラ: 3萬
        uraDoraIndicators: [t.pin_4], // 裏ドラ表示牌: 4筒 → 裏ドラ: 5筒（カウントされない）
      },
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "断幺九", han: 1 }),
        expect.objectContaining({ name: "ドラ", han: 1 }),
      ]),
      han: 2,
    });
    // 裏ドラが含まれないことを確認
    expect(result.yaku).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "裏ドラ" })]),
    );
  });

  it("赤ドラ", () => {
    // タンヤオ + 赤ドラ1
    const closedTiles = createClosedTiles(
      [t.man_2, t.man_3, t.man_4, t.man_5_dora, t.man_6, t.man_7], // 赤5萬
      [t.pin_2, t.pin_3, t.pin_4, t.pin_5],
      [t.sou_5, t.sou_6, t.sou_7],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "断幺九", han: 1 }),
        expect.objectContaining({ name: "赤ドラ", han: 1 }),
      ]),
      han: 2,
    });
  });

  it("ドラ表示牌が字牌の場合（風牌）", () => {
    // ドラ表示牌: 東 → ドラ: 南
    // 手牌: 123m 456m 789m 南南南 11m → 混一色 + 一気通貫 + 役牌 + ドラ3 = 9翻
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.honor_south, t.honor_south, t.honor_south],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { doraIndicators: [t.honor_east] }, // ドラ表示牌: 東 → ドラ: 南
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "混一色", han: 3 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
        expect.objectContaining({ name: "役牌:自風南", han: 1 }),
        expect.objectContaining({ name: "ドラ", han: 3 }),
      ]),
      han: 9,
    });
  });

  it("ドラ表示牌が字牌の場合（三元牌）", () => {
    // ドラ表示牌: 白 → ドラ: 發
    // 手牌: 123m 456m 789m 發發發 11m → 混一色 + 一気通貫 + 役牌 + ドラ3 = 9翻
    const closedTiles = createClosedTiles(
      [
        t.man_1,
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_9,
      ],
      [t.honor_green, t.honor_green, t.honor_green],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { doraIndicators: [t.honor_white] }, // ドラ表示牌: 白 → ドラ: 發
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "混一色", han: 3 }),
        expect.objectContaining({ name: "一気通貫", han: 2 }),
        expect.objectContaining({ name: "役牌:發", han: 1 }),
        expect.objectContaining({ name: "ドラ", han: 3 }),
      ]),
      han: 9,
    });
  });

  it("ドラ表示牌が9の場合（次は1）", () => {
    // ドラ表示牌: 9萬 → ドラ: 1萬
    // 手牌: 111m 234m 567p 發發發 55p → 役牌（發）+ ドラ3
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_1, t.man_2, t.man_3, t.man_4],
      [t.pin_5, t.pin_5, t.pin_6, t.pin_7],
      [t.honor_green, t.honor_green, t.honor_green],
    );
    const winTile = t.pin_5;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { doraIndicators: [t.man_9] }, // ドラ表示牌: 9萬 → ドラ: 1萬
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "役牌:發", han: 1 }),
        expect.objectContaining({ name: "ドラ", han: 3 }),
      ]),
    });
  });

  it("役満ではドラはカウントされない", () => {
    // 国士無双（役満ではドラは加算しない）
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_9],
      [t.pin_1, t.pin_9],
      [t.sou_1, t.sou_9],
      [
        t.honor_east,
        t.honor_south,
        t.honor_west,
        t.honor_north,
        t.honor_white,
        t.honor_green,
        t.honor_red,
      ],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
      { doraIndicators: [t.man_9] }, // ドラ表示牌: 9萬 → ドラ: 1萬（しかし役満なので加算されない）
    );

    assertNonNull(result);
    expect(result).toMatchObject({
      yaku: [expect.objectContaining({ name: "国士無双", han: 13 })],
      han: 13,
      label: "役満",
    });
    // ドラが含まれないことを確認
    expect(result.yaku).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "ドラ" })]),
    );
  });
});

// ========================================
// 役の複合ルール確認テスト
// ========================================

describe("resolveYakuFromHand - 役の複合ルール", () => {
  it("二盃口と七対子は複合しない", () => {
    // 112233m 445566p 77s
    // この手牌は七対子としても二盃口としても解釈できるが、
    // 高い方（二盃口3翻）が選択される
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_2, t.man_2, t.man_3, t.man_3],
      [t.pin_4, t.pin_4, t.pin_5, t.pin_5, t.pin_6, t.pin_6],
      [t.sou_7],
    );
    const winTile = t.sou_7;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    // 二盃口が選択される（七対子2翻より二盃口3翻の方が高い）
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "二盃口", han: 3 }),
      ]),
    });
    // 七対子は複合しない（同じ手牌だが別形なので）
    expect(result.yaku).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "七対子" })]),
    );
  });

  it("二盃口と平和の複合", () => {
    // 112233m 445566p 77s（両面待ち）
    // 二盃口 + 平和
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_1, t.man_2, t.man_2, t.man_3, t.man_3],
      [t.pin_4, t.pin_4, t.pin_5, t.pin_5, t.pin_6, t.pin_6],
      [t.sou_7],
    );
    const winTile = t.sou_7;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "east", // 自風を東にして役牌にならないようにする
    );

    assertNonNull(result);
    // 最高得点パターンが選択される
    // 二盃口(3翻) > 七対子(2翻) なので二盃口が選択される
    expect(result).toMatchObject({
      yaku: expect.arrayContaining([
        expect.objectContaining({ name: "二盃口", han: 3 }),
      ]),
    });
  });
});

// ========================================
// 食い下がりのテスト
// ========================================

describe("食い下がり", () => {
  describe("食い下がりあり（翻数が減る役）", () => {
    it("混一色: 門前3翻 → 鳴き2翻", () => {
      // 門前: 123m 456m 789m 東東東 白白
      const closedTilesMenzen = createClosedTiles(
        [
          t.man_1,
          t.man_2,
          t.man_3,
          t.man_4,
          t.man_5,
          t.man_6,
          t.man_7,
          t.man_8,
          t.man_9,
        ],
        [t.honor_east, t.honor_east, t.honor_east, t.honor_white],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.honor_white,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultMenzen);
      const honitsuMenzen = resultMenzen.yaku.find((y) => y.name === "混一色");
      expect(honitsuMenzen).toBeDefined();
      expect(honitsuMenzen?.han).toBe(3);

      // 鳴き: 123m（チー）+ 456m 789m 東東東 白白
      const openMelds: Meld[] = [
        { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_4, t.man_5, t.man_6, t.man_7, t.man_8, t.man_9],
        [t.honor_east, t.honor_east, t.honor_east, t.honor_white],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.honor_white,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultOpen);
      const honitsuOpen = resultOpen.yaku.find((y) => y.name === "混一色");
      expect(honitsuOpen).toBeDefined();
      // 食い下がりで翻数が減る（hanに反映される）
      expect(resultOpen.han).toBeLessThan(resultMenzen.han);
    });

    it("清一色: 門前6翻 → 鳴き5翻", () => {
      // 門前: 111m 234m 567m 888m 99m
      const closedTilesMenzen = createClosedTiles([
        t.man_1,
        t.man_1,
        t.man_1,
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_8,
        t.man_8,
        t.man_9,
      ]);
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.man_9,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultMenzen);
      const chinitsuMenzen = resultMenzen.yaku.find((y) => y.name === "清一色");
      expect(chinitsuMenzen).toBeDefined();
      expect(chinitsuMenzen?.han).toBe(6);

      // 鳴き: 111m（ポン）+ 234m 567m 888m 99m
      const openMelds: Meld[] = [
        { type: "koutsu", tiles: [t.man_1, t.man_1, t.man_1], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles([
        t.man_2,
        t.man_3,
        t.man_4,
        t.man_5,
        t.man_6,
        t.man_7,
        t.man_8,
        t.man_8,
        t.man_8,
        t.man_9,
      ]);
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.man_9,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultOpen);
      const chinitsuOpen = resultOpen.yaku.find((y) => y.name === "清一色");
      expect(chinitsuOpen).toBeDefined();
      // hanで確認（門前6翻 vs 鳴き5翻）
      expect(resultMenzen.han).toBe(6);
      expect(resultOpen.han).toBe(5);
    });

    it("一気通貫: 門前2翻 → 鳴き1翻", () => {
      // 門前: 123m 456m 789m 555p 東東
      const closedTilesMenzen = createClosedTiles(
        [
          t.man_1,
          t.man_2,
          t.man_3,
          t.man_4,
          t.man_5,
          t.man_6,
          t.man_7,
          t.man_8,
          t.man_9,
        ],
        [t.pin_5, t.pin_5, t.pin_5, t.honor_east],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.honor_east,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultMenzen);
      const ikkiMenzen = resultMenzen.yaku.find((y) => y.name === "一気通貫");
      expect(ikkiMenzen).toBeDefined();
      expect(ikkiMenzen?.han).toBe(2);

      // 鳴き: 123m（チー）+ 456m 789m 555p 東東
      const openMelds: Meld[] = [
        { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_4, t.man_5, t.man_6, t.man_7, t.man_8, t.man_9],
        [t.pin_5, t.pin_5, t.pin_5, t.honor_east],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.honor_east,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultOpen);
      const ikkiOpen = resultOpen.yaku.find((y) => y.name === "一気通貫");
      expect(ikkiOpen).toBeDefined();
      // 門前2翻、鳴き1翻の差
      expect(resultMenzen.han - resultOpen.han).toBe(1);
    });

    it("三色同順: 門前2翻 → 鳴き1翻", () => {
      // 門前: 123m 123p 123s 555m 東東
      const closedTilesMenzen = createClosedTiles(
        [t.man_1, t.man_2, t.man_3, t.man_5, t.man_5, t.man_5],
        [t.pin_1, t.pin_2, t.pin_3],
        [t.sou_1, t.sou_2, t.sou_3, t.honor_east],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.honor_east,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultMenzen);
      const sanshokuMenzen = resultMenzen.yaku.find(
        (y) => y.name === "三色同順",
      );
      expect(sanshokuMenzen).toBeDefined();
      expect(sanshokuMenzen?.han).toBe(2);

      // 鳴き: 123m（チー）+ 123p 123s 555m 東東
      const openMelds: Meld[] = [
        { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_5, t.man_5, t.man_5],
        [t.pin_1, t.pin_2, t.pin_3],
        [t.sou_1, t.sou_2, t.sou_3, t.honor_east],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.honor_east,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultOpen);
      const sanshokuOpen = resultOpen.yaku.find((y) => y.name === "三色同順");
      expect(sanshokuOpen).toBeDefined();
      expect(resultMenzen.han - resultOpen.han).toBe(1);
    });

    it("純全帯幺九: 門前3翻 → 鳴き2翻", () => {
      // 門前: 123m 789m 123p 999s 11p
      const closedTilesMenzen = createClosedTiles(
        [t.man_1, t.man_2, t.man_3, t.man_7, t.man_8, t.man_9],
        [t.pin_1, t.pin_2, t.pin_3, t.pin_1],
        [t.sou_9, t.sou_9, t.sou_9],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.pin_1,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultMenzen);
      const junchanMenzen = resultMenzen.yaku.find(
        (y) => y.name === "純全帯幺九",
      );
      expect(junchanMenzen).toBeDefined();
      expect(junchanMenzen?.han).toBe(3);

      // 鳴き: 123m（チー）+ 789m 123p 999s 11p
      const openMelds: Meld[] = [
        { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_7, t.man_8, t.man_9],
        [t.pin_1, t.pin_2, t.pin_3, t.pin_1],
        [t.sou_9, t.sou_9, t.sou_9],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.pin_1,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultOpen);
      const junchanOpen = resultOpen.yaku.find((y) => y.name === "純全帯幺九");
      expect(junchanOpen).toBeDefined();
      expect(resultMenzen.han - resultOpen.han).toBe(1);
    });

    it("混全帯幺九: 門前2翻 → 鳴き1翻", () => {
      // 門前: 123m 789p 111s 東東東 99m (13枚 + winTile)
      const closedTilesMenzen = createClosedTiles(
        [t.man_1, t.man_2, t.man_3, t.man_9],
        [t.pin_7, t.pin_8, t.pin_9],
        [t.sou_1, t.sou_1, t.sou_1],
        [t.honor_east, t.honor_east, t.honor_east],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.man_9,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultMenzen);
      const chantaMenzen = resultMenzen.yaku.find(
        (y) => y.name === "混全帯幺九",
      );
      expect(chantaMenzen).toBeDefined();
      expect(chantaMenzen?.han).toBe(2);

      // 鳴き: 123m（チー）+ 789p 111s 東東東 99m
      const openMelds: Meld[] = [
        { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_9],
        [t.pin_7, t.pin_8, t.pin_9],
        [t.sou_1, t.sou_1, t.sou_1],
        [t.honor_east, t.honor_east, t.honor_east],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.man_9,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultOpen);
      const chantaOpen = resultOpen.yaku.find((y) => y.name === "混全帯幺九");
      expect(chantaOpen).toBeDefined();
      expect(resultMenzen.han - resultOpen.han).toBe(1);
    });
  });

  describe("食い下がりなし（翻数が変わらない役）", () => {
    it("対々和: 副露1つ vs 副露2つ 共に2翻", () => {
      // 副露1つ: 111m（ポン）+ 222p 333s 555m 北北
      const openMelds1: Meld[] = [
        { type: "koutsu", tiles: [t.man_1, t.man_1, t.man_1], state: "open" },
      ];
      const closedTiles1 = createClosedTiles(
        [t.man_5, t.man_5, t.man_5],
        [t.pin_2, t.pin_2, t.pin_2],
        [t.sou_3, t.sou_3, t.sou_3],
        [t.honor_north],
      );
      const result1 = resolveYakuFromHand(
        closedTiles1,
        openMelds1,
        t.honor_north,
        "ron",
        "south",
        "west",
      );
      assertNonNull(result1);
      const toitoi1 = result1.yaku.find((y) => y.name === "対々和");
      expect(toitoi1).toBeDefined();
      expect(toitoi1?.han).toBe(2);

      // 副露2つ: 111m 222p（ポン）+ 333s 555m 北北
      const openMelds2: Meld[] = [
        { type: "koutsu", tiles: [t.man_1, t.man_1, t.man_1], state: "open" },
        { type: "koutsu", tiles: [t.pin_2, t.pin_2, t.pin_2], state: "open" },
      ];
      const closedTiles2 = createClosedTiles(
        [t.man_5, t.man_5, t.man_5],
        [t.sou_3, t.sou_3, t.sou_3],
        [t.honor_north],
      );
      const result2 = resolveYakuFromHand(
        closedTiles2,
        openMelds2,
        t.honor_north,
        "ron",
        "south",
        "west",
      );
      assertNonNull(result2);
      const toitoi2 = result2.yaku.find((y) => y.name === "対々和");
      expect(toitoi2).toBeDefined();
      // 対々和は食い下がりなし（副露数に関係なく2翻）
      expect(toitoi1?.han).toBe(toitoi2?.han);
    });

    it("三色同刻: 門前/鳴き共に2翻", () => {
      // 門前: 111m 111p 111s 234m 東東
      const closedTilesMenzen = createClosedTiles(
        [t.man_1, t.man_1, t.man_1, t.man_2, t.man_3, t.man_4],
        [t.pin_1, t.pin_1, t.pin_1],
        [t.sou_1, t.sou_1, t.sou_1, t.honor_east],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.honor_east,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultMenzen);
      const sanshokuDoukouMenzen = resultMenzen.yaku.find(
        (y) => y.name === "三色同刻",
      );
      expect(sanshokuDoukouMenzen).toBeDefined();
      expect(sanshokuDoukouMenzen?.han).toBe(2);

      // 鳴き: 111m（ポン）+ 111p 111s 234m 東東
      const openMelds: Meld[] = [
        { type: "koutsu", tiles: [t.man_1, t.man_1, t.man_1], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_2, t.man_3, t.man_4],
        [t.pin_1, t.pin_1, t.pin_1],
        [t.sou_1, t.sou_1, t.sou_1, t.honor_east],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.honor_east,
        "ron",
        "south",
        "west",
      );
      assertNonNull(resultOpen);
      const sanshokuDoukouOpen = resultOpen.yaku.find(
        (y) => y.name === "三色同刻",
      );
      expect(sanshokuDoukouOpen).toBeDefined();
      // 三色同刻は食い下がりなし
      expect(sanshokuDoukouMenzen?.han).toBe(sanshokuDoukouOpen?.han);
    });

    it("断幺九: 門前/鳴き共に1翻", () => {
      // 門前: 234m 456p 678s 555m 22s (13枚 + winTile)
      const closedTilesMenzen = createClosedTiles(
        [t.man_2, t.man_3, t.man_4, t.man_5, t.man_5, t.man_5],
        [t.pin_4, t.pin_5, t.pin_6],
        [t.sou_2, t.sou_6, t.sou_7, t.sou_8],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.sou_2,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultMenzen);
      const tanyaoMenzen = resultMenzen.yaku.find((y) => y.name === "断幺九");
      expect(tanyaoMenzen).toBeDefined();
      expect(tanyaoMenzen?.han).toBe(1);

      // 鳴き: 234m（チー）+ 456p 678s 555m 22s
      const openMelds: Meld[] = [
        { type: "shuntsu", tiles: [t.man_2, t.man_3, t.man_4], state: "open" },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_5, t.man_5, t.man_5],
        [t.pin_4, t.pin_5, t.pin_6],
        [t.sou_2, t.sou_6, t.sou_7, t.sou_8],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.sou_2,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultOpen);
      const tanyaoOpen = resultOpen.yaku.find((y) => y.name === "断幺九");
      expect(tanyaoOpen).toBeDefined();
      // 断幺九は食い下がりなし（喰いタンあり）
      expect(tanyaoMenzen?.han).toBe(tanyaoOpen?.han);
    });

    it("役牌: 門前/鳴き共に1翻", () => {
      // 門前: 123m 456p 789s 白白白 22s (13枚 + winTile)
      const closedTilesMenzen = createClosedTiles(
        [t.man_1, t.man_2, t.man_3],
        [t.pin_4, t.pin_5, t.pin_6],
        [t.sou_2, t.sou_7, t.sou_8, t.sou_9],
        [t.honor_white, t.honor_white, t.honor_white],
      );
      const resultMenzen = resolveYakuFromHand(
        closedTilesMenzen,
        [],
        t.sou_2,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultMenzen);
      const yakuhaiMenzen = resultMenzen.yaku.find((y) => y.name === "役牌:白");
      expect(yakuhaiMenzen).toBeDefined();
      expect(yakuhaiMenzen?.han).toBe(1);

      // 鳴き: 白白白（ポン）+ 123m 456p 789s 22s
      const openMelds: Meld[] = [
        {
          type: "koutsu",
          tiles: [t.honor_white, t.honor_white, t.honor_white],
          state: "open",
        },
      ];
      const closedTilesOpen = createClosedTiles(
        [t.man_1, t.man_2, t.man_3],
        [t.pin_4, t.pin_5, t.pin_6],
        [t.sou_2, t.sou_7, t.sou_8, t.sou_9],
      );
      const resultOpen = resolveYakuFromHand(
        closedTilesOpen,
        openMelds,
        t.sou_2,
        "ron",
        "east",
        "south",
      );
      assertNonNull(resultOpen);
      const yakuhaiOpen = resultOpen.yaku.find((y) => y.name === "役牌:白");
      expect(yakuhaiOpen).toBeDefined();
      // 役牌は食い下がりなし
      expect(yakuhaiMenzen?.han).toBe(yakuhaiOpen?.han);
    });
  });
});

// ========================================
// 役無しのテスト
// ========================================

describe("resolveYakuFromHand - 役無し", () => {
  it("副露ありで役なし（順子のみ、役牌なし、タンヤオなし）", () => {
    // 副露: 123m（チー）+ 456p 789s 234s 11m
    // 端牌を含むため断幺九にならない、役牌もない
    const openMelds: Meld[] = [
      { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.man_1],
      [t.pin_4, t.pin_5, t.pin_6],
      [t.sou_2, t.sou_3, t.sou_4, t.sou_7, t.sou_8, t.sou_9],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    // 役がないのでnullが返る
    expect(result).toBeNull();
  });

  it("副露ありで役なし（刻子あるが役牌ではない）", () => {
    // 副露: 222m（ポン）+ 456p 789s 345s 11p
    // 2萬の刻子は役牌ではない
    const openMelds: Meld[] = [
      { type: "koutsu", tiles: [t.man_2, t.man_2, t.man_2], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.pin_1, t.pin_4, t.pin_5, t.pin_6],
      [t.sou_3, t.sou_4, t.sou_5, t.sou_7, t.sou_8, t.sou_9],
    );
    const winTile = t.pin_1;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    expect(result).toBeNull();
  });

  it("副露ありで役なし（客風牌の刻子）", () => {
    // 場風: 東、自風: 南 の場合、西・北は客風
    // 副露: 西西西（ポン）+ 123m 456p 789s 11m
    const openMelds: Meld[] = [
      {
        type: "koutsu",
        tiles: [t.honor_west, t.honor_west, t.honor_west],
        state: "open",
      },
    ];
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_1],
      [t.pin_4, t.pin_5, t.pin_6],
      [t.sou_7, t.sou_8, t.sou_9],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east", // 場風: 東
      "south", // 自風: 南 → 西は客風で役にならない
    );

    expect(result).toBeNull();
  });

  it("副露ありで役なし（混一色にも清一色にもならない）", () => {
    // 副露: 123m（チー）+ 456m 789p 234s 11m
    // 3種類の数牌を使っているので混一色にもならない
    const openMelds: Meld[] = [
      { type: "shuntsu", tiles: [t.man_1, t.man_2, t.man_3], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_4, t.man_5, t.man_6],
      [t.pin_7, t.pin_8, t.pin_9],
      [t.sou_2, t.sou_3, t.sou_4],
    );
    const winTile = t.man_1;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    expect(result).toBeNull();
  });

  it("副露ありでも役があれば成立する（対照: タンヤオ）", () => {
    // 副露: 234m（チー）+ 456p 678s 555m 22s
    // 全て中張牌なのでタンヤオ成立
    const openMelds: Meld[] = [
      { type: "shuntsu", tiles: [t.man_2, t.man_3, t.man_4], state: "open" },
    ];
    const closedTiles = createClosedTiles(
      [t.man_5, t.man_5, t.man_5],
      [t.pin_4, t.pin_5, t.pin_6],
      [t.sou_2, t.sou_6, t.sou_7, t.sou_8],
    );
    const winTile = t.sou_2;

    const result = resolveYakuFromHand(
      closedTiles,
      openMelds,
      winTile,
      "ron",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result.han).toBeGreaterThan(0);
    expect(result.yaku.some((y) => y.name === "断幺九")).toBe(true);
  });

  it("門前ロンで役なし（平和の条件を満たさない）", () => {
    // 門前だがロンなので門前清自摸和にならない
    // 123m 456m 789p 234s 11m（嵌張待ち）
    // 嵌張待ちなので平和にもならない
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_1, t.man_1], // 123m, 456m, 11m雀頭
      [t.pin_7, t.pin_8, t.pin_9],
      [t.sou_2, t.sou_4], // 嵌張待ち
    );
    const winTile = t.sou_3;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "ron",
      "east",
      "south",
    );

    // 役がないのでnull
    expect(result).toBeNull();
  });

  it("門前ツモなら役あり（対照: 門前清自摸和）", () => {
    // 同じ手でツモなら門前清自摸和が成立
    // 123m 456m 789p 234s 11m（嵌張待ち）
    const closedTiles = createClosedTiles(
      [t.man_1, t.man_2, t.man_3, t.man_4, t.man_5, t.man_6, t.man_1, t.man_1], // 123m, 456m, 11m雀頭
      [t.pin_7, t.pin_8, t.pin_9],
      [t.sou_2, t.sou_4], // 嵌張待ち
    );
    const winTile = t.sou_3;

    const result = resolveYakuFromHand(
      closedTiles,
      [],
      winTile,
      "tsumo",
      "east",
      "south",
    );

    assertNonNull(result);
    expect(result.yaku.some((y) => y.name === "門前清自摸和")).toBe(true);
  });
});
