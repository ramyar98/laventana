import { memo } from 'react';

/* Precomputed geometry for static flag elements to avoid per-render allocation. */
const KURDISTAN_RAYS = Array.from({ length: 21 }, (_, i) => {
  const a = (i * 2 * Math.PI) / 21;
  return {
    key: i,
    x1: Math.sin(a) * 3.2,
    y1: -Math.cos(a) * 3.2,
    x2: Math.sin(a) * 5.5,
    y2: -Math.cos(a) * 5.5,
  };
});

const USA_STRIPES = Array.from({ length: 13 }, (_, i) => ({
  key: i,
  y: i * (20 / 13),
  fill: i % 2 === 0 ? '#B22234' : '#FFFFFF',
}));

const USA_STARS = Array.from({ length: 50 }, (_, i) => {
  const row = Math.floor(i / 5);
  const col = i % 5;
  return {
    key: i,
    cx: 0.9 + col * 2.4 + (row % 2 === 0 ? 1.2 : 0),
    cy: 1.05 + row * 1.9,
  };
});

function Flag({ code, className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 30 20" className={className} xmlns="http://www.w3.org/2000/svg" aria-label={`Flag ${code}`} role="img">
      {renderFlag(code)}
    </svg>
  );
}

function Star({ x, y, size = 1, fill = '#FFFFFF' }) {
  const pts = Array.from({ length: 10 }).map((_, i) => {
    const r = i % 2 === 0 ? size : size * 0.4;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
  }).join(' ');
  return <polygon points={pts} fill={fill} />;
}

function renderFlag(code) {
  switch (code) {
    case 'kurdistan':
      return (
        <g>
          <rect width="30" height="6.67" fill="#ED2024" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#239E3A" />
          <g transform="translate(15 10)">
            <circle r="3.2" fill="#FDBB30" />
            {KURDISTAN_RAYS.map((r) => (
              <line key={r.key} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#FDBB30" strokeWidth="1" strokeLinecap="round" />
            ))}
          </g>
        </g>
      );
    case 'iraq':
      return (
        <g>
          <rect width="30" height="6.67" fill="#CE1126" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#141414" />
          <text x="15" y="11.7" textAnchor="middle" fontSize="6.5" fill="#007A3D" fontWeight="bold" fontFamily="Segoe UI, Arial">
            الله أكبر
          </text>
        </g>
      );
    case 'iran':
      return (
        <g>
          <rect width="30" height="6.67" fill="#239F40" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#DA0000" />
          <g transform="translate(15 10)">
            <path
              d="M-1.9-2.6h3.8v1.4h-1.9v1.2c.8.4 1.2 1 1.2 1.8v.4c-.8.3-1.6.3-2.4 0-.2-.4-.4-.7-.7-.9-.3.2-.6.6-.7 1v.1c-1 .4-2 .2-2.6-.6l.6-.7c.5.6 1.3.7 1.8.4-.1-.3-.2-.7 0-.9.2-.3.4-.5.6-.7h-1.6v-1.2h3.9zM0-3.2c.7 0 1.2.5 1.2 1.2s-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2S-.7-3.2 0-3.2z"
              fill="#DA0000"
            />
          </g>
        </g>
      );
    case 'usa':
      return (
        <g>
          {USA_STRIPES.map((s) => (
            <rect key={s.key} y={s.y} width="30" height={20 / 13} fill={s.fill} />
          ))}
          <rect width="13" height="10.4" fill="#3C3B6E" />
          {USA_STARS.map((s) => (
            <circle key={s.key} cx={s.cx} cy={s.cy} r="0.5" fill="#FFFFFF" />
          ))}
        </g>
      );
    case 'turkey':
      return (
        <g>
          <rect width="30" height="20" fill="#E30A17" />
          <circle cx="11.5" cy="10" r="5.2" fill="#FFFFFF" />
          <circle cx="13.3" cy="10" r="4.2" fill="#E30A17" />
          <Star x={20} y={10} size={2.6} />
        </g>
      );
    default:
      return <rect width="30" height="20" fill="#9CA3AF" />;
  }
}

export default memo(Flag);