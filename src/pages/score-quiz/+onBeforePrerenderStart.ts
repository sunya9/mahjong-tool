import { createUrl } from "@/lib/utils";
export function onBeforePrerenderStart() {
  return [
    "/score-quiz/dealer",
    "/score-quiz/non-dealer",
    "/score-quiz/tsumo",
    "/score-quiz/ron",
    "/score-quiz/mixed",
  ].map((path) => createUrl(path));
}
