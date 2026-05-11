import { Link } from 'react-router-dom';
import { Upload, Star, TrendingUp, ArrowRight, Menu, X } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Ágora" 
                className="h-16 sm:h-20 md:h-24"
              />
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#sobre" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                Sobre
              </a>
              <a href="#projetos" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                Projetos
              </a>
              <a href="#como-funciona" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                Como Funciona
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                Entrar
              </Link>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
              <a 
                href="#sobre" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 transition-colors font-medium py-2"
              >
                Sobre
              </a>
              <a 
                href="#projetos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 transition-colors font-medium py-2"
              >
                Projetos
              </a>
              <a 
                href="#como-funciona" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 transition-colors font-medium py-2"
              >
                Como Funciona
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
          <Star className="w-4 h-4" />
          Plataforma Acadêmica Moderna
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Centralize e Evolua
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Projetos Acadêmicos
          </span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Plataforma moderna para publicação, avaliação e evolução de projetos universitários.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            to="/register" 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            Explorar Projetos
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            to="/register" 
            className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-600 hover:bg-indigo-50"
          >
            Criar Conta
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              156+
            </div>
            <div className="text-gray-600 font-semibold">Projetos Publicados</div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              45k+
            </div>
            <div className="text-gray-600 font-semibold">Visualizações</div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              8.7
            </div>
            <div className="text-gray-600 font-semibold">Nota Média</div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="bg-gradient-to-br from-gray-50 to-indigo-50/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600">Simples, rápido e eficiente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Publique seu Projeto</h3>
              <p className="text-gray-600 leading-relaxed">
                Faça upload do seu trabalho acadêmico e compartilhe com a comunidade universitária.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Receba Avaliações</h3>
              <p className="text-gray-600 leading-relaxed">
                Professores avaliam seu trabalho com critérios estruturados e feedback detalhado.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Evolua com Feedback</h3>
              <p className="text-gray-600 leading-relaxed">
                Melhore seu projeto continuamente com base nas avaliações e comentários recebidos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projetos em Destaque */}
      <section id="projetos" className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">Projetos em Destaque</h2>
            <p className="text-gray-600">Conheça os trabalhos mais bem avaliados</p>
          </div>
          <Link 
            to="/register" 
            className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-2 group"
          >
            Ver todos
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {project.category}
                </span>
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <Star className="w-5 h-5 fill-green-600" />
                  {project.rating}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 line-clamp-2">
                {project.title}
              </h3>
              
              <p className="text-sm text-gray-500 mb-3">{project.course}</p>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-500 text-sm">
                  <span className="font-semibold">{project.views}</span>
                </div>
                <div className="flex gap-2">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Sobre Nós</h2>
            <div className="text-lg text-gray-600 leading-relaxed space-y-4">
              <p>
                Somos um grupo de 4 alunos que identificou a necessidade de criar um espaço dedicado 
                para estudantes compartilharem seus trabalhos acadêmicos e conhecimentos.
              </p>
              <p>
                Nossa missão é facilitar o acesso a feedback rápido e qualificado, 
                promovendo a evolução contínua dos projetos universitários através de uma plataforma 
                moderna e intuitiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            {/* Logo e descrição */}
            <div>
              <div className="mb-6">
                <img 
                  src={logoIcon} 
                  alt="Ágora" 
                  style={{ height: '56px', width: 'auto' }}
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                Plataforma acadêmica moderna para publicação, avaliação e evolução de projetos universitários.
              </p>
            </div>

            {/* Links */}
            <div className="md:text-right">
              <h4 className="font-bold text-lg mb-4">Navegação</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#sobre" className="hover:text-white transition-colors inline-block">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#projetos" className="hover:text-white transition-colors inline-block">
                    Projetos em Destaque
                  </a>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-white transition-colors inline-block">
                    Como Funciona
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 Ágora. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
