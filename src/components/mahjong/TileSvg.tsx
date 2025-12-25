import type { HonorType, Tile } from "@/lib/mahjong-types";
import type { SVGProps, ReactNode } from "react";
import {
  // Regular tiles (normal orientation)
  RegularMan1,
  RegularMan2,
  RegularMan3,
  RegularMan4,
  RegularMan5,
  RegularMan5Dora,
  RegularMan6,
  RegularMan7,
  RegularMan8,
  RegularMan9,
  RegularPin1,
  RegularPin2,
  RegularPin3,
  RegularPin4,
  RegularPin5,
  RegularPin5Dora,
  RegularPin6,
  RegularPin7,
  RegularPin8,
  RegularPin9,
  RegularSou1,
  RegularSou2,
  RegularSou3,
  RegularSou4,
  RegularSou5,
  RegularSou5Dora,
  RegularSou6,
  RegularSou7,
  RegularSou8,
  RegularSou9,
  RegularTon,
  RegularNan,
  RegularShaa,
  RegularPei,
  RegularHaku,
  RegularHatsu,
  RegularChun,
  RegularBack,
  // Rotated tiles (横向き)
  RegularMan1R,
  RegularMan2R,
  RegularMan3R,
  RegularMan4R,
  RegularMan5R,
  RegularMan5DoraR,
  RegularMan6R,
  RegularMan7R,
  RegularMan8R,
  RegularMan9R,
  RegularPin1R,
  RegularPin2R,
  RegularPin3R,
  RegularPin4R,
  RegularPin5R,
  RegularPin5DoraR,
  RegularPin6R,
  RegularPin7R,
  RegularPin8R,
  RegularPin9R,
  RegularSou1R,
  RegularSou2R,
  RegularSou3R,
  RegularSou4R,
  RegularSou5R,
  RegularSou5DoraR,
  RegularSou6R,
  RegularSou7R,
  RegularSou8R,
  RegularSou9R,
  RegularTonR,
  RegularNanR,
  RegularShaaR,
  RegularPeiR,
  RegularHakuR,
  RegularHatsuR,
  RegularChunR,
} from "riichi-mahjong-tiles";

type TileSvgElement = React.FC<SVGProps<SVGSVGElement>>;

// 数牌コンポーネントマップ
const MAN_TILES: TileSvgElement[] = [
  RegularMan1,
  RegularMan2,
  RegularMan3,
  RegularMan4,
  RegularMan5,
  RegularMan6,
  RegularMan7,
  RegularMan8,
  RegularMan9,
];

const MAN_TILES_R: TileSvgElement[] = [
  RegularMan1R,
  RegularMan2R,
  RegularMan3R,
  RegularMan4R,
  RegularMan5R,
  RegularMan6R,
  RegularMan7R,
  RegularMan8R,
  RegularMan9R,
];

const PIN_TILES: TileSvgElement[] = [
  RegularPin1,
  RegularPin2,
  RegularPin3,
  RegularPin4,
  RegularPin5,
  RegularPin6,
  RegularPin7,
  RegularPin8,
  RegularPin9,
];

const PIN_TILES_R: TileSvgElement[] = [
  RegularPin1R,
  RegularPin2R,
  RegularPin3R,
  RegularPin4R,
  RegularPin5R,
  RegularPin6R,
  RegularPin7R,
  RegularPin8R,
  RegularPin9R,
];

const SOU_TILES: TileSvgElement[] = [
  RegularSou1,
  RegularSou2,
  RegularSou3,
  RegularSou4,
  RegularSou5,
  RegularSou6,
  RegularSou7,
  RegularSou8,
  RegularSou9,
];

const SOU_TILES_R: TileSvgElement[] = [
  RegularSou1R,
  RegularSou2R,
  RegularSou3R,
  RegularSou4R,
  RegularSou5R,
  RegularSou6R,
  RegularSou7R,
  RegularSou8R,
  RegularSou9R,
];

// 字牌コンポーネントマップ
const HONOR_TILES: Record<HonorType, TileSvgElement> = {
  east: RegularTon,
  south: RegularNan,
  west: RegularShaa,
  north: RegularPei,
  white: RegularHaku,
  green: RegularHatsu,
  red: RegularChun,
};

const HONOR_TILES_R: Record<HonorType, TileSvgElement> = {
  east: RegularTonR,
  south: RegularNanR,
  west: RegularShaaR,
  north: RegularPeiR,
  white: RegularHakuR,
  green: RegularHatsuR,
  red: RegularChunR,
};

// 赤ドラコンポーネント
const RED_DORA_TILES: Record<string, TileSvgElement> = {
  man: RegularMan5Dora,
  pin: RegularPin5Dora,
  sou: RegularSou5Dora,
};

const RED_DORA_TILES_R: Record<string, TileSvgElement> = {
  man: RegularMan5DoraR,
  pin: RegularPin5DoraR,
  sou: RegularSou5DoraR,
};

export interface TileSvgRenderProps extends SVGProps<SVGSVGElement> {
  tile: Tile;
  rotated?: boolean;
  faceDown?: boolean;
}

export function TileSvg({
  tile,
  rotated,
  faceDown,
}: TileSvgRenderProps): ReactNode {
  // 裏牌
  if (faceDown) {
    return null;
  }

  // 字牌
  if (tile.suit === "honor") {
    const honorType = tile.value as HonorType;
    const Component = rotated
      ? HONOR_TILES_R[honorType]
      : HONOR_TILES[honorType];
    return <Component />;
  }

  // 赤ドラの5
  if (tile.isRedDora && tile.value === 5) {
    const Component = rotated
      ? RED_DORA_TILES_R[tile.suit]
      : RED_DORA_TILES[tile.suit];
    return <Component />;
  }

  // 数牌
  const index = tile.value - 1;
  switch (tile.suit) {
    case "man": {
      const Component = rotated ? MAN_TILES_R[index] : MAN_TILES[index];
      return <Component />;
    }
    case "pin": {
      const Component = rotated ? PIN_TILES_R[index] : PIN_TILES[index];
      return <Component />;
    }
    case "sou": {
      const Component = rotated ? SOU_TILES_R[index] : SOU_TILES[index];
      return <Component />;
    }
    default:
      return <RegularBack />;
  }
}
