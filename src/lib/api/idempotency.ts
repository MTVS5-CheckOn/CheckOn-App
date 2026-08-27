/**
 * Idempotency-Key 생성기.
 *
 * 🔴 mutationFn 안에서 만들면 재시도마다 새 키가 나가 서버가 두 번 채점한다.
 * mutation 시작 시점에 1회 만들어 붙잡아 두고, 재시도(사용자 재클릭·query retry)에서
 * 같은 값을 보낸다. 성공하면 버린다.
 */
type KeyGenerator = () => string;

let generate: KeyGenerator = () => crypto.randomUUID();

export function createIdempotencyKey(): string {
  return generate();
}

export const IDEMPOTENCY_HEADER = "Idempotency-Key";

export function idempotencyHeaders(key: string): Record<string, string> {
  return { [IDEMPOTENCY_HEADER]: key };
}

/** 테스트 전용 — 결정적인 키를 주입한다. */
export function setIdempotencyKeyGeneratorForTest(generator: KeyGenerator | null) {
  generate = generator ?? (() => crypto.randomUUID());
}
