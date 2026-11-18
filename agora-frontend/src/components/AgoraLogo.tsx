type AgoraLogoProps = {
  collapsed?: boolean;
  size?: 'md' | 'lg';
  className?: string;
};

const AgoraLogo = ({ collapsed = false, size = 'lg', className = '' }: AgoraLogoProps) => {
  const isMd = size === 'md';

  return (
    <div className={`inline-flex items-end justify-center select-none ${className}`}>
      {/* Monograma "Á" em fita dobrada (cor herdada + verde esmeralda) */}
      <svg
        viewBox="0 0 38 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${isMd ? 'h-[36px]' : 'h-[48px]'} w-auto flex-shrink-0`}
        aria-hidden="true"
      >
        {/* Acento agudo esmeralda */}
        <path d="M21 1.5H26.8L22.2 7.5H16.4L21 1.5Z" fill="#22c55e" />

        {/* Dobra interna da fita (verde mais profundo para dar profundidade) */}
        <path d="M10.4 38L23.2 22.8L25.6 28.4L14.2 38H10.4Z" fill="#15803d" />

        {/* Perna direita da fita dobrada (verde esmeralda vibrante) */}
        <path d="M17.8 10H23.6L34 38H27.4L17.8 10Z" fill="#22c55e" />

        {/* Perna esquerda da fita (usa currentColor para funcionar no claro e no escuro) */}
        <path d="M16.2 10H22L10.4 38H4L16.2 10Z" fill="currentColor" />
      </svg>

      {/* "gora" integrado formando "Ágora", deslizando ao recolher */}
      <span
        className={`font-bold ${
          isMd ? 'text-[31px] -mb-[5px]' : 'text-[42px] -mb-[7px]'
        } leading-[1.15] tracking-[-0.02em] text-current whitespace-nowrap overflow-hidden transition-[max-width,opacity,transform] duration-[280ms] ease-[cubic-bezier(0.2,0,0,1)] ${
          collapsed
            ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
            : isMd
              ? 'max-w-[110px] opacity-100 translate-x-0'
              : 'max-w-[135px] opacity-100 translate-x-0'
        }`}
        style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
      >
        gora
      </span>
    </div>
  );
};

export default AgoraLogo;
