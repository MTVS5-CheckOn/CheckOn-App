const KOREA_TIME_ZONE = "Asia/Seoul";

export function formatMonthLabel(month: string) {
  const [year, numericMonth] = month.split("-").map(Number);
  if (!year || !numericMonth) return month;
  return `${year}년 ${numericMonth}월`;
}

export function getTodayLearningDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("ko-KR", { timeZone: KOREA_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const year = value("year");
  const month = value("month");
  const day = value("day");
  return { date: `${year}.${month}.${day}`, month: `${year}-${month}` };
}

/**
 * 계약의 월 형식 `YYYY-MM` (member-api.yaml `pattern: ^\d{4}-\d{2}$`).
 * 🔴 분석 엔드포인트의 `month` 는 **필수 query 파라미터**다. 빠지면 400 이다.
 */
export function currentMonth(date: Date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
