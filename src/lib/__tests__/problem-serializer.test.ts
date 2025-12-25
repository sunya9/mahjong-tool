import { describe, it, expect } from "vitest";
import {
  serializeProblem,
  deserializeProblem,
  serializeScoreQuizProblem,
  deserializeScoreQuizProblem,
} from "../problem-serializer";
import type { QuizProblem, ScoreQuizProblem } from "../mahjong-types";

describe("QuizProblem シリアライズ", () => {
  describe("serializeProblem", () => {
    it("基本的な手牌をシリアライズできる", () => {
      const problem: QuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "man", value: 3 },
        waitType: "ryanmen",
        winType: "tsumo",
        roundWind: "east",
        seatWind: "south",
        isMenzen: true,
        correctFu: 30,
        fuBreakdown: [],
        category: "mixed",
        waitMeldIndex: 0,
        waitFromHead: false,
      };

      const serialized = serializeProblem(problem);
      expect(serialized).toBe("123m.456p.789s.111z.5m5m.3m.r.T.E.S.1.0.0");
    });

    it("副露ありの手牌をシリアライズできる", () => {
      const problem: QuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "open",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "pin", value: 5 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 5 },
            ],
            state: "open",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "white" },
              { suit: "honor", value: "white" },
              { suit: "honor", value: "white" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 9 },
            { suit: "man", value: 9 },
          ],
        },
        winTile: { suit: "sou", value: 7 },
        waitType: "ryanmen",
        winType: "ron",
        roundWind: "south",
        seatWind: "west",
        isMenzen: false,
        correctFu: 40,
        fuBreakdown: [],
        category: "mixed",
        waitMeldIndex: 2,
        waitFromHead: false,
      };

      const serialized = serializeProblem(problem);
      // 副露は大文字
      expect(serialized).toBe("123M.555P.789s.555z.9m9m.7s.r.R.S.W.0.2.0");
    });

    it("槓子をシリアライズできる", () => {
      const problem: QuizProblem = {
        id: "test",
        melds: [
          {
            type: "kantsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 1 },
              { suit: "man", value: 1 },
              { suit: "man", value: 1 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "red" },
              { suit: "honor", value: "red" },
              { suit: "honor", value: "red" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "pin", value: 6 },
        waitType: "ryanmen",
        winType: "tsumo",
        roundWind: "east",
        seatWind: "east",
        isMenzen: true,
        correctFu: 50,
        fuBreakdown: [],
        category: "mixed",
        waitMeldIndex: 1,
        waitFromHead: false,
      };

      const serialized = serializeProblem(problem);
      expect(serialized).toBe("1111m.456p.789s.777z.5m5m.6p.r.T.E.E.1.1.0");
    });

    it("単騎待ちをシリアライズできる", () => {
      const problem: QuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "man", value: 9 },
              { suit: "man", value: 9 },
              { suit: "man", value: 9 },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "man", value: 5 },
        waitType: "tanki",
        winType: "tsumo",
        roundWind: "east",
        seatWind: "south",
        isMenzen: true,
        correctFu: 30,
        fuBreakdown: [],
        category: "mixed",
        waitFromHead: true,
      };

      const serialized = serializeProblem(problem);
      expect(serialized).toBe("123m.456p.789s.999m.5m5m.5m.t.T.E.S.1.-.1");
    });
  });

  describe("deserializeProblem", () => {
    it("シリアライズされた文字列をデシリアライズできる", () => {
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.T.E.S.1.0.0";
      const problem = deserializeProblem(encoded);

      expect(problem).not.toBeNull();
      expect(problem!.melds).toHaveLength(4);
      expect(problem!.melds[0].type).toBe("shuntsu");
      expect(problem!.melds[3].type).toBe("koutsu");
      expect(problem!.head.tiles[0]).toEqual({ suit: "man", value: 5 });
      expect(problem!.winTile).toEqual({ suit: "man", value: 3 });
      expect(problem!.waitType).toBe("ryanmen");
      expect(problem!.winType).toBe("tsumo");
      expect(problem!.roundWind).toBe("east");
      expect(problem!.seatWind).toBe("south");
      expect(problem!.isMenzen).toBe(true);
      expect(problem!.waitMeldIndex).toBe(0);
      expect(problem!.waitFromHead).toBe(false);
    });

    it("副露ありの手牌をデシリアライズできる", () => {
      const encoded = "123M.555P.789s.555z.9m9m.7s.r.R.S.W.0.2.0";
      const problem = deserializeProblem(encoded);

      expect(problem).not.toBeNull();
      expect(problem!.melds[0].state).toBe("open");
      expect(problem!.melds[1].state).toBe("open");
      expect(problem!.melds[2].state).toBe("closed");
      expect(problem!.melds[3].state).toBe("closed");
      expect(problem!.isMenzen).toBe(false);
      expect(problem!.winType).toBe("ron");
    });

    it("槓子をデシリアライズできる", () => {
      const encoded = "1111m.456p.789s.777z.5m5m.6p.r.T.E.E.1.1.0";
      const problem = deserializeProblem(encoded);

      expect(problem).not.toBeNull();
      expect(problem!.melds[0].type).toBe("kantsu");
      expect(problem!.melds[0].tiles).toHaveLength(4);
    });

    it("不正な文字列はnullを返す", () => {
      expect(deserializeProblem("")).toBeNull();
      expect(deserializeProblem("invalid")).toBeNull();
      expect(deserializeProblem("123m.456p")).toBeNull();
    });

    it("5枚以上の同じ牌がある場合はnullを返す", () => {
      // 1mが5枚以上になる不正なケース
      const encoded = "111m.111m.789s.777z.1m1m.1m.r.T.E.E.1.1.0";
      const problem = deserializeProblem(encoded);
      expect(problem).toBeNull();
    });
  });

  describe("往復テスト", () => {
    it("シリアライズしてデシリアライズすると元の情報を復元できる", () => {
      const original: QuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
              { suit: "man", value: 4 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
              { suit: "pin", value: 7 },
            ],
            state: "open",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "sou", value: 9 },
              { suit: "sou", value: 9 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "green" },
              { suit: "honor", value: "green" },
              { suit: "honor", value: "green" },
            ],
            state: "open",
          },
        ],
        head: {
          tiles: [
            { suit: "honor", value: "north" },
            { suit: "honor", value: "north" },
          ],
        },
        winTile: { suit: "man", value: 2 },
        waitType: "ryanmen",
        winType: "ron",
        roundWind: "south",
        seatWind: "north",
        isMenzen: false,
        correctFu: 40,
        fuBreakdown: [],
        category: "mixed",
        waitMeldIndex: 0,
        waitFromHead: false,
      };

      const serialized = serializeProblem(original);
      const deserialized = deserializeProblem(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized!.melds).toHaveLength(4);
      expect(deserialized!.melds[0].type).toBe(original.melds[0].type);
      expect(deserialized!.melds[0].state).toBe(original.melds[0].state);
      expect(deserialized!.melds[1].state).toBe(original.melds[1].state);
      expect(deserialized!.head.tiles[0].suit).toBe(
        original.head.tiles[0].suit,
      );
      expect(deserialized!.head.tiles[0].value).toBe(
        original.head.tiles[0].value,
      );
      expect(deserialized!.winTile).toEqual(original.winTile);
      expect(deserialized!.waitType).toBe(original.waitType);
      expect(deserialized!.winType).toBe(original.winType);
      expect(deserialized!.roundWind).toBe(original.roundWind);
      expect(deserialized!.seatWind).toBe(original.seatWind);
      expect(deserialized!.isMenzen).toBe(original.isMenzen);
      expect(deserialized!.waitMeldIndex).toBe(original.waitMeldIndex);
      expect(deserialized!.waitFromHead).toBe(original.waitFromHead);
    });
  });
});

describe("ScoreQuizProblem シリアライズ", () => {
  describe("serializeScoreQuizProblem", () => {
    it("リーチなしをシリアライズできる", () => {
      const problem: ScoreQuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "man", value: 3 },
        waitType: "ryanmen",
        winType: "tsumo",
        roundWind: "east",
        seatWind: "east",
        isDealer: true,
        isMenzen: true,
        fu: 30,
        han: 2,
        yaku: [{ name: "門前清自摸和", han: 1 }],
        correctScore: 2000,
        category: "dealer",
        waitMeldIndex: 0,
        waitFromHead: false,
        isRiichi: false,
        isDoubleRiichi: false,
      };

      const serialized = serializeScoreQuizProblem(problem);
      expect(serialized).toBe(
        "123m.456p.789s.111z.5m5m.3m.r.T.E.E.1.0.0.N.-.-",
      );
    });

    it("リーチありをシリアライズできる", () => {
      const problem: ScoreQuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "man", value: 3 },
        waitType: "ryanmen",
        winType: "ron",
        roundWind: "east",
        seatWind: "south",
        isDealer: false,
        isMenzen: true,
        fu: 40,
        han: 2,
        yaku: [{ name: "立直", han: 1 }],
        correctScore: 2600,
        category: "non-dealer",
        waitMeldIndex: 0,
        waitFromHead: false,
        isRiichi: true,
        isDoubleRiichi: false,
      };

      const serialized = serializeScoreQuizProblem(problem);
      expect(serialized).toBe(
        "123m.456p.789s.111z.5m5m.3m.r.R.E.S.1.0.0.R.-.-",
      );
    });

    it("ダブルリーチをシリアライズできる", () => {
      const problem: ScoreQuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "man", value: 3 },
        waitType: "ryanmen",
        winType: "tsumo",
        roundWind: "east",
        seatWind: "south",
        isDealer: false,
        isMenzen: true,
        fu: 30,
        han: 3,
        yaku: [{ name: "ダブル立直", han: 2 }],
        correctScore: 1000,
        correctScoreDealer: 2000,
        category: "non-dealer",
        waitMeldIndex: 0,
        waitFromHead: false,
        isRiichi: true,
        isDoubleRiichi: true,
      };

      const serialized = serializeScoreQuizProblem(problem);
      expect(serialized).toBe(
        "123m.456p.789s.111z.5m5m.3m.r.T.E.S.1.0.0.D.-.-",
      );
    });
  });

  describe("deserializeScoreQuizProblem", () => {
    it("リーチなしをデシリアライズできる", () => {
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.T.E.E.1.0.0.N";
      const problem = deserializeScoreQuizProblem(encoded, "dealer");

      expect(problem).not.toBeNull();
      expect(problem!.isRiichi).toBe(false);
      expect(problem!.isDoubleRiichi).toBe(false);
      expect(problem!.isDealer).toBe(true);
      expect(problem!.category).toBe("dealer");
    });

    it("リーチありをデシリアライズできる", () => {
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.R.E.S.1.0.0.R";
      const problem = deserializeScoreQuizProblem(encoded, "non-dealer");

      expect(problem).not.toBeNull();
      expect(problem!.isRiichi).toBe(true);
      expect(problem!.isDoubleRiichi).toBe(false);
      expect(problem!.isDealer).toBe(false);
    });

    it("ダブルリーチをデシリアライズできる", () => {
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.T.E.S.1.0.0.D";
      const problem = deserializeScoreQuizProblem(encoded, "mixed");

      expect(problem).not.toBeNull();
      expect(problem!.isRiichi).toBe(true);
      expect(problem!.isDoubleRiichi).toBe(true);
    });

    it("不正な文字列はnullを返す", () => {
      expect(deserializeScoreQuizProblem("")).toBeNull();
      expect(deserializeScoreQuizProblem("invalid")).toBeNull();
      expect(deserializeScoreQuizProblem("123m.456p")).toBeNull();
    });

    it("役がある手牌は正しく復元される", () => {
      // タンヤオ・平和の手牌
      const encoded = "234m.567m.234p.567p.5s5s.2m.r.R.S.N.1.0.0.N";
      const problem = deserializeScoreQuizProblem(encoded, "mixed");
      expect(problem).not.toBeNull();
      expect(problem!.yaku.some((y) => y.name === "断幺九")).toBe(true);
      expect(problem!.yaku.some((y) => y.name === "平和")).toBe(true);
    });
  });

  describe("ドラシリアライズ", () => {
    it("ドラ表示牌をシリアライズできる", () => {
      const problem: ScoreQuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "man", value: 3 },
        waitType: "ryanmen",
        winType: "tsumo",
        roundWind: "east",
        seatWind: "east",
        isDealer: true,
        isMenzen: true,
        fu: 30,
        han: 2,
        yaku: [{ name: "役牌", han: 1 }],
        correctScore: 2000,
        category: "dealer",
        waitMeldIndex: 0,
        waitFromHead: false,
        isRiichi: false,
        isDoubleRiichi: false,
        doraIndicators: [
          { suit: "man", value: 1 },
          { suit: "pin", value: 5 },
        ],
      };

      const serialized = serializeScoreQuizProblem(problem);
      expect(serialized).toBe(
        "123m.456p.789s.111z.5m5m.3m.r.T.E.E.1.0.0.N.1m+5p.-",
      );
    });

    it("裏ドラ表示牌をシリアライズできる（リーチ時）", () => {
      const problem: ScoreQuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 1 },
              { suit: "man", value: 2 },
              { suit: "man", value: 3 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 5 },
            { suit: "man", value: 5 },
          ],
        },
        winTile: { suit: "man", value: 3 },
        waitType: "ryanmen",
        winType: "ron",
        roundWind: "east",
        seatWind: "south",
        isDealer: false,
        isMenzen: true,
        fu: 40,
        han: 2,
        yaku: [{ name: "立直", han: 1 }],
        correctScore: 2600,
        category: "non-dealer",
        waitMeldIndex: 0,
        waitFromHead: false,
        isRiichi: true,
        isDoubleRiichi: false,
        doraIndicators: [{ suit: "sou", value: 3 }],
        uraDoraIndicators: [{ suit: "honor", value: "white" }],
      };

      const serialized = serializeScoreQuizProblem(problem);
      expect(serialized).toBe(
        "123m.456p.789s.111z.5m5m.3m.r.R.E.S.1.0.0.R.3s.5z",
      );
    });

    it("赤ドラをシリアライズできる（0で表現）", () => {
      const problem: ScoreQuizProblem = {
        id: "test",
        melds: [
          {
            type: "shuntsu",
            tiles: [
              { suit: "man", value: 4 },
              { suit: "man", value: 5, isRedDora: true },
              { suit: "man", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "pin", value: 4 },
              { suit: "pin", value: 5 },
              { suit: "pin", value: 6 },
            ],
            state: "closed",
          },
          {
            type: "shuntsu",
            tiles: [
              { suit: "sou", value: 7 },
              { suit: "sou", value: 8 },
              { suit: "sou", value: 9 },
            ],
            state: "closed",
          },
          {
            type: "koutsu",
            tiles: [
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
              { suit: "honor", value: "east" },
            ],
            state: "closed",
          },
        ],
        head: {
          tiles: [
            { suit: "man", value: 9 },
            { suit: "man", value: 9 },
          ],
        },
        winTile: { suit: "man", value: 4 },
        waitType: "ryanmen",
        winType: "tsumo",
        roundWind: "east",
        seatWind: "east",
        isDealer: true,
        isMenzen: true,
        fu: 30,
        han: 2,
        yaku: [{ name: "役牌", han: 1 }],
        correctScore: 2000,
        category: "dealer",
        waitMeldIndex: 0,
        waitFromHead: false,
        isRiichi: false,
        isDoubleRiichi: false,
        doraIndicators: [{ suit: "man", value: 3 }],
      };

      const serialized = serializeScoreQuizProblem(problem);
      // 赤ドラの5は0として表現される、各牌は個別にシリアライズ
      expect(serialized).toBe(
        "4m0m6m.456p.789s.111z.9m9m.4m.r.T.E.E.1.0.0.N.3m.-",
      );
    });

    it("ドラ表示牌をデシリアライズできる", () => {
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.T.E.E.1.0.0.N.1m+5p.-";
      const problem = deserializeScoreQuizProblem(encoded, "dealer");

      expect(problem).not.toBeNull();
      expect(problem!.doraIndicators).toHaveLength(2);
      expect(problem!.doraIndicators![0]).toEqual({ suit: "man", value: 1 });
      expect(problem!.doraIndicators![1]).toEqual({ suit: "pin", value: 5 });
      expect(
        problem!.uraDoraIndicators === undefined ||
          problem!.uraDoraIndicators.length === 0,
      ).toBe(true);
    });

    it("裏ドラ表示牌をデシリアライズできる", () => {
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.R.E.S.1.0.0.R.3s.5z";
      const problem = deserializeScoreQuizProblem(encoded, "non-dealer");

      expect(problem).not.toBeNull();
      expect(problem!.doraIndicators).toHaveLength(1);
      expect(problem!.doraIndicators![0]).toEqual({ suit: "sou", value: 3 });
      expect(problem!.uraDoraIndicators).toHaveLength(1);
      expect(problem!.uraDoraIndicators![0]).toEqual({
        suit: "honor",
        value: "white",
      });
    });

    it("赤ドラをデシリアライズできる", () => {
      const encoded = "4m0m6m.456p.789s.111z.9m9m.4m.r.T.E.E.1.0.0.N.3m.-";
      const problem = deserializeScoreQuizProblem(encoded, "dealer");

      expect(problem).not.toBeNull();
      // 面子内の赤ドラをチェック
      const firstMeld = problem!.melds[0];
      expect(firstMeld.tiles[0]).toEqual({ suit: "man", value: 4 });
      expect(firstMeld.tiles[1]).toEqual({
        suit: "man",
        value: 5,
        isRedDora: true,
      });
      expect(firstMeld.tiles[2]).toEqual({ suit: "man", value: 6 });
    });

    it("ドラ情報の往復テスト", () => {
      const encoded =
        "123m.456p.789s.111z.5m5m.3m.r.R.E.S.1.0.0.R.1m+2p+3s.4z+5z";
      const problem = deserializeScoreQuizProblem(encoded, "non-dealer");

      expect(problem).not.toBeNull();

      const reserialized = serializeScoreQuizProblem(problem!);
      expect(reserialized).toBe(encoded);
    });
  });

  describe("往復テスト", () => {
    it("シリアライズしてデシリアライズすると元の情報を復元できる（リーチなし）", () => {
      // 役牌東を含む門前手
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.T.E.E.1.0.0.N.-.-";
      const problem = deserializeScoreQuizProblem(encoded, "dealer");

      expect(problem).not.toBeNull();

      const reserialized = serializeScoreQuizProblem(problem!);
      expect(reserialized).toBe(encoded);
    });

    it("シリアライズしてデシリアライズすると元の情報を復元できる（リーチあり）", () => {
      // 役牌東を含む門前手 + リーチ
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.R.E.E.1.0.0.R.-.-";
      const problem = deserializeScoreQuizProblem(encoded, "dealer");

      expect(problem).not.toBeNull();
      expect(problem!.isRiichi).toBe(true);

      const reserialized = serializeScoreQuizProblem(problem!);
      expect(reserialized).toBe(encoded);
    });

    it("シリアライズしてデシリアライズすると元の情報を復元できる（ダブルリーチ）", () => {
      // 役牌東を含む門前手 + ダブルリーチ
      const encoded = "123m.456p.789s.111z.5m5m.3m.r.T.E.E.1.0.0.D.-.-";
      const problem = deserializeScoreQuizProblem(encoded, "dealer");

      expect(problem).not.toBeNull();
      expect(problem!.isDoubleRiichi).toBe(true);

      const reserialized = serializeScoreQuizProblem(problem!);
      expect(reserialized).toBe(encoded);
    });
  });
});
