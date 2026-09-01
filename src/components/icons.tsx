// 통일된 선형(outline) SVG 아이콘 모음.
// 이모지 대신 사용하는 아이콘들로, 모두 24x24 기준 viewBox에 currentColor 선을 사용해
// 어디서든 텍스트 색상에 맞춰 자연스럽게 어울리도록 만든다(최종 개편안 6번: 이모지 금지).
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function IconChat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5h16v10H8l-4 4V5Z" />
    </svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconDoorExit(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 3h7v18H6" />
      <path d="M13 3l5 2v14l-5 2" />
      <path d="M15 12h.01" />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function IconDropletAlert(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
      <path d="M12 11v3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function IconFamilyCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="7" r="2.5" />
      <path d="M3 19v-1a5 5 0 0 1 10 0v1" />
      <circle cx="17" cy="9" r="2" />
      <path d="M14 19v-1a3.5 3.5 0 0 1 4.5-3.36" />
      <path d="M17.5 14.5l1.2 1.2 2.3-2.3" />
    </svg>
  );
}

export function IconWater(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
    </svg>
  );
}

export function IconDoorLock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="3" width="12" height="18" rx="1" />
      <circle cx="13" cy="12" r="1.4" />
    </svg>
  );
}

export function IconBulb(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.2 1 2.1h5c0-.9.4-1.65 1-2.1A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function IconScreen(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 9h16M4 14h16M9 4v16M14 4v16" />
    </svg>
  );
}

export function IconCurtain(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4h16" />
      <path d="M6 4c0 6-1.5 10-2 16" />
      <path d="M12 4c0 6 .8 10 0 16" />
      <path d="M18 4c0 6 1.5 10 2 16" />
    </svg>
  );
}

export function IconHomeGoods(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

export function IconOther(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
    </svg>
  );
}
