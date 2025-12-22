export interface GlossaryEntry {
  term: string;
  reading: string;
  description: string;
  category: "basic" | "scoring" | "hand" | "wait" | "tile";
}

export const glossary: Record<string, GlossaryEntry> = {
  // 基本用語
  符: {
    term: "符",
    reading: "ふ",
    description:
      "手牌の構成や和了の形によって決まる点数計算の基本単位。副底20符に各種加符点を加算して計算する。",
    category: "scoring",
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
    description: "和了時に必ず加算される基本符。通常20符。",
    category: "scoring",
  },

  // 面子関連
  面子: {
    term: "面子",
    reading: "メンツ",
    description: "3枚1組の牌の組み合わせ。順子・刻子・槓子の総称。",
    category: "hand",
  },
  順子: {
    term: "順子",
    reading: "シュンツ",
    description:
      "同じ種類の数牌で連続する3枚の組み合わせ（例：123、456）。符はつかない。",
    category: "hand",
  },
  刻子: {
    term: "刻子",
    reading: "コーツ",
    description: "同じ牌3枚の組み合わせ。暗刻と明刻で符が異なる。",
    category: "hand",
  },
  槓子: {
    term: "槓子",
    reading: "カンツ",
    description: "同じ牌4枚の組み合わせ。刻子より高い符がつく。",
    category: "hand",
  },
  暗刻: {
    term: "暗刻",
    reading: "アンコ",
    description: "鳴かずに手の中で揃えた刻子。明刻より高い符がつく。",
    category: "hand",
  },
  明刻: {
    term: "明刻",
    reading: "ミンコ",
    description: "ポンして作った刻子。暗刻より符が低い。",
    category: "hand",
  },
  暗槓: {
    term: "暗槓",
    reading: "アンカン",
    description: "手の中の4枚で行う槓。最も高い符がつく。",
    category: "hand",
  },
  明槓: {
    term: "明槓",
    reading: "ミンカン",
    description: "ポンした牌に1枚加える加槓、または他家の捨て牌で行う大明槓。",
    category: "hand",
  },
  雀頭: {
    term: "雀頭",
    reading: "ジャントウ",
    description:
      "和了形に必要な同じ牌2枚の組み合わせ（アタマ）。役牌の場合は2符がつく。",
    category: "hand",
  },

  // 和了関連
  ツモ: {
    term: "ツモ",
    reading: "ツモ",
    description: "自分で牌を引いて和了すること。門前なら2符がつく。",
    category: "basic",
  },
  ロン: {
    term: "ロン",
    reading: "ロン",
    description: "他家の捨て牌で和了すること。",
    category: "basic",
  },
  門前: {
    term: "門前",
    reading: "メンゼン",
    description: "一度も鳴いていない状態。門前ツモは2符が加算される。",
    category: "basic",
  },
  副露: {
    term: "副露",
    reading: "フーロ",
    description: "ポン・チー・カンで他家の牌をもらうこと。鳴きとも言う。",
    category: "basic",
  },

  // 待ち
  待ち: {
    term: "待ち",
    reading: "まち",
    description: "和了に必要な残り1枚の牌、またはその形。",
    category: "wait",
  },
  両面待ち: {
    term: "両面待ち",
    reading: "リャンメンまち",
    description: "連続する2枚の数牌の両端で待つ形（例：23で1と4待ち）。0符。",
    category: "wait",
  },
  嵌張待ち: {
    term: "嵌張待ち",
    reading: "カンチャンまち",
    description: "連続する数牌の真ん中を待つ形（例：13で2待ち）。2符。",
    category: "wait",
  },
  辺張待ち: {
    term: "辺張待ち",
    reading: "ペンチャンまち",
    description: "12で3待ち、または89で7待ちの形。2符。",
    category: "wait",
  },
  双碰待ち: {
    term: "双碰待ち",
    reading: "シャンポンまち",
    description: "2つの対子のどちらかで待つ形。0符だが和了牌で刻子になる。",
    category: "wait",
  },
  単騎待ち: {
    term: "単騎待ち",
    reading: "タンキまち",
    description: "雀頭の1枚を待つ形。2符。",
    category: "wait",
  },

  // 親子
  親: {
    term: "親",
    reading: "おや",
    description: "東家のプレイヤー。和了時の点数が子の1.5倍になる。",
    category: "basic",
  },
  子: {
    term: "子",
    reading: "こ",
    description: "親以外のプレイヤー（南家・西家・北家）。",
    category: "basic",
  },

  // 牌の種類
  数牌: {
    term: "数牌",
    reading: "シューパイ",
    description: "萬子・筒子・索子の1〜9の牌。",
    category: "tile",
  },
  字牌: {
    term: "字牌",
    reading: "ツーパイ",
    description: "東南西北の風牌と白發中の三元牌の総称。",
    category: "tile",
  },
  幺九牌: {
    term: "幺九牌",
    reading: "ヤオチューパイ",
    description: "1・9の数牌と字牌。中張牌の対義語。",
    category: "tile",
  },
  中張牌: {
    term: "中張牌",
    reading: "チュンチャンパイ",
    description: "2〜8の数牌。幺九牌の対義語。",
    category: "tile",
  },
  萬子: {
    term: "萬子",
    reading: "マンズ/ワンズ",
    description: "数牌の一種。一萬〜九萬。",
    category: "tile",
  },
  筒子: {
    term: "筒子",
    reading: "ピンズ",
    description: "数牌の一種。一筒〜九筒。丸い図柄。",
    category: "tile",
  },
  索子: {
    term: "索子",
    reading: "ソーズ",
    description: "数牌の一種。一索〜九索。竹の図柄。",
    category: "tile",
  },
  風牌: {
    term: "風牌",
    reading: "かぜはい/フォンパイ",
    description: "東・南・西・北の4種類の字牌。",
    category: "tile",
  },
  三元牌: {
    term: "三元牌",
    reading: "サンゲンパイ",
    description: "白・發・中の3種類の字牌。常に役牌となる。",
    category: "tile",
  },
  役牌: {
    term: "役牌",
    reading: "ヤクハイ",
    description: "三元牌、場風牌、自風牌のこと。刻子で1翻、雀頭で2符がつく。",
    category: "tile",
  },
  オタ風: {
    term: "オタ風",
    reading: "オタかぜ",
    description:
      "場風でも自風でもない風牌のこと。客風とも呼ぶ。役牌にならず、雀頭にしても符がつかない。",
    category: "tile",
  },
  場風: {
    term: "場風",
    reading: "ばかぜ",
    description: "その局の風。東場なら東、南場なら南が場風となり役牌になる。",
    category: "tile",
  },
  自風: {
    term: "自風",
    reading: "じかぜ",
    description: "自分の席の風。東家なら東、南家なら南など。役牌となる。",
    category: "tile",
  },
  客風: {
    term: "客風",
    reading: "きゃくふう",
    description: "オタ風の別称。場風でも自風でもない風牌。",
    category: "tile",
  },

  // 点数関連
  満貫: {
    term: "満貫",
    reading: "マンガン",
    description:
      "5翻、または3〜4翻で規定点を超えた場合の点数。子8000点、親12000点。",
    category: "scoring",
  },
  跳満: {
    term: "跳満",
    reading: "ハネマン",
    description: "6〜7翻の点数。満貫の1.5倍。子12000点、親18000点。",
    category: "scoring",
  },
  倍満: {
    term: "倍満",
    reading: "バイマン",
    description: "8〜10翻の点数。満貫の2倍。子16000点、親24000点。",
    category: "scoring",
  },
  三倍満: {
    term: "三倍満",
    reading: "サンバイマン",
    description: "11〜12翻の点数。満貫の3倍。子24000点、親36000点。",
    category: "scoring",
  },
  役満: {
    term: "役満",
    reading: "ヤクマン",
    description:
      "13翻以上、または特定の役の点数。満貫の4倍。子32000点、親48000点。",
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
