interface BrandLogoProps {
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
  companyName?: string;
  subtitle?: string;
}

export function BrandLogo({
  variant = 'light',
  showSubtitle = true,
  companyName = 'Importir Pontianak',
  subtitle = 'Impor Lebih Mudah, Sampai ke Kalbar',
}: BrandLogoProps) {
  const isDarkBg = variant === 'dark';
  const parts = companyName.trim().split(/\s+/);
  const firstWord = parts[0] || 'Importir';
  const restWords = parts.slice(1).join(' ') || 'Pontianak';

  return (
    <div className="inline-flex items-center gap-3 select-none">
      <svg
        width="54"
        height="40"
        viewBox="0 0 64 46"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Containers */}
        <rect
          x="14"
          y="8"
          width="11"
          height="7"
          rx="1"
          fill={isDarkBg ? '#93C5FD' : '#1E64D8'}
        />
        <rect
          x="26"
          y="6"
          width="12"
          height="9"
          rx="1"
          fill={isDarkBg ? '#DBEAFE' : '#1049B2'}
        />
        <rect
          x="39"
          y="9"
          width="10"
          height="6"
          rx="1"
          fill={isDarkBg ? '#FACC15' : '#0B2351'}
        />
        {/* Ship bridge & funnel */}
        <rect
          x="16"
          y="3"
          width="6"
          height="5"
          rx="1"
          fill={isDarkBg ? '#FFFFFF' : '#0B2351'}
        />
        {/* Ship hull */}
        <path
          d="M9 17H55L49 27H14L9 17Z"
          fill={isDarkBg ? '#FFFFFF' : '#1049B2'}
        />
        {/* Waves */}
        <path
          d="M4 31C11 27 18 35 26 31C34 27 42 35 50 31C54 29 58 30 61 32"
          stroke={isDarkBg ? '#60A5FA' : '#1E64D8'}
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M10 38C18 34 25 41 34 37C42 33 49 39 57 36"
          stroke={isDarkBg ? '#93C5FD' : '#60A5FA'}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>

      <div>
        <div
          className={`text-lg sm:text-xl font-extrabold leading-none tracking-tight ${
            isDarkBg ? 'text-white' : 'text-ink'
          }`}
        >
          <span className="block">{firstWord}</span>
          <span className="block">{restWords}</span>
        </div>
        {showSubtitle && (
          <div
            className={`text-[10px] sm:text-[11px] font-medium mt-1 ${
              isDarkBg ? 'text-blue-200' : 'text-slate-600'
            }`}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function ShipIllustrationSvg() {
  return (
    <svg
      viewBox="0 0 260 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="w-full max-w-[230px] mx-auto h-auto"
    >
      {/* Container stacks */}
      <rect x="78" y="34" width="22" height="14" rx="2" fill="#2563EB" />
      <rect x="102" y="34" width="22" height="14" rx="2" fill="#0F766E" />
      <rect x="126" y="34" width="22" height="14" rx="2" fill="#1D4ED8" />
      <rect x="150" y="34" width="22" height="14" rx="2" fill="#F59E0B" />
      <rect x="90" y="18" width="22" height="14" rx="2" fill="#0EA5E9" />
      <rect x="114" y="18" width="22" height="14" rx="2" fill="#1049B2" />
      <rect x="138" y="18" width="22" height="14" rx="2" fill="#1D4ED8" />
      {/* Bridge */}
      <path d="M52 24H72V50H48L52 24Z" fill="#0B2351" />
      <rect x="55" y="28" width="12" height="5" rx="1" fill="#BFDBFE" />
      <rect x="58" y="14" width="6" height="10" rx="1" fill="#1049B2" />
      {/* Hull */}
      <path d="M36 50H214L198 76H46L36 50Z" fill="#1049B2" />
      <path d="M40 58H209L204 66H43L40 58Z" fill="#0B2351" />
      {/* Water waves */}
      <path
        d="M14 82C34 74 52 90 74 82C96 74 114 90 136 82C158 74 176 90 198 82C216 75 232 82 246 86"
        stroke="#60A5FA"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M28 94C48 87 66 100 88 93C110 86 128 100 150 93C172 86 190 98 214 92"
        stroke="#93C5FD"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
