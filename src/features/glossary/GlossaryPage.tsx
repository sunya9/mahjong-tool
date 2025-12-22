import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getGlossaryByCategory, categoryLabels } from "@/data/glossary";

export function GlossaryPage() {
  const categorizedGlossary = getGlossaryByCategory();
  const categoryOrder = ["basic", "tile", "hand", "wait", "scoring"];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">麻雀用語集</h1>
        <p className="text-muted-foreground">
          麻雀でよく使われる用語の読み方と意味を解説します
        </p>
      </div>

      <div className="space-y-6">
        {categoryOrder.map((categoryKey) => {
          const entries = categorizedGlossary[categoryKey];
          if (!entries || entries.length === 0) return null;

          return (
            <Card key={categoryKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {categoryLabels[categoryKey]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.term}
                      className="space-y-1 rounded-lg border border-border p-3"
                    >
                      <dt className="flex items-baseline gap-2">
                        <span className="font-bold">{entry.term}</span>
                        <span className="text-sm text-muted-foreground">
                          ({entry.reading})
                        </span>
                      </dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">
                        {entry.description}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
