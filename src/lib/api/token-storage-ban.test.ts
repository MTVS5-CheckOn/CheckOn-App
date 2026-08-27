import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * 🔴 access token 은 메모리에만 둔다.
 *
 * 프론트에는 백엔드 같은 게이트가 없다. 이런 금지는 스스로 검사로 만들지 않으면
 * 아무도 지키지 않는다 — 다음 사람이 "새로고침하면 로그아웃돼서 불편하다"는
 * 이유로 localStorage 에 넣는 순간, 저장된 토큰은 XSS 가 그대로 읽어간다.
 * refresh 는 이미 HttpOnly `CHECKON_REFRESH` 쿠키(Path=/api/v1/auth)가 담당하므로
 * 토큰을 굳이 저장할 이유가 없다.
 *
 * zustand `persist` 는 허용한다 — 화면 상태(진행 중 답안·온보딩 등)를 담고,
 * 아래에서 그 store 들이 토큰 필드를 갖지 않는지 따로 단언한다.
 */
const SRC = resolve(process.cwd(), "src");

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if ([".ts", ".tsx"].includes(extname(full))) files.push(full);
  }
  return files;
}

/** 주석을 지운 코드만 본다 — 「localStorage 금지」라고 적은 주석까지 잡으면 안 된다. */
function codeWithoutComments(file: string) {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const sourceFiles = walk(SRC).filter((file) => !/\.test\.tsx?$/.test(file));

const STORAGE_APIS = /\b(localStorage|sessionStorage)\b|document\s*\.\s*cookie/;
const TOKEN_FIELDS = /\b(accessToken|refreshToken|idToken|bearerToken)\b/;

describe("🔴 토큰을 브라우저 저장소에 넣지 않는다", () => {
  it("src 어디에도 저장소 API 직접 호출이 없다", () => {
    const offenders = sourceFiles
      .filter((file) => STORAGE_APIS.test(codeWithoutComments(file)))
      .map((file) => relative(process.cwd(), file));
    // zustand persist 는 미들웨어라 여기 걸리지 않는다. 직접 호출만 잡는다.
    expect(offenders).toEqual([]);
  });

  it("🔴 token store 는 모듈 스코프 변수 하나뿐이다", () => {
    const code = codeWithoutComments(join(SRC, "lib/api/token-store.ts"));
    expect(code).not.toMatch(STORAGE_APIS);
    expect(code).toMatch(/let accessToken: string \| null = null/);
  });

  it("🔴 persist 되는 store 가 토큰 필드를 갖지 않는다", () => {
    const persisted = sourceFiles.filter((file) => /persist\s*\(/.test(codeWithoutComments(file)));
    // persist store 가 하나도 없으면 이 검사는 아무것도 지키지 못한다.
    expect(persisted.length).toBeGreaterThan(0);
    const offenders = persisted
      .filter((file) => TOKEN_FIELDS.test(codeWithoutComments(file)))
      .map((file) => relative(process.cwd(), file));
    expect(offenders).toEqual([]);
  });

  it("🔴 refresh 는 HttpOnly 쿠키에 맡긴다 — 응답 토큰을 저장소로 흘리지 않는다", () => {
    const code = codeWithoutComments(join(SRC, "lib/api/refresh.ts"));
    expect(code).not.toMatch(STORAGE_APIS);
    expect(code).toMatch(/credentials: "include"/);
  });
});
