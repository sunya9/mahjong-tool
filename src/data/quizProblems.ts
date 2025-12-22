import type { QuizProblem, Meld, Head, Tile } from "@/lib/mahjong-types";
import { man, pin, sou, honor } from "./tiles";
import { generateProblemForCategory } from "@/lib/hand-generator";

// ヘルパー関数
function shuntsu(tiles: Tile[], state: "closed" | "open" = "closed"): Meld {
  return { type: "shuntsu", tiles, state };
}

function koutsu(tiles: Tile[], state: "closed" | "open" = "closed"): Meld {
  return { type: "koutsu", tiles, state };
}

function kantsu(tiles: Tile[], state: "closed" | "open" = "closed"): Meld {
  return { type: "kantsu", tiles, state };
}

function head(tile: Tile): Head {
  return { tiles: [tile, tile] };
}

export const quizProblems: QuizProblem[] = [
  // 待ちの種類カテゴリ
  {
    id: "wait-001",
    melds: [
      shuntsu([man(1), man(2), man(3)]),
      shuntsu([man(4), man(5), man(6)]),
      shuntsu([pin(2), pin(3), pin(4)]),
      shuntsu([sou(5), sou(6), sou(7)]),
    ],
    head: head(sou(2)),
    winTile: man(3),
    waitType: "ryanmen",
    winType: "tsumo",
    roundWind: "east",
    seatWind: "south",
    isMenzen: true,
    correctFu: 20,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      // 平和ツモは20符固定（ツモ符なし）
    ],
    category: "wait",
  },
  {
    id: "wait-002",
    melds: [
      shuntsu([man(1), man(2), man(3)]),
      shuntsu([pin(4), pin(5), pin(6)]),
      shuntsu([sou(7), sou(8), sou(9)]),
      koutsu([pin(1), pin(1), pin(1)]),
    ],
    head: head(sou(5)),
    winTile: man(2),
    waitType: "kanchan",
    winType: "ron",
    roundWind: "east",
    seatWind: "west",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 30 },
      { name: "嵌張待ち", fu: 2 },
      { name: "幺九牌暗刻", fu: 8 },
    ],
    category: "wait",
  },
  {
    id: "wait-003",
    melds: [
      shuntsu([man(1), man(2), man(3)]),
      shuntsu([pin(2), pin(3), pin(4)]),
      shuntsu([sou(4), sou(5), sou(6)]),
      koutsu([honor("green"), honor("green"), honor("green")]),
    ],
    head: head(man(5)),
    winTile: man(3),
    waitType: "penchan",
    winType: "tsumo",
    roundWind: "east",
    seatWind: "south",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "ツモ", fu: 2 },
      { name: "辺張待ち", fu: 2 },
      { name: "幺九牌暗刻", fu: 8 },
    ],
    category: "wait",
  },
  {
    id: "wait-004",
    melds: [
      shuntsu([man(2), man(3), man(4)]),
      shuntsu([pin(5), pin(6), pin(7)]),
      koutsu([sou(3), sou(3), sou(3)]),
      koutsu([sou(7), sou(7), sou(7)], "open"), // ロンで完成 → 明刻
    ],
    head: head(honor("white")),
    winTile: sou(7),
    waitType: "shanpon",
    winType: "ron",
    roundWind: "east",
    seatWind: "east",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 30 },
      { name: "雀頭", fu: 2 },
      { name: "中張牌暗刻", fu: 4 },
      { name: "中張牌明刻", fu: 2 }, // ロンで完成 → 明刻
    ],
    category: "wait",
  },
  {
    id: "wait-005",
    melds: [
      shuntsu([man(1), man(2), man(3)]),
      shuntsu([pin(4), pin(5), pin(6)]),
      shuntsu([sou(7), sou(8), sou(9)]),
      koutsu([honor("red"), honor("red"), honor("red")]),
    ],
    head: head(man(5)),
    winTile: man(5),
    waitType: "tanki",
    winType: "tsumo",
    roundWind: "south",
    seatWind: "west",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "ツモ", fu: 2 },
      { name: "単騎待ち", fu: 2 },
      { name: "幺九牌暗刻", fu: 8 },
    ],
    category: "wait",
  },

  // 面子の種類カテゴリ
  {
    id: "meld-001",
    melds: [
      shuntsu([man(2), man(3), man(4)]),
      shuntsu([pin(3), pin(4), pin(5)]),
      shuntsu([sou(4), sou(5), sou(6)]),
      shuntsu([sou(6), sou(7), sou(8)]),
    ],
    head: head(pin(9)),
    winTile: man(2),
    waitType: "ryanmen",
    winType: "ron",
    roundWind: "east",
    seatWind: "south",
    isMenzen: true,
    correctFu: 30,
    fuBreakdown: [{ name: "副底", fu: 30 }],
    category: "meld",
  },
  {
    id: "meld-002",
    melds: [
      koutsu([man(5), man(5), man(5)], "open"), // ロンで完成 → 明刻
      koutsu([pin(3), pin(3), pin(3)]),
      shuntsu([sou(2), sou(3), sou(4)]),
      shuntsu([sou(6), sou(7), sou(8)]),
    ],
    head: head(honor("east")),
    winTile: man(5),
    waitType: "shanpon",
    winType: "ron",
    roundWind: "east",
    seatWind: "south",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 30 },
      { name: "中張牌明刻", fu: 2 }, // ロンで完成 → 明刻
      { name: "中張牌暗刻", fu: 4 },
    ],
    category: "meld",
  },
  {
    id: "meld-003",
    melds: [
      koutsu([man(1), man(1), man(1)]),
      koutsu([pin(9), pin(9), pin(9)]),
      shuntsu([sou(3), sou(4), sou(5)]),
      shuntsu([sou(6), sou(7), sou(8)]),
    ],
    head: head(honor("south")),
    winTile: sou(5),
    waitType: "ryanmen",
    winType: "tsumo",
    roundWind: "east",
    seatWind: "south",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "ツモ", fu: 2 },
      { name: "雀頭", fu: 2 },
      { name: "幺九牌暗刻", fu: 8 },
      { name: "幺九牌暗刻", fu: 8 },
    ],
    category: "meld",
  },
  {
    id: "meld-004",
    melds: [
      koutsu([man(2), man(2), man(2)], "open"),
      koutsu([pin(8), pin(8), pin(8)], "open"),
      shuntsu([sou(1), sou(2), sou(3)]),
      shuntsu([sou(5), sou(6), sou(7)]),
    ],
    head: head(honor("west")),
    winTile: sou(7),
    waitType: "ryanmen",
    winType: "ron",
    roundWind: "south",
    seatWind: "north",
    isMenzen: false,
    correctFu: 30,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "中張牌明刻", fu: 2 },
      { name: "中張牌明刻", fu: 2 },
    ],
    category: "meld",
  },
  {
    id: "meld-005",
    melds: [
      kantsu([man(9), man(9), man(9), man(9)]),
      shuntsu([pin(2), pin(3), pin(4)]),
      shuntsu([sou(3), sou(4), sou(5)]),
      shuntsu([sou(6), sou(7), sou(8)]),
    ],
    head: head(pin(5)),
    winTile: sou(5),
    waitType: "ryanmen",
    winType: "tsumo",
    roundWind: "east",
    seatWind: "west",
    isMenzen: true,
    correctFu: 60,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "ツモ", fu: 2 },
      { name: "幺九牌暗槓", fu: 32 },
    ],
    category: "meld",
  },

  // 雀頭カテゴリ
  {
    id: "head-001",
    melds: [
      shuntsu([man(1), man(2), man(3)]),
      shuntsu([pin(4), pin(5), pin(6)]),
      shuntsu([sou(2), sou(3), sou(4)]),
      koutsu([sou(8), sou(8), sou(8)]),
    ],
    head: head(honor("east")),
    winTile: man(3),
    waitType: "ryanmen",
    winType: "ron",
    roundWind: "east",
    seatWind: "east",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 30 },
      { name: "雀頭", fu: 4 },
      { name: "中張牌暗刻", fu: 4 },
    ],
    category: "head",
  },
  {
    id: "head-002",
    melds: [
      shuntsu([man(2), man(3), man(4)]),
      shuntsu([pin(5), pin(6), pin(7)]),
      shuntsu([sou(3), sou(4), sou(5)]),
      koutsu([pin(2), pin(2), pin(2)]),
    ],
    head: head(honor("red")),
    winTile: man(2),
    waitType: "ryanmen",
    winType: "tsumo",
    roundWind: "south",
    seatWind: "west",
    isMenzen: true,
    correctFu: 30,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "ツモ", fu: 2 },
      { name: "雀頭", fu: 2 },
      { name: "中張牌暗刻", fu: 4 },
    ],
    category: "head",
  },

  // 複合問題カテゴリ
  {
    id: "mixed-001",
    melds: [
      koutsu([honor("east"), honor("east"), honor("east")]),
      koutsu([honor("white"), honor("white"), honor("white")]),
      shuntsu([man(2), man(3), man(4)]),
      shuntsu([pin(6), pin(7), pin(8)]),
    ],
    head: head(sou(5)),
    winTile: man(4),
    waitType: "ryanmen",
    winType: "tsumo",
    roundWind: "east",
    seatWind: "south",
    isMenzen: true,
    correctFu: 40,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "ツモ", fu: 2 },
      { name: "幺九牌暗刻", fu: 8 },
      { name: "幺九牌暗刻", fu: 8 },
    ],
    category: "mixed",
  },
  {
    id: "mixed-002",
    melds: [
      koutsu([man(1), man(1), man(1)], "open"),
      kantsu([pin(9), pin(9), pin(9), pin(9)], "open"),
      shuntsu([sou(2), sou(3), sou(4)]),
      shuntsu([sou(5), sou(6), sou(7)]),
    ],
    head: head(honor("green")),
    winTile: sou(4),
    waitType: "kanchan",
    winType: "ron",
    roundWind: "south",
    seatWind: "north",
    isMenzen: false,
    correctFu: 50,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "嵌張待ち", fu: 2 },
      { name: "雀頭", fu: 2 },
      { name: "幺九牌明刻", fu: 4 },
      { name: "幺九牌明槓", fu: 16 },
    ],
    category: "mixed",
  },
  {
    id: "mixed-003",
    melds: [
      koutsu([honor("south"), honor("south"), honor("south")]),
      koutsu([man(5), man(5), man(5)]),
      shuntsu([pin(3), pin(4), pin(5)]),
      shuntsu([sou(7), sou(8), sou(9)]),
    ],
    head: head(honor("south")),
    winTile: honor("south"),
    waitType: "tanki",
    winType: "tsumo",
    roundWind: "south",
    seatWind: "south",
    isMenzen: true,
    correctFu: 50,
    fuBreakdown: [
      { name: "副底", fu: 20 },
      { name: "ツモ", fu: 2 },
      { name: "単騎待ち", fu: 2 },
      { name: "雀頭", fu: 4 },
      { name: "幺九牌暗刻", fu: 8 },
      { name: "中張牌暗刻", fu: 4 },
    ],
    category: "mixed",
  },
];

// カテゴリ別に問題を取得（静的問題）
export function getProblemsByCategory(
  category: "wait" | "meld" | "head" | "mixed" | "all",
): QuizProblem[] {
  if (category === "all") {
    return quizProblems;
  }
  return quizProblems.filter((p) => p.category === category);
}

// ランダムに問題を取得（動的生成、失敗時は再試行）
export function getRandomProblem(
  category: "wait" | "meld" | "head" | "mixed" | "all",
): QuizProblem {
  // 動的生成を試みる（十分なリトライで必ず成功する）
  for (let i = 0; i < 100; i++) {
    const generated = generateProblemForCategory(category);
    if (generated) {
      return generated;
    }
  }

  // 万が一の保険（到達することはほぼない）
  const problems = getProblemsByCategory(category);
  return problems[Math.floor(Math.random() * problems.length)];
}
