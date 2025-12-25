import { describe, it, expect } from "vitest";
import { calculateScore, getTotalScore } from "../score-calculator";

describe("calculateScore", () => {
  describe("子ロン", () => {
    it("30符1翻 = 1000点", () => {
      const result = calculateScore(30, 1, false, "ron");
      expect(result.score).toBe(1000);
    });

    it("30符2翻 = 2000点", () => {
      const result = calculateScore(30, 2, false, "ron");
      expect(result.score).toBe(2000);
    });

    it("30符3翻 = 3900点", () => {
      const result = calculateScore(30, 3, false, "ron");
      expect(result.score).toBe(3900);
    });

    it("30符4翻 = 8000点（切り上げ満貫）", () => {
      const result = calculateScore(30, 4, false, "ron");
      expect(result.score).toBe(8000);
      expect(result.label).toBe("満貫");
    });

    it("40符1翻 = 1300点", () => {
      const result = calculateScore(40, 1, false, "ron");
      expect(result.score).toBe(1300);
    });

    it("40符2翻 = 2600点", () => {
      const result = calculateScore(40, 2, false, "ron");
      expect(result.score).toBe(2600);
    });

    it("40符3翻 = 5200点", () => {
      const result = calculateScore(40, 3, false, "ron");
      expect(result.score).toBe(5200);
    });

    it("25符2翻（七対子） = 1600点", () => {
      const result = calculateScore(25, 2, false, "ron");
      expect(result.score).toBe(1600);
    });

    it("25符4翻（七対子リーチタンヤオ等） = 6400点", () => {
      const result = calculateScore(25, 4, false, "ron");
      expect(result.score).toBe(6400);
    });
  });

  describe("子ツモ", () => {
    it("30符1翻 = 300/500", () => {
      const result = calculateScore(30, 1, false, "tsumo");
      expect(result.score).toBe(300);
      expect(result.scoreDealer).toBe(500);
    });

    it("30符2翻 = 500/1000", () => {
      const result = calculateScore(30, 2, false, "tsumo");
      expect(result.score).toBe(500);
      expect(result.scoreDealer).toBe(1000);
    });

    it("30符3翻 = 1000/2000", () => {
      const result = calculateScore(30, 3, false, "tsumo");
      expect(result.score).toBe(1000);
      expect(result.scoreDealer).toBe(2000);
    });

    it("30符4翻 = 2000/4000（切り上げ満貫）", () => {
      const result = calculateScore(30, 4, false, "tsumo");
      expect(result.score).toBe(2000);
      expect(result.scoreDealer).toBe(4000);
      expect(result.label).toBe("満貫");
    });

    it("20符2翻（ピンフツモ） = 400/700", () => {
      const result = calculateScore(20, 2, false, "tsumo");
      expect(result.score).toBe(400);
      expect(result.scoreDealer).toBe(700);
    });

    it("20符3翻 = 700/1300", () => {
      const result = calculateScore(20, 3, false, "tsumo");
      expect(result.score).toBe(700);
      expect(result.scoreDealer).toBe(1300);
    });
  });

  describe("親ロン", () => {
    it("30符1翻 = 1500点", () => {
      const result = calculateScore(30, 1, true, "ron");
      expect(result.score).toBe(1500);
    });

    it("30符2翻 = 2900点", () => {
      const result = calculateScore(30, 2, true, "ron");
      expect(result.score).toBe(2900);
    });

    it("30符3翻 = 5800点", () => {
      const result = calculateScore(30, 3, true, "ron");
      expect(result.score).toBe(5800);
    });

    it("30符4翻 = 12000点（切り上げ満貫）", () => {
      const result = calculateScore(30, 4, true, "ron");
      expect(result.score).toBe(12000);
      expect(result.label).toBe("満貫");
    });

    it("40符2翻 = 3900点", () => {
      const result = calculateScore(40, 2, true, "ron");
      expect(result.score).toBe(3900);
    });

    it("40符3翻 = 7700点", () => {
      const result = calculateScore(40, 3, true, "ron");
      expect(result.score).toBe(7700);
    });
  });

  describe("親ツモ", () => {
    it("30符1翻 = 500オール", () => {
      const result = calculateScore(30, 1, true, "tsumo");
      expect(result.score).toBe(500);
      expect(result.scoreDealer).toBeUndefined();
    });

    it("30符2翻 = 1000オール", () => {
      const result = calculateScore(30, 2, true, "tsumo");
      expect(result.score).toBe(1000);
    });

    it("30符3翻 = 2000オール", () => {
      const result = calculateScore(30, 3, true, "tsumo");
      expect(result.score).toBe(2000);
    });

    it("30符4翻 = 4000オール（切り上げ満貫）", () => {
      const result = calculateScore(30, 4, true, "tsumo");
      expect(result.score).toBe(4000);
      expect(result.label).toBe("満貫");
    });

    it("20符3翻 = 1300オール", () => {
      const result = calculateScore(20, 3, true, "tsumo");
      expect(result.score).toBe(1300);
    });
  });

  describe("満貫", () => {
    it("5翻は満貫（子ロン8000）", () => {
      const result = calculateScore(30, 5, false, "ron");
      expect(result.score).toBe(8000);
      expect(result.label).toBe("満貫");
    });

    it("5翻は満貫（親ロン12000）", () => {
      const result = calculateScore(30, 5, true, "ron");
      expect(result.score).toBe(12000);
      expect(result.label).toBe("満貫");
    });

    it("5翻は満貫（子ツモ2000/4000）", () => {
      const result = calculateScore(30, 5, false, "tsumo");
      expect(result.score).toBe(2000);
      expect(result.scoreDealer).toBe(4000);
      expect(result.label).toBe("満貫");
    });

    it("5翻は満貫（親ツモ4000オール）", () => {
      const result = calculateScore(30, 5, true, "tsumo");
      expect(result.score).toBe(4000);
      expect(result.label).toBe("満貫");
    });

    it("4翻30符は切り上げ満貫（子ロン8000）", () => {
      const result = calculateScore(30, 4, false, "ron");
      expect(result.score).toBe(8000);
      expect(result.label).toBe("満貫");
    });

    it("4翻40符は満貫（子ロン8000）", () => {
      const result = calculateScore(40, 4, false, "ron");
      expect(result.score).toBe(8000);
      expect(result.label).toBe("満貫");
    });

    it("3翻60符は満貫（子ロン8000）", () => {
      const result = calculateScore(60, 3, false, "ron");
      expect(result.score).toBe(8000);
      expect(result.label).toBe("満貫");
    });

    it("3翻70符は満貫（子ロン8000）", () => {
      const result = calculateScore(70, 3, false, "ron");
      expect(result.score).toBe(8000);
      expect(result.label).toBe("満貫");
    });
  });

  describe("跳満", () => {
    it("6翻は跳満（子ロン12000）", () => {
      const result = calculateScore(30, 6, false, "ron");
      expect(result.score).toBe(12000);
      expect(result.label).toBe("跳満");
    });

    it("7翻は跳満（子ロン12000）", () => {
      const result = calculateScore(30, 7, false, "ron");
      expect(result.score).toBe(12000);
      expect(result.label).toBe("跳満");
    });

    it("6翻は跳満（親ロン18000）", () => {
      const result = calculateScore(30, 6, true, "ron");
      expect(result.score).toBe(18000);
      expect(result.label).toBe("跳満");
    });

    it("6翻は跳満（子ツモ3000/6000）", () => {
      const result = calculateScore(30, 6, false, "tsumo");
      expect(result.score).toBe(3000);
      expect(result.scoreDealer).toBe(6000);
      expect(result.label).toBe("跳満");
    });

    it("6翻は跳満（親ツモ6000オール）", () => {
      const result = calculateScore(30, 6, true, "tsumo");
      expect(result.score).toBe(6000);
      expect(result.label).toBe("跳満");
    });
  });

  describe("倍満", () => {
    it("8翻は倍満（子ロン16000）", () => {
      const result = calculateScore(30, 8, false, "ron");
      expect(result.score).toBe(16000);
      expect(result.label).toBe("倍満");
    });

    it("9翻は倍満（子ロン16000）", () => {
      const result = calculateScore(30, 9, false, "ron");
      expect(result.score).toBe(16000);
      expect(result.label).toBe("倍満");
    });

    it("10翻は倍満（子ロン16000）", () => {
      const result = calculateScore(30, 10, false, "ron");
      expect(result.score).toBe(16000);
      expect(result.label).toBe("倍満");
    });

    it("8翻は倍満（親ロン24000）", () => {
      const result = calculateScore(30, 8, true, "ron");
      expect(result.score).toBe(24000);
      expect(result.label).toBe("倍満");
    });

    it("8翻は倍満（子ツモ4000/8000）", () => {
      const result = calculateScore(30, 8, false, "tsumo");
      expect(result.score).toBe(4000);
      expect(result.scoreDealer).toBe(8000);
      expect(result.label).toBe("倍満");
    });

    it("8翻は倍満（親ツモ8000オール）", () => {
      const result = calculateScore(30, 8, true, "tsumo");
      expect(result.score).toBe(8000);
      expect(result.label).toBe("倍満");
    });
  });

  describe("三倍満", () => {
    it("11翻は三倍満（子ロン24000）", () => {
      const result = calculateScore(30, 11, false, "ron");
      expect(result.score).toBe(24000);
      expect(result.label).toBe("三倍満");
    });

    it("12翻は三倍満（子ロン24000）", () => {
      const result = calculateScore(30, 12, false, "ron");
      expect(result.score).toBe(24000);
      expect(result.label).toBe("三倍満");
    });

    it("11翻は三倍満（親ロン36000）", () => {
      const result = calculateScore(30, 11, true, "ron");
      expect(result.score).toBe(36000);
      expect(result.label).toBe("三倍満");
    });

    it("11翻は三倍満（子ツモ6000/12000）", () => {
      const result = calculateScore(30, 11, false, "tsumo");
      expect(result.score).toBe(6000);
      expect(result.scoreDealer).toBe(12000);
      expect(result.label).toBe("三倍満");
    });

    it("11翻は三倍満（親ツモ12000オール）", () => {
      const result = calculateScore(30, 11, true, "tsumo");
      expect(result.score).toBe(12000);
      expect(result.label).toBe("三倍満");
    });
  });

  describe("役満", () => {
    it("13翻は役満（子ロン32000）", () => {
      const result = calculateScore(30, 13, false, "ron");
      expect(result.score).toBe(32000);
      expect(result.label).toBe("役満");
    });

    it("13翻は役満（親ロン48000）", () => {
      const result = calculateScore(30, 13, true, "ron");
      expect(result.score).toBe(48000);
      expect(result.label).toBe("役満");
    });

    it("13翻は役満（子ツモ8000/16000）", () => {
      const result = calculateScore(30, 13, false, "tsumo");
      expect(result.score).toBe(8000);
      expect(result.scoreDealer).toBe(16000);
      expect(result.label).toBe("役満");
    });

    it("13翻は役満（親ツモ16000オール）", () => {
      const result = calculateScore(30, 13, true, "tsumo");
      expect(result.score).toBe(16000);
      expect(result.label).toBe("役満");
    });

    it("26翻はダブル役満（子ロン64000）", () => {
      const result = calculateScore(30, 26, false, "ron");
      expect(result.score).toBe(64000);
      expect(result.label).toBe("2倍役満");
    });

    it("39翻はトリプル役満（子ロン96000）", () => {
      const result = calculateScore(30, 39, false, "ron");
      expect(result.score).toBe(96000);
      expect(result.label).toBe("3倍役満");
    });
  });
});

describe("getTotalScore", () => {
  it("ロンはそのままの点数", () => {
    const result = { score: 8000 };
    expect(getTotalScore(result, false, "ron")).toBe(8000);
    expect(getTotalScore(result, true, "ron")).toBe(8000);
  });

  it("親ツモは3人から支払い", () => {
    const result = { score: 4000 };
    expect(getTotalScore(result, true, "tsumo")).toBe(12000);
  });

  it("子ツモは子2人と親1人から支払い", () => {
    const result = { score: 2000, scoreDealer: 4000 };
    expect(getTotalScore(result, false, "tsumo")).toBe(8000);
  });

  it("子ツモでscoreDealerがない場合はscoreを使用", () => {
    const result = { score: 2000 };
    expect(getTotalScore(result, false, "tsumo")).toBe(6000);
  });
});
