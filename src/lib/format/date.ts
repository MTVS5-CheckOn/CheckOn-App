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
