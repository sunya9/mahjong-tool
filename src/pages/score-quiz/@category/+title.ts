import type { PageContext } from "vike/types";

const categoryLabels: Record<string, string> = {
  dealer: "親",
  "non-dealer": "子",
  tsumo: "ツモ",
  ron: "ロン",
  mixed: "複合",
};

export function title(pageContext: PageContext) {
  const category = pageContext.routeParams.category;
  const label = categoryLabels[category] ?? category;
  return `点数クイズ: ${label} | 麻雀ツール`;
}
