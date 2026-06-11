import { useEffect, useRef, useState } from 'react';
import { X, Search, UserCircle2 } from 'lucide-react';
import api from '../api/axios';

export type CollaboratorUser = {
  id: string;
  name: string;
  photoUrl?: string;
};

type Props = {
  value: CollaboratorUser[];
  onChange: (users: CollaboratorUser[]) => void;
  excludeIds?: string[];
};

const UserTagInput = ({ value, onChange, excludeIds = [] }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CollaboratorUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const inputCls =
    'w-full px-4 py-3 border border-[var(--agora-border)] rounded bg-[var(--agora-input-bg)] focus:ring-1 focus:ring-[var(--agora-accent)] focus:border-[var(--agora-accent)] transition-all font-medium text-[var(--agora-ink)] placeholder:text-[var(--agora-muted)] outline-none';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get('/users', { params: { search: query, page: 1, pageSize: 8 } });
        const users: CollaboratorUser[] = (res.data?.items ?? res.data ?? []).filter(
          (u: CollaboratorUser) =>
            !excludeIds.includes(u.id) &&
            !value.some((v) => v.id === u.id)
        );
        setResults(users);
        setIsOpen(users.length > 0);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, excludeIds, value]);

  const handleSelect = (user: CollaboratorUser) => {
    onChange([...value, user]);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((u) => u.id !== id));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--agora-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Buscar usuário pelo nome..."
            className={`${inputCls} pl-9`}
          />
          {isSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--agora-muted)]">
              Buscando...
            </span>
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--agora-border)] bg-[var(--agora-panel)] shadow-lg overflow-hidden">
          {results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => handleSelect(user)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--agora-accent-bg)] transition-colors"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#0a5c2f] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-[var(--agora-ink)] truncate">{user.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-[#0a5c2f] text-xs font-semibold rounded"
            >
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <UserCircle2 size={14} />
              )}
              {user.name}
              <button type="button" onClick={() => handleRemove(user.id)}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserTagInput;
