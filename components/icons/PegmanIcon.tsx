import React from 'react';

export function PegmanIcon({ className = 'w-5 h-5', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      {/* Pegman head */}
      <circle cx="12" cy="4" r="2.5" />
      {/* Pegman body & limbs */}
      <path d="M15 8.5C15 7.67 14.33 7 13.5 7h-3C9.67 7 9 7.67 9 8.5V13c0 .55.45 1 1 1s1-.45 1-1v-2.5h.5V20.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V10.5h.5V13c0 .55.45 1 1 1s1-.45 1-1V8.5z" />
    </svg>
  );
}

