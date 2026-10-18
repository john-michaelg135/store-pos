interface TindahanLogoProps {
  className?: string;
  size?: number;
}

export default function TindahanLogo({ className = "w-8 h-8", size = 32 }: TindahanLogoProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        {/* Minimalist Solid Badge matching theme */}
        <rect
          width="32"
          height="32"
          rx="4"
          className="fill-[#000] dark:fill-white transition-colors"
        />

        {/* Tindahan Store Awning (Crossbar of the "T") */}
        <path
          d="M6 8.5h20l-2 5.5H8L6 8.5z"
          className="fill-white dark:fill-[#000] transition-colors"
        />

        {/* Warm Terracotta Accent Ribbon (Center Awning Fold) */}
        <path
          d="M14.2 8.5h3.6l-.5 5.5h-2.6l-.5-5.5z"
          fill="#B38B6D"
        />

        {/* Store Pillar / "T" Vertical Stem */}
        <rect
          x="14.25"
          y="15.5"
          width="3.5"
          height="6.5"
          rx="0.5"
          className="fill-white dark:fill-[#000] transition-colors"
        />

        {/* Serving Counter Ledge */}
        <rect
          x="10.5"
          y="23.2"
          width="11"
          height="1.5"
          rx="0.75"
          fill="#B38B6D"
        />
      </svg>
    </div>
  );
}
