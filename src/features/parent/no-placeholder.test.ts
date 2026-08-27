import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 🔴 값이 없으면 **그 항목을 렌더링하지 않는다.** 자리표시자로 채우지 않는다.
 *
 * 「─」·「0」·「정보 없음」을 채우면 그게 곧 지어낸 값이다. 사용자는 그걸
 * "측정했는데 0" 또는 "값이 없다고 서버가 말했다"로 읽는데 둘 다 사실이 아니다.
 * 계약에 원천이 없어 감춘 자리(readiness 「계약에 원천이 없어 미표시」)에서
 * 특히 그렇다.
 */
const SCREENS = [
  "src/features/parent/analysis/parent-analysis.tsx",
  "src/features/parent/records/parent-record-detail.tsx",
  "src/features/parent/reports/parent-reports.tsx",
  "src/features/parent/profile/parent-profile.tsx",
];

/** 렌더 값 자리에 놓인 자리표시자. 주석·클래스명은 걸리지 않게 값 문맥만 본다. */
const PLACEHOLDERS = [
  /[?:]\s*"─"/,
  /[?:]\s*"—"/,
  /[?:]\s*"정보\s*없음"/,
  /[?:]\s*"미정"/,
  /[?:]\s*"해당\s*없음"/,
  /\?\?\s*"-"/,
];

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("🔴 없는 값을 자리표시자로 채우지 않는다", () => {
  it.each(SCREENS)("%s", (path) => {
    const code = read(path);
    const hits = PLACEHOLDERS.filter((re) => re.test(code)).map(String);
    expect(hits).toEqual([]);
  });

  it("🔴 감춘 필드가 다시 렌더링되지 않는다", () => {
    // readiness 「계약에 원천이 없어 미표시」에 등재된 값들.
    // 되살리려면 백엔드가 낼지 먼저 정하고, 이 목록에서 빼야 한다.
    const banned: [string, string[]][] = [
      ["src/features/parent/analysis/parent-analysis.tsx",
        ["baselineAccuracy", "comparisonMonth", "reviewQuestionCount", "misconceptionSummary"]],
      ["src/features/parent/records/parent-record-detail.tsx",
        ["detail.reviewCount", "detail.repeatedMistakeCount", "detail.wrongTypeSummary", "detail.overtimeQuestionSummary"]],
      ["src/features/parent/reports/parent-reports.tsx",
        ["report.studyPeriod", "report.teacherComment", "summary.accuracy"]],
      ["src/features/parent/profile/parent-profile.tsx", ["profile.maskedPhone"]],
    ];
    for (const [path, fields] of banned) {
      // 주석은 제외하고 실제 코드만 본다 — 왜 감췄는지 적은 주석까지 잡으면 안 된다.
      const code = read(path).replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
      for (const field of fields) expect([path, field, code.includes(field)]).toEqual([path, field, false]);
    }
  });
});
