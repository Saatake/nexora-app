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
  X,
  Moon,
  Sun
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import logoIcon from '../assets/logo.png';

type AppShellProps = {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  searchPlaceholder?: string;
  children: React.ReactNode;
  showSearch?: boolean;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  to: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, to: '/dashboard' },
  { label: 'Meus projetos', icon: FolderKanban, to: '/projects' },
  { label: 'Explorar projetos', icon: Compass, to: '/explore' },
  { label: 'Ranking', icon: Trophy, to: '/ranking' },
  { label: 'Perfil', icon: User2, to: '/profile' }
];

const NavLinks = ({ onClick }: { onClick?: () => void }) => (
  <>
    {navItems.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.label}
          to={item.to}
          onClick={onClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded transition-all ${
              isActive
                ? 'bg-[#0a5c2f] text-white'
                : 'text-white/65 hover:text-white hover:bg-white/10'
            }`
          }
        >
          <Icon size={17} />
          {item.label}
        </NavLink>
      );
    })}
  </>
);

const AppShell = ({
  title,
  subtitle,
  headerActions,
  searchPlaceholder = 'Buscar projetos, alunos ou professores',
  children,
  showSearch = true
}: AppShellProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen agora-shell text-[var(--agora-ink)]">
      <div className="flex min-h-screen">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col bg-[var(--agora-sidebar)] text-white p-6 sticky top-0 h-screen">
          {/* Logo Centralizado */}
          <div className="mb-8 flex justify-center w-full">
            <img src={logoIcon} alt="Ágora" className="h-12 object-contain" />
          </div>

          <nav className="space-y-1 flex-1">
            <NavLinks />
          </nav>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded transition-all mb-3"
            >
              <LogOut size={17} />
              Sair
            </button>
            <div className="flex items-center gap-3 bg-white/10 px-3 py-2.5 rounded">
              <div className="h-8 w-8 rounded bg-[#0a5c2f] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Aluno Agora'}</p>
                <p className="text-xs text-white/50 truncate">{user?.course ?? 'Aluno'}</p>
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
        <aside
          className={`fixed top-0 left-0 bottom-0 w-60 bg-[var(--agora-sidebar)] text-white p-6 z-50 transform transition-transform duration-300 lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo Centralizado Mobile */}
          <div className="flex items-center justify-center mb-8 relative">
            <img src={logoIcon} alt="Ágora" className="h-10 object-contain" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              aria-label="Fechar menu"
              className="absolute right-0 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="space-y-1">
            <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
          </nav>
          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded transition-all"
            >
              <LogOut size={17} />
              Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8 min-w-0 overflow-x-hidden">
          {/* Hamburger Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Abrir menu"
            className="lg:hidden mb-4 p-2 rounded bg-[var(--agora-sidebar)] text-white transition-colors"
          >
            <Menu size={22} />
          </button>

          <header className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {subtitle && <p className="text-sm text-[var(--agora-muted)] mb-0.5">{subtitle}</p>}
                <h1
                  className="text-2xl sm:text-3xl font-bold text-[var(--agora-ink)]"
                  style={{ fontFamily: 'Space Grotesk, Manrope, sans-serif' }}
                >
                  {title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                  className="flex items-center justify-center h-9 w-9 rounded border border-[var(--agora-border)] bg-[var(--agora-panel)] text-[var(--agora-muted)] hover:text-[var(--agora-ink)] transition-colors"
                  title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
              </div>
            </div>

            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 lg:max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--agora-muted)]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full rounded border border-[var(--agora-border)] bg-[var(--agora-input-bg)] pl-10 pr-4 py-2.5 text-sm outline-none transition focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] text-[var(--agora-ink)]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0a5c2f] hover:bg-[#084925] text-white text-sm font-semibold rounded transition-colors"
                >
                  Buscar
                </button>
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
