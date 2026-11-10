import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight, Code2, FileText, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { normalizePortfolioDesignSpec } from './types';
import type { Portfolio, PortfolioDesignSpec, PortfolioProject, PortfolioProjectCard } from './types';

const palettes = {
  forest: { paper: '#f2f7f3', accent: '#0a5c2f', tint: '#e2f0e7' },
  ocean: { paper: '#f1f6fb', accent: '#155e9b', tint: '#e0edf8' },
  sunset: { paper: '#fbf4f1', accent: '#a34228', tint: '#f5e5df' },
};

const directions = {
  'classic-editorial': {
    shell: 'max-w-5xl',
    sections: 'space-y-12 @2xl:space-y-16',
    section: 'border-t border-black/10 pt-6 @2xl:grid @2xl:grid-cols-[10rem_minmax(0,1fr)] @2xl:gap-8',
    heading: 'mb-4 @2xl:mb-0',
    projectGrid: 'gap-6',
    card: 'rounded-lg border border-black/10 bg-white',
  },
  'studio-grid': {
    shell: 'max-w-6xl',
    sections: 'space-y-10 @2xl:space-y-12',
    section: 'rounded-xl border border-black/10 bg-white/70 p-4 @2xl:p-8',
    heading: 'mb-5 border-b border-black/10 pb-4',
    projectGrid: 'gap-4 @2xl:grid-cols-2',
    card: 'rounded-lg border border-black/10 bg-white',
  },
  'project-spotlight': {
    shell: 'max-w-6xl',
    sections: 'space-y-14 @2xl:space-y-20',
    section: 'border-t border-black/10 pt-6',
    heading: 'mb-6 @2xl:mb-8',
    projectGrid: 'gap-6 @2xl:grid-cols-2 @2xl:[&>article:first-child]:col-span-full',
    card: 'rounded-xl bg-(--portfolio-tint)',
  },
};

const heroLayouts = {
  stacked: {
    frame: 'grid gap-5 border-b border-black/10 py-8 @2xl:py-12',
    portrait: 'size-16 rounded-full @2xl:size-20',
    content: '',
  },
  split: {
    frame: 'grid gap-6 rounded-xl border border-black/10 bg-white p-6 @xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @xl:items-center @2xl:gap-10 @2xl:p-10',
    portrait: 'aspect-square w-full max-w-40 rounded-lg @xl:max-w-none',
    content: '',
  },
  feature: {
    frame: 'grid gap-6 rounded-xl bg-(--portfolio-tint) p-6 @xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @xl:items-end @2xl:gap-10 @2xl:p-10',
    portrait: 'aspect-[4/3] w-full max-w-56 rounded-md @xl:col-start-2 @xl:row-start-1 @xl:max-w-none',
    content: '@xl:col-start-1 @xl:row-start-1',
  },
};

const typography = {
  editorial: '[&_h1]:font-serif [&_h2]:font-serif [&_h3]:font-serif',
  modern: '[&_h1]:font-["Space_Grotesk",sans-serif] [&_h2]:font-["Space_Grotesk",sans-serif] [&_h3]:font-["Space_Grotesk",sans-serif]',
  mono: '[&_h1]:font-mono [&_h2]:font-mono [&_h3]:font-mono',
};

const imageTreatments = {
  natural: 'object-contain',
  cover: 'object-cover',
  monochrome: 'object-cover grayscale',
};

const cardLayouts = {
  standard: {
    article: '',
    image: 'aspect-[16/10]',
    content: 'p-5 @2xl:p-6',
    title: 'text-xl',
  },
  feature: {
    article: '@2xl:col-span-full',
    image: 'aspect-[16/9] @2xl:aspect-auto @2xl:min-h-64',
    content: 'p-6 @2xl:p-8',
    title: 'text-2xl @2xl:text-3xl',
  },
  compact: {
    article: '@2xl:col-span-full',
    image: 'aspect-[3/1] @xl:aspect-square',
    content: 'p-4 @2xl:p-5',
    title: 'text-lg',
  },
};

const mediaLayouts = {
  standard: '',
  feature: '@2xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]',
  compact: '@xl:grid-cols-[7rem_minmax(0,1fr)]',
};

const linkClass = 'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-bold text-(--portfolio-accent) hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--portfolio-accent)';

function safeWebUrl(value: string | null | undefined): string | undefined {
  if (!value?.trim()) return undefined;

  try {
    const { protocol } = new URL(value, document.baseURI);
    return protocol === 'https:' || protocol === 'http:' ? value : undefined;
  } catch {
    return undefined;
  }
}

function PortfolioHero({ portfolio, layout }: { portfolio: Portfolio; layout: PortfolioDesignSpec['heroLayout'] }) {
  const classes = heroLayouts[layout];
  const photoUrl = safeWebUrl(portfolio.photoUrl);
  const initial = portfolio.name.trim().charAt(0).toUpperCase() || 'Á';

  return (
    <header className={classes.frame}>
      {photoUrl ? (
        <img src={photoUrl} alt={portfolio.name} className={`block object-cover ${classes.portrait}`} />
      ) : (
        <span aria-hidden="true" className={`grid place-items-center bg-(--portfolio-accent) text-4xl font-bold text-white ${classes.portrait}`}>{initial}</span>
      )}
      <div className={`min-w-0 ${classes.content}`}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-(--portfolio-accent)">Olá, eu sou</p>
        <h1 className="mt-2 text-4xl leading-[1.05] font-bold tracking-tight text-balance @2xl:text-5xl @4xl:text-6xl">{portfolio.name}</h1>
        {portfolio.headline && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-pretty text-gray-700">{portfolio.headline}</p>}
        {portfolio.course && (
          <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <GraduationCap size={18} aria-hidden="true" className="shrink-0" />
            {portfolio.course}
          </p>
        )}
      </div>
    </header>
  );
}

function PortfolioSection({ kind, title, direction, meta, children }: {
  kind: PortfolioDesignSpec['sections'][number];
  title: string;
  direction: PortfolioDesignSpec['direction'];
  meta?: ReactNode;
  children: ReactNode;
}) {
  const layout = directions[direction];

  return (
    <section className={layout.section}>
      <div className={layout.heading}>
        {kind === 'projects' && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-(--portfolio-accent)">Trabalhos selecionados</p>}
        <h2 className="text-2xl font-bold tracking-tight text-balance @2xl:text-3xl">{title}</h2>
        {meta}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ProjectCard({ project, variant, treatment, direction }: {
  project: PortfolioProject;
  variant: PortfolioProjectCard['cardVariant'];
  treatment: PortfolioDesignSpec['imageTreatment'];
  direction: PortfolioDesignSpec['direction'];
}) {
  const layout = cardLayouts[variant];
  const imageUrl = safeWebUrl(project.imageUrl);
  const githubLink = safeWebUrl(project.githubLink);
  const fileUrl = safeWebUrl(project.fileUrl);

  return (
    <article className={`grid overflow-hidden ${directions[direction].card} ${layout.article} ${imageUrl ? mediaLayouts[variant] : ''}`}>
      {imageUrl && (
        <div className={`relative overflow-hidden bg-(--portfolio-tint) ${layout.image}`}>
          <img
            src={imageUrl}
            alt={`Capa do projeto ${project.title}`}
            loading="lazy"
            className={`absolute inset-0 size-full ${imageTreatments[treatment]}`}
          />
        </div>
      )}
      <div className={`min-w-0 ${layout.content}`}>
        {(project.thematicArea || project.category) && (
          <ul className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
            {project.thematicArea && <li className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-(--portfolio-accent)">{project.thematicArea}</li>}
            {project.category && <li className="rounded-full bg-black/5 px-3 py-1 text-gray-700">{project.category}</li>}
          </ul>
        )}
        <h3 className={`font-bold tracking-tight text-balance ${layout.title}`}>{project.title}</h3>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-gray-700">{project.summary || project.description}</p>
        {project.contribution && (
          <div className="mt-4 rounded-md border border-black/10 bg-white/65 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-(--portfolio-accent)">Minha contribuição</p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-gray-700">{project.contribution}</p>
          </div>
        )}
        {project.visualSummary && <p className="mt-3 text-xs leading-relaxed text-gray-600">Sobre a imagem: {project.visualSummary}</p>}
        {(githubLink || fileUrl) && (
          <div className="mt-2 flex flex-wrap gap-x-4">
            {githubLink && (
              <a href={githubLink} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <Code2 size={16} aria-hidden="true" /> Código <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <FileText size={16} aria-hidden="true" /> Material <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function PortfolioRenderer({ portfolio }: { portfolio: Portfolio }) {
  const spec = normalizePortfolioDesignSpec(portfolio.designSpec);
  const layout = directions[spec.direction];
  const palette = palettes[spec.colors];
  const style = {
    '--portfolio-paper': palette.paper,
    '--portfolio-accent': palette.accent,
    '--portfolio-tint': palette.tint,
  } as CSSProperties;
  const projectCards = new Map(spec.projectCards.map(({ projectId, cardVariant }) => [projectId, cardVariant]));
  const projectCount = portfolio.projects.length;
  const sections: Record<PortfolioDesignSpec['sections'][number], { title: string; body: ReactNode; meta?: ReactNode }> = {
    about: {
      title: 'Sobre mim',
      body: portfolio.bio && <p className="max-w-2xl text-base leading-8 whitespace-pre-line text-pretty text-gray-700">{portfolio.bio}</p>,
    },
    skills: {
      title: 'Habilidades e interesses',
      body: portfolio.skills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {portfolio.skills.map((skill, index) => (
            <li key={`${index}-${skill}`} className="rounded-full bg-(--portfolio-tint) px-4 py-2 text-sm font-semibold text-(--portfolio-accent)">{skill}</li>
          ))}
        </ul>
      ),
    },
    projects: {
      title: 'Projetos',
      meta: <p className="mt-2 text-sm text-gray-600 tabular-nums">{projectCount} {projectCount === 1 ? 'projeto' : 'projetos'}</p>,
      body: projectCount > 0 ? (
        <div className={`grid ${layout.projectGrid}`}>
          {portfolio.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              direction={spec.direction}
              variant={projectCards.get(project.id) ?? 'standard'}
              treatment={spec.imageTreatment}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-black/20 bg-white/70 p-6 text-sm text-gray-600">Novos projetos serão apresentados aqui.</p>
      ),
    },
  };

  return (
    <div style={style} className="min-w-0 bg-(--portfolio-paper) wrap-anywhere text-(--agora-ink)">
      <div className={`@container mx-auto px-4 py-4 sm:px-8 sm:py-6 ${layout.shell} ${typography[spec.typography]}`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 border-b border-black/10 pb-3 @2xl:mb-10">
          <Link to="/" className={linkClass}>
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-(--portfolio-accent) text-white">Á</span>
            Ágora
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">Portfólio</span>
        </div>
        <PortfolioHero portfolio={portfolio} layout={spec.heroLayout} />
        <div className={`mt-10 @2xl:mt-14 ${layout.sections}`}>
          {spec.sections.map((kind) => {
            const { title, body, meta } = sections[kind];
            return body ? <PortfolioSection key={kind} kind={kind} title={title} direction={spec.direction} meta={meta}>{body}</PortfolioSection> : null;
          })}
        </div>
        <footer className="mt-12 border-t border-black/10 pt-3 pb-4 text-center text-xs text-gray-600 @2xl:mt-16">
          Feito com <Link to="/" className={`${linkClass} text-xs`}>Ágora</Link> · projetos acadêmicos e criativos em destaque
        </footer>
      </div>
    </div>
  );
}
