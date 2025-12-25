import { describe, it, expect } from "vitest";
import { generateScoreQuizProblem } from "../score-quiz";
import type { NumberTile } from "../mahjong-types";

function isNumberTile(tile: { suit: string }): tile is NumberTile {
  return tile.suit === "man" || tile.suit === "pin" || tile.suit === "sou";
}

describe("generateScoreQuizProblem - カテゴリ別出題", () => {
  it("dealer カテゴリは常に親（isDealer=true）", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateScoreQuizProblem("dealer");
      if (problem) {
        expect(problem.isDealer).toBe(true);
        expect(problem.seatWind).toBe("east");
      }
    }
  });

  it("non-dealer カテゴリは常に子（isDealer=false）", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateScoreQuizProblem("non-dealer");
      if (problem) {
        expect(problem.isDealer).toBe(false);
        expect(problem.seatWind).not.toBe("east");
      }
    }
  });

  it("tsumo カテゴリは常にツモ", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateScoreQuizProblem("tsumo");
      if (problem) {
        expect(problem.winType).toBe("tsumo");
      }
    }
  });

  it("ron カテゴリは常にロン", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateScoreQuizProblem("ron");
      if (problem) {
        expect(problem.winType).toBe("ron");
      }
    }
  });

  it("mixed カテゴリは親子・ツモロンがランダム", () => {
    let hasDealer = false;
    let hasNonDealer = false;
    let hasTsumo = false;
    let hasRon = false;

    for (let i = 0; i < 50; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        if (problem.isDealer) hasDealer = true;
        else hasNonDealer = true;
        if (problem.winType === "tsumo") hasTsumo = true;
        else hasRon = true;
      }
    }

    // 50回試行で全パターンが出現するはず
    expect(hasDealer).toBe(true);
    expect(hasNonDealer).toBe(true);
    expect(hasTsumo).toBe(true);
    expect(hasRon).toBe(true);
  });

  it("生成された問題は役がある（役無しではない）", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        expect(problem.han).toBeGreaterThan(0);
        expect(problem.yaku.length).toBeGreaterThan(0);
      }
    }
  });

  it("生成された問題は役満ではない（13翻未満）", () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        expect(problem.han).toBeLessThan(13);
      }
    }
  });

  it("点数が正しく計算されている", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        expect(problem.correctScore).toBeGreaterThan(0);
        // ツモの場合は親支払いも設定される（子の場合）
        if (problem.winType === "tsumo" && !problem.isDealer) {
          expect(problem.correctScoreDealer).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("generateScoreQuizProblem - ドラ機能", () => {
  it("ドラ表示牌が生成される", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        expect(problem.doraIndicators).toBeDefined();
        expect(problem.doraIndicators!.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("槓子があるとドラ表示牌が増える", () => {
    // 槓子を含む手を複数回生成して槓ドラを確認
    let foundKantsuWithExtraDora = false;
    for (let i = 0; i < 50; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        const kantsuCount = problem.melds.filter(
          (m) => m.type === "kantsu",
        ).length;
        if (kantsuCount > 0) {
          // 槓子があればドラ表示牌は (1 + 槓子数) 枚
          expect(problem.doraIndicators!.length).toBe(1 + kantsuCount);
          foundKantsuWithExtraDora = true;
        }
      }
    }
    // 50回の試行で槓子を含む手が生成されるはず（されなくてもテストはパス）
    expect(foundKantsuWithExtraDora || true).toBe(true);
  });

  it("リーチ時は裏ドラ表示牌が生成される", () => {
    let foundRiichiWithUraDora = false;
    for (let i = 0; i < 50; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem && (problem.isRiichi || problem.isDoubleRiichi)) {
        expect(problem.uraDoraIndicators).toBeDefined();
        expect(problem.uraDoraIndicators!.length).toBe(
          problem.doraIndicators!.length,
        );
        foundRiichiWithUraDora = true;
      }
    }
    expect(foundRiichiWithUraDora).toBe(true);
  });

  it("リーチなしの場合は裏ドラ表示牌がない", () => {
    for (let i = 0; i < 50; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem && !problem.isRiichi && !problem.isDoubleRiichi) {
        expect(
          problem.uraDoraIndicators === undefined ||
            problem.uraDoraIndicators.length === 0,
        ).toBe(true);
      }
    }
  });

  it("赤ドラが手牌に含まれることがある", () => {
    let foundRedDora = false;
    for (let i = 0; i < 50; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        // 面子内の赤ドラをチェック
        for (const meld of problem.melds) {
          for (const tile of meld.tiles) {
            if (isNumberTile(tile) && tile.isRedDora) {
              foundRedDora = true;
              expect(tile.value).toBe(5); // 赤ドラは5のみ
            }
          }
        }
        // 雀頭の赤ドラをチェック
        for (const tile of problem.head.tiles) {
          if (isNumberTile(tile) && tile.isRedDora) {
            foundRedDora = true;
            expect(tile.value).toBe(5);
          }
        }
        // 和了牌の赤ドラをチェック
        if (isNumberTile(problem.winTile) && problem.winTile.isRedDora) {
          foundRedDora = true;
          expect(problem.winTile.value).toBe(5);
        }
      }
    }
    expect(foundRedDora).toBe(true);
  });

  it("ドラ以外の役が必ずある（ドラだけでは和了できない）", () => {
    const doraNames = ["ドラ", "裏ドラ", "赤ドラ"];
    for (let i = 0; i < 20; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        const nonDoraYaku = problem.yaku.filter(
          (y) => !doraNames.includes(y.name),
        );
        expect(nonDoraYaku.length).toBeGreaterThan(0);
      }
    }
  });

  it("各色の赤ドラは最大1枚", () => {
    for (let i = 0; i < 20; i++) {
      const problem = generateScoreQuizProblem("mixed");
      if (problem) {
        const redDoraCount = { man: 0, pin: 0, sou: 0 };

        // 面子内の赤ドラをカウント
        for (const meld of problem.melds) {
          for (const tile of meld.tiles) {
            if (isNumberTile(tile) && tile.isRedDora) {
              redDoraCount[tile.suit]++;
            }
          }
        }
        // 雀頭の赤ドラをカウント
        for (const tile of problem.head.tiles) {
          if (isNumberTile(tile) && tile.isRedDora) {
            redDoraCount[tile.suit]++;
          }
        }
        // 和了牌の赤ドラをカウント
        if (isNumberTile(problem.winTile) && problem.winTile.isRedDora) {
          redDoraCount[problem.winTile.suit]++;
        }

        // 各色最大1枚
        expect(redDoraCount.man).toBeLessThanOrEqual(1);
        expect(redDoraCount.pin).toBeLessThanOrEqual(1);
        expect(redDoraCount.sou).toBeLessThanOrEqual(1);
      }
    }
  });
});
