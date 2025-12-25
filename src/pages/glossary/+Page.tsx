import { Contents } from "@/components/layout/Contents";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkupText } from "@/components/mahjong/MarkupText";
import { getGlossaryByCategory, categoryLabels } from "@/data/glossary";
import { useReading } from "@/context/useReading";

export default function Page() {
  const { showReading } = useReading();
  const categorizedGlossary = getGlossaryByCategory();
  const categoryOrder = ["basic", "tile", "hand", "wait", "scoring"];

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: "麻雀ツール", href: "/" }, { label: "用語集" }]}
      />
      <Contents className="space-y-4">
        <p className="text-muted-foreground">
          麻雀でよく使われる用語の読み方と意味を解説します
        </p>

        {categoryOrder.map((categoryKey) => {
          const entries = categorizedGlossary[categoryKey];
          if (!entries || entries.length === 0) return null;

          return (
            <Card key={categoryKey}>
              <CardHeader>
                <CardTitle>{categoryLabels[categoryKey]}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.term}>
                      <dt className="font-bold">
                        {entry.skipRuby || !showReading ? (
                          entry.term
                        ) : (
                          <ruby>
                            {entry.term}
                            <rt className="text-[0.6em] font-normal text-muted-foreground">
                              {entry.reading}
                            </rt>
                          </ruby>
                        )}
                      </dt>
                      <dd className="text-sm leading-relaxed text-muted-foreground">
                        <MarkupText text={entry.description} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </Contents>
    </>
  );
}
