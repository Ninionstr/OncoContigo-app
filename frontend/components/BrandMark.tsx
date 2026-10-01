/** Símbolo de marca: corazón abrazado por dos arcos (cuidado y acompañamiento). */
export function BrandMark({
  className = '',
  variant = 'color',
}: {
  className?: string;
  /** `light` usa el arco superior en blanco, para fondos azules. */
  variant?: 'color' | 'light';
}) {
  return (
    <svg viewBox="0 0 300 300" className={className} role="img" aria-label="OncoContigo">
      <g transform="translate(150,150)" fill="none" strokeLinecap="round">
        <path
          d="M -78 -10 A 78 78 0 0 1 78 -10"
          stroke={variant === 'light' ? '#FFFFFF' : '#2B7DB8'}
          strokeWidth="17"
        />
        <path d="M -58 18 A 58 58 0 0 0 58 18" stroke="#7BB89A" strokeWidth="15" />
        <path
          d="M 0 38 C -10 18 -40 14 -40 -10 C -40 -28 -22 -34 -10 -26 C -4 -22 0 -14 0 -14 C 0 -14 4 -22 10 -26 C 22 -34 40 -28 40 -10 C 40 14 10 18 0 38 Z"
          fill="#F2856B"
        />
      </g>
    </svg>
  );
}
