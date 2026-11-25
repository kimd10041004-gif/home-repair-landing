<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 운영 규칙 (다다철거 / 반듯집수리 홈페이지)

2026-11-25부터 맥의 GPT(Codex)는 이 저장소에 관여하지 않는다. 개발·검증·배포는 Claude가 맡는다.

## 브랜치와 배포
- **운영 브랜치는 `kimd10041004-gif-glowing-adventure`**다. 이 브랜치에 머지되면 Vercel 프로젝트 `home-repair-landing`이 자동으로 운영 배포하고, `bandeutjipsuri.co.kr` / `www.bandeutjipsuri.co.kr`에 연결된다.
- `main`은 사이트 코드가 아니다(파트너 플랫폼 28 시리즈를 머지했다가 되돌린 기록만 남아 있음). `main` 기준으로 작업하지 않는다.
- **Vercel CLI로 직접 배포(`vercel --prod`)하지 않는다.** 2026-11-14에 CLI로만 배포한 작업이 GitHub에 없어 유실될 뻔했다(PR #21로 복구). 배포는 항상 GitHub 머지 → 자동 배포로만 한다.
- 변경은 작업 브랜치 → 운영 브랜치로 PR을 올려 머지한다.

## 머지 전 확인
```bash
npm ci
npx tsc --noEmit
npm run lint
npm run build
```
- 수치와 결과는 실제 명령 출력을 그대로 인용한다.
- PR마다 Vercel 미리보기 배포가 생긴다. 성공(`Ready`)을 확인한 뒤 머지한다.
- 머지 후 운영 배포가 `READY`인지 확인한다. 문제가 있으면 Vercel에서 직전 운영 배포로 즉시 되돌린다.

## 커밋하지 않는 것
- `.env*`, `node_modules`, `.next`, `next-env.d.ts`, `*.tsbuildinfo`(`.gitignore`에 등록됨)
- `production/*/originals/`, `production/*/screenshots/`, `production/*/contact-sheet.jpg`(작업 원본은 로컬 보관)
- GitHub는 100MB가 넘는 파일을 받지 않는다. 영상은 최적화본만 `public/`에 둔다.

## 콘텐츠 원칙
- AI로 만든 영상·이미지는 실제 시공 사례로 표기하지 않는다(사이트에 AI 연출임을 명시).
- 대표 연락처·공식 채널(카카오, 인스타그램, 블로그, 유튜브)은 `src/lib/constants.ts`에서 관리한다. 대표번호는 `src/app/layout.tsx`에도 직접 적혀 있으므로, 바꿀 때는 두 파일 모두 확인한다.
