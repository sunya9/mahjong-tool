import type {
  QuizProblem,
  Head,
  Tile,
  NumberTile,
  ShuntsuMeld,
  KoutsuMeld,
  KantsuMeld,
} from "@/lib/mahjong-types";
import * as t from "./tiles";
import { generateProblemForCategory } from "@/lib/hand-generator";

// ヘルパー関数
function shuntsu(
  tiles: [NumberTile, NumberTile, NumberTile],
  state: "closed" | "open" = "closed",
): ShuntsuMeld {
  return { type: "shuntsu", tiles, state };
}

function koutsu(
  tiles: [Tile, Tile, Tile],
  state: "closed" | "open" = "closed",
): KoutsuMeld {
  return { type: "koutsu", tiles, state };
}

function kantsu(
  tiles: [Tile, Tile, Tile, Tile],
  state: "closed" | "open" = "closed",
): KantsuMeld {
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
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.man_4, t.man_5, t.man_6]),
      shuntsu([t.pin_2, t.pin_3, t.pin_4]),
      shuntsu([t.sou_5, t.sou_6, t.sou_7]),
    ],
    head: head(t.sou_2),
    winTile: t.man_3,
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
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu([t.pin_1, t.pin_1, t.pin_1]),
    ],
    head: head(t.sou_5),
    winTile: t.man_2,
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
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_2, t.pin_3, t.pin_4]),
      shuntsu([t.sou_4, t.sou_5, t.sou_6]),
      koutsu([t.honor_green, t.honor_green, t.honor_green]),
    ],
    head: head(t.man_5),
    winTile: t.man_3,
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
      shuntsu([t.man_2, t.man_3, t.man_4]),
      shuntsu([t.pin_5, t.pin_6, t.pin_7]),
      koutsu([t.sou_3, t.sou_3, t.sou_3]),
      koutsu([t.sou_7, t.sou_7, t.sou_7], "open"), // ロンで完成 → 明刻
    ],
    head: head(t.honor_white),
    winTile: t.sou_7,
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
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
      koutsu([t.honor_red, t.honor_red, t.honor_red]),
    ],
    head: head(t.man_5),
    winTile: t.man_5,
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
      shuntsu([t.man_2, t.man_3, t.man_4]),
      shuntsu([t.pin_3, t.pin_4, t.pin_5]),
      shuntsu([t.sou_4, t.sou_5, t.sou_6]),
      shuntsu([t.sou_6, t.sou_7, t.sou_8]),
    ],
    head: head(t.pin_9),
    winTile: t.man_2,
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
      koutsu([t.man_5, t.man_5, t.man_5], "open"), // ロンで完成 → 明刻
      koutsu([t.pin_3, t.pin_3, t.pin_3]),
      shuntsu([t.sou_2, t.sou_3, t.sou_4]),
      shuntsu([t.sou_6, t.sou_7, t.sou_8]),
    ],
    head: head(t.honor_east),
    winTile: t.man_5,
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
      koutsu([t.man_1, t.man_1, t.man_1]),
      koutsu([t.pin_9, t.pin_9, t.pin_9]),
      shuntsu([t.sou_3, t.sou_4, t.sou_5]),
      shuntsu([t.sou_6, t.sou_7, t.sou_8]),
    ],
    head: head(t.honor_south),
    winTile: t.sou_5,
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
      koutsu([t.man_2, t.man_2, t.man_2], "open"),
      koutsu([t.pin_8, t.pin_8, t.pin_8], "open"),
      shuntsu([t.sou_1, t.sou_2, t.sou_3]),
      shuntsu([t.sou_5, t.sou_6, t.sou_7]),
    ],
    head: head(t.honor_west),
    winTile: t.sou_7,
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
      kantsu([t.man_9, t.man_9, t.man_9, t.man_9]),
      shuntsu([t.pin_2, t.pin_3, t.pin_4]),
      shuntsu([t.sou_3, t.sou_4, t.sou_5]),
      shuntsu([t.sou_6, t.sou_7, t.sou_8]),
    ],
    head: head(t.pin_5),
    winTile: t.sou_5,
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
      shuntsu([t.man_1, t.man_2, t.man_3]),
      shuntsu([t.pin_4, t.pin_5, t.pin_6]),
      shuntsu([t.sou_2, t.sou_3, t.sou_4]),
      koutsu([t.sou_8, t.sou_8, t.sou_8]),
    ],
    head: head(t.honor_east),
    winTile: t.man_3,
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
      shuntsu([t.man_2, t.man_3, t.man_4]),
      shuntsu([t.pin_5, t.pin_6, t.pin_7]),
      shuntsu([t.sou_3, t.sou_4, t.sou_5]),
      koutsu([t.pin_2, t.pin_2, t.pin_2]),
    ],
    head: head(t.honor_red),
    winTile: t.man_2,
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
      koutsu([t.honor_east, t.honor_east, t.honor_east]),
      koutsu([t.honor_white, t.honor_white, t.honor_white]),
      shuntsu([t.man_2, t.man_3, t.man_4]),
      shuntsu([t.pin_6, t.pin_7, t.pin_8]),
    ],
    head: head(t.sou_5),
    winTile: t.man_4,
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
      koutsu([t.man_1, t.man_1, t.man_1], "open"),
      kantsu([t.pin_9, t.pin_9, t.pin_9, t.pin_9], "open"),
      shuntsu([t.sou_2, t.sou_3, t.sou_4]),
      shuntsu([t.sou_5, t.sou_6, t.sou_7]),
    ],
    head: head(t.honor_green),
    winTile: t.sou_4,
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
      koutsu([t.honor_south, t.honor_south, t.honor_south]),
      koutsu([t.man_5, t.man_5, t.man_5]),
      shuntsu([t.pin_3, t.pin_4, t.pin_5]),
      shuntsu([t.sou_7, t.sou_8, t.sou_9]),
    ],
    head: head(t.honor_south),
    winTile: t.honor_south,
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
