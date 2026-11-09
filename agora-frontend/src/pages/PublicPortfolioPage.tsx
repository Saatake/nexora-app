import { useEffect, useState } from 'react';
import { ArrowUpRight, Code2, FileText, GraduationCap, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '@/api/axios';

type PortfolioProject = { id: number; title: string; summary: string; description: string; category: string; thematicArea: string; imageUrl?: string | null; githubLink?: string | null; fileUrl?: string | null };
type Portfolio = { name: string; course: string; photoUrl?: string | null; slug: string; headline: string; bio: string; skills: string[]; theme: string; projects: PortfolioProject[] };

const palette: Record<string, { background: string; accent: string; soft: string }> = {
  forest: { background: '#f2f7f3', accent: '#0a5c2f', soft: '#e2f0e7' },
  ocean: { background: '#f1f6fb', accent: '#155e9b', soft: '#e0edf8' },
  sunset: { background: '#fbf4f1', accent: '#a34228', soft: '#f5e5df' },
};

const PublicPortfolioPage = () => {
  const { slug = '' } = useParams();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<Portfolio>(`/portfolios/${encodeURIComponent(slug)}`).then((response) => {
      if (active) setPortfolio(response.data);
    }).catch(() => { if (active) setNotFound(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f5f7f5] text-sm text-gray-500">Carregando portfólio...</main>;
  if (notFound || !portfolio) return <main className="grid min-h-screen place-items-center bg-[#f5f7f5] px-6 text-center"><div><h1 className="text-2xl font-bold">Portfólio não encontrado</h1><p className="mt-2 text-gray-600">Esse endereço pode estar incorreto ou a página ainda não foi publicada.</p><Link to="/" className="mt-5 inline-block font-semibold text-[#0a5c2f]">Conheça o Ágora</Link></div></main>;

  const colors = palette[portfolio.theme] ?? palette.forest;
  const initial = portfolio.name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <main style={{ backgroundColor: colors.background }} className="min-h-screen text-[#17231b]">
      <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between"><Link to="/" className="flex items-center gap-2 text-sm font-extrabold tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-xl text-white" style={{ backgroundColor: colors.accent }}>Á</span> Ágora</Link><span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">Portfólio</span></header>

        <section className="relative mt-8 overflow-hidden rounded-[2rem] bg-white p-7 shadow-sm sm:mt-12 sm:p-12">
          <div style={{ backgroundColor: colors.soft }} className="absolute -right-16 -top-24 h-72 w-72 rounded-full opacity-70" />
          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center">
            {portfolio.photoUrl ? <img src={portfolio.photoUrl} alt={portfolio.name} className="h-24 w-24 rounded-3xl object-cover shadow-sm" /> : <div style={{ backgroundColor: colors.accent }} className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl text-3xl font-bold text-white">{initial}</div>}
            <div className="min-w-0"><p style={{ color: colors.accent }} className="text-sm font-bold uppercase tracking-[0.16em]">Olá, eu sou</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">{portfolio.name}</h1><p className="mt-3 max-w-2xl text-lg leading-relaxed text-gray-600">{portfolio.headline}</p>{portfolio.course && <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500"><GraduationCap size={17} />{portfolio.course}</p>}</div>
          </div>
          {portfolio.bio && <p className="relative mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-gray-700">{portfolio.bio}</p>}
        </section>

        {portfolio.skills.length > 0 && <section className="mt-10"><div className="mb-4 flex items-center gap-2"><Sparkles size={18} style={{ color: colors.accent }} /><h2 className="text-xl font-bold">Habilidades e interesses</h2></div><div className="flex flex-wrap gap-2">{portfolio.skills.map((skill) => <span key={skill} style={{ backgroundColor: colors.soft, color: colors.accent }} className="rounded-full px-4 py-2 text-sm font-semibold">{skill}</span>)}</div></section>}

        <section className="mt-12"><div className="mb-6 flex items-end justify-between"><div><p style={{ color: colors.accent }} className="text-xs font-bold uppercase tracking-[0.18em]">Trabalhos selecionados</p><h2 className="mt-2 text-3xl font-black">Projetos</h2></div><span className="text-sm text-gray-500">{portfolio.projects.length} {portfolio.projects.length === 1 ? 'projeto' : 'projetos'}</span></div>
          {portfolio.projects.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white/70 p-10 text-center text-gray-500">Novos projetos serão apresentados aqui.</div> : <div className="grid gap-5 md:grid-cols-2">{portfolio.projects.map((project) => <article key={project.id} className="overflow-hidden rounded-2xl bg-white shadow-sm transition-transform hover:-translate-y-1">
            {project.imageUrl && <img src={project.imageUrl} alt={`Capa do projeto ${project.title}`} className="h-52 w-full object-cover" />}
            <div className="p-6"><div className="mb-3 flex flex-wrap gap-2"><span style={{ color: colors.accent, backgroundColor: colors.soft }} className="rounded-full px-3 py-1 text-xs font-bold">{project.thematicArea}</span><span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">{project.category}</span></div><h3 className="text-xl font-bold">{project.title}</h3><p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-gray-600">{project.summary || project.description}</p><div className="mt-5 flex flex-wrap gap-4">{project.githubLink && <a href={project.githubLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: colors.accent }}><Code2 size={15} /> Código <ArrowUpRight size={14} /></a>}{project.fileUrl && <a href={project.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: colors.accent }}><FileText size={15} /> Material <ArrowUpRight size={14} /></a>}</div></div>
          </article>)}</div>}
        </section>

        <footer className="mt-16 border-t border-black/10 py-6 text-center text-xs text-gray-500">Feito com <Link to="/" className="font-bold" style={{ color: colors.accent }}>Ágora</Link> · projetos acadêmicos e criativos em destaque</footer>
      </div>
    </main>
  );
};

export default PublicPortfolioPage;
