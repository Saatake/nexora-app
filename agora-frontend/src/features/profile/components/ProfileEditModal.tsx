import type { EditData } from '../types';

type ProfileEditModalProps = {
  editData: EditData;
  isSaving: boolean;
  onChange: (data: EditData) => void;
  onSave: () => void;
  onClose: () => void;
};

const ProfileEditModal = ({
  editData,
  isSaving,
  onChange,
  onSave,
  onClose,
}: ProfileEditModalProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-[var(--agora-panel)] rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[var(--agora-ink)]">Editar Perfil</h3>
        <button onClick={onClose} className="text-[var(--agora-muted)] hover:text-[var(--agora-muted)]">
          ✕
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

        <div>
          <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">Curso</label>
          <input
            type="text"
            value={editData.course}
            onChange={(e) => onChange({ ...editData, course: e.target.value })}
            className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">Bio</label>
          <textarea
            rows={4}
            value={editData.bio}
            onChange={(e) => onChange({ ...editData, bio: e.target.value })}
            className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--agora-ink)] mb-2">
            Áreas de Interesse (separadas por vírgula)
          </label>
          <input
            type="text"
            value={editData.interests}
            onChange={(e) => onChange({ ...editData, interests: e.target.value })}
            className="w-full rounded border border-[var(--agora-border)] px-4 py-2 text-sm bg-[var(--agora-input-bg)] text-[var(--agora-ink)]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={isSaving}
          className="rounded border border-[var(--agora-border)] px-6 py-2 text-sm font-semibold text-[var(--agora-muted)] hover:bg-[var(--agora-bg)] disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
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

export default ProfileEditModal;
