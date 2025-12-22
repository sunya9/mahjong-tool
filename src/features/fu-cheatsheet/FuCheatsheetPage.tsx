import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MahjongTile } from "@/components/mahjong/MahjongTile";
import { MahjongTerm } from "@/components/mahjong/MahjongTerm";
import { man, pin, sou, honor } from "@/data/tiles";

export function FuCheatsheetPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">符計算早見表</h1>
        <p className="text-muted-foreground">
          符の計算方法と点数への影響を確認できます
        </p>
      </div>

      {/* 基本符 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <MahjongTerm term="副底">副底</MahjongTerm>（基本符）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>条件</TableHead>
                <TableHead className="text-right">符</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="門前">門前</MahjongTerm>
                  <MahjongTerm term="ロン">ロン</MahjongTerm>
                </TableCell>
                <TableCell className="text-right font-bold">30符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>その他（鳴きあり・ツモ）</TableCell>
                <TableCell className="text-right font-bold">20符</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ツモ符 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <MahjongTerm term="ツモ">ツモ</MahjongTerm>符
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>条件</TableHead>
                <TableHead className="text-right">符</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>ツモ和了</TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="mt-2 text-xs text-muted-foreground">
            ※ピンフツモは例外で0符
          </p>
        </CardContent>
      </Card>

      {/* 待ち符 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <MahjongTerm term="待ち">待ち</MahjongTerm>符
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>待ちの形</TableHead>
                <TableHead>例</TableHead>
                <TableHead className="text-right">符</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="両面待ち" showRuby>
                    両面待ち
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={man(2)} className="text-2xl" />
                    <MahjongTile tile={man(3)} className="text-2xl" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      → 1,4待ち
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="双碰待ち" showRuby>
                    双碰待ち
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={pin(5)} className="text-2xl" />
                    <MahjongTile tile={pin(5)} className="text-2xl" />
                    <MahjongTile tile={sou(8)} className="text-2xl" />
                    <MahjongTile tile={sou(8)} className="text-2xl" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      → 5p,8s待ち
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="嵌張待ち" showRuby>
                    嵌張待ち
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={sou(4)} className="text-2xl" />
                    <MahjongTile tile={sou(6)} className="text-2xl" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      → 5待ち
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="辺張待ち" showRuby>
                    辺張待ち
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={man(1)} className="text-2xl" />
                    <MahjongTile tile={man(2)} className="text-2xl" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      → 3待ち
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="単騎待ち" showRuby>
                    単騎待ち
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={honor("white")} className="text-2xl" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      → 白待ち
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 雀頭符 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <MahjongTerm term="雀頭" showRuby>
              雀頭
            </MahjongTerm>
            符
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>雀頭の種類</TableHead>
                <TableHead>例</TableHead>
                <TableHead className="text-right">符</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="数牌" showRuby>
                    数牌
                  </MahjongTerm>
                  ・<MahjongTerm term="オタ風">オタ風</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={man(5)} className="text-2xl" />
                    <MahjongTile tile={man(5)} className="text-2xl" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="役牌" showRuby>
                    役牌
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={honor("red")} className="text-2xl" />
                    <MahjongTile tile={honor("red")} className="text-2xl" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      <MahjongTerm term="三元牌" showRuby>
                        三元牌
                      </MahjongTerm>
                      ・<MahjongTerm term="場風">場風</MahjongTerm>・
                      <MahjongTerm term="自風">自風</MahjongTerm>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>連風牌（ダブ東など）</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={honor("east")} className="text-2xl" />
                    <MahjongTile tile={honor("east")} className="text-2xl" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      <MahjongTerm term="場風">場風</MahjongTerm>かつ
                      <MahjongTerm term="自風">自風</MahjongTerm>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">4符</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 面子符 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <MahjongTerm term="面子">面子</MahjongTerm>符
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>面子</TableHead>
                <TableHead>牌</TableHead>
                <TableHead>例</TableHead>
                <TableHead className="text-right">明</TableHead>
                <TableHead className="text-right">暗</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 順子 */}
              <TableRow>
                <TableCell>
                  <MahjongTerm term="順子" showRuby>
                    順子
                  </MahjongTerm>
                </TableCell>
                <TableCell className="text-muted-foreground">-</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={pin(2)} className="text-2xl" />
                    <MahjongTile tile={pin(3)} className="text-2xl" />
                    <MahjongTile tile={pin(4)} className="text-2xl" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              {/* 刻子 中張牌 */}
              <TableRow>
                <TableCell rowSpan={2}>
                  <MahjongTerm term="刻子" showRuby>
                    刻子
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <MahjongTerm term="中張牌" showRuby>
                    中張牌
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={sou(5)} className="text-2xl" />
                    <MahjongTile tile={sou(5)} className="text-2xl" />
                    <MahjongTile tile={sou(5)} className="text-2xl" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
                <TableCell className="text-right font-bold">4符</TableCell>
              </TableRow>
              {/* 刻子 幺九牌 */}
              <TableRow>
                <TableCell>
                  <MahjongTerm term="幺九牌" showRuby>
                    幺九牌
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={man(1)} className="text-2xl" />
                    <MahjongTile tile={man(1)} className="text-2xl" />
                    <MahjongTile tile={man(1)} className="text-2xl" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">4符</TableCell>
                <TableCell className="text-right font-bold">8符</TableCell>
              </TableRow>
              {/* 槓子 中張牌 */}
              <TableRow>
                <TableCell rowSpan={2}>
                  <MahjongTerm term="槓子" showRuby>
                    槓子
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <MahjongTerm term="中張牌" showRuby>
                    中張牌
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={pin(6)} className="text-2xl" />
                    <MahjongTile tile={pin(6)} className="text-2xl" />
                    <MahjongTile tile={pin(6)} className="text-2xl" />
                    <MahjongTile tile={pin(6)} className="text-2xl" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">8符</TableCell>
                <TableCell className="text-right font-bold">16符</TableCell>
              </TableRow>
              {/* 槓子 幺九牌 */}
              <TableRow>
                <TableCell>
                  <MahjongTerm term="幺九牌" showRuby>
                    幺九牌
                  </MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={honor("green")} className="text-2xl" />
                    <MahjongTile tile={honor("green")} className="text-2xl" />
                    <MahjongTile tile={honor("green")} className="text-2xl" />
                    <MahjongTile tile={honor("green")} className="text-2xl" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">16符</TableCell>
                <TableCell className="text-right font-bold">32符</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 計算のコツ */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">計算のコツ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. まず副底（20符または30符）を確認</p>
          <p>2. ツモなら+2符</p>
          <p>3. 待ちが悪い（嵌張・辺張・単騎）なら+2符</p>
          <p>4. 役牌雀頭なら+2符（連風牌なら+4符）</p>
          <p>5. 刻子・槓子の符を加算</p>
          <p>6. 合計を10符単位に切り上げ</p>
        </CardContent>
      </Card>
    </div>
  );
}
