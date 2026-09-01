# 반듯집수리 파트너 플랫폼 — 원바이원 라운드 (GitHub 시리즈 28)

기존 맥 데스크탑의 "반듯 집수리 클로드 27 ver." 라운드 루프를 GitHub 저장소 기반으로 이어가는 신규 시리즈. 데스크탑 원본 폴더는 건드리지 않으며, 방법론(라운드 스냅샷·감사·수정·검증·해시 무결성)은 동일하게 유지한다.

## 역할

- **감사(GPT 역할)**: Claude 세션이 Codex를 대리하여 각 라운드를 전 범위 감사하고 `28-N/감사결과.md`를 작성한다.
- **수정(Claude 역할)**: 감사 항목 전부를 스크래치 복사본에서 수정 + 회귀 테스트 후 `28-(N+1)` 스냅샷을 생성한다.

## 규칙 (기존 방식 그대로)

1. 이전 라운드 폴더(`28-1` ~ `28-N`)는 절대 직접 수정하지 않는다 — md5 해시 전/후 비교로 증명.
2. 수정은 반드시 스크래치 복사본에서 하고, `rsync -a --exclude node_modules`로 새 라운드 폴더를 만든다.
3. 테스트/타입 검사 수치는 항상 실제 명령 출력(`vitest run`, `node --test`, `tsc --noEmit`)을 인용한다. 손으로 세지 않는다.
4. 감사 항목을 조용히 빠뜨리지 않는다 — 다루지 못한 항목은 이유와 함께 명시한다.
5. `node_modules`/`dist`는 커밋하지 않는다. 각 라운드 폴더에서 `npm install` 후 실행.
6. 새 라운드 폴더를 만들면 **루트 `vercel.json`의 라운드 경로(install/build/outputDirectory)를 반드시 새 라운드로 갱신**한다 — 갱신하지 않으면 이전 라운드가 계속 배포된다.

## 실행

```bash
cd 28-N   # 최신 라운드
npm install
npm run dev        # 개발 서버
npm run typecheck  # tsc --noEmit
npm test           # vitest
npm run test:node  # node --test
```

## 상태 파일

`_원바이원_감사대기_상태.json` — `watchingRound`(감사 대기 중인 라운드), `consecutiveMisses`, `lastAuditFileSeen`.
