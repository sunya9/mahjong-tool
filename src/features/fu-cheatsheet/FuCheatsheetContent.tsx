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
import * as t from "@/data/tiles";

export function FuCheatsheetContent() {
  return (
    <div className="space-y-2 sm:space-y-6">
      {/* 基本符 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MahjongTerm term="副底">副底</MahjongTerm>（基本符）
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:px-4 sm:py-6">
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
        <CardHeader>
          <CardTitle>
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
        <CardHeader>
          <CardTitle>
            <MahjongTerm term="待ち">待ち</MahjongTerm>符
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:px-4 sm:py-6">
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
                  <MahjongTerm term="両面待ち">両面待ち</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.man_2} size="sm" />
                    <MahjongTile tile={t.man_3} size="sm" />
                    <span className="mx-1 text-muted-foreground">→</span>
                    <MahjongTile tile={t.man_1} size="sm" />
                    <MahjongTile tile={t.man_4} size="sm" />
                    <span className="text-sm text-muted-foreground">待ち</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="双碰待ち">双碰待ち</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.pin_5} size="sm" />
                    <MahjongTile tile={t.pin_5} size="sm" />
                    <MahjongTile tile={t.sou_8} size="sm" />
                    <MahjongTile tile={t.sou_8} size="sm" />
                    <span className="mx-1 text-muted-foreground">→</span>
                    <MahjongTile tile={t.pin_5} size="sm" />
                    <MahjongTile tile={t.sou_8} size="sm" />
                    <span className="text-sm text-muted-foreground">待ち</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="嵌張待ち">嵌張待ち</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.sou_4} size="sm" />
                    <MahjongTile tile={t.sou_6} size="sm" />
                    <span className="mx-1 text-muted-foreground">→</span>
                    <MahjongTile tile={t.sou_5} size="sm" />
                    <span className="text-sm text-muted-foreground">待ち</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="辺張待ち">辺張待ち</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.man_1} size="sm" />
                    <MahjongTile tile={t.man_2} size="sm" />
                    <span className="mx-1 text-muted-foreground">→</span>
                    <MahjongTile tile={t.man_3} size="sm" />
                    <span className="text-sm text-muted-foreground">待ち</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="単騎待ち">単騎待ち</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.honor_white} size="sm" />
                    <span className="mx-1 text-muted-foreground">→</span>
                    <MahjongTile tile={t.honor_white} size="sm" />
                    <span className="text-sm text-muted-foreground">待ち</span>
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
        <CardHeader>
          <CardTitle>
            <MahjongTerm term="雀頭">雀頭</MahjongTerm>符
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:px-4 sm:py-6">
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
                  <MahjongTerm term="数牌">数牌</MahjongTerm>・
                  <MahjongTerm term="オタ風">オタ風</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.man_5} size="sm" />
                    <MahjongTile tile={t.man_5} size="sm" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="役牌">役牌</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.honor_red} size="sm" />
                    <MahjongTile tile={t.honor_red} size="sm" />
                    <span className="ml-1 text-xs text-muted-foreground">
                      <MahjongTerm term="三元牌">三元牌</MahjongTerm>・
                      <MahjongTerm term="場風">場風</MahjongTerm>・
                      <MahjongTerm term="自風">自風</MahjongTerm>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <MahjongTerm term="連風牌">連風牌</MahjongTerm>
                  （ダブ東など）
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MahjongTile tile={t.honor_east} size="sm" />
                    <MahjongTile tile={t.honor_east} size="sm" />
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
        <CardHeader>
          <CardTitle>
            <MahjongTerm term="面子">面子</MahjongTerm>符
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:px-4 sm:py-6">
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
                  <MahjongTerm term="順子">順子</MahjongTerm>
                </TableCell>
                <TableCell className="text-muted-foreground">-</TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={t.pin_2} size="sm" />
                    <MahjongTile tile={t.pin_3} size="sm" />
                    <MahjongTile tile={t.pin_4} size="sm" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
                <TableCell className="text-right font-bold">0符</TableCell>
              </TableRow>
              {/* 刻子 中張牌 */}
              <TableRow>
                <TableCell rowSpan={2}>
                  <MahjongTerm term="刻子">刻子</MahjongTerm>
                </TableCell>
                <TableCell>
                  <MahjongTerm term="中張牌">中張牌</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={t.sou_5} size="sm" />
                    <MahjongTile tile={t.sou_5} size="sm" />
                    <MahjongTile tile={t.sou_5} size="sm" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">2符</TableCell>
                <TableCell className="text-right font-bold">4符</TableCell>
              </TableRow>
              {/* 刻子 幺九牌 */}
              <TableRow>
                <TableCell>
                  <MahjongTerm term="幺九牌">幺九牌</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={t.man_1} size="sm" />
                    <MahjongTile tile={t.man_1} size="sm" />
                    <MahjongTile tile={t.man_1} size="sm" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">4符</TableCell>
                <TableCell className="text-right font-bold">8符</TableCell>
              </TableRow>
              {/* 槓子 中張牌 */}
              <TableRow>
                <TableCell rowSpan={2}>
                  <MahjongTerm term="槓子">槓子</MahjongTerm>
                </TableCell>
                <TableCell>
                  <MahjongTerm term="中張牌">中張牌</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={t.pin_6} size="sm" />
                    <MahjongTile tile={t.pin_6} size="sm" />
                    <MahjongTile tile={t.pin_6} size="sm" />
                    <MahjongTile tile={t.pin_6} size="sm" />
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold">8符</TableCell>
                <TableCell className="text-right font-bold">16符</TableCell>
              </TableRow>
              {/* 槓子 幺九牌 */}
              <TableRow>
                <TableCell>
                  <MahjongTerm term="幺九牌">幺九牌</MahjongTerm>
                </TableCell>
                <TableCell>
                  <div className="flex gap-0.5">
                    <MahjongTile tile={t.honor_green} size="sm" />
                    <MahjongTile tile={t.honor_green} size="sm" />
                    <MahjongTile tile={t.honor_green} size="sm" />
                    <MahjongTile tile={t.honor_green} size="sm" />
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
        <CardHeader>
          <CardTitle>計算のコツ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. まず副底（20符または30符）を確認</p>
          <p>2. ツモなら+2符</p>
          <p>3. 待ちが悪い（嵌張・辺張・単騎）なら+2符</p>
          <p>
            4. <MahjongTerm term="役牌">役牌</MahjongTerm>
            <MahjongTerm term="雀頭">雀頭</MahjongTerm>なら+2符（
            <MahjongTerm term="連風牌">連風牌</MahjongTerm>なら+4符）
          </p>
          <p>5. 刻子・槓子の符を加算</p>
          <p>6. 合計を10符単位に切り上げ</p>
        </CardContent>
      </Card>
    </div>
  );
}
