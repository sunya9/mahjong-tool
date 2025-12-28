export interface GlossaryEntry {
  term: string;
  reading: string;
  description: string;
  category: "basic" | "scoring" | "hand" | "wait" | "tile";
  skipRuby?: boolean; // ルビ表示をスキップ（カタカナや標準読みの用語）
}

export const glossary: Record<string, GlossaryEntry> = {
  // 基本用語
  符: {
    term: "符",
    reading: "ふ",
    description:
      "手牌の構成や{和了}の形によって決まる点数計算の基本単位。{副底}20符に各種加符点を加算して計算する。",
    category: "scoring",
    skipRuby: true,
  },
  翻: {
    term: "翻",
    reading: "ハン",
    description: "役の価値を表す単位。翻数が多いほど点数が高くなる。",
    category: "scoring",
  },
  副底: {
    term: "副底",
    reading: "フーテイ",
    description: "{和了}時に必ず加算される基本符。通常20符。",
    category: "scoring",
  },

  // 面子関連
  面子: {
    term: "面子",
    reading: "メンツ",
    description: "3枚1組の{牌}の組み合わせ。{順子}・{刻子}・{槓子}の総称。",
    category: "hand",
  },
  順子: {
    term: "順子",
    reading: "シュンツ",
    description:
      "同じ種類の{数牌}で連続する3枚の組み合わせ（例：123、456）。{符}はつかない。",
    category: "hand",
  },
  刻子: {
    term: "刻子",
    reading: "コーツ",
    description: "同じ{牌}3枚の組み合わせ。{暗刻}と{明刻}で{符}が異なる。",
    category: "hand",
  },
  槓子: {
    term: "槓子",
    reading: "カンツ",
    description: "同じ{牌}4枚の組み合わせ。{刻子}より高い{符}がつく。",
    category: "hand",
  },
  暗刻: {
    term: "暗刻",
    reading: "アンコ",
    description: "鳴かずに手の中で揃えた{刻子}。{明刻}より高い{符}がつく。",
    category: "hand",
  },
  明刻: {
    term: "明刻",
    reading: "ミンコ",
    description: "ポンして作った{刻子}。{暗刻}より{符}が低い。",
    category: "hand",
  },
  暗槓: {
    term: "暗槓",
    reading: "アンカン",
    description: "手の中の4枚で行う槓。最も高い{符}がつく。",
    category: "hand",
  },
  明槓: {
    term: "明槓",
    reading: "ミンカン",
    description: "ポンした{牌}に1枚加える加槓、または他家の捨て牌で行う大明槓。",
    category: "hand",
  },
  雀頭: {
    term: "雀頭",
    reading: "ジャントウ",
    description:
      "{和了}形に必要な同じ{牌}2枚の組み合わせ（アタマ）。{役牌}の場合は2{符}がつく。",
    category: "hand",
  },

  // 和了関連
  和了: {
    term: "和了",
    reading: "ホーラ/アガリ",
    description: "手牌を完成させて上がること。{ツモ}と{ロン}の2種類がある。",
    category: "basic",
  },
  ツモ: {
    term: "ツモ",
    reading: "ツモ",
    description: "自分で{牌}を引いて{和了}すること。{門前}なら2{符}がつく。",
    category: "basic",
    skipRuby: true,
  },
  ロン: {
    term: "ロン",
    reading: "ロン",
    description: "他家の捨て牌で{和了}すること。",
    category: "basic",
    skipRuby: true,
  },
  門前: {
    term: "門前",
    reading: "メンゼン",
    description: "一度も鳴いていない状態。{門前}{ツモ}は2{符}が加算される。",
    category: "basic",
  },
  副露: {
    term: "副露",
    reading: "フーロ",
    description: "ポン・チー・カンで他家の{牌}をもらうこと。鳴きとも言う。",
    category: "basic",
  },

  // 待ち
  待ち: {
    term: "待ち",
    reading: "まち",
    description: "{和了}に必要な残り1枚の{牌}、またはその形。",
    category: "wait",
    skipRuby: true,
  },
  両面待ち: {
    term: "両面待ち",
    reading: "リャンメンまち",
    description:
      "連続する2枚の{数牌}の両端で待つ形（例：23で1と4待ち）。0{符}。",
    category: "wait",
  },
  嵌張待ち: {
    term: "嵌張待ち",
    reading: "カンチャンまち",
    description: "連続する{数牌}の真ん中を待つ形（例：13で2待ち）。2{符}。",
    category: "wait",
  },
  辺張待ち: {
    term: "辺張待ち",
    reading: "ペンチャンまち",
    description: "12で3待ち、または89で7待ちの形。2{符}。",
    category: "wait",
  },
  双碰待ち: {
    term: "双碰待ち",
    reading: "シャンポンまち",
    description: "2つの対子のどちらかで待つ形。0{符}だが{和了}{牌}で{刻子}になる。",
    category: "wait",
  },
  単騎待ち: {
    term: "単騎待ち",
    reading: "タンキまち",
    description: "{雀頭}の1枚を待つ形。2{符}。",
    category: "wait",
  },

  // 親子
  親: {
    term: "親",
    reading: "おや",
    description: "東家のプレイヤー。{和了}時の点数が{子}の1.5倍になる。",
    category: "basic",
    skipRuby: true,
  },
  子: {
    term: "子",
    reading: "こ",
    description: "{親}以外のプレイヤー（南家・西家・北家）。",
    category: "basic",
    skipRuby: true,
  },

  // 牌の種類
  牌: {
    term: "牌",
    reading: "パイ/ハイ",
    description: "麻雀で使用する駒。全136枚で構成され、{数牌}と{字牌}に分類される。",
    category: "tile",
  },
  数牌: {
    term: "数牌",
    reading: "シューパイ",
    description: "{萬子}・{筒子}・{索子}の1〜9の{牌}。",
    category: "tile",
  },
  字牌: {
    term: "字牌",
    reading: "ツーパイ",
    description: "東南西北の{風牌}と白發中の{三元牌}の総称。",
    category: "tile",
  },
  幺九牌: {
    term: "幺九牌",
    reading: "ヤオチューパイ",
    description: "1・9の{数牌}と{字牌}。{中張牌}の対義語。",
    category: "tile",
  },
  中張牌: {
    term: "中張牌",
    reading: "チュンチャンパイ",
    description: "2〜8の{数牌}。{幺九牌}の対義語。",
    category: "tile",
  },
  萬子: {
    term: "萬子",
    reading: "マンズ/ワンズ",
    description: "{数牌}の一種。一萬〜九萬。",
    category: "tile",
  },
  筒子: {
    term: "筒子",
    reading: "ピンズ",
    description: "{数牌}の一種。一筒〜九筒。丸い図柄。",
    category: "tile",
  },
  索子: {
    term: "索子",
    reading: "ソーズ",
    description: "{数牌}の一種。一索〜九索。竹の図柄。",
    category: "tile",
  },
  風牌: {
    term: "風牌",
    reading: "かぜはい/フォンパイ",
    description: "東・南・西・北の4種類の{字牌}。",
    category: "tile",
  },
  三元牌: {
    term: "三元牌",
    reading: "サンゲンパイ",
    description: "白・發・中の3種類の{字牌}。常に{役牌}となる。",
    category: "tile",
  },
  役牌: {
    term: "役牌",
    reading: "ヤクハイ",
    description:
      "{三元牌}、{場風}牌、{自風}牌のこと。{刻子}で1{翻}、{雀頭}で2{符}がつく。",
    category: "tile",
  },
  オタ風: {
    term: "オタ風",
    reading: "オタかぜ",
    description:
      "{場風}でも{自風}でもない{風牌}のこと。{客風}とも呼ぶ。{役牌}にならず、{雀頭}にしても{符}がつかない。",
    category: "tile",
  },
  場風: {
    term: "場風",
    reading: "ばかぜ",
    description: "その局の風。東場なら東、南場なら南が場風となり{役牌}になる。",
    category: "tile",
  },
  自風: {
    term: "自風",
    reading: "じかぜ",
    description: "自分の席の風。東家なら東、南家なら南など。{役牌}となる。",
    category: "tile",
  },
  連風牌: {
    term: "連風牌",
    reading: "レンフォンパイ",
    description:
      "{場風}と{自風}が同じ{風牌}のこと。例：東場の東家における東。ダブ東・ダブ南とも呼ぶ。{雀頭}にすると4{符}つく。",
    category: "tile",
  },
  客風: {
    term: "客風",
    reading: "きゃくふう",
    description: "{オタ風}の別称。{場風}でも{自風}でもない{風牌}。",
    category: "tile",
  },

  // 点数関連
  満貫: {
    term: "満貫",
    reading: "マンガン",
    description:
      "5{翻}、または3〜4{翻}で規定点を超えた場合の点数。{子}8000点、{親}12000点。",
    category: "scoring",
  },
  跳満: {
    term: "跳満",
    reading: "ハネマン",
    description: "6〜7{翻}の点数。{満貫}の1.5倍。{子}12000点、{親}18000点。",
    category: "scoring",
  },
  倍満: {
    term: "倍満",
    reading: "バイマン",
    description: "8〜10{翻}の点数。{満貫}の2倍。{子}16000点、{親}24000点。",
    category: "scoring",
  },
  三倍満: {
    term: "三倍満",
    reading: "サンバイマン",
    description: "11〜12{翻}の点数。{満貫}の3倍。{子}24000点、{親}36000点。",
    category: "scoring",
  },
  役満: {
    term: "役満",
    reading: "ヤクマン",
    description:
      "13{翻}以上、または特定の役の点数。{満貫}の4倍。{子}32000点、{親}48000点。",
    category: "scoring",
  },
};

// カテゴリ別にグループ化
export function getGlossaryByCategory(): Record<string, GlossaryEntry[]> {
  const categories: Record<string, GlossaryEntry[]> = {
    basic: [],
    scoring: [],
    hand: [],
    wait: [],
    tile: [],
  };

  Object.values(glossary).forEach((entry) => {
    categories[entry.category].push(entry);
  });

  return categories;
}

// カテゴリ名の日本語表記
export const categoryLabels: Record<string, string> = {
  basic: "基本用語",
  scoring: "点数計算",
  hand: "手牌・面子",
  wait: "待ちの形",
  tile: "牌の種類",
};
