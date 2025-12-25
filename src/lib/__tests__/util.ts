import { expect } from "vitest";
import type { Tile } from "../mahjong-types";

export function assertNonNull<T>(value: T): asserts value is NonNullable<T> {
  expect(value).not.toBeNull();
  expect(value).not.toBeUndefined();
}

/**
 * 種類ごとに配列を渡すことでprettierフォーマット後も見やすくなるヘルパー
 */
export function createClosedTiles(...groups: Tile[][]): Tile[] {
  return groups.flat();
}
