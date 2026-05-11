import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Search,
  Trophy,
  User2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoIcon from '../assets/logo-icon.png';

type AppShellProps = {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  searchPlaceholder?: string;
  children: React.ReactNode;
  showSearch?: boolean;
};

const AppShell = ({
  title,
  subtitle,
  headerActions,
  searchPlaceholder = 'Buscar projetos, alunos ou professores',
  children
  , showSearch = true
}: AppShellProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.trim()?.charAt(0).toUpperCase() ?? 'A';

  const [query, setQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query?.trim();
    if (!q) {
      navigate('/explore');
      return;
    }
    navigate(`/explore?search=${encodeURIComponent(q)}`);
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, to: '/dashboard' },
    { label: 'Meus projetos', icon: FolderKanban, to: '/projects' },
    { label: 'Explorar projetos', icon: Compass, to: '/explore' },
    { label: 'Ranking', icon: Trophy, to: '/ranking' },
    { label: 'Perfil', icon: User2, to: '/profile' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen agora-shell text-[var(--agora-ink)]">
      <div className="flex min-h-screen">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-72 flex-col justify-between bg-gradient-to-b from-[var(--agora-navy)] via-[var(--agora-navy-soft)] to-[#0a1224] text-white p-8 lg:sticky lg:top-0 lg:h-screen lg:self-start">
          <div>
            <div className="flex items-center gap-3 mb-10">
              <img 
                src={logoIcon} 
                alt="Ágora" 
                className="h-16"
              />
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
            >
              <LogOut size={18} />
              Sair
            </button>
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-semibold">
                {initial}
              </div>
              <div>
                <p className="text-sm font-medium">{user?.name ?? 'Aluno Ágora'}</p>
                <p className="text-xs text-white/50">{user?.course ?? 'Aluno'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay Mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Mobile */}
        <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-[var(--agora-navy)] via-[var(--agora-navy-soft)] to-[#0a1224] text-white p-6 z-50 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <img 
                src={logoIcon} 
                alt="Ágora" 
                className="h-12"
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="space-y-2 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
              >
                <LogOut size={18} />
                Sair
              </button>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-semibold">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name ?? 'Aluno Ágora'}</p>
                  <p className="text-xs text-white/50">{user?.course ?? 'Aluno'}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8">
          {/* Botão Hamburger Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden mb-4 p-2 rounded-lg bg-[var(--agora-navy)] text-white hover:bg-[var(--agora-navy-soft)] transition-colors"
          >
            <Menu size={24} />
          </button>

          <header className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {subtitle && <p className="text-sm text-[var(--agora-muted)]">{subtitle}</p>}
                <h1
                  className="text-2xl sm:text-3xl font-semibold text-[var(--agora-ink)]"
                  style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
                >
                  {title}
                </h1>
              </div>
              {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
            </div>

            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-3 lg:max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--agora-muted)]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full rounded-2xl border border-[var(--agora-border)] bg-white/80 px-11 py-3 text-sm shadow-[var(--agora-shadow)]/30 outline-none transition focus:border-[var(--agora-accent)]"
                  />
                </div>
              </form>
            )}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
