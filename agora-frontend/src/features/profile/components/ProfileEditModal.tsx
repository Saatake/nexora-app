import { Check, X } from 'lucide-react';
import type { EditData } from '../types';
import { THEMATIC_AREAS, THEMATIC_AREA_LABELS } from '@/constants/thematicAreas';
import { FACENS_COURSES, normalizeCourseName } from '@/constants/facensCourses';

const PRESET_INTERESTS = [
  'Inteligência Artificial',
  'Desenvolvimento Web',
  'Desenvolvimento Mobile',
  'Ciência de Dados',
  'Segurança da Informação',
  'Robótica e Automação',
  'IoT e Sistemas Embarcados',
  'Cloud e DevOps',
  'UX/UI Design',
  'Jogos Digitais',
  'Sustentabilidade e Meio Ambiente',
  'Empreendedorismo e Inovação',
  'Gestão de Projetos',
  'Pesquisa Científica',
  'Biotecnologia e Saúde',
  'Energia Renovável',
] as const;

type ProfileEditModalProps = {
  editData: EditData;
  isSaving: boolean;
  isProfessor: boolean;
  onChange: (data: EditData) => void;
  onSave: () => void;
  onClose: () => void;
};

const ProfileEditModal = ({
  editData,
  isSaving,
  isProfessor,
  onChange,
  onSave,
  onClose,
}: ProfileEditModalProps) => {
  const normalizedCourse = normalizeCourseName(editData.course);

  const selectedInterests = editData.interests
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  // Mantém interesses já salvos anteriormente que não estejam na lista padrão
  const allInterestOptions = Array.from(
    new Set([...PRESET_INTERESTS, ...selectedInterests])
  );

  const toggleArea = (area: string) => {
    const current = editData.teachingAreas;
    if (current.includes(area)) {
      onChange({ ...editData, teachingAreas: current.filter((a) => a !== area) });
    } else if (current.length < 3) {
      onChange({ ...editData, teachingAreas: [...current, area] });
    }
  };

  const toggleInterest = (interest: string) => {
    const exists = selectedInterests.includes(interest);
    const updated = exists
      ? selectedInterests.filter((item) => item !== interest)
      : [...selectedInterests, interest];
    onChange({ ...editData, interests: updated.join(', ') });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--agora-panel)] border border-[var(--agora-border)] rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--agora-ink)]">Editar Perfil</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--agora-muted)] hover:text-[var(--agora-ink)] hover:bg-[var(--agora-bg)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">Nome</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => onChange({ ...editData, name: e.target.value })}
              className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
            />
          </div>

          {isProfessor ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">
                  Formação Acadêmica
                </label>
                <input
                  type="text"
                  placeholder="Ex: Doutor em Ciências da Computação — USP"
                  value={editData.formation}
                  onChange={(e) => onChange({ ...editData, formation: e.target.value })}
                  className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">
                  Áreas de Ensino{' '}
                  <span className="text-[var(--agora-muted)] font-normal">
                    ({editData.teachingAreas.length}/3)
                  </span>
                </label>
                <p className="text-xs text-[var(--agora-muted)] mb-3">
                  Projetos nessas áreas aparecerão na sua fila de avaliação.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {THEMATIC_AREAS.map((area) => (
                    <label key={area} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={editData.teachingAreas.includes(area)}
                        onChange={() => toggleArea(area)}
                        className="w-4 h-4 accent-[#0a5c2f]"
                      />
                      <span className="text-sm text-[var(--agora-ink)] group-hover:text-[#0a5c2f] transition-colors">
                        {THEMATIC_AREA_LABELS[area]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">
                Curso
              </label>
              <select
                value={normalizedCourse}
                onChange={(e) => onChange({ ...editData, course: e.target.value })}
                className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
              >
                <option value="">Selecione seu curso</option>
                {normalizedCourse &&
                  !FACENS_COURSES.includes(normalizedCourse as (typeof FACENS_COURSES)[number]) && (
                    <option value={normalizedCourse}>{normalizedCourse}</option>
                  )}
                {FACENS_COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">Bio</label>
            <textarea
              rows={4}
              value={editData.bio}
              onChange={(e) => onChange({ ...editData, bio: e.target.value })}
              className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm resize-none bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
            />
          </div>

          {!isProfessor && (
            <div>
              <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-1">
                Áreas de Interesse
              </label>
              <p className="text-xs text-[var(--agora-muted)] mb-3">
                Selecione os temas que mais combinam com você.
              </p>
              <div className="flex flex-wrap gap-2">
                {allInterestOptions.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#0a5c2f] text-white border-[#0a5c2f] shadow-xs'
                          : 'bg-[var(--agora-bg)] text-[var(--agora-ink)]/80 border-[var(--agora-border)] hover:border-[var(--agora-accent)]/50'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded border border-[var(--agora-border)] px-6 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:bg-[var(--agora-bg)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded bg-[#0a5c2f] px-6 py-2 text-sm font-semibold text-white hover:bg-[#084925] disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
