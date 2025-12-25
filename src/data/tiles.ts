import {
  type HonorType,
  type HonorTile,
  type NumberTile,
  type TileNumber,
} from "@/lib/mahjong-types";

// 数牌のショートハンド
function man(value: TileNumber, isRedDora?: boolean): NumberTile {
  return { suit: "man", value, isRedDora };
}

function pin(value: TileNumber, isRedDora?: boolean): NumberTile {
  return { suit: "pin", value, isRedDora };
}

function sou(value: TileNumber, isRedDora?: boolean): NumberTile {
  return { suit: "sou", value, isRedDora };
}

// 字牌のショートハンド
function honor(type: HonorType): HonorTile {
  return { suit: "honor", value: type };
}

export const man_1 = man(1);
export const man_2 = man(2);
export const man_3 = man(3);
export const man_4 = man(4);
export const man_5 = man(5);
export const man_5_dora = man(5, true);
export const man_6 = man(6);
export const man_7 = man(7);
export const man_8 = man(8);
export const man_9 = man(9);
export const pin_1 = pin(1);
export const pin_2 = pin(2);
export const pin_3 = pin(3);
export const pin_4 = pin(4);
export const pin_5 = pin(5);
export const pin_5_dora = pin(5, true);
export const pin_6 = pin(6);
export const pin_7 = pin(7);
export const pin_8 = pin(8);
export const pin_9 = pin(9);
export const sou_1 = sou(1);
export const sou_2 = sou(2);
export const sou_3 = sou(3);
export const sou_4 = sou(4);
export const sou_5 = sou(5);
export const sou_5_dora = sou(5, true);
export const sou_6 = sou(6);
export const sou_7 = sou(7);
export const sou_8 = sou(8);
export const sou_9 = sou(9);
export const honor_east = honor("east");
export const honor_south = honor("south");
export const honor_west = honor("west");
export const honor_north = honor("north");
export const honor_white = honor("white");
export const honor_green = honor("green");
export const honor_red = honor("red");
