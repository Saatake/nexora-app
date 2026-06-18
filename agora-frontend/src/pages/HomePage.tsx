import { Link } from 'react-router-dom';
import { 
  Upload, 
  Star, 
  TrendingUp, 
  ArrowRight, 
  Menu, 
  X, 
  Library, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar 
} from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo-icon.png';
import { featuredProjects } from '@/features/home/constants/featuredProjects';

const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header - Alinhado à AuthPage */}
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
                className="bg-[#0a5c2f] hover:bg-[#084925] text-white px-6 py-2 rounded font-bold transition-all shadow-md active:scale-95 text-sm uppercase"
              >
                Entrar
              </Link>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Estilo "Overlay" Escuro */}
      <section className="bg-[#2b353a] text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
          <Library className="w-96 h-96 -mr-20 -mt-20" />
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#18915b]/20 border border-[#18915b] text-[#18915b] px-4 py-2 rounded mb-8 text-xs font-bold uppercase tracking-widest">
            <Star className="w-4 h-4 fill-[#18915b]" />
            Plataforma Acadêmica Moderna
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Centralize e Evolua seus <br />
            <span className="text-[#18915b]">Projetos Acadêmicos</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-medium">
            O espaço oficial para publicação, avaliação e feedback da comunidade universitária.
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

      {/* Projetos em Destaque - FIEL À IMAGEM FORNECIDA */}
      <section id="projetos" className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Projetos em Destaque</h2>
            <p className="text-gray-500 font-medium italic">Conheça os trabalhos recentes</p>
          </div>
          <Link to="/register" className="text-[#0a5c2f] font-bold hover:underline flex items-center gap-2 text-sm uppercase tracking-widest">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => (
            <div 
              key={project.id} 
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-5">
                <span className="bg-[#e8f5e9] text-[#1b5e20] px-3 py-1 rounded-md text-sm font-semibold">
                  {project.category}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-md text-sm font-semibold ${
                    project.rating === 'Pendente' 
                    ? 'bg-[#fff3e0] text-[#ef6c00]' 
                    : 'bg-green-50 text-green-700 border border-green-100'
                  }`}>
                    {project.rating}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1.5 bg-gray-50 text-gray-400 rounded hover:text-[#0a5c2f] hover:bg-gray-100 transition-colors">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-1.5 bg-gray-50 text-gray-400 rounded hover:text-red-600 hover:bg-gray-100 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Título e Descrição */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                  {project.title}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              </div>

              {/* Rodapé (Ícones cinzas conforme a imagem) */}
              <div className="pt-5 border-t border-gray-100 flex items-center gap-5 text-gray-400">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Star size={16} className="text-yellow-400" />
                  <span>-</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Eye size={18} />
                  <span>{project.views}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Calendar size={18} />
                  <span>{project.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="bg-gray-100 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 uppercase tracking-tight">Como Funciona</h2>
            <div className="h-1.5 w-16 bg-[#18915b] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Upload, title: 'Publique seu Projeto', desc: 'Faça upload do seu trabalho acadêmico e compartilhe com a comunidade universitária.' },
              { icon: Star, title: 'Receba Avaliações', desc: 'Professores avaliam seu trabalho com critérios estruturados e feedback detalhado.' },
              { icon: TrendingUp, title: 'Evolua com Feedback', desc: 'Melhore seu projeto continuamente com base nas avaliações e comentários recebidos.' }
            ].map((step, i) => (
              <div key={i} className="bg-white p-10 rounded-2xl shadow-sm border border-transparent hover:border-[#18915b] transition-all group">
                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-50 transition-colors">
                  <step.icon className="w-8 h-8 text-[#0a5c2f]" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sobre Nós */}
      <section id="sobre" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 uppercase tracking-tight">Sobre o Ágora</h2>
          <div className="space-y-6 text-gray-600 font-medium leading-relaxed text-lg italic">
            <p>
              "Nossa missão é facilitar o acesso a feedback qualificado, promovendo a evolução contínua 
              dos projetos universitários através de uma plataforma moderna e intuitiva."
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Estilo Institucional */}
      <footer className="bg-[#2b353a] text-white py-12 border-t-4 border-[#18915b]">
        <div className="container mx-auto px-6 text-center">
          <img 
            src={logo} 
            alt="Ágora" 
            className="h-12 mx-auto mb-6 brightness-0 invert opacity-80" 
          />
          <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">
            © 2026 ÁGORA ACADÊMICO. TODOS OS DIREITOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;