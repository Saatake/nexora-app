import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Search,
  Trophy,
  Menu,
  X,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  BriefcaseBusiness
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import AgoraLogo from './AgoraLogo';

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
  children,
  showSearch = true
}: AppShellProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = user?.name?.trim()?.charAt(0).toUpperCase() ?? 'A';
  const isProfileActive = location.pathname === '/profile';

  const [query, setQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    return localStorage.getItem('agora-sidebar-collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('agora-sidebar-collapsed', String(next));
      return next;
    });
  };

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
    ...(user?.hasAiAccess
      ? [{ label: 'Meu portfólio', icon: BriefcaseBusiness, to: '/portfolio/edit' }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavLinks = ({ onClick, collapsed = false }: { onClick?: () => void; collapsed?: boolean }) => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.to}
            onClick={onClick}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 text-sm font-medium rounded-lg whitespace-nowrap overflow-hidden transition-colors duration-150 ${isActive
                ? 'bg-[#0a5c2f] text-white'
                : 'text-white/65 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <span
              className={`transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
                collapsed ? 'opacity-0 -translate-x-1 pointer-events-none' : 'opacity-100 translate-x-0'
              }`}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </>
  );

  const UserProfileCard = ({ onSelect, collapsed = false }: { onSelect?: () => void; collapsed?: boolean }) => (
    <button
      type="button"
      onClick={() => {
        onSelect?.();
        navigate('/profile');
      }}
      className={`group w-full flex items-center gap-2.5 p-1.5 mt-2 rounded-xl border text-left transition-colors duration-150 shadow-sm overflow-hidden whitespace-nowrap ${
        isProfileActive
          ? 'border-white/25 bg-white/12'
          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
      }`}
      title={collapsed ? `${user?.name ?? 'Ágora'} — Abrir meu perfil` : 'Abrir meu perfil'}
    >
      {user?.photoUrl ? (
        <img
          src={user.photoUrl}
          alt={user.name}
          className="h-9 w-9 rounded-full object-cover border border-white/20 flex-shrink-0"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#0a5c2f] to-[#063b1e] flex items-center justify-center text-sm font-bold text-white shadow-inner flex-shrink-0 border border-white/15">
          {initial}
        </div>
      )}

      <div
        className={`w-[168px] flex-shrink-0 flex items-center gap-2 transition-opacity duration-150 ease-[cubic-bezier(0.2,0,0,1)] ${
          collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="min-w-0 flex-1 whitespace-normal">
          <p className="text-[13px] font-semibold text-white leading-snug break-words transition-colors">
            {user?.name ?? 'Ágora'}
          </p>
          <p className="text-[11px] text-white/60 leading-tight mt-0.5 break-words group-hover:text-white/80 transition-colors">
            {user?.course ?? 'Sem curso'}
          </p>
        </div>

        <ChevronRight
          size={16}
          className={`flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
            isProfileActive
              ? 'text-white'
              : 'text-white/30 group-hover:text-white/80'
          }`}
        />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen agora-shell text-[var(--agora-ink)]">
      <div className="flex min-h-screen">
        {/* Sidebar Desktop */}
        <aside
          className={`hidden lg:flex relative flex-shrink-0 flex-col bg-[var(--agora-sidebar)] text-white py-5 px-3 sticky top-0 h-screen transition-[width] duration-[280ms] ease-[cubic-bezier(0.2,0,0,1)] ${
            isCollapsed ? 'w-[72px]' : 'w-64'
          }`}
        >
          {/* Botão flutuante na borda para recolher/expandir */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="absolute -right-3.5 top-7 z-20 h-7 w-7 rounded-full bg-[var(--agora-sidebar)] border border-white/15 text-white/75 hover:text-white hover:border-white/30 active:scale-95 shadow-md flex items-center justify-center transition-[color,border-color,transform] duration-150"
            title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronLeft
              size={15}
              className={`transition-transform duration-[280ms] ease-[cubic-bezier(0.2,0,0,1)] ${
                isCollapsed ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>

          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Topo: Logo Ágora -> Á centralizado */}
            <div className="mb-7 flex items-center justify-center h-16">
              <AgoraLogo collapsed={isCollapsed} className="text-white" />
            </div>

            <nav className="space-y-1 flex-1">
              <NavLinks collapsed={isCollapsed} />
            </nav>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                title={isCollapsed ? 'Sair' : undefined}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg whitespace-nowrap overflow-hidden transition-colors duration-150 mb-2"
              >
                <LogOut size={18} className="flex-shrink-0" />
                <span
                  className={`transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.2,0,0,1)] ${
                    isCollapsed ? 'opacity-0 -translate-x-1 pointer-events-none' : 'opacity-100 translate-x-0'
                  }`}
                >
                  Sair
                </span>
              </button>
              <UserProfileCard collapsed={isCollapsed} />
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
          className={`fixed top-0 left-0 bottom-0 w-64 bg-[var(--agora-sidebar)] text-white px-4 py-6 z-50 flex flex-col transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          {/* Logo Centralizado Mobile */}
          <div className="flex items-center justify-center mb-8 relative">
            <AgoraLogo className="text-white" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-0 text-white/70 hover:text-white"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="space-y-1 flex-1">
            <NavLinks onClick={() => setIsMobileMenuOpen(false)} />
          </nav>
          <div className="pt-4 border-t border-white/10 mt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded transition-all mb-3"
            >
              <LogOut size={17} />
              Sair
            </button>
            <UserProfileCard onSelect={() => setIsMobileMenuOpen(false)} />
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8 min-w-0 overflow-x-hidden">
          {/* Hamburger Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
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
