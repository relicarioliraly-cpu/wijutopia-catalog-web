import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

const baseClass = 'h-5 w-5 shrink-0';

export function StoreIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M4 10.5V20h16v-9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 10.5 5.2 4h13.6L21 10.5H3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 20v-6h8v6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 10.5c0 1.1.9 2 2 2s2-.9 2-2M11 10.5c0 1.1.9 2 2 2s2-.9 2-2M15 10.5c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function CartIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M4 5h2l2.1 9.4a2 2 0 0 0 2 1.6h6.8a2 2 0 0 0 1.9-1.4L20 9H7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function UserIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 21c0-3.31 2.69-6 6-6h4c3.31 0 6 2.69 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeartIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M12 20s-7-4.35-8.7-9.1C2.2 7.8 4.25 5 7.35 5c1.8 0 3.2.9 4.05 2.15C12.25 5.9 13.65 5 15.45 5c3.1 0 5.15 2.8 4.05 5.9C17.8 15.65 12 20 12 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CardsIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <rect x="6" y="4" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 7h2M9 11h4M8 20l9-2 1.4-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function SparkIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" fill="currentColor" />
    </svg>
  );
}

export function ChartIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7 16v-5M12 16V7M17 16v-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TagIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <path d="M4 12V5h7l9 9-7 7-9-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon({ className = '', title, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden={title ? undefined : true} className={`${baseClass} ${className}`} {...props}>
      {title && <title>{title}</title>}
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
