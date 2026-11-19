import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

const TOTAL_FRAMES = 94;

type FrameSource = HTMLImageElement | ImageBitmap;

type SparkleParticle = {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  phase: number;
  warm: boolean;
};

const createParticles = (count: number): SparkleParticle[] =>
  Array.from({ length: count }, (_, i) => ({
    x: 0.34 + ((i * 37) % 100) * 0.0042,
    y: 0.22 + ((i * 53) % 100) * 0.0055,
    size: 1.4 + (i % 4) * 0.85,
    speedY: 0.018 + (i % 5) * 0.006,
    driftX: 0.008 + (i % 3) * 0.005,
    phase: i * 1.37,
    warm: i % 3 !== 0,
  }));

const getFrameSrc = (index1Based: number) =>
  `/book-frames/frame-${String(index1Based).padStart(4, '0')}.jpg`;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getSourceDimensions = (source: FrameSource): { w: number; h: number } => {
  if ('naturalWidth' in source) {
    return { w: source.naturalWidth || source.width, h: source.naturalHeight || source.height };
  }
  return { w: source.width, h: source.height };
};

const drawFrameCover = (
  ctx: CanvasRenderingContext2D,
  source: FrameSource,
  canvasWidth: number,
  canvasHeight: number,
  alpha = 1,
  lowPower = false
) => {
  const { w: imgWidth, h: imgHeight } = getSourceDimensions(source);
  if (!imgWidth || !imgHeight) return;

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasRatio > imgRatio) {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    offsetY = (canvasHeight - drawHeight) / 2;
  } else {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = lowPower ? 'low' : 'medium';
  ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);
  ctx.restore();
};

const createSparkleSprite = (warm: boolean): HTMLCanvasElement => {
  const size = 48;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  if (g) {
    const r = size / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    if (warm) {
      grad.addColorStop(0, 'rgba(255, 244, 204, 1)');
      grad.addColorStop(0.45, 'rgba(251, 211, 125, 0.55)');
      grad.addColorStop(1, 'rgba(251, 211, 125, 0)');
    } else {
      grad.addColorStop(0, 'rgba(209, 250, 229, 0.9)');
      grad.addColorStop(0.45, 'rgba(74, 222, 128, 0.45)');
      grad.addColorStop(1, 'rgba(74, 222, 128, 0)');
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  return c;
};

let warmSpriteCache: HTMLCanvasElement | null = null;
let greenSpriteCache: HTMLCanvasElement | null = null;

const drawAmbientSparkles = (
  ctx: CanvasRenderingContext2D,
  particles: SparkleParticle[],
  timeSec: number,
  intensity: number,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number
) => {
  if (intensity <= 0.01) return;

  if (!warmSpriteCache) warmSpriteCache = createSparkleSprite(true);
  if (!greenSpriteCache) greenSpriteCache = createSparkleSprite(false);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (const p of particles) {
    const progressY = (p.y - timeSec * p.speedY) % 0.62;
    const normY = progressY < 0 ? progressY + 0.62 + 0.16 : progressY + 0.16;
    const normX = p.x + Math.sin(timeSec * 0.9 + p.phase) * p.driftX;

    const edgeFade = Math.sin(clamp((normY - 0.16) / 0.62, 0, 1) * Math.PI);
    const twinkle = 0.55 + 0.45 * Math.sin(timeSec * 2.4 + p.phase);
    const alpha = intensity * edgeFade * twinkle * 0.78;
    if (alpha <= 0.02) continue;

    const radius = p.size * dpr * 3.2;
    const cx = normX * canvasWidth - radius;
    const cy = normY * canvasHeight - radius;

    ctx.globalAlpha = alpha;
    ctx.drawImage(p.warm ? warmSpriteCache : greenSpriteCache, cx, cy, radius * 2, radius * 2);
  }

  ctx.restore();
};

const buildLoadOrder = (total: number, mobileMode = false): number[] => {
  const order: number[] = [];
  const seen = new Set<number>();
  const steps = mobileMode ? [8, 4, 2] : [8, 4, 2, 1];
  for (const step of steps) {
    for (let i = 1; i <= total; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  if (!seen.has(total)) {
    order.push(total);
  }
  return order;
};

const ScrollBookHero = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introLayerRef = useRef<HTMLDivElement>(null);
  const leftScrimRef = useRef<HTMLDivElement>(null);
  const outroLayerRef = useRef<HTMLDivElement>(null);
  const bottomBlendRef = useRef<HTMLDivElement>(null);
  const endVeilRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const framesRef = useRef<(FrameSource | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const particlesRef = useRef<SparkleParticle[]>(createParticles(22));
  const lastRenderKeyRef = useRef('');
  const scheduleTickRef = useRef<() => void>(() => {});
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobileView(mq.matches);
    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Pré-carrega os quadros apenas no desktop (no mobile exibe imagem estática de alta qualidade do livro aberto)
  useEffect(() => {
    if (isMobileView) return;
    let cancelled = false;
    const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    const allocatedBitmaps: ImageBitmap[] = [];

    const decodeFrame = async (img: HTMLImageElement): Promise<FrameSource> => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode();
        }
      } catch {
        // ignore decode warning
      }
      if (isMobile && typeof createImageBitmap === 'function') {
        try {
          const bmp = await createImageBitmap(img, {
            resizeWidth: 854,
            resizeHeight: 480,
            resizeQuality: 'low',
          });
          allocatedBitmaps.push(bmp);
          return bmp;
        } catch {
          return img;
        }
      }
      return img;
    };

    // Carrega o frame 1 prioritariamente para exibição imediata
    const img1 = new Image();
    img1.decoding = 'async';
    img1.src = getFrameSrc(1);
    img1.onload = () => {
      void decodeFrame(img1).then((source) => {
        if (cancelled) return;
        framesRef.current[0] = source;
        setFirstFrameReady(true);
        lastRenderKeyRef.current = '';
        scheduleTickRef.current();
      });
    };

    const loadOrder = buildLoadOrder(TOTAL_FRAMES, isMobile);
    let pointer = 0;
    const concurrency = isMobile ? 4 : 6;

    const loadNext = () => {
      if (cancelled || pointer >= loadOrder.length) return;
      const frameNum = loadOrder[pointer++];
      const idx = frameNum - 1;
      if (framesRef.current[idx]) {
        loadNext();
        return;
      }
      const img = new Image();
      img.decoding = 'async';
      img.src = getFrameSrc(frameNum);
      img.onload = () => {
        if (cancelled || img.naturalWidth <= 0) {
          loadNext();
          return;
        }
        void decodeFrame(img).then((source) => {
          if (!cancelled) {
            framesRef.current[idx] = source;
            if (idx === 0) setFirstFrameReady(true);
            lastRenderKeyRef.current = '';
            scheduleTickRef.current();
          }
          loadNext();
        });
      };
      img.onerror = () => {
        loadNext();
      };
    };

    for (let c = 0; c < concurrency; c++) {
      loadNext();
    }

    return () => {
      cancelled = true;
      for (const bmp of allocatedBitmaps) {
        try {
          bmp.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isMobileView]);

  // Loop sob demanda no desktop (no mobile não roda loop de scroll)
  useEffect(() => {
    if (isMobileView) return;
    let rafId = 0;
    let targetProgress = 0;
    let smoothProgress = 0;
    let lastTimestamp = performance.now();
    let currentDpr = 1;
    let lastViewportW = 0;
    let lastViewportH = 0;
    let isHeroVisible = true;
    const isMobile = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const syncCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // No mobile, ignora variações pequenas de altura causadas pela barra de endereço ao rolar
      if (
        isMobile &&
        lastViewportW > 0 &&
        vw === lastViewportW &&
        Math.abs(vh - lastViewportH) < 150
      ) {
        return;
      }

      lastViewportW = vw;
      lastViewportH = vh;
      currentDpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.floor(vw * currentDpr);
      const height = Math.floor(vh * currentDpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        lastRenderKeyRef.current = '';
      }
    };

    const findNearest = (idx: number): { src: FrameSource | null; actualIdx: number } => {
      if (framesRef.current[idx]) return { src: framesRef.current[idx], actualIdx: idx };
      for (let d = 1; d < TOTAL_FRAMES; d++) {
        if (idx - d >= 0 && framesRef.current[idx - d]) {
          return { src: framesRef.current[idx - d], actualIdx: idx - d };
        }
        if (idx + d < TOTAL_FRAMES && framesRef.current[idx + d]) {
          return { src: framesRef.current[idx + d], actualIdx: idx + d };
        }
      }
      return { src: null, actualIdx: -1 };
    };

    let lastSparkleDrawMs = 0;

    const tick = (nowMs: number) => {
      rafId = 0;
      const dt = Math.min(0.05, Math.max(0.001, (nowMs - lastTimestamp) / 1000));
      lastTimestamp = nowMs;

      // Em mobile acompanha o dedo de forma mais direta; no desktop mantém amortecimento sedoso
      const smoothing = isMobile ? 1 - Math.exp(-26 * dt) : 1 - Math.exp(-12 * dt);
      const diff = targetProgress - smoothProgress;
      const isScrolling = Math.abs(diff) >= 0.0004;
      smoothProgress = isScrolling ? smoothProgress + diff * smoothing : targetProgress;

      const exactFrame = clamp(smoothProgress * (TOTAL_FRAMES - 1), 0, TOTAL_FRAMES - 1);
      const targetIdx = Math.round(exactFrame);
      const currentFrame = findNearest(targetIdx);

      const sparkleIntensity =
        prefersReducedMotion || isMobile
          ? 0
          : clamp((smoothProgress - 0.58) / 0.25, 0, 1);

      const renderKey = `${currentFrame.actualIdx}:${canvasRef.current?.width}x${canvasRef.current?.height}`;
      const frameChanged = renderKey !== lastRenderKeyRef.current;
      const shouldRedrawSparkles =
        sparkleIntensity > 0.01 && (isScrolling || nowMs - lastSparkleDrawMs >= 42);

      if (currentFrame.src && (frameChanged || shouldRedrawSparkles)) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d', { alpha: false });
        if (canvas && ctx) {
          drawFrameCover(ctx, currentFrame.src, canvas.width, canvas.height, 1, isMobile || isScrolling);

          if (sparkleIntensity > 0.01) {
            drawAmbientSparkles(
              ctx,
              particlesRef.current,
              nowMs * 0.001,
              sparkleIntensity,
              canvas.width,
              canvas.height,
              currentDpr
            );
            lastSparkleDrawMs = nowMs;
          }

          lastRenderKeyRef.current = renderKey;
        }
      }

      // Coreografia das camadas
      const introOpacity = clamp(1 - smoothProgress / 0.25, 0, 1);
      if (introLayerRef.current) {
        const introY = -smoothProgress * 64;
        introLayerRef.current.style.opacity = String(introOpacity);
        introLayerRef.current.style.transform = `translate3d(0, ${introY}px, 0)`;
        introLayerRef.current.style.pointerEvents = introOpacity > 0.25 ? 'auto' : 'none';
      }
      if (leftScrimRef.current) {
        leftScrimRef.current.style.opacity = String(introOpacity);
      }

      if (scrollHintRef.current) {
        const hintOpacity = clamp(1 - smoothProgress / 0.1, 0, 1);
        scrollHintRef.current.style.opacity = String(hintOpacity);
      }

      if (outroLayerRef.current) {
        const outroOpacity = clamp((smoothProgress - 0.68) / 0.2, 0, 1);
        const outroY = (1 - outroOpacity) * 24;
        outroLayerRef.current.style.opacity = String(outroOpacity);
        outroLayerRef.current.style.transform = `translate3d(0, ${outroY}px, 0)`;
        outroLayerRef.current.style.pointerEvents = outroOpacity > 0.35 ? 'auto' : 'none';
      }

      // Fusão progressiva longa e sedosa com o fundo #f6f8f7 do resto da página
      if (bottomBlendRef.current) {
        const blendOpacity = clamp((smoothProgress - 0.55) / 0.42, 0, 1);
        bottomBlendRef.current.style.opacity = String(blendOpacity);
      }
      if (endVeilRef.current) {
        const veilOpacity = clamp((smoothProgress - 0.88) / 0.12, 0, 1) * 0.22;
        endVeilRef.current.style.opacity = String(veilOpacity);
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${smoothProgress})`;
        progressBarRef.current.style.opacity =
          smoothProgress > 0.01 && smoothProgress < 0.96 ? '1' : '0';
      }

      const needsMoreFrames =
        isHeroVisible &&
        (Math.abs(targetProgress - smoothProgress) >= 0.0004 || sparkleIntensity > 0.01);

      if (needsMoreFrames) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      if (rafId === 0 && isHeroVisible) {
        lastTimestamp = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    scheduleTickRef.current = scheduleTick;

    const updateTargetFromScroll = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      isHeroVisible = rect.bottom > -100 && rect.top < window.innerHeight + 100;
      const scrollable = Math.max(1, rect.height - (lastViewportH || window.innerHeight));
      targetProgress = clamp(-rect.top / scrollable, 0, 1);
      scheduleTick();
    };

    const handleResize = () => {
      syncCanvasSize();
      updateTargetFromScroll();
      scheduleTick();
    };

    syncCanvasSize();
    updateTargetFromScroll();
    scheduleTick();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', updateTargetFromScroll, { passive: true });

    return () => {
      scheduleTickRef.current = () => {};
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateTargetFromScroll);
    };
  }, [isMobileView]);

  // Em dispositivos móveis, exibe uma imagem estática de alta qualidade do livro aberto (sem trilha longa de scroll nem esticamento vertical)
  if (isMobileView) {
    return (
      <section className="relative min-h-[100svh] bg-[#141917] text-white overflow-hidden flex flex-col justify-between pt-24 pb-12">
        {/* Imagem de alta qualidade do livro aberto com os cards flutuantes e partículas douradas */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src="/book-frames/frame-0082.jpg"
            alt="Livro Ágora aberto com projetos acadêmicos"
            className="h-full w-full object-cover object-[70%_38%] scale-[1.03]"
          />
          {/* Vinhetas suaves para leitura impecável e transição com a seção clara abaixo */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(16,22,19,0.78) 0%, rgba(16,22,19,0.32) 38%, rgba(16,22,19,0.72) 78%, #f6f8f7 100%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-xl px-5 my-auto space-y-5 pt-16 pb-8">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-sm"
            style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
          >
            Onde trabalhos acadêmicos ganham{' '}
            <span className="text-[#4ade80]">visibilidade real.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200/95 leading-relaxed">
            Publique TCCs, UPXs e iniciações científicas, receba avaliações de professores e
            transforme o que você construiu na faculdade em vitrine.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#052e16] px-5 py-3.5 text-sm font-bold shadow-lg transition-colors"
            >
              Começar gratuitamente
              <ArrowRight size={17} />
            </Link>
            <a
              href="#projetos"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-black/35 backdrop-blur-xs text-white px-5 py-3.5 text-sm font-semibold transition-colors"
            >
              Ver destaques
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={trackRef} className="relative h-[320vh] bg-[#f6f8f7] text-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#1a1e1c]">
        {/* Primeiro quadro imediato enquanto carrega */}
        <img
          src="/book-frames/frame-0001.jpg"
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            firstFrameReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Canvas com crossfade óptico entre quadros + brilhos flutuantes */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

        {/* Sombra sutil no topo para leitura da navbar */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32"
          style={{
            background: 'linear-gradient(to bottom, rgba(16,20,18,0.65) 0%, transparent 100%)',
          }}
        />

        {/* Vinheta lateral esquerda apenas nos quadros iniciais */}
        <div
          ref={leftScrimRef}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 20% 50%, rgba(14,18,16,0.72) 0%, rgba(14,18,16,0.32) 48%, transparent 78%)',
          }}
        />

        {/* Véu atmosférico muito sutil nos últimos 12% do scroll */}
        <div
          ref={endVeilRef}
          style={{ opacity: 0 }}
          className="pointer-events-none absolute inset-0 bg-[#f6f8f7] z-10"
        />

        {/* Degradê alto e multi-paradas para fundir sem nenhuma linha divisória com o resto da página */}
        <div
          ref={bottomBlendRef}
          style={{
            opacity: 0,
            background:
              'linear-gradient(to bottom, rgba(246,248,247,0) 0%, rgba(246,248,247,0.16) 32%, rgba(246,248,247,0.52) 64%, rgba(246,248,247,0.88) 86%, #f6f8f7 100%)',
          }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 sm:h-72 z-10"
        />

        {/* ATO 1 (0% -> 25%): Livro fechado "projetos" + Chamada principal à esquerda */}
        <div
          ref={introLayerRef}
          className="absolute inset-0 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-10 flex flex-col justify-between"
        >
          <div className="max-w-xl space-y-5 my-auto">
            <h1
              className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight leading-[1.06] text-white drop-shadow-sm"
              style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
            >
              Onde trabalhos acadêmicos ganham{' '}
              <span className="text-[#4ade80]">visibilidade real.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200/90 max-w-md leading-relaxed">
              Publique TCCs, UPXs e iniciações científicas, receba avaliações de professores e
              transforme o que você construiu na faculdade em vitrine.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#052e16] px-6 py-3.5 text-sm font-bold shadow-lg transition-colors"
              >
                Começar gratuitamente
                <ArrowRight size={17} />
              </Link>
              <a
                href="#projetos"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/25 hover:bg-black/40 backdrop-blur-xs text-white px-5 py-3.5 text-sm font-semibold transition-colors"
              >
                Ver destaques
              </a>
            </div>
          </div>

          <div
            ref={scrollHintRef}
            className="self-center inline-flex flex-col items-center gap-1 text-xs font-medium text-white/80"
          >
            <span className="tracking-wide">Role para abrir os projetos</span>
            <ChevronDown size={18} className="animate-bounce text-[#4ade80]" />
          </div>
        </div>

        {/* ATO 3 (68% -> 100%): Livro aberto com os cards flutuando à direita + Card compacto à esquerda */}
        <div
          ref={outroLayerRef}
          style={{ opacity: 0 }}
          className="absolute inset-0 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24 flex items-end lg:items-center pointer-events-none"
        >
          <div className="max-w-md rounded-2xl border border-white/15 bg-[#141a17]/82 backdrop-blur-md p-6 sm:p-7 shadow-2xl space-y-4">
            <h2
              className="text-2xl sm:text-3xl font-bold text-white leading-tight tracking-tight"
              style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
            >
              Tire seus projetos do papel e dê vida à sua trajetória.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Cada trabalho publicado recebe feedback estruturado dos docentes, soma pontos no
              ranking e constrói seu acervo acadêmico no Ágora.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#052e16] px-5 py-3 text-sm font-bold transition-colors"
              >
                Publicar meu projeto
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white px-4 py-3 text-sm font-semibold transition-colors"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>

        {/* Linha discreta de progresso (some antes do final para não marcar a transição) */}
        <div
          ref={progressBarRef}
          style={{ opacity: 0, transform: 'scaleX(0)' }}
          className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] origin-left bg-[#22c55e] z-30 transition-opacity duration-300"
        />
      </div>
    </section>
  );
};

export default ScrollBookHero;
