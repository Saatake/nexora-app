import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Download,
  Eye,
  FolderKanban,
  GraduationCap,
  Layers,
  Menu,
  Star,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
import AgoraLogo from '@/components/AgoraLogo';
import RoleBadge from '@/components/RoleBadge';
import ScrollBookHero from '@/features/home/components/ScrollBookHero';
import { featuredProjects } from '@/features/home/constants/featuredProjects';

const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Sobre', href: '#sobre' },
    { label: 'Recursos', href: '#recursos' },
    { label: 'Projetos', href: '#projetos' },
    { label: 'Como funciona', href: '#como-funciona' },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-[#141c18] selection:bg-[#22c55e]/20">
      {/* Top Header flutuante sobre a animação em tela cheia */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'border-b border-white/10 bg-[#171e1b]/92 backdrop-blur-md shadow-sm'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="focus:outline-none">
            <AgoraLogo size="md" className="text-white" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-[#052e16] px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Criar conta
              <ArrowRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#171e1b] px-4 py-4 space-y-3 shadow-xl">
            <div className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-semibold text-white border border-white/15 rounded-xl hover:bg-white/10"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-[#052e16] bg-[#22c55e] rounded-xl hover:bg-[#16a34a]"
              >
                Criar conta
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero em tela cheia com animação do livro guiada pelo scroll */}
      <ScrollBookHero />

      {/* Recursos */}
      <section id="recursos" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-2xl mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
          >
            Feito para valorizar o que você constrói na universidade
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Estrutura pensada para alunos documentarem melhor e professores avaliarem com clareza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Layers,
              title: 'Documentação Rica',
              desc: 'Estruture projetos com blocos visuais, imagens, PDFs, links de repositório e participação detalhada da equipe.',
            },
            {
              icon: GraduationCap,
              title: 'Avaliação Docente',
              desc: 'Receba notas por critério e comentários construtivos diretamente dos professores das áreas temáticas.',
            },
            {
              icon: Trophy,
              title: 'Ranking e Selos',
              desc: 'Trabalhos bem avaliados conquistam selos acadêmicos e posição de destaque no ranking da instituição.',
            },
            {
              icon: FolderKanban,
              title: 'Histórico Centralizado',
              desc: 'Reúna desde projetos de primeiro semestre e UPXs até o TCC em um perfil acadêmico organizado.',
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-[#0a5c2f]/40 transition-colors"
              >
                <div className="h-11 w-11 rounded-xl bg-[#f0fdf4] border border-[#0a5c2f]/15 flex items-center justify-center text-[#0a5c2f] mb-5">
                  <Icon size={20} />
                </div>
                <h3
                  className="text-lg font-bold text-slate-900 mb-2"
                  style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Projetos em Destaque (Mockados) */}
      <section id="projetos" className="bg-white border-y border-slate-200/80 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
                style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
              >
                Projetos em destaque
              </h2>
              <p className="mt-1.5 text-base text-slate-600">
                Exemplos de trabalhos acadêmicos publicados na plataforma.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a5c2f] hover:text-[#084925] transition-colors"
            >
              Entrar para explorar todos
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                to="/login"
                className="group flex flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_4px_24px_rgba(10,92,47,0.08)] overflow-hidden transition-colors duration-200 hover:border-[#0a5c2f]/50"
              >
                <div className="h-40 w-full bg-[#f5f6f8] overflow-hidden flex-shrink-0">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0fdf4] text-[#0a5c2f]">
                      {project.category}
                    </span>
                    <span className="flex items-center gap-1 text-base font-bold text-amber-500 flex-shrink-0">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      {project.averageGrade.toFixed(1)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold leading-snug text-[#1a1a1a] group-hover:text-[#0a5c2f] transition-colors mb-2 line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#6b7280] line-clamp-2 flex-1">
                    {project.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#0a5c2f] flex items-center justify-center text-white font-bold text-xs">
                        {project.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-[#6b7280] truncate max-w-[120px]">
                        {project.authorName}
                      </span>
                      <RoleBadge role={project.authorRoleType} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={13} />
                        {new Intl.NumberFormat('pt-BR').format(project.viewCount)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Download size={13} />
                        {new Intl.NumberFormat('pt-BR').format(project.downloadCount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-2xl mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
          >
            Como funciona
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Do envio do trabalho ao feedback dos professores em três etapas simples.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: Upload,
              title: 'Publique seu trabalho',
              desc: 'Cadastre título, resumo, área temática, equipe orientadora e anexe documentos ou imagens do projeto.',
            },
            {
              step: '02',
              icon: Star,
              title: 'Receba parecer qualificado',
              desc: 'Docentes da área avaliam o projeto em cinco critérios acadêmicos e registram feedbacks construtivos.',
            },
            {
              step: '03',
              icon: Award,
              title: 'Destaque sua trajetória',
              desc: 'Acompanhe métricas de evolução no dashboard, conquiste selos e compartilhe suas produções.',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-xs"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#0a5c2f] text-white flex items-center justify-center">
                    <Icon size={22} />
                  </div>
                  <span
                    className="text-3xl font-bold text-slate-200 select-none"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold text-slate-900 mb-2.5"
                  style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sobre o Ágora / Nossa Missão */}
      <section id="sobre" className="bg-white border-t border-slate-200/80 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6"
            style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
          >
            Sobre o Ágora
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-medium">
            “Nossa missão é facilitar o acesso a feedback qualificado, promovendo a evolução
            contínua dos projetos universitários através de uma plataforma moderna e intuitiva.”
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-white pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#171e1b] text-white px-6 py-12 sm:px-12 sm:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 90% 50%, rgba(34, 197, 94, 0.35), transparent 55%)',
            }}
          />
          <div className="relative z-10 max-w-xl space-y-3">
            <h2
              className="text-2xl sm:text-4xl font-bold tracking-tight"
              style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
            >
              Pronto para publicar seu próximo projeto?
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Crie sua conta acadêmica como aluno ou professor e faça parte da comunidade Ágora.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#052e16] px-6 py-3.5 text-sm font-bold transition-colors"
            >
              Criar minha conta
              <ArrowRight size={17} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 text-sm font-semibold transition-colors"
            >
              Já tenho cadastro
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#121815] text-slate-400 border-t border-white/10 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <AgoraLogo size="md" className="text-white" />
          <p className="text-xs font-medium text-slate-500">
            © {new Date().getFullYear()} Ágora — Plataforma Acadêmica de Projetos. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
