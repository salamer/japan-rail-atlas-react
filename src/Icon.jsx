const shapes = {
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.4 3.4 5.4 3.4 9s-1.2 6.6-3.4 9c-2.2-2.4-3.4-5.4-3.4-9S9.8 5.4 12 3Z" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="m15 15 4.5 4.5" /></>,
  lines: <><path d="m4.5 18 6-7 4 2.5 5-7.5" /><circle cx="4.5" cy="18" r="1.75" /><circle cx="19.5" cy="6" r="1.75" /></>,
  stations: <><path d="M18.5 10c0 4.8-6.5 9.2-6.5 9.2S5.5 14.8 5.5 10a6.5 6.5 0 1 1 13 0Z" /><circle cx="12" cy="10" r="2.3" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  plus: <path d="M5 12h14m-7-7v14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.2 4.2L19 7" />,
  close: <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  locate: <><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2" /><path d="M12 2.5v3m0 13v3M2.5 12h3m13 0h3" /></>,
  sun: <><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2.2m0 14.6v2.2M4.2 4.2l1.6 1.6m12.4 12.4 1.6 1.6M2.5 12h2.2m14.6 0h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" /></>,
  moon: <path d="M20.2 14.6A8.2 8.2 0 0 1 9.4 3.8a8.3 8.3 0 1 0 10.8 10.8Z" />,
  external: <path d="M14 4.5h5.5V10M19.5 4.5 11 13M10 6.5H6.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V14" />,
  filter: <path d="M4 6h16M7 12h10m-6 6h2" />,
  trend: <path d="m4 16 5.2-5.2 3.6 3.6L20 7.2M15 7h5v5" />,
};

export default function Icon({ name, className = 'w-[18px] h-[18px]' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {shapes[name]}
    </svg>
  );
}
