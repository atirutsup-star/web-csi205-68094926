// SVG icons (ported from the todos project, no Tailwind needed)
const Svg = ({ children, size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const ClockIcon = ({ size }) => (
  <Svg size={size}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
);
export const CheckIcon = ({ size }) => (
  <Svg size={size}><path d="M5 12.5l4.5 4.5L19 7" /></Svg>
);
export const PlusIcon = ({ size }) => (
  <Svg size={size}><path d="M12 5v14M5 12h14" /></Svg>
);
export const XIcon = ({ size }) => (
  <Svg size={size}><path d="M6 6l12 12M18 6L6 18" /></Svg>
);
export const TrashIcon = ({ size }) => (
  <Svg size={size}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" /></Svg>
);
export const ArrowLeftIcon = ({ size }) => (
  <Svg size={size}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
);
export const ArrowRightIcon = ({ size }) => (
  <Svg size={size}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
);
export const ChevronsDownIcon = ({ size }) => (
  <Svg size={size}><path d="M6 6l6 6 6-6M6 13l6 6 6-6" /></Svg>
);
export const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
export const XBrandIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
    <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-7.1L5.7 22H2.5l7.3-8.4L1.9 2h6.5l4.5 6.6L18.9 2zm-1.1 17.9h1.7L7.4 4H5.6z" />
  </svg>
);
