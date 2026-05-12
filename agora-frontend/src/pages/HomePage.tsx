import { Link } from 'react-router-dom';
import { Upload, Star, TrendingUp, ArrowRight, Menu, X, Library } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo-icon.png';
import logoIcon from '../assets/logo-icon.png';

const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const featuredProjects = [
    {
      id: 1,
      category: 'TCC',
      title: 'Sistema de Gestão Acadêmica com IA',
      course: 'Engenharia de Software',
      description: 'Desenvolvimento de um sistema de gestão acadêmica utilizando inteligência artificial para...',
      views: 1243,
      rating: 9.5,
      tags: ['IA', 'Web']
    },
    {
      id: 2,
      category: 'UPX',
      title: 'Aplicativo Mobile para Monitoramento de Saúde',
      course: 'Ciência da Computação',
      description: 'App mobile para monitoramento de indicadores de saúde com integração IoT.',
      views: 856,
      rating: 8.8,
      tags: ['Mobile', 'React Native']
    },
    {
      id: 3,
      category: 'TCC',
      title: 'Plataforma de E-commerce Sustentável',
      course: 'Sistemas de Informação',
      description: 'E-commerce focado em produtos sustentáveis com sistema de recompensas ecológicas.',
      views: 1567,
      rating: 9.2,
      tags: ['Web', 'E-commerce']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header - Alinhado ao Estilo Corporativo/Acadêmico */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Ágora" 
                className="h-12 sm:h-16 transition-transform hover:scale-105"
              />
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#sobre" className="text-gray-600 hover:text-[#18915b] transition-colors font-semibold text-sm uppercase tracking-wider">
                Sobre
              </a>
              <a href="#projetos" className="text-gray-600 hover:text-[#18915b] transition-colors font-semibold text-sm uppercase tracking-wider">
                Projetos
              </a>
              <a href="#como-funciona" className="text-gray-600 hover:text-[#18915b] transition-colors font-semibold text-sm uppercase tracking-wider">
                Como Funciona
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="bg-[#0a5c2f] hover:bg-[#084925] text-white px-6 py-2 rounded font-bold transition-all shadow-md active:scale-95 text-sm"
              >
                ENTRAR
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4 bg-white">
              <a 
                href="#sobre" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-[#0a5c2f] font-bold py-2 text-center"
              >
                Sobre
              </a>
              <a 
                href="#projetos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-[#0a5c2f] font-bold py-2 text-center"
              >
                Projetos
              </a>
              <a 
                href="#como-funciona" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-[#0a5c2f] font-bold py-2 text-center"
              >
                Como Funciona
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section - Fundo Escuro como o Overlay da AuthPage */}
      <section className="bg-[#2b353a] text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <Library className="w-96 h-96 -mr-20 -mt-20" />
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#18915b]/20 border border-[#18915b] text-[#18915b] px-4 py-2 rounded mb-8 text-xs font-bold uppercase tracking-widest">
            <Star className="w-4 h-4 fill-[#18915b]" />
            Comunidade Acadêmica
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Centralize e Evolua seus <br />
            <span className="text-[#18915b]">Projetos Acadêmicos</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
            A plataforma definitiva para publicação, avaliação e feedback de TCCs, UPXs e projetos de extensão.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-[#0a5c2f] hover:bg-[#084925] text-white px-8 py-4 rounded font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              EXPLORAR PROJETOS
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/register" 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded font-bold text-base transition-all"
            >
              CRIAR CONTA
            </Link>
          </div>
        </div>
      </section>

      {/* Stats - Estilo Clean/Grid */}
      <div className="container mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { label: 'Projetos Publicados', val: '156+', color: 'text-[#0a5c2f]' },
            { label: 'Visualizações', val: '45k+', color: 'text-[#18915b]' },
            { label: 'Nota Média', val: '8.7', color: 'text-green-600' }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded border border-gray-200 p-8 shadow-xl text-center">
              <div className={`text-4xl font-black ${stat.color} mb-1`}>{stat.val}</div>
              <div className="text-gray-500 font-bold uppercase text-xs tracking-tighter">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Como Funciona - Cartões no estilo do painel branco da Auth */}
      <section id="como-funciona" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <div className="h-1 w-20 bg-[#18915b] mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Upload, title: 'Publique seu Projeto', desc: 'Faça upload do seu trabalho acadêmico e compartilhe com a comunidade universitária.' },
              { icon: Star, title: 'Receba Avaliações', desc: 'Professores avaliam seu trabalho com critérios estruturados e feedback detalhado.' },
              { icon: TrendingUp, title: 'Evolua com Feedback', desc: 'Melhore seu projeto continuamente com base nas avaliações e comentários recebidos.' }
            ].map((step, i) => (
              <div key={i} className="bg-white border border-gray-200 p-8 rounded-lg transition-all hover:border-[#18915b] group">
                <div className="bg-gray-100 group-hover:bg-green-50 w-14 h-14 rounded flex items-center justify-center mb-6 transition-colors">
                  <step.icon className="w-7 h-7 text-[#0a5c2f]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projetos em Destaque - Cards com bordas quadradas/suaves e verdes */}
      <section id="projetos" className="bg-white py-20 border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Projetos em Destaque</h2>
              <p className="text-gray-500 font-medium italic">Trabalhos de excelência acadêmica</p>
            </div>
            <Link to="/register" className="text-[#0a5c2f] font-bold hover:underline flex items-center gap-2 group text-sm uppercase tracking-widest">
              Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-none shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-green-50 text-[#0a5c2f] px-3 py-1 text-xs font-bold border border-green-100">
                      {project.category}
                    </span>
                    <div className="flex items-center gap-1 text-green-700 font-bold">
                      <Star className="w-4 h-4 fill-green-700" />
                      {project.rating}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-1">{project.title}</h3>
                  <p className="text-xs text-[#18915b] font-bold mb-4 uppercase">{project.course}</p>
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{project.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400">{project.views} views</span>
                    <div className="flex gap-1">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 font-bold uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Nós - Estilo Minimalista */}
      <section id="sobre" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Nossa Missão</h2>
            <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-lg">
              <p>
                O Ágora nasceu da iniciativa de 4 estudantes da Facens que acreditam no poder do 
                compartilhamento de conhecimento.
              </p>
              <p>
                Nossa plataforma conecta alunos e mestres em um ambiente focado na 
                <span className="text-[#0a5c2f] font-bold"> excelência acadêmica</span>, permitindo que cada projeto
                receba o feedback necessário para se tornar uma solução real para o mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Identidade Visual Idêntica ao Cabeçalho/Cores da Auth */}
      <footer className="bg-[#2b353a] text-white py-16 border-t-4 border-[#18915b]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <img 
                src={logoIcon} 
                alt="Ágora" 
                className="h-14 mb-6 brightness-0 invert" 
              />
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm font-medium">
                Plataforma acadêmica oficial para catalogação e evolução de produções intelectuais universitárias.
              </p>
            </div>

            <div className="md:text-right">
              <h4 className="font-bold text-[#18915b] uppercase text-sm tracking-widest mb-6">Navegação</h4>
              <ul className="space-y-4 text-gray-300 font-semibold text-sm">
                <li><a href="#sobre" className="hover:text-white transition-colors">SOBRE NÓS</a></li>
                <li><a href="#projetos" className="hover:text-white transition-colors">PROJETOS EM DESTAQUE</a></li>
                <li><a href="#como-funciona" className="hover:text-white transition-colors">COMO FUNCIONA</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-500 text-xs font-bold tracking-widest">
              © 2026 ÁGORA ACADÊMICO. DESENVOLVIDO PARA FINS EDUCACIONAIS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;