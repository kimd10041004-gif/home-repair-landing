import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="text-sm font-semibold text-brand-teal-dark">404</p>
      <h1 className="mt-2 text-[26px] font-bold text-brand-navy sm:text-[32px]">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        요청하신 페이지가 존재하지 않거나 이동되었습니다. 아래 버튼으로 홈으로
        돌아가거나 필요한 서비스를 다시 찾아보세요.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center rounded-lg bg-brand-navy px-6 font-semibold text-white hover:bg-brand-navy-dark"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/estimate"
          className="flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-6 font-semibold text-slate-700 hover:bg-slate-50"
        >
          사진 상담 시작
        </Link>
      </div>
    </div>
  );
}
