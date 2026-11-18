import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

const TOTAL_FRAMES = 94;

type FrameSource = HTMLImageElement | ImageBitmap;

type VideoWithRVFC = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: { mediaTime: number }) => void
  ) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

type SparkleParticle = {
  x: number; // 0..1 relativo ao livro aberto
  y: number; // 0..1
  size: number;
  speedY: number;
  driftX: number;
  phase: number;
  warm: boolean;
};

const createParticles = (count: number): SparkleParticle[] =>
  Array.from({ length: count }, (_, i) => ({
    x: 0.34 + ((i * 37) % 100) * 0.0042, // concentrado sobre as páginas/cards (34%..76% X)
    y: 0.22 + ((i * 53) % 100) * 0.0055, // 22%..77% Y
    size: 1.4 + (i % 4) * 0.85,
    speedY: 0.018 + (i % 5) * 0.006,
    driftX: 0.008 + (i % 3) * 0.005,
    phase: i * 1.37,
    warm: i % 3 !== 0, // mistura partículas douradas suaves com toque esmeralda
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
  canvasHeight: number
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

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);
};

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

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (const p of particles) {
    const progressY = (p.y - timeSec * p.speedY) % 0.62;
    const normY = progressY < 0 ? progressY + 0.62 + 0.16 : progressY + 0.16;
    const normX = p.x + Math.sin(timeSec * 0.9 + p.phase) * p.driftX;

    // Fade suave no nascimento/topo e pulsação delicada
    const edgeFade = Math.sin(clamp((normY - 0.16) / 0.62, 0, 1) * Math.PI);
    const twinkle = 0.55 + 0.45 * Math.sin(timeSec * 2.4 + p.phase);
    const alpha = intensity * edgeFade * twinkle * 0.78;
    if (alpha <= 0.02) continue;

    const cx = normX * canvasWidth;
    const cy = normY * canvasHeight;
    const r = p.size * dpr;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.2);
    if (p.warm) {
      grad.addColorStop(0, `rgba(255, 244, 204, ${alpha})`);
      grad.addColorStop(0.45, `rgba(251, 211, 125, ${alpha * 0.55})`);
      grad.addColorStop(1, 'rgba(251, 211, 125, 0)');
    } else {
      grad.addColorStop(0, `rgba(209, 250, 229, ${alpha * 0.9})`);
      grad.addColorStop(0.45, `rgba(74, 222, 128, ${alpha * 0.45})`);
      grad.addColorStop(1, 'rgba(74, 222, 128, 0)');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const buildLoadOrder = (total: number): number[] => {
  const order: number[] = [];
  const seen = new Set<number>();
  for (const step of [4, 2, 1]) {
    for (let i = 2; i <= total; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
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
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const framesRef = useRef<(FrameSource | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const hdMaskRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const particlesRef = useRef<SparkleParticle[]>(createParticles(22));
  const lastDrawnFrameRef = useRef(-1);
  const lastDrawnWasHdRef = useRef(false);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  // Carrega APENAS o frame 1 em JPEG (~45 KB) imediatamente;
  // o restante vem direto do MP4 (~2.9 MB) e só cai para os JPEGs se o navegador não suportar RVFC.
  useEffect(() => {
    let cancelled = false;
    const bitmaps: ImageBitmap[] = [];

    const startJpegFallback = () => {
      const order = buildLoadOrder(TOTAL_FRAMES);
      let pointer = 0;
      const CONCURRENCY = 6;

      const loadNext = () => {
        if (cancelled || pointer >= order.length) return;
        const frameNum = order[pointer++];
        const idx = frameNum - 1;
        if (hdMaskRef.current[idx]) {
          loadNext();
          return;
        }

        const img = new Image();
        img.decoding = 'async';
        img.src = getFrameSrc(frameNum);
        img.onload = () => {
          if (!cancelled && img.naturalWidth > 0 && !hdMaskRef.current[idx]) {
            framesRef.current[idx] = img;
          }
          loadNext();
        };
        img.onerror = loadNext;
      };

      for (let c = 0; c < CONCURRENCY; c++) loadNext();
    };

    // Frame 1 instantâneo (45 KB)
    const firstImg = new Image();
    firstImg.decoding = 'async';
    firstImg.src = getFrameSrc(1);
    firstImg.onload = () => {
      if (!cancelled && firstImg.naturalWidth > 0 && !hdMaskRef.current[0]) {
        framesRef.current[0] = firstImg;
        setFirstFrameReady(true);
        lastDrawnFrameRef.current = -1;
      }
    };

    // Extração HD do MP4 (evita baixar 4.5 MB extras de JPEGs desnecessariamente em produção!)
    const video = document.createElement('video') as VideoWithRVFC;
    video.src = '/hero-book.mp4';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    if (!video.requestVideoFrameCallback) {
      startJpegFallback();
      return () => {
        cancelled = true;
      };
    }

    let rvfcHandle = 0;

    const startExtraction = () => {
      if (cancelled || !video.duration || !Number.isFinite(video.duration)) {
        startJpegFallback();
        return;
      }
      const duration = video.duration;
      video.playbackRate = 2.5;

      const onFrame = async (_now: number, metadata: { mediaTime: number }) => {
        if (cancelled) return;
        const idx = clamp(
          Math.round((metadata.mediaTime / duration) * (TOTAL_FRAMES - 1)),
          0,
          TOTAL_FRAMES - 1
        );

        if (!hdMaskRef.current[idx]) {
          try {
            const bmp = await createImageBitmap(video);
            if (cancelled) {
              bmp.close();
              return;
            }
            bitmaps.push(bmp);
            framesRef.current[idx] = bmp;
            hdMaskRef.current[idx] = true;
            if (idx === 0) setFirstFrameReady(true);
            if (idx === lastDrawnFrameRef.current) {
              lastDrawnFrameRef.current = -1;
            }
          } catch {
            // ignora falha pontual
          }
        }

        if (!cancelled && !video.ended) {
          rvfcHandle = video.requestVideoFrameCallback!(onFrame);
        }
      };

      rvfcHandle = video.requestVideoFrameCallback!(onFrame);
      video.play().catch(() => {
        startJpegFallback();
      });
    };

    video.addEventListener('loadedmetadata', startExtraction, { once: true });
    video.addEventListener('error', startJpegFallback, { once: true });
    video.load();

    return () => {
      cancelled = true;
      if (rvfcHandle && video.cancelVideoFrameCallback) {
        video.cancelVideoFrameCallback(rvfcHandle);
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
      bitmaps.forEach((b) => b.close());
    };
  }, []);

  // Loop 60fps sincronizado com o scroll + brilhos sutis quando o livro está aberto
  useEffect(() => {
    let rafId = 0;
    let targetProgress = 0;
    let smoothProgress = 0;
    let currentDpr = 1;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const syncCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      currentDpr = Math.min(window.devicePixelRatio || 1, 2.25);
      const width = Math.floor(window.innerWidth * currentDpr);
      const height = Math.floor(window.innerHeight * currentDpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        lastDrawnFrameRef.current = -1;
      }
    };

    const updateTargetFromScroll = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      targetProgress = clamp(-rect.top / scrollable, 0, 1);
    };

    const findNearestLoadedFrame = (
      desiredIdx: number
    ): { src: FrameSource | null; idx: number; isHd: boolean } => {
      if (framesRef.current[desiredIdx]) {
        return {
          src: framesRef.current[desiredIdx],
          idx: desiredIdx,
          isHd: hdMaskRef.current[desiredIdx],
        };
      }
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = desiredIdx - offset;
        if (prev >= 0 && framesRef.current[prev]) {
          return { src: framesRef.current[prev], idx: prev, isHd: hdMaskRef.current[prev] };
        }
        const next = desiredIdx + offset;
        if (next < TOTAL_FRAMES && framesRef.current[next]) {
          return { src: framesRef.current[next], idx: next, isHd: hdMaskRef.current[next] };
        }
      }
      return { src: null, idx: -1, isHd: false };
    };

    const tick = (nowMs: number) => {
      const diff = targetProgress - smoothProgress;
      smoothProgress = Math.abs(diff) < 0.0004 ? targetProgress : smoothProgress + diff * 0.15;

      const desiredIdx = clamp(Math.round(smoothProgress * (TOTAL_FRAMES - 1)), 0, TOTAL_FRAMES - 1);
      const { src, idx, isHd } = findNearestLoadedFrame(desiredIdx);

      // Intensidade dos brilhos flutuantes quando o livro está aberto (58% -> 100%)
      const sparkleIntensity = prefersReducedMotion
        ? 0
        : clamp((smoothProgress - 0.58) / 0.25, 0, 1);

      const frameChanged =
        idx !== lastDrawnFrameRef.current || (isHd && !lastDrawnWasHdRef.current);

      if (src && (frameChanged || sparkleIntensity > 0.01)) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d', { alpha: false });
        if (canvas && ctx) {
          drawFrameCover(ctx, src, canvas.width, canvas.height);
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
          }
          lastDrawnFrameRef.current = idx;
          lastDrawnWasHdRef.current = isHd;
        }
      }

      // Coreografia das camadas de texto
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
        const outroOpacity = clamp((smoothProgress - 0.7) / 0.2, 0, 1);
        const outroY = (1 - outroOpacity) * 24;
        outroLayerRef.current.style.opacity = String(outroOpacity);
        outroLayerRef.current.style.transform = `translate3d(0, ${outroY}px, 0)`;
        outroLayerRef.current.style.pointerEvents = outroOpacity > 0.35 ? 'auto' : 'none';
      }

      if (bottomBlendRef.current) {
        const blendOpacity = clamp((smoothProgress - 0.78) / 0.22, 0, 1);
        bottomBlendRef.current.style.opacity = String(blendOpacity);
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${smoothProgress})`;
        progressBarRef.current.style.opacity =
          smoothProgress > 0.01 && smoothProgress < 0.99 ? '1' : '0';
      }

      rafId = window.requestAnimationFrame(tick);
    };

    syncCanvasSize();
    updateTargetFromScroll();
    rafId = window.requestAnimationFrame(tick);

    window.addEventListener('resize', syncCanvasSize, { passive: true });
    window.addEventListener('scroll', updateTargetFromScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', syncCanvasSize);
      window.removeEventListener('scroll', updateTargetFromScroll);
    };
  }, []);

  return (
    <section ref={trackRef} className="relative h-[300vh] bg-[#1a1e1c] text-white">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Primeiro quadro imediato (~45 KB) enquanto carrega */}
        <img
          src="/book-frames/frame-0001.jpg"
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            firstFrameReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Canvas natural (sem filtro que marcava as sombras escuras) + brilhos ao abrir */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

        {/* Sombra sutil no topo para leitura da navbar */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32"
          style={{
            background: 'linear-gradient(to bottom, rgba(16,20,18,0.68) 0%, transparent 100%)',
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

        {/* Transição suave na base para fundir o último frame claro com #f6f8f7 */}
        <div
          ref={bottomBlendRef}
          style={{
            opacity: 0,
            background: 'linear-gradient(to bottom, transparent 0%, #f6f8f7 100%)',
          }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 z-10"
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

        {/* ATO 3 (70% -> 100%): Livro aberto com os cards flutuando à direita + Card compacto à esquerda */}
        <div
          ref={outroLayerRef}
          style={{ opacity: 0 }}
          className="absolute inset-0 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex items-end lg:items-center pointer-events-none"
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

        {/* Linha discreta de progresso */}
        <div
          ref={progressBarRef}
          style={{ opacity: 0, transform: 'scaleX(0)' }}
          className="pointer-events-none absolute bottom-0 inset-x-0 h-[2px] origin-left bg-[#22c55e] z-30 transition-opacity duration-200"
        />
      </div>
    </section>
  );
};

export default ScrollBookHero;
