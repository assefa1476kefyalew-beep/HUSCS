import React, { useState } from 'react';

interface HawassaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const HawassaLogo: React.FC<HawassaLogoProps> = ({
  className = 'w-10 h-10',
  size,
  showText = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const style = size
    ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }
    : undefined;

  // Render official Hawassa University emblem
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={style}>
      {!imgError ? (
        <img
          src="/hawassa-logo.png"
          alt="Hawassa University Official Logo"
          className="w-full h-full object-contain select-none"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Curved text paths */}
            <path
              id="top-arc"
              d="M 65,250 A 185,185 0 1,1 435,250"
              fill="none"
            />
            <path
              id="bottom-arc"
              d="M 65,250 A 185,185 0 0,0 435,250"
              fill="none"
            />
            <linearGradient id="lake-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4FC3F7" />
              <stop offset="60%" stopColor="#81D4FA" />
              <stop offset="100%" stopColor="#B3E5FC" />
            </linearGradient>
            <linearGradient id="lake-water" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00BCD4" />
              <stop offset="50%" stopColor="#00ACC1" />
              <stop offset="100%" stopColor="#0097A7" />
            </linearGradient>
            <clipPath id="inner-circle-clip">
              <circle cx="250" cy="250" r="145" />
            </clipPath>
          </defs>

          {/* Outer circle background and border */}
          <circle cx="250" cy="250" r="240" fill="#FFFFFF" stroke="#111827" strokeWidth="12" />
          <circle cx="250" cy="250" r="232" fill="none" stroke="#111827" strokeWidth="2" />

          {/* Red Gear Arc on Top */}
          <g>
            {/* Gear teeth */}
            {[...Array(11)].map((_, i) => {
              const angle = -140 + i * 10;
              return (
                <rect
                  key={i}
                  x="236"
                  y="62"
                  width="28"
                  height="34"
                  fill="#E53935"
                  rx="3"
                  transform={`rotate(${angle} 250 250)`}
                />
              );
            })}
            {/* Gear body ring */}
            <path
              d="M 105,250 A 155,155 0 1,1 395,250"
              fill="none"
              stroke="#E53935"
              strokeWidth="28"
            />
          </g>

          {/* Inner Circular Viewport with Scenic Lake Hawassa */}
          <g clipPath="url(#inner-circle-clip)">
            {/* Sky */}
            <rect x="100" y="100" width="300" height="300" fill="url(#lake-sky)" />
            
            {/* Clouds */}
            <ellipse cx="200" cy="185" rx="35" ry="14" fill="#FFFFFF" opacity="0.85" />
            <ellipse cx="225" cy="178" rx="28" ry="12" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="330" cy="190" rx="30" ry="10" fill="#FFFFFF" opacity="0.8" />

            {/* Globe Blue Wireframe Lines in Sky */}
            <circle cx="250" cy="250" r="140" fill="none" stroke="#0033CC" strokeWidth="7" />
            <path d="M 250,110 L 250,390" stroke="#0033CC" strokeWidth="7" />
            <ellipse cx="250" cy="250" rx="75" ry="140" fill="none" stroke="#0033CC" strokeWidth="6" />
            <ellipse cx="250" cy="250" rx="130" ry="60" fill="none" stroke="#0033CC" strokeWidth="6" />

            {/* Mountains / Hills */}
            <path
              d="M 100,250 Q 150,220 200,240 Q 250,210 300,235 Q 350,225 400,250 L 400,270 L 100,270 Z"
              fill="#3E2723"
            />
            <path
              d="M 100,250 Q 160,230 220,242 Q 280,225 340,240 Q 380,235 400,250 L 400,265 L 100,265 Z"
              fill="#2E7D32"
              opacity="0.85"
            />

            {/* Lake Hawassa Water */}
            <rect x="100" y="250" width="300" height="150" fill="url(#lake-water)" />
            {/* Water highlights */}
            <line x1="120" y1="265" x2="380" y2="265" stroke="#E0F7FA" strokeWidth="2" opacity="0.7" />
            <line x1="140" y1="280" x2="360" y2="280" stroke="#E0F7FA" strokeWidth="1.5" opacity="0.6" />
            <line x1="160" y1="300" x2="340" y2="300" stroke="#E0F7FA" strokeWidth="1.5" opacity="0.5" />

            {/* Lower Globe Arc in Water */}
            <ellipse cx="250" cy="250" rx="140" ry="85" fill="none" stroke="#0033CC" strokeWidth="6" />
          </g>

          {/* Inner Blue Circle Border Ring & Sight Crosshairs */}
          <circle cx="250" cy="250" r="145" fill="none" stroke="#0033CC" strokeWidth="12" />
          <rect x="100" y="244" width="30" height="12" fill="#0033CC" />
          <rect x="370" y="244" width="30" height="12" fill="#0033CC" />

          {/* Open Book in Center Foreground */}
          <g transform="translate(195, 270)">
            {/* Red / Gold book cover backing */}
            <rect x="0" y="0" width="110" height="65" rx="5" fill="#D32F2F" stroke="#FBC02D" strokeWidth="4" />
            {/* Yellow open book pages */}
            <path
              d="M 8,8 Q 28,14 55,10 Q 82,14 102,8 L 102,56 Q 82,60 55,56 Q 28,60 8,56 Z"
              fill="#FFFDE7"
              stroke="#FBC02D"
              strokeWidth="3"
            />
            {/* Book center spine divider */}
            <line x1="55" y1="10" x2="55" y2="56" stroke="#C2185B" strokeWidth="2.5" />
            {/* Left page text lines */}
            <path d="M 16,20 Q 32,24 48,22" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
            <path d="M 16,30 Q 32,34 48,32" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
            <path d="M 16,40 Q 32,44 48,42" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
            {/* Right page text lines */}
            <path d="M 62,22 Q 78,24 94,20" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
            <path d="M 62,32 Q 78,34 94,30" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
            <path d="M 62,42 Q 78,44 94,40" stroke="#37474F" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Left Laurel Wreath & Enset (False Banana) Plant */}
          <g transform="translate(30, 130)">
            {/* Enset leaves & trunk */}
            <path d="M 22,70 Q 10,40 16,0 Q 25,35 24,70" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1.5" />
            <path d="M 22,70 Q 34,40 28,0 Q 19,35 22,70" fill="#388E3C" stroke="#1B5E20" strokeWidth="1.5" />
            <path d="M 22,70 Q 0,55 2,25 Q 14,48 22,70" fill="#4CAF50" />
            <path d="M 22,70 Q 44,55 42,25 Q 30,48 22,70" fill="#4CAF50" />
            {/* Trunk wrap */}
            <rect x="16" y="65" width="12" height="20" fill="#5D4037" rx="2" />
            {/* Roots */}
            <path d="M 18,85 Q 8,105 4,115 M 22,85 Q 22,110 20,120 M 26,85 Q 36,105 40,115" stroke="#795548" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Right Laurel Wreath & Enset Plant */}
          <g transform="translate(425, 130)">
            {/* Enset leaves & trunk */}
            <path d="M 22,70 Q 10,40 16,0 Q 25,35 24,70" fill="#2E7D32" stroke="#1B5E20" strokeWidth="1.5" />
            <path d="M 22,70 Q 34,40 28,0 Q 19,35 22,70" fill="#388E3C" stroke="#1B5E20" strokeWidth="1.5" />
            <path d="M 22,70 Q 0,55 2,25 Q 14,48 22,70" fill="#4CAF50" />
            <path d="M 22,70 Q 44,55 42,25 Q 30,48 22,70" fill="#4CAF50" />
            {/* Trunk wrap */}
            <rect x="16" y="65" width="12" height="20" fill="#5D4037" rx="2" />
            {/* Roots */}
            <path d="M 18,85 Q 8,105 4,115 M 22,85 Q 22,110 20,120 M 26,85 Q 36,105 40,115" stroke="#795548" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Lower Laurel Wreath leaves along bottom sides */}
          <g fill="#FFFFFF" stroke="#111827" strokeWidth="2">
            {/* Left wreath leaves */}
            <ellipse cx="88" cy="275" rx="8" ry="16" transform="rotate(-30 88 275)" />
            <ellipse cx="80" cy="305" rx="8" ry="16" transform="rotate(-15 80 305)" />
            <ellipse cx="82" cy="335" rx="8" ry="16" transform="rotate(10 82 335)" />
            <ellipse cx="94" cy="365" rx="8" ry="16" transform="rotate(35 94 365)" />
            <ellipse cx="118" cy="392" rx="8" ry="16" transform="rotate(55 118 392)" />

            {/* Right wreath leaves */}
            <ellipse cx="412" cy="275" rx="8" ry="16" transform="rotate(30 412 275)" />
            <ellipse cx="420" cy="305" rx="8" ry="16" transform="rotate(15 420 305)" />
            <ellipse cx="418" cy="335" rx="8" ry="16" transform="rotate(-10 418 335)" />
            <ellipse cx="406" cy="365" rx="8" ry="16" transform="rotate(-35 406 365)" />
            <ellipse cx="382" cy="392" rx="8" ry="16" transform="rotate(-55 382 392)" />
          </g>

          {/* Amharic Text on Top: ሀዋሳ ዩኒቨርሲቲ */}
          <text
            fill="#0022A8"
            fontSize="52"
            fontWeight="bold"
            letterSpacing="6"
            style={{ fontFamily: "'Noto Sans Ethiopic', 'Abyssinica SIL', sans-serif" }}
          >
            <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
              ሀዋሳ ዩኒቨርሲቲ
            </textPath>
          </text>

          {/* English Text on Bottom: HAWASSA UNIVERSITY */}
          <text
            fill="#0022A8"
            fontSize="46"
            fontWeight="900"
            letterSpacing="4"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
              HAWASSA UNIVERSITY
            </textPath>
          </text>

          {/* Foundation Date: ፲፱፻፷፰/1976 */}
          <text
            x="250"
            y="410"
            fill="#1B5E20"
            fontSize="26"
            fontWeight="bold"
            textAnchor="middle"
            style={{ fontFamily: "'Noto Sans Ethiopic', sans-serif" }}
          >
            ፲፱፻፷፰/1976
          </text>
        </svg>
      )}
    </div>
  );
};
