import { describe, it, expect } from "vitest";
import { generateRandomProblem } from "../hand-generator";
import { calculateFu } from "../fu-calculator";
import { parseHand } from "../hand-parser";
import { determineWaitType } from "../yaku-resolver";
import type { Tile, Meld, RegularHand } from "../mahjong-types";

describe("generateRandomProblem - 高点法", () => {
  it("生成された問題は最も符が高い解釈を採用している", () => {
    // 複数回生成して、常に最高符の解釈が使われていることを確認
    for (let i = 0; i < 20; i++) {
      const problem = generateRandomProblem();
      if (!problem) continue;

      // 副露している面子を特定
      const openMelds = problem.melds.filter((m) => m.state === "open");
      const closedMelds = problem.melds.filter((m) => m.state === "closed");

      // 門前部分の全牌を抽出
      const closedTiles: Tile[] = [];
      for (const meld of closedMelds) {
        closedTiles.push(...meld.tiles);
      }
      closedTiles.push(...problem.head.tiles);

      // 手牌解析で全ての可能な解釈を取得
      const parseResult = parseHand({
        closedTiles,
        openMelds,
        winTile: problem.winTile,
      });

      if (!parseResult.isWinning) continue;

      // 全ての解釈の符を計算
      let maxFu = 0;
      for (const hand of parseResult.hands) {
        if (hand.pattern !== "regular") continue;
        const regularHand = hand as RegularHand;

        // 待ちの種類を判定
        const waitType = determineWaitType(regularHand, problem.winTile);

        // 副露状態を復元
        const melds = regularHand.melds.map((meld) => {
          const matchingOpen = openMelds.find((open) => {
            if (open.type !== meld.type) return false;
            return (
              open.tiles[0].suit === meld.tiles[0].suit &&
              JSON.stringify(open.tiles[0].value) ===
                JSON.stringify(meld.tiles[0].value)
            );
          });
          if (matchingOpen) {
            return { ...meld, state: "open" as const };
          }
          return meld;
        });

        // シャンポン待ちでロンの場合の調整
        let adjustedMelds: Meld[] = melds;
        if (problem.winType === "ron" && waitType === "shanpon") {
          adjustedMelds = melds.map((meld) => {
            if (
              meld.type === "koutsu" &&
              meld.tiles[0].suit === problem.winTile.suit &&
              JSON.stringify(meld.tiles[0].value) ===
                JSON.stringify(problem.winTile.value)
            ) {
              return { ...meld, state: "open" as const };
            }
            return meld;
          });
        }

        // 符を計算
        const fuResult = calculateFu({
          melds: adjustedMelds,
          head: regularHand.head,
          waitType,
          winType: problem.winType,
          roundWind: problem.roundWind,
          seatWind: problem.seatWind,
          isMenzen: problem.isMenzen,
        });

        if (fuResult.total > maxFu) {
          maxFu = fuResult.total;
        }
      }

      // 問題の符が最高符と一致していることを確認
      expect(problem.correctFu).toBe(maxFu);
    }
  });

  it("複数回生成してエラーが発生しないこと", () => {
    // 50回生成してエラーが発生しないことを確認
    let successCount = 0;
    for (let i = 0; i < 50; i++) {
      const problem = generateRandomProblem();
      if (problem) {
        successCount++;
        // 基本的なプロパティが存在することを確認
        expect(problem.melds.length).toBe(4);
        expect(problem.head.tiles.length).toBe(2);
        expect(problem.correctFu).toBeGreaterThan(0);
        expect(problem.fuBreakdown.length).toBeGreaterThan(0);
      }
    }
    // 少なくとも半分は成功するはず
    expect(successCount).toBeGreaterThan(25);
  });

  it("符の内訳が正しく計算されている", () => {
    for (let i = 0; i < 10; i++) {
      const problem = generateRandomProblem();
      if (!problem) continue;

      // 符の内訳の合計が正しいことを確認
      const rawTotal = problem.fuBreakdown.reduce(
        (sum, item) => sum + item.fu,
        0,
      );
      // 切り上げ処理後の値が correctFu と一致
      const expectedFu = Math.ceil(rawTotal / 10) * 10;
      expect(problem.correctFu).toBe(expectedFu);
    }
  });
});

describe("generateRandomProblem - カテゴリ別", () => {
  it("wait カテゴリは待ちによる符がある", () => {
    let foundWaitFu = false;
    for (let i = 0; i < 30; i++) {
      const problem = generateRandomProblem("wait");
      if (problem && problem.category === "wait") {
        const waitFuNames = ["嵌張待ち", "辺張待ち", "単騎待ち"];
        const hasWaitFu = problem.fuBreakdown.some((b) =>
          waitFuNames.includes(b.name),
        );
        if (hasWaitFu) {
          foundWaitFu = true;
          break;
        }
      }
    }
    expect(foundWaitFu).toBe(true);
  });

  it("meld カテゴリは面子による符がある", () => {
    let foundMeldFu = false;
    for (let i = 0; i < 30; i++) {
      const problem = generateRandomProblem("meld");
      if (problem && problem.category === "meld") {
        const hasMeldFu = problem.melds.some(
          (m) => m.type === "koutsu" || m.type === "kantsu",
        );
        if (hasMeldFu) {
          foundMeldFu = true;
          break;
        }
      }
    }
    expect(foundMeldFu).toBe(true);
  });
});
